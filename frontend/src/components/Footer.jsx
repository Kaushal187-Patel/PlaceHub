import { Link } from 'react-router-dom';
import { FiGithub, FiLinkedin, FiTwitter, FiMail } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">Aspiro</h3>
            <p className="text-gray-300 mb-4">
              AI-powered career recommendation platform helping students and job seekers
              discover their ideal career paths and connect with opportunities.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400">
                <FiGithub size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400">
                <FiLinkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400">
                <FiMail size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/jobs" className="text-gray-300 hover:text-blue-400">
                  Job Board
                </Link>
              </li>
              <li>
                <Link to="/career-recommendations" className="text-gray-300 hover:text-blue-400">
                  Career Guide
                </Link>
              </li>
              <li>
                <Link to="/resume-analyzer" className="text-gray-300 hover:text-blue-400">
                  Resume Analyzer
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-blue-400">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-300 hover:text-blue-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-blue-400">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-blue-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-300 hover:text-blue-400">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 Aspiro. All rights reserved. Built with ❤️ by the Aspiro team.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;