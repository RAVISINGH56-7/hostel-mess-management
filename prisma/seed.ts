import { PrismaClient, Role, MealType } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.mealScan.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();
  await prisma.block.deleteMany();
  await prisma.hostel.deleteMany();
  await prisma.mealWindow.deleteMany();

  const hostel = await prisma.hostel.create({
    data: { name: "Main Hostel" },
  });

  await prisma.block.create({
    data: { name: "Block A", hostelId: hostel.id },
  });

  // Seed only the root admin account and base meal windows.
  await prisma.user.create({
    data: {
      role: Role.SUPER_ADMIN,
      email: "admin@tiffin.edu",
      username: "admin",
      passwordHash: await bcrypt.hash("admin123", 10),
      name: "Super Admin",
    },
  });

  await prisma.mealWindow.createMany({
    data: [
      { meal: MealType.BREAKFAST, startTime: "07:00", endTime: "09:30" },
      { meal: MealType.LUNCH, startTime: "12:30", endTime: "14:30" },
      { meal: MealType.SNACKS, startTime: "16:30", endTime: "18:00" },
      { meal: MealType.DINNER, startTime: "19:30", endTime: "21:30" },
    ],
  });

  console.log("Minimal seed data created successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
