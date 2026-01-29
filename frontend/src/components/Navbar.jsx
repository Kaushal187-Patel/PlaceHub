import { useState } from "react";
import { FiLogOut, FiMenu, FiMoon, FiSun, FiUser, FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout, reset } from "../store/slices/authSlice";
import { toggleDarkMode } from "../store/slices/themeSlice";
import { getRoleBasedRoute } from "../utils/roleRedirect";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.theme);

  const dashboardRoute = user ? getRoleBasedRoute(user.role) : "/dashboard";

  const handleLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate("/");
  };

  const handleThemeToggle = () => {
    dispatch(toggleDarkMode());
    if (darkMode) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-brand-50/90 dark:bg-gray-800 shadow-sm backdrop-blur z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                src="/logo.png"
                alt="placeHub"
                className="h-8 w-8 mr-2 rounded"
                loading="eager"
              />
              <span className="text-2xl font-bold text-gray-900 dark:text-brand-200">
                placeHub
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/jobs"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-brand-200"
            >
              Jobs
            </Link>
            <Link
              to="/career-recommendations"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-brand-200"
            >
              Career Guide
            </Link>
            <Link
              to="/resume-analyzer"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-brand-200"
            >
              Resume Analyzer
            </Link>

            {/* Hamburger Menu for Info Pages */}
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-brand-100 dark:hover:bg-gray-700"
              >
                <FiMenu />
              </button>
              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-brand-50 dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                  <Link
                    to="/about"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand-100 dark:hover:bg-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    About Us
                  </Link>
                  <Link
                    to="/contact"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand-100 dark:hover:bg-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    Contact
                  </Link>
                  <Link
                    to="/privacy"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand-100 dark:hover:bg-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    to="/terms"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand-100 dark:hover:bg-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    Terms of Service
                  </Link>
                </div>
              )}
            </div>

            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-brand-100 dark:hover:bg-gray-700"
            >
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-brand-200"
                >
                  <FiUser />
                  <span>{user.name}</span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-brand-50 dark:bg-gray-800 rounded-md shadow-lg py-1">
                    <Link
                      to={dashboardRoute}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand-100 dark:hover:bg-gray-700"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand-100 dark:hover:bg-gray-700"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand-100 dark:hover:bg-gray-700"
                    >
                      <FiLogOut className="inline mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-brand-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-brand-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 dark:text-gray-300"
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-brand-50 dark:bg-gray-800">
            <Link
              to="/jobs"
              className="block px-3 py-2 text-gray-700 dark:text-gray-300"
            >
              Jobs
            </Link>
            <Link
              to="/career-recommendations"
              className="block px-3 py-2 text-gray-700 dark:text-gray-300"
            >
              Career Guide
            </Link>
            <Link
              to="/resume-analyzer"
              className="block px-3 py-2 text-gray-700 dark:text-gray-300"
            >
              Resume Analyzer
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 text-gray-700 dark:text-gray-300"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="block px-3 py-2 text-gray-700 dark:text-gray-300"
            >
              Contact
            </Link>
            <Link
              to="/privacy"
              className="block px-3 py-2 text-gray-700 dark:text-gray-300"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="block px-3 py-2 text-gray-700 dark:text-gray-300"
            >
              Terms of Service
            </Link>
            {user ? (
              <>
                <Link
                  to={dashboardRoute}
                  className="block px-3 py-2 text-gray-700 dark:text-gray-300"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="block px-3 py-2 text-gray-700 dark:text-gray-300"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-700 dark:text-gray-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-gray-700 dark:text-gray-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
