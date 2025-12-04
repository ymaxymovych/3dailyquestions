import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";

// GET /api/email-templates - List all templates with optional category filter
export async function GET(request: NextRequest) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser) {
            return NextResponse.json({ error: "No user found" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");

        const where = category && category !== "ALL" ? { category } : undefined;

        const templates = await prisma.emailTemplate.findMany({
            where: where as any,
            orderBy: [
                { category: "asc" },
                { name: "asc" }
            ],
        });

        return NextResponse.json(templates);
    } catch (error) {
        console.error("Error fetching email templates:", error);
        return NextResponse.json(
            { error: "Failed to fetch email templates" },
            { status: 500 }
        );
    }
}

// POST /api/email-templates - Create new template (admin only)
export async function POST(request: NextRequest) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser) {
            return NextResponse.json({ error: "No user found" }, { status: 401 });
        }

        // TODO: Check admin role

        const body = await request.json();
        const { code, name, description, category, critical, enabled, recipients, triggers, variables, templates } = body;

        if (!code || !name || !category) {
            return NextResponse.json(
                { error: "Missing required fields: code, name, category" },
                { status: 400 }
            );
        }

        const existing = await prisma.emailTemplate.findUnique({ where: { code } });
        if (existing) {
            return NextResponse.json(
                { error: "Template with this code already exists" },
                { status: 409 }
            );
        }

        const template = await prisma.emailTemplate.create({
            data: {
                code,
                name,
                description,
                category,
                critical: critical ?? false,
                enabled: enabled ?? true,
                recipients: recipients ?? [],
                triggers,
                variables: variables ?? [],
                templates: templates ?? { uk: { subject: "", body: "" }, en: { subject: "", body: "" } },
            },
        });

        return NextResponse.json(template, { status: 201 });
    } catch (error) {
        console.error("Error creating email template:", error);
        return NextResponse.json(
            { error: "Failed to create email template" },
            { status: 500 }
        );
    }
}
