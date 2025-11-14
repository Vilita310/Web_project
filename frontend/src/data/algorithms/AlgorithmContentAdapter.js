/**
 * 算法内容适配器 - 集成动态内容系统与现有组件
 * Algorithm Content Adapter - Integration between dynamic content system and existing components
 */

import { leetcode75Data, defaultUserProgress } from '../leetcode75Complete';

// 动态加载JSON文件的缓存
const problemDataCache = new Map();

export class AlgorithmContentAdapter {
  constructor() {
    this.isInitialized = true;
    this.enhancedCache = new Map();
  }

  async initialize() {
    console.log('🚀 Algorithm Content System initialized with dynamic loading');
    return true;
  }

  /**
   * 动态加载题目JSON文件
   * @param {number} problemId - 题目ID
   * @returns {Promise<Object>} 题目数据
   */
  async loadProblemJSON(problemId) {
    const cacheKey = `json-${problemId}`;

    if (problemDataCache.has(cacheKey)) {
      return problemDataCache.get(cacheKey);
    }

    try {
      const response = await fetch(`/src/data/algorithms/problems/problem${problemId}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load problem ${problemId}: ${response.status}`);
      }

      const problemData = await response.json();
      problemDataCache.set(cacheKey, problemData);
      return problemData;
    } catch (error) {
      console.warn(`Failed to load JSON for problem ${problemId}:`, error);
      return null;
    }
  }

  /**
   * 获取增强版题目内容 - 兼容现有API
   * @param {number} problemId - 题目ID
   * @returns {Promise<Object>} 增强的题目数据
   */
  async getEnhancedProblemData(problemId) {
    const cacheKey = `enhanced-problem-${problemId}`;

    if (this.enhancedCache.has(cacheKey)) {
      return this.enhancedCache.get(cacheKey);
    }

    try {
      // 从现有数据中获取基础信息
      const basicInfo = this.findProblemInLeetcode75(problemId);

      // 动态加载增强内容
      const enhancedContent = await this.loadProblemJSON(problemId) || {};

      console.log(`🔍 Loading problem ${problemId}:`, {
        hasBasicInfo: !!basicInfo,
        hasEnhancedContent: !!enhancedContent.meta,
        title: enhancedContent.meta?.title
      });

      // 合并基础信息和增强内容
      const mergedData = {
        // 基础信息（来自现有系统）
        ...basicInfo,

        // 增强内容（来自动态加载）
        ...enhancedContent,

        // 元数据
        _enhanced: !!enhancedContent.meta,
        _loadedAt: new Date().toISOString(),
        _source: enhancedContent.meta ? 'dynamic' : 'basic'
      };

      // 缓存结果
      this.enhancedCache.set(cacheKey, mergedData);

      return mergedData;
    } catch (error) {
      console.error(`Error getting enhanced problem data for ${problemId}:`, error);
      return this.findProblemInLeetcode75(problemId) || null;
    }
  }

  /**
   * 获取增强版算法模式内容
   * @param {string} patternId - 算法模式ID
   * @returns {Promise<Object>} 增强的模式数据
   */
  async getEnhancedPatternData(patternId) {
    const cacheKey = `enhanced-pattern-${patternId}`;

    if (this.enhancedCache.has(cacheKey)) {
      return this.enhancedCache.get(cacheKey);
    }

    try {
      let enhancedContent = {};

      if (this.isInitialized) {
        try {
          enhancedContent = await loadPatternContent(patternId);
        } catch (error) {
          console.warn(`Failed to load enhanced pattern content for ${patternId}`);
        }
      }

      // 如果没有动态内容，提供基础内容
      if (!enhancedContent.meta) {
        enhancedContent = this.getBasicPatternInfo(patternId);
      }

      enhancedContent._enhanced = !!enhancedContent.meta;
      enhancedContent._loadedAt = new Date().toISOString();

      this.enhancedCache.set(cacheKey, enhancedContent);
      return enhancedContent;
    } catch (error) {
      console.error(`Error getting enhanced pattern data for ${patternId}:`, error);
      return this.getBasicPatternInfo(patternId);
    }
  }

  /**
   * 获取智能推荐内容
   * @param {number} currentProblemId - 当前题目ID
   * @param {Object} userProgress - 用户进度
   * @returns {Promise<Object>} 推荐内容
   */
  async getSmartRecommendations(currentProblemId, userProgress = {}) {
    if (!this.isInitialized) {
      return this.getBasicRecommendations(currentProblemId);
    }

    try {
      return await getRecommendedContent(currentProblemId, userProgress);
    } catch (error) {
      console.warn('Failed to get smart recommendations, using basic ones');
      return this.getBasicRecommendations(currentProblemId);
    }
  }

  /**
   * 兼容现有API - 获取 leetcode75Data
   */
  getLeetcode75Data() {
    return leetcode75Data;
  }

  /**
   * 兼容现有API - 获取默认用户进度
   */
  getDefaultUserProgress() {
    return defaultUserProgress;
  }

  /**
   * 检查某个题目是否有增强内容
   * @param {number} problemId - 题目ID
   * @returns {boolean} 是否有增强内容
   */
  async hasEnhancedContent(problemId) {
    try {
      const content = await this.getEnhancedProblemData(problemId);
      return content._enhanced === true;
    } catch {
      return false;
    }
  }

  /**
   * 批量预加载用户可能访问的内容
   * @param {Array} problemIds - 题目ID列表
   */
  async preloadUserContent(problemIds = []) {
    if (!this.isInitialized || problemIds.length === 0) return;

    const promises = problemIds.slice(0, 10).map(id =>
      this.getEnhancedProblemData(id).catch(console.warn)
    );

    await Promise.allSettled(promises);
    console.log(`📚 Preloaded content for ${problemIds.length} problems`);
  }

  /**
   * 获取系统状态和统计信息
   */
  getSystemStats() {
    return {
      initialized: this.isInitialized,
      cacheStats: getCacheStats(),
      enhancedCacheSize: this.enhancedCache.size,
      availableProblems: this.getAvailableProblems(),
      loadTime: this.isInitialized ? 'Ready' : 'Initializing...'
    };
  }

  // === 私有辅助方法 ===

  /**
   * 在现有数据中查找题目
   */
  findProblemInLeetcode75(problemId) {
    for (const [categoryId, category] of Object.entries(leetcode75Data)) {
      if (category.patterns) {
        for (const pattern of category.patterns) {
          if (pattern.problems) {
            for (const problem of pattern.problems) {
              if (problem.id === problemId || problem.leetcodeId === problemId) {
                return {
                  ...problem,
                  categoryId,
                  patternId: pattern.id,
                  categoryName: category.name,
                  patternName: pattern.name,
                  _source: 'leetcode75'
                };
              }
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * 获取基础算法模式信息
   */
  getBasicPatternInfo(patternId) {
    // 从现有数据中提取模式信息
    for (const category of Object.values(leetcode75Data)) {
      if (category.patterns) {
        const pattern = category.patterns.find(p => p.id === patternId);
        if (pattern) {
          return {
            meta: {
              id: pattern.id,
              name: pattern.name,
              description: pattern.description || '',
              category: category.id || 'unknown'
            },
            theory: {
              concept: pattern.description || '算法模式描述',
              types: [],
              advantages: []
            },
            practiceProblems: pattern.problems ? pattern.problems.map(p => p.id) : [],
            _source: 'basic'
          };
        }
      }
    }

    return {
      meta: { id: patternId, name: '未知模式', category: 'unknown' },
      theory: { concept: '模式信息加载中...', types: [], advantages: [] },
      practiceProblems: [],
      _source: 'fallback'
    };
  }

  /**
   * 获取基础推荐内容
   */
  getBasicRecommendations(currentProblemId) {
    const currentProblem = this.findProblemInLeetcode75(currentProblemId);
    if (!currentProblem) {
      return { similarProblems: [], nextPatterns: [], reviewProblems: [] };
    }

    // 基于相同模式推荐
    const similarProblems = [];
    const category = leetcode75Data[currentProblem.categoryId];

    if (category && category.patterns) {
      const pattern = category.patterns.find(p => p.id === currentProblem.patternId);
      if (pattern && pattern.problems) {
        similarProblems.push(
          ...pattern.problems
            .filter(p => p.id !== currentProblemId)
            .slice(0, 3)
            .map(p => p.id)
        );
      }
    }

    return {
      similarProblems,
      nextPatterns: [],
      reviewProblems: []
    };
  }

  /**
   * 获取可用题目列表
   */
  getAvailableProblems() {
    const problems = [];
    for (const category of Object.values(leetcode75Data)) {
      if (category.patterns) {
        for (const pattern of category.patterns) {
          if (pattern.problems) {
            problems.push(...pattern.problems.map(p => p.id));
          }
        }
      }
    }
    return [...new Set(problems)].sort((a, b) => a - b);
  }
}

// 创建全局单例实例
export const algorithmContentAdapter = new AlgorithmContentAdapter();

// 为了方便使用，导出一些快捷方法
export const getEnhancedProblem = (problemId) =>
  algorithmContentAdapter.getEnhancedProblemData(problemId);

export const getEnhancedPattern = (patternId) =>
  algorithmContentAdapter.getEnhancedPatternData(patternId);

export const getRecommendations = (problemId, userProgress) =>
  algorithmContentAdapter.getSmartRecommendations(problemId, userProgress);

// 兼容现有API
export const getLeetcode75Data = () =>
  algorithmContentAdapter.getLeetcode75Data();

export const getDefaultUserProgress = () =>
  algorithmContentAdapter.getDefaultUserProgress();

export default algorithmContentAdapter;