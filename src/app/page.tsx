export const dynamic = "force-dynamic";
export const revalidate = 0;

import { connectToDatabase } from "@/lib/db";
import Job from "@/models/Job";
import ClientHome from "@/components/ClientHome";

// Server-side data fetching
async function getJobs() {
  try {
    console.log("Connecting to database...");
    await connectToDatabase();

    console.log("Fetching jobs from database...");
    const jobs = await Job.find().sort({ createdAt: -1 });

    // Convert _id to string and handle serialization
    const serializedJobs = jobs.map((job) => ({
      ...job.toObject(),
      _id: job._id.toString(),
    }));

    console.log(`Found ${jobs.length} jobs`);
    return serializedJobs;
  } catch (error) {
    console.error("Failed to fetch jobs:", error);
    return [];
  }
}

// Mark the component as async to enable server-side data fetching
export default async function Home() {
  const initialJobs = await getJobs();
  return <ClientHome initialJobs={initialJobs} />;
}
