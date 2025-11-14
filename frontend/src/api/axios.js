import axios from 'axios';
import { message } from 'antd';
import { UserStorage } from '../utils/storage';
import { API_CONFIG } from '../config/api';

const baseURL = import.meta?.env?.VITE_API_BASE || 'http://localhost:8000';
const instance = axios.create({
  baseURL,
  timeout: API_CONFIG.TIMEOUT, // 使用API配置的30秒超时
});

// 请求拦截器
instance.interceptors.request.use(
  config => {
    const token = UserStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  },
);

// 响应拦截器
instance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // 未授权，清除用户信息并跳转到登录页
          UserStorage.clearUser();
          message.error('登录已过期，请重新登录');
          window.location.href = '/login';
          break;
        case 403:
          message.error('没有权限访问此资源');
          break;
        case 404:
          message.error('请求的资源不存在');
          break;
        case 500:
          message.error(data?.detail || '服务器错误，请稍后重试');
          break;
        default:
          message.error(data?.detail || `请求失败：${status}`);
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      message.error('网络错误，请检查您的网络连接');
    } else {
      // 请求配置出错
      message.error('请求配置错误');
    }
    
    return Promise.reject(error);
  },
);

export default instance;
