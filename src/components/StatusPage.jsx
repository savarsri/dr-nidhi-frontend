import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import MarkdownIt from "markdown-it";
import NavBar from "./NavBar";
import Accordion from "./Accordion";
import Loader1 from "./Loader1";

const mdParser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

const StatusPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accordions, setAccordion] = useState([]);
  const [updating, setUpdating] = useState({});

  // Static titles for accordions
  const accordionTitles = [
    "Comprehensive Diagnosis",
    "Clinical Analysis",
    "Urgent Alerts",
    "Recommended Actions",
    "Treatment Plan & Recommendations",
    "Prognostic Insights",
    "Executive Summary",
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
        setData(response.data);
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
            isOpen: false,
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
    if (updating[promptId]) return; // Prevent duplicate calls

    setUpdating((prev) => ({ ...prev, [promptId]: true }));

    try {
      const response = await api.put(`/generate`, {
        prompt_id: promptId,
        output_id: id
      });

      if (response.status === 200) {
        fetchData(id); // Refetch the data after successful update
      }
    } catch (error) {
      console.error("Error updating prompt output:", error);
    } finally {
      setUpdating((prev) => ({ ...prev, [promptId]: false }));
    }
  }

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  if (loading) {
    return <Loader1 />;
  }

  return (
    <div>
      <NavBar />
      <div className="bg-[#FDF5F5] text-[#2D3436] p-5 font-sans">
        <h1 className="text-xl font-bold mb-5">Patient Status</h1>

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
                    value: data.sensor_data.nh3 || "90 ppm",
                    range: "15-45 ppm",
                  },
                  {
                    parameter: "CO (Carbon Monoxide)",
                    value: data.sensor_data.co || "18 ppm",
                    range: "<9 ppm",
                  },
                  {
                    parameter: "O2 (Oxygen Level)",
                    value: data.sensor_data.o2 || "80 %Vol",
                    range: "75-100 %Vol",
                  },
                  {
                    parameter: "CO2 (Carbon Dioxide)",
                    value: data.sensor_data.co2 || "30,000 ppm",
                    range: "20,000-30,000 ppm",
                  },
                  {
                    parameter: "SpO2",
                    value: data.sensor_data.spo2 || "88%",
                    range: ">85%",
                  },
                  {
                    parameter: "Heart Rate",
                    value: data.sensor_data.heart_rate || "115 bpm",
                    range: "60-100 bpm",
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
            {[
              { label: "Excellent", emoji: "😊" },
              { label: "Good", emoji: "🙂" },
              { label: "Average", emoji: "😐" },
              { label: "Poor", emoji: "☹️" },
              { label: "Bad", emoji: "😡" },
            ].map(({ label, emoji }) => (
              <button
                key={label}
                className="bg-[#D64545] text-white py-2 px-4 rounded-full shadow-md hover:bg-[#B83232]"
              >
                {emoji} <span className="ml-1">{label}</span>
              </button>
            ))}
          </div>
          <textarea
            className="w-full h-12 border border-[#854141] rounded p-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#854141]"
            placeholder="Leave a comment..."
          />
        </div>

        <div className="text-center">
          <button
            className="bg-[#B83232] text-white py-2 px-6 rounded shadow-lg hover:bg-[#A52828]"
          >
            Submit
          </button>
        </div>
      </div>
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
