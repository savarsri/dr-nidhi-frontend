import React, { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';
import { useTreatment } from '../context/TreatmentContext';
import NavBar from './NavBar';

export const PatientEntry = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { treatmentType, setTreatmentType } = useTreatment();
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState(() => ({
    id: searchParams.get('id') || 0,
    name: '',
    age: '',
    gender: '',
    phone: searchParams.get('number') || '',
    majorsymptoms: '',
    medicalHistory: '',
    attachments: [],
    medication_type: treatmentType || ''
  }));

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const response = await api.get(`/patient/${formData.phone}`)
        if (response.status === 200) {
          const data = response.data
          setFormData((prev) => ({ ...prev, name: data.name || '' }));
          setFormData((prev) => ({ ...prev, age: data.age || '' }));
          setFormData((prev) => ({ ...prev, gender: data.gender || '' }));
          setLoading(false)
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [searchParams])

  useEffect(() => {
    if (!formData.phone) {
      setFormData((prev) => ({ ...prev, phone: searchParams.get('number') || '' }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!formData.id) {
      setFormData((prev) => ({ ...prev, id: searchParams.get('id') || '' }));
    }
  }, [searchParams]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    if (!formData.phone) {
      setFormData({ ...formData, phone: searchParams.get('number') })
    }

    console.log('Form submitted:', formData);
    try {
      const response = await api.post('/generate', formData)

      if (response.status === 200) {
        console.log(response.data);
        navigate(`/status/${response.data.model_output_id}`)
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false)
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-6 h-6 border-4 border-t-4 border-gray-300 border-solid rounded-full animate-spin border-t-blue-500"></div>
        <span className="ml-3 text-xl text-gray-700">Loading...</span>
      </div>
    );
  }


  return (
    <div className="min-h-screen" style={{ background: '#FDF5F5' }}>
      <NavBar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* <div className="mb-8 flex items-center">
          <Link
            to="/"
            className="flex items-center"
            style={{ color: '#D64545' }}
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Dashboard
          </Link>
        </div> */}

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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: '#2D3436' }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md shadow-sm"
                  style={{
                    border: '1px solid #854141',
                    background: '#FFFFFF',
                  }}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: '#2D3436' }}
                >
                  Age
                </label>
                <input
                  type="number"
                  required
                  className="mt-1 block w-full rounded-md shadow-sm"
                  style={{
                    border: '1px solid #854141',
                    background: '#FFFFFF',
                  }}
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: '#2D3436' }}
                >
                  Gender
                </label>
                <select
                  required
                  className="mt-1 block w-full rounded-md shadow-sm"
                  style={{
                    border: '1px solid #854141',
                    background: '#FFFFFF',
                  }}
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium"
                  style={{ color: '#2D3436' }}
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  className="mt-1 block w-full rounded-md shadow-sm"
                  style={{
                    border: '1px solid #854141',
                    background: '#FFFFFF',
                  }}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>



            <div>
              <label
                className="block text-sm font-medium"
                style={{ color: '#2D3436' }}
              >
                Major Symptoms
              </label>
              <textarea
                rows={3}
                className="mt-1 block w-full rounded-md shadow-sm"
                style={{
                  border: '1px solid #854141',
                  background: '#FFFFFF',
                }}
                value={formData.majorsymptoms}
                onChange={(e) =>
                  setFormData({ ...formData, majorsymptoms: e.target.value })
                }
              />
            </div>

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
                  background: '#FFFFFF',
                }}
                value={formData.medicalHistory}
                onChange={(e) =>
                  setFormData({ ...formData, medicalHistory: e.target.value })
                }
              />
            </div>

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
                  background: '#FFFFFF',
                }}
                onChange={(e) => {
                  if (e.target.files) {
                    setFormData({
                      ...formData,
                      attachments: Array.from(e.target.files),
                    });
                  }
                }}
                multiple
              />
              <p
                className="mt-1 text-sm"
                style={{ color: '#854141' }}
              >
                You can upload multiple files.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center px-4 py-2 rounded-md shadow-sm"
                style={{
                  background: '#D64545',
                  color: '#FFFFFF',
                  border: 'none',
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
