import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

export async function GET() {
  const session = await auth();
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const staff = await prisma.user.findMany({
    where: { role: "STAFF" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      block: { select: { name: true, id: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(staff);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, email, phone, password, blockId } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const username = email;

    let staff;
    try {
      staff = await prisma.user.create({
        data: {
          role: "STAFF",
          name,
          email,
          phone: phone || null,
          username,
          passwordHash,
          blockId: blockId || null,
        },
      });
    } catch (err: any) {
      if (err?.code === "P2002") {
        const target = err.meta?.target as string[] | undefined;
        if (target?.includes("email")) {
          return NextResponse.json({ error: "A staff member with this email already exists" }, { status: 409 });
        }
        if (target?.includes("username")) {
          return NextResponse.json({ error: "Username collision — please retry" }, { status: 409 });
        }
      }
      throw err;
    }

    return NextResponse.json({
      id: staff.id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
      message: "Staff member created successfully",
    });
  } catch (error) {
    console.error("Create staff error:", error);
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
      return NextResponse.json({ error: "Missing staff ID" }, { status: 400 });
    }

    const staff = await prisma.user.findUnique({ where: { id } });
    if (!staff || staff.role !== "STAFF") {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ message: "Staff member deleted successfully" });
  } catch (error) {
    console.error("Delete staff error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
