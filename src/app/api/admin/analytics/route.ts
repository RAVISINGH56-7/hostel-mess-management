import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // total scans per block
  const blocks = await prisma.block.findMany({
    include: { students: { include: { meals: true } } },
  });

  const data = blocks.map((block) => ({
    block: block.name,
    total: block.students.reduce((sum, s) => sum + s.meals.length, 0),
  }));

  return NextResponse.json(data);
}
