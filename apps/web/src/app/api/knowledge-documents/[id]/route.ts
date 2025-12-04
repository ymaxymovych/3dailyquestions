import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/knowledge-documents/[id] - Get single document with details
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser) {
            return NextResponse.json({ error: "No user found" }, { status: 401 });
        }

        const document = await prisma.knowledgeDocument.findUnique({
            where: { id },
            include: {
                dept: { select: { id: true, name: true } },
                team: { select: { id: true, name: true } },
                jobRole: { select: { id: true, name: true } },
                user: { select: { id: true, fullName: true, email: true } },
                parent: { select: { id: true, title: true, level: true } },
                children: {
                    select: { id: true, title: true, level: true, status: true },
                    orderBy: { title: "asc" }
                },
                acknowledgments: {
                    where: { userId: mockUser.id },
                    select: { acknowledgedAt: true }
                },
                _count: {
                    select: {
                        acknowledgments: true,
                        comments: true,
                    }
                }
            }
        });

        if (!document) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        // Add isAcknowledged flag
        const response = {
            ...document,
            isAcknowledged: document.acknowledgments.length > 0,
            acknowledgedAt: document.acknowledgments[0]?.acknowledgedAt || null,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error fetching knowledge document:", error);
        return NextResponse.json(
            { error: "Failed to fetch knowledge document" },
            { status: 500 }
        );
    }
}

// PATCH /api/knowledge-documents/[id] - Update document
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser) {
            return NextResponse.json({ error: "No user found" }, { status: 401 });
        }

        const existing = await prisma.knowledgeDocument.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        const body = await request.json();
        const { title, content, status, effectiveAt } = body;

        // Increment version if content changed
        const shouldIncrementVersion = content !== undefined && content !== existing.content;

        const document = await prisma.knowledgeDocument.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(content !== undefined && { content }),
                ...(status !== undefined && { status }),
                ...(effectiveAt !== undefined && { effectiveAt: effectiveAt ? new Date(effectiveAt) : null }),
                ...(shouldIncrementVersion && { version: { increment: 1 } }),
            },
            include: {
                dept: { select: { id: true, name: true } },
                team: { select: { id: true, name: true } },
                jobRole: { select: { id: true, name: true } },
            }
        });

        return NextResponse.json(document);
    } catch (error) {
        console.error("Error updating knowledge document:", error);
        return NextResponse.json(
            { error: "Failed to update knowledge document" },
            { status: 500 }
        );
    }
}

// DELETE /api/knowledge-documents/[id] - Archive document (soft delete)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser) {
            return NextResponse.json({ error: "No user found" }, { status: 401 });
        }

        const existing = await prisma.knowledgeDocument.findUnique({ where: { id } });
        if (!existing) {
            return NextResponse.json({ error: "Document not found" }, { status: 404 });
        }

        // Soft delete - set status to ARCHIVED
        await prisma.knowledgeDocument.update({
            where: { id },
            data: { status: "ARCHIVED" }
        });

        return NextResponse.json({ success: true, message: "Document archived" });
    } catch (error) {
        console.error("Error archiving knowledge document:", error);
        return NextResponse.json(
            { error: "Failed to archive knowledge document" },
            { status: 500 }
        );
    }
}
