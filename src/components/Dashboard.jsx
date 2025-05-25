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
      className="min-h-screen bg-background">
      <NavBar />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 mt-4">
        {stats.map((stat) => (
          <motion.div key={stat.label} whileHover={{ scale: 1.01 }} className="bg-white p-4 shadow-md rounded-lg flex items-center">
            <stat.icon className="w-6 h-6 text-primary" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-lg font-semibold">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

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
          className="flex items-center px-4 py-2 rounded-md shadow-sm"
          style={{
            background: '#D64545',
            color: '#FFFFFF',
            border: 'none'
          }}
          onClick={() => fetchPatients()}
        >
          <Search className="w-5 h-5" />
        </button>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border rounded-lg w-full md:w-1/4"
        >
          {Object.entries(filterMap).map(([label, value]) => (
            <option key={label} value={value}>{label}</option>
          ))}
        </select>
        <button onClick={fetchPatients} className="p-2 bg-primary text-white rounded-lg w-full md:w-auto">Refresh</button>
      </div>

      {/* Patients Table */}
      <div className="overflow-x-auto mt-4 px-4">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-[#FAE8E8]">
            <tr>
              {["Name", "Age", "Gender", "Phone", "Date", "Time"].map((header) => (
                <th key={header} className="py-2 px-4 text-left text-sm font-medium">{header}</th>
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
                    className="border-b hover:bg-[#FAF2F2] cursor-pointer transition-all duration-300"
                    whileHover={{ scale: 1.01 }}
                    onClick={() => window.location.href = patientLink} // Redirect on row click
                  >
                    <td className="px-4 py-2">{patient.patient_name || "New Patient"}</td>
                    <td className="px-4 py-2 text-sm">{patient.patient_age}</td>
                    <td className="px-4 py-2 text-sm">{patient.patient_gender}</td>
                    <td className="px-4 py-2 text-sm">{patient.patient_mobile_number}</td>
                    <td className="px-4 py-2 text-sm">{patient.date}</td>
                    <td className="px-4 py-2 text-sm">{patient.time}</td>
                  </motion.tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-2 text-center text-sm">
                  No patient data to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="bg-background border-t border-accent text-center py-4 mt-4"
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
