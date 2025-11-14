/**
 * 算法题目内容加载器和缓存管理
 * Algorithm Problem Content Loader and Cache Manager
 *
 * 基于 classroom 页面的成功模式，为算法学习创建动态内容系统
 */

import { validateProblemData, validatePatternData, normalizeProblemData } from './validator.js';

const algorithmCache = new Map();

/**
 * 动态加载题目详细内容
 * @param {number} problemId - 题目ID (如: 1, 167, 15)
 * @returns {Promise<Object>} 题目完整内容数据
 */
export async function loadProblemContent(problemId) {
  const cacheKey = `problem-${problemId}`;

  // 检查缓存
  if (algorithmCache.has(cacheKey)) {
    return algorithmCache.get(cacheKey);
  }

  try {
    // 使用fetch加载对应的题目文件
    const response = await fetch(`/data/algorithms/problems/problem${problemId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch problem ${problemId}: ${response.status}`);
    }
    let problemData = await response.json();

    // 数据验证和标准化
    const validation = validateProblemData(problemData);
    if (!validation.isValid) {
      console.warn(`Problem data validation failed for ${problemId}:`, validation.errors);
      problemData = normalizeProblemData(problemData);
    } else {
      problemData = normalizeProblemData(problemData);
    }

    // 缓存数据
    algorithmCache.set(cacheKey, problemData);
    return problemData;

  } catch (error) {
    console.error(`Failed to load problem content for ${problemId}:`, error);
    return getDefaultProblemContent(problemId);
  }
}

/**
 * 动态加载算法模式详细内容
 * @param {string} patternId - 算法模式ID (如: "array_two_pointers")
 * @returns {Promise<Object>} 算法模式详细内容
 */
export async function loadPatternContent(patternId) {
  const cacheKey = `pattern-${patternId}`;

  if (algorithmCache.has(cacheKey)) {
    return algorithmCache.get(cacheKey);
  }

  try {
    const response = await fetch(`/data/algorithms/patterns/${patternId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch pattern ${patternId}: ${response.status}`);
    }
    const patternData = await response.json();

    const validation = validatePatternData(patternData);
    if (!validation.isValid) {
      console.warn(`Pattern data validation failed for ${patternId}:`, validation.errors);
    }

    algorithmCache.set(cacheKey, patternData);
    return patternData;

  } catch (error) {
    console.error(`Failed to load pattern content for ${patternId}:`, error);
    return getDefaultPatternContent(patternId);
  }
}

/**
 * 获取默认题目内容（降级方案）
 * @param {number} problemId
 * @returns {Object} 默认题目内容
 */
function getDefaultProblemContent(problemId) {
  // 基于题目ID返回不同的默认内容
  const defaultProblems = {
    1: {
      meta: {
        id: 1,
        title: "两数之和",
        difficulty: "简单",
        leetcodeId: 1,
        category: "array",
        patterns: ["hash_table", "array"],
        estimatedTime: "15分钟",
        passingRate: "49.1%",
        tags: ["数组", "哈希表"]
      },
      description: "给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出 和为目标值 target 的那两个整数，并返回它们的数组下标。",
      examples: [
        {
          input: "nums = [2,7,11,15], target = 9",
          output: "[0,1]",
          explanation: "因为 nums[0] + nums[1] == 9，所以返回 [0, 1]。"
        }
      ],
      constraints: [
        "2 <= nums.length <= 10⁴",
        "-10⁹ <= nums[i] <= 10⁹",
        "只会存在一个有效答案"
      ],
      hints: [
        "使用哈希表可以将时间复杂度从O(n²)优化到O(n)",
        "遍历数组时，检查target-nums[i]是否已存在于哈希表中"
      ]
    },
    167: {
      meta: {
        id: 167,
        title: "两数之和 II - 输入有序数组",
        difficulty: "中等",
        leetcodeId: 167,
        category: "array",
        patterns: ["two_pointers"],
        estimatedTime: "20分钟",
        passingRate: "59.2%",
        tags: ["数组", "双指针", "二分查找"]
      },
      description: "给你一个下标从 1 开始的整数数组 numbers，该数组已按非递减顺序排列，请你从数组中找出满足相加之和等于目标数 target 的两个数。",
      examples: [
        {
          input: "numbers = [2,7,11,15], target = 9",
          output: "[1,2]",
          explanation: "2 与 7 之和等于目标数 9。因此 index1 = 1, index2 = 2。"
        }
      ]
    }
  };

  return defaultProblems[problemId] || {
    meta: {
      id: problemId,
      title: "题目加载中...",
      difficulty: "未知",
      category: "unknown",
      patterns: [],
      tags: []
    },
    description: "题目内容正在加载中，请稍候...",
    examples: [],
    constraints: [],
    hints: []
  };
}

