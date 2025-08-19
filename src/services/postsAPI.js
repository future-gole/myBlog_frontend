import apiClient from './axiosInstance';

/**
 * 上传图片
 */
export const uploadImage = (formData) => {
  return apiClient.post("/upload/image", formData, {
    headers: {
      //覆盖全局设置
      'Content-Type': 'multipart/form-data',
    },
    // 使得确保认证拦截器生效
    requiresAuth: true
  });
}
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
 * @param {object} postData - 文章数据 { title, category, categoryColor, image, content }
 * 说明: 后端已在 PostRequestDto 中新增 categoryColor 字段, 用于分类在关系图谱及展示中的统一颜色。
 */
export const createPost = (postData) => {
  return apiClient.post('/posts/create', postData, { requiresAuth: true });
};

/**
 * 更新一篇文章 (需认证)
 * @param {string} categorySlug - 原分类的 slug
 * @param {string} titleSlug - 原标题的 slug
 * @param {object} postData - 需要更新的文章数据 { title?, category?, categoryColor?, featuredImageId?, content?, tagNames? }
 * 说明: 若修改分类或分类颜色，请一并提交 category 与 categoryColor 保证关系图谱颜色同步。
 */
export const updatePost = (categorySlug, titleSlug, postData) => {
  return apiClient.put(`/posts/update`, postData, { requiresAuth: true });
};

/**
 * 删除一篇文章 (需认证)
 * @param {string} categorySlug - 分类的 slug
 * @param {string} titleSlug - 标题的 slug
 */
export const deletePost = (categorySlug, titleSlug) => {
  return apiClient.delete(`/posts/delete`, { requiresAuth: true });
};