import { useEffect, useState } from "react";
import "../index.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import MarkdownIt from "markdown-it";
import NavBar from "./NavBar";
import Loader1 from "./Loader1"

const mdParser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

const StatusPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState();
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchData(id) {
    try {
      setLoading(true)
      const response = await api.get(`/status/${id}`);
      if (response.status === 200) {
        setData(response.data);
        setHtmlContent(response.data.model_output.output_text);
      }
    } catch (error) {
      navigate(-1);
      console.error("Error fetching data:", error);
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  useEffect(() => {
    if (data) {
      const parsedContent = mdParser.render(data.model_output.output_text);
      setHtmlContent(parsedContent);
    }
  }, [data]);

  if (loading) {
    return <Loader1 />
  }

  return (
    <div>
      <NavBar />
      <div className="bg-[#FDF5F5] text-[#2D3436] p-5 font-sans">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-5 border-b border-[#854141] pb-3">
          <div className="flex items-center">
            <img
              src="https://i.postimg.cc/tTqFRJZY/Cancer-Logo.png"
              alt="Logo"
              className="w-16 h-16 mr-3"
            />
            <h1 className="text-xl font-bold">Patient Status</h1>
          </div>
          <Link
            to="/PatientHistory"
            className="bg-[#B83232] text-white py-1 px-4 rounded shadow-md hover:bg-[#A52828]"
          >
            Patient History
          </Link>
        </div>

        {/* Organ Health Section */}
        {data && (
          <div className="mb-5">
            {/* <h4 className="font-bold mb-2">Detailed Diagnosis and Treatment</h4> */}
            {/* <textarea
          className="w-full h-96 border border-[#854141] rounded p-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#854141]"
          readOnly
          value={`#### 1. **Hyperammonemia**
- **Diagnosis**: Elevated ammonia levels (90 µg/dL) indicate hyperammonemia, which is commonly associated with liver dysfunction, such as hepatic encephalopathy.
- **Organ Impact**: Primarily affects the liver and brain. High ammonia levels can lead to cerebral edema and neurological symptoms like confusion.
- **Treatment**:
  - **Medications**:
    - Lactulose to reduce ammonia absorption from the gut.
    - Rifaximin, an antibiotic, to decrease ammonia-producing bacteria in the gut.
  - **Dietary Modifications**: Low-protein diet to decrease ammonia production.
  - **Monitoring**: Regular monitoring of ammonia levels and liver function tests.

#### 2. **Carbon Monoxide Poisoning**
- **Organ Impact**: Affects the cardiovascular system by binding to hemoglobin, reducing oxygen delivery to tissues, and can lead to tissue hypoxia.
- **Treatment**:
  - **Immediate Action**: Remove the patient from the source of carbon monoxide.
  - **Medications**: 100% oxygen therapy to displace carbon monoxide from hemoglobin.
  - **Hyperbaric Oxygen Therapy**: If available and severe symptoms are present.

#### 3. **Hypoxemia and Hypercapnia**
- **Diagnosis**: Low oxygen saturation (SpO2 88%) and elevated carbon dioxide levels (55 mmHg) indicate hypoxemia and hypercapnia, suggesting respiratory insufficiency.
- **Organ Impact**: Primarily affects the respiratory system but can lead to systemic effects due to poor oxygenation and CO2 retention.
- **Treatment**:
  - **Oxygen Therapy**: Administer supplemental oxygen to improve SpO2 levels.
  - **Bronchodilators**: If underlying COPD or asthma is suspected, medications like albuterol can be used.
  - **Ventilatory Support**: Consider non-invasive ventilation if respiratory failure is imminent.

#### 4. **Tachycardia**
- **Diagnosis**: Elevated heart rate (115 bpm) could be a response to hypoxemia, hypercapnia, or a sign of underlying cardiovascular issues.
- **Organ Impact**: Affects the cardiovascular system and can be a compensatory mechanism for decreased oxygen delivery.
- **Treatment**:
  - **Address Underlying Causes**: Treat hypoxemia and hypercapnia as mentioned above.
  - **Medications**: Beta-blockers or calcium channel blockers if tachycardia persists and is not due to hypoxia.`}
        /> */}
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>
        )}

        {/* Recommendation Section */}
        {/* <div className="mb-5">
        <h4 className="font-bold mb-2">Treatment and Diagnosis Summary</h4>
        <textarea
          className="w-full h-40 border border-[#854141] rounded p-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#854141]"
          readOnly
          value={`The 55-year-old male patient presents with symptoms of shortness of breath, fatigue, and confusion, which are likely due to a combination of hyperammonemia, carbon monoxide poisoning, hypoxemia, hypercapnia, and tachycardia. The elevated ammonia levels suggest liver dysfunction, possibly hepatic encephalopathy, requiring treatment with lactulose and rifaximin. The high carbon monoxide levels indicate poisoning, necessitating immediate removal from the exposure source and oxygen therapy. Low oxygen saturation and high carbon dioxide levels point to respiratory insufficiency, which should be managed with supplemental oxygen and possibly bronchodilators. The tachycardia is likely a compensatory response to the underlying conditions and should be treated by addressing the primary issues. Comprehensive management includes addressing each condition with appropriate medications and monitoring to prevent further deterioration and ensure the patient's recovery.`}
        />
      </div> */}

        {/* Recommendation Section */}
        {/* <div className="mb-5">
        <h4 className="font-bold mb-2">Recommended medicine</h4>
        <textarea
          className="w-full h-40 border border-[#854141] rounded p-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#854141]"
          readOnly
          value={`The 55-year-old male patient presents with symptoms of shortness of breath, fatigue, and confusion, which are likely due to a combination of hyperammonemia, carbon monoxide poisoning, hypoxemia, hypercapnia, and tachycardia. The elevated ammonia levels suggest liver dysfunction, possibly hepatic encephalopathy, requiring treatment with lactulose and rifaximin. The high carbon monoxide levels indicate poisoning, necessitating immediate removal from the exposure source and oxygen therapy. Low oxygen saturation and high carbon dioxide levels point to respiratory insufficiency, which should be managed with supplemental oxygen and possibly bronchodilators. The tachycardia is likely a compensatory response to the underlying conditions and should be treated by addressing the primary issues. Comprehensive management includes addressing each condition with appropriate medications and monitoring to prevent further deterioration and ensure the patient's recovery.`}
        />
      </div> */}

        {/* Table Section */}
        {data && (
          <div className="mb-5">
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
            {`Doctor's Remark [Please share your view about the above Diagnosis and
          Recommendation]`}
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

        <div className="mb-5">
          <h4 className="font-bold mb-2">
            {`Doctor's note [Please share your own Patient's Diagnosis and Line of Treatment]`}
          </h4>
          <textarea
            className="w-full h-12 border border-[#854141] rounded p-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-[#854141]"
            placeholder="Leave a comment..."
          />
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            className="bg-[#B83232] text-white py-2 px-6 rounded shadow-lg hover:bg-[#A52828]"
            onClick={() => navigate("/")}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;
