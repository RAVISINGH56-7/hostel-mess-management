-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'WARDEN', 'STAFF', 'STUDENT');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER');

-- CreateTable
CREATE TABLE "Hostel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Hostel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hostelId" TEXT NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "email" TEXT,
    "username" TEXT,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "photoUrl" TEXT,
    "blockId" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "rollNumber" TEXT,
    "course" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "diet" TEXT,
    "photoUrl" TEXT,
    "passId" TEXT NOT NULL,
    "qrSecret" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealWindow" (
    "id" TEXT NOT NULL,
    "blockId" TEXT,
    "meal" "MealType" NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,

    CONSTRAINT "MealWindow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealScan" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "meal" "MealType" NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scannedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "MealScan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_resetToken_key" ON "User"("resetToken");

-- CreateIndex
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_passId_key" ON "Student"("passId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_qrSecret_key" ON "Student"("qrSecret");

-- CreateIndex
CREATE UNIQUE INDEX "MealScan_studentId_meal_date_key" ON "MealScan"("studentId", "meal", "date");

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_hostelId_fkey" FOREIGN KEY ("hostelId") REFERENCES "Hostel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "Block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealScan" ADD CONSTRAINT "MealScan_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
