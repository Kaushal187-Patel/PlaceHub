import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FiActivity,
  FiBarChart2,
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiClock,
  FiCreditCard,
  FiDownload,
  FiEye,
  FiFileText,
  FiMessageSquare,
  FiPlus,
  FiSearch,
  FiSettings,
  FiStar,
  FiTrash2,
  FiTrendingUp,
  FiUser,
  FiUsers,
  FiX,
  FiXCircle,
  FiZap,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import JobDeadlineExtension from "../components/JobDeadlineExtension";
import applicationService from "../services/applicationService";
import jobService from "../services/jobService";

const RecruiterDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [showExtensionPopup, setShowExtensionPopup] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    title: "",
    description: "",
    location: "",
    type: "Full-time",
    salaryMin: "",
    salaryMax: "",
    experience: "Entry Level",
    skills: [],
    requirements: "",
    benefits: "",
    visibility: "public",
    applicationDeadline: "",
  });
  const { user } = useSelector((state) => state.auth);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [jobsError, setJobsError] = useState(null);
  const [applicationsError, setApplicationsError] = useState(null);

  const [dashboardData, setDashboardData] = useState({
    stats: {
      activeJobs: 0,
      totalApplications: 0,
      shortlisted: 0,
      hired: 0,
      avgTimeToHire: 0,
      responseRate: 0,
    },
    jobs: [],
    applications: [],
    candidates: [
      {
        id: 1,
        name: "Alex Chen",
        title: "Full Stack Developer",
        skills: ["React", "Python", "AWS"],
        experience: "4 years",
        location: "Remote",
        available: true,
      },
    ],
    notifications: [
      {
        id: 1,
        type: "application",
        message: "New application for Senior React Developer",
        time: "2 minutes ago",
        read: false,
      },
      {
        id: 2,
        type: "interview",
        message: "Interview scheduled with Sarah Johnson",
        time: "1 hour ago",
        read: false,
      },
    ],
  });

  const tabs = [
    { id: "overview", label: "Overview", icon: FiTrendingUp },
    { id: "jobs", label: "Job Management", icon: FiBriefcase },
    { id: "applicants", label: "Applicant Tracking", icon: FiUsers },
    { id: "candidates", label: "Talent Search", icon: FiSearch },
    { id: "analytics", label: "Analytics & Reports", icon: FiBarChart2 },
    { id: "messages", label: "Communication", icon: FiMessageSquare },
    { id: "profile", label: "Profile & Team", icon: FiUser },
    { id: "billing", label: "Billing & Plans", icon: FiCreditCard },
    { id: "settings", label: "Settings", icon: FiSettings },
  ];

  const fetchApplications = async () => {
    setApplicationsLoading(true);
    setApplicationsError(null);
    try {
      const response = await applicationService.getApplications();
      const list = Array.isArray(response?.data) ? response.data : [];
      if (response?.status === "success") {
        const apps = list.map((app) => {
          return {
            id: app.id,
            candidateName: app.user?.name ?? "—",
            email: app.user?.email ?? "—",
            jobTitle: app.job?.title ?? "—",
            jobId: app.job?.id,
            appliedDate: app.createdAt
              ? new Date(app.createdAt).toLocaleDateString()
              : "—",
            status: app.status ?? "pending",
            skills: Array.isArray(app.job?.skills)
              ? app.job.skills
              : app.job?.skills
              ? [app.job.skills]
              : [],
            experience: "—",
            location: app.job?.location ?? "—",
            resumeId: app.resumeId || app.resume?.id || null,
            resume: app.resume || null,
            resumeUrl: app.resume?.filePath
              ? `/api/resume/${app.resume.id}`
              : null,
            resumeFilename:
              app.resume?.originalName || app.resume?.filename || null,
          };
        });
        const shortlisted = apps.filter(
          (a) => a.status === "shortlisted",
        ).length;
        const hired = apps.filter((a) => a.status === "hired").length;
        setDashboardData((prev) => ({
          ...prev,
          applications: apps,
          stats: {
            ...prev.stats,
            totalApplications: apps.length,
            shortlisted,
            hired,
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplicationsError(
        error.response?.status === 403
          ? "Applicant data is only available for recruiters. Please sign in with a recruiter account."
          : error.message || "Failed to load applications.",
      );
      setDashboardData((prev) => ({ ...prev, applications: [] }));
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleBulkAction = async (action) => {
    const status = action === "shortlist" ? "shortlisted" : "rejected";
    try {
      for (const id of selectedApplicants) {
        await applicationService.updateApplicationStatus(id, status);
      }
      setSelectedApplicants([]);
      await fetchApplications();
    } catch (error) {
      console.error(`Bulk ${action} error:`, error);
      alert("Failed to update some applications: " + error.message);
    }
  };

  const handleApplicationStatusChange = async (applicationId, newStatus) => {
    try {
      await applicationService.updateApplicationStatus(
        applicationId,
        newStatus,
      );
      setDashboardData((prev) => ({
        ...prev,
        applications: prev.applications.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app,
        ),
      }));
    } catch (error) {
      console.error("Error updating application status:", error);
      alert("Failed to update status: " + error.message);
    }
  };

  const handleViewResume = async (application) => {
    console.log("View resume clicked:", {
      applicationId: application.id,
      resumeId: application.resumeId,
      resume: application.resume,
      resumeIdFromResume: application.resume?.id,
      candidateEmail: application.email,
      fullApplication: application,
    });

    // Try multiple ways to get resumeId
    const resumeId =
      application.resumeId ||
      application.resume?.id ||
      (application.resume &&
        typeof application.resume === "object" &&
        application.resume.id) ||
      null;

    // Also check if resume object exists but id might be in a different format
    if (!resumeId && application.resume) {
      console.warn("Resume object exists but no ID found:", application.resume);
      // Try to extract ID from resume object keys
      const possibleId =
        application.resume.id ||
        application.resume.resumeId ||
        application.resume._id;
      if (possibleId) {
        console.log("Found resume ID from resume object:", possibleId);
        // Continue with this ID
        const finalResumeId = possibleId;
        // Proceed with download using finalResumeId
        try {
          const userStr = localStorage.getItem("user");
          const user = userStr ? JSON.parse(userStr) : null;
          const token = user?.token;

          if (!token) {
            alert("Please log in to view resumes.");
            return;
          }

          const response = await fetch(`/api/resume/${finalResumeId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download =
              application.resumeFilename ||
              application.resume?.originalName ||
              application.resume?.filename ||
              `resume_${application.candidateName || "candidate"}.pdf`;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            return;
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error("Resume download error:", errorData);
            alert(
              errorData.message ||
                "Resume not available. The file may have been removed from the server.",
            );
            return;
          }
        } catch (error) {
          console.error("Error viewing resume:", error);
          alert("Failed to load resume. Please try again or contact support.");
          return;
        }
      }
    }

    if (!resumeId) {
      console.error("No resume ID found. Application data:", {
        resumeId: application.resumeId,
        resume: application.resume,
        hasResumeObject: !!application.resume,
      });
      alert(
        "No resume available for this application. The candidate may not have uploaded a resume when applying.",
      );
      return;
    }

    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const token = user?.token;

      if (!token) {
        alert("Please log in to view resumes.");
        return;
      }

      const response = await fetch(`/api/resume/${resumeId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download =
          application.resumeFilename ||
          application.resume?.originalName ||
          `resume_${application.candidateName || "candidate"}.pdf`;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Resume download error:", errorData);
        alert(
          errorData.message ||
            "Resume not available. The file may have been removed from the server.",
        );
      }
    } catch (error) {
      console.error("Error viewing resume:", error);
      alert("Failed to load resume. Please try again or contact support.");
    }
  };

  const handleShortlist = async (applicationId) => {
    await handleApplicationStatusChange(applicationId, "shortlisted");
  };

  const handleScheduleInterview = async (applicationId) => {
    await handleApplicationStatusChange(applicationId, "interview");
  };

  const handleSendMessage = (application) => {
    alert(
      `Messaging feature coming soon! Contact ${
        application.email || application.candidateName
      }`,
    );
  };

  const handleReject = async (applicationId) => {
    if (window.confirm("Are you sure you want to reject this application?")) {
      await handleApplicationStatusChange(applicationId, "rejected");
    }
  };

  const handleJobFormChange = (e) => {
    const { name, value } = e.target;
    setJobFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value
      .split(",")
      .map((skill) => skill.trim())
      .filter((skill) => skill);
    setJobFormData((prev) => ({
      ...prev,
      skills,
    }));
  };

  const fetchJobs = async () => {
    setJobsLoading(true);
    setJobsError(null);
    try {
      const response = await jobService.getMyJobs();
      const list = Array.isArray(response?.data) ? response.data : [];
      if (response?.status === "success") {
        const jobs = list.map((job) => ({
          ...job,
          id: job.id || job._id,
          salary:
            job.salaryMin && job.salaryMax
              ? `$${job.salaryMin}k-$${job.salaryMax}k`
              : "Competitive",
          posted: job.createdAt
            ? new Date(job.createdAt).toLocaleDateString()
            : "—",
          applications: job.applications?.length ?? 0,
          views: job.views ?? 0,
        }));

        setDashboardData((prev) => ({
          ...prev,
          jobs,
          stats: {
            ...prev.stats,
            activeJobs: jobs.filter((j) => j.status === "active").length,
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobsError(
        error.response?.status === 403
          ? "Jobs are only available for recruiters. Please sign in with a recruiter account."
          : error.message || "Failed to load jobs.",
      );
      setDashboardData((prev) => ({ ...prev, jobs: [] }));
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchApplications();
    checkExtensionRequired();
  }, []);

  const checkExtensionRequired = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/jobs/extension-required", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.status === "success" && data.data.length > 0) {
        setShowExtensionPopup(true);
      }
    } catch (error) {
      console.error("Error checking extension requirements:", error);
    }
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await jobService.createJob(jobFormData);

      if (response.status === "success") {
        setJobFormData({
          title: "",
          description: "",
          location: "",
          type: "Full-time",
          salaryMin: "",
          salaryMax: "",
          experience: "Entry Level",
          skills: [],
          requirements: "",
          benefits: "",
          visibility: "public",
          applicationDeadline: "",
        });
        setShowJobForm(false);

        // Refresh jobs list
        await fetchJobs();
        alert("Job posted successfully!");
      }
    } catch (error) {
      console.error("Error posting job:", error);
      alert("Failed to post job: " + error.message);
    }
  };

  const handleCloseJob = async (jobId) => {
    try {
      await jobService.closeJob(jobId);
      await fetchJobs();
      alert("Job closed successfully!");
    } catch (error) {
      console.error("Error closing job:", error);
      alert("Failed to close job: " + error.message);
    }
  };

  const handleToggleJobStatus = async (jobId) => {
    try {
      await jobService.toggleJobStatus(jobId);
      await fetchJobs();
    } catch (error) {
      console.error("Error toggling job status:", error);
      alert("Failed to update job status: " + error.message);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this job? This action cannot be undone.",
      )
    ) {
      try {
        await jobService.deleteJob(jobId);
        await fetchJobs();
        alert("Job deleted successfully!");
      } catch (error) {
        console.error("Error deleting job:", error);
        alert("Failed to delete job: " + error.message);
      }
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="opacity-90">
          Here's what's happening with your recruitment activities
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Jobs
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.stats.activeJobs}
              </p>
              <p className="text-xs text-green-600">+2 this week</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <FiBriefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Applications
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.stats.totalApplications}
              </p>
              <p className="text-xs text-green-600">+15 this week</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <FiUsers className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Avg. Time to Hire
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.stats.avgTimeToHire} days
              </p>
              <p className="text-xs text-red-600">+2 days</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
              <FiClock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Response Rate
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData.stats.responseRate}%
              </p>
              <p className="text-xs text-green-600">+5% this month</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
              <FiActivity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => {
            setActiveTab("jobs");
            setShowJobForm(true);
          }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <FiPlus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Post New Job
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create a new job posting
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("candidates")}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <FiSearch className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Search Talent
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Find qualified candidates
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
              <FiBarChart2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                View Analytics
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track performance metrics
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Applications
            </h3>
            <button
              onClick={() => setActiveTab("applicants")}
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
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {app.candidateName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {app.candidateName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {app.jobTitle}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">{app.appliedDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Job Performance */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Performing Jobs
            </h3>
            <button
              onClick={() => setActiveTab("jobs")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {dashboardData.jobs.slice(0, 3).map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {job.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {job.views ?? 0} views • {job.applications ?? 0}{" "}
                    applications
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-blue-600">
                    {job.views
                      ? `${Math.round(
                          ((job.applications ?? 0) / job.views) * 100,
                        )}%`
                      : "0%"}{" "}
                    conversion
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderJobManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Job Management
        </h2>
        <div className="flex items-center space-x-3">
          <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <FiDownload className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("jobs");
              setShowJobForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FiPlus className="h-4 w-4" />
            <span>Post New Job</span>
          </button>
        </div>
      </div>

      {/* Job Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4">
          <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option>All Status</option>
            <option>Active</option>
            <option>Paused</option>
            <option>Closed</option>
            <option>Draft</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option>All Locations</option>
            <option>Remote</option>
            <option>New York</option>
            <option>San Francisco</option>
            <option>London</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option>All Types</option>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Internship</option>
          </select>
          <input
            type="text"
            placeholder="Search jobs..."
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex-1 min-w-0"
          />
        </div>
      </div>

      {/* Jobs List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {jobsLoading && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Loading jobs…
          </div>
        )}
        {jobsError && !jobsLoading && (
          <div className="p-6 text-center">
            <p className="text-red-600 dark:text-red-400 mb-2">{jobsError}</p>
            <button
              type="button"
              onClick={() => fetchJobs()}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Try again
            </button>
          </div>
        )}
        {!jobsLoading && !jobsError && dashboardData.jobs.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <FiBriefcase className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No jobs yet. Post your first job to get started.</p>
            <button
              type="button"
              onClick={() => setShowJobForm(true)}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Post a job
            </button>
          </div>
        )}
        {!jobsLoading && !jobsError && dashboardData.jobs.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Job Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Posted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {dashboardData.jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {job.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {job.location} • {job.type} • {job.salary}
                        </div>
                        {job.applicationDeadline && (
                          <div className="text-xs text-orange-600 mt-1">
                            📅 Deadline:{" "}
                            {new Date(
                              job.applicationDeadline,
                            ).toLocaleDateString()}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {job.skills?.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div>{job.views ?? 0} views</div>
                        <div>{job.applications ?? 0} applications</div>
                        <div className="text-xs text-gray-500">
                          {(job.views ?? 0) > 0
                            ? Math.round(
                                ((job.applications ?? 0) / job.views) * 100,
                              )
                            : 0}
                          % conversion
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          job.status === "active"
                            ? "bg-green-100 text-green-800"
                            : job.status === "paused"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {job.posted}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-700"
                          title="View Applications"
                          onClick={() => setActiveTab("applicants")}
                        >
                          <FiEye className="h-4 w-4" />
                        </button>
                        <button
                          className={`${
                            job.status === "active"
                              ? "text-yellow-600 hover:text-yellow-700"
                              : "text-green-600 hover:text-green-700"
                          }`}
                          title={
                            job.status === "active" ? "Pause Job" : "Resume Job"
                          }
                          onClick={() => handleToggleJobStatus(job.id)}
                        >
                          {job.status === "active" ? (
                            <FiX className="h-4 w-4" />
                          ) : (
                            <FiCheck className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          className="text-orange-600 hover:text-orange-700"
                          title="Close Job"
                          onClick={() => handleCloseJob(job.id)}
                          disabled={job.status === "closed"}
                        >
                          <FiXCircle className="h-4 w-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-700"
                          title="Delete Job"
                          onClick={() => handleDeleteJob(job.id)}
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Job Posting Modal */}
      {showJobForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Post New Job
                </h3>
                <button
                  onClick={() => setShowJobForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleJobSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={jobFormData.title}
                      onChange={handleJobFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g. Senior React Developer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={jobFormData.location}
                      onChange={handleJobFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g. Remote, New York, NY"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Job Type
                    </label>
                    <select
                      name="type"
                      value={jobFormData.type}
                      onChange={handleJobFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Experience Level
                    </label>
                    <select
                      name="experience"
                      value={jobFormData.experience}
                      onChange={handleJobFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="Entry Level">Entry Level</option>
                      <option value="Mid Level">Mid Level</option>
                      <option value="Senior Level">Senior Level</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Min Salary (k)
                    </label>
                    <input
                      type="number"
                      name="salaryMin"
                      value={jobFormData.salaryMin}
                      onChange={handleJobFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="70"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Salary (k)
                    </label>
                    <input
                      type="number"
                      name="salaryMax"
                      value={jobFormData.salaryMax}
                      onChange={handleJobFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Required Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={jobFormData.skills.join(", ")}
                    onChange={handleSkillsChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="React, Node.js, TypeScript, MongoDB"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    name="description"
                    value={jobFormData.description}
                    onChange={handleJobFormChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Requirements
                  </label>
                  <textarea
                    name="requirements"
                    value={jobFormData.requirements}
                    onChange={handleJobFormChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="List the key requirements and qualifications..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Benefits & Perks
                  </label>
                  <textarea
                    name="benefits"
                    value={jobFormData.benefits}
                    onChange={handleJobFormChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Health insurance, remote work, flexible hours..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Application Deadline *
                    </label>
                    <input
                      type="date"
                      name="applicationDeadline"
                      value={jobFormData.applicationDeadline}
                      onChange={handleJobFormChange}
                      min={new Date().toISOString().split("T")[0]}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Job Visibility
                    </label>
                    <select
                      name="visibility"
                      value={jobFormData.visibility}
                      onChange={handleJobFormChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="public">
                        Public - Visible to all candidates
                      </option>
                      <option value="private">Private - Invite only</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowJobForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Post Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderApplicantTracking = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Applicant Tracking System
        </h2>
        <div className="flex items-center space-x-2">
          {selectedApplicants.length > 0 && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction("shortlist")}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm"
              >
                Shortlist ({selectedApplicants.length})
              </button>
              <button
                onClick={() => handleBulkAction("reject")}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
              >
                Reject ({selectedApplicants.length})
              </button>
            </div>
          )}
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <FiDownload className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option>All Jobs</option>
            {dashboardData.jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
          <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option>All Status</option>
            <option>Pending</option>
            <option>Shortlisted</option>
            <option>Interview</option>
            <option>Rejected</option>
          </select>
          <input
            type="text"
            placeholder="Search candidates..."
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Applicants List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {applicationsLoading && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Loading applications…
          </div>
        )}
        {applicationsError && !applicationsLoading && (
          <div className="p-6 text-center">
            <p className="text-red-600 dark:text-red-400 mb-2">
              {applicationsError}
            </p>
            <button
              type="button"
              onClick={() => fetchApplications()}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Try again
            </button>
          </div>
        )}
        {!applicationsLoading &&
          !applicationsError &&
          dashboardData.applications.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <FiUsers className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>
                No applications yet. Applications will appear here when
                candidates apply to your jobs.
              </p>
            </div>
          )}
        {!applicationsLoading &&
          !applicationsError &&
          dashboardData.applications.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        className="rounded"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedApplicants(
                              dashboardData.applications.map((app) => app.id),
                            );
                          } else {
                            setSelectedApplicants([]);
                          }
                        }}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Job & Match
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Skills & Experience
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
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
                        <input
                          type="checkbox"
                          className="rounded"
                          checked={selectedApplicants.includes(app.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedApplicants([
                                ...selectedApplicants,
                                app.id,
                              ]);
                            } else {
                              setSelectedApplicants(
                                selectedApplicants.filter(
                                  (id) => id !== app.id,
                                ),
                              );
                            }
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {app.candidateName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {app.candidateName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {app.email}
                            </div>
                            <div className="text-xs text-gray-400">
                              {app.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {app.jobTitle}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Applied {app.appliedDate}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {app.experience} experience
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {app.skills.slice(0, 3).map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                              >
                                {skill}
                              </span>
                            ))}
                            {app.skills.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{app.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={app.status}
                          onChange={(e) =>
                            handleApplicationStatusChange(
                              app.id,
                              e.target.value,
                            )
                          }
                          className={`px-2 py-1 text-xs rounded-full border-0 ${
                            app.status === "shortlisted"
                              ? "bg-green-100 text-green-800"
                              : app.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : app.status === "interview"
                              ? "bg-blue-100 text-blue-800"
                              : app.status === "hired"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interview">Interview</option>
                          <option value="rejected">Rejected</option>
                          <option value="hired">Hired</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewResume(app)}
                            className="text-blue-600 hover:text-blue-700"
                            title="View Resume"
                          >
                            <FiFileText className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleShortlist(app.id)}
                            className="text-green-600 hover:text-green-700"
                            title="Shortlist"
                          >
                            <FiCheck className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleScheduleInterview(app.id)}
                            className="text-purple-600 hover:text-purple-700"
                            title="Schedule Interview"
                          >
                            <FiCalendar className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleSendMessage(app)}
                            className="text-gray-600 hover:text-gray-700"
                            title="Send Message"
                          >
                            <FiMessageSquare className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(app.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Reject"
                          >
                            <FiX className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  );

  const renderTalentSearch = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Talent Search & AI Recommendations
        </h2>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <FiStar className="h-4 w-4" />
          <span>Saved Candidates</span>
        </button>
      </div>

      {/* AI-Enhanced Search */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          AI-Enhanced Search
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Job title or skills (e.g., React Developer)"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            placeholder="Location"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <select className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option>Experience Level</option>
            <option>Entry Level (0-2 years)</option>
            <option>Mid Level (3-5 years)</option>
            <option>Senior Level (5+ years)</option>
          </select>
        </div>
        <div className="mt-4 flex items-center space-x-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
            Search Candidates
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2">
            <FiZap className="h-4 w-4" />
            <span>AI Recommendations</span>
          </button>
        </div>
      </div>

      {/* Candidate Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardData.candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {candidate.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {candidate.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {candidate.title}
                  </p>
                </div>
              </div>
              <button className="text-yellow-500 hover:text-yellow-600">
                <FiStar className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Experience: {candidate.experience}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Location: {candidate.location}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Skills:
                </p>
                <div className="flex flex-wrap gap-1">
                  {candidate.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    candidate.available
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {candidate.available ? "Available" : "Not Available"}
                </span>
              </div>

              <div className="flex items-center space-x-2 pt-3">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">
                  View Profile
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg">
                  <FiMessageSquare className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "jobs":
        return renderJobManagement();
      case "applicants":
        return renderApplicantTracking();
      case "candidates":
        return renderTalentSearch();
      case "analytics":
        return (
          <div className="text-center py-12 text-gray-500">
            Analytics & Reports - Coming Soon
          </div>
        );
      case "messages":
        return (
          <div className="text-center py-12 text-gray-500">
            Communication Hub - Coming Soon
          </div>
        );
      case "profile":
        return (
          <div className="text-center py-12 text-gray-500">
            Profile & Team Management - Coming Soon
          </div>
        );
      case "billing":
        return (
          <div className="text-center py-12 text-gray-500">
            Billing & Subscription Management - Coming Soon
          </div>
        );
      case "settings":
        return (
          <div className="text-center py-12 text-gray-500">
            Settings & Integrations - Coming Soon
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Recruiter Hub
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Welcome back, {user?.name}
            </p>
          </div>

          <nav className="mt-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                  activeTab === tab.id
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-r-2 border-gray-900 dark:border-gray-300 font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/70"
                }`}
              >
                <tab.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">{renderContent()}</div>
      </div>

      {/* Extension Popup */}
      {showExtensionPopup && (
        <JobDeadlineExtension onClose={() => setShowExtensionPopup(false)} />
      )}
    </div>
  );
};

export default RecruiterDashboard;
