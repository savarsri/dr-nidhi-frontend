import React, { useEffect, useState } from 'react';
import { Cross, CrossIcon, FolderClosed, Save, SidebarClose, X } from 'lucide-react';
import { replace, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import Loader1 from "./Loader1"
import NavBar from './NavBar';

const FILE_CATEGORIES = [
  { value: "mri", label: "MRI Scan" },
  { value: "ct_scan", label: "CT Scan" },
  { value: "xray", label: "X-Ray" },
  { value: "other", label: "Other" }
];

export const PatientEntry = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  // New state to track if patient data has been fetched from the API
  const [isFetched, setIsFetched] = useState(false);

  const [fileInputs, setFileInputs] = useState([
    { category: "", file: null }
  ]);

  const handleFileChange = (index, file) => {
    const newInputs = [...fileInputs];
    newInputs[index].file = file;
    setFileInputs(newInputs);
  };

  const handleCategoryChange = (index, category) => {
    const newInputs = [...fileInputs];
    newInputs[index].category = category;
    setFileInputs(newInputs);
  };

  const addFileRow = () => {
    const lastInput = fileInputs[fileInputs.length - 1];

    // Ensure last input is not empty
    if (!lastInput.file || !lastInput.category) {
      alert("Please select a category and upload a file before adding another.");
      return;
    }

    setFileInputs([...fileInputs, { category: "", file: null }]);
  };

  const [formData, setFormData] = useState(() => ({
    id: searchParams.get('id') || 0,
    name: '',
    age: '',
    gender: '',
    phone: searchParams.get('number') || '',
    majorsymptoms: '',
    medicalHistory: '',
  }));

  async function fetchData() {
    setLoading(true);
    try {
      const response = await api.get(`/patient/${formData.phone}`);
      if (response.status === 200) {
        const data = response.data;
        setFormData((prev) => ({
          ...prev,
          name: data.name || '',
          age: data.age || '',
          gender: data.gender || ''
        }));
        // Mark that patient data has been fetched so fetched fields can be disabled
        setIsFetched(true);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function checkOutput() {
    setLoading(true);
    try {
      const response = await api.get(`/output/${formData.id}`);
      if (response.status === 200) {
        console.log("helo");
        
        navigate('/', replace)
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function checkAndFetch() {
      setLoading(true);
      try {
        await checkOutput();
        await fetchData();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    checkAndFetch();
  }, [searchParams]);


  useEffect(() => {
    if (!formData.phone) {
      setFormData((prev) => ({
        ...prev,
        phone: searchParams.get('number') || ''
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!formData.id) {
      setFormData((prev) => ({
        ...prev,
        id: searchParams.get('id') || ''
      }));
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.id.trim() ||
      !formData.name.trim() ||
      !formData.age.toString().trim() || // Ensure age is treated as string
      !formData.gender.trim() ||
      !formData.phone.trim() ||
      !formData.majorsymptoms.trim()
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    console.log("Form submitted:", formData);

    try {
      setLoading(true);

      const formPayload = new FormData();

      // Append text fields
      formPayload.append("id", formData.id);
      formPayload.append("name", formData.name);
      formPayload.append("age", formData.age);
      formPayload.append("gender", formData.gender);
      formPayload.append("phone", formData.phone);
      formPayload.append("majorsymptoms", formData.majorsymptoms);
      formPayload.append("medicalHistory", formData.medicalHistory || "");
      formPayload.append("medication_type", formData.medication_type || "");

      // Append file attachments
      fileInputs.forEach((fileData) => {
        if (fileData.file && fileData.category) {
          formPayload.append(fileData.category, fileData.file);
        }
      });

      // Send request
      const response = await api.post("/generate", formPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        console.log(response.data);
        navigate(`/status/${response.data.model_output_id}`);
      }
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return <Loader1 />
  }

  return (
    <div className="min-h-screen" style={{ background: '#FDF5F5' }}>
      <NavBar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className="shadow rounded-lg p-6"
          style={{ background: '#FFFFFF', border: '1px solid #FAE8E8' }}
        >
          <h2
            className="text-2xl font-bold mb-6"
            style={{ color: '#2D3436' }}
          >
            New Patient Registration
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-1">
              <div>
                <label
                  htmlFor="fullname"
                  className="block text-sm font-medium text-text"
                >
                  Full Name*
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="fullname"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="block w-full px-4 py-3 rounded-lg border border-accent focus:ring-primary focus:border-primary bg-white"
                    placeholder="Enter full name"
                    required
                    disabled={isFetched} // disable if patient data was fetched
                  />
                </div>
              </div>
            </div>

            {/* Age, Gender, Phone Number, Medication Type */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-text"
                >
                  Age*
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    id="age"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    className="block w-full px-4 py-3 rounded-lg border border-accent focus:ring-primary focus:border-primary bg-white"
                    placeholder="Enter age"
                    required
                    disabled={isFetched} // disable if patient data was fetched
                    max="150"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-text"
                >
                  Gender*
                </label>
                <select
                  required
                  id="gender"
                  className="block w-full px-4 py-3 mt-1 rounded-lg border border-accent focus:ring-primary focus:border-primary bg-white"
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  disabled={isFetched} // disable if patient data was fetched
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="phonenumber"
                  className="block text-sm font-medium text-text"
                >
                  Phone Number*
                </label>
                <input
                  type="number"
                  required
                  id="phonenumber"
                  className="block w-full px-4 py-3 rounded-lg border border-accent focus:ring-primary focus:border-primary bg-white"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  disabled // always disabled so the phone number cannot be edited
                />
              </div>

              {/* <div>
                <label
                  htmlFor="medication"
                  className="block text-sm font-medium text-text"
                >
                  Medication Type*
                </label>
                <select
                  required
                  id="medication"
                  className="block w-full px-4 py-3 mt-1 rounded-lg border border-accent focus:ring-primary focus:border-primary bg-white"
                  value={formData.medication_type}
                  onChange={(e) =>
                    setFormData({ ...formData, medication_type: e.target.value })
                  }
                >
                  <option value="">Select medication type</option>
                  <option value="allopathy">Allopathy</option>
                  <option value="homeopathy">Homeopathy</option>
                  <option value="ayurveda">Ayurveda</option>
                </select>
              </div> */}
            </div>

            {/* Major Symptoms */}
            <div>
              <label
                className="block text-sm font-medium"
                style={{ color: '#2D3436' }}
              >
                Major Symptoms*
              </label>
              <textarea
                rows={3}
                className="mt-1 block w-full rounded-md shadow-sm"
                style={{
                  border: '1px solid #854141',
                  background: '#FFFFFF'
                }}
                value={formData.majorsymptoms}
                onChange={(e) =>
                  setFormData({ ...formData, majorsymptoms: e.target.value })
                }
                required
              />
            </div>

            {/* Medical History */}
            <div>
              <label
                className="block text-sm font-medium"
                style={{ color: '#2D3436' }}
              >
                Medical History
              </label>
              <textarea
                rows={4}
                className="mt-1 block w-full rounded-md shadow-sm"
                style={{
                  border: '1px solid #854141',
                  background: '#FFFFFF'
                }}
                value={formData.medicalHistory}
                onChange={(e) =>
                  setFormData({ ...formData, medicalHistory: e.target.value })
                }
              />
            </div>

            {/* Attachments */}
            <div className="mt-4 p-4 border rounded-md">
              <label className="block text-sm font-medium text-gray-700">Attachments</label>

              {fileInputs.map((input, index) => (
                <div key={index} className="flex justify-between   items-center mt-2 space-x-2">
                  {/* Category Selection */}
                  <div>
                    <select
                      className="border p-2 rounded-md"
                      value={input.category}
                      onChange={(e) => handleCategoryChange(index, e.target.value)}
                    >
                      <option value="">Select Category</option>
                      {FILE_CATEGORIES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    {/* File Input */}
                    <input
                      type="file"
                      className="border p-2 rounded-md"
                      onChange={(e) => handleFileChange(index, e.target.files[0])}
                    />
                  </div>

                  {/* Add More Button */}
                  {index === fileInputs.length - 1 && (
                    <button
                      type="button"
                      className="p-2 px-2 bg-[#D64545] text-white rounded-md"
                      onClick={addFileRow}
                    >
                      +
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <button
                className="flex items-center px-4 py-2 rounded-md shadow-sm"
                style={{
                  background: 'transparent',
                  color: '#D64545',
                  border: '1px solid #D64545'
                }}
                onClick={()=>navigate("/")}
              >
                <X className="w-5 h-5 mr-2" />
                Close
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 rounded-md shadow-sm"
                style={{
                  background: '#D64545',
                  color: '#FFFFFF',
                  border: 'none'
                }}
              >
                <Save className="w-5 h-5 mr-2" />
                Save Patient
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
