import type { MealType } from "@prisma/client";

export const MEAL_KEYS = ["breakfast", "lunch", "snacks", "dinner"] as const;
export type MealKey = (typeof MEAL_KEYS)[number];

export const MEAL_TYPE_MAP: Record<MealKey, MealType> = {
  breakfast: "BREAKFAST",
  lunch: "LUNCH",
  snacks: "SNACKS",
  dinner: "DINNER",
};

export const MEAL_KEY_FROM_TYPE: Record<MealType, MealKey> = {
  BREAKFAST: "breakfast",
  LUNCH: "lunch",
  SNACKS: "snacks",
  DINNER: "dinner",
};

export const MEAL_LABELS: Record<MealType, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  SNACKS: "Snacks",
  DINNER: "Dinner",
};

export type MealWindowDefinition = {
  id: string;
  meal: MealType;
  startTime: string;
  endTime: string;
};

export type MealWindowStatus = "ok" | "not_started" | "time_over";

export const IST_OFFSET_MINUTES = 5 * 60 + 30;

export function parseTimeStringToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error(`Invalid time string: ${time}`);
  }
  return hours * 60 + minutes;
}

export function getIstMinutesSinceMidnight(date = new Date()): number {
  const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();
  return (utcMinutes + IST_OFFSET_MINUTES + 24 * 60) % (24 * 60);
}

export function getMealWindowStatus(
  window: Pick<MealWindowDefinition, "startTime" | "endTime">,
  nowMinutes = getIstMinutesSinceMidnight()
): MealWindowStatus {
  const start = parseTimeStringToMinutes(window.startTime);
  const end = parseTimeStringToMinutes(window.endTime);

  if (start === end) {
    return "time_over";
  }

  if (start < end) {
    if (nowMinutes < start) return "not_started";
    if (nowMinutes > end) return "time_over";
    return "ok";
  }

  // Support windows that wrap past midnight.
  if (nowMinutes >= start || nowMinutes <= end) {
    return "ok";
  }
  return "not_started";
}

export function normalizeMealType(input: string): MealType | null {
  const normalized = String(input).trim().toLowerCase();
  return MEAL_TYPE_MAP[normalized as MealKey] ?? null;
}

export function normalizeMealKey(input: string): MealKey | null {
  const normalized = String(input).trim().toLowerCase();
  return MEAL_KEYS.find((key) => key === normalized) ?? null;
}

export function getMealLabel(meal: MealType): string {
  return MEAL_LABELS[meal] ?? meal;
}

export function isValidTimeFormat(time: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}
