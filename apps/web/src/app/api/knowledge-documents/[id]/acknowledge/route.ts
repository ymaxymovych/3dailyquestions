import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/knowledge-documents/[id]/acknowledge - Mark document as read
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser) {
            return NextResponse.json({ error: "No user found" }, { status: 401 });
        }

        // Check document exists
        const document = await prisma.knowledgeDocument.findUnique({ where: { id } });
        if (!document) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        // Upsert acknowledgment (idempotent)
        const acknowledgment = await prisma.documentAcknowledgment.upsert({
            where: {
                documentId_userId: {
                    documentId: id,
                    userId: mockUser.id,
                }
            },
            update: {
                acknowledgedAt: new Date(),
            },
            create: {
                documentId: id,
                userId: mockUser.id,
            }
        });

        return NextResponse.json({
            success: true,
            acknowledgedAt: acknowledgment.acknowledgedAt,
            message: "Document acknowledged"
        });
    } catch (error) {
        console.error("Error acknowledging document:", error);
        return NextResponse.json(
            { error: "Failed to acknowledge document" },
            { status: 500 }
        );
    }
}

// DELETE /api/knowledge-documents/[id]/acknowledge - Remove acknowledgment
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser) {
            return NextResponse.json({ error: "No user found" }, { status: 401 });
        }

        await prisma.documentAcknowledgment.deleteMany({
            where: {
                documentId: id,
                userId: mockUser.id,
            }
        });

        return NextResponse.json({ success: true, message: "Acknowledgment removed" });
    } catch (error) {
        console.error("Error removing acknowledgment:", error);
        return NextResponse.json(
            { error: "Failed to remove acknowledgment" },
            { status: 500 }
        );
    }
}
