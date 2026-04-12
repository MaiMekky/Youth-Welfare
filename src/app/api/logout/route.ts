import { NextResponse } from "next/server";
import { cookies } from "next/headers";

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
    res.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),          
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
    });
  });

  return res;
}