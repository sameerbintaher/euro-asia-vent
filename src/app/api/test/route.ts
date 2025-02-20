import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Job from "@/models/Job";

export async function GET() {
  try {
    console.log("Testing database connection...");
    await connectToDatabase();
    console.log("Database connected successfully");

    // Count existing jobs
    const count = await Job.countDocuments();
    console.log(`Found ${count} jobs in database`);

    return NextResponse.json({
      status: "success",
      message: "Database connection successful",
      jobCount: count,
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
