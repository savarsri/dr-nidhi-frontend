// import React, { useEffect } from "react";
// import { PlusSquare } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchTotalPatients } from "../redux/patientSlice";

// export const SplashScreen = ({ onComplete }) => {
//   const dispatch = useDispatch();
//   const { totalPatients, newPatientsThisMonth, loading } = useSelector((state) => state.patients);

//   useEffect(() => {
//     const lastFetchTime = localStorage.getItem("lastFetchTime");
//     const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

//     if (!totalPatients || !newPatientsThisMonth || !lastFetchTime || (Date.now() - parseInt(lastFetchTime) >= oneHour)) {
//       dispatch(fetchTotalPatients());
//     }
//   }, [dispatch, totalPatients, newPatientsThisMonth]);

//   useEffect(() => {
//     if (!loading) {
//       const timer = setTimeout(() => {
//         onComplete();
//       }, 3000);
//       return () => clearTimeout(timer);
//     }
//   }, [loading, onComplete]); // Wait for loading to complete before transitioning

//   return (
//     <div className="fixed inset-0 bg-gradient-to-br from-primary to-deeper flex items-center justify-center">
//       <div className="animate-bounce text-white flex flex-col items-center">
//         <PlusSquare className="w-16 h-16 mb-4" />
//         <h1 className="text-3xl font-bold">Dr. Nidhi</h1>
//       </div>
//     </div>
//   );
// };

import React, { useEffect } from "react";
import { PlusSquare } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser } from "../redux/userSlice"; // Adjust the import path if needed

export const SplashScreen = ({ onComplete }) => {
  const dispatch = useDispatch();

  // Retrieve user details and its loading state from the user store
  const { user } = useSelector((state) => state.user);

  // Fetch user details if an auth token exists.
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken && !user) {
      dispatch(fetchUser());
    }
  }, [dispatch]);

  // Once both fetches are complete (i.e. isLoading is false), wait 3 seconds then call onComplete.
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary to-deeper flex items-center justify-center">
      <div className="animate-bounce text-white flex flex-col items-center">
        <PlusSquare className="w-16 h-16 mb-4" />
        <h1 className="text-3xl font-bold">Dr. Nidhi</h1>
      </div>
    </div>
  );
};
