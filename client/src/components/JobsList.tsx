import { useState } from 'react';
import AddJobModal from './AddJobModal';
import VideoPlayerModal from './VideoPlayerModal';
import Spinner from './Spinner';
import PlayIcon from './PlayIcon';
import DownloadIcon from './DownloadIcon';
import { useGetJobs, Job } from '../hooks/useVideoJobs';

const JobsList = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  const { data: jobs = [], error, isLoading, isError } = useGetJobs();

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

  const isJobRunning = jobs.some((job: Job) => job.status === 'RUNNING');

  return (
    <>
      <AddJobModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        
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
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="text-center py-4">
                    <div className="flex justify-center items-center">
                      <Spinner className="h-8 w-8 text-gray-500" />
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={3} className="text-center py-4 text-red-500">{error.message}</td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-4">No jobs found.</td>
                </tr>
              ) : (
                jobs.map((job: Job) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default JobsList;