import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });

  const cookieNames = ["access", "refresh", "user_type", "roleKey", "role", "lastRoute"];

  cookieNames.forEach((name) => {
    res.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  });

  return res;
}