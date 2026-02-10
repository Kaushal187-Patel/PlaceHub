import { motion } from "framer-motion";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiFileText,
  FiTrendingUp,
  FiUpload,
  FiXCircle,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import sharedResumeService from "../services/sharedResumeService";
import { analyzeResume } from "../store/slices/careerSlice";

const ResumeAnalyzer = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedJobRole, setSelectedJobRole] = useState("Software Developer");
  const dispatch = useDispatch();
  const { analysis, isLoading, isError, message } = useSelector(
    (state) => state.career,
  );

  const jobRoles = [
    "Software Developer",
    "Data Scientist",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "UX Designer",
    "DevOps Engineer",
    "Product Manager",
    "Cybersecurity Specialist",
    "Mobile Developer",
    "Data Engineer",
    "QA Engineer",
    "Business Analyst",
  ];

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);

      console.log("Uploading file:", file.name, "Size:", file.size);

      // Dispatch the analysis with the file
      dispatch(
        analyzeResume({
          file: file,
          job_role: selectedJobRole,
        }),
      ).then((result) => {
        // Update shared service with analysis result
        if (result.payload) {
          sharedResumeService.updateFromAnalyzer(result.payload);
        }
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB limit
  });

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-green-50 dark:bg-green-900/20";
    if (score >= 60) return "bg-yellow-50 dark:bg-yellow-900/20";
    return "bg-red-50 dark:bg-red-900/20";
  };

  const handleJobRoleChange = (role) => {
    setSelectedJobRole(role);
    if (uploadedFile) {
      // Re-analyze with new job role
      dispatch(
        analyzeResume({
          file: uploadedFile,
          job_role: role,
        }),
      ).then((result) => {
        // Update shared service with analysis result
        if (result.payload) {
          sharedResumeService.updateFromAnalyzer(result.payload);
        }
      });
    }
  };

  const clearAnalysis = () => {
    setUploadedFile(null);
    dispatch({ type: "career/reset" });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Resume Analyzer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Upload your resume and get detailed analysis, skill assessment, and
            improvement suggestions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Upload Resume
              </h2>

              {/* Job Role Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Job Role
                </label>
                <select
                  value={selectedJobRole}
                  onChange={(e) => handleJobRoleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {jobRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Upload */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
              >
                <input {...getInputProps()} />
                {uploadedFile ? (
                  <div className="space-y-2">
                    <FiFileText className="h-12 w-12 text-green-600 mx-auto" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearAnalysis();
                      }}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-300"
                    >
                      <FiXCircle className="h-4 w-4 mr-1" />
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <FiUpload className="h-12 w-12 text-gray-400 mx-auto" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {isDragActive
                        ? "Drop the file here"
                        : "Drag & drop a resume file"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PDF, DOC, or DOCX (max 10MB)
                    </p>
                  </div>
                )}
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500 hover:bg-blue-400 transition ease-in-out duration-150 cursor-not-allowed">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Analyzing Resume...
                  </div>
                </div>
              )}

              {/* Error State */}
              {isError && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <div className="flex">
                    <FiAlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                        Analysis failed
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        {message ||
                          "Please try uploading a different file or check the file format."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Analysis Results */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Analysis Results
              </h2>

              {!analysis ? (
                <div className="text-center py-12">
                  <FiTrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Upload your resume to see detailed analysis and
                    recommendations
                  </p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* Overall Score */}
                  <div
                    className={`p-4 rounded-lg ${getScoreBgColor(
                      analysis.score,
                    )}`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Overall Score
                      </h3>
                      <span
                        className={`text-2xl font-bold ${getScoreColor(
                          analysis.match_percentage || 75,
                        )}`}
                      >
                        {Math.round(analysis.match_percentage || 75)}/100
                      </span>
                    </div>
                    <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          (analysis.match_percentage || 75) >= 80
                            ? "bg-green-600"
                            : (analysis.match_percentage || 75) >= 60
                            ? "bg-yellow-600"
                            : "bg-red-600"
                        }`}
                        style={{ width: `${analysis.match_percentage || 75}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Experience Level */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Experience Level
                    </h3>
                    <p className="text-blue-700 dark:text-blue-300">
                      {analysis.analysis_summary?.experience_level ||
                        (typeof analysis.experience_years === "number"
                          ? `${analysis.experience_years} year${
                              analysis.experience_years === 1 ? "" : "s"
                            }`
                          : "Experience not detected from resume")}
                    </p>
                  </div>

                  {/* Identified Skills */}
                  {analysis.extracted_skills &&
                    analysis.extracted_skills.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <FiCheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          Identified Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {analysis.extracted_skills.map((skill, index) => (
                            <span
                              key={index}
                              className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Recommendations */}
                  {analysis.recommendations &&
                    analysis.recommendations.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <FiCheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                          Recommendations
                        </h3>
                        <ul className="space-y-2">
                          {analysis.recommendations.map(
                            (recommendation, index) => (
                              <li
                                key={index}
                                className="flex items-start text-gray-700 dark:text-gray-300"
                              >
                                <span className="text-blue-600 mr-2">✓</span>
                                {recommendation}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                  {/* Improvement Suggestions */}
                  {analysis.suggestions && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Resume Improvement Guide
                      </h3>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Do's */}
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <h4 className="text-lg font-medium text-green-800 dark:text-green-200 mb-3 flex items-center">
                            <FiCheckCircle className="h-5 w-5 mr-2" />
                            What to DO
                          </h4>
                          <ul className="space-y-2">
                            {analysis.suggestions.dos?.map((item, index) => (
                              <li
                                key={index}
                                className="flex items-start text-green-700 dark:text-green-300 text-sm"
                              >
                                <span className="text-green-600 mr-2 mt-1">
                                  ✓
                                </span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Don'ts */}
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <h4 className="text-lg font-medium text-red-800 dark:text-red-200 mb-3 flex items-center">
                            <FiXCircle className="h-5 w-5 mr-2" />
                            What NOT to DO
                          </h4>
                          <ul className="space-y-2">
                            {analysis.suggestions.donts?.map((item, index) => (
                              <li
                                key={index}
                                className="flex items-start text-red-700 dark:text-red-300 text-sm"
                              >
                                <span className="text-red-600 mr-2 mt-1">
                                  ✗
                                </span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Priority Improvements */}
                      {analysis.suggestions.improvements && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h4 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-3 flex items-center">
                            <FiTrendingUp className="h-5 w-5 mr-2" />
                            Priority Improvements
                          </h4>
                          <ul className="space-y-2">
                            {analysis.suggestions.improvements.map(
                              (item, index) => (
                                <li
                                  key={index}
                                  className="flex items-start text-blue-700 dark:text-blue-300 text-sm"
                                >
                                  <span className="text-blue-600 mr-2 mt-1">
                                    →
                                  </span>
                                  {item}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Missing Skills */}
                  {(analysis.missing_required_skills?.length > 0 ||
                    analysis.missing_preferred_skills?.length > 0) && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <FiAlertCircle className="h-5 w-5 text-orange-600 mr-2" />
                        Missing Skills
                      </h3>
                      {analysis.missing_required_skills?.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                            Required Skills:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {analysis.missing_required_skills.map(
                              (skill, index) => (
                                <span
                                  key={index}
                                  className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-sm"
                                >
                                  {skill}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                      {analysis.missing_preferred_skills?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                            Preferred Skills:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {analysis.missing_preferred_skills.map(
                              (skill, index) => (
                                <span
                                  key={index}
                                  className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full text-sm"
                                >
                                  {skill}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Identified Skills */}
                  {analysis.skills_found &&
                    analysis.skills_found.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Identified Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {analysis.skills_found.map((skill, index) => (
                            <span
                              key={index}
                              className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Skill Categories */}
                  {analysis.skill_categories &&
                    Object.keys(analysis.skill_categories).length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Skills by Category
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(analysis.skill_categories).map(
                            ([category, skills]) => (
                              <div
                                key={category}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                              >
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  {category}
                                </h4>
                                <div className="flex flex-wrap gap-1">
                                  {skills.map((skill, index) => (
                                    <span
                                      key={index}
                                      className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {/* Analysis Summary */}
                  {analysis.analysis_summary && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Analysis Summary
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Skill Match:
                          </span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {analysis.analysis_summary.skill_match}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Experience Level:
                          </span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {analysis.analysis_summary.experience_level}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Overall Rating:
                          </span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {analysis.analysis_summary.overall_rating}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Recommendation:
                          </span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {analysis.analysis_summary.recommendation}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
