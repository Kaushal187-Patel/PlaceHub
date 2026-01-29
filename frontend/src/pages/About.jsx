import { FiAward, FiTarget, FiTrendingUp, FiUsers } from "react-icons/fi";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            About placeHub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Empowering careers through AI-powered recommendations and
            intelligent job matching
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Our Mission
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              At placeHub, we believe everyone deserves a fulfilling career. Our
              AI-powered platform bridges the gap between talent and
              opportunity, providing personalized career recommendations and
              intelligent job matching.
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              We leverage cutting-edge machine learning algorithms to analyze
              your skills, experience, and career goals, delivering insights
              that help you make informed decisions about your professional
              future.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose placeHub?
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-600 dark:text-gray-300">
                <FiTarget className="h-5 w-5 text-blue-600 mr-3" />
                AI-powered career recommendations
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-300">
                <FiUsers className="h-5 w-5 text-green-600 mr-3" />
                Personalized job matching
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-300">
                <FiTrendingUp className="h-5 w-5 text-purple-600 mr-3" />
                Resume analysis and optimization
              </li>
              <li className="flex items-center text-gray-600 dark:text-gray-300">
                <FiAward className="h-5 w-5 text-yellow-600 mr-3" />
                Industry insights and trends
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTarget className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Innovation
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Continuously advancing AI technology to provide better career
                insights
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Accessibility
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Making career guidance accessible to everyone, regardless of
                background
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Growth
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Empowering individuals to achieve their full career potential
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
