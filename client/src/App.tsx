import { Route, Routes } from "react-router-dom";
import JobsList from "./components/JobsList";
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import all pages
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <>
          <Toaster position="top-center" reverseOrder={false} />
          <Routes>
            <Route path="/" element={<JobsList />} />
          </Routes>
      </>
    </QueryClientProvider>
  );
}
