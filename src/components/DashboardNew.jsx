import React, { useEffect, useState } from "react";
import { Users, UserPlus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api.js";
import NavBar from "./NavBarNew.jsx";
import { useDispatch, useSelector } from "react-redux";
import { fetchTotalPatients } from "../redux/patientSlice.js";
import Loader1 from "./Loader1.jsx";

export const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { totalPatients, newPatientsThisMonth } = useSelector((state) => state.patients);

  useEffect(() => {
    dispatch(fetchTotalPatients());
  }, [dispatch]);

  const filterMap = {
    "All": "",
    "Today": "today",
    "Yesterday": "yesterday",
    "Last Week": "last_week",
    "Last Month": "last_month",
    "Old/Archive": "old",
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/patient?date_filter=${filter}&search=${search}`);
      if (response.status === 200) {
        const mappedData = response.data.results.map((item) => {
          const utcDate = new Date(item.created_at);
          const istDate = new Date(
            utcDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
          );

          const date = istDate.toISOString().split("T")[0];
          const formattedTime = istDate
            .toTimeString()
            .split(":")
            .slice(0, 2)
            .join(":");

          return {
            ...item,
            date,
            time: formattedTime,
          };
        });
        mappedData.sort((a, b) => {
          const dateTimeA = new Date(`${a.date}T${a.time}:00`);
          const dateTimeB = new Date(`${b.date}T${b.time}:00`);
          return dateTimeB - dateTimeA;
        });

        setPatients(mappedData);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();

    const intervalId = setInterval(() => {
      fetchPatients();
    }, 60000);

    return () => clearInterval(intervalId);
  }, [filter]);

  const stats = [
    { label: "Total Patients", value: totalPatients, icon: Users },
    { label: "New This Month", value: newPatientsThisMonth, icon: UserPlus },
  ];

  if (loading) return <Loader1 />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white flex flex-col">
      <NavBar onRefresh={fetchPatients} />

      <div className="flex flex-row items-start justify-between">
        {/* Left: Patients Table (75%) */}
        <div className="w-3/4 overflow-x-auto mt-4 px-4">
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mt-4 px-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchPatients()}
              className="p-2 border rounded-lg w-full md:w-1/2"
              placeholder="Search (Name, Phone)"
            />
            <button
              className="flex items-center px-4 py-2 rounded-md shadow-sm bg-primary text-white hover:bg-primary-light transition-colors duration-200"
              onClick={() => fetchPatients()}
            >
              <Search className="w-5 h-5" />
            </button>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="p-2 border rounded-lg w-1/4"
            >
              {Object.entries(filterMap).map(([label, value]) => (
                <option key={label} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="mt-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-primary-dark sticky top-0 z-10">
                <tr>
                  {["Name", "Age", "Gender", "Phone", "Date", "Time"].map((header) => (
                    <th key={header} className="py-3 px-6 text-white text-left text-sm font-bold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patients.length > 0 ? (
                  patients.map((patient) => {
                    const patientLink = patient.model_output_id
                      ? `/status/${patient.model_output_id}`
                      : `/patient/new?id=${patient.id}&number=${patient.patient_mobile_number}`;

                    return (
                      <motion.tr
                        key={patient.id}
                        className="bg-primary hover:bg-primary-light cursor-pointer transition-all duration-300 border-primary"
                        whileHover={{ scale: 1.0 }}
                        onClick={() => window.location.href = patientLink}
                      >
                        <td className="px-6 py-3 text-white">{patient.patient_name || "New Patient"}</td>
                        <td className="px-6 py-3 text-sm text-white">{patient.patient_age}</td>
                        <td className="px-6 py-3 text-sm text-white">{patient.patient_gender}</td>
                        <td className="px-6 py-3 text-sm text-white">{patient.patient_mobile_number}</td>
                        <td className="px-6 py-3 text-sm text-white">{patient.date}</td>
                        <td className="px-6 py-3 text-sm text-white">{patient.time}</td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-md font-bold">
                      No patient data to display
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Stats (25% full height) */}
        <div className="w-1/4 h-screen bg-gray-200 p-4 flex flex-col justify-center items-center gap-y-12">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.01 }}
              className="flex flex-col items-center gap-2"
            >
              <p className="text-6xl text-text font-bold text-center">{stat.value}</p>
              <p className="text-4xl text-text-dark text-center">{stat.label}</p>
            </motion.div>
          ))}
        </div>

      </div>


      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="bg-white border-t border-primary text-center py-4"
      >
        <p className="text-sm text-text">
          Product by <strong>Gloport Photonix Innovations Pvt Ltd</strong> | ©
          2025 All Rights Reserved
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
