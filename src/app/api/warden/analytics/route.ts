import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user?.role !== "WARDEN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const warden = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { blockId: true },
  });

  if (!warden?.blockId) {
    return NextResponse.json({ error: "Warden not assigned to block" }, { status: 400 });
  }

  // Simulated analytics: count scans per day for the past 7 days
  const scans = await prisma.mealScan.groupBy({
    by: ["date", "meal"],
    where: {
      student: { blockId: warden.blockId },
      date: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    _count: { id: true },
  });

  // Transform to expected format
  const map: Record<string, any> = {};
  scans.forEach(({ date, meal, _count }) => {
    const day = date.toISOString().slice(0, 10);
    if (!map[day]) map[day] = { day };
    map[day][meal.toLowerCase()] = _count.id;
  });

  return NextResponse.json(Object.values(map));
}