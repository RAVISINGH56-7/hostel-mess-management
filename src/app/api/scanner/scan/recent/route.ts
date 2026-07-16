import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function todayAtMidnightUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function GET() {
  const session = await auth();
  if (!session || !session.user || (session.user.role !== "STAFF" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayUTC = todayAtMidnightUTC();

  const scans = await prisma.mealScan.findMany({
    where: { date: todayUTC },
    orderBy: { scannedAt: "desc" },
    take: 20,
    include: {
      student: { select: { room: true, user: { select: { name: true } } } },
    },
  });

  const statusMessages: Record<string, { status: string; label: string; message: string }> = {
    SUCCESS:   { status: "success",   label: "Logged",    message: "Logged successfully" },
    DUPLICATE: { status: "duplicate", label: "Duplicate", message: "Already scanned today" },
  };

  const formatted = scans.map((scan) => {
    const info = statusMessages[scan.status] ?? { status: "error", label: "Error", message: "Unknown status" };
    return {
      id: scan.id,
      name: scan.student.user.name,
      room: scan.student.room,
      meal: scan.meal.toLowerCase(),
      time: new Date(scan.scannedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      status: info.status,
      label: info.label,
      message: info.message,
    };
  });

  return NextResponse.json(formatted);
}
