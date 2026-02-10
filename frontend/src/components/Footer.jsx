import { FiGithub, FiLinkedin, FiMail, FiTwitter } from "react-icons/fi";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-brand-200 text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">PlaceHub</h3>
            <p className="text-gray-700 mb-4">
              AI-powered career recommendation platform helping students and job
              seekers discover their ideal career paths and connect with
              opportunities.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                <FiGithub size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                <FiLinkedin size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                <FiMail size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/jobs" className="text-gray-700 hover:text-gray-900">
                  Job Board
                </Link>
              </li>
              <li>
                <Link
                  to="/career-recommendations"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Career Guide
                </Link>
              </li>
              <li>
                <Link
                  to="/resume-analyzer"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Resume Analyzer
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-700 hover:text-gray-900">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-700 hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-300 mt-8 pt-8 text-center">
          <p className="text-gray-700">
            © 2025 PlaceHub. All rights reserved. Built with ❤️ by the PlaceHub
            team.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
