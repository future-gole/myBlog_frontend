import apiClient from './axiosInstance';


export const login = (username,password) => {
  return apiClient.post('/auth/login', { username,password });
};
