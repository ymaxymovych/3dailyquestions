import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { DocumentLevel, DocumentType, DocumentStatus } from "@prisma/client";

// GET /api/knowledge-documents - List all documents with filters
export async function GET(request: NextRequest) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst({
            include: { org: true }
        });
        if (!mockUser) {
            return NextResponse.json({ error: "No user found" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const level = searchParams.get("level") as DocumentLevel | null;
        const type = searchParams.get("type") as DocumentType | null;
        const status = searchParams.get("status") as DocumentStatus | null;
        const deptId = searchParams.get("deptId");
        const teamId = searchParams.get("teamId");
        const jobRoleId = searchParams.get("jobRoleId");
        const userId = searchParams.get("userId");

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {
            orgId: mockUser.orgId,
        };

        if (level) where.level = level;
        if (type) where.type = type;
        if (status) where.status = status;
        if (deptId) where.deptId = deptId;
        if (teamId) where.teamId = teamId;
        if (jobRoleId) where.jobRoleId = jobRoleId;
        if (userId) where.userId = userId;

        const documents = await prisma.knowledgeDocument.findMany({
            where,
            orderBy: [
                { level: "asc" },
                { type: "asc" },
                { title: "asc" }
            ],
            include: {
                dept: { select: { id: true, name: true } },
                team: { select: { id: true, name: true } },
                jobRole: { select: { id: true, name: true } },
                _count: {
                    select: {
                        acknowledgments: true,
                        comments: true,
                        children: true,
                    }
                }
            }
        });

        return NextResponse.json(documents);
    } catch (error) {
        console.error("Error fetching knowledge documents:", error);
        return NextResponse.json(
            { error: "Failed to fetch knowledge documents" },
            { status: 500 }
        );
    }
}

// POST /api/knowledge-documents - Create new document
export async function POST(request: NextRequest) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst({
            include: { org: true }
        });
        if (!mockUser) {
            return NextResponse.json({ error: "No user found" }, { status: 401 });
        }

        const body = await request.json();
        const {
            title,
            content,
            level,
            type,
            status,
            effectiveAt,
            deptId,
            teamId,
            jobRoleId,
            userId,
            parentId
        } = body;

        if (!title || !level || !type) {
            return NextResponse.json(
                { error: "Missing required fields: title, level, type" },
                { status: 400 }
            );
        }

        // Validate level-specific requirements
        if (level === "DEPARTMENT" && !deptId) {
            return NextResponse.json(
                { error: "Department ID required for DEPARTMENT level documents" },
                { status: 400 }
            );
        }
        if (level === "TEAM" && !teamId) {
            return NextResponse.json(
                { error: "Team ID required for TEAM level documents" },
                { status: 400 }
            );
        }
        if (level === "ROLE" && !jobRoleId) {
            return NextResponse.json(
                { error: "Job Role ID required for ROLE level documents" },
                { status: 400 }
            );
        }
        if (level === "PERSON" && !userId) {
            return NextResponse.json(
                { error: "User ID required for PERSON level documents" },
                { status: 400 }
            );
        }

        const document = await prisma.knowledgeDocument.create({
            data: {
                title,
                content: content || "",
                level,
                type,
                status: status || "DRAFT",
                effectiveAt: effectiveAt ? new Date(effectiveAt) : null,
                orgId: mockUser.orgId,
                deptId: deptId || null,
                teamId: teamId || null,
                jobRoleId: jobRoleId || null,
                userId: userId || null,
                parentId: parentId || null,
                createdById: mockUser.id,
            },
            include: {
                dept: { select: { id: true, name: true } },
                team: { select: { id: true, name: true } },
                jobRole: { select: { id: true, name: true } },
            }
        });

        return NextResponse.json(document, { status: 201 });
    } catch (error) {
        console.error("Error creating knowledge document:", error);
        return NextResponse.json(
            { error: "Failed to create knowledge document" },
            { status: 500 }
        );
    }
}
