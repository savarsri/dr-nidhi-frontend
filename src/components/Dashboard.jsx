import React, { useEffect, useState } from "react";
import { Users, UserPlus, Layout, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api.js";

export const Dashboard = ({ onLogout }) => {
  const [patients, setPatients] = useState([]);
  const [filter, setFilter] = useState("");
  const [totalPatients, setTotalPatients] = useState([]);
  const [monthPatients, setMonthPatients] = useState(35);
  const [loading, setLoading] = useState(false);

  const filterMap = {
    "Today": "today",
    "Yesterday": "yesterday",
    "Last Week": "last_week",
    "Last Month": "last_month",
    "Old/Archive": "old",
  };

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/patient?date_filter=${filter}`);
      if (response.status === 200) {
        const mappedData = response.data.map((item) => {
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
        setTotalPatients(mappedData.length);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const response = await api.get('/login')
      if (response.status === 200) {
        setTotalPatients(response.data.totalPatients)
        setMonthPatients(response.data.newPatientsThisMonth)
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchPatients();
    fetchData();
  }, [filter]);

  const stats = [
    { label: "Total Patients", value: totalPatients, icon: Users },
    { label: "New This Month", value: monthPatients, icon: UserPlus },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#FDF5F5]">
        <div className="flex flex-col justify-center items-center">
          <div
            className="w-10 h-10 border-4 border-t-4 border-[#FAE8E8] border-solid rounded-full animate-spin"
            style={{ borderTopColor: "#D64545" }}
          ></div>
          <span className="mt-4 text-lg font-medium text-[#2D3436]">
            Loading, please wait...
          </span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
      {/* Navigation */}
      <nav className="bg-white shadow-md transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 relative">
            <div className="flex items-center">
              <Layout className="w-6 h-6 text-primary" />
              <span className="ml-2 text-xl font-semibold text-text">
                Dr. Nidhi
              </span>
            </div>
            <h1 className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold text-text">
              Good Morning, Dr. Abhijeet
            </h1>
            <button
              onClick={onLogout}
              className="flex items-center text-accent hover:text-deeper transition duration-300"
            >
              <LogOut className="w-5 h-5 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <motion.div
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
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 mb-8"
      >
        {stats.map((stat) => (
          <motion.div
            whileHover={{ scale: 1.05 }}
            key={stat.label}
            className="bg-white overflow-hidden shadow-md hover:shadow-lg rounded-lg transition duration-600"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-accent truncate">
                      {stat.label}
                    </dt>
                    <dd className="text-2xl font-semibold text-text">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Patients Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="shadow-md hover:shadow-lg overflow-hidden sm:rounded-lg transition duration-600"
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
                whileHover={{ scale: 1.02 }}
                key={patient.id}
                className="hover:bg-[#FAF2F2] transition duration-300"
                style={{ borderBottom: "1px solid #FAE8E8" }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    to={`/patient/new?id=${patient.id}&number=${patient.patient_mobile_number}`}
                    className="text-sm font-medium text-[#2D3436] hover:underline"
                  >
                    {patient.patient_name || "New Patient"}
                  </Link>
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
