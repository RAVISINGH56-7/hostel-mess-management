import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mealWindows = await prisma.mealWindow.findMany({
    orderBy: [{ startTime: "asc" }],
  });

  // Determine which meals are currently being served
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const meals = mealWindows.map((mw) => {
    const [sh, sm] = mw.startTime.split(":").map(Number);
    const [eh, em] = mw.endTime.split(":").map(Number);
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    const isLive = nowMinutes >= start && nowMinutes <= end;

    return {
      id: mw.id,
      meal: mw.meal,
      startTime: mw.startTime,
      endTime: mw.endTime,
      isLive,
    };
  });

  return NextResponse.json(meals);
}
