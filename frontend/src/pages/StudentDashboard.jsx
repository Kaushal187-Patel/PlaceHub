import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiBarChart2,
  FiBell,
  FiBookmark,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiDownload,
  FiEdit,
  FiEye,
  FiFileText,
  FiFilter,
  FiMapPin,
  FiMessageCircle,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiSettings,
  FiStar,
  FiTarget,
  FiTrendingUp,
  FiUpload,
  FiUser,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import ApplyJobModal from "../components/ApplyJobModal";
import applicationService from "../services/applicationService";
import dashboardService from "../services/dashboardService";
import jobService from "../services/jobService";
import resumeService from "../services/resumeService";
import sharedResumeService from "../services/sharedResumeService";
import { getCareerRecommendations } from "../store/slices/careerSlice";

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    profile: null,
    resumeAnalysis: null,
    jobs: [],
    applications: [],
    savedJobs: [],
    savedRecommendations: [],
    notifications: [],
    progressStats: null,
  });
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [jobToApply, setJobToApply] = useState(null);
  const [filters, setFilters] = useState({
    location: "",
    type: "",
    salary: "",
    experience: "",
  });

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { recommendations, isLoading } = useSelector((state) => state.career);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Listen for resume analysis updates from shared service
  useEffect(() => {
    const unsubscribe = sharedResumeService.subscribe((analysis) => {
      console.log("Resume analysis updated via shared service:", analysis);
      if (analysis) {
        const formattedAnalysis =
          sharedResumeService.formatForDashboard(analysis);

        setDashboardData((prev) => ({
          ...prev,
          resumeAnalysis: formattedAnalysis,
          profile: {
            ...prev.profile,
            resumeAnalysis: {
              score: formattedAnalysis.score,
              uploadDate: formattedAnalysis.lastUpdated,
              analysis: analysis,
            },
          },
        }));
      }
    });

    return unsubscribe;
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch core dashboard data
      const dashData = await dashboardService.getDashboardData();

      setDashboardData((prev) => ({
        ...prev,
        profile: dashData.profile,
        applications: dashData.applications,
        savedJobs: dashData.savedJobs,
        resumeAnalysis: dashData.resumeAnalysis,
      }));

      // Fetch additional data
      await Promise.all([
        fetchRecommendations(),
        fetchJobs(),
        fetchApplications(),
        fetchNotifications(),
      ]);

      // Calculate progress stats after other data is loaded
      fetchProgressStats();
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Fallback to individual fetch methods
      await Promise.all([
        fetchProfile(),
        fetchRecommendations(),
        fetchResumeAnalysis(),
        fetchJobs(),
        fetchApplications(),
        fetchNotifications(),
        fetchProgressStats(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/users/me", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();

      if (data.status === "success") {
        setDashboardData((prev) => ({
          ...prev,
          profile: {
            name: data.data.name,
            email: data.data.email,
            profilePicture: null,
            skills: data.data.skills || [],
            education: data.data.education || [],
            experience: data.data.experience || [],
            location: data.data.location || "",
            phone: data.data.phone || "",
            bio: data.data.bio || "",
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Fallback to user data
      setDashboardData((prev) => ({
        ...prev,
        profile: {
          name: user?.name || "Student",
          email: user?.email || "",
          profilePicture: null,
          skills: [],
          education: [],
          experience: [],
          location: "",
          phone: "",
          bio: "",
        },
      }));
    }
  };

  const fetchRecommendations = async () => {
    try {
      // Check if we have career data from recent resume upload
      const latestCareerData = localStorage.getItem("latestCareerData");
      let userData;

      if (latestCareerData) {
        userData = JSON.parse(latestCareerData);
        // Clear after use
        localStorage.removeItem("latestCareerData");
      } else {
        // Use profile data or fallback
        const profile = dashboardData.profile;
        userData = {
          skills:
            profile?.skills?.join(", ") || "JavaScript, React, Node.js, Python",
          interests: "web development, software engineering, AI",
          education:
            profile?.education
              ?.map((edu) => `${edu.degree} in ${edu.field}`)
              .join(", ") || "Bachelor of Computer Science",
          experience: profile?.experience?.length
            ? `${profile.experience.length} positions`
            : "2 years",
          goals: "career growth, remote work, leadership",
        };
      }

      dispatch(getCareerRecommendations(userData));
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const fetchResumeAnalysis = async () => {
    try {
      const response = await resumeService.getLatestResume();
      if (response.status === "success" && response.data.analysis) {
        const analysis = response.data.analysis;

        // Handle both ML service response and fallback response formats
        const score = analysis.similarity_score
          ? Math.round(analysis.similarity_score * 100)
          : analysis.match_percentage || 0;

        const strengths = analysis.suggestions?.dos ||
          analysis.strengths || ["Resume uploaded successfully"];

        const weaknesses = analysis.suggestions?.improvements ||
          analysis.suggestions?.donts ||
          analysis.weaknesses || ["Consider adding more details"];

        const suggestions = analysis.recommendations ||
          analysis.suggestions?.improvements || ["Keep improving your resume"];

        const keywordSuggestions =
          analysis.missing_required_skills || analysis.keywordSuggestions || [];

        const analysisData = {
          score,
          strengths,
          weaknesses,
          suggestions,
          keywordSuggestions,
          lastUpdated: response.data.uploadDate,
          filename: response.data.filename,
        };

        setDashboardData((prev) => ({
          ...prev,
          resumeAnalysis: analysisData,
        }));

        // Update shared service
        sharedResumeService.updateFromDashboard(response.data.analysis);
      }
    } catch (error) {
      console.error("Error fetching resume analysis:", error);
      // Keep empty state if no resume found
      setDashboardData((prev) => ({
        ...prev,
        resumeAnalysis: null,
      }));
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await jobService.getAllJobs();
      if (response.status === "success") {
        const jobsData = response.data
          .map((job) => ({
            id: job.id || job._id,
            title: job.title,
            company: job.company || "Company",
            location: job.location,
            salary:
              job.salaryMin && job.salaryMax
                ? `$${job.salaryMin}k-$${job.salaryMax}k`
                : "Competitive",
            type: job.type,
            matchScore: Math.floor(Math.random() * 20) + 80,
            posted: new Date(job.createdAt).toLocaleDateString(),
            saved: false,
            description: job.description,
            skills: job.skills || [],
          }))
          .filter((job) => job.status !== "closed");

        setDashboardData((prev) => ({
          ...prev,
          jobs: jobsData,
        }));
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const renderJobBoard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Job Board
        </h2>
        <div className="flex items-center space-x-3">
          <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg flex items-center space-x-2">
            <FiFilter className="h-4 w-4" />
            <span>Filters</span>
          </button>
          <button
            onClick={fetchJobs}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FiRefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Job Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search jobs..."
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option>All Locations</option>
            <option>Remote</option>
            <option>New York</option>
            <option>San Francisco</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option>All Types</option>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option>All Experience</option>
            <option>Entry Level</option>
            <option>Mid Level</option>
            <option>Senior Level</option>
          </select>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dashboardData.jobs.map((job) => (
          <div
            key={job.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {job.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {job.company}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <FiMapPin className="h-4 w-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <FiClock className="h-4 w-4 mr-1" />
                    {job.type}
                  </div>
                  <div className="flex items-center">
                    <FiDollarSign className="h-4 w-4 mr-1" />
                    {job.salary}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">
                    {job.matchScore}% match
                  </div>
                  <div className="text-xs text-gray-500">{job.posted}</div>
                </div>
                <button
                  onClick={() => handleSaveJob(job.id)}
                  className={`p-2 rounded-lg ${
                    job.saved
                      ? "text-yellow-500 bg-yellow-50"
                      : "text-gray-400 hover:text-yellow-500"
                  }`}
                >
                  <FiBookmark className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
              {job.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills.slice(0, 4).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{job.skills.length - 4} more
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleApplyJob(job)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Apply Now
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {dashboardData.jobs.length === 0 && (
        <div className="text-center py-12">
          <FiBriefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Jobs Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Check back later for new job opportunities.
          </p>
        </div>
      )}
    </div>
  );

  const fetchApplications = async () => {
    try {
      const response = await applicationService.getMyApplications();
      console.log("Applications response:", response);

      if (response.status === "success") {
        const applications = response.data.map((app) => {
          console.log("Processing application:", app);
          return {
            id: app._id,
            jobTitle: app.job?.title || "Job Title Not Available",
            company: app.job?.company || "Company Not Available",
            location: app.job?.location || "Location Not Available",
            salary:
              app.job?.salaryMin && app.job?.salaryMax
                ? `$${app.job.salaryMin}k-$${app.job.salaryMax}k`
                : "Salary Not Specified",
            type: app.job?.type || "Type Not Specified",
            appliedDate: new Date(app.createdAt).toLocaleDateString(),
            status: app.status || "pending",
            lastUpdate: new Date(
              app.updatedAt || app.createdAt,
            ).toLocaleDateString(),
            coverLetter: app.coverLetter || "",
            jobId: app.job?._id,
          };
        });

        console.log("Processed applications:", applications);
        setDashboardData((prev) => ({
          ...prev,
          applications,
        }));
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      setDashboardData((prev) => ({
        ...prev,
        applications: [],
      }));
    }
  };

  const renderApplications = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Applications
        </h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchApplications}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FiRefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setActiveTab("jobs")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FiPlus className="h-4 w-4" />
            <span>Find More Jobs</span>
          </button>
        </div>
      </div>

      {dashboardData.applications.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Job Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Update
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {dashboardData.applications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {app.jobTitle}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {app.company}
                        </div>
                        <div className="text-xs text-gray-400">
                          {app.location} • {app.type}
                        </div>
                        <div className="text-xs text-green-600">
                          {app.salary}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {app.appliedDate}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          app.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : app.status === "reviewed"
                            ? "bg-blue-100 text-blue-800"
                            : app.status === "shortlisted"
                            ? "bg-green-100 text-green-800"
                            : app.status === "interview"
                            ? "bg-purple-100 text-purple-800"
                            : app.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : app.status === "hired"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {app.lastUpdate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-sm border text-center">
          <FiBriefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Applications Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start applying to jobs that match your skills and interests.
          </p>
          <button
            onClick={() => setActiveTab("jobs")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto"
          >
            <FiSearch className="h-5 w-5" />
            <span>Browse Jobs</span>
          </button>
        </div>
      )}
    </div>
  );

  const fetchNotifications = async () => {
    try {
      // Replace with real API call
      setDashboardData((prev) => ({
        ...prev,
        notifications: [
          {
            id: 1,
            type: "job_match",
            title: "New Job Match",
            message:
              "Frontend Developer at Tech Corp matches your profile (92% match)",
            time: "2 hours ago",
            read: false,
          },
          {
            id: 2,
            type: "application_update",
            title: "Application Update",
            message:
              "Your application for Full Stack Developer has been shortlisted",
            time: "1 day ago",
            read: false,
          },
          {
            id: 3,
            type: "interview",
            title: "Interview Scheduled",
            message: "Interview scheduled for StartupXYZ on Jan 20, 2024",
            time: "2 days ago",
            read: true,
          },
        ],
      }));
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchProgressStats = async () => {
    try {
      const applications = dashboardData.applications || [];
      const resumeScore = dashboardData.resumeAnalysis?.score || 0;
      const skills = dashboardData.profile?.skills || [];

      setDashboardData((prev) => ({
        ...prev,
        progressStats: {
          totalApplications: applications.length,
          interviewCalls: applications.filter(
            (app) => app.status === "interview",
          ).length,
          jobOffers: applications.filter((app) => app.status === "accepted")
            .length,
          profileViews: Math.floor(Math.random() * 100) + 20, // Mock data
          resumeScore,
          skillsCount: skills.length,
          monthlyApplications: [2, 4, 6, 3, 8, 5, 7], // Mock data
          skillProgress: skills.reduce((acc, skill) => {
            acc[skill] = Math.floor(Math.random() * 40) + 60; // Mock progress
            return acc;
          }, {}),
        },
      }));
    } catch (error) {
      console.error("Error calculating progress stats:", error);
    }
  };

  const handleSaveJob = async (jobId) => {
    try {
      // API call to save job
      setDashboardData((prev) => ({
        ...prev,
        jobs: prev.jobs.map((job) =>
          job.id === jobId ? { ...job, saved: !job.saved } : job,
        ),
        savedJobs: prev.jobs.filter((job) => job.saved || job.id === jobId),
      }));
    } catch (error) {
      console.error("Error saving job:", error);
    }
  };

  const handleApplyJob = (job) => {
    if (!job?.id) {
      alert("Invalid job. Please try again.");
      return;
    }
    setJobToApply(job);
    setApplyModalOpen(true);
  };

  const handleApplySuccess = () => {
    if (!jobToApply?.id) return;
    const newApplication = {
      id: jobToApply.id,
      jobTitle: jobToApply?.title,
      company: jobToApply?.company,
      appliedDate: new Date().toISOString().split("T")[0],
      status: "pending",
      lastUpdate: new Date().toISOString().split("T")[0],
    };
    setDashboardData((prev) => ({
      ...prev,
      applications: [newApplication, ...prev.applications],
    }));
    setJobToApply(null);
    alert("Application submitted successfully!");
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: FiTrendingUp },
    { id: "recommendations", label: "Career Recommendations", icon: FiTarget },
    { id: "resume", label: "Resume Analysis", icon: FiFileText },
    { id: "jobs", label: "Job Board", icon: FiBriefcase },
    { id: "applications", label: "My Applications", icon: FiCheckCircle },
    { id: "saved", label: "Saved Items", icon: FiBookmark },
    { id: "progress", label: "Career Progress", icon: FiBarChart2 },
    { id: "chat", label: "AI Mentor", icon: FiMessageCircle },
    { id: "settings", label: "Settings", icon: FiSettings },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            {dashboardData.profile?.profilePicture ? (
              <img
                src={dashboardData.profile.profilePicture}
                alt="Profile"
                className="h-16 w-16 rounded-full"
              />
            ) : (
              <FiUser className="h-8 w-8" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {dashboardData.profile?.name}!
            </h1>
            <p className="opacity-90">Ready to advance your career today?</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab("recommendations")}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
          >
            Get Career Advice
          </button>
          <button
            onClick={() => setActiveTab("jobs")}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
          >
            Find Jobs
          </button>
          <button
            onClick={() => setActiveTab("resume")}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
          >
            Analyze Resume
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Applications
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.applications.length}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <FiBriefcase className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Resume Score
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.profile?.resumeAnalysis?.score || 0}%
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <FiFileText className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Job Matches
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.jobs.length}
              </p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
              <FiTarget className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Saved Jobs
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.savedJobs.length}
              </p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
              <FiBookmark className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Applications
            </h3>
            <button
              onClick={() => setActiveTab("applications")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {dashboardData.applications.slice(0, 3).map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {app.jobTitle}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {app.company}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    app.status === "interview"
                      ? "bg-green-100 text-green-800"
                      : app.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : app.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Career Recommendations Preview */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Career Recommendations
            </h3>
            <button
              onClick={() => setActiveTab("recommendations")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recommendations.slice(0, 3).map((rec, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {rec.career}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {rec.match_percentage}% match
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">
                    ${rec.salary_range?.min?.toLocaleString()} - $
                    {rec.salary_range?.max?.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderResumeAnalysis = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Resume Analysis
        </h2>
        <button
          onClick={() => (window.location.href = "/resume-analyzer")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <FiUpload className="h-4 w-4" />
          <span>Upload New Resume</span>
        </button>
      </div>

      {dashboardData.profile?.resumeAnalysis ? (
        <div className="space-y-6">
          {/* Resume Score Overview */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Latest Resume Analysis
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Uploaded:{" "}
                {dashboardData.profile?.resumeAnalysis?.uploadDate
                  ? new Date(
                      dashboardData.profile.resumeAnalysis.uploadDate,
                    ).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Score */}
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {dashboardData.profile?.resumeAnalysis?.score || 0}%
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  Overall Score
                </p>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${
                        dashboardData.profile?.resumeAnalysis?.score || 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Strengths */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <FiCheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  Strengths
                </h4>
                <ul className="space-y-2">
                  {(
                    dashboardData.profile?.resumeAnalysis?.strengths || [
                      "Resume uploaded successfully",
                    ]
                  )
                    .slice(0, 3)
                    .map((strength, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-600 dark:text-gray-400 flex items-start"
                      >
                        <span className="text-green-600 mr-2">✓</span>
                        {strength}
                      </li>
                    ))}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <FiAlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  Improvements
                </h4>
                <ul className="space-y-2">
                  {(
                    dashboardData.profile?.resumeAnalysis?.weaknesses || [
                      "Consider adding more details",
                    ]
                  )
                    .slice(0, 3)
                    .map((weakness, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-600 dark:text-gray-400 flex items-start"
                      >
                        <span className="text-yellow-600 mr-2">!</span>
                        {weakness}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Detailed Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Suggestions */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recommendations
              </h4>
              <ul className="space-y-3">
                {(
                  dashboardData.profile?.resumeAnalysis?.suggestions || [
                    "Keep improving your resume",
                  ]
                )
                  .slice(0, 5)
                  .map((suggestion, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-600 dark:text-gray-400 flex items-start"
                    >
                      <FiTarget className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      {suggestion}
                    </li>
                  ))}
              </ul>
            </div>

            {/* Keyword Suggestions */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Missing Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {(
                  dashboardData.profile?.resumeAnalysis?.keywordSuggestions ||
                  []
                )
                  .slice(0, 8)
                  .map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {keyword}
                    </span>
                  ))}
              </div>
              {dashboardData.profile?.resumeAnalysis?.extractedSkills?.length >
                0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Skills Found:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {dashboardData.profile.resumeAnalysis.extractedSkills
                      .slice(0, 6)
                      .map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                Consider adding these keywords to improve your resume's
                visibility.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => (window.location.href = "/resume-analyzer")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
            >
              <FiEdit className="h-4 w-4" />
              <span>Analyze New Resume</span>
            </button>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg flex items-center space-x-2">
              <FiDownload className="h-4 w-4" />
              <span>Download Report</span>
            </button>
          </div>
        </div>
      ) : (
        /* No Resume State */
        <div className="bg-white dark:bg-gray-800 p-12 rounded-lg shadow-sm border text-center">
          <FiFileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Resume Uploaded
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Upload your resume to get AI-powered analysis with personalized
            feedback, optimization tips, and keyword suggestions to improve your
            job prospects.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => (window.location.href = "/resume-analyzer")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 justify-center"
            >
              <FiUpload className="h-5 w-5" />
              <span>Upload & Analyze Resume</span>
            </button>
            <button
              onClick={() => (window.location.href = "/resume-analyzer")}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg flex items-center space-x-2 justify-center"
            >
              <FiEye className="h-5 w-5" />
              <span>View Resume Analyzer</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          AI Career Recommendations
        </h2>
        <button
          onClick={fetchRecommendations}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <FiRefreshCw
            className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          <span>Refresh Recommendations</span>
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Generating personalized recommendations...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {recommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {rec.career}
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {rec.match_percentage}%
                    </div>
                    <div className="text-xs text-gray-500">Match Score</div>
                  </div>
                  <button className="text-yellow-500 hover:text-yellow-600">
                    <FiStar className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Salary Range
                  </h4>
                  <p className="text-green-600 font-semibold">
                    ${rec.salary_range?.min?.toLocaleString()} - $
                    {rec.salary_range?.max?.toLocaleString()}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Industries
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {rec.industries?.map((industry, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
                      >
                        {industry}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Your Strengths
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {rec.matched_required_skills
                      ?.slice(0, 3)
                      .map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Skills to Develop
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {rec.missing_required_skills
                      ?.slice(0, 3)
                      .map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded"
                        >
                          {skill}
                        </span>
                      ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-3">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                    View Details
                  </button>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg">
                    <FiBookmark className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "recommendations":
        return renderRecommendations();
      case "resume":
        return renderResumeAnalysis();
      case "jobs":
        return renderJobBoard();
      case "applications":
        return renderApplications();
      case "saved":
        return (
          <div className="text-center py-12 text-gray-500">
            Saved Items - Coming Soon
          </div>
        );
      case "progress":
        return (
          <div className="text-center py-12 text-gray-500">
            Career Progress - Coming Soon
          </div>
        );
      case "chat":
        return (
          <div className="text-center py-12 text-gray-500">
            AI Mentor Chat - Coming Soon
          </div>
        );
      case "settings":
        return (
          <div className="text-center py-12 text-gray-500">
            Settings - Coming Soon
          </div>
        );
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Student Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Welcome, {user?.name}
            </p>
          </div>

          {/* Notifications */}
          <div className="px-6 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <FiBell className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {dashboardData.notifications.filter((n) => !n.read).length}{" "}
                  new notifications
                </span>
              </div>
            </div>
          </div>

          <nav className="mt-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                <tab.icon className="h-5 w-5 mr-3" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">{renderContent()}</div>
      </div>

      <ApplyJobModal
        open={applyModalOpen}
        onOpenChange={setApplyModalOpen}
        job={jobToApply}
        onSuccess={handleApplySuccess}
      />
    </div>
  );
};

export default StudentDashboard;
