import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });

  const cookieNames = [
    "access",
    "refresh",
    "user_type",
    "roleKey",
    "role",
    "lastRoute",
  ];

  const isProduction = process.env.NODE_ENV === "production";

  cookieNames.forEach((name) => {
    // Delete with exact production settings
    res.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
    });

    // Also delete without httpOnly in case some were set that way
    res.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
      secure: isProduction,
      sameSite: "lax",
    });
  });

  return res;
}