import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get today's date at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      student: {
        include: {
          meals: {
            where: { date: today },   // ✅ now matches date-only values
            orderBy: { scannedAt: "desc" },
          },
        },
      },
    },
  });

  if (!user?.student) {
    return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
  }

  const todayMeals = user.student.meals.map((m) => m.meal.toLowerCase());

  return NextResponse.json({
    name: user.name,
    room: user.student.room,
    course: user.student.course,
    semester: user.student.semester,
    passId: user.student.passId,
    qrToken: user.student.qrSecret,
    photoUrl: user.student.photoUrl,
    todayMeals,
    status: user.student.status,
  });
}