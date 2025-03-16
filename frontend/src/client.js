// src/api/client.js
import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://waste-x-gamma.vercel.app",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default client;
