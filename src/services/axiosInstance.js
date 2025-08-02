import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api', // 统一设置 API 基础路径
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：在每个需要认证的请求发送前自动附加 Token
apiClient.interceptors.request.use(
  (config) => {
    // 检查是否为需要认证的请求
    if (config.requiresAuth) {
      const token = localStorage.getItem('admin_token')
      console.log(token)
      console.log(token + " 1")
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.error(token + " 1")
        // 如果需要 token 但本地没有，可以取消请求或重定向到登录页

        return Promise.reject(new Error("未认证"));
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：统一处理响应和错误
apiClient.interceptors.response.use(
  (response) => {
    // 直接返回响应数据中的 data 部分
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.error || error.message || '服务器出错了';
    console.error('API Error:', message);
    // 在这里可以触发一个全局的错误提示
    return Promise.reject(error);
  }
);

export default apiClient;