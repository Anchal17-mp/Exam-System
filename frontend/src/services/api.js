import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  const publicEndpoints = ['/token/', '/register/'];
  const isPublic = publicEndpoints.some(endpoint => config.url.includes(endpoint));

  if (token && !isPublic) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          localStorage.clear();
          window.location.href = '/student-login';
          return Promise.reject(error);
        }

        // Try to refresh the token
        const res = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
          refresh: refreshToken
        });

        const newAccessToken = res.data.access;
        localStorage.setItem('access_token', newAccessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return API(originalRequest);

      } catch (refreshError) {
        // Refresh failed — clear and redirect
        const role = localStorage.getItem('role');
        localStorage.clear();
        window.location.href = role === 'tutor' ? '/tutor-login' : '/student-login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const loginUser = (data) => API.post('/token/', data);
export const registerUser = (data) => API.post('/register/', data);
export const getMe = () => API.get('/me/');
export const getExams = () => API.get('/exams/');
export const getExamDetail = (id) => API.get(`/exams/${id}/`);
export const submitExam = (data) => API.post('/submit/', data);
export const getResults = () => API.get('/results/');
export const getMyExams = () => API.get('/my-exams/');
export const createExam = (data) => API.post('/create-exam/', data);
export const getTutorResults = () => API.get('/tutor-results/');
export const changePassword = (data) => API.post('/change-password/', data);
export const generateQuestions = (data) => API.post('/generate-questions/', data);
export const deleteExam = (id) => API.delete(`/exams/${id}/delete/`);
export const editExam = (id, data) => API.put(`/exams/${id}/edit/`, data);
export const getExamForEdit = (id) => API.get(`/exams/${id}/edit/`);
export const logCheating = (data) => API.post('/log-cheating/', data);
export const getCheatingReport = () => API.get('/cheating-report/');
export const explainQuestion = (data) => API.post('/explain-question/', data);