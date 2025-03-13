// api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  // baseURL: 'https://vivid-case-446615-j6.el.r.appspot.com/',
  // timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
