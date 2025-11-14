/**
 * 算法题目和模式数据验证器
 * Algorithm Problem and Pattern Data Validator
 *
 * 基于 classroom 的验证模式，确保算法内容数据的完整性和正确性
 */

/**
 * 验证题目数据结构
 * @param {Object} problemData - 题目数据
 * @returns {Object} 验证结果
 */
export function validateProblemData(problemData) {
  const errors = [];
  const warnings = [];

  // 检查必需的顶级字段
  const requiredFields = ['meta', 'description'];
  for (const field of requiredFields) {
    if (!problemData[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // 验证 meta 字段
  if (problemData.meta) {
    const requiredMetaFields = ['id', 'title', 'difficulty', 'category'];
    for (const field of requiredMetaFields) {
      if (!problemData.meta[field]) {
        errors.push(`Missing required meta field: ${field}`);
      }
    }

    // 验证难度值
    const validDifficulties = ['简单', '中等', '困难', 'Easy', 'Medium', 'Hard'];
    if (problemData.meta.difficulty && !validDifficulties.includes(problemData.meta.difficulty)) {
      warnings.push(`Invalid difficulty: ${problemData.meta.difficulty}`);
    }

    // 验证分类值
    const validCategories = ['array', 'string', 'linked_list', 'stack', 'tree', 'heap', 'graph', 'matrix', 'bit_manipulation'];
    if (problemData.meta.category && !validCategories.includes(problemData.meta.category)) {
      warnings.push(`Invalid category: ${problemData.meta.category}`);
    }

    // 验证算法模式
    if (problemData.meta.patterns && !Array.isArray(problemData.meta.patterns)) {
      errors.push('meta.patterns must be an array');
    }

    // 验证标签
    if (problemData.meta.tags && !Array.isArray(problemData.meta.tags)) {
      errors.push('meta.tags must be an array');
    }
  }

  // 验证示例数组
  if (problemData.examples) {
    if (!Array.isArray(problemData.examples)) {
      errors.push('examples must be an array');
    } else {
      problemData.examples.forEach((example, index) => {
        if (!example.input || !example.output) {
          errors.push(`Example ${index + 1} missing input or output`);
        }
      });
    }
  }

  // 验证解法数组
  if (problemData.solutions) {
    if (!Array.isArray(problemData.solutions)) {
      errors.push('solutions must be an array');
    } else {
      problemData.solutions.forEach((solution, index) => {
        const requiredSolutionFields = ['id', 'name', 'timeComplexity', 'spaceComplexity'];
        for (const field of requiredSolutionFields) {
          if (!solution[field]) {
            errors.push(`Solution ${index + 1} missing required field: ${field}`);
          }
        }

        // 验证代码对象
        if (solution.code) {
          const supportedLanguages = ['javascript', 'python', 'java', 'cpp', 'go'];
          const providedLanguages = Object.keys(solution.code);
          if (providedLanguages.length === 0) {
            warnings.push(`Solution ${index + 1} has no code examples`);
          }

          for (const lang of providedLanguages) {
            if (!supportedLanguages.includes(lang)) {
              warnings.push(`Solution ${index + 1} has unsupported language: ${lang}`);
            }
          }
        }
      });
    }
  }

  // 验证 AI 讲解内容
  if (problemData.aiExplanation) {
    if (!problemData.aiExplanation.concept || !problemData.aiExplanation.concept.content) {
      warnings.push('AI explanation missing concept content');
    }

    if (problemData.aiExplanation.keyInsights && !Array.isArray(problemData.aiExplanation.keyInsights)) {
      warnings.push('aiExplanation.keyInsights must be an array');
    }
  }

  // 验证可视化数据
  if (problemData.visualization) {
    if (!problemData.visualization.type) {
      warnings.push('Visualization missing type field');
    }

    if (problemData.visualization.steps && !Array.isArray(problemData.visualization.steps)) {
      errors.push('visualization.steps must be an array');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: calculateDataQualityScore(problemData, errors, warnings)
  };
}

/**
 * 验证算法模式数据结构
 * @param {Object} patternData - 算法模式数据
 * @returns {Object} 验证结果
 */
export function validatePatternData(patternData) {
  const errors = [];
  const warnings = [];

  // 检查必需字段
  const requiredFields = ['meta', 'theory'];
  for (const field of requiredFields) {
    if (!patternData[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // 验证 meta 字段
  if (patternData.meta) {
    const requiredMetaFields = ['id', 'name', 'category'];
    for (const field of requiredMetaFields) {
      if (!patternData.meta[field]) {
        errors.push(`Missing required meta field: ${field}`);
      }
    }

    // 验证复杂度字段格式
    if (patternData.meta.timeComplexity && !isValidComplexity(patternData.meta.timeComplexity)) {
      warnings.push(`Invalid time complexity format: ${patternData.meta.timeComplexity}`);
    }

    if (patternData.meta.spaceComplexity && !isValidComplexity(patternData.meta.spaceComplexity)) {
      warnings.push(`Invalid space complexity format: ${patternData.meta.spaceComplexity}`);
    }
  }

  // 验证理论内容
  if (patternData.theory) {
    if (!patternData.theory.concept) {
      warnings.push('Theory section missing concept explanation');
    }

    if (patternData.theory.types && !Array.isArray(patternData.theory.types)) {
      warnings.push('theory.types must be an array');
    }

    if (patternData.theory.advantages && !Array.isArray(patternData.theory.advantages)) {
      warnings.push('theory.advantages must be an array');
    }
  }

  // 验证练习题目
  if (patternData.practiceProblems) {
    if (!Array.isArray(patternData.practiceProblems)) {
      errors.push('practiceProblems must be an array');
    } else {
      patternData.practiceProblems.forEach((problemId, index) => {
        if (typeof problemId !== 'number' && typeof problemId !== 'string') {
          errors.push(`Practice problem ${index + 1} must be a number or string ID`);
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: calculateDataQualityScore(patternData, errors, warnings)
  };
}

/**
 * 标准化题目数据
 * @param {Object} problemData - 原始题目数据
 * @returns {Object} 标准化后的题目数据
 */
export function normalizeProblemData(problemData) {
  const normalized = {
    meta: {
      id: problemData.meta?.id || 0,
      title: problemData.meta?.title || "未命名题目",
      difficulty: normalizeDifficulty(problemData.meta?.difficulty),
      leetcodeId: problemData.meta?.leetcodeId || problemData.meta?.id,
      category: problemData.meta?.category || "unknown",
      patterns: Array.isArray(problemData.meta?.patterns) ? problemData.meta.patterns : [],
      tags: Array.isArray(problemData.meta?.tags) ? problemData.meta.tags : [],
      estimatedTime: problemData.meta?.estimatedTime || "未知",
      passingRate: problemData.meta?.passingRate || "未知",
      version: problemData.meta?.version || "1.0",
      lastUpdated: problemData.meta?.lastUpdated || new Date().toISOString().split('T')[0]
    },

    description: problemData.description || "题目描述待补充",

    examples: Array.isArray(problemData.examples) ? problemData.examples : [],

    constraints: Array.isArray(problemData.constraints) ? problemData.constraints : [],

    hints: Array.isArray(problemData.hints) ? problemData.hints : [],

    solutions: Array.isArray(problemData.solutions) ? problemData.solutions.map(normalizeSolution) : [],

    // AI 讲解内容
    aiExplanation: problemData.aiExplanation ? {
      concept: problemData.aiExplanation.concept || { title: "", content: "" },
      keyInsights: Array.isArray(problemData.aiExplanation.keyInsights) ? problemData.aiExplanation.keyInsights : [],
      commonMistakes: Array.isArray(problemData.aiExplanation.commonMistakes) ? problemData.aiExplanation.commonMistakes : [],
      relatedConcepts: Array.isArray(problemData.aiExplanation.relatedConcepts) ? problemData.aiExplanation.relatedConcepts : []
    } : null,

    // 可视化数据
    visualization: problemData.visualization ? {
      type: problemData.visualization.type || "step_by_step",
      defaultData: problemData.visualization.defaultData || {},
      steps: Array.isArray(problemData.visualization.steps) ? problemData.visualization.steps : []
    } : null,

    // 相关题目推荐
    relatedProblems: Array.isArray(problemData.relatedProblems) ? problemData.relatedProblems : [],

    // 数据质量指标
    _dataQuality: {
      completeness: calculateCompleteness(problemData),
      lastValidated: new Date().toISOString(),
      source: "normalized"
    }
  };

  return normalized;
}

/**
 * 标准化算法模式数据
 * @param {Object} patternData - 原始算法模式数据
 * @returns {Object} 标准化后的算法模式数据
 */
export function normalizePatternData(patternData) {
  return {
    meta: {
      id: patternData.meta?.id || "unknown_pattern",
      name: patternData.meta?.name || "未命名算法模式",
      category: patternData.meta?.category || "unknown",
      difficulty: patternData.meta?.difficulty || "未知",
      timeComplexity: patternData.meta?.timeComplexity || "O(?)",
      spaceComplexity: patternData.meta?.spaceComplexity || "O(?)",
      version: patternData.meta?.version || "1.0"
    },

    theory: {
      concept: patternData.theory?.concept || "理论内容待补充",
      types: Array.isArray(patternData.theory?.types) ? patternData.theory.types : [],
      advantages: Array.isArray(patternData.theory?.advantages) ? patternData.theory.advantages : [],
      disadvantages: Array.isArray(patternData.theory?.disadvantages) ? patternData.theory.disadvantages : [],
      applicableScenarios: Array.isArray(patternData.theory?.applicableScenarios) ? patternData.theory.applicableScenarios : []
    },

    practiceProblems: Array.isArray(patternData.practiceProblems) ? patternData.practiceProblems : [],

    // 学习路径
    learningPath: patternData.learningPath ? {
      prerequisites: Array.isArray(patternData.learningPath.prerequisites) ? patternData.learningPath.prerequisites : [],
      nextTopics: Array.isArray(patternData.learningPath.nextTopics) ? patternData.learningPath.nextTopics : [],
      estimatedTime: patternData.learningPath.estimatedTime || "未知"
    } : null,

    _dataQuality: {
      completeness: calculateCompleteness(patternData),
      lastValidated: new Date().toISOString(),
      source: "normalized"
    }
  };
}

// 辅助函数

function normalizeDifficulty(difficulty) {
  const difficultyMap = {
    'Easy': '简单',
    'Medium': '中等',
    'Hard': '困难',
    'easy': '简单',
    'medium': '中等',
    'hard': '困难'
  };

  return difficultyMap[difficulty] || difficulty || '未知';
}

function normalizeSolution(solution) {
  return {
    id: solution.id || "solution_1",
    name: solution.name || "解法",
    timeComplexity: solution.timeComplexity || "O(?)",
    spaceComplexity: solution.spaceComplexity || "O(?)",
    description: solution.description || "",
    code: solution.code || {},
    explanation: solution.explanation ? {
      approach: solution.explanation.approach || "",
      steps: Array.isArray(solution.explanation.steps) ? solution.explanation.steps : [],
      pros: Array.isArray(solution.explanation.pros) ? solution.explanation.pros : [],
      cons: Array.isArray(solution.explanation.cons) ? solution.explanation.cons : []
    } : null
  };
}

function isValidComplexity(complexity) {
  // 检查是否是有效的时间/空间复杂度格式
  const complexityPattern = /^O\([^)]+\)$/;
  return complexityPattern.test(complexity);
}

function calculateDataQualityScore(data, errors, warnings) {
  let score = 100;

  // 错误扣分更多
  score -= errors.length * 20;

  // 警告扣分较少
  score -= warnings.length * 5;

  // 确保分数在 0-100 范围内
  return Math.max(0, Math.min(100, score));
}

function calculateCompleteness(data) {
  // 计算数据完整度百分比
  const requiredFields = ['meta', 'description'];
  const optionalFields = ['examples', 'constraints', 'hints', 'solutions'];

  let completeness = 0;
  const totalFields = requiredFields.length + optionalFields.length;

  // 必需字段权重更高
  for (const field of requiredFields) {
    if (data[field]) {
      completeness += 2; // 必需字段计2分
    }
  }

  // 可选字段
  for (const field of optionalFields) {
    if (data[field] && (Array.isArray(data[field]) ? data[field].length > 0 : true)) {
      completeness += 1; // 可选字段计1分
    }
  }

  return Math.round((completeness / (requiredFields.length * 2 + optionalFields.length)) * 100);
}

export default {
  validateProblemData,
  validatePatternData,
  normalizeProblemData,
  normalizePatternData
};