import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API || "http://localhost:5050/api",
});

// Add JWT auth header if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
