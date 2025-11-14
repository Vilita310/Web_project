import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

// 用户学习进度的全局状态管理
const UserProgressContext = createContext();

// 初始状态生成器 - 支持i18n
const createInitialState = (t) => ({
  // 用户基本信息
  userProfile: {
    name: t('sampleUserName'),
    email: 'zhang@example.com',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Express'],
    targetPosition: t('fullStackDeveloper'),
    experienceLevel: 'intermediate'
  },

  // 学习轨迹
  learningProgress: {
    completedCourses: [
      {
        id: 'react-course',
        title: t('reactFullStackDev'),
        completedAt: new Date(Date.now() - 30*24*60*60*1000).toISOString(),
        score: 95,
        duration: `4${t('weeks')}`
      },
      {
        id: 'nodejs-course',
        title: t('nodejsBackendDev'),
        completedAt: new Date(Date.now() - 60*24*60*60*1000).toISOString(),
        score: 88,
        duration: `6${t('weeks')}`
      }
    ],
    currentCourse: null,
    skillsLearned: ['JavaScript', 'React', 'Node.js', 'Python', 'Express'],
    codingProblems: {
      solved: 45,
      total: 100,
      recentProblems: []
    }
  },

  // 项目数据
  projects: {
    generated: [
      {
        id: 'project-1',
        title: t('onlineTaskManagement'),
        type: 'fullstack',
        description: t('taskManagementDesc'),
        technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
        generatedAt: new Date(Date.now() - 20*24*60*60*1000).toISOString()
      }
    ],
    completed: [
      {
        id: 'project-1',
        title: t('onlineTaskManagement'),
        name: t('onlineTaskManagement'),
        type: 'fullstack',
        description: t('taskManagementFullDesc'),
        technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'Socket.io'],
        achievements: [
          t('achievement1'),
          t('achievement2'),
          t('achievement3'),
          t('achievement4')
        ],
        startedAt: new Date(Date.now() - 45*24*60*60*1000).toISOString(),
        completedAt: new Date(Date.now() - 15*24*60*60*1000).toISOString(),
        repository: 'https://github.com/zhangstudent/task-manager',
        demo: 'https://task-manager-demo.com'
      },
      {
        id: 'project-2',
        title: t('ecommerceAnalytics'),
        name: t('ecommerceAnalytics'),
        type: 'data',
        description: t('ecommerceAnalyticsDesc'),
        technologies: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Flask'],
        achievements: [
          t('achievement5'),
          t('achievement6'),
          t('achievement7'),
          t('achievement8')
        ],
        startedAt: new Date(Date.now() - 30*24*60*60*1000).toISOString(),
        completedAt: new Date(Date.now() - 5*24*60*60*1000).toISOString(),
        repository: 'https://github.com/zhangstudent/ecommerce-analytics',
        demo: 'https://analytics-demo.com'
      }
    ],
    current: null,
    recommendations: []
  },

  // 简历数据
  resume: {
    current: null,
    versions: [],
    matchScore: 0,
    feedback: []
  },

  // 面试数据
  interviews: {
    practiced: [],
    scores: [],
    feedback: [],
    nextRecommendations: []
  },

  // 流程状态
  flowState: {
    currentStep: 'resume', // learning -> projects -> resume -> interview -> apply
    completedSteps: ['learning', 'projects'],
    nextSuggestedAction: 'generateResume'
  }
});

