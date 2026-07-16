import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { getResetTokenSecret, getSiteUrl } from "@/lib/env";

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: username }],
        role: "STUDENT",
      },
    });

    // Always return the same message to avoid user enumeration
    if (!user) {
      return NextResponse.json({
        message:
          "If an account exists with that username, a reset link has been logged to the console.",
      });
    }

    // Use a dedicated secret for reset tokens (not the QR secret)
    const resetSecret = getResetTokenSecret();

    // Generate reset token (JWT with 1-hour expiry)
    const resetToken = jwt.sign(
      { userId: user.id, purpose: "password-reset" },
      resetSecret,
      { expiresIn: "1h" }
    );

    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry },
      });
    } catch (err: any) {
      if (err?.code === "P2002") {
        // Extremely rare: resetToken collision. Regenerate and retry once.
        const retrySecret = getResetTokenSecret();
        const retryToken = jwt.sign(
          { userId: user.id, purpose: "password-reset" },
          retrySecret,
          { expiresIn: "1h" }
        );
        const retryExpiry = new Date(Date.now() + 60 * 60 * 1000);
        await prisma.user.update({
          where: { id: user.id },
          data: { resetToken: retryToken, resetTokenExpiry: retryExpiry },
        });
      } else {
        throw err;
      }
    }

    const resetUrl = `${getSiteUrl()}/login/student/reset-password?token=${resetToken}`;

    console.log("╔══════════════════════════════════════════════╗");
    console.log("║        PASSWORD RESET LINK (DEV MODE)       ║");
    console.log("╠══════════════════════════════════════════════╣");
    console.log(`║ User: ${user.name}`);
    console.log(`║ Username: ${user.username || user.email}`);
    console.log("║                                              ");
    console.log(`║ ${resetUrl}`);
    console.log("╚══════════════════════════════════════════════╝");

    return NextResponse.json({
      message:
        "If an account exists with that username, a reset link has been logged to the console.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
