import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIstMinutesSinceMidnight, getMealWindowStatus } from "@/lib/mealWindows";

export async function GET() {
  const mealWindows = await prisma.mealWindow.findMany({
    orderBy: [{ startTime: "asc" }],
  });

  const nowMinutes = getIstMinutesSinceMidnight();

  return NextResponse.json(
    mealWindows.map((window) => ({
      id: window.id,
      meal: window.meal,
      startTime: window.startTime,
      endTime: window.endTime,
      isLive: getMealWindowStatus(window, nowMinutes) === "ok",
    }))
  );
}