// Reducer函数
function userProgressReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_USER_PROFILE':
      return {
        ...state,
        userProfile: { ...state.userProfile, ...action.payload }
      };

    case 'ADD_SKILL':
      return {
        ...state,
        userProfile: {
          ...state.userProfile,
          skills: [...state.userProfile.skills, action.payload]
        },
        learningProgress: {
          ...state.learningProgress,
          skillsLearned: [...state.learningProgress.skillsLearned, action.payload]
        }
      };

    case 'COMPLETE_COURSE':
      const updatedCompletedCourses = [...state.learningProgress.completedCourses, action.payload];
      return {
        ...state,
        learningProgress: {
          ...state.learningProgress,
          completedCourses: updatedCompletedCourses
        },
        flowState: {
          ...state.flowState,
          nextSuggestedAction: updatedCompletedCourses.length >= 3 ? 'generateProject' : 'continueLearning'
        }
      };

    case 'ADD_PROJECT':
      return {
        ...state,
        projects: {
          ...state.projects,
          generated: [...state.projects.generated, action.payload]
        },
        flowState: {
          ...state.flowState,
          nextSuggestedAction: 'generateResume'
        }
      };

    case 'COMPLETE_PROJECT':
      return {
        ...state,
        projects: {
          ...state.projects,
          completed: [...state.projects.completed, action.payload]
        },
        flowState: {
          ...state.flowState,
          nextSuggestedAction: 'generateResume'
        }
      };

    case 'UPDATE_RESUME':
      return {
        ...state,
        resume: {
          ...state.resume,
          current: action.payload,
          versions: [...state.resume.versions, action.payload]
        },
        flowState: {
          ...state.flowState,
          nextSuggestedAction: 'practiceInterview'
        }
      };

    case 'ADD_INTERVIEW_RESULT':
      return {
        ...state,
        interviews: {
          ...state.interviews,
          practiced: [...state.interviews.practiced, action.payload],
          scores: [...state.interviews.scores, action.payload.score]
        },
        flowState: {
          ...state.flowState,
          nextSuggestedAction: action.payload.score > 80 ? 'startApplying' : 'improveSkills'
        }
      };

    case 'UPDATE_FLOW_STEP':
      return {
        ...state,
        flowState: {
          ...state.flowState,
          currentStep: action.payload,
          completedSteps: state.flowState.completedSteps.includes(action.payload)
            ? state.flowState.completedSteps
            : [...state.flowState.completedSteps, action.payload]
        }
      };

    case 'SET_NEXT_ACTION':
      return {
        ...state,
        flowState: {
          ...state.flowState,
          nextSuggestedAction: action.payload
        }
      };

    case 'LOAD_SAVED_PROGRESS':
      return {
        ...state,
        ...action.payload
      };

    case 'RESET_MODULE':
      const { payload: module } = action;
      switch (module) {
        case 'learning':
          return {
            ...state,
            learningProgress: createInitialState(t).learningProgress
          };
        case 'projects':
          return {
            ...state,
            projects: createInitialState(() => '').projects
          };
        case 'resume':
          return {
            ...state,
            resume: createInitialState(() => '').resume
          };
        case 'interviews':
          return {
            ...state,
            interviews: createInitialState(() => '').interviews
          };
        default:
          return state;
      }

    default:
      return state;
  }
}

