import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { MealType } from "@prisma/client";

const MEAL_WINDOWS: Record<string, { start: number; end: number; label: string }> = {
  BREAKFAST: { start:  7 * 60,      end:  9 * 60 + 30, label: "Breakfast" },
  LUNCH:     { start: 12 * 60,      end: 14 * 60 + 30, label: "Lunch" },
  SNACKS:    { start: 16 * 60,      end: 18 * 60,       label: "Snacks" },
  DINNER:    { start: 19 * 60 + 30, end: 21 * 60 + 30, label: "Dinner" },
};

function minutesNowIST(): number {
  const now = new Date();
  const istOffset = 5 * 60 + 30;
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  return (utcMinutes + istOffset) % (24 * 60);
}

function checkMealWindow(mealUpper: string): "ok" | "not_started" | "time_over" {
  const window = MEAL_WINDOWS[mealUpper];
  if (!window) return "ok";
  const now = minutesNowIST();
  if (now < window.start) return "not_started";
  if (now > window.end)   return "time_over";
  return "ok";
}

function fmt(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12  = h % 12 === 0 ? 12 : h % 12;
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

    const QR_SECRET = process.env.QR_SECRET;
    if (!QR_SECRET) {
      console.error("QR_SECRET not configured");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // Validate meal value
    const allowedMeals = ["BREAKFAST", "LUNCH", "SNACKS", "DINNER"];
    const mealUpper = String(meal).toUpperCase();
    if (!allowedMeals.includes(mealUpper)) {
      return NextResponse.json({ error: "Invalid meal" }, { status: 400 });
    }

    const mealEnum = mealUpper as unknown as MealType;
    const window   = MEAL_WINDOWS[mealUpper];

    // Check meal window
    const timeStatus = checkMealWindow(mealUpper);
    if (timeStatus === "not_started") {
      return NextResponse.json({
        status: "not_started",
        message: `${window.label} hasn't started yet. Opens at ${fmt(window.start)}.`,
      });
    }
    if (timeStatus === "time_over") {
      return NextResponse.json({
        status: "time_over",
        message: `${window.label} is over. It closed at ${fmt(window.end)}.`,
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
        message: `Already scanned for ${window.label} today.`,
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
      message: `${window.label} logged successfully.`,
    });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
