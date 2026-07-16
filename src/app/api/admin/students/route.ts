import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const course = searchParams.get("course") || "";
  const semester = searchParams.get("semester") || "";
  const blockId = searchParams.get("blockId") || "";

  const where: Record<string, any> = {};

  if (q) {
    where.OR = [
      { user: { name: { contains: q, mode: "insensitive" } } },
      { room: { contains: q, mode: "insensitive" } },
      { course: { contains: q, mode: "insensitive" } },
    ];
  }
  if (course) where.course = course;
  if (semester) where.semester = parseInt(semester);
  if (blockId) where.blockId = blockId;

  const students = await prisma.student.findMany({
    where,
    select: {
      id: true,
      room: true,
      rollNumber: true,
      course: true,
      semester: true,
      diet: true,
      status: true,
      user: { select: { name: true, email: true, phone: true } },
      block: { select: { name: true } },
    },
    orderBy: [{ course: "asc" }, { semester: "asc" }, { room: "asc" }],
  });

  const courses = await prisma.student.findMany({
    distinct: ["course"],
    select: { course: true },
    where: { course: { not: "" } },
  });

  return NextResponse.json({
    students,
    filters: {
      courses: courses.map((c) => c.course).filter(Boolean),
    },
  });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing student ID" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    await prisma.mealScan.deleteMany({ where: { studentId: id } });
    await prisma.student.delete({ where: { id } });
    await prisma.user.delete({ where: { id: student.userId } });

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Delete student error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