/**
 * 获取默认算法模式内容
 * @param {string} patternId
 * @returns {Object} 默认算法模式内容
 */
function getDefaultPatternContent(patternId) {
  const defaultPatterns = {
    "array_two_pointers": {
      meta: {
        id: "array_two_pointers",
        name: "数组双指针",
        category: "array",
        difficulty: "基础",
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)"
      },
      theory: {
        concept: "双指针技术是一种高效的数组处理方法，通过维护两个指针来减少时间复杂度。",
        types: ["相向双指针", "同向双指针", "快慢指针"],
        advantages: ["时间复杂度优化", "空间复杂度低", "代码简洁"]
      },
      practiceProblems: [1, 167, 15, 11]
    }
  };

  return defaultPatterns[patternId] || {
    meta: {
      id: patternId,
      name: "算法模式加载中...",
      category: "unknown",
      difficulty: "未知"
    },
    theory: {
      concept: "内容正在加载中...",
      types: [],
      advantages: []
    },
    practiceProblems: []
  };
}

/**
 * 预加载核心算法内容
 * 加载最常用的题目和算法模式
 */
export async function preloadAlgorithmContent() {
  // 核心题目 (NeetCode Blind 75 中的前20题)
  const coreProblems = [1, 167, 15, 11, 42, 121, 125, 20, 21, 141, 226, 104, 543, 102, 49, 347, 242, 125, 217, 191];

  // 核心算法模式
  const corePatterns = [
    "array_two_pointers", "array_sliding_window", "string_two_pointers",
    "linkedlist_two_pointers", "tree_dfs", "tree_bfs", "graph_dfs", "dp_basic"
  ];

  const promises = [
    ...coreProblems.map(id => loadProblemContent(id).catch(console.warn)),
    ...corePatterns.map(id => loadPatternContent(id).catch(console.warn))
  ];

  await Promise.allSettled(promises);
  console.log(`✅ Algorithm content preloaded: ${coreProblems.length} problems, ${corePatterns.length} patterns`);
}

/**
 * 批量加载某个分类的所有题目
 * @param {string} category - 分类名称 (如: "array", "string")
 * @param {Array} problemIds - 题目ID列表
 */
export async function loadCategoryProblems(category, problemIds) {
  const promises = problemIds.map(id => loadProblemContent(id));
  const results = await Promise.allSettled(promises);

  const loaded = results.filter(result => result.status === 'fulfilled').length;
  console.log(`📚 Loaded ${loaded}/${problemIds.length} problems for category: ${category}`);

  return results.map((result, index) => ({
    problemId: problemIds[index],
    status: result.status,
    data: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason : null
  }));
}

/**
 * 清除缓存
 */
export function clearAlgorithmCache() {
  algorithmCache.clear();
  console.log('🧹 Algorithm cache cleared');
}

/**
 * 获取缓存统计
 */
export function getCacheStats() {
  const keys = Array.from(algorithmCache.keys());
  const problems = keys.filter(key => key.startsWith('problem-')).length;
  const patterns = keys.filter(key => key.startsWith('pattern-')).length;

  return {
    total: algorithmCache.size,
    problems,
    patterns,
    keys
  };
}

/**
 * 智能内容建议
 * 根据用户当前学习的题目，推荐相关内容
 */
export async function getRecommendedContent(currentProblemId, userProgress = {}) {
  try {
    const currentProblem = await loadProblemContent(currentProblemId);
    const recommendations = {
      similarProblems: [],
      nextPatterns: [],
      reviewProblems: []
    };

    // 基于当前题目的模式推荐相似题目
    for (const pattern of currentProblem.meta.patterns) {
      const patternData = await loadPatternContent(pattern);
      recommendations.similarProblems.push(...patternData.practiceProblems);
    }

    // 去重并限制数量
    recommendations.similarProblems = [...new Set(recommendations.similarProblems)]
      .filter(id => id !== currentProblemId)
      .slice(0, 5);

    return recommendations;
  } catch (error) {
    console.error('Failed to generate recommendations:', error);
    return { similarProblems: [], nextPatterns: [], reviewProblems: [] };
  }
}

export default {
  loadProblemContent,
  loadPatternContent,
  preloadAlgorithmContent,
  loadCategoryProblems,
  clearAlgorithmCache,
  getCacheStats,
  getRecommendedContent
};