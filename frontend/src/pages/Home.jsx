import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, useInView } from 'framer-motion';
import { FiArrowRight, FiBriefcase, FiUsers, FiTrendingUp, FiUpload, FiSearch } from 'react-icons/fi';

const Home = () => {
  const { user } = useSelector((state) => state.auth);

  const StatItem = ({ value, label }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-80px' });
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!isInView) return;
      let start = null;
      const duration = 1200;
      const hasK = value.includes('K');
      const hasPlus = value.includes('+');
      const hasPercent = value.includes('%');
      const numeric = parseFloat(value.replace(/[^\d.]/g, ''));
      const target = hasK ? numeric * 1000 : numeric;

      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        setCount(Math.floor(progress * target));
        if (progress < 1) requestAnimationFrame(step);
      };

      const raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
    }, [isInView, value]);

    const formatValue = () => {
      const hasK = value.includes('K');
      const hasPlus = value.includes('+');
      const hasPercent = value.includes('%');

      if (hasK) {
        const kValue = Math.max(1, Math.round(count / 1000));
        return `${kValue}K${hasPlus ? '+' : ''}`;
      }

      if (hasPercent) {
        return `${Math.round(count)}%`;
      }

      return `${Math.round(count)}${hasPlus ? '+' : ''}`;
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h3 className="text-4xl font-bold text-gray-900 dark:text-brand-200 mb-2">{formatValue()}</h3>
        <p className="text-gray-600 dark:text-gray-300">{label}</p>
      </motion.div>
    );
  };
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-brand-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-8"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 text-gray-900 px-4 py-2 text-sm font-semibold">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-300 text-gray-900 text-xs">✦</span>
                AI-Powered Campus Placement Platform
              </span>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">
                Land Your <span className="text-gray-900">Dream Job</span> with Smart Resume Matching
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                Streamline campus recruitment with AI-driven resume screening, skill
                matching, and real-time analytics. Connect students with the perfect
                opportunities.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={user ? "/resume-dashboard" : "/register"}
                  className="group bg-brand-300 text-gray-900 px-8 py-3 rounded-xl font-semibold text-lg hover:bg-brand-200 transition-all duration-300 inline-flex items-center justify-center shadow-lg"
                >
                  <FiUpload className="mr-2" /> Upload Resume
                </Link>
                <Link
                  to="/jobs"
                  className="group border border-brand-200 text-gray-900 px-8 py-3 rounded-xl font-semibold text-lg hover:bg-brand-100 transition-all duration-300 inline-flex items-center justify-center"
                >
                  Browse Jobs <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-6 pt-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">500+</h3>
                  <p className="text-gray-500 text-sm">Companies</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">10K+</h3>
                  <p className="text-gray-500 text-sm">Placements</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">95%</h3>
                  <p className="text-gray-500 text-sm">Success Rate</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-brand-100 blur-2xl"></div>
              <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-brand-200 blur-2xl"></div>

              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="bg-brand-100 rounded-2xl shadow-xl border border-brand-200 p-6 max-w-sm ml-auto"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-brand-300 flex items-center justify-center">
                    <FiTrendingUp className="text-gray-900" size={22} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Resume Score</p>
                    <p className="text-2xl font-bold text-gray-900">92%</p>
                  </div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-brand-50">
                  <div className="h-2 rounded-full bg-brand-300" style={{ width: '92%' }}></div>
                </div>
              </motion.div>

              <motion.div
                animate={{ x: [0, 20, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                className="bg-brand-100 rounded-2xl shadow-xl border border-brand-200 p-5 max-w-xs mt-6 ml-12"
              >
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-brand-300 flex items-center justify-center">
                    <FiSearch className="text-gray-900" size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">New Match Found!</p>
                    <p className="text-base font-semibold text-gray-900">Software Engineer @ Google</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 0, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
                className="bg-brand-100 rounded-2xl shadow-xl border border-brand-200 p-6 max-w-sm mt-6"
              >
                <p className="text-sm text-gray-500 mb-4">Skill Match Analysis</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-gray-700">React.js</span>
                    <div className="flex-1 h-2 rounded-full bg-brand-50">
                      <div className="h-2 rounded-full bg-brand-300" style={{ width: '95%' }}></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">95%</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-gray-700">Python</span>
                    <div className="flex-1 h-2 rounded-full bg-brand-50">
                      <div className="h-2 rounded-full bg-brand-300" style={{ width: '88%' }}></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">88%</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-gray-700">Machine Learning</span>
                    <div className="flex-1 h-2 rounded-full bg-brand-50">
                      <div className="h-2 rounded-full bg-brand-300" style={{ width: '82%' }}></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">82%</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-brand-50 to-brand-100 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6"
            >
              Why Choose PlacementHub?
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
              className="group text-center p-8 rounded-2xl bg-brand-100 dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 border border-brand-200 dark:border-gray-700"
            >
              <div className="bg-brand-300 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FiBriefcase className="text-gray-900" size={36} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
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
              className="group text-center p-8 rounded-2xl bg-brand-100 dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 border border-brand-200 dark:border-gray-700"
            >
              <div className="bg-brand-300 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FiUsers className="text-gray-900" size={36} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
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
              className="group text-center p-8 rounded-2xl bg-brand-100 dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 border border-brand-200 dark:border-gray-700"
            >
              <div className="bg-brand-300 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <FiTrendingUp className="text-gray-900" size={36} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
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
      <section className="py-20 bg-brand-100 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StatItem value="500+" label="Companies" />
            <StatItem value="10K+" label="Placements" />
            <StatItem value="95%" label="Success Rate" />
            <StatItem value="5K+" label="Job Listings" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Start Your Career Journey?
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Join thousands of students and professionals who found their dream careers with PlacementHub.
          </p>
          <Link
            to={user ? "/career-recommendations" : "/register"}
            className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-brand-100 transition-colors inline-flex items-center"
          >
            {user ? "Get Career Recommendations" : "Get Started Today"} <FiArrowRight className="ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;