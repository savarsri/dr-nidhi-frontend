import React, { useEffect, useRef, useState } from 'react';
import { Cross, CrossIcon, FolderClosed, Save, SidebarClose, X } from 'lucide-react';
import { replace, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import Loader1 from "./Loader1"
import NavBar from './NavBarNew';

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
  const fileInputRef = useRef(null);
  // New state to track if patient data has been fetched from the API
  const [isFetched, setIsFetched] = useState(false);
  const [showAttachments, setShowAttachments] = useState(true);

  const [fileInputs, setFileInputs] = useState([
    { category: '', file: null }
  ]);

  // Toggle visibility without clearing fileInputs
  const handleToggle = () => {
    setShowAttachments(prev => !prev);
  };

  // Remove a specific file row, even if it's the only one
  const removeFileRow = (index) => {
    if (index === 0) {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setFileInputs([
        { category: '', file: null }
      ])
      return
    }
    setFileInputs(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (index, file) => {
    setFileInputs(prev =>
      prev.map((input, i) =>
        i === index ? { ...input, file } : input
      )
    );
  };

  const handleCategoryChange = (index, category) => {
    setFileInputs(prev =>
      prev.map((input, i) =>
        i === index ? { ...input, category } : input
      )
    );
  };

  const addFileRow = () => {
    const lastInput = fileInputs[fileInputs.length - 1];

    // Ensure last input is not empty
    if (!lastInput.file || !lastInput.category) {
      alert('Please select a category and upload a file before adding another.');
      return;
    }

    setFileInputs(prev => [...prev, { category: '', file: null }]);
  };

  const [formData, setFormData] = useState(() => ({
    id: searchParams.get('id') || 0,
    name: '',
    age: '',
    gender: '',
    phone: searchParams.get('number') || '',
    majorsymptoms: '',
    medicalHistory: '',
    notes: '',
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
      !formData.phone.trim()
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
      formPayload.append("notes", formData.notes || "");

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
    <div className="min-h-screen bg-white">
      <NavBar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className="shadow rounded-lg p-6 bg-gray-100"
        >
          <h2
            className="text-4xl text-primary font-bold mb-6"
          >
            New Patient Registration
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-1">
              <div>
                <label
                  htmlFor="fullname"
                  className="block text-sm font-medium text-primary"
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
                    className="block w-full px-4 py-3 rounded-lg border border-primary-light focus:ring-primary focus:border-primary bg-white text-text"
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
                  className="block text-sm font-medium text-primary"
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
                    className="block w-full px-4 py-3 rounded-lg border border-primary-light focus:ring-primary focus:border-primary bg-white text-text"
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
                  className="block text-sm font-medium text-primary"
                >
                  Gender*
                </label>
                <select
                  required
                  id="gender"
                  className="block w-full px-4 py-3 mt-1 rounded-lg border border-primary-light focus:ring-primary focus:border-primary bg-white text-text"
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
                  className="block text-sm font-medium text-primary"
                >
                  Phone Number*
                </label>
                <input
                  type="number"
                  required
                  id="phonenumber"
                  className="block w-full px-4 py-3 rounded-lg border border-primary-light focus:ring-primary focus:border-primary bg-white text-text"
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
                className="block text-sm font-medium text-primary"
              >
                Major Symptoms
              </label>
              <textarea
                rows={3}
                className="mt-1 block w-full rounded-md shadow-sm p-2 border border-primary-light text-text"
                value={formData.majorsymptoms}
                onChange={(e) =>
                  setFormData({ ...formData, majorsymptoms: e.target.value })
                }
              />
            </div>

            {/* Medical History */}
            <div>
              <label
                className="block text-sm font-medium text-primary"
              >
                Medical History
              </label>
              <textarea
                rows={4}
                className="mt-1 block w-full rounded-md shadow-sm p-2 border border-primary-light text-text"
                value={formData.medicalHistory}
                onChange={(e) =>
                  setFormData({ ...formData, medicalHistory: e.target.value })
                }
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-primary"
              >
                Your Notes
              </label>
              <textarea
                rows={4}
                className="mt-1 block w-full rounded-md shadow-sm p-2 border border-primary-light text-text"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>

            {/* Attachments */}
            <div className="mt-4 p-4 border bg-gray-200 border-primary-light rounded-md">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-md font-medium text-primary font-semibold">Attachments</label>
                <button
                  type="button"
                  onClick={handleToggle}
                  className="text-sm hover:underline flex items-center space-x-1"
                >
                  <span>{showAttachments ? '▲' : '▼'}</span>
                </button>
              </div>

              {showAttachments && fileInputs.map((input, index) => (
                <div key={index} className="flex justify-between items-center mt-2 space-x-2">
                  <div className="flex flex-col">
                    <select
                      className="border p-2 rounded-md"
                      value={input.category}
                      onChange={e => handleCategoryChange(index, e.target.value)}
                    >
                      <option value="">Select Category</option>
                      {FILE_CATEGORIES.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <input
                      type="file"
                      className="border p-2 rounded-md mt-2"
                      ref={fileInputRef}
                      onChange={e => handleFileChange(index, e.target.files[0])}
                    />
                  </div>
                  <div className="flex items-start space-x-1">
                    {index === fileInputs.length - 1 && (
                      <button
                        type="button"
                        onClick={addFileRow}
                        className="p-2 bg-text-dark hover:bg-text text-white rounded-md"
                      >
                        +
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFileRow(index)}
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                      aria-label="Remove file"
                    >
                      ✖
                    </button>
                  </div>
                </div>
              ))}
            </div>


            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <button
                className="flex items-center px-4 py-2 rounded-md shadow-sm border bg-accent-light hover:bg-accent text-white transition-all duration-300"
                onClick={() => navigate("/")}
              >
                <X className="w-5 h-5 mr-2" />
                Close
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 rounded-md shadow-sm bg-primary text-white hover:bg-primary-light"
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
