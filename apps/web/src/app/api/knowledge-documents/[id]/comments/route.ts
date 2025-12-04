import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/knowledge-documents/[id]/comments - List comments
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const comments = await prisma.documentComment.findMany({
            where: { documentId: id },
            orderBy: { createdAt: "desc" },
        });

        // Fetch user info for each comment
        const userIds = [...new Set(comments.map(c => c.userId))];
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, fullName: true, email: true },
        });
        const userMap = new Map(users.map(u => [u.id, u]));

        const commentsWithUsers = comments.map(comment => ({
            ...comment,
            user: userMap.get(comment.userId) || null,
        }));

        return NextResponse.json(commentsWithUsers);
    } catch (error) {
        console.error("Error fetching document comments:", error);
        return NextResponse.json(
            { error: "Failed to fetch comments" },
            { status: 500 }
        );
    }
}

// POST /api/knowledge-documents/[id]/comments - Add comment or suggestion
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

        const body = await request.json();
        const { type, text } = body;

        if (!type || !text) {
            return NextResponse.json(
                { error: "Missing required fields: type, text" },
                { status: 400 }
            );
        }

        if (!["question", "suggestion"].includes(type)) {
            return NextResponse.json(
                { error: "Invalid type. Must be 'question' or 'suggestion'" },
                { status: 400 }
            );
        }

        const comment = await prisma.documentComment.create({
            data: {
                documentId: id,
                userId: mockUser.id,
                type,
                text,
                status: "open",
            }
        });

        return NextResponse.json({
            ...comment,
            user: { id: mockUser.id, fullName: mockUser.fullName, email: mockUser.email },
        }, { status: 201 });
    } catch (error) {
        console.error("Error creating document comment:", error);
        return NextResponse.json(
            { error: "Failed to create comment" },
            { status: 500 }
        );
    }
}
