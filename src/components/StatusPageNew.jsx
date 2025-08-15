import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import NavBar from "./NavBarNew";
import Loader1 from "./Loader1";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MarkdownIt from "markdown-it";
import { motion } from "framer-motion";

const mdParser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

const ratings = [
  { label: "Excellent", emoji: "😊" },
  { label: "Good", emoji: "🙂" },
  { label: "Average", emoji: "😐" },
  { label: "Poor", emoji: "☹️" },
  { label: "Bad", emoji: "😡" },
];

const accordionTitles = [
  { id: 3, title: "Organ Impact" },
  { id: 4, title: "Executive Summary" },
  { id: 1, title: "Initial Diagnosis" },
  { id: 2, title: "Primary Diagnosis" },
  { id: 5, title: "Clinical Analysis" },
  { id: 6, title: "Urgent Alerts" },
  { id: 7, title: "Recommended Actions" },
  { id: 8, title: "Treatment Plan & Recommendations" },
  { id: 9, title: "Prognostic Insights" },
  { id: 10, title: "Attachments" }
];

const StatusPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visits, setVisits] = useState([]);
  const [accordions, setAccordions] = useState([]);
  const [updating, setUpdating] = useState({});
  const [globalUpdating, setGlobalUpdating] = useState(false);
  const [comment, setComment] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(null);
  const [selectedRating, setSelectedRating] = useState("");
  const [tableHtml, setTableHtml] = useState("");

  const toggleModal = () => setIsModalOpen(prev => !prev);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);
      try {
        const response = await api.get(`/status/${id}`);
        if (response.status === 200) {
          const respData = response.data;
          setData(respData);
          setVisits(respData.previous_visits || []);
          setComment(respData.model_output?.doctor_comment || "");
          setSelectedRating(respData.model_output?.doctor_remark || "");

          const modelOutput = respData.model_output || {};
          const init = accordionTitles.map((acc) => {
            const key = acc.id;
            const field = `output_text_${key}`;
            const raw = modelOutput[field];
            return {
              key,
              title: acc.title,
              data: raw ? mdParser.render(String(raw)) : null,
            };
          });
          setAccordions(init);
          const table = modelOutput.output_text_11 ? mdParser.render(String(modelOutput.output_text_11)) : "No Suggestions"
          setTableHtml(table);
          setSelectedTab(init[0]?.key);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const updatePromptOutput = async (promptId, reload) => {
    if (globalUpdating || updating[promptId]) return;
    // Check Redis prompt status before allowing refresh
    setGlobalUpdating(true);
    setUpdating(prev => ({ ...prev, [promptId]: true }));
    try {
      const status = await checkPromptStatus(promptId);
      if (["pending", "processing"].includes(status)) {
        toast.info("This prompt is still being generated. Please try again in a moment.");
        return;
      }
      const response = await api.put(`/generate`, {
        prompt_id: promptId,
        output_id: id,
        reload: reload
      });
      if (response.status === 200) {
        const updatedText = response.data.updatedText || "";
        setAccordions(prev =>
          prev.map(acc =>
            acc.key === promptId
              ? { ...acc, data: mdParser.render(String(updatedText)) }
              : acc
          )
        );
      } else if (response.status === 202) {
        toast.info("This prompt is still being generated. Please try again in a moment.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to reload content.");
    } finally {
      setGlobalUpdating(false);
      setUpdating(prev => ({ ...prev, [promptId]: false }));
    }
  };


  const handleTabClick = (key) => {
    setSelectedTab(key);
    const acc = accordions.find(a => a.key === key);
    if (acc && !acc.data && !updating[key]) {
      updatePromptOutput(key, false);
    }
  };

  const checkPromptStatus = async (promptId) => {
    try {
      const response = await api.get(`/prompt-status`, {
        params: {
          output_id: id,
          prompt_id: promptId,
        },
      });
      return response.data.status;
    } catch {
      return "error";
    }
  };


  const handleSubmitRemark = async () => {
    if (!selectedRating) {
      toast.warn("Please select a rating before submitting.");
      return;
    }
    if (!comment.trim()) {
      toast.warn("Please enter a remark before submitting.");
      return;
    }
    try {
      const response = await api.post("/doctor-remark", {
        output_id: id,
        remark: selectedRating,
        comment: comment?.trim() || "",
      });
      if (response.status === 200) {
        toast.success("Remark submitted.");
      } else {
        toast.error("Failed to submit remark.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while submitting the remark.");
    }
  };

  if (loading || !data) return <Loader1 />;

  // SENSOR-BASED METRIC CALCULATIONS
  const s = data.sensor_data;
  const RQ = s.rq ?? 0;
  const MEI = s.o2 && (s.co2 !== null) && (s.nh3 !== null)
    ? (s.o2 * 10000) / (s.co2 + s.nh3)
    : null;
  const DLR = s.o2
    ? ((s.nh3 || 0) + (s.co || 0)) / s.o2
    : null;
  const OUF = s.o2 ? s.spo2 / s.o2 : null;
  const SLI = s.o2
    ? (s.heart_rate * (s.co || 0)) / s.o2
    : null;

  const getRQStatus = (v) => v > 0.95 ? "Elevated" : v >= 0.75 && v <= 0.95 ? "Normal" : "Moderate";
  const getMEIStatus = (v) => v > 5.0 ? "Good" : v >= 3.0 && v <= 5.0 ? "Moderate" : "Poor";
  const getDLRStatus = (v) => v < 0.5 ? "Good" : v >= 0.5 && v <= 1.0 ? "Moderate" : "Elevated";
  const getOUFStatus = (v) => v > 5.5 ? "Good" : v >= 4.0 && v <= 5.5 ? "Normal" : "Poor";
  const getSLIStatus = (v) => v < 30 ? "Good" : v >= 30 && v <= 60 ? "Moderate" : "Elevated";

  const rqStatus = getRQStatus(RQ);
  const meiStatus = MEI !== null ? getMEIStatus(MEI) : "N/A";
  const dlrStatus = DLR !== null ? getDLRStatus(DLR) : "N/A";
  const oufStatus = OUF !== null ? getOUFStatus(OUF) : "N/A";
  const sliStatus = SLI !== null ? getSLIStatus(SLI) : "N/A";

  return (
    <>
      <NavBar />
      <ToastContainer />
      <div className="flex flex-col md:flex-row bg-white px-4 h-screen">
        {/* Left & Middle combined for responsive layout */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Section */}
          <div className="w-full md:w-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 flex-shrink-0 flex flex-col">
            {/* Patient Header */}
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-gray-700">PATIENT RECORD</h2>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {data.patient_data?.name || "—"}
              </p>
            </div>
            {/* Patient Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-3 mb-4 text-sm">
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-gray-700">GENDER:</span>
                <span className="text-accent capitalize">
                  {data.patient_data?.gender || "—"}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-gray-700">PH. NO.:</span>
                <span className="text-accent">
                  {data.patient_data?.patient_mobile_number || "—"}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-gray-700">AGE:</span>
                <span className="text-accent">
                  {data.patient_data?.age ?? "—"}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-gray-700">HEART RATE:</span>
                <span className="text-accent">
                  {data.sensor_data?.heart_rate
                    ? `${data.sensor_data.heart_rate} BPM`
                    : "—"}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-gray-700">O₂ LEVELS:</span>
                <span className="text-accent">
                  {data.sensor_data?.spo2
                    ? `${data.sensor_data.spo2} %`
                    : "—"}
                </span>
              </div>
              {/* <div className="col-span-1 sm:col-span-2"> */}
              {/* HISTORY */}
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-gray-700">HISTORY:</span>
                <div className="relative group max-w-xs">
                  {/* truncated summary */}
                  <span className="block truncate text-accent">
                    {data.model_output?.history || "-"}
                  </span>

                  {/* custom tooltip */}
                  <div
                    className="
                      absolute 
                      left-0 
                      bottom-full 
                      mb-2 
                      w-max 
                      max-w-sm 
                      p-2 
                      bg-gray-800 
                      text-white 
                      text-sm 
                      rounded-lg 
                      shadow-lg 
                      opacity-0 
                      pointer-events-none 
                      transition-opacity 
                      group-hover:opacity-100
                    "
                  >
                    {data.model_output?.history}
                  </div>
                </div>
              </div>

              {/* SYMPTOMS */}
              <div className="flex items-center space-x-1 mt-2">
                <span className="font-semibold text-gray-700">SYMPTOMS:</span>
                <div className="relative group max-w-xs">
                  <span className="block truncate text-accent">
                    {data.model_output?.symptoms || "-"}
                  </span>

                  <div
                    className="
                      absolute 
                      left-0 
                      bottom-full 
                      mb-2 
                      w-max 
                      max-w-sm 
                      p-2 
                      bg-gray-800 
                      text-white 
                      text-sm 
                      rounded-lg 
                      shadow-lg 
                      opacity-0 
                      pointer-events-none 
                      transition-opacity 
                      group-hover:opacity-100
                    "
                  >
                    {data.model_output?.symptoms}
                  </div>
                </div>
              </div>

            </div>
            {/* Tab Buttons & Reload */}
            <div className="flex flex-wrap gap-2 mb-3">
              {accordions.map(acc => (
                <div
                  key={acc.key}
                  className="
        flex 
        items-center 
        divide-x divide-gray-300 
        bg-gray-100 
        rounded-full 
        overflow-hidden
      ">

                  {/* Tab button */}
                  <button
                    className={`
          px-3 py-1 text-sm font-medium transition 
          ${selectedTab === acc.key
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                      }
          first:pl-4 last:pr-4
        `}
                    onClick={() => handleTabClick(acc.key)}
                  >
                    {acc.title}
                  </button>

                  {/* Reload button */}
                  <button
                    className="
          px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 
          disabled:opacity-50
        "
                    disabled={updating[acc.key]}
                    onClick={() => updatePromptOutput(acc.key, true)}
                    title="Reload"
                  >
                    🔄
                  </button>
                </div>
              ))}
            </div>

            {/* Tab Content Box */}
            <div className="flex-1 overflow-auto border border-gray-300 rounded p-3 prose prose-sm leading-normal text-sm">
              {(() => {
                const current = accordions.find(a => a.key === selectedTab);
                if (!current) return null;
                if (updating[current.key]) {
                  return (
                    <div className="flex justify-center items-center py-4">
                      <div className="flex flex-col justify-center items-center">
                        <div
                          className="w-8 h-8 border-4 border-t-4 border-[#FAE8E8] border-solid rounded-full animate-spin"
                          style={{ borderTopColor: "#D64545" }}
                        ></div>
                        <span className="mt-2 text-base font-medium text-[#2D3436]">
                          Dr. NIDHI is analyzing...
                        </span>
                      </div>
                    </div>
                  );
                }
                return current.data ? (
                  <div className="text-lg text-gray-700">
                    <div dangerouslySetInnerHTML={{ __html: current.data }} />
                  </div>
                ) : (
                  <p className="text-gray-500 text-center">No content.</p>
                );
              })()}
            </div>
          </div>

          {/* Middle Section */}
          <div className="w-full md:w-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 overflow-auto">
            {/* Metrics Table */}
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Metric</h4>
              <table className="w-full text-left border-collapse text-md">
                <thead>
                  <tr>
                    <th className="p-1 border-b border-gray-300 text-gray-600">Metric</th>
                    <th className="p-1 border-b border-gray-300 text-gray-600">Value</th>
                    <th className="p-1 border-b border-gray-300 text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { metric: "Respiratory Quotient (RQ)", value: RQ.toFixed(2), status: rqStatus },
                    { metric: "Metabolic Efficiency Index (MEI)", value: MEI?.toFixed(2) ?? "—", status: meiStatus },
                    { metric: "Detox Load Ratio (DLR)", value: DLR?.toFixed(2) ?? "—", status: dlrStatus },
                    { metric: "Oxygen Utilization Factor (OUF)", value: OUF?.toFixed(2) ?? "—", status: oufStatus },
                    { metric: "Stress Load Index (SLI)", value: SLI?.toFixed(2) ?? "—", status: sliStatus },
                  ].map((row, idx) => (
                    <tr key={idx}>
                      <td className="p-1 border-b border-gray-200 text-gray-800">{row.metric}</td>
                      <td className="p-1 border-b border-gray-200 text-gray-800">{row.value}</td>
                      <td className={`p-1 border-b border-gray-200 font-medium ${row.status === "Good" || row.status === "Normal"
                        ? "text-green-600"
                        : row.status === "Moderate"
                          ? "text-yellow-600"
                          : "text-red-600"
                        }`}>{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Clinical Alerts */}
            {tableHtml !== null ? (<div className="text-lg text-gray-700">
              <div dangerouslySetInnerHTML={{ __html: tableHtml }} />
            </div>) : (
              <p className="text-gray-500 text-center">No content.</p>
            )}

          </div>
        </div>

        {/* Right Section */}
        <div className="w-full md:w-80 flex-shrink-0 flex flex-col justify-center items-center bg-gray-100 p-4 overflow-auto">
          <button
            className="w-full bg-deeper text-white font-medium py-1 rounded hover:bg-deeper-light mb-3"
            onClick={toggleModal}
          >
            View History
          </button>

          <label className="block text-primary-dark font-semibold mb-1 text-lg">Doctor’s Remarks:</label>
          <div className="flex flex-wrap gap-3 mb-5 justify-center">
            {ratings.map(({ label, emoji }) => (
              <button
                key={label}
                className={`py-3 px-6 rounded-full text-md md:text-md transition-all duration-200 shadow-sm ${selectedRating === label
                  ? "bg-text text-white border-2 border-white ring-2 ring-text-dark shadow-md"
                  : "bg-text-light text-white border border-gray-400 hover:bg-text hover:text-white"
                  }`}
                onClick={() => setSelectedRating(label)}
              >
                {emoji} <span className="ml-2">{label}</span>
              </button>
            ))}
          </div>
          <textarea
            className="w-full h-48 border border-gray-300 rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="Type your remarks here…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <div className="mt-3 w-full">
            <button
              className="w-full bg-primary text-white font-medium py-1 rounded hover:bg-primary-light"
              onClick={handleSubmitRemark}
            >Submit Remark</button>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl">
              <h2 className="text-xl font-bold text-gray-700 mb-4 text-center">Patient Visit History</h2>
              <div className="max-h-80 overflow-y-auto">
                {visits.length > 0 ? (
                  <ul className="space-y-3">
                    {visits.map((visit, idx) => (
                      <li
                        key={idx}
                        className="p-3 bg-gray-100 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-200 transition"
                        onClick={() => {
                          setIsModalOpen(false);
                          navigate(`/status/${visit.id}`);
                        }}
                      >
                        <span className="text-sm text-gray-700 truncate max-w-xs" title={new Date(visit.created_at).toLocaleString()}>
                          🗓️ {new Date(visit.created_at).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                            timeZone: "Asia/Kolkata",
                          })}
                        </span>
                        <span className="text-sm text-gray-700 font-semibold truncate max-w-xs" title={visit.doctor_remark}>
                          🩺 Doctor’s Remark: {visit.doctor_remark || "No remark"}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center">No previous visits available.</p>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500"
                  onClick={toggleModal}
                >Close</button>
              </div>
            </div>
          </div>
        )}
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
    </>
  );
};

export default StatusPage;
