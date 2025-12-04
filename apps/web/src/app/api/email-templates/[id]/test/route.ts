import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/email-templates/[id]/test - Send test email (mock for now)
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser) {
            return NextResponse.json({ error: "No user found" }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { email, language } = body;

        if (!email) {
            return NextResponse.json(
                { error: "Email address is required" },
                { status: 400 }
            );
        }

        // Find template by id or code
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

        // Get the content for requested language
        const lang = language || "uk";
        const templates = template.templates as Record<string, { subject: string; body: string }>;
        const content = templates[lang];

        if (!content) {
            return NextResponse.json(
                { error: `Template not available in language: ${lang}` },
                { status: 400 }
            );
        }

        // Log the test email (mock - no actual sending yet)
        await prisma.emailLog.create({
            data: {
                templateId: template.code,
                recipient: email,
                status: "sent", // Mock status
                metadata: {
                    type: "test",
                    language: lang,
                    subject: content.subject,
                    sentBy: mockUser.id,
                    sentAt: new Date().toISOString(),
                },
            },
        });

        // TODO: When Resend is configured, actually send the email
        // For now, just simulate success with a delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        return NextResponse.json({
            success: true,
            message: `Test email sent to ${email}`,
            template: template.code,
            language: lang,
            subject: content.subject,
        });
    } catch (error) {
        console.error("Error sending test email:", error);
        return NextResponse.json(
            { error: "Failed to send test email" },
            { status: 500 }
        );
    }
}
