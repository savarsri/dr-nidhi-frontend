import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import Loader1 from "./Loader1"
import NavBar from './NavBar';

export const PatientEntry = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  // New state to track if patient data has been fetched from the API
  const [isFetched, setIsFetched] = useState(false);

  const [formData, setFormData] = useState(() => ({
    id: searchParams.get('id') || 0,
    name: '',
    age: '',
    gender: '',
    phone: searchParams.get('number') || '',
    majorsymptoms: '',
    medicalHistory: '',
    attachments: [],
    medication_type: ''
  }));

  useEffect(() => {
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

    fetchData();
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
      !formData.age.toString().trim() || // if age is a number, convert to string
      !formData.gender.trim() ||
      !formData.phone.trim() ||
      !formData.majorsymptoms.trim()
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    console.log('Form submitted:', formData);
    try {
      setLoading(true);
      const response = await api.post('/generate', formData);

      if (response.status === 200) {
        console.log(response.data);
        navigate(`/status/${response.data.model_output_id}`);
      }
    } catch (error) {
      console.log(error);
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

              <div>
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
              </div>
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
            <div className="mt-4">
              <label
                className="block text-sm font-medium"
                style={{ color: '#2D3436' }}
              >
                Attachments
              </label>
              <input
                type="file"
                className="mt-1 block w-full rounded-md shadow-sm"
                style={{
                  border: '1px solid #854141',
                  background: '#FFFFFF'
                }}
                onChange={(e) => {
                  if (e.target.files) {
                    setFormData({
                      ...formData,
                      attachments: Array.from(e.target.files)
                    });
                  }
                }}
                multiple
              />
              <p className="mt-1 text-sm" style={{ color: '#854141' }}>
                You can upload multiple files.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
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
