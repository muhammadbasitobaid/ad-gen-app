import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

// --- Types ---
export interface Job {
  _id: string;
  prompt: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewJobData {
  useCase: string;
  prompt: string;
}

interface ApiError {
  error: string;
}

const API_URL = `${process.env.REACT_APP_API_URL}/video`;

// --- API Functions ---
const fetchJobs = async (): Promise<Job[]> => {
  const { data } = await axios.get(`${API_URL}/jobs`);
  return data;
};

const addJob = async (newJob: NewJobData): Promise<any> => {
  const { data } = await axios.post(`${API_URL}/generate`, newJob);
  return data;
};

// --- Custom Hooks ---
export const useGetJobs = () => {
  return useQuery<Job[], Error>({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
    refetchInterval: (query) => {
      const jobs = query.state.data;
      const isAnyJobProcessing = jobs?.some(
        (job) => job.status === 'RUNNING' || job.status === 'PENDING'
      );
      return isAnyJobProcessing ? 5000 : false;
    },
  });
};

export const useAddJob = ({ onSuccess: onComponentSuccess }: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();

  return useMutation<any, AxiosError<ApiError>, NewJobData>({
    mutationFn: addJob,
    onSuccess: () => {
      toast.success('Job added successfully!');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      if (onComponentSuccess) {
        onComponentSuccess();
      }
    },
    onError: (error: AxiosError<ApiError>) => {
      const errorMessage = error.response?.data?.error || error.message;
      toast.error(`Failed to add job: ${errorMessage}`);
    },
  });
};
