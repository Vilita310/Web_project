// 简化的语言工具函数，支持基本的语言操作

/**
 * 规范化语言代码
 * @param {string} langCode - 语言代码
 * @returns {string} 规范化的语言代码
 */
export const normalizeLanguageCode = (langCode) => {
  if (!langCode) return 'zh-CN';

  const normalized = langCode.toLowerCase();

  // 中文处理
  if (normalized.includes('zh') || normalized.includes('chinese')) {
    return 'zh-CN';
  }

  // 英文处理
  if (normalized.includes('en') || normalized.includes('english')) {
    return 'en-US';
  }

  // 默认返回中文
  return 'zh-CN';
};

/**
 * 获取TTS配置
 * @param {string} langCode - 语言代码
 * @returns {object} TTS配置
 */
export const getTTSConfig = (langCode) => {
  const normalized = normalizeLanguageCode(langCode);

  if (normalized.startsWith('zh')) {
    return {
      voice: 'alloy',
      model: 'tts-1',
      language: 'zh-CN'
    };
  }

  return {
    voice: 'alloy',
    model: 'tts-1',
    language: 'en-US'
  };
};

/**
 * 检测文本语言
 * @param {string} text - 要检测的文本
 * @returns {string} 检测到的语言代码
 */
export const detectTextLanguage = (text) => {
  if (!text || typeof text !== 'string') {
    return 'zh-CN';
  }

  // 简单的中文字符检测
  const chineseRegex = /[\u4e00-\u9fff]/;
  if (chineseRegex.test(text)) {
    return 'zh-CN';
  }

  return 'en-US';
};

/**
 * 获取语言名称
 * @param {string} langCode - 语言代码
 * @returns {string} 语言名称
 */
export const getLanguageName = (langCode) => {
  const normalized = normalizeLanguageCode(langCode);

  switch (normalized) {
    case 'zh-CN':
      return '中文';
    case 'en-US':
      return 'English';
    default:
      return '中文';
  }
};

/**
 * 获取最佳语言
 * @param {string} text - 文本内容
 * @param {string} userPreference - 用户偏好语言
 * @returns {string} 最佳语言代码
 */
export const getBestLanguage = (text, userPreference = 'zh-CN') => {
  if (!text) return normalizeLanguageCode(userPreference);

  const detected = detectTextLanguage(text);
  return detected || normalizeLanguageCode(userPreference);
};

/**
 * 为API准备语言代码
 * @param {string} langCode - 语言代码
 * @returns {string} 准备好的语言代码
 */
export const prepareLanguageForAPI = (langCode) => {
  return normalizeLanguageCode(langCode);
};