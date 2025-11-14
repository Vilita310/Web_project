// 状态管理工具函数

// 状态选择器 - 避免重复计算和不必要的重新渲染
export const createSelector = (selector, transform = (x) => x) => {
  let lastArgs = null;
  let lastResult = null;

  return (...args) => {
    const argsChanged = !lastArgs || args.some((arg, index) => arg !== lastArgs[index]);

    if (argsChanged) {
      lastArgs = args;
      lastResult = transform(selector(...args));
    }

    return lastResult;
  };
};

// 用户进度相关选择器
export const userProgressSelectors = {
  // 获取学习进度百分比
  getLearningProgress: createSelector(
    (state) => state.learningProgress,
    (learning) => {
      const { completedCourses, skillsLearned } = learning;
      const total = 10; // 假设总共10门课程
      return Math.min((completedCourses.length / total) * 100, 100);
    }
  ),

  // 获取项目完成进度
  getProjectProgress: createSelector(
    (state) => state.projects,
    (projects) => {
      if (projects.generated.length === 0) return 0;
      return (projects.completed.length / projects.generated.length) * 100;
    }
  ),

  // 获取面试平均分
  getInterviewAverage: createSelector(
    (state) => state.interviews,
    (interviews) => {
      if (interviews.scores.length === 0) return 0;
      return interviews.scores.reduce((a, b) => a + b, 0) / interviews.scores.length;
    }
  ),

  // 获取下一步建议
  getNextSuggestion: createSelector(
    (state) => state,
    (fullState) => {
      const { skills } = fullState.userProfile;
      const { generated: projects } = fullState.projects;
      const { current: resume } = fullState.resume;
      const { practiced: interviews } = fullState.interviews;

      if (skills.length < 3) {
        return {
          action: 'learnSkills',
          title: '继续学习技能',
          priority: 'high',
          description: '建议掌握至少3项核心技能'
        };
      }

      if (projects.length === 0) {
        return {
          action: 'generateProject',
          title: '生成专属项目',
          priority: 'high',
          description: '基于您的技能生成个性化项目'
        };
      }

      if (!resume) {
        return {
          action: 'generateResume',
          title: '生成专业简历',
          priority: 'medium',
          description: '基于您的项目经验生成专业简历'
        };
      }

      if (interviews.length < 3) {
        return {
          action: 'practiceInterview',
          title: '练习模拟面试',
          priority: 'medium',
          description: '通过AI面试官提升面试技能'
        };
      }

      return {
        action: 'startApplying',
        title: '开始投递简历',
        priority: 'low',
        description: '您已具备完整的求职准备'
      };
    }
  ),

  // 获取技能分析
  getSkillAnalysis: createSelector(
    (state) => state.userProfile.skills,
    (skills) => {
      const categories = {
        frontend: skills.filter(s => ['React', 'Vue', 'JavaScript', 'TypeScript', 'HTML', 'CSS'].includes(s)),
        backend: skills.filter(s => ['Node.js', 'Python', 'Java', 'Go', 'PHP'].includes(s)),
        database: skills.filter(s => ['MySQL', 'MongoDB', 'PostgreSQL', 'Redis'].includes(s)),
        devops: skills.filter(s => ['Docker', 'AWS', 'Git', 'CI/CD'].includes(s))
      };

      return {
        total: skills.length,
        categories,
        isFullStack: categories.frontend.length > 0 && categories.backend.length > 0,
        strongestCategory: Object.entries(categories).reduce((a, b) =>
          categories[a[0]].length > categories[b[0]].length ? a : b
        )[0]
      };
    }
  )
};

// 状态中间件 - 用于调试和日志记录
export const createMiddleware = (middlewares = []) => {
  return (state, action) => {
    let newState = state;

    middlewares.forEach(middleware => {
      newState = middleware(newState, action);
    });

    return newState;
  };
};

// 日志中间件
export const loggerMiddleware = (state, action) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`Action: ${action.type}`);
    console.log('Previous State:', state);
    console.log('Action:', action);
    console.groupEnd();
  }
  return state;
};

// 性能监控中间件
export const performanceMiddleware = (state, action) => {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    const result = state;
    const end = performance.now();

    if (end - start > 10) { // 超过10ms记录警告
      console.warn(`Slow state update detected: ${action.type} took ${end - start}ms`);
    }
  }
  return state;
};

// 状态验证工具
export const validateState = (state, schema) => {
  const errors = [];

  // 基本结构验证
  const requiredKeys = ['userProfile', 'learningProgress', 'projects', 'resume', 'interviews', 'flowState'];
  requiredKeys.forEach(key => {
    if (!state[key]) {
      errors.push(`Missing required key: ${key}`);
    }
  });

  // 数据类型验证
  if (state.userProfile && !Array.isArray(state.userProfile.skills)) {
    errors.push('userProfile.skills must be an array');
  }

  if (state.learningProgress && typeof state.learningProgress.completedCourses !== 'object') {
    errors.push('learningProgress.completedCourses must be an array');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// 状态迁移工具 - 用于版本升级
export const migrateState = (state, version = '1.0.0') => {
  // 如果状态没有版本信息，添加默认版本
  if (!state._version) {
    return {
      ...state,
      _version: version,
      _migrated: true
    };
  }

  // 根据版本进行不同的迁移策略
  switch (state._version) {
    case '0.9.0':
      // 例如：旧版本的技能存储格式迁移
      if (typeof state.userProfile.skills === 'string') {
        return {
          ...state,
          userProfile: {
            ...state.userProfile,
            skills: state.userProfile.skills.split(',').map(s => s.trim())
          },
          _version: version
        };
      }
      break;
    default:
      return state;
  }

  return state;
};

// 深拷贝工具
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));

  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
};

// 状态比较工具
export const stateCompare = (oldState, newState, path = '') => {
  const changes = [];

  const keys = new Set([...Object.keys(oldState), ...Object.keys(newState)]);

  keys.forEach(key => {
    const currentPath = path ? `${path}.${key}` : key;
    const oldValue = oldState[key];
    const newValue = newState[key];

    if (oldValue !== newValue) {
      if (typeof oldValue === 'object' && typeof newValue === 'object' &&
          oldValue !== null && newValue !== null) {
        changes.push(...stateCompare(oldValue, newValue, currentPath));
      } else {
        changes.push({
          path: currentPath,
          oldValue,
          newValue,
          type: oldValue === undefined ? 'added' :
                newValue === undefined ? 'removed' : 'changed'
        });
      }
    }
  });

  return changes;
};