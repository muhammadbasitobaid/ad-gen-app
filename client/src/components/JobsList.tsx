import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AddJobModal from './AddJobModal';
import VideoPlayerModal from './VideoPlayerModal';
import Spinner from './Spinner';

interface Job {
  _id: string;
  prompt: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  useCase: string;
  output_filename?: string;
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const JobsList = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8081/api/video/jobs');
      setJobs(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch jobs');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const initialFetch = async () => {
      setLoading(true);
      await fetchJobs();
      setLoading(false);
    };

    initialFetch();
    const interval = setInterval(fetchJobs, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [fetchJobs]);

  const handleJobAdded = () => {
    setIsAddModalOpen(false);
    fetchJobs();
  };

  const handlePlay = (filename: string) => {
    setSelectedVideoUrl(`http://localhost:8081/api/video/stream/${filename}`);
    setIsVideoModalOpen(true);
  };

  const handleDownload = (filename: string) => {
    window.location.href = `http://localhost:8081/api/video/download/${filename}`;
  };

  const truncate = (str: string, n: number) => {
    return str?.length > n ? str.substr(0, n - 1) + '...' : str;
  };

  const isJobRunning = jobs.some(job => job.status === 'RUNNING');

  return (
    <>
      <AddJobModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onJobAdded={handleJobAdded}
      />
      <VideoPlayerModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={selectedVideoUrl}
      />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-black">Jobs List</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className={`bg-blue-500 text-white py-2 px-4 rounded ${
              isJobRunning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
            disabled={isJobRunning}
            title={isJobRunning ? 'A job is already running. Please wait.' : 'Add a new job'}
          >
            Add Job +
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-4 text-left">Prompt</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {loading && (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    <div className="flex justify-center items-center">
                      <Spinner className="h-8 w-8 text-gray-500" />
                    </div>
                  </td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-red-500">{error}</td>
                </tr>
              )}
              {!loading && !error && jobs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4">No jobs found.</td>
                </tr>
              )}
              {!loading && !error && jobs.map((job) => (
                <tr key={job._id} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="py-3 px-4" title={job.prompt}>
                    {truncate(job.prompt, 50)}
                  </td>
                  <td className="py-3 px-4">
                    {job.status === 'RUNNING' ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-200 text-yellow-800 opacity-75">
                        <Spinner className="h-4 w-4 mr-2 text-yellow-800" />
                        {job.status}
                      </span>
                    ) : (
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          job.status === 'COMPLETED' ? 'bg-green-200 text-green-800' :
                          'bg-red-200 text-red-800'
                        }`}
                      >
                        {job.status}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 flex justify-center space-x-2">
                    <button
                      onClick={() => job.videoUrl && handlePlay(job.videoUrl.split('/').pop()!)}
                      className={`text-blue-500 hover:text-blue-700 ${job.status !== 'COMPLETED' || !job.videoUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={job.status !== 'COMPLETED' || !job.videoUrl}
                      title={job.status !== 'COMPLETED' || !job.videoUrl ? 'Video not available' : 'Play video'}
                    >
                      <PlayIcon />
                    </button>
                    <button
                      onClick={() => job.videoUrl && handleDownload(job.videoUrl.split('/').pop()!)}
                      className={`text-gray-500 hover:text-gray-700 ${job.status !== 'COMPLETED' || !job.videoUrl ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={job.status !== 'COMPLETED' || !job.videoUrl}
                      title={job.status !== 'COMPLETED' || !job.videoUrl ? 'Video not available' : 'Download video'}
                    >
                      <DownloadIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default JobsList;