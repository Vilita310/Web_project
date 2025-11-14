import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import { getApiUrl } from '../config/api.js';
import { SecureStorage } from '../utils/secureStorage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    SecureStorage.getItem('token', {
      fallback: null,
      expectedType: 'string',
      validate: SecureStorage.validators.authToken
    })
  );
  const [refreshToken, setRefreshToken] = useState(
    SecureStorage.getItem('refreshToken', {
      fallback: null,
      expectedType: 'string',
      validate: SecureStorage.validators.authToken
    })
  );
  const [loading, setLoading] = useState(true);


  // 刷新访问令牌
  const refreshAccessToken = async () => {
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`getApiUrl('/user/refresh')`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const { access_token } = data;
        SecureStorage.setItem('token', access_token);
        setToken(access_token);
        return true;
      } else {
        // Refresh token无效，清除所有token
        SecureStorage.removeItem('token');
        SecureStorage.removeItem('refreshToken');
        setToken(null);
        setRefreshToken(null);
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('刷新token失败:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      return false;
    }
  };

  // 带自动重试的API请求函数
  const apiRequest = async (url, options = {}) => {
    const makeRequest = async (accessToken) => {
      return fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
    };

    // 第一次尝试
    let response = await makeRequest(token);

    // 如果token过期，尝试刷新
    if (response.status === 401 && refreshToken) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // 使用新token重试
        response = await makeRequest(token);
      }
    }

    return response;
  };

  // 检查token是否有效并获取用户信息
  const checkAuthStatus = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiRequest(`getApiUrl('/user/me')`);

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token无效，清除
        SecureStorage.removeItem('token');
        SecureStorage.removeItem('refreshToken');
        setToken(null);
        setRefreshToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('验证token失败:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setRefreshToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 登录
  const login = async (email, password) => {
    try {
      const response = await fetch(`getApiUrl('/user/login')`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const { access_token, refresh_token } = data;
        SecureStorage.setItem('token', access_token);
        SecureStorage.setItem('refreshToken', refresh_token);
        setToken(access_token);
        setRefreshToken(refresh_token);

        // 获取用户信息
        const userResponse = await fetch(`getApiUrl('/user/me')`, {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          message.success('登录成功！');
          return { success: true };
        }
      } else {
        message.error(data.detail || '登录失败');
        return { success: false, error: data.detail };
      }
    } catch (error) {
      console.error('登录失败:', error);
      message.error('网络错误，请重试');
      return { success: false, error: '网络错误' };
    }
  };

  // 注册
  const register = async (email, password, nickname) => {
    try {
      const response = await fetch(`getApiUrl('/user/register')`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, nickname }),
      });

      const data = await response.json();

      if (response.ok) {
        message.success('注册成功！请登录');
        return { success: true };
      } else {
        message.error(data.detail || '注册失败');
        return { success: false, error: data.detail };
      }
    } catch (error) {
      console.error('注册失败:', error);
      message.error('网络错误，请重试');
      return { success: false, error: '网络错误' };
    }
  };

  // 登出
  const logout = () => {
    SecureStorage.removeItem('token');
    SecureStorage.removeItem('refreshToken');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    message.success('已退出登录');
  };

  // 初始化时检查认证状态
  useEffect(() => {
    checkAuthStatus();
  }, [token]);

  const value = {
    user,
    token,
    refreshToken,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshAccessToken,
    apiRequest,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};