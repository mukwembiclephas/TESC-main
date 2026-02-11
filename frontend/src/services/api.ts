import axios from "axios";

export const baseURL = "http://127.0.0.1:8000/api";
//export const baseURL = "http://10.50.200.35:8000/api";
// export const baseURL = "https://tesc.zchpc.ac.zw/api";

// Create an axios instance with the base URL of your Django API
const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Request Interceptor (Adds the token to requests)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 2. Response Interceptor (Handles token refresh)
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void, reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    // Any status code 2xx is fine
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Check for 401 error and that it's not a retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Don't retry for token refresh errors
      if (originalRequest.url === '/users/token/refresh/') {
         console.error("Refresh token failed or is expired.");
         localStorage.removeItem("accessToken");
         localStorage.removeItem("refreshToken");
         window.location.href = '/'; // Force redirect to login
         return Promise.reject(error);
      }

      if (isRefreshing) {
        // If we are already refreshing, add this request to the queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true; // Mark this request as retried
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        // No refresh token, just log out
        localStorage.removeItem("accessToken");
        window.location.href = '/'; // Force redirect to login
        return Promise.reject(error);
      }

      try {
        const rs = await axios.post(`${baseURL}/users/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = rs.data;
        localStorage.setItem("accessToken", access);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        
        // Retry all queued requests
        processQueue(null, access);
        
        // Retry the original request
        return apiClient(originalRequest);

      } catch (_error) {
        // Refresh token failed
        processQueue(_error, null);
        console.error("Refresh token is invalid. Logging out.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = '/'; // Force redirect to login
        return Promise.reject(_error);
      } finally {
        isRefreshing = false;
      }
    }

    // For any other error, just reject
    return Promise.reject(error);
  }
);

export default apiClient;