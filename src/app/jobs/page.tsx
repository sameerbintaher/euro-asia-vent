import { connectToDatabase } from "@/lib/db";
import Job from "@/models/Job";
import AllJobs from "@/components/AllJobs";

// Server-side data fetching
async function getJobs() {
  try {
    await connectToDatabase();
    const jobs = await Job.find().sort({ createdAt: -1 });

    // Convert _id to string and handle serialization
    const serializedJobs = jobs.map((job) => ({
      ...job.toObject(),
      _id: job._id.toString(),
    }));

    return serializedJobs;
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return [];
  }
}

export default async function JobsPage() {
  const jobs = await getJobs();
  return <AllJobs initialJobs={jobs} />;
}
