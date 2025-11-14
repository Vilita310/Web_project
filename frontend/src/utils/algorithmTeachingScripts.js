// 简化的算法教学脚本

/**
 * 获取算法脚本
 * @param {string} algorithmName - 算法名称
 * @returns {object} 算法脚本
 */
export const getAlgorithmScript = (algorithmName) => {
  // 简单的算法脚本映射
  const scripts = {
    'binary-search': {
      name: '二分查找',
      description: '在有序数组中查找目标值',
      steps: [
        { text: '初始化左右指针', action: 'init' },
        { text: '计算中点', action: 'calc' },
        { text: '比较中点值与目标值', action: 'compare' },
        { text: '更新指针位置', action: 'update' }
      ]
    },
    'bubble-sort': {
      name: '冒泡排序',
      description: '通过相邻元素比较进行排序',
      steps: [
        { text: '开始外层循环', action: 'outer-loop' },
        { text: '开始内层循环', action: 'inner-loop' },
        { text: '比较相邻元素', action: 'compare' },
        { text: '交换元素位置', action: 'swap' }
      ]
    },
    'default': {
      name: '算法演示',
      description: '基本算法操作',
      steps: [
        { text: '初始化数据', action: 'init' },
        { text: '处理数据', action: 'process' },
        { text: '输出结果', action: 'output' }
      ]
    }
  };

  return scripts[algorithmName] || scripts['default'];
};