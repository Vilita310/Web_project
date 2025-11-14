import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入语言资源
import zhCommon from './locales/zh/common.json';
import zhHome from './locales/zh/home.json';
import zhDashboard from './locales/zh/dashboard.json';
import zhClassroom from './locales/zh/classroom.json';
// 移除已删除的功能相关导入
// import zhProjects from './locales/zh/projects.json';
// import zhResume from './locales/zh/resume.json';
// import zhInterview from './locales/zh/interview.json';
// import zhApply from './locales/zh/apply.json';
import zhLearning from './locales/zh/learning.json';
import zhData from './locales/zh/data.json';

import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enDashboard from './locales/en/dashboard.json';
import enClassroom from './locales/en/classroom.json';
// 移除已删除的功能相关导入
// import enProjects from './locales/en/projects.json';
// import enResume from './locales/en/resume.json';
// import enInterview from './locales/en/interview.json';
// import enApply from './locales/en/apply.json';
import enLearning from './locales/en/learning.json';
import enData from './locales/en/data.json';

// 语言资源配置 - 使用完整的语言代码以统一标准
const resources = {
  'zh-CN': {
    common: zhCommon,
    home: zhHome,
    dashboard: zhDashboard,
    classroom: zhClassroom,
    learning: zhLearning,
    data: zhData
  },
  'en': {
    common: enCommon,
    home: enHome,
    dashboard: enDashboard,
    classroom: enClassroom,
    learning: enLearning,
    data: enData
  }
};

// i18n配置
i18n
  .use(LanguageDetector) // 自动检测用户语言
  .use(initReactI18next) // 绑定到react
  .init({
    resources,

    // 默认语言 - 使用完整语言代码
    fallbackLng: 'zh-CN',

    // 默认命名空间
    defaultNS: 'common',

    // 调试模式
    debug: process.env.NODE_ENV === 'development',

    // 语言检测配置 - 添加语言映射以兼容旧代码
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'language',
      caches: ['localStorage']
    },

    // 语言映射 - 将简短代码映射到完整代码
    load: 'languageOnly',
    fallbackLng: {
      'zh': ['zh-CN'],
      'en': ['en'],
      'default': ['zh-CN']
    },

    // 插值配置
    interpolation: {
      escapeValue: false // React 已经对 XSS 进行了保护
    },

    // 分隔符配置
    keySeparator: '.',
    nsSeparator: ':'
  });

export default i18n;