// import axios from 'axios';
// const axiosClient = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000' });

// axiosClient.interceptors.request.use(config => {
//   const token = localStorage.getItem('token'); // <- must match Login.jsx usage
//   if (token) config.headers['Authorization'] = `Bearer ${token}`;
//   return config;
// });

// import axios from "axios";

// const axiosClient = axios.create({
//   baseURL: "http://localhost:5000/api",
// });

// // Attach token automatically
// axiosClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default axiosClient;

// ============

import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const axiosClient = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default axiosClient;
