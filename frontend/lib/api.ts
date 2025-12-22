import axios from 'axios';



const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 &&
      originalRequest.url !== '/auth/refresh-token' &&
      originalRequest.url !== '/auth/login' &&
      !originalRequest._retry) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await api.post('/auth/refresh-token');
        isRefreshing = false;
        processQueue(null, refreshResponse.data.accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        clearAuthCookies();

        if (typeof window !== 'undefined') {
          if (!window.location.pathname.includes('/auth/login')) {
            window.location.href = '/auth/login';
          }
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Auth API functions without internal toast handling
export const authAPI = {
  // Signup - Send OTP
  signupSendOTP: async (data: any) => {
    try {
      const response = await api.post('/auth/signup/send-otp', data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Signup failed');
      }
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Signup - Verify OTP
  signupVerifyOTP: async (data: any) => {
    try {
      const response = await api.post('/auth/signup/verify-otp', data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Verification failed');
      }
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Login
  login: async (data: any) => {
    try {
      const response = await api.post('/auth/login', data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Google OAuth
  googleAuth: () => api.get('/auth/google'),

  // Forgot password
  forgotPassword: async (email: string) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to send reset instructions');
      }
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Validate reset token
  validateResetToken: async (token: string) => {
    try {
      const response = await api.get(`/auth/validate-reset-token?token=${token}`);
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Reset password
  resetPassword: async (data: any) => {
    try {
      const response = await api.post('/auth/reset-password', data);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to reset password');
      }
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Get current user
  getCurrentUser: () => api.get('/auth/me'),

  // Validate session
  validateSession: () => api.get('/auth/validate-session'),

  // Refresh token
  refreshToken: () => api.post('/auth/refresh-token'),

  // Resend OTP
  resendOtp: async (email: string) => {
    try {
      const response = await api.post('/auth/resend-otp', { email });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to resend code');
      }
      return response;
    } catch (error: any) {
      throw error;
    }
  },
};

// Clear cookies helper
export const clearAuthCookies = () => {
  if (typeof document !== 'undefined') {
    const cookies = [
      'accessToken',
      'refreshToken',
    ];

    cookies.forEach(cookieName => {
      document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `${cookieName}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });
  }
};

export default api;