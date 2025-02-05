import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";

// Async thunk to fetch patient data
export const fetchTotalPatients = createAsyncThunk(
    "patients/fetchTotalPatients",
    async () => {
        const response = await api.get(`/login`);
        return response?.data || {};
    }
);

const lastFetchTime = localStorage.getItem("lastFetchTime");
const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

const isDataFresh = lastFetchTime && (Date.now() - parseInt(lastFetchTime) < oneHour);

const initialState = {
    totalPatients: isDataFresh ? JSON.parse(localStorage.getItem("totalPatients")) : null,
    newPatientsThisMonth: isDataFresh ? JSON.parse(localStorage.getItem("newPatientsThisMonth")) : null,
    treatmentType: "", // New variable initialized as an empty string
    loading: false,
    error: null,
};

const patientSlice = createSlice({
    name: "patients",
    initialState,
    reducers: {
        setTotalPatients: (state, action) => {
            state.totalPatients = action.payload;
        },
        setNewPatientsThisMonth: (state, action) => {
            state.newPatientsThisMonth = action.payload;
        },
        setTreatmentType: (state, action) => {
            state.treatmentType = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTotalPatients.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTotalPatients.fulfilled, (state, action) => {
                state.loading = false;
                state.totalPatients = action.payload.totalPatients;
                state.newPatientsThisMonth = action.payload.newPatientsThisMonth;

                // Save new data & update fetch timestamp
                const now = Date.now();
                localStorage.setItem("totalPatients", JSON.stringify(action.payload.totalPatients));
                localStorage.setItem("newPatientsThisMonth", JSON.stringify(action.payload.newPatientsThisMonth));
                localStorage.setItem("lastFetchTime", now.toString()); // Store as string
            })
            .addCase(fetchTotalPatients.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const { setTotalPatients, setNewPatientsThisMonth, setTreatmentType } = patientSlice.actions;
export default patientSlice.reducer;
