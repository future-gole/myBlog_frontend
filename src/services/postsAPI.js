import apiClient from './axiosInstance';

/**
 * 获取所有文章的核心信息列表 (公开接口)
 */
export const getPosts = () => {
  return apiClient.get('/posts');
};

/**
 * 根据 category 和 title slug 获取单篇文章详情 (公开接口)
 * @param {string} categorySlug - 分类的 slug
 * @param {string} titleSlug - 标题的 slug
 */
export const getPostById = (id) => {
  return apiClient.get(`/posts/${id}`);
};

/**
 * 发布一篇新文章 (需认证)
 * @param {object} postData - 文章数据 { title, category, image, content }
 */
export const createPost = (postData) => {
  return apiClient.post('/posts', postData, { requiresAuth: true });
};

/**
 * 更新一篇文章 (需认证)
 * @param {string} categorySlug - 原分类的 slug
 * @param {string} titleSlug - 原标题的 slug
 * @param {object} postData - 需要更新的文章数据
 */
export const updatePost = (categorySlug, titleSlug, postData) => {
  return apiClient.put(`/posts/${categorySlug}/${titleSlug}`, postData, { requiresAuth: true });
};

/**
 * 删除一篇文章 (需认证)
 * @param {string} categorySlug - 分类的 slug
 * @param {string} titleSlug - 标题的 slug
 */
export const deletePost = (categorySlug, titleSlug) => {
  return apiClient.delete(`/posts/${categorySlug}/${titleSlug}`, { requiresAuth: true });
};