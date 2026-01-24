import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCareerRecommendations } from '../store/slices/careerSlice';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiStar, FiArrowRight, FiUser, FiBook, FiTarget, FiDollarSign, FiMapPin, FiZap } from 'react-icons/fi';

const CareerRecommendations = () => {
  const [formData, setFormData] = useState({
    skills: '',
    interests: '',
    education: '',
    experience: '',
    goals: '',
  });

  const dispatch = useDispatch();
  const { recommendations, insights, isLoading, isError, message } = useSelector((state) => state.career);
  const { user } = useSelector((state) => state.auth);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Transform form data to match ML service expectations
    const requestData = {
      skills: formData.skills,
      interests: formData.interests,
      education: formData.education,
      experience: formData.experience,
      goals: formData.goals,
    };
    
    dispatch(getCareerRecommendations(requestData));
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMatchBgColor = (score) => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-50 dark:bg-yellow-900/20';
    return 'bg-red-50 dark:bg-red-900/20';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Career Recommendations
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Get personalized career suggestions based on your skills, interests, and goals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Tell Us About Yourself
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiStar className="inline mr-2" />
                  Skills (comma-separated)
                </label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="e.g., python, javascript, react, sql, machine learning"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  rows="3"
                />
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiTarget className="inline mr-2" />
                  Interests (comma-separated)
                </label>
                <textarea
                  name="interests"
                  value={formData.interests}
                  onChange={handleInputChange}
                  placeholder="e.g., web development, data analysis, problem solving, user experience"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  rows="3"
                />
              </div>

              {/* Education */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiBook className="inline mr-2" />
                  Education
                </label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  placeholder="e.g., Bachelor of Computer Science"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiUser className="inline mr-2" />
                  Experience
                </label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="e.g., 3 years in software development"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Goals */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiTarget className="inline mr-2" />
                  Career Goals (comma-separated)
                </label>
                <textarea
                  name="goals"
                  value={formData.goals}
                  onChange={handleInputChange}
                  placeholder="e.g., remote work, high salary, career growth, leadership"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  rows="3"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-md transition duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Recommendations...
                  </>
                ) : (
                  <>
                    <FiTrendingUp className="mr-2" />
                    Get Recommendations
                  </>
                )}
              </button>
            </form>

            {/* Error Display */}
            {isError && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {message || 'Failed to generate recommendations. Please try again.'}
                </p>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Career Recommendations
            </h2>
            
            {!recommendations || recommendations.length === 0 ? (
              <div className="text-center py-12">
                <FiTrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Fill out the form to get personalized career recommendations
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {recommendations.map((recommendation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`p-6 rounded-lg border ${getMatchBgColor(recommendation.match_score)}`}
                  >
                    {/* Career Title and Scores */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {recommendation.career}
                      </h3>
                      <div className="text-right space-y-1">
                        <div>
                          <span className={`text-xl font-bold ${getMatchColor(recommendation.match_percentage || 75)}`}>
                            {Math.round(recommendation.match_percentage || 75)}%
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Overall Match
                          </div>
                        </div>
                        <div>
                          <span className={`text-lg font-semibold ${getMatchColor(recommendation.skill_match || 70)}`}>
                            {Math.round(recommendation.skill_match || 70)}%
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Skill Match
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Salary Range */}
                    {recommendation.salary_range && (
                      <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center mb-2">
                          <FiDollarSign className="h-5 w-5 text-green-600 mr-2" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            Expected Salary Range
                          </span>
                        </div>
                        <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                          ${recommendation.salary_range.min?.toLocaleString()} - ${recommendation.salary_range.max?.toLocaleString()} {recommendation.salary_range.currency}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Based on your experience and skills
                        </div>
                      </div>
                    )}

                    {/* Key Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm">
                        <FiTrendingUp className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {Math.round((recommendation.confidence || 0.7) * 100)}% Confidence
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <FiUser className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {recommendation.experience_level}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <FiZap className="h-4 w-4 text-yellow-600 mr-2" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {recommendation.growth_potential} Growth
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <FiMapPin className="h-4 w-4 text-purple-600 mr-2" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {recommendation.remote_friendly ? 'Remote Friendly' : 'On-site'}
                        </span>
                      </div>
                    </div>

                    {/* Industries */}
                    {recommendation.industries && recommendation.industries.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Industries:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {recommendation.industries.map((industry, idx) => (
                            <span
                              key={idx}
                              className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs"
                            >
                              {industry}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Matched Skills */}
                    {recommendation.matched_required_skills && recommendation.matched_required_skills.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                          Matched Required Skills:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {recommendation.matched_required_skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Skills */}
                    {recommendation.missing_required_skills && recommendation.missing_required_skills.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                          Missing Required Skills:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {recommendation.missing_required_skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Confidence */}
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Confidence: {(recommendation.confidence * 100).toFixed(1)}%
                    </div>
                  </motion.div>
                ))}

                {/* Insights */}
                {insights && insights.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Insights
                    </h3>
                    <ul className="space-y-2">
                      {insights.map((insight, index) => (
                        <li key={index} className="flex items-start text-gray-700 dark:text-gray-300">
                          <span className="text-blue-600 mr-2">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerRecommendations;