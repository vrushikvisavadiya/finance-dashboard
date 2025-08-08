// import axios from "axios";

// export const api = axios.create({
//   baseURL: import.meta.env.VITE_API || "http://localhost:5050/api",
// });

// // Add JWT auth header if present
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// lib/api.js - Example configuration
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API || "http://localhost:5050/api",
});

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // or however you store your token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { api };
