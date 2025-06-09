import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import NavBar from "./NavBarNew";
import Loader1 from "./Loader1";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MarkdownIt from "markdown-it";

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
  "Initial Diagnosis",
  "Primary Diagnosis",
  "Organ Impact",
  "Executive Summary",
  "Clinical Analysis",
  "Urgent Alerts",
  "Recommended Actions",
  "Treatment Plan & Recommendations",
  "Prognostic Insights",
  "Attachments",
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

  const toggleModal = () => setIsModalOpen(prev => !prev);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);
      try {
        const response = await api.get(`/status/${id}`);
        if (response.status === 200) {
          const respData = response.data;
          console.log(respData);
          
          setData(respData);
          setVisits(respData.previous_visits || []);
          setComment(respData.model_output?.doctor_comment || "");
          setSelectedRating(respData.model_output?.doctor_remark || "");

          const modelOutput = respData.model_output || {};
          const init = accordionTitles.map((title, idx) => {
            const key = idx + 1;
            const field = `output_text_${key}`;
            const raw = modelOutput[field];
            return {
              key,
              title,
              data: raw ? mdParser.render(String(raw)) : null,
            };
          });
          setAccordions(init);
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

  const updatePromptOutput = async (promptId) => {
    if (globalUpdating || updating[promptId]) return;
    setGlobalUpdating(true);
    setUpdating(prev => ({ ...prev, [promptId]: true }));
    try {
      const response = await api.put(`/generate`, {
        prompt_id: promptId,
        output_id: id,
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGlobalUpdating(false);
      setUpdating(prev => ({ ...prev, [promptId]: false }));
    }
  };

  const handleTabClick = (key) => {
    setSelectedTab(key);
    const acc = accordions.find(a => a.key === key);
    if (acc && !acc.data && !updating[key]) {
      updatePromptOutput(key);
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
  // Respiratory Quotient (use provided RQ or calculate if needed)
  const RQ = s.rq ?? 0;

  // Metabolic Efficiency Index (MEI) = (O2% * 10,000) / (CO2(ppm) + NH3(ppm))
  const MEI =
    s.o2 && (s.co2 !== null) && (s.nh3 !== null)
      ? (s.o2 * 10000) / (s.co2 + s.nh3)
      : null;

  // Detox Load Ratio (DLR) = (NH3(ppm) + CO(ppm)) / O2(%)
  const DLR = s.o2
    ? ((s.nh3 || 0) + (s.co || 0)) / s.o2
    : null;

  // Oxygen Utilization Factor (OUF) = SpO2(%) / O2(%)
  const OUF = s.o2 ? s.spo2 / s.o2 : null;

  // Stress Load Index (SLI) = (HeartRate × CO(ppm)) / O2(%)
  const SLI = s.o2
    ? (s.heart_rate * (s.co || 0)) / s.o2
    : null;

  // STATUS DETERMINATION FUNCTIONS
  const getRQStatus = (value) => {
    if (value > 0.95) return "Elevated";
    if (value >= 0.75 && value <= 0.95) return "Normal";
    return "Moderate";
  };

  const getMEIStatus = (value) => {
    if (value > 5.0) return "Good";
    if (value >= 3.0 && value <= 5.0) return "Moderate";
    return "Poor";
  };

  const getDLRStatus = (value) => {
    if (value < 0.5) return "Good";
    if (value >= 0.5 && value <= 1.0) return "Moderate";
    return "Elevated";
  };

  const getOUFStatus = (value) => {
    if (value > 5.5) return "Good";
    if (value >= 4.0 && value <= 5.5) return "Normal";
    return "Poor";
  };

  const getSLIStatus = (value) => {
    if (value < 30) return "Good";
    if (value >= 30 && value <= 60) return "Moderate";
    return "Elevated";
  };

  // Assign computed statuses
  const rqStatus = getRQStatus(RQ);
  const meiStatus = MEI !== null ? getMEIStatus(MEI) : "N/A";
  const dlrStatus = DLR !== null ? getDLRStatus(DLR) : "N/A";
  const oufStatus = OUF !== null ? getOUFStatus(OUF) : "N/A";
  const sliStatus = SLI !== null ? getSLIStatus(SLI) : "N/A";

  // Adjust max height for left-middle to account for NavBar
  const leftMiddleMaxHeight = "calc(100vh - 4rem)";

  return (
    <>
      <NavBar />
      <ToastContainer />

      <div className="flex bg-white px-4">
        <div
          className="flex-1 overflow-y-hidden overflow-x-hidden"
          style={{ maxHeight: leftMiddleMaxHeight }}
        >
          <div className="flex space-x-2">
            {/* Left Section */}
            <div className="w-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 flex-shrink-0">
              {/* Patient Header */}
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-gray-700">
                  PATIENT RECORD
                </h2>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {data.patient_data?.name || "—"}
                </p>
              </div>

              {/* Patient Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-3 mb-4 text-sm">
                <div className="flex items-center space-x-1">
                  <span className="font-medium text-gray-600">GENDER:</span>
                  <span className="text-accent capitalize">
                    {data.patient_data?.gender || "—"}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-medium text-gray-600">PH. NO.:</span>
                  <span className="text-accent">
                    {data.patient_data?.patient_mobile_number || "—"}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-medium text-gray-600">AGE:</span>
                  <span className="text-accent">
                    {data.patient_data?.age ?? "—"}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-medium text-gray-600">
                    HEART RATE:
                  </span>
                  <span className="text-accent">
                    {data.sensor_data?.heart_rate
                      ? `${data.sensor_data.heart_rate} BPM`
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="font-medium text-gray-600">
                    O₂ LEVELS:
                  </span>
                  <span className="text-accent">
                    {data.sensor_data?.spo2
                      ? `${data.sensor_data.spo2} %`
                      : "—"}
                  </span>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <span className="font-medium text-gray-600">SYMPTOMS:</span>{" "}
                  <span className="text-accent">
                    {data.model_output?.symptoms || "none"}
                  </span>
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <span className="font-medium text-gray-600">HISTORY:</span>{" "}
                  <span className="text-accent">
                    {data.model_output?.history || "none"}
                  </span>
                </div>
              </div>

              {/* Tab Buttons */}
              <div className="flex flex-wrap gap-1 mb-3">
                {accordions.map(acc => (
                  <button
                    key={acc.key}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition ${selectedTab === acc.key
                        ? "bg-text text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    onClick={() => handleTabClick(acc.key)}
                  >
                    {acc.title}
                  </button>
                ))}
              </div>

              {/* Tab Content Box */}
              <div className="bg-white border border-gray-300 rounded p-3 min-h-[150px] max-h-[300px] overflow-y-auto text-sm leading-normal">
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
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: current.data }}
                    />
                  ) : (
                    <p className="text-gray-500 text-center">No content.</p>
                  );
                })()}
              </div>
            </div>

            {/* Middle Section */}
            <div className="w-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 flex-shrink-0">
              {/* Metrics Table */}
              <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-700 mb-2">
                  Metric
                </h4>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="p-1 border-b border-gray-300 text-gray-600">
                        Metric
                      </th>
                      <th className="p-1 border-b border-gray-300 text-gray-600">
                        Value
                      </th>
                      <th className="p-1 border-b border-gray-300 text-gray-600">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        metric: "Respiratory Quotient (RQ)",
                        value: RQ !== null ? RQ.toFixed(2) : "—",
                        status: rqStatus,
                      },
                      {
                        metric: "Metabolic Efficiency Index (MEI)",
                        value: MEI !== null ? MEI.toFixed(2) : "—",
                        status: MEI !== null ? meiStatus : "N/A",
                      },
                      {
                        metric: "Detox Load Ratio (DLR)",
                        value: DLR !== null ? DLR.toFixed(2) : "—",
                        status: DLR !== null ? dlrStatus : "N/A",
                      },
                      {
                        metric: "Oxygen Utilization Factor (OUF)",
                        value: OUF !== null ? OUF.toFixed(2) : "—",
                        status: OUF !== null ? oufStatus : "N/A",
                      },
                      {
                        metric: "Stress Load Index (SLI)",
                        value: SLI !== null ? SLI.toFixed(2) : "—",
                        status: SLI !== null ? sliStatus : "N/A",
                      },
                    ].map((row, idx) => (
                      <tr key={idx}>
                        <td className="p-1 border-b border-gray-200 text-gray-800">
                          {row.metric}
                        </td>
                        <td className="p-1 border-b border-gray-200 text-gray-800">
                          {row.value}
                        </td>
                        <td
                          className={`p-1 border-b border-gray-200 font-medium ${row.status === "Good"
                              ? "text-green-600"
                              : row.status === "Normal"
                                ? "text-green-600"
                                : row.status === "Moderate"
                                  ? "text-yellow-600"
                                  : row.status === "Poor"
                                    ? "text-red-600"
                                    : row.status === "Elevated"
                                      ? "text-red-600"
                                      : "text-gray-500"
                            }`}
                        >
                          {row.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-gray-200 mb-4"></div>

              {/* Clinical Alerts */}
              <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-700 mb-1">
                  Clinical Alerts
                </h4>
                <ul className="list-disc list-inside text-gray-800 text-sm">
                  <li>Risk of metabolic acidosis</li>
                </ul>
              </div>

              <div className="border-t border-gray-200 mb-4"></div>

              {/* Clinical Interpretation */}
              <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-700 mb-1">
                  Clinical Interpretation
                </h4>
                <ul className="list-disc list-inside text-gray-800 text-sm">
                  <li>Moderately impaired metabolic efficiency (MEI)</li>
                  <li>Increased detoxification burden per DLR</li>
                </ul>
              </div>

              <div className="border-t border-gray-200 mb-4"></div>

              {/* Suggested Actions */}
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-1">
                  Suggested Actions
                </h4>
                <ul className="list-disc list-inside text-gray-800 text-sm">
                  <li>Consider evaluation of acid-base status</li>
                  <li>Assess diet and energy expenditure</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */} 
        <div className="w-80 flex-shrink-0 flex flex-col justify-center items-center bg-gray-100">
          <div className="w-full px-4">
            <button
              className="w-full bg-deeper text-white font-medium py-1 rounded hover:bg-deeper-light mb-3"
              onClick={toggleModal}
            >
              View History
            </button>

            <label className="block text-primary-dark font-semibold mb-1 text-lg">
              Doctor’s Remarks:
            </label>
            <div className="flex flex-wrap gap-3 mb-5 justify-center">
              {ratings.map(({ label, emoji }) => (
                <button
                  key={label}
                  className={`py-3 px-6 rounded-full text-sm md:text-md font-semibold transition-all duration-200 shadow-sm
          ${selectedRating === label
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

            <div className="mt-3">
              <button
                className="w-full bg-primary text-white font-medium py-1 rounded hover:bg-primary-light"
                onClick={handleSubmitRemark}
              >
                Submit Remark
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl">
            <h2 className="text-xl font-bold text-gray-700 mb-4 text-center">
              Patient Visit History
            </h2>
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
                      <span className="text-sm text-gray-700">
                        🗓️{" "}
                        {new Date(visit.created_at).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                          timeZone: "Asia/Kolkata",
                        })}
                      </span>
                      <span className="text-sm text-gray-700 font-semibold">
                        🩺 Doctor’s Remark: {visit.doctor_remark || "No remark"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center">
                  No previous visits available.
                </p>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500"
                onClick={toggleModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StatusPage;
