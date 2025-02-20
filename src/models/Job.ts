import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["Full-time", "Part-time", "Contract"],
  },
  salary: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  requirements: {
    type: [String],
    required: true,
  },
  deadline: {
    type: Date,
    required: true,
  },
  vacancy: {
    type: Number,
    required: true,
    min: 1,
  },
  preferredGender: {
    type: String,
    required: true,
    enum: ["Male", "Female", "Any"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Job || mongoose.model("Job", JobSchema);
