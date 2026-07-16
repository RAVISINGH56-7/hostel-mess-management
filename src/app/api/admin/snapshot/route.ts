import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [totalStudents, totalWardens, totalBlocks] = await Promise.all([
    prisma.student.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "WARDEN" } }),
    prisma.block.count(),
  ]);

  // Today's meals served
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const mealsServedToday = await prisma.mealScan.count({
    where: { date: today, status: "SUCCESS" },
  });

  return NextResponse.json({
    totalStudents,
    totalWardens,
    totalBlocks,
    mealsServedToday,
  });
}
