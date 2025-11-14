/**
 * 安全的localStorage封装
 * 提供数据验证、错误处理和防止XSS攻击
 */

const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB限制

// 验证数据类型和格式
const validateData = (data, expectedType = 'object') => {
  if (data === null || data === undefined) {
    return false;
  }

  switch (expectedType) {
    case 'object':
      return typeof data === 'object' && !Array.isArray(data);
    case 'array':
      return Array.isArray(data);
    case 'string':
      return typeof data === 'string';
    case 'number':
      return typeof data === 'number' && !isNaN(data);
    default:
      return true;
  }
};

// 安全地解析JSON数据
const safeJsonParse = (jsonString, fallback = null) => {
  try {
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.warn('Failed to parse JSON from localStorage:', error);
    return fallback;
  }
};

// 检查存储大小
const checkStorageQuota = (key, value) => {
  try {
    const serialized = JSON.stringify(value);
    if (serialized.length > MAX_STORAGE_SIZE) {
      console.warn(`Storage data too large for key: ${key}`);
      return false;
    }
    return true;
  } catch (error) {
    console.warn('Failed to serialize data:', error);
    return false;
  }
};

// 清理敏感数据（移除可能的脚本内容）
const sanitizeData = (data) => {
  if (typeof data === 'string') {
    // 移除潜在的脚本标签和事件处理器
    return data
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '');
  }

  if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
      return data.map(item => sanitizeData(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeData(value);
    }
    return sanitized;
  }

  return data;
};

export class SecureStorage {
  // 安全地获取localStorage数据
  static getItem(key, options = {}) {
    const {
      fallback = null,
      expectedType = 'object',
      validate = null,
      sanitize = true
    } = options;

    try {
      if (!window.localStorage) {
        console.warn('localStorage not available');
        return fallback;
      }

      const stored = localStorage.getItem(key);
      if (stored === null) {
        return fallback;
      }

      let parsed = safeJsonParse(stored, fallback);
      if (parsed === null) {
        return fallback;
      }

      // 验证数据类型
      if (!validateData(parsed, expectedType)) {
        console.warn(`Invalid data type for key: ${key}, expected: ${expectedType}`);
        return fallback;
      }

      // 自定义验证
      if (validate && typeof validate === 'function') {
        if (!validate(parsed)) {
          console.warn(`Custom validation failed for key: ${key}`);
          return fallback;
        }
      }

      // 清理敏感数据
      if (sanitize) {
        parsed = sanitizeData(parsed);
      }

      return parsed;
    } catch (error) {
      console.error(`Error getting localStorage item: ${key}`, error);
      return fallback;
    }
  }

  // 安全地设置localStorage数据
  static setItem(key, value, options = {}) {
    const { sanitize = true, maxSize = MAX_STORAGE_SIZE } = options;

    try {
      if (!window.localStorage) {
        console.warn('localStorage not available');
        return false;
      }

      let processedValue = value;

      // 清理敏感数据
      if (sanitize) {
        processedValue = sanitizeData(processedValue);
      }

      // 检查存储大小
      if (!checkStorageQuota(key, processedValue)) {
        return false;
      }

      const serialized = JSON.stringify(processedValue);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`Error setting localStorage item: ${key}`, error);

      // 处理存储空间不足的情况
      if (error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, attempting to clear old data');
        this.clearOldData(key);
        try {
          localStorage.setItem(key, JSON.stringify(sanitizeData(value)));
          return true;
        } catch (retryError) {
          console.error('Failed to set item after clearing old data', retryError);
        }
      }

      return false;
    }
  }

  // 移除localStorage项
  static removeItem(key) {
    try {
      if (window.localStorage) {
        localStorage.removeItem(key);
        return true;
      }
    } catch (error) {
      console.error(`Error removing localStorage item: ${key}`, error);
    }
    return false;
  }

  // 清理过期或过大的数据
  static clearOldData(excludeKey = null) {
    try {
      const keysToRemove = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key !== excludeKey) {
          const item = localStorage.getItem(key);

          // 清理超大项目
          if (item && item.length > MAX_STORAGE_SIZE / 10) {
            keysToRemove.push(key);
          }

          // 清理可能包含时间戳的过期项目
          try {
            const parsed = JSON.parse(item);
            if (parsed && parsed.timestamp) {
              const age = Date.now() - parsed.timestamp;
              const maxAge = 30 * 24 * 60 * 60 * 1000; // 30天
              if (age > maxAge) {
                keysToRemove.push(key);
              }
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log(`Cleared ${keysToRemove.length} old localStorage items`);
    } catch (error) {
      console.error('Error clearing old data:', error);
    }
  }

  // 获取存储使用情况
  static getStorageInfo() {
    try {
      let totalSize = 0;
      const items = {};

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        const size = value ? value.length : 0;

        items[key] = size;
        totalSize += size;
      }

      return {
        totalSize,
        items,
        percentageUsed: (totalSize / MAX_STORAGE_SIZE) * 100
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { totalSize: 0, items: {}, percentageUsed: 0 };
    }
  }

  // 验证特定数据结构
  static validators = {
    recentPages: (data) => {
      return Array.isArray(data) && data.every(page =>
        page &&
        typeof page.path === 'string' &&
        typeof page.type === 'string' &&
        typeof page.timestamp === 'number'
      );
    },

    userProgress: (data) => {
      return data &&
        typeof data === 'object' &&
        !Array.isArray(data);
    },

    authToken: (data) => {
      return typeof data === 'string' && data.length > 0;
    }
  };
}

export default SecureStorage;