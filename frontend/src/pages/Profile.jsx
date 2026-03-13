import { useEffect, useState } from "react";
import {
  FiEdit,
  FiGithub,
  FiGlobe,
  FiLink,
  FiLinkedin,
  FiMail,
  FiMapPin,
  FiPhone,
  FiTrash2,
  FiUser,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getProfile, updateProfile } from "../store/slices/userSlice";

const Profile = () => {
  const dispatch = useDispatch();
  const { profile, isLoading } = useSelector((state) => state.user);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    resumeLink: "",
    skills: [],
    experience: [],
    education: [],
  });
  const [editingExperienceIndex, setEditingExperienceIndex] = useState(null);
  const [editingEducationIndex, setEditingEducationIndex] = useState(null);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        bio: profile.bio || "",
        phone: profile.phone || "",
        location: profile.location || "",
        website: profile.website || "",
        linkedin: profile.linkedin || "",
        github: profile.github || "",
        resumeLink: profile.resumeLink || "",
        skills: profile.skills || [],
        experience: profile.experience || [],
        education: profile.education || [],
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile(formData)).unwrap();
      toast.success("Profile updated successfully!");
      // Refresh profile data
      dispatch(getProfile());
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h1 className="text-4xl font-extrabold text-white mb-2">
              Profile Settings
            </h1>
            <p className="text-blue-100">
              Update your personal information and preferences
            </p>
          </div>
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiUser className="inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiMail className="inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    disabled
                    title="Email cannot be changed for security reasons"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed for security reasons
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiPhone className="inline mr-2" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiMapPin className="inline mr-2" />
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiGlobe className="inline mr-2" />
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiLinkedin className="inline mr-2" />
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FiGithub className="inline mr-2" />
                    GitHub
                  </label>
                  <input
                    type="url"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  name="skills"
                  value={
                    Array.isArray(formData.skills)
                      ? formData.skills.join(", ")
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      skills: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="JavaScript, React, Node.js, Python..."
                />
              </div>

              {/* Experience Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Experience
                </label>
                <div className="space-y-2">
                  {formData.experience.map((exp, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 dark:border-gray-600 rounded-md flex justify-between items-start gap-3"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {exp.position || "Role"}{" "}
                          {exp.company ? `at ${exp.company}` : ""}
                        </div>
                        <div className="text-xs text-gray-500">
                          {exp.startDate
                            ? new Date(exp.startDate).toLocaleDateString()
                            : ""}
                          {" - "}
                          {exp.current
                            ? "Present"
                            : exp.endDate
                              ? new Date(exp.endDate).toLocaleDateString()
                              : ""}
                        </div>
                        {exp.description && (
                          <div className="text-sm mt-1">{exp.description}</div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              newExperience: { ...exp },
                            }));
                            setEditingExperienceIndex(index);
                          }}
                          className="inline-flex items-center px-2 py-1 text-xs rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          <FiEdit className="mr-1 h-3 w-3" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              experience: prev.experience.filter(
                                (_, i) => i !== index,
                              ),
                            }));
                            if (editingExperienceIndex === index) {
                              setEditingExperienceIndex(null);
                              setFormData((prev) => ({
                                ...prev,
                                newExperience: {},
                              }));
                            }
                          }}
                          className="inline-flex items-center px-2 py-1 text-xs rounded-md bg-red-50 text-red-700 hover:bg-red-100"
                        >
                          <FiTrash2 className="mr-1 h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {formData.experience.length === 0 && (
                    <div className="text-gray-500 text-sm italic">
                      No experience added yet
                    </div>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="newExperiencePosition"
                    placeholder="Position (e.g. Frontend Intern)"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.newExperience?.position || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        newExperience: {
                          ...(prev.newExperience || {}),
                          position: e.target.value,
                        },
                      }))
                    }
                  />
                  <input
                    type="text"
                    name="newExperienceCompany"
                    placeholder="Company"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.newExperience?.company || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        newExperience: {
                          ...(prev.newExperience || {}),
                          company: e.target.value,
                        },
                      }))
                    }
                  />
                  <input
                    type="date"
                    name="newExperienceStartDate"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.newExperience?.startDate || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        newExperience: {
                          ...(prev.newExperience || {}),
                          startDate: e.target.value,
                        },
                      }))
                    }
                  />
                  <input
                    type="date"
                    name="newExperienceEndDate"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.newExperience?.endDate || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        newExperience: {
                          ...(prev.newExperience || {}),
                          endDate: e.target.value,
                        },
                      }))
                    }
                  />
                  <textarea
                    name="newExperienceDescription"
                    rows={3}
                    placeholder="Brief description (optional)"
                    className="md:col-span-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.newExperience?.description || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        newExperience: {
                          ...(prev.newExperience || {}),
                          description: e.target.value,
                        },
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.newExperience?.position) return;
                      if (
                        editingExperienceIndex !== null &&
                        editingExperienceIndex >= 0
                      ) {
                        setFormData((prev) => ({
                          ...prev,
                          experience: prev.experience.map((exp, i) =>
                            i === editingExperienceIndex
                              ? prev.newExperience
                              : exp,
                          ),
                          newExperience: {},
                        }));
                        setEditingExperienceIndex(null);
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          experience: [...prev.experience, prev.newExperience],
                          newExperience: {},
                        }));
                      }
                    }}
                    className="md:col-span-2 inline-flex justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
                  >
                    {editingExperienceIndex !== null
                      ? "Update Experience"
                      : "Add Experience"}
                  </button>
                </div>
              </div>

              {/* Education Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Education
                </label>
                <div className="space-y-2">
                  {formData.education.map((edu, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 dark:border-gray-600 rounded-md flex justify-between items-start gap-3"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {edu.degree || "Degree"}
                          {edu.field ? ` in ${edu.field}` : ""}
                        </div>
                        <div className="text-xs text-gray-500">
                          {edu.institution}
                        </div>
                        <div className="text-xs text-gray-500">
                          {edu.startDate
                            ? new Date(edu.startDate).toLocaleDateString()
                            : ""}
                          {" - "}
                          {edu.current
                            ? "Present"
                            : edu.endDate
                              ? new Date(edu.endDate).toLocaleDateString()
                              : ""}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              newEducation: { ...edu },
                            }));
                            setEditingEducationIndex(index);
                          }}
                          className="inline-flex items-center px-2 py-1 text-xs rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          <FiEdit className="mr-1 h-3 w-3" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              education: prev.education.filter(
                                (_, i) => i !== index,
                              ),
                            }));
                            if (editingEducationIndex === index) {
                              setEditingEducationIndex(null);
                              setFormData((prev) => ({
                                ...prev,
                                newEducation: {},
                              }));
                            }
                          }}
                          className="inline-flex items-center px-2 py-1 text-xs rounded-md bg-red-50 text-red-700 hover:bg-red-100"
                        >
                          <FiTrash2 className="mr-1 h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {formData.education.length === 0 && (
                    <div className="text-gray-500 text-sm italic">
                      No education added yet
                    </div>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="newEducationDegree"
                    placeholder="Degree (e.g. B.Sc.)"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.newEducation?.degree || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        newEducation: {
                          ...(prev.newEducation || {}),
                          degree: e.target.value,
                        },
                      }))
                    }
                  />
                  <input
                    type="text"
                    name="newEducationField"
                    placeholder="Field of study"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.newEducation?.field || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        newEducation: {
                          ...(prev.newEducation || {}),
                          field: e.target.value,
                        },
                      }))
                    }
                  />
                  <input
                    type="text"
                    name="newEducationInstitution"
                    placeholder="Institution"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.newEducation?.institution || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        newEducation: {
                          ...(prev.newEducation || {}),
                          institution: e.target.value,
                        },
                      }))
                    }
                  />
                  <input
                    type="date"
                    name="newEducationStartDate"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.newEducation?.startDate || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        newEducation: {
                          ...(prev.newEducation || {}),
                          startDate: e.target.value,
                        },
                      }))
                    }
                  />
                  <input
                    type="date"
                    name="newEducationEndDate"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.newEducation?.endDate || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        newEducation: {
                          ...(prev.newEducation || {}),
                          endDate: e.target.value,
                        },
                      }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.newEducation?.degree) return;
                      if (
                        editingEducationIndex !== null &&
                        editingEducationIndex >= 0
                      ) {
                        setFormData((prev) => ({
                          ...prev,
                          education: prev.education.map((edu, i) =>
                            i === editingEducationIndex
                              ? prev.newEducation
                              : edu,
                          ),
                          newEducation: {},
                        }));
                        setEditingEducationIndex(null);
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          education: [...prev.education, prev.newEducation],
                          newEducation: {},
                        }));
                      }
                    }}
                    className="md:col-span-2 inline-flex justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md"
                  >
                    {editingEducationIndex !== null
                      ? "Update Education"
                      : "Add Education"}
                  </button>
                </div>
              </div>

              {/* Resume link (Google Drive) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiLink className="inline mr-2" />
                  Resume link (Google Drive)
                </label>
                <input
                  type="url"
                  name="resumeLink"
                  value={formData.resumeLink || ""}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-bold text-lg shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    "Update Profile"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
