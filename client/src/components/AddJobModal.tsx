import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import Spinner from './Spinner';

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobAdded: () => void;
}

interface FormData {
  prompt: string;
  useCase: string;
}

const AddJobModal: React.FC<AddJobModalProps> = ({ isOpen, onClose, onJobAdded }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:8081/api/video/generate', data);
      toast.success('Job added successfully!');
      onJobAdded();
      onClose();
    } catch (error) {
      console.error('Failed to add job', error);
      toast.error('Failed to add job.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Job</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-2 px-7 py-3">
            <div className="mb-4">
              <label htmlFor="useCase" className="block text-gray-700 text-sm font-bold mb-2 text-left">
                Use Case
              </label>
              <select
                {...register('useCase', { required: 'Use case is required' })}
                id="useCase"
                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                defaultValue="advertisement"
              >
                <option value="advertisement">Advertisement</option>
                <option value="short_film">Short Film</option>
                <option value="social_media">Social Media</option>
                <option value="presentation">Presentation</option>
              </select>
              {errors.useCase && <p className="text-red-500 text-xs italic text-left">{errors.useCase.message}</p>}
            </div>
            <textarea
              {...register('prompt', { required: 'Prompt is required' })}
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
              rows={4}
              placeholder="Enter your prompt here..."
            />
            {errors.prompt && <p className="text-red-500 text-xs italic">{errors.prompt.message}</p>}
            <div className="items-center px-4 py-3 space-y-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex justify-center items-center">
                    <Spinner className="h-5 w-5 text-white" />
                    <span className="ml-2">Submitting...</span>
                  </div>
                ) : (
                  'Submit Job'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddJobModal;
