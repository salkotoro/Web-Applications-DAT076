import axios from "axios";

// Create axios instance with default configurations
const instance = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true, // Important for cookies/session handling
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Set request timeout to 10 seconds
});

// Add a response interceptor to handle common errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error for debugging
    console.error("API Error:", error);
    
    // Handle session expiration
    if (error.response && error.response.status === 401) {
      // Could redirect to login or dispatch an action to clear auth state
      console.warn("Authentication session expired");
    }
    
    return Promise.reject(error);
  }
);

export default instance;
