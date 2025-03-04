import React, { useEffect, useState } from "react";
import { Users, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api.js";
import NavBar from "./NavBar.jsx";
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
    const lastFetchTime = localStorage.getItem("lastFetchTime");
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    if (!totalPatients || !newPatientsThisMonth || !lastFetchTime || (Date.now() - parseInt(lastFetchTime) >= oneHour)) {
      dispatch(fetchTotalPatients());
    }
  }, [dispatch, totalPatients, newPatientsThisMonth]);

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
  }, [filter]);

  const stats = [
    { label: "Total Patients", value: totalPatients, icon: Users },
    { label: "New This Month", value: newPatientsThisMonth, icon: UserPlus },
  ];

  if (loading) {
    return <Loader1 />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
      <NavBar />
      {/* Tabs */}
      {/* <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex gap-3 my-5 justify-center"
      >
        {["Today", "Yesterday", "Last Week", "Last Month", "Old/Archive"].map(
          (tab) => (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              key={tab}
              onClick={() => {
                const filterValue = filterMap[tab];
                setFilter(filterValue);
                return;
              }}
              className="bg-[#FAE8E8] text-[#2D3436] border border-[#854141] rounded px-3 py-1 shadow-md hover:shadow-lg hover:bg-[#F4DADA] transition duration-600"
            >
              {tab}
            </motion.button>
          )
        )}
      </motion.div> */}

      {/* Stats */}
      <div className="px-4 sm:px-6 lg:px-8 mt-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-between gap-6 mb-4"
        >
          {stats.map((stat) => (
            <motion.div
              whileHover={{ scale: 1.05 }}
              key={stat.label}
              className="bg-white flex-1 max-w-[48%] overflow-hidden shadow-md hover:shadow-lg rounded-lg transition duration-600"
            >
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-accent truncate">
                        {stat.label}
                      </dt>
                      <dd className="text-xl font-semibold text-text">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Patients Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex flex-row mb-2 py-1 justify-between px-5 mx-8 rounded-lg"
        style={{ background: "#FFFFFF", border: "1px solid #FAE8E8" }}
      >
        {/* 
        <label htmlFor="search" className="block text-sm font-medium text-text">
          Search
        </label> */}
        <div className="mt-1">
          <input
            type="text"
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchPatients()}
            className="block w-full px-4 py-3 rounded-lg border border-accent focus:ring-primary focus:border-primary bg-white"
            placeholder="Search (Name, Phone)"
            required
          />
        </div>
        <select
          value={filter}  // Corrected: Use filter directly
          onChange={(e) => setFilter(e.target.value)}  // Corrected: Set filter directly
          className="block px-4 py-3 mt-1 rounded-lg border border-accent focus:ring-primary focus:border-primary bg-white"
        >
          {Object.entries(filterMap).map(([label, value]) => (
            <option key={label} value={value}>
              {label}
            </option>
          ))}
        </select>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="shadow-md hover:shadow-lg overflow-hidden sm:rounded-lg transition duration-600 mx-8"
        style={{ background: "#FFFFFF", border: "1px solid #FAE8E8" }}
      >

        <table
          className="min-w-full divide-y"
          style={{ borderColor: "#854141" }}
        >
          <thead style={{ background: "#FAE8E8" }}>
            <tr>
              {["Name", "Age", "Gender", "Phone", "Date", "Time"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: "#854141" }}
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody style={{ background: "#FFFFFF", borderColor: "#854141" }}>
            {patients.map((patient) => (
              <motion.tr
                whileHover={{ scale: 1.01 }}
                key={patient.id}
                className="hover:bg-[#FAF2F2] transition duration-300"
                style={{ borderBottom: "1px solid #FAE8E8" }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  {patient.model_output_id ? (
                    <Link to={`/status/${patient.model_output_id}`}>
                      {patient.patient_name || "New Patient"}
                    </Link>
                  ) : (
                    <Link
                      to={`/patient/new?id=${patient.id}&number=${patient.patient_mobile_number}`}
                    >
                      {patient.patient_name || "New Patient"}
                    </Link>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D3436]">
                  {patient.patient_age}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D3436]">
                  {patient.patient_gender}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D3436]">
                  {patient.patient_mobile_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D3436]">
                  {patient.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2D3436]">
                  {patient.time}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

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
