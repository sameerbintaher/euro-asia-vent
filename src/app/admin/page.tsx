"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface Job {
  _id: string;
  title: string;
  location: string;
  type: string;
  salary: string;
  requirements: string[];
  category: string;
  deadline: string;
  vacancy: number;
  preferredGender: "Male" | "Female" | "Any";
}

export default function AdminDashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    type: "Full-time",
    salary: "",
    category: "",
    requirements: "",
    deadline: new Date().toISOString().split("T")[0],
    vacancy: 1,
    preferredGender: "Any" as "Male" | "Female" | "Any",
  });

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, []);

  // Check authentication on page load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check");
        const data = await response.json();

        if (!data.isAuthenticated) {
          router.replace("/");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.replace("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs");
      const data = await response.json();
      // Ensure data is an array
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      setJobs([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Format the data properly before sending
    const jobData = {
      ...formData,
      requirements: formData.requirements.split("\n").filter(Boolean),
      deadline: formData.deadline || new Date().toISOString().split("T")[0],
      vacancy: parseInt(formData.vacancy.toString()) || 1,
      preferredGender: formData.preferredGender || "Any",
    };

    try {
      console.log("Submitting job data:", jobData);

      const response = await fetch(
        editingJob ? `/api/jobs?id=${editingJob._id}` : "/api/jobs",
        {
          method: editingJob ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jobData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save job");
      }

      console.log("Job saved successfully:", data);

      // Refresh jobs list
      await fetchJobs();

      setIsAddModalOpen(false);
      setEditingJob(null);
      resetForm();
    } catch (error) {
      console.error("Failed to save job:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save job. Please try again."
      );
    }
  };

  const handleDelete = async (jobId: string) => {
    if (confirm("Are you sure you want to delete this job posting?")) {
      try {
        await fetch(`/api/jobs?id=${jobId}`, {
          method: "DELETE",
        });
        await fetchJobs();
      } catch (error) {
        console.error("Failed to delete job:", error);
        alert("Failed to delete job. Please try again.");
      }
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);

    // Format the date string properly
    let formattedDate = new Date().toISOString().split("T")[0];
    if (job.deadline) {
      try {
        const date = new Date(job.deadline);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split("T")[0];
        }
      } catch (error) {
        console.error("Error formatting date:", error);
      }
    }

    setFormData({
      title: job.title || "",
      location: job.location || "",
      type: job.type || "Full-time",
      salary: job.salary || "",
      category: job.category || "",
      requirements: Array.isArray(job.requirements)
        ? job.requirements.join("\n")
        : "",
      deadline: formattedDate,
      vacancy: job.vacancy || 1,
      preferredGender: job.preferredGender || "Any",
    });
    setIsAddModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" });
      router.replace("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      location: "",
      type: "Full-time",
      salary: "",
      category: "",
      requirements: "",
      deadline: new Date().toISOString().split("T")[0],
      vacancy: 1,
      preferredGender: "Any" as "Male" | "Female" | "Any",
    });
  };

  // Don't render anything while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold gradient-text">
              Admin Dashboard
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsAddModalOpen(true);
                  setEditingJob(null);
                  resetForm();
                }}
                className="button-primary flex items-center gap-2 w-full sm:w-auto"
              >
                <PlusIcon className="h-5 w-5" />
                Add New Job
              </motion.button>
              <button
                onClick={handleLogout}
                className="button-secondary w-full sm:w-auto"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6">
          {Array.isArray(jobs) && jobs.length > 0 ? (
            jobs.map((job) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold mb-2">{job.title}</h2>
                    <p className="text-gray-600">{job.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(job)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(job._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>{job.type}</span>
                    <span>•</span>
                    <span>{job.salary}</span>
                    <span>•</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {job.category}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Deadline:{" "}
                      {job.deadline
                        ? new Date(job.deadline).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Not set"}
                    </span>
                    <span className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      Vacancy:{" "}
                      {job.vacancy
                        ? `${job.vacancy} ${
                            job.vacancy > 1 ? "positions" : "position"
                          }`
                        : "Not specified"}
                    </span>
                    <span className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Preferred: {job.preferredGender || "Any"}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Requirements:</h3>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {job.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No jobs available at the moment.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Job Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingJob ? "Edit Job" : "Add New Job"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="input-field"
                    >
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      required
                      className="input-field"
                      placeholder="e.g., Technology"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) =>
                        setFormData({ ...formData, deadline: e.target.value })
                      }
                      required
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vacancy
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.vacancy}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vacancy: parseInt(e.target.value),
                        })
                      }
                      required
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Gender
                    </label>
                    <select
                      value={formData.preferredGender}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preferredGender: e.target.value as
                            | "Male"
                            | "Female"
                            | "Any",
                        })
                      }
                      className="input-field"
                    >
                      <option value="Any">Any</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Salary
                    </label>
                    <input
                      type="text"
                      value={formData.salary}
                      onChange={(e) =>
                        setFormData({ ...formData, salary: e.target.value })
                      }
                      required
                      className="input-field"
                      placeholder="e.g., €2,500 - €3,500/month"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requirements (one per line)
                  </label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) =>
                      setFormData({ ...formData, requirements: e.target.value })
                    }
                    required
                    className="input-field min-h-[120px]"
                    placeholder="Enter each requirement on a new line"
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setEditingJob(null);
                      resetForm();
                    }}
                    className="button-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="button-primary">
                    {editingJob ? "Save Changes" : "Add Job"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
