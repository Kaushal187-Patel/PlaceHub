import { useState } from "react";
import { FiBriefcase, FiFileText, FiUser } from "react-icons/fi";
import applicationService from "../services/applicationService";
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    ModalTitle,
} from "./ui/Modal";

const EXPERIENCE_OPTIONS = [
  "No experience",
  "Less than 1 year",
  "1–2 years",
  "2–5 years",
  "5–10 years",
  "10+ years",
];

const ApplyJobModal = ({ open, onOpenChange, job, onSuccess, onError }) => {
  const [experience, setExperience] = useState("");
  const [currentJob, setCurrentJob] = useState("");
  const [resumeLink, setResumeLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setExperience("");
    setCurrentJob("");
    setResumeLink("");
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!experience.trim()) {
      setError("Please select your experience.");
      return;
    }
    if (!resumeLink.trim()) {
      setError("Please add your resume Drive link.");
      return;
    }
    if (!job?.id) {
      onError?.(new Error("Invalid job"));
      return;
    }

    setSubmitting(true);

    try {
      const response = await applicationService.applyForJobWithDetails(job.id, {
        experience: experience.trim(),
        currentJob: currentJob.trim() || undefined,
        resumeLink: resumeLink.trim(),
      });

      handleClose();
      onSuccess?.(response);
    } catch (err) {
      onError?.(err);
      console.error("Failed to submit application", err);
      const msg = err.message || "Failed to submit application";
      setError(
        msg.includes("Invalid job ID") || msg.includes("Job not found")
          ? `${msg} Try refreshing the page and apply again.`
          : msg,
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!job) return null;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md">
        <ModalHeader>
          <ModalTitle className="text-gray-900 dark:text-white">
            Apply for {job.title}
          </ModalTitle>
          {job.company && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {job.company}
            </p>
          )}
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Experience (required) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Experience <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select your experience</option>
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Resume upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Resume <span className="text-red-500">*</span>
              </label>
            <div className="space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Paste the public link to your resume from Drive.
              </p>
              <div className="relative">
                <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="url"
                  value={resumeLink}
                  onChange={(e) => setResumeLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            </div>

            {/* Current job (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current job <span className="text-gray-400">(optional)</span>
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={currentJob}
                  onChange={(e) => setCurrentJob(e.target.value)}
                  placeholder="e.g. Software Developer at ABC Corp"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 pt-1">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {submitting && (
                  <span className="h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                )}
                <span>{submitting ? "Submitting…" : "Submit application"}</span>
              </button>
            </div>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ApplyJobModal;
