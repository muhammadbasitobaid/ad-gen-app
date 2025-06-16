import { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { attemptGetUser } from "./store/thunks/user";
import { useAppDispatch } from "./store/hooks";
import JobsList from "./components/JobsList";
import { Toaster } from 'react-hot-toast';


// Import all pages
export default function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(attemptGetUser())
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [dispatch]);

  return loading ? (
    <p>Loading, API cold start</p>
  ) : (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<JobsList />} />
      </Routes>
    </>
  );
}
