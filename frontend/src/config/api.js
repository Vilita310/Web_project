// API配置文件 - 统一管理所有API端点
const getApiBaseUrl = () => {
  // 优先使用环境变量，然后根据环境自动检测
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // 开发环境
  if (import.meta.env.DEV) {
    return 'http://localhost:8000';
  }

  // 生产环境 - 将使用同源或配置的生产API地址
  return window.location.protocol + '//' + window.location.host + '/api';
};

// API基础配置
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 30000, // 30秒超时

  // API端点配置
  ENDPOINTS: {
    // AI相关
    AI_CHAT: '/api/ai-chat',
    AI_TTS: '/ai/tts',
    AI_HINT: '/ai/hint',
    AI_FEEDBACK: '/ai/feedback',
    AI_RESUME: '/ai/resume',
    AI_INTERVIEW_QUESTIONS: '/ai/interview-questions',
    AI_INTERVIEW_CONVERSATION: '/ai/interview-conversation',
    AI_INTERVIEW_RESPONSE: '/ai/interview-response',
    AI_INTERVIEW_FEEDBACK: '/ai/interview-feedback',

    // 代码执行
    CODE_EXECUTE: '/code-execution/execute',
    CODE_VALIDATE: '/code-execution/validate',
    CODE_LANGUAGES: '/code-execution/languages',

    // 语音相关
    VOICE_START: '/voice/start-voice-session',
    VOICE_CHAT: '/voice/voice-chat',
    SIMPLE_VOICE: '/simple-voice/simple-voice-chat',

    // 用户相关 (为未来扩展准备)
    USER_LOGIN: '/auth/login',
    USER_REGISTER: '/auth/register',
    USER_PROFILE: '/user/profile',

    // 学习进度 (为未来扩展准备)
    LEARNING_PROGRESS: '/learning/progress',
    LEARNING_SAVE: '/learning/save',
    LEARNING_HISTORY: '/learning/history',
  },

  // WebSocket配置
  WS_CONFIG: {
    getVoiceChatUrl: (sessionId) => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = import.meta.env.DEV
        ? 'localhost:8000'
        : window.location.host;
      return `${wsProtocol}//${wsHost}/voice/voice-chat/${sessionId}`;
    }
  }
};

// 获取完整API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// HTTP请求配置
export const getRequestConfig = (options = {}) => {
  return {
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };
};

// 错误处理辅助函数
export const handleApiError = (error, fallbackMessage = '服务暂时不可用，请稍后重试') => {
  console.error('API Error:', error);

  if (error.response?.status === 404) {
    return 'API端点未找到，请检查服务配置';
  }

  if (error.response?.status === 500) {
    return '服务器内部错误，请稍后重试';
  }

  if (error.code === 'NETWORK_ERROR' || error.message.includes('fetch')) {
    return '网络连接错误，请检查网络连接';
  }

  return error.message || fallbackMessage;
};

// 开发环境调试信息
if (import.meta.env.DEV) {
  console.log('🔧 API配置信息:', {
    baseUrl: API_CONFIG.BASE_URL,
    environment: import.meta.env.MODE,
    endpoints: Object.keys(API_CONFIG.ENDPOINTS).length
  });
}

export default API_CONFIG;