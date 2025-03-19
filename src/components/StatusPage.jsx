import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import MarkdownIt from "markdown-it";
import NavBar from "./NavBar";
import Accordion from "./Accordion";
import Loader1 from "./Loader1";
import { toast, ToastContainer } from "react-toastify";

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

const StatusPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accordions, setAccordion] = useState([]);
  const [visits, setVisits] = useState([]);
  const [updating, setUpdating] = useState({});
  const [globalUpdating, setGlobalUpdating] = useState(false);
  const [selectedRating, setSelectedRating] = useState("");
  const [comment, setComment] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Function to toggle modal
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  // Function to navigate to history page
  const goToHistoryPage = () => {
    navigate("/history"); // Update with your actual route
  };

  // Static titles for accordions
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

  // Function to toggle accordions and fetch data only if it's missing
  const toggleAccordion = (accordionKey) => {
    setAccordion((prevAccordions) =>
      prevAccordions.map((accord) => {
        if (accord.key === accordionKey) {
          if (!accord.data && !updating[accordionKey]) {
            updatePromptOutput(accordionKey);
          }
          return { ...accord, isOpen: !accord.isOpen };
        }
        return accord;
      })
    );
  };

  // Fetch patient status
  async function fetchData(id) {
    try {
      setLoading(true);
      const response = await api.get(`/status/${id}`);
      if (response.status === 200) {
        console.log(response.data);

        setData(response.data);
        setComment(response.data.model_output?.doctor_comment)
        setSelectedRating(response.data.model_output?.doctor_remark)
        setVisits(response.data?.previous_visits)
        const modelOutput = response.data.model_output;

        // Create accordion items with dynamic data
        const newAccordions = accordionTitles.map((title, index) => {
          const outputKey = `output_text_${index + 1}`;
          return {
            key: index + 1,
            title,
            data: modelOutput[outputKey]
              ? mdParser.render(modelOutput[outputKey])
              : null,
            isOpen: index === 0,
          };
        });

        setAccordion(newAccordions);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  // Fire update function only once per key
  async function updatePromptOutput(promptId) {
    if (globalUpdating) return;
    if (updating[promptId]) return;

    setGlobalUpdating(true);
    setUpdating((prev) => ({ ...prev, [promptId]: true }));

    try {
      const response = await api.put(`/generate`, {
        prompt_id: promptId,
        output_id: id,
      });

      if (response.status === 200) {
        // Assume response.data.updatedText holds the new output for the accordion.
        const updatedText = response.data.updatedText;

        // Update only the specific accordion.
        setAccordion((prevAccordions) =>
          prevAccordions.map((acc) =>
            acc.key === promptId
              ? { ...acc, data: mdParser.render(String(updatedText)) }
              : acc
          )
        );
      }
    } catch (error) {
      console.error("Error updating prompt output:", error);
    } finally {
      setGlobalUpdating(false);
      setUpdating((prev) => ({ ...prev, [promptId]: false }));
    }
  }


  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const handleSubmit = async () => {
    if (!selectedRating) {
      toast.warn("Please select a rating");
      return;
    }

    try {
      const response = await api.post("/doctor-remark", {
        output_id: id,
        remark: selectedRating,
        comment: comment?.trim() || "",
      });

      if (response.status === 200) {
        toast.success("Remark submitted successfully!");
        setSelectedRating(null);
        setComment("");
      } else {
        toast.error("Failed to submit remark!");
      }
    } catch (error) {
      console.error("Error submitting remark:", error);
      toast.error("An error occurred while submitting the remark.");
    }
  };

  if (loading) {
    return <Loader1 />;
  }

  return (
    <div>
      <NavBar />
      <ToastContainer />
      <div className="bg-[#FDF5F5] text-[#2D3436] p-5 font-sans">
        <h1 className="text-xl font-bold mb-5">Patient Status</h1>
        {/* Patient Data Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-5">
          {/* Patient Card */}
          <div className="bg-[#F8EAEA] shadow-lg rounded-xl p-8 border border-[#854141] flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="bg-[#B83232] text-white w-24 h-24 flex items-center justify-center text-4xl font-bold rounded-full">
                {data?.patient_data?.name.charAt(0).toUpperCase()}
              </div>

              {/* Name & Contact */}
              <div>
                <h2 className="text-2xl font-bold text-[#2D3436]">{data?.patient_data?.name}</h2>
                <p className="text-lg text-gray-700">📞 {data?.patient_data?.patient_mobile_number}</p>
              </div>
            </div>

            {/* Patient Details */}
            <div className="grid grid-cols-2 gap-6">
              {/* Age & Gender */}
              <div>
                <p className="text-lg text-gray-700 capitalize">⚥ <span className="font-semibold">Gender:</span> {data?.patient_data?.gender}</p>
                <p className="text-lg text-gray-700">🧑 <span className="font-semibold">Age:</span> {data?.patient_data?.age}</p>
              </div>

              {/* Divider */}
              <div className="border-l border-[#854141] pl-6">
                <p className="text-lg text-gray-700">💓 <span className="font-semibold">Heart Rate:</span> {`${data?.sensor_data?.heart_rate} BPM` || "- BPM"}</p>
                <p className="text-lg text-gray-700">🫁 <span className="font-semibold">O₂ Level:</span> {data?.sensor_data?.spo2 || "-"} %</p>
              </div>

              {/* Symptoms */}
              <div className="col-span-2">
                <p className="text-lg text-gray-700"><span className="font-semibold">🩺 Symptoms:</span> {data?.model_output?.symptoms || "No symptoms recorded"}</p>
              </div>

              {/* History */}
              <div className="col-span-2">
                <p className="text-lg text-gray-700"><span className="font-semibold">📜 History:</span> {data?.model_output?.history || "No prior issues"}</p>
              </div>
            </div>
          </div>

          {/* Sensor Data Box */}
          <div className="bg-[#F8EAEA] shadow-lg rounded-xl p-8 border border-[#854141] flex flex-col justify-between gap-6">
            {/* Timestamp */}
            <div>
              <h2 className="text-2xl font-bold text-[#2D3436] mb-2">Sensor Data</h2>
              <p className="text-lg text-gray-700">
                📅 <span className="font-semibold">Data Captured:</span>{" "}
                {new Date(data?.sensor_data?.created_at).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                  timeZone: "Asia/Kolkata",
                })}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[#2D3436] mb-2">Previous Data</h2>
              <p className="text-lg text-gray-700">
                🏥 <span className="font-semibold">Previous Visits:</span>{" "}
                {Array.isArray(visits) ? visits.length : 0}
              </p>
              <p className="text-lg text-gray-700">
                📅 <span className="font-semibold">Last visit date:</span>{" "}
                {Array.isArray(visits) && visits.length > 0
                  ? new Date(visits[0]?.created_at).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                    timeZone: "Asia/Kolkata",
                  })
                  : "No previous visits"}
              </p>

            </div>

            {/* History Button */}
            <div className="text-center">
              <button
                className="bg-[#B83232] text-white py-3 px-6 rounded-lg shadow-md text-lg hover:bg-[#A52828]"
                onClick={toggleModal}
              >
                View Full History
              </button>
            </div>
          </div>
        </div>



        <div>
          {accordions.map((accordion) => (
            <Accordion
              key={accordion.key}
              title={accordion.title}
              data={
                accordion.data ? (
                  <div dangerouslySetInnerHTML={{ __html: accordion.data }} />
                ) : updating[accordion.key] ? (
                  <AccordionLoader />
                ) : null
              }
              isOpen={accordion.isOpen}
              toggleAccordion={() => toggleAccordion(accordion.key)}
            />
          ))}
        </div>

        {/* Table Section */}
        {data && (
          <div className="my-5">
            <table className="w-full border-collapse">
              <thead className="bg-[#854141] text-white">
                <tr>
                  <th className="p-3 border border-[#854141]">Parameter</th>
                  <th className="p-3 border border-[#854141]">Value</th>
                  <th className="p-3 border border-[#854141]">Normal Range</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    parameter: "NH3 (Ammonia)",
                    value: data.sensor_data.nh3 || "-",
                    range: "0.1-2 ppm",
                  },
                  {
                    parameter: "CO (Carbon Monoxide)",
                    value: data.sensor_data.co || "-",
                    range: "0.1-10 ppm",
                  },
                  {
                    parameter: "O2 (Oxygen Level)",
                    value: data.sensor_data.o2 || "-",
                    range: "13-18 %",
                  },
                  {
                    parameter: "CO2 (Carbon Dioxide)",
                    value: data.sensor_data.co2 || "-",
                    range: "20,000-50,000 ppm",
                  },
                  {
                    parameter: "SpO2",
                    value: data.sensor_data.spo2 || "-",
                    range: ">85%",
                  },
                  {
                    parameter: "Heart Rate",
                    value: data.sensor_data.heart_rate || "-",
                    range: "60-100 bpm",
                  },
                  {
                    parameter: "RQ",
                    value: data.sensor_data.rq || "-",
                    range: "0.7 - 1.0",
                  },
                  {
                    parameter: "Hydrogen (H2)",
                    value: data.sensor_data?.hydrogen || "-",
                    range: "0.1-16 ppm",
                  },
                ].map((row, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-[#FAE8E8]" : "bg-white"}
                  >
                    <td className="p-3 border border-[#854141] text-center">
                      {row.parameter}
                    </td>
                    <td className="p-3 border border-[#854141] text-center">
                      {row.value}
                    </td>
                    <td className="p-3 border border-[#854141] text-center">
                      {row.range}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Doctor's Remark Section */}
        <div className="mb-5">
          <h4 className="font-bold mb-2">
            Doctor's Remark [Please share your view about the above Diagnosis
            and Recommendation]
          </h4>
          <div className="flex gap-3 mb-3 justify-center">
            {ratings.map(({ label, emoji }) => (
              <button
                key={label}
                className={`py-3 px-6 rounded-full shadow-md text-md font-semibold transition-all duration-200
        ${selectedRating === label
                    ? "bg-[#B83232] text-white border-2 border-white ring-2 ring-[#D64545] shadow-lg"
                    : "bg-[#FA9999] text-black border border-gray-400 hover:bg-[#B83232] hover:text-white"
                  }`}
                onClick={() => setSelectedRating(label)}
              >
                {emoji} <span className="ml-2">{label}</span>
              </button>
            ))}
          </div>
          <textarea
            className="w-full h-12 border border-[#854141] rounded p-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#854141]"
            placeholder="Leave a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        <div className="text-center">
          <button
            className="bg-[#B83232] text-white py-2 px-6 rounded shadow-lg hover:bg-[#A52828]"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
        <div className="mt-8 p-4 border-t border-gray-300 text-center">
          <p className="text-md text-gray-600">
            <strong>Disclaimer:</strong> AI-generated advice is <strong>not a substitute for professional medical judgment</strong>. Consult other healthcare providers before initiating or changing any treatment.
          </p>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2">
            <h2 className="text-xl font-bold mb-4 text-[#B83232]">Patient Visit History</h2>

            {/* Visit List */}
            <div className="max-h-64 overflow-y-auto">
              {visits?.length > 0 ? (
                <ul className="space-y-3">
                  {visits.map((visit, index) => (
                    <li
                      key={index}
                      className="p-3 bg-gray-100 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-200 transition"
                      onClick={() => {
                        setIsModalOpen(false);
                        navigate(`/status/${visit.id}`);
                      }}
                    >
                      {/* Date */}
                      <span>
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

                      {/* Doctor's Remark */}
                      <span className="text-gray-700 text-sm font-semibold">
                        🩺 Doctor's Remark: {visit.doctor_remark || "No remark"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No previous visits available.</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-5">
              <button
                className="bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500"
                onClick={toggleModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusPage;

const AccordionLoader = () => (
  <div className="flex justify-center items-center bg-[#FDF5F5] py-6">
    <div className="flex flex-col justify-center items-center">
      <div
        className="w-10 h-10 border-4 border-t-4 border-[#FAE8E8] border-solid rounded-full animate-spin"
        style={{ borderTopColor: "#D64545" }}
      ></div>
      <span className="mt-4 text-lg font-medium text-[#2D3436]">
        Dr. NIDHI is analyzing...
      </span>
    </div>
  </div>
);
