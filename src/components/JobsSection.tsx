"use client";

import { motion } from "framer-motion";
import {
  MapPinIcon,
  BriefcaseIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  postedDate: string;
}

interface JobsSectionProps {
  jobs: Job[];
}

export default function JobsSection({ jobs }: JobsSectionProps) {
  return (
    <section id="jobs" className="section-padding bg-gray-50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Available <span className="gradient-text">Positions</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our current job openings and find your next international
            career opportunity
          </p>
        </motion.div>

        <div className="grid gap-6">
          {jobs.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <BriefcaseIcon className="w-5 h-5" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-5 h-5" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CurrencyDollarIcon className="w-5 h-5" />
                      <span>{job.salary}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    Posted {job.postedDate}
                  </span>
                  <button className="button-primary">Apply Now</button>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-gray-600 mb-4">{job.description}</p>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Requirements:</h4>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {job.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {job.type.split(",").map((type, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {type.trim()}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
