import apiClient from './axiosInstance';

/**
 * 管理员登录
 * @param {string} password - 管理员密码
 * @returns {Promise<{token: string}>}
 */
export const login = (password) => {
  return apiClient.post('/auth/login', { password });
};
