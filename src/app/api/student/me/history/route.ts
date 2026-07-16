import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user?.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const scans = await prisma.mealScan.findMany({
    where: { studentId: student.id },
    orderBy: [{ date: "desc" }, { scannedAt: "desc" }],
    take: 90,
  });

  return NextResponse.json(
    scans.map((s) => ({
      id: s.id,
      meal: s.meal,
      date: s.date.toISOString(),
      status: s.status,
      scannedAt: s.scannedAt.toISOString(),
    }))
  );
}
