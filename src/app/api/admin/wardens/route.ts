import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  const session = await auth();
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const wardens = await prisma.user.findMany({
    where: { role: "WARDEN" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      photoUrl: true,
      block: { select: { name: true } },
    },
  });

  return NextResponse.json(wardens);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;
    const blockId = formData.get("blockId") as string;
    const photo = formData.get("photo") as File | null;

    if (!name || !email || !password || !blockId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    // Username is the email — wardens log in with their email
    const username = email;

    let warden;
    try {
      warden = await prisma.user.create({
        data: {
          role: "WARDEN",
          name,
          email,
          phone: phone || null,
          username,
          passwordHash,
          blockId,
        },
      });
    } catch (err: any) {
      if (err?.code === "P2002") {
        const target = err.meta?.target as string[] | undefined;
        if (target?.includes("email") || target?.includes("username")) {
          return NextResponse.json({ error: "A warden with this email already exists" }, { status: 409 });
        }
      }
      throw err;
    }

    // Handle photo upload
    let photoUrl: string | undefined;
    if (photo && photo.size > 0) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (!allowedTypes.includes(photo.type)) {
        return NextResponse.json({ error: "Invalid photo type" }, { status: 400 });
      }
      if (photo.size > maxSize) {
        return NextResponse.json({ error: "Photo too large" }, { status: 400 });
      }

      const buffer = Buffer.from(await photo.arrayBuffer());
      const ext = photo.type === "image/png" ? "png" : "jpg";
      const filename = `warden-${warden.id}-${uuid()}.${ext}`;
      const uploadDir = path.join(process.cwd(), "public/uploads");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer, { mode: 0o644 });
      photoUrl = `/uploads/${filename}`;

      // Update warden with photo URL
      await prisma.user.update({
        where: { id: warden.id },
        data: { photoUrl },
      });
    }

    return NextResponse.json({
      id: warden.id,
      name: warden.name,
      email: warden.email,
      phone: warden.phone,
      photoUrl,
      message: "Warden created successfully",
    });
  } catch (error) {
    console.error("Create warden error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
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
      return NextResponse.json({ error: "Missing warden ID" }, { status: 400 });
    }

    const warden = await prisma.user.findUnique({ where: { id } });
    if (!warden || warden.role !== "WARDEN") {
      return NextResponse.json({ error: "Warden not found" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "Warden deleted successfully" });
  } catch (error) {
    console.error("Delete warden error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
