import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { getQrSecret } from "@/lib/env";
import type { MealType } from "@prisma/client";
import {
  getIstMinutesSinceMidnight,
  getMealWindowStatus,
  getMealLabel,
  normalizeMealType,
  parseTimeStringToMinutes,
} from "@/lib/mealWindows";

function fmt(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function todayAtMidnightUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "STAFF" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { qrToken, meal } = await request.json();
    if (!qrToken || !meal) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const QR_SECRET = getQrSecret();

    const mealType = normalizeMealType(meal);
    if (!mealType) {
      return NextResponse.json({ error: "Invalid meal" }, { status: 400 });
    }

    const mealWindow = await prisma.mealWindow.findFirst({
      where: { meal: mealType },
    });

    if (!mealWindow) {
      return NextResponse.json({ error: "Meal window not configured" }, { status: 400 });
    }

    const timeStatus = getMealWindowStatus(mealWindow, getIstMinutesSinceMidnight());
    const label = getMealLabel(mealType);
    const startMinutes = parseTimeStringToMinutes(mealWindow.startTime);
    const endMinutes = parseTimeStringToMinutes(mealWindow.endTime);
    const mealEnum = mealWindow.meal;

    if (timeStatus === "not_started") {
      return NextResponse.json({
        status: "not_started",
        message: `${label} hasn't started yet. Opens at ${fmt(startMinutes)}.`,
      });
    }
    if (timeStatus === "time_over") {
      return NextResponse.json({
        status: "time_over",
        message: `${label} is over. It closed at ${fmt(endMinutes)}.`,
      });
    }

    // Verify JWT
    let payload: JwtPayload & { sub: string; passId: string; name: string; room: string };
    try {
      payload = jwt.verify(qrToken, QR_SECRET) as typeof payload;
    } catch {
      return NextResponse.json({ status: "invalid", message: "Invalid or expired QR code" });
    }

    const passId = payload.passId;

    // Check student exists and is active
    const student = await prisma.student.findUnique({
      where: { passId },
      include: { user: { select: { name: true } } },
    });

    if (!student) {
      return NextResponse.json({ status: "invalid", message: "Student not found" });
    }

    if (student.status === "SUSPENDED") {
      return NextResponse.json({
        status: "suspended",
        name: student.user.name,
        room: student.room,
        message: `${student.user.name}'s meal plan is suspended.`,
      });
    }

    // Check for duplicate scan today
    const todayUTC = todayAtMidnightUTC();

    const existing = await prisma.mealScan.findFirst({
      where: {
        studentId: student.id,
        meal: mealEnum,
        date: todayUTC,
      },
    });

    if (existing) {
      return NextResponse.json({
        status: "duplicate",
        name: student.user.name,
        room: student.room,
        message: `Already scanned for ${label} today.`,
      });
    }

    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create scan
    await prisma.mealScan.create({
      data: {
        studentId: student.id,
        meal: mealEnum,
        scannedBy: userId,
        status: "SUCCESS",
        date: todayUTC,
      },
    });

    return NextResponse.json({
      status: "success",
      name: student.user.name,
      room: student.room,
      message: `${label} logged successfully.`,
    });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
