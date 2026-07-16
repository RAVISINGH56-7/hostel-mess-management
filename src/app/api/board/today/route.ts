import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Total students across all blocks
    const totalStudents = await prisma.student.count({
      where: { status: "ACTIVE" },
    });

    // Active wardens
    const activeWardens = await prisma.user.count({
      where: { role: "WARDEN" },
    });

    // Today's meal stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const mealScans = await prisma.mealScan.groupBy({
      by: ["meal"],
      where: { date: today },
      _count: { id: true },
    });

    // Build meal stats with total student count (rough estimate: assume each student gets one scan per meal)
    const mealStats = [
      { label: "Breakfast", served: 0, total: totalStudents },
      { label: "Lunch", served: 0, total: totalStudents },
      { label: "Snacks", served: 0, total: totalStudents },
      { label: "Dinner", served: 0, total: totalStudents },
    ];

    mealScans.forEach(({ meal, _count }) => {
      const mealLower = meal.toLowerCase();
      const index = mealStats.findIndex(
        (m) => m.label.toLowerCase() === mealLower
      );
      if (index !== -1) {
        mealStats[index].served = _count.id;
      }
    });

    return NextResponse.json({
      totalStudents,
      activeWardens,
      mealStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Board data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch board data" },
      { status: 500 }
    );
  }
}
