import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Layout, LogOut, Trash, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from "../api.js"

export const Dashboard = ({ onLogout }) => {

  const [patients, setPatients] = useState([])
  const [totalPatients, setTotalPatients] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await api.get('/patient')
      if (response.status === 200) {
        const mappedData = response.data.map((item) => {
          const utcDate = new Date(item.created_at);
          const istDate = new Date(utcDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

          const date = istDate.toISOString().split("T")[0];
          const formattedTime = istDate.toTimeString().split(":").slice(0, 2).join(":");

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
        setTotalPatients(mappedData.length)
        console.log(mappedData);
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }

  }

  useEffect(() => {
    fetchData()
  }, [])

  const stats = [
    { label: 'Total Patients', value: totalPatients, icon: Users },
    { label: 'New This Month', value: totalPatients, icon: UserPlus },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-6 h-6 border-4 border-t-4 border-gray-300 border-solid rounded-full animate-spin border-t-blue-500"></div>
        <span className="ml-3 text-xl text-gray-700">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 relative">
            {/* Left Section */}
            <div className="flex items-center">
              <Layout className="w-6 h-6 text-primary" />
              <span className="ml-2 text-xl font-semibold text-text">Dr. Nidhi</span>
            </div>

            {/* Center Section */}
            <h1 className="absolute left-1/2 transform -translate-x-1/2 text-xl font-bold text-text">
              Good Morning, Dr. Abhijeet
            </h1>

            {/* Right Section */}
            <button onClick={onLogout} className="flex items-center text-accent hover:text-deeper">
              <LogOut className="w-5 h-5 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Tabs Section */}
      <div className="flex gap-3 my-5 justify-center">
        {["Today", "Yesterday", "Last Week", "Last Month", "Old/Archive"].map((tab) => (
          <button
            key={tab}
            className="bg-[#FAE8E8] text-[#2D3436] border border-[#854141] rounded px-3 py-1 shadow-md hover:bg-[#F4DADA]"
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-accent truncate">{stat.label}</dt>
                    <dd className="text-2xl font-semibold text-text">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div
        className="shadow overflow-hidden sm:rounded-lg"
        style={{ background: '#FFFFFF', border: '1px solid #FAE8E8' }}
      >
        <table className="min-w-full divide-y" style={{ borderColor: '#854141' }}>
          <thead style={{ background: '#FAE8E8' }}>
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: '#854141' }}
              >
                Name
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: '#854141' }}
              >
                Age
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: '#854141' }}
              >
                Gender
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: '#854141' }}
              >
                Phone
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: '#854141' }}
              >
                Date
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: '#854141' }}
              >
                Time
              </th>
              <th
                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                style={{ color: '#854141' }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody style={{ background: '#FFFFFF', borderColor: '#854141' }}>
            {patients.map((patient) => (
              <tr key={patient.id} style={{ borderBottom: '1px solid #FAE8E8' }}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className="text-sm font-medium"
                    style={{ color: '#2D3436' }}
                  >
                    {
                      patient.model_output_id ?
                        <Link to={`/status/${patient.model_output_id}`}>
                          {patient.patient_name || "New Patient"}
                        </Link>
                        :
                        <Link to={`/patient/new?id=${patient.id}&number=${patient.patient_mobile_number}`}>
                          {patient.patient_name || "New Patient"}
                        </Link>
                    }
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className="text-sm"
                    style={{ color: '#2D3436' }}
                  >
                    {patient.patient_age}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className="text-sm"
                    style={{ color: '#2D3436' }}
                  >
                    {patient.patient_gender}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className="text-sm"
                    style={{ color: '#2D3436' }}
                  >
                    {patient.patient_mobile_number}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className="text-sm"
                    style={{ color: '#2D3436' }}
                  >
                    {patient.date}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className="text-sm"
                    style={{ color: '#2D3436' }}
                  >
                    {patient.time}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-red-600 hover:text-red-800 mr-4">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    <Trash className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Footer */}
      <div className="bg-background border-t border-accent text-center py-4 mt-4">
        <p className="text-sm text-text">
          Product by <strong>Gloport Photonix Innovations Pvt Ltd</strong> | © 2025 All Rights Reserved
        </p>
      </div>

    </div>
  );
};