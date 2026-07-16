import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { studentFormSchema } from "@/lib/validations/student";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "WARDEN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const body = Object.fromEntries(formData.entries());
    const parsed = studentFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const warden = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { blockId: true, block: { select: { id: true, name: true } } },
    });
    if (!warden?.blockId) {
      return NextResponse.json({ error: "Warden not assigned to block" }, { status: 400 });
    }

    const { name, email, phone, room, course, semester } = parsed.data;
    const diet = (formData.get("diet") as string) || null;

    // Generate username and password
    const rollPrefix = course === "B.Tech" ? "btcs" : "btec";
    const sem = String(semester).padStart(2, "0");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const username = `2026${rollPrefix}${randomNum}`;
    const password = `pass${randomNum}`;
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        role: "STUDENT",
        username,
        email: email || null,
        passwordHash,
        name,
        phone,
        blockId: warden.blockId,
      },
    });

    // Require QR secret to be configured
    const QR_SECRET = process.env.QR_SECRET;
    if (!QR_SECRET) {
      console.error("QR_SECRET not configured");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // Generate passId and QR secret (JWT)
    const passId = `TF-${username.toUpperCase()}`;
    const qrSecret = jwt.sign({ sub: user.id, passId, name, room }, QR_SECRET, {
      algorithm: "HS256",
      expiresIn: "30d",
    });

    // Handle photo upload (if provided)
    let photoUrl: string | undefined;
    const photoFile = formData.get("photo") as File | null;
    if (photoFile && photoFile.size > 0) {
      // Validate file type and size
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (!allowedTypes.includes(photoFile.type)) {
        return NextResponse.json({ error: "Invalid photo type" }, { status: 400 });
      }
      if (photoFile.size > maxSize) {
        return NextResponse.json({ error: "Photo too large" }, { status: 400 });
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
        blockId: warden.blockId,
        room,
        course,
        semester,
        diet,
        passId,
        qrSecret,
        photoUrl,
        status: "ACTIVE",
      },
    });

    // Notify: do not log plaintext passwords
    console.log(`Student ${name} created. Username: ${username}`);

    return NextResponse.json({ username, password, passId, message: "Student registered successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "WARDEN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const warden = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { blockId: true },
  });

  if (!warden?.blockId) {
    return NextResponse.json({ error: "Warden not assigned to block" }, { status: 400 });
  }

  const students = await prisma.student.findMany({
    where: {
      blockId: warden.blockId,
      OR: query
        ? [
            { user: { name: { contains: query, mode: "insensitive" } } },
            { room: { contains: query, mode: "insensitive" } },
            { course: { contains: query, mode: "insensitive" } },
          ]
        : undefined,
    },
    include: {
      user: { select: { name: true, email: true, phone: true } },
    },
    orderBy: { room: "asc" },
  });

  return NextResponse.json(students);
}