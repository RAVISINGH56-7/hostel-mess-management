import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getIstMinutesSinceMidnight, getMealWindowStatus } from "@/lib/mealWindows";

export async function GET() {
  const session = await auth();
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mealWindows = await prisma.mealWindow.findMany({
    orderBy: [{ startTime: "asc" }],
  });

  const nowMinutes = getIstMinutesSinceMidnight();

  const meals = mealWindows.map((mw) => ({
    id: mw.id,
    meal: mw.meal,
    startTime: mw.startTime,
    endTime: mw.endTime,
    isLive: getMealWindowStatus(mw, nowMinutes) === "ok",
  }));

  return NextResponse.json(meals);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session || session.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, startTime, endTime } = body;

  if (!id || !startTime || !endTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    return NextResponse.json({ error: "Invalid time format" }, { status: 400 });
  }

  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const start = sh * 60 + sm;
  const end = eh * 60 + em;
  if (start >= end) {
    return NextResponse.json({ error: "Start time must be before end time" }, { status: 400 });
  }

  const otherWindows = await prisma.mealWindow.findMany({
    where: {
      id: { not: id },
    },
  });

  const overlaps = otherWindows.some((mw) => {
    const [osh, osm] = mw.startTime.split(":").map(Number);
    const [oeh, oem] = mw.endTime.split(":").map(Number);
    const otherStart = osh * 60 + osm;
    const otherEnd = oeh * 60 + oem;
    return start < otherEnd && end > otherStart;
  });

  if (overlaps) {
    return NextResponse.json({ error: "Meal times must not overlap with other meal windows" }, { status: 400 });
  }

  try {
    await prisma.mealWindow.update({
      where: { id },
      data: { startTime, endTime },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to update meal window" }, { status: 500 });
  }
}
