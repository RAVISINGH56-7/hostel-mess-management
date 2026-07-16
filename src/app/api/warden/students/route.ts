import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { studentFormSchema } from "@/lib/validations/student";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getQrSecret } from "@/lib/env";
import { v4 as uuid } from "uuid";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  const session = await auth();
  // Allow both WARDEN and SUPER_ADMIN to register students
  if (
    !session ||
    !session.user ||
    (session.user.role !== "WARDEN" && session.user.role !== "SUPER_ADMIN")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const body = Object.fromEntries(formData.entries());
    const parsed = studentFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    // Determine blockId: warden uses their own block, admin must supply blockId
    let blockId: string | null = null;
    if (session.user.role === "WARDEN") {
      const warden = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { blockId: true },
      });
      blockId = warden?.blockId ?? null;
      if (!blockId) {
        return NextResponse.json(
          { error: "Warden not assigned to a block" },
          { status: 400 }
        );
      }
    } else {
      // SUPER_ADMIN must pass blockId in the form
      blockId = (formData.get("blockId") as string) || null;
      if (!blockId) {
        return NextResponse.json(
          { error: "blockId is required" },
          { status: 400 }
        );
      }
    }

    const { name, email, phone, room, course, semester, rollNumber } = parsed.data;
    const diet = (formData.get("diet") as string) || null;

    const username = rollNumber;
    // Default password: last 4 chars of roll number + "_pass"
    const password = `${rollNumber.slice(-4)}_pass`;
    const passwordHash = await bcrypt.hash(password, 10);

    let user;
    try {
      user = await prisma.user.create({
        data: {
          role: "STUDENT",
          username,
          email: email || null,
          passwordHash,
          name,
          phone: phone || null,
          blockId,
        },
      });
    } catch (err: any) {
      if (err?.code === "P2002") {
        const target = err.meta?.target as string[] | undefined;
        if (target?.includes("username")) {
          return NextResponse.json(
            { error: "A student with this roll number already exists" },
            { status: 409 }
          );
        }
        if (target?.includes("email")) {
          return NextResponse.json(
            { error: "A student with this email already exists" },
            { status: 409 }
          );
        }
      }
      throw err;
    }

    const QR_SECRET = getQrSecret();

    // Generate passId and QR token (JWT)
    const passId = `TF-${username.toUpperCase()}`;
    const qrSecret = jwt.sign(
      { sub: user.id, passId, name, room },
      QR_SECRET,
      { algorithm: "HS256", expiresIn: "30d" }
    );

    // Handle optional photo upload
    let photoUrl: string | undefined;
    const photoFile = formData.get("photo") as File | null;
    if (photoFile && photoFile.size > 0) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      const maxSize = 2 * 1024 * 1024; // 2 MB
      if (!allowedTypes.includes(photoFile.type)) {
        return NextResponse.json({ error: "Invalid photo type" }, { status: 400 });
      }
      if (photoFile.size > maxSize) {
        return NextResponse.json({ error: "Photo too large (max 2 MB)" }, { status: 400 });
      }

      const buffer = Buffer.from(await photoFile.arrayBuffer());
      const ext = photoFile.type === "image/png" ? "png" : "jpg";
      const filename = `student-${user.id}-${uuid()}.${ext}`;
      const uploadDir = path.join(process.cwd(), "public/uploads");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer, { mode: 0o644 });
      photoUrl = `/uploads/${filename}`;
    }

    await prisma.student.create({
      data: {
        userId: user.id,
        blockId,
        room,
        course,
        semester,
        diet,
        passId,
        qrSecret,
        photoUrl,
        rollNumber,
        status: "ACTIVE",
      },
    });

    console.log(`Student ${name} created. Username: ${username}`);

    return NextResponse.json({
      username,
      password,
      passId,
      message: "Student registered successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const session = await auth();
  if (
    !session ||
    !session.user ||
    (session.user.role !== "WARDEN" && session.user.role !== "SUPER_ADMIN")
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  let blockId: string | null = null;
  if (session.user.role === "WARDEN") {
    const warden = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { blockId: true },
    });
    blockId = warden?.blockId ?? null;
    if (!blockId) {
      return NextResponse.json(
        { error: "Warden not assigned to a block" },
        { status: 400 }
      );
    }
  } else {
    // SUPER_ADMIN can optionally filter by blockId
    blockId = searchParams.get("blockId") || null;
  }

  const students = await prisma.student.findMany({
    where: {
      ...(blockId ? { blockId } : {}),
      ...(query
        ? {
            OR: [
              { user: { name: { contains: query, mode: "insensitive" } } },
              { room: { contains: query, mode: "insensitive" } },
              { course: { contains: query, mode: "insensitive" } },
              { rollNumber: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      user: { select: { name: true, email: true, phone: true } },
    },
    orderBy: { room: "asc" },
  });

  return NextResponse.json(students);
}
