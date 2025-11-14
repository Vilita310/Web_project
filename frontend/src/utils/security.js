/**
 * 前端安全配置和工具函数
 */

// 内容安全策略配置
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  'font-src': ["'self'", "https://fonts.gstatic.com"],
  'img-src': ["'self'", "data:", "https:"],
  'connect-src': ["'self'", "https://api.openai.com", "wss:", "ws:"],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
};

// 安全头配置
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};

// 验证URL是否安全
export const isSecureUrl = (url) => {
  try {
    const urlObj = new URL(url);

    // 只允许HTTPS和本地开发的HTTP
    if (urlObj.protocol === 'https:') {
      return true;
    }

    if (urlObj.protocol === 'http:' &&
        (urlObj.hostname === 'localhost' ||
         urlObj.hostname === '127.0.0.1' ||
         urlObj.hostname.startsWith('192.168.') ||
         urlObj.hostname.startsWith('10.') ||
         urlObj.hostname.startsWith('172.'))) {
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
};

// 清理用户输入，防止XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/&/g, '&amp;');
};

// 验证JWT token格式
export const isValidJWTFormat = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  try {
    // 验证每个部分都是有效的base64
    parts.forEach(part => {
      atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    });
    return true;
  } catch (error) {
    return false;
  }
};

// 检查密码强度
export const checkPasswordStrength = (password) => {
  const result = {
    score: 0,
    issues: [],
    isStrong: false
  };

  if (!password) {
    result.issues.push('密码不能为空');
    return result;
  }

  if (password.length < 8) {
    result.issues.push('密码长度至少8位');
  } else {
    result.score += 1;
  }

  if (!/[a-z]/.test(password)) {
    result.issues.push('密码需要包含小写字母');
  } else {
    result.score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    result.issues.push('密码需要包含大写字母');
  } else {
    result.score += 1;
  }

  if (!/[0-9]/.test(password)) {
    result.issues.push('密码需要包含数字');
  } else {
    result.score += 1;
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    result.issues.push('密码需要包含特殊字符');
  } else {
    result.score += 1;
  }

  result.isStrong = result.score >= 4 && result.issues.length === 0;
  return result;
};

// 生成安全的随机字符串
export const generateSecureId = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  // 使用crypto.getRandomValues如果可用
  if (window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    // 降级到Math.random
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }

  return result;
};

// 安全的API请求包装器
export const secureApiRequest = async (url, options = {}) => {
  // 验证URL
  if (!isSecureUrl(url)) {
    throw new Error('Insecure URL not allowed');
  }

  // 设置安全默认值
  const secureOptions = {
    ...options,
    credentials: 'same-origin',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers
    }
  };

  // 添加CSRF保护
  const token = document.querySelector('meta[name="csrf-token"]');
  if (token) {
    secureOptions.headers['X-CSRF-Token'] = token.getAttribute('content');
  }

  try {
    const response = await fetch(url, secureOptions);

    // 检查响应安全性
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error('Secure API request failed:', error);
    throw error;
  }
};

// 防止点击劫持
export const preventClickjacking = () => {
  if (window.top !== window.self) {
    window.top.location = window.self.location;
  }
};

// 检查浏览器安全特性
export const checkBrowserSecurity = () => {
  const features = {
    https: location.protocol === 'https:',
    crypto: !!window.crypto,
    localStorage: !!window.localStorage,
    sessionStorage: !!window.sessionStorage,
    csp: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]')
  };

  const warnings = [];

  if (!features.https && location.hostname !== 'localhost') {
    warnings.push('应用未使用HTTPS，数据传输不安全');
  }

  if (!features.crypto) {
    warnings.push('浏览器不支持安全的随机数生成');
  }

  if (!features.csp) {
    warnings.push('未检测到内容安全策略');
  }

  return { features, warnings };
};

// 初始化安全检查
export const initSecurity = () => {
  // 防止点击劫持
  preventClickjacking();

  // 检查浏览器安全性
  const securityCheck = checkBrowserSecurity();

  if (securityCheck.warnings.length > 0) {
    console.warn('Security warnings:', securityCheck.warnings);
  }

  // 在开发环境显示安全状态
  if (process.env.NODE_ENV === 'development') {
    console.log('Security features:', securityCheck.features);
  }
};

export default {
  CSP_CONFIG,
  SECURITY_HEADERS,
  isSecureUrl,
  sanitizeInput,
  isValidJWTFormat,
  checkPasswordStrength,
  generateSecureId,
  secureApiRequest,
  preventClickjacking,
  checkBrowserSecurity,
  initSecurity
};