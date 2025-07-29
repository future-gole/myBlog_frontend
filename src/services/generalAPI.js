import apiClient from './axiosInstance';

/**
 * 获取关系图谱数据 (公开接口)
 */
export const getGraphData = () => {
  return apiClient.get('/graph');
};

/**
 * 获取所有分类列表 (公开接口)
 */
export const getCategories = () => {
  return apiClient.get('/categories');
};