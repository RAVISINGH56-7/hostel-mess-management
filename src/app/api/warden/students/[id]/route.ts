import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user?.role !== "WARDEN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const warden = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { blockId: true },
  });
  if (!warden?.blockId) {
    return NextResponse.json({ error: "Warden not assigned to block" }, { status: 400 });
  }

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student || student.blockId !== warden.blockId) {
    return NextResponse.json({ error: "Student not found in your block" }, { status: 404 });
  }

  const body = await request.json();
  const updates: Record<string, any> = {};

  if (body.status === "ACTIVE" || body.status === "SUSPENDED") {
    updates.status = body.status;
  }
  if (body.diet && ["VEG", "NON_VEG"].includes(body.diet)) {
    updates.diet = body.diet;
  }
  if (body.room) updates.room = body.room;
  if (body.course) updates.course = body.course;
  if (body.semester) updates.semester = parseInt(body.semester);

  const updated = await prisma.student.update({
    where: { id },
    data: updates,
    include: { user: { select: { name: true, email: true } } },
  });

  return NextResponse.json(updated);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user?.role !== "WARDEN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const warden = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { blockId: true },
  });
  if (!warden?.blockId) {
    return NextResponse.json({ error: "Warden not assigned" }, { status: 400 });
  }

  const student = await prisma.student.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true, phone: true } } },
  });
  if (!student || student.blockId !== warden.blockId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(student);
}
