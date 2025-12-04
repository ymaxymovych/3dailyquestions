import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/database";

// GET /api/email-logs - List logs with pagination and search
export async function GET(request: NextRequest) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser) {
            return NextResponse.json({ error: "No user found" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status");
        const templateId = searchParams.get("templateId");

        const skip = (page - 1) * limit;

        // Build where clause
        const where: any = {};

        if (search) {
            where.OR = [
                { recipient: { contains: search, mode: "insensitive" } },
                { templateId: { contains: search, mode: "insensitive" } },
            ];
        }

        if (status) {
            where.status = status;
        }

        if (templateId) {
            where.templateId = templateId;
        }

        const [logs, total] = await Promise.all([
            prisma.emailLog.findMany({
                where,
                orderBy: { sentAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.emailLog.count({ where }),
        ]);

        return NextResponse.json({
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching email logs:", error);
        return NextResponse.json(
            { error: "Failed to fetch email logs" },
            { status: 500 }
        );
    }
}

// POST /api/email-logs - Get stats for dashboard
export async function POST(request: NextRequest) {
    try {
        // MOCK AUTH: Get first user for dev environment
        const mockUser = await prisma.user.findFirst();
        if (!mockUser) {
            return NextResponse.json({ error: "No user found" }, { status: 401 });
        }

        const body = await request.json();
        const { action } = body;

        if (action === "stats") {
            // Get stats for last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const [totalSent, totalFailed, totalQueued] = await Promise.all([
                prisma.emailLog.count({
                    where: {
                        sentAt: { gte: thirtyDaysAgo },
                        status: "sent",
                    },
                }),
                prisma.emailLog.count({
                    where: {
                        sentAt: { gte: thirtyDaysAgo },
                        status: "failed",
                    },
                }),
                prisma.emailLog.count({
                    where: {
                        status: "queued",
                    },
                }),
            ]);

            const totalSubscribers = await prisma.subscriber.count({
                where: { status: "confirmed" },
            });

            const pendingSubscribers = await prisma.subscriber.count({
                where: { status: "pending" },
            });

            return NextResponse.json({
                totalSent,
                totalFailed,
                totalQueued,
                deliveryRate: totalSent > 0
                    ? ((totalSent / (totalSent + totalFailed)) * 100).toFixed(1)
                    : "100.0",
                totalSubscribers,
                pendingSubscribers,
            });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Error getting email stats:", error);
        return NextResponse.json(
            { error: "Failed to get email stats" },
            { status: 500 }
        );
    }
}
