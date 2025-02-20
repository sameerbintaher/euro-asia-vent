export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get("isLoggedIn")?.value === "true";

  return NextResponse.json({ isAuthenticated: isLoggedIn });
}
