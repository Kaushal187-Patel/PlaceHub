import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { saveJob } from '../store/slices/jobSlice';
import { FiMapPin, FiClock, FiDollarSign, FiBookmark, FiExternalLink } from 'react-icons/fi';
import moment from 'moment';

const JobCard = ({ job }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleSaveJob = () => {
    if (user) {
      dispatch(saveJob(job._id));
    }
  };

  const formatSalary = (salary) => {
    if (!salary.min && !salary.max) return 'Salary not specified';
    if (salary.min && salary.max) {
      return `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()} ${salary.period}`;
    }
    if (salary.min) {
      return `From $${salary.min.toLocaleString()} ${salary.period}`;
    }
    return `Up to $${salary.max.toLocaleString()} ${salary.period}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
              {job.title}
            </h3>
            {job.urgent && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                Urgent
              </span>
            )}
            {job.featured && (
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                Featured
              </span>
            )}
          </div>
          <p className="text-xl text-blue-600 dark:text-blue-400 font-bold mb-3 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer">
            {job.company}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <div className="flex items-center gap-1">
              <FiMapPin className="h-4 w-4" />
              <span>{job.location}</span>
              {job.isRemote && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded ml-1">
                  Remote
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <FiClock className="h-4 w-4" />
              <span className="capitalize">{job.jobType.replace('-', ' ')}</span>
            </div>
            <div className="flex items-center gap-1">
              <FiDollarSign className="h-4 w-4" />
              <span>{formatSalary(job.salary)}</span>
            </div>
          </div>
        </div>
        {user && (
          <button
            onClick={handleSaveJob}
            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <FiBookmark className="h-5 w-5" />
          </button>
        )}
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.skills.slice(0, 5).map((skill, index) => (
          <span
            key={index}
            className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded"
          >
            {skill.name}
          </span>
        ))}
        {job.skills.length > 5 && (
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            +{job.skills.length - 5} more
          </span>
        )}
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Posted {moment(job.createdAt).fromNow()}
        </div>
        <div className="flex gap-3">
          <Link
            to={`/jobs/${job._id}`}
            className="inline-flex items-center px-6 py-3 border-2 border-gray-200 dark:border-gray-600 text-sm font-semibold rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
          >
            View Details
            <FiExternalLink className="ml-2 h-4 w-4" />
          </Link>
          {user && (
            <Link
              to={`/jobs/${job._id}/apply`}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105"
            >
              Apply Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;