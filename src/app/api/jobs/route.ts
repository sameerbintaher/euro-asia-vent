import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Job from "@/models/Job";
import { cookies } from "next/headers";

// Helper function to check authentication
const isAuthenticated = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("isLoggedIn")?.value === "true";
};

// Get all jobs
export async function GET() {
  try {
    await connectToDatabase();
    const jobs = await Job.find().sort({ createdAt: -1 });

    if (!Array.isArray(jobs)) {
      console.error("Jobs is not an array:", jobs);
      return NextResponse.json([]);
    }

    // Format the jobs data
    const formattedJobs = jobs
      .map((job) => {
        try {
          const jobObj = job.toObject();
          return {
            ...jobObj,
            _id: job._id.toString(),
            deadline: jobObj.deadline
              ? new Date(jobObj.deadline).toISOString().split("T")[0]
              : null,
            vacancy: jobObj.vacancy || 1,
            preferredGender: jobObj.preferredGender || "Any",
          };
        } catch (error) {
          console.error("Error formatting job:", error);
          return null;
        }
      })
      .filter(Boolean);

    return NextResponse.json(formattedJobs);
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return NextResponse.json([], { status: 500 });
  }
}

// Create a new job
export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Received job data:", body);

    // Validate required fields
    if (
      !body.title ||
      !body.location ||
      !body.type ||
      !body.salary ||
      !body.category ||
      !body.requirements
    ) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 }
      );
    }

    // Format the data with defaults for new fields
    const jobData = {
      title: body.title,
      location: body.location,
      type: body.type,
      salary: body.salary,
      category: body.category,
      requirements: Array.isArray(body.requirements)
        ? body.requirements
        : body.requirements.split("\n").filter(Boolean),
      deadline: body.deadline ? new Date(body.deadline) : new Date(),
      vacancy: body.vacancy ? parseInt(body.vacancy.toString()) : 1,
      preferredGender: body.preferredGender || "Any",
    };

    console.log("Formatted job data:", jobData);

    await connectToDatabase();
    const job = await Job.create(jobData);
    console.log("Created job:", job);

    // Format the response
    const formattedJob = {
      ...job.toObject(),
      _id: job._id.toString(),
      deadline: job.deadline.toISOString().split("T")[0],
    };

    return NextResponse.json(formattedJob, { status: 201 });
  } catch (error) {
    console.error("Failed to create job:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to create job";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Delete a job
export async function DELETE(request: Request) {
  try {
    // Check if user is authenticated
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    await Job.findByIdAndDelete(id);

    return NextResponse.json({ message: "Job deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}

// Update a job
export async function PUT(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log("Received update data:", body);

    // Format the data with defaults
    const jobData = {
      title: body.title,
      location: body.location,
      type: body.type,
      salary: body.salary,
      category: body.category,
      requirements: Array.isArray(body.requirements)
        ? body.requirements
        : body.requirements.split("\n").filter(Boolean),
      deadline: body.deadline ? new Date(body.deadline) : new Date(),
      vacancy: body.vacancy ? parseInt(body.vacancy.toString()) : 1,
      preferredGender: body.preferredGender || "Any",
    };

    console.log("Formatted update data:", jobData);

    await connectToDatabase();
    const job = await Job.findByIdAndUpdate(id, jobData, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Format the response
    const formattedJob = {
      ...job.toObject(),
      _id: job._id.toString(),
      deadline: job.deadline.toISOString().split("T")[0],
    };

    return NextResponse.json(formattedJob);
  } catch (error) {
    console.error("Failed to update job:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update job";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
