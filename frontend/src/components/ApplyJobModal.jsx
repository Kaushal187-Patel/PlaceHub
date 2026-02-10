import { useRef, useState } from "react";
import { FiBriefcase, FiFileText, FiUpload, FiUser } from "react-icons/fi";
import applicationService from "../services/applicationService";
import resumeService from "../services/resumeService";
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
  const [resumeFile, setResumeFile] = useState(null);
  const [useLatestResume, setUseLatestResume] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setExperience("");
    setCurrentJob("");
    setResumeFile(null);
    setUseLatestResume(true);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!validTypes.includes(file.type)) {
        setError("Please upload PDF or Word (DOC/DOCX) only.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("File must be under 10MB.");
        return;
      }
      setResumeFile(file);
      setUseLatestResume(false);
    }
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
    setUseLatestResume(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!experience.trim()) {
      setError("Please select your experience.");
      return;
    }
    if (!job?.id) {
      onError?.(new Error("Invalid job"));
      return;
    }

    setSubmitting(true);
    let resumeId = null;

    try {
      if (resumeFile) {
        try {
          const analyzeRes = await resumeService.analyzeResume(resumeFile);
          if (analyzeRes?.data?.resumeId) resumeId = analyzeRes.data.resumeId;
        } catch (resumeErr) {
          setError(
            `Resume upload failed: ${
              resumeErr.message || "Please try again or use your latest resume."
            }`,
          );
          setSubmitting(false);
          return;
        }
      }

      await applicationService.applyForJobWithDetails(job.id, {
        experience: experience.trim(),
        currentJob: currentJob.trim() || undefined,
        resumeId: resumeId || undefined,
      });

      handleClose();
      onSuccess?.();
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
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useLatestResume && !resumeFile}
                    onChange={(e) => {
                      setUseLatestResume(e.target.checked);
                      if (e.target.checked) handleRemoveFile();
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Use my latest uploaded resume
                  </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Or upload a new resume for this application
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    <FiUpload className="h-4 w-4" />
                    Choose file
                  </button>
                  {resumeFile && (
                    <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <FiFileText className="h-4 w-4" />
                      {resumeFile.name}
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="text-red-500 hover:text-red-600 text-xs"
                      >
                        Remove
                      </button>
                    </span>
                  )}
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