// Context Provider组件
export function UserProgressProvider({ children }) {
  const { t } = useTranslation('common');
  const initialState = useMemo(() => createInitialState(t), [t]);
  const [state, dispatch] = useReducer(userProgressReducer, initialState);

  // 从localStorage加载保存的进度
  useEffect(() => {
    const savedProgress = localStorage.getItem('userProgress');
    if (savedProgress) {
      try {
        const parsedProgress = JSON.parse(savedProgress);
        dispatch({ type: 'LOAD_SAVED_PROGRESS', payload: parsedProgress });
      } catch (error) {
        console.error('Failed to load saved progress:', error);
      }
    }
  }, []);

  // 保存进度到localStorage (防抖优化)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem('userProgress', JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [state]);

  // 优化的辅助函数（使用useCallback避免重新渲染）
  const updateUserProfile = useCallback((profile) => {
    dispatch({ type: 'UPDATE_USER_PROFILE', payload: profile });
  }, []);

  const addSkill = useCallback((skill) => {
    dispatch({ type: 'ADD_SKILL', payload: skill });
  }, []);

  const completeCourse = useCallback((course) => {
    dispatch({ type: 'COMPLETE_COURSE', payload: course });
  }, []);

  const addProject = useCallback((project) => {
    dispatch({ type: 'ADD_PROJECT', payload: project });
  }, []);

  const completeProject = useCallback((project) => {
    dispatch({ type: 'COMPLETE_PROJECT', payload: project });
  }, []);

  const updateResume = useCallback((resume) => {
    dispatch({ type: 'UPDATE_RESUME', payload: resume });
  }, []);

  const addInterviewResult = useCallback((result) => {
    dispatch({ type: 'ADD_INTERVIEW_RESULT', payload: result });
  }, []);

  const updateFlowStep = useCallback((step) => {
    dispatch({ type: 'UPDATE_FLOW_STEP', payload: step });
  }, []);

  const setNextAction = useCallback((action) => {
    dispatch({ type: 'SET_NEXT_ACTION', payload: action });
  }, []);

  // 计算用户整体进度
  const calculateOverallProgress = useCallback(() => {
    const steps = ['learning', 'projects', 'resume', 'interview'];
    const completed = state.flowState.completedSteps.length;
    return Math.round((completed / steps.length) * 100);
  }, [state.flowState.completedSteps.length]);

  // 获取下一步建议
  const getNextStepSuggestion = useCallback(() => {
    const { skills } = state.userProfile;
    const { generated: projects } = state.projects;
    const { current: resume } = state.resume;
    const { practiced: interviews } = state.interviews;

    // 基于当前状态生成个性化建议
    if (skills.length < 3) {
      return {
        action: 'learnSkills',
        title: '继续学习技能',
        description: '建议掌握至少3项核心技能后开始项目实战',
        nextPage: '/learning'
      };
    }

    if (projects.length === 0) {
      return {
        action: 'generateProject',
        title: '生成专属项目',
        description: '基于您的技能生成个性化项目，积累实战经验',
        nextPage: '/projects'
      };
    }

    if (!resume) {
      return {
        action: 'generateResume',
        title: '生成专业简历',
        description: '基于您的项目经验生成专业简历',
        nextPage: '/resume'
      };
    }

    if (interviews.length < 3) {
      return {
        action: 'practiceInterview',
        title: '练习模拟面试',
        description: '通过AI面试官提升面试技能',
        nextPage: '/interview'
      };
    }

    return {
      action: 'startApplying',
      title: '开始投递简历',
      description: '您已具备完整的求职准备，可以开始投递了！',
      nextPage: '/apply'
    };
  }, [state.userProfile.skills, state.projects.generated, state.resume.current, state.interviews.practiced]);

  // 检查是否可以进入下一阶段
  const canProceedToNext = useCallback((targetStep) => {
    const { skills } = state.userProfile;
    const { generated: projects } = state.projects;
    const { current: resume } = state.resume;

    switch (targetStep) {
      case 'projects':
        return skills.length >= 2;
      case 'resume':
        return projects.length >= 1;
      case 'interview':
        return resume !== null;
      case 'apply':
        return state.interviews.practiced.length >= 2;
      default:
        return true;
    }
  }, [state.userProfile.skills, state.projects.generated, state.resume.current, state.interviews.practiced]);

  // 批量更新操作
  const batchUpdate = useCallback((updates) => {
    updates.forEach(update => {
      dispatch(update);
    });
  }, []);

  // 重置特定模块
  const resetModule = useCallback((module) => {
    dispatch({ type: 'RESET_MODULE', payload: module });
  }, []);

  // Actions object (no useMemo needed for simple object)
  const actions = {
    updateUserProfile,
    addSkill,
    completeCourse,
    addProject,
    completeProject,
    updateResume,
    addInterviewResult,
    updateFlowStep,
    setNextAction,
    calculateOverallProgress,
    getNextStepSuggestion,
    canProceedToNext,
    batchUpdate,
    resetModule
  };

  return (
    <UserProgressContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </UserProgressContext.Provider>
  );
}

// 自定义Hook
export function useUserProgress() {
  const context = useContext(UserProgressContext);
  if (!context) {
    throw new Error('useUserProgress must be used within a UserProgressProvider');
  }
  return context;
}