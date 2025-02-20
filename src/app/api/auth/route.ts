import { NextResponse } from "next/server";

// In a real application, you would store these securely in environment variables
// and use proper password hashing
const ADMIN_CREDENTIALS = {
  email: "admin@euroasiaglobal.com",
  password: "admin123",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (
      email === ADMIN_CREDENTIALS.email &&
      password === ADMIN_CREDENTIALS.password
    ) {
      // Set a cookie to indicate the user is logged in
      const response = NextResponse.json({
        success: true,
        message: "Login successful",
      });

      // Set the cookie
      response.cookies.set("isLoggedIn", "true", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24, // 24 hours
      });

      return response;
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid credentials",
      },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred",
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  // Logout endpoint
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  // Remove the cookie
  response.cookies.set("isLoggedIn", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  return response;
}
