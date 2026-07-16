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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalStudents, mealsServedToday] = await Promise.all([
    prisma.student.count({ where: { blockId: warden.blockId, status: "ACTIVE" } }),
    prisma.mealScan.count({
      where: {
        student: { blockId: warden.blockId },
        date: today,
        status: "SUCCESS",
      },
    }),
  ]);

  return NextResponse.json({ totalStudents, mealsServedToday });
}
