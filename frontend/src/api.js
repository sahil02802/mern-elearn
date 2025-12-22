import axios from "axios";
import { clearSession, getToken } from "./auth";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  // Do not attach Authorization header for public auth endpoints (login/register/otp flows)
  const url = req.url || "";
  const authPublicRegex =
    /\/auth\/(login|register|forgot-password|reset-password|send-otp|verify-otp|resend-otp|verify-reset-otp|login\/verify-otp|login\/resend-otp)/;
  if (authPublicRegex.test(url)) {
    return req;
  }

  const token = getToken();
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearSession();
      // Optional: Only redirect if not already on login page to avoid loops
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;
