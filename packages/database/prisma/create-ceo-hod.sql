-- Find Yaroslav's organization and department
DO $$
DECLARE
    v_org_id UUID;
    v_dept_id UUID;
    v_employee_role_id UUID;
    v_manager_role_id UUID;
    v_owner_role_id UUID;
    v_ceo_id UUID;
    v_hod_id UUID;
    v_ceo_report_id UUID;
    v_hod_report_id UUID;
BEGIN
    -- Get organization and department from Yaroslav's account
    SELECT "orgId", "deptId" INTO v_org_id, v_dept_id
    FROM "User"
    WHERE email = 'yaroslav.maxymovych@gmail.com';

    -- Get role IDs
    SELECT id INTO v_employee_role_id FROM "Role" WHERE name = 'EMPLOYEE';
    SELECT id INTO v_manager_role_id FROM "Role" WHERE name = 'MANAGER';
    SELECT id INTO v_owner_role_id FROM "Role" WHERE name = 'OWNER';

    -- Create CEO
    INSERT INTO "User" (id, email, "fullName", "passwordHash", "orgId", "deptId", status, "createdAt", "updatedAt")
    VALUES (
        gen_random_uuid(),
        'ceo@company.com',
        'Robert CEO',
        '$2a$10$rZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5uN5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', -- password123
        v_org_id,
        v_dept_id,
        'ACTIVE',
        NOW(),
        NOW()
    )
    RETURNING id INTO v_ceo_id;

    -- Assign OWNER role to CEO
    INSERT INTO "UserRole" (id, "userId", "roleId", "createdAt")
    VALUES (gen_random_uuid(), v_ceo_id, v_owner_role_id, NOW());

    -- Create HOD
    INSERT INTO "User" (id, email, "fullName", "passwordHash", "orgId", "deptId", status, "createdAt", "updatedAt")
    VALUES (
        gen_random_uuid(),
        'hod@company.com',
        'Sarah HOD',
        '$2a$10$rZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5uN5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', -- password123
        v_org_id,
        v_dept_id,
        'ACTIVE',
        NOW(),
        NOW()
    )
    RETURNING id INTO v_hod_id;

    -- Assign MANAGER role to HOD
    INSERT INTO "UserRole" (id, "userId", "roleId", "createdAt")
    VALUES (gen_random_uuid(), v_hod_id, v_manager_role_id, NOW());

    -- Set HOD as department manager
    UPDATE departments
    SET "managerId" = v_hod_id
    WHERE id = v_dept_id;

    -- Create daily report for CEO
    INSERT INTO "DailyReport" (
        id, "userId", "orgId", date, status, "publishedAt", visibility, "loadStatus",
        "todayBig", "todayMedium", "yesterdayBig", "createdAt", "updatedAt"
    )
    VALUES (
        gen_random_uuid(),
        v_ceo_id,
        v_org_id,
        CURRENT_DATE,
        'PUBLISHED',
        NOW(),
        'TEAM',
        'BALANCED',
        '{"text": "Review Q4 strategy and approve budget"}',
        '[{"text": "Meet with investors"}, {"text": "Review team performance"}]',
        '{"text": "Closed partnership deal with Microsoft"}',
        NOW(),
        NOW()
    )
    RETURNING id INTO v_ceo_report_id;

    -- Create daily report for HOD
    INSERT INTO "DailyReport" (
        id, "userId", "orgId", date, status, "publishedAt", visibility, "loadStatus",
        "todayBig", "todayMedium", "yesterdayBig", "createdAt", "updatedAt"
    )
    VALUES (
        gen_random_uuid(),
        v_hod_id,
        v_org_id,
        CURRENT_DATE,
        'PUBLISHED',
        NOW(),
        'TEAM',
        'OVERLOADED',
        '{"text": "Finalize hiring plan for Q1"}',
        '[{"text": "Review team KPIs"}, {"text": "Prepare budget presentation"}]',
        '{"text": "Conducted 5 interviews"}',
        NOW(),
        NOW()
    )
    RETURNING id INTO v_hod_report_id;

    -- Add blocker for HOD
    INSERT INTO "HelpRequest" (
        id, "reportId", text, "assigneeId", "dueDate", priority, status, "createdAt", "updatedAt"
    )
    VALUES (
        gen_random_uuid(),
        v_hod_report_id,
        'Need CEO approval for new headcount',
        v_ceo_id,
        CURRENT_DATE + INTERVAL '1 day',
        'HIGH',
        'OPEN',
        NOW(),
        NOW()
    );

    RAISE NOTICE 'Success! Created CEO and HOD users.';
    RAISE NOTICE 'CEO: ceo@company.com / password123';
    RAISE NOTICE 'HOD: hod@company.com / password123';
END $$;
