"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import JobApplicationModal from "./JobApplicationModal";

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

interface Filters {
  type: string[];
  category: string[];
  preferredGender: string[];
  salaryRange: string;
  sortBy: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function AllJobs({ initialJobs }: { initialJobs: Job[] }) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [jobs] = useState<Job[]>(initialJobs);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    type: [],
    category: [],
    preferredGender: [],
    salaryRange: "all",
    sortBy: "newest",
  });

  // Extract unique categories and types for filter options
  const categories = useMemo(
    () => [...new Set(jobs.map((job) => job.category))],
    [jobs]
  );
  const types = useMemo(
    () => [...new Set(jobs.map((job) => job.type))],
    [jobs]
  );

  // Filter and sort jobs based on current filters and search query
  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        // Search filter
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          !searchQuery ||
          job.title.toLowerCase().includes(searchLower) ||
          job.location.toLowerCase().includes(searchLower);

        // Type filter
        const matchesType =
          filters.type.length === 0 || filters.type.includes(job.type);

        // Category filter
        const matchesCategory =
          filters.category.length === 0 ||
          filters.category.includes(job.category);

        // Gender filter
        const matchesGender =
          filters.preferredGender.length === 0 ||
          filters.preferredGender.includes(job.preferredGender);

        // Salary range filter
        let matchesSalary = true;
        if (filters.salaryRange !== "all") {
          const salary = parseInt(job.salary.replace(/[^0-9]/g, "")) || 0;
          switch (filters.salaryRange) {
            case "0-1000":
              matchesSalary = salary <= 1000;
              break;
            case "1000-2000":
              matchesSalary = salary > 1000 && salary <= 2000;
              break;
            case "2000-3000":
              matchesSalary = salary > 2000 && salary <= 3000;
              break;
            case "3000+":
              matchesSalary = salary > 3000;
              break;
          }
        }

        return (
          matchesSearch &&
          matchesType &&
          matchesCategory &&
          matchesGender &&
          matchesSalary
        );
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case "newest":
            return (
              new Date(b.deadline).getTime() - new Date(a.deadline).getTime()
            );
          case "oldest":
            return (
              new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
            );
          case "salary-high":
            return (
              (parseInt(b.salary.replace(/[^0-9]/g, "")) || 0) -
              (parseInt(a.salary.replace(/[^0-9]/g, "")) || 0)
            );
          case "salary-low":
            return (
              (parseInt(a.salary.replace(/[^0-9]/g, "")) || 0) -
              (parseInt(b.salary.replace(/[^0-9]/g, "")) || 0)
            );
          default:
            return 0;
        }
      });
  }, [jobs, searchQuery, filters]);

  const handleFilterChange = (
    filterType: keyof Filters,
    value: string | string[]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: [],
      category: [],
      preferredGender: [],
      salaryRange: "all",
      sortBy: "newest",
    });
    setSearchQuery("");
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-24">
      {/* Header with Search and Filters */}
      <div className="bg-white shadow-sm py-6 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold gradient-text">
                All Available Jobs
              </h1>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <FunnelIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by title, location, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="py-4 space-y-4">
                    {/* Filter Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Job Type Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Job Type
                        </label>
                        <select
                          multiple
                          value={filters.type}
                          onChange={(e) =>
                            handleFilterChange(
                              "type",
                              Array.from(
                                e.target.selectedOptions,
                                (option) => option.value
                              )
                            )
                          }
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {types.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Category Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          multiple
                          value={filters.category}
                          onChange={(e) =>
                            handleFilterChange(
                              "category",
                              Array.from(
                                e.target.selectedOptions,
                                (option) => option.value
                              )
                            )
                          }
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Salary Range Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Salary Range
                        </label>
                        <select
                          value={filters.salaryRange}
                          onChange={(e) =>
                            handleFilterChange("salaryRange", e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">All Ranges</option>
                          <option value="0-1000">€0 - €1,000</option>
                          <option value="1000-2000">€1,000 - €2,000</option>
                          <option value="2000-3000">€2,000 - €3,000</option>
                          <option value="3000+">€3,000+</option>
                        </select>
                      </div>

                      {/* Sort By Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sort By
                        </label>
                        <select
                          value={filters.sortBy}
                          onChange={(e) =>
                            handleFilterChange("sortBy", e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                          <option value="salary-high">Highest Salary</option>
                          <option value="salary-low">Lowest Salary</option>
                        </select>
                      </div>
                    </div>

                    {/* Clear Filters Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5" />
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="container mx-auto px-4 mb-6">
        <p className="text-gray-600">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </p>
      </div>

      {/* Jobs Grid */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredJobs.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 text-lg">
                No jobs match your search criteria. Try adjusting your filters.
              </p>
            </div>
          ) : (
            filteredJobs.map((job, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="relative bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Top Banner */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-violet-600" />

                {/* Job Content */}
                <div className="p-6">
                  {/* Header Section */}
                  <div className="text-center mb-6">
                    <span className="inline-block px-4 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 mb-4">
                      {job.category}
                    </span>
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {job.location}
                    </p>
                  </div>

                  {/* Key Details */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Job Type</p>
                      <p className="font-semibold text-gray-900">{job.type}</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Salary</p>
                      <p className="font-semibold text-gray-900">
                        {job.salary}
                      </p>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm">
                        Deadline:{" "}
                        {new Date(job.deadline).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <span className="text-sm">
                        {job.vacancy}{" "}
                        {job.vacancy > 1 ? "positions" : "position"} available
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="text-sm">
                        Preferred: {job.preferredGender}
                      </span>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Requirements:
                    </h4>
                    <ul className="space-y-2">
                      {job.requirements.map((req, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-gray-700"
                        >
                          <svg
                            className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-sm">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setIsApplicationModalOpen(true);
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white py-3 rounded-xl hover:opacity-90 transition-all duration-300 flex items-center justify-center group"
                  >
                    <span className="font-semibold">Apply Now</span>
                    <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {/* Job Application Modal */}
      <JobApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => {
          setIsApplicationModalOpen(false);
          setSelectedJob(null);
        }}
        jobTitle={selectedJob?.title || ""}
      />
    </main>
  );
}
