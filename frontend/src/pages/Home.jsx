import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiArrowRight, FiBriefcase, FiUsers, FiTrendingUp } from 'react-icons/fi';

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-yellow-200">
              Discover Your
              <span className="block text-yellow-400 drop-shadow-lg"> Dream Career</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-4xl mx-auto text-gray-100 leading-relaxed">
              AI-powered career recommendations and job matching platform designed
              to help you find your perfect career path with personalized insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to={user ? "/career-recommendations" : "/register"}
                className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-10 py-4 rounded-xl font-bold text-lg hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 inline-flex items-center shadow-2xl hover:shadow-yellow-500/25 transform hover:scale-105"
              >
                {user ? "Get Career Recommendations" : "Get Started"} <FiArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/jobs"
                className="group border-2 border-white/30 backdrop-blur-sm bg-white/10 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300 shadow-xl hover:shadow-white/25 transform hover:scale-105"
              >
                Browse Jobs
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
            >
              Why Choose Aspiro?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Powered by cutting-edge AI to give you the best career guidance
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group text-center p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800"
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FiBriefcase className="text-white" size={36} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                AI Career Recommendations
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Get personalized career suggestions based on your skills, interests, and goals with our advanced machine learning algorithms.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group text-center p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800"
            >
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FiUsers className="text-white" size={36} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                Smart Job Matching
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Find jobs that perfectly match your profile and career aspirations with intelligent filtering and recommendation systems.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group text-center p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800"
            >
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FiTrendingUp className="text-white" size={36} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Resume Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Get detailed feedback on your resume with AI-powered analysis and actionable suggestions for improvement.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                10K+
              </h3>
              <p className="text-gray-600 dark:text-gray-300">Active Users</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                5K+
              </h3>
              <p className="text-gray-600 dark:text-gray-300">Job Listings</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                500+
              </h3>
              <p className="text-gray-600 dark:text-gray-300">Companies</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                95%
              </h3>
              <p className="text-gray-600 dark:text-gray-300">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Your Career Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students and professionals who found their dream careers with Aspiro.
          </p>
          <Link
            to={user ? "/career-recommendations" : "/register"}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
          >
            {user ? "Get Career Recommendations" : "Get Started Today"} <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;