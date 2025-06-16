import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Spinner from './Spinner';
import CloseIcon from './CloseIcon';
import { useAddJob, NewJobData } from '../hooks/useVideoJobs';

const schema = yup.object().shape({
  prompt: yup.string().required('Prompt is required.'),
  useCase: yup.string().required(),
});

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddJobModal: React.FC<AddJobModalProps> = ({ isOpen, onClose }) => {
  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<NewJobData>({
    resolver: yupResolver(schema),
    defaultValues: { prompt: '', useCase: 'advertisement' },
  });

  const { mutate, isPending: isLoading } = useAddJob({
    onSuccess: onClose,
  });


  const onSubmit = (data: NewJobData) => {
    mutate(data);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <CloseIcon className="!size-4" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-black">Add New Job</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">Prompt</label>
            <textarea
              id="prompt"
              {...register('prompt')}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-black"
              rows={4}
            ></textarea>
            {errors.prompt && <p className="text-red-500 text-xs mt-1">{errors.prompt.message}</p>}
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50 flex items-center"
              disabled={isLoading}
            >
              {isLoading && <Spinner className="h-5 w-5 mr-2" />}
              Submit Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJobModal;
