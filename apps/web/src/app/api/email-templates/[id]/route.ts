import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/email-templates/[id] - Get single template
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser) {
            return NextResponse.json({ error: "No user found" }, { status: 401 });
        }

        const { id } = await params;

        const template = await prisma.emailTemplate.findFirst({
            where: {
                OR: [
                    { id },
                    { code: id }
                ]
            }
        });

        if (!template) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        return NextResponse.json(template);
    } catch (error) {
        console.error("Error fetching email template:", error);
        return NextResponse.json(
            { error: "Failed to fetch email template" },
            { status: 500 }
        );
    }
}

// PUT /api/email-templates/[id] - Update template
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser) {
            return NextResponse.json({ error: "No user found" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, description, enabled, recipients, triggers, variables, templates } = body;

        // Find by id or code
        const existing = await prisma.emailTemplate.findFirst({
            where: {
                OR: [
                    { id },
                    { code: id }
                ]
            }
        });

        if (!existing) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        const template = await prisma.emailTemplate.update({
            where: { id: existing.id },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(enabled !== undefined && { enabled }),
                ...(recipients !== undefined && { recipients }),
                ...(triggers !== undefined && { triggers }),
                ...(variables !== undefined && { variables }),
                ...(templates !== undefined && { templates }),
            },
        });

        return NextResponse.json(template);
    } catch (error) {
        console.error("Error updating email template:", error);
        return NextResponse.json(
            { error: "Failed to update email template" },
            { status: 500 }
        );
    }
}

// DELETE /api/email-templates/[id] - Delete template (non-critical only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser) {
            return NextResponse.json({ error: "No user found" }, { status: 401 });
        }

        const { id } = await params;

        const existing = await prisma.emailTemplate.findFirst({
            where: {
                OR: [
                    { id },
                    { code: id }
                ]
            }
        });

        if (!existing) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        if (existing.critical) {
            return NextResponse.json(
                { error: "Cannot delete critical system templates" },
                { status: 403 }
            );
        }

        await prisma.emailTemplate.delete({
            where: { id: existing.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting email template:", error);
        return NextResponse.json(
            { error: "Failed to delete email template" },
            { status: 500 }
        );
    }
}
