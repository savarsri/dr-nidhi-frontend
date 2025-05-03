import { motion } from "framer-motion";
import Chart from "react-apexcharts";
import Select from "react-select";
import { useEffect, useState } from "react";
import api from "../api";
import NavBar from "./NavBar.jsx";
import Loader1 from "./Loader1.jsx";

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [filter, setFilter] = useState("All");
    const [doctorID, setDoctorID] = useState("");
    const [loading, setLoading] = useState(false);
    const [doctors, setDoctors] = useState([]);

    const fetchData = (filterValue = "All", doctorIdValue = "") => {
        setLoading(true);
        api.get(`/admin-dashboard?filter=${filterValue}&doctor_id=${doctorIdValue}`)
            .then(response => {
                setData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Failed to load dashboard data", error);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchData(filter, doctorID);
    }, [filter, doctorID]);

    useEffect(() => {
        api.get("/doctor")
            .then(res => {
                const formatted = res.data.map(doc => ({
                    value: doc.id,
                    label: doc.full_name,
                }));
                setDoctors([{ value: "", label: "All Doctors" }, ...formatted]);
            })
            .catch(err => {
                console.error("Failed to fetch doctors", err);
            });
    }, []);

    if (loading || !data) return <Loader1 />;

    const { patientCounts, deviceDataTotal, newUsers, llmRemarkCounts } = data.chartData;

    const barChartData = {
        options: {
            chart: { id: "llm-remarks" },
            xaxis: { categories: Object.keys(llmRemarkCounts) },
            colors: ["#10B981"],
        },
        series: [
            {
                name: "Doctor Remarks",
                data: Object.values(llmRemarkCounts),
            },
        ],
    };

    

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gray-100 flex flex-col"
        >
            <NavBar />
            <div className="p-6">
                <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                    <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                    <div className="flex items-center gap-4 flex-wrap">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2 border rounded-md shadow-sm text-sm bg-white"
                        >
                            <option value="All">All</option>
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="last_week">Last Week</option>
                            <option value="last_month">Last Month</option>
                            <option value="old">Old</option>
                        </select>
                        <div className="min-w-[200px]">
                            <Select
                                options={doctors}
                                value={doctors.find(d => d.value === doctorID)}
                                onChange={(option) => setDoctorID(option.value)}
                                isSearchable
                                placeholder="Select Doctor"
                            />
                        </div>
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Patients</h2>
                        <p className="text-3xl font-bold text-blue-600">{patientCounts.total}</p>
                        <p className="text-sm text-gray-500 mt-1">Filtered: {patientCounts.filtered}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">New Users</h2>
                        <p className="text-3xl font-bold text-purple-600">{newUsers}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">Device Data Entries</h2>
                        <p className="text-3xl font-bold text-green-600">{deviceDataTotal}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <motion.div
                        className="bg-white p-6 rounded-2xl shadow-lg col-span-1 md:col-span-2"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="text-xl font-semibold mb-4">LLM Doctor Remark Ratings</h2>
                        <Chart
                            options={barChartData.options}
                            series={barChartData.series}
                            type="bar"
                            height={300}
                        />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
