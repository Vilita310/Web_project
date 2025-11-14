// NeetCode Blind 75 完整题目数据结构
// 三栏布局：数据结构(左栏) → 算法模式(中栏) → 题目列表(右栏)

export const leetcode75Data = {
  // ========== 数组 (Array) ==========
  array: {
    id: "array",
    name: "数组",
    icon: "📊",
    description: "掌握数组这一最基础的数据结构",
    difficulty: "基础",
    estimatedTime: "3-4天",
    progress: 0,
    totalProblems: 21,
    completedProblems: 0,
    category: "数据结构",

    patterns: [
      {
        id: "array_two_pointers",
        name: "数组双指针",
        description: "使用双指针技术解决数组相关问题",
        visualDemo: "双指针在数组中的移动演示",
        coreIdea: "利用双指针减少时间复杂度，解决数组中的查找和配对问题",
        problems: [
          {
            id: 1,
            title: "两数之和",
            difficulty: "简单",
            leetcodeId: 1,
            completed: false,
            // 详细内容已移至 /data/algorithms/problems/problem1.json
            tags: ["数组", "哈希表"]
          },
          {
            id: 167,
            title: "两数之和 II - 输入有序数组",
            difficulty: "中等",
            leetcodeId: 167,
            completed: false,
            // 详细内容已移至 /data/algorithms/problems/problem167.json
            tags: ["数组", "双指针"]
          },
          {
            id: 15,
            title: "三数之和",
            difficulty: "中等",
            leetcodeId: 15,
            completed: false,
            // 详细内容已移至 /data/algorithms/problems/problem15.json
            tags: ["数组", "双指针", "排序"]
          },
          {
            id: 11,
            title: "盛最多水的容器",
            difficulty: "中等",
            leetcodeId: 11,
            completed: false,
            description: "找到能够盛最多水的两条垂直线",
            hints: ["双指针相向移动", "移动较短的指针", "贪心思想"],
            tags: ["数组", "双指针", "贪心"]
          },
          {
            id: 42,
            title: "接雨水",
            difficulty: "困难",
            leetcodeId: 42,
            completed: false,
            description: "计算下雨后能够接多少雨水",
            hints: ["双指针", "动态规划", "单调栈"],
            tags: ["数组", "双指针", "动态规划", "栈"]
          }
        ]
      },
      {
        id: "array_sliding_window",
        name: "数组滑动窗口",
        description: "使用滑动窗口处理数组子序列问题",
        visualDemo: "滑动窗口在数组上的移动演示",
        coreIdea: "维护一个动态窗口，高效处理连续子数组问题",
        problems: [
          {
            id: 121,
            title: "买卖股票的最佳时机",
            difficulty: "简单",
            leetcodeId: 121,
            completed: false,
            description: "找到买入和卖出股票的最佳时机以获得最大利润",
            hints: ["记录最低价格", "动态更新最大利润", "一次遍历"],
            tags: ["数组", "动态规划"]
          },
          {
            id: 53,
            title: "最大子数组和",
            difficulty: "中等",
            leetcodeId: 53,
            completed: false,
            description: "找到具有最大和的连续子数组",
            hints: ["动态规划", "Kadane算法", "当前和与最大和"],
            tags: ["数组", "动态规划"]
          },
          {
            id: 152,
            title: "乘积最大子数组",
            difficulty: "中等",
            leetcodeId: 152,
            completed: false,
            description: "找到乘积最大的连续子数组",
            hints: ["记录最大最小值", "负数影响", "动态规划"],
            tags: ["数组", "动态规划"]
          }
        ]
      },
      {
        id: "array_binary_search",
        name: "数组二分查找",
        description: "在有序数组中使用二分查找算法",
        visualDemo: "二分查找在数组中的搜索过程",
        coreIdea: "利用数组有序性，通过二分查找快速定位元素",
        problems: [
          {
            id: 153,
            title: "寻找旋转排序数组中的最小值",
            difficulty: "中等",
            leetcodeId: 153,
            completed: false,
            description: "在旋转排序数组中找到最小值",
            hints: ["二分查找", "中点与右端点比较", "旋转点特性"],
            tags: ["数组", "二分查找"]
          },
          {
            id: 33,
            title: "搜索旋转排序数组",
            difficulty: "中等",
            leetcodeId: 33,
            completed: false,
            description: "在旋转排序数组中搜索目标值",
            hints: ["二分查找", "判断有序部分", "目标值范围"],
            tags: ["数组", "二分查找"]
          }
        ]
      },
      {
        id: "array_basic_operations",
        name: "数组基础操作",
        description: "数组的基本操作和变换",
        visualDemo: "数组元素操作的演示",
        coreIdea: "掌握数组元素的访问、修改和重组技巧",
        problems: [
          {
            id: 217,
            title: "存在重复元素",
            difficulty: "简单",
            leetcodeId: 217,
            completed: false,
            description: "判断数组中是否存在重复元素",
            hints: ["哈希表记录", "集合去重", "一次遍历"],
            tags: ["数组", "哈希表"]
          },
          {
            id: 238,
            title: "除自身以外数组的乘积",
            difficulty: "中等",
            leetcodeId: 238,
            completed: false,
            description: "返回数组中除自身以外所有元素的乘积",
            hints: ["左右乘积数组", "空间优化", "不使用除法"],
            tags: ["数组", "前缀和"]
          }
        ]
      },
      {
        id: "array_dynamic_programming",
        name: "数组动态规划",
        description: "基于数组的动态规划问题",
        visualDemo: "数组DP状态转移演示",
        coreIdea: "利用数组存储状态，解决最优化问题",
        problems: [
          {
            id: 70,
            title: "爬楼梯",
            difficulty: "简单",
            leetcodeId: 70,
            completed: false,
            description: "计算爬到第n阶楼梯的方法数",
            hints: ["斐波那契数列", "状态转移", "空间优化"],
            tags: ["记忆化搜索", "数学", "动态规划"]
          },
          {
            id: 198,
            title: "打家劫舍",
            difficulty: "中等",
            leetcodeId: 198,
            completed: false,
            description: "在不触动警报的情况下偷到最多的钱",
            hints: ["状态选择", "不相邻约束", "最优子结构"],
            tags: ["数组", "动态规划"]
          },
          {
            id: 213,
            title: "打家劫舍 II",
            difficulty: "中等",
            leetcodeId: 213,
            completed: false,
            description: "房屋围成一圈的打家劫舍问题",
            hints: ["环形数组", "分情况讨论", "两次DP"],
            tags: ["数组", "动态规划"]
          },
          {
            id: 300,
            title: "最长递增子序列",
            difficulty: "中等",
            leetcodeId: 300,
            completed: false,
            description: "找到数组中最长递增子序列的长度",
            hints: ["动态规划", "二分查找优化", "状态定义"],
            tags: ["数组", "二分查找", "动态规划"]
          },
          {
            id: 322,
            title: "零钱兑换",
            difficulty: "中等",
            leetcodeId: 322,
            completed: false,
            description: "计算凑成总金额所需的最少硬币个数",
            hints: ["完全背包", "状态转移", "初始化无穷大"],
            tags: ["广度优先搜索", "数组", "动态规划"]
          },
          {
            id: 377,
            title: "组合总和 Ⅳ",
            difficulty: "中等",
            leetcodeId: 377,
            completed: false,
            description: "计算组合总和的方案数",
            hints: ["动态规划", "完全背包", "排列组合"],
            tags: ["数组", "动态规划"]
          }
        ]
      },
      {
        id: "array_backtracking",
        name: "数组回溯",
        description: "在数组中使用回溯算法",
        visualDemo: "数组回溯搜索过程",
        coreIdea: "通过回溯枚举数组元素的所有可能组合",
        problems: [
          {
            id: 39,
            title: "组合总和",
            difficulty: "中等",
            leetcodeId: 39,
            completed: false,
            description: "找出所有相加之和为目标数的组合",
            hints: ["回溯搜索", "剪枝优化", "重复元素处理"],
            tags: ["数组", "回溯"]
          },
          {
            id: 46,
            title: "全排列",
            difficulty: "中等",
            leetcodeId: 46,
            completed: false,
            description: "给定数组的所有可能的排列",
            hints: ["回溯算法", "交换位置", "使用标记数组"],
            tags: ["数组", "回溯"]
          }
        ]
      }
    ]
  },

  // ========== 字符串 (String) ==========
  string: {
    id: "string",
    name: "字符串",
    icon: "📝",
    description: "掌握字符串处理的各种算法技巧",
    difficulty: "基础",
    estimatedTime: "2-3天",
    progress: 0,
    totalProblems: 11,
    completedProblems: 0,
    category: "数据结构",

    patterns: [
      {
        id: "string_two_pointers",
        name: "字符串双指针",
        description: "使用双指针解决字符串问题",
        visualDemo: "双指针在字符串中的移动",
        coreIdea: "利用双指针技术处理字符串的回文、匹配等问题",
        problems: [
          {
            id: 125,
            title: "验证回文串",
            difficulty: "简单",
            leetcodeId: 125,
            completed: false,
            description: "判断字符串是否为回文串，只考虑字母和数字字符",
            hints: ["双指针相向移动", "忽略非字母数字字符", "大小写转换"],
            tags: ["字符串", "双指针"]
          }
        ]
      },
      {
        id: "string_sliding_window",
        name: "字符串滑动窗口",
        description: "使用滑动窗口处理字符串子串问题",
        visualDemo: "滑动窗口在字符串上的移动",
        coreIdea: "维护动态窗口解决字符串的子串匹配和统计问题",
        problems: [
          {
            id: 3,
            title: "无重复字符的最长子串",
            difficulty: "中等",
            leetcodeId: 3,
            completed: false,
            description: "找出字符串中不含重复字符的最长子串长度",
            hints: ["滑动窗口", "哈希表记录位置", "动态调整窗口大小"],
            tags: ["字符串", "哈希表", "滑动窗口"]
          },
          {
            id: 424,
            title: "替换后的最长重复字符",
            difficulty: "中等",
            leetcodeId: 424,
            completed: false,
            description: "替换k个字符后能得到的最长重复字符子串",
            hints: ["滑动窗口", "字符频次统计", "窗口内最大频次"],
            tags: ["字符串", "滑动窗口"]
          },
          {
            id: 76,
            title: "最小覆盖子串",
            difficulty: "困难",
            leetcodeId: 76,
            completed: false,
            description: "找到包含所有目标字符的最小子串",
            hints: ["双指针滑动窗口", "字符频次统计", "窗口收缩条件"],
            tags: ["字符串", "滑动窗口", "哈希表"]
          },
          {
            id: 567,
            title: "字符串的排列",
            difficulty: "中等",
            leetcodeId: 567,
            completed: false,
            description: "判断s2是否包含s1的排列",
            hints: ["固定窗口大小", "字符频次匹配", "窗口滑动"],
            tags: ["字符串", "滑动窗口"]
          }
        ]
      },
      {
        id: "string_dynamic_programming",
        name: "字符串动态规划",
        description: "基于字符串的动态规划问题",
        visualDemo: "字符串DP状态转移",
        coreIdea: "利用动态规划解决字符串的匹配和编辑问题",
        problems: [
          {
            id: 5,
            title: "最长回文子串",
            difficulty: "中等",
            leetcodeId: 5,
            completed: false,
            description: "找到字符串中最长的回文子串",
            hints: ["中心扩展", "动态规划", "Manacher算法"],
            tags: ["字符串", "动态规划"]
          },
          {
            id: 647,
            title: "回文子串",
            difficulty: "中等",
            leetcodeId: 647,
            completed: false,
            description: "统计字符串中回文子串的个数",
            hints: ["中心扩展", "动态规划", "每个字符为中心"],
            tags: ["字符串", "动态规划"]
          },
          {
            id: 91,
            title: "解码方法",
            difficulty: "中等",
            leetcodeId: 91,
            completed: false,
            description: "计算字符串的解码方法总数",
            hints: ["状态转移", "边界条件", "字符组合"],
            tags: ["字符串", "动态规划"]
          },
          {
            id: 139,
            title: "单词拆分",
            difficulty: "中等",
            leetcodeId: 139,
            completed: false,
            description: "判断字符串是否可以被拆分为字典中的单词",
            hints: ["动态规划", "字典查找", "子串匹配"],
            tags: ["字典树", "记忆化搜索", "哈希表", "字符串", "动态规划"]
          },
          {
            id: 1143,
            title: "最长公共子序列",
            difficulty: "中等",
            leetcodeId: 1143,
            completed: false,
            description: "找到两个字符串的最长公共子序列长度",
            hints: ["二维DP", "字符匹配", "状态转移"],
            tags: ["字符串", "动态规划"]
          }
        ]
      },
      {
        id: "string_backtracking",
        name: "字符串回溯",
        description: "字符串相关的回溯算法",
        visualDemo: "字符串回溯搜索过程",
        coreIdea: "通过回溯枚举字符串的各种组合和排列",
        problems: [
          {
            id: 17,
            title: "电话号码的字母组合",
            difficulty: "中等",
            leetcodeId: 17,
            completed: false,
            description: "返回电话号码所能表示的所有字母组合",
            hints: ["回溯构建", "字符映射", "深度搜索"],
            tags: ["哈希表", "字符串", "回溯"]
          }
        ]
      }
    ]
  },

  // ========== 链表 (Linked List) ==========
  linked_list: {
    id: "linked_list",
    name: "链表",
    icon: "🔗",
    description: "掌握链表数据结构的操作技巧",
    difficulty: "中等",
    estimatedTime: "2-3天",
    progress: 0,
    totalProblems: 7,
    completedProblems: 0,
    category: "数据结构",

    patterns: [
      {
        id: "linked_list_basic_operations",
        name: "链表基础操作",
        description: "链表的创建、遍历、修改等基本操作",
        visualDemo: "链表节点操作的动画演示",
        coreIdea: "理解指针操作和链表结构特性",
        problems: [
          {
            id: 206,
            title: "反转链表",
            difficulty: "简单",
            leetcodeId: 206,
            completed: false,
            description: "反转一个单链表",
            hints: ["迭代法三指针", "递归法", "头插法"],
            tags: ["链表", "递归"]
          },
          {
            id: 21,
            title: "合并两个有序链表",
            difficulty: "简单",
            leetcodeId: 21,
            completed: false,
            description: "将两个升序链表合并为一个新的升序链表",
            hints: ["双指针比较", "递归合并", "虚拟头节点"],
            tags: ["链表", "递归"]
          },
          {
            id: 143,
            title: "重排链表",
            difficulty: "中等",
            leetcodeId: 143,
            completed: false,
            description: "将链表重新排列成特定模式",
            hints: ["找中点", "反转后半部分", "交替合并"],
            tags: ["链表", "双指针"]
          }
        ]
      },
      {
        id: "linked_list_two_pointers",
        name: "链表双指针",
        description: "使用双指针解决链表问题",
        visualDemo: "快慢指针在链表中的移动",
        coreIdea: "利用快慢指针解决链表的循环检测和定位问题",
        problems: [
          {
            id: 141,
            title: "环形链表",
            difficulty: "简单",
            leetcodeId: 141,
            completed: false,
            description: "判断链表中是否有环",
            hints: ["快慢指针", "哈希表记录", "Floyd判圈算法"],
            tags: ["链表", "双指针"]
          },
          {
            id: 19,
            title: "删除链表的倒数第N个结点",
            difficulty: "中等",
            leetcodeId: 19,
            completed: false,
            description: "删除链表的倒数第n个节点",
            hints: ["快慢指针", "先让快指针走n步", "虚拟头节点"],
            tags: ["链表", "双指针"]
          }
        ]
      },
      {
        id: "linked_list_advanced",
        name: "链表高级操作",
        description: "复杂的链表操作和算法",
        visualDemo: "复杂链表操作演示",
        coreIdea: "掌握链表的分治、合并等高级技巧",
        problems: [
          {
            id: 23,
            title: "合并K个升序链表",
            difficulty: "困难",
            leetcodeId: 23,
            completed: false,
            description: "合并k个升序链表",
            hints: ["分治合并", "优先队列", "逐一合并"],
            tags: ["链表", "分治", "堆"]
          }
        ]
      }
    ]
  },

  // ========== 栈 (Stack) ==========
  stack: {
    id: "stack",
    name: "栈",
    icon: "📚",
    description: "利用栈的后进先出特性解决问题",
    difficulty: "基础",
    estimatedTime: "1天",
    progress: 0,
    totalProblems: 1,
    completedProblems: 0,
    category: "数据结构",

    patterns: [
      {
        id: "stack_basic",
        name: "栈基础应用",
        description: "栈的基本应用场景",
        visualDemo: "栈的压入弹出操作演示",
        coreIdea: "利用栈的LIFO特性处理匹配和嵌套问题",
        problems: [
          {
            id: 20,
            title: "有效的括号",
            difficulty: "简单",
            leetcodeId: 20,
            completed: false,
            description: "判断字符串中的括号是否有效匹配",
            hints: ["栈存储左括号", "遇到右括号时匹配", "最后栈应为空"],
            tags: ["栈", "字符串"]
          }
        ]
      }
    ]
  },

  // ========== 树 (Tree) ==========
  tree: {
    id: "tree",
    name: "树",
    icon: "🌳",
    description: "掌握树数据结构的遍历和操作",
    difficulty: "中等",
    estimatedTime: "4-5天",
    progress: 0,
    totalProblems: 14,
    completedProblems: 0,
    category: "数据结构",

    patterns: [
      {
        id: "tree_traversal",
        name: "树的遍历",
        description: "前序、中序、后序、层次遍历",
        visualDemo: "二叉树遍历的动画演示",
        coreIdea: "理解不同遍历方式的特点和应用场景",
        problems: [
          {
            id: 226,
            title: "翻转二叉树",
            difficulty: "简单",
            leetcodeId: 226,
            completed: false,
            description: "翻转一棵二叉树",
            hints: ["递归交换", "层次遍历", "前序遍历"],
            tags: ["树", "递归"]
          },
          {
            id: 104,
            title: "二叉树的最大深度",
            difficulty: "简单",
            leetcodeId: 104,
            completed: false,
            description: "找到二叉树的最大深度",
            hints: ["递归求解", "层次遍历", "深度优先搜索"],
            tags: ["树", "深度优先搜索", "递归"]
          },
          {
            id: 100,
            title: "相同的树",
            difficulty: "简单",
            leetcodeId: 100,
            completed: false,
            description: "判断两个二叉树是否相同",
            hints: ["递归比较", "同时遍历", "节点值和结构"],
            tags: ["树", "递归"]
          },
          {
            id: 572,
            title: "另一个树的子树",
            difficulty: "简单",
            leetcodeId: 572,
            completed: false,
            description: "判断一个树是否是另一个树的子树",
            hints: ["递归判断", "树的比较", "遍历所有节点"],
            tags: ["树", "递归"]
          },
          {
            id: 102,
            title: "二叉树的层序遍历",
            difficulty: "中等",
            leetcodeId: 102,
            completed: false,
            description: "返回二叉树的层次遍历结果",
            hints: ["队列实现", "BFS遍历", "记录每层节点"],
            tags: ["树", "广度优先搜索"]
          },
          {
            id: 105,
            title: "从前序与中序遍历序列构造二叉树",
            difficulty: "中等",
            leetcodeId: 105,
            completed: false,
            description: "根据前序和中序遍历结果构造二叉树",
            hints: ["递归构造", "找根节点", "分割左右子树"],
            tags: ["树", "递归"]
          },
          {
            id: 297,
            title: "二叉树的序列化与反序列化",
            difficulty: "困难",
            leetcodeId: 297,
            completed: false,
            description: "设计算法来序列化和反序列化二叉树",
            hints: ["前序遍历", "空节点标记", "递归构造"],
            tags: ["树", "递归", "设计"]
          }
        ]
      },
      {
        id: "binary_search_tree",
        name: "二叉搜索树",
        description: "二叉搜索树的特性和操作",
        visualDemo: "BST操作演示",
        coreIdea: "利用BST的有序性质进行高效操作",
        problems: [
          {
            id: 235,
            title: "二叉搜索树的最近公共祖先",
            difficulty: "中等",
            leetcodeId: 235,
            completed: false,
            description: "找到BST中两个节点的最近公共祖先",
            hints: ["利用BST性质", "递归查找", "比较节点值"],
            tags: ["树", "递归"]
          },
          {
            id: 98,
            title: "验证二叉搜索树",
            difficulty: "中等",
            leetcodeId: 98,
            completed: false,
            description: "判断一个二叉树是否是有效的BST",
            hints: ["中序遍历", "递归验证", "节点值范围"],
            tags: ["树", "递归"]
          },
          {
            id: 230,
            title: "二叉搜索树中第K小的元素",
            difficulty: "中等",
            leetcodeId: 230,
            completed: false,
            description: "找到BST中第k小的元素",
            hints: ["中序遍历", "计数器", "提前终止"],
            tags: ["树", "递归"]
          }
        ]
      },
      {
        id: "tree_advanced",
        name: "树的高级操作",
        description: "复杂的树算法和应用",
        visualDemo: "高级树算法演示",
        coreIdea: "掌握树的路径、深度等复杂操作",
        problems: [
          {
            id: 124,
            title: "二叉树中的最大路径和",
            difficulty: "困难",
            leetcodeId: 124,
            completed: false,
            description: "找到二叉树中最大路径和",
            hints: ["递归计算", "全局最大值", "路径不一定过根"],
            tags: ["树", "递归"]
          }
        ]
      },
      {
        id: "trie_tree",
        name: "字典树",
        description: "前缀树的实现和应用",
        visualDemo: "Trie树操作演示",
        coreIdea: "利用前缀树高效处理字符串前缀查询",
        problems: [
          {
            id: 208,
            title: "实现 Trie (前缀树)",
            difficulty: "中等",
            leetcodeId: 208,
            completed: false,
            description: "实现一个 Trie (前缀树)",
            hints: ["树形结构", "字符映射", "标记结束"],
            tags: ["设计", "字典树"]
          },
          {
            id: 211,
            title: "添加与搜索单词 - 数据结构设计",
            difficulty: "中等",
            leetcodeId: 211,
            completed: false,
            description: "设计一个支持通配符搜索的数据结构",
            hints: ["字典树", "回溯搜索", "通配符处理"],
            tags: ["设计", "字典树", "回溯"]
          },
          {
            id: 212,
            title: "单词搜索 II",
            difficulty: "困难",
            leetcodeId: 212,
            completed: false,
            description: "在二维网格中搜索多个单词",
            hints: ["字典树优化", "DFS回溯", "剪枝技巧"],
            tags: ["字典树", "回溯", "深度优先搜索"]
          }
        ]
      }
    ]
  },

  // ========== 堆 (Heap) ==========
  heap: {
    id: "heap",
    name: "堆",
    icon: "⛰️",
    description: "掌握堆数据结构的应用",
    difficulty: "中等",
    estimatedTime: "2天",
    progress: 0,
    totalProblems: 2,
    completedProblems: 0,
    category: "数据结构",

    patterns: [
      {
        id: "heap_basic",
        name: "堆基础应用",
        description: "最大堆和最小堆的使用场景",
        visualDemo: "堆的插入删除操作演示",
        coreIdea: "利用堆维护有序性和快速获取极值",
        problems: [
          {
            id: 295,
            title: "数据流的中位数",
            difficulty: "困难",
            leetcodeId: 295,
            completed: false,
            description: "设计一个支持动态获取中位数的数据结构",
            hints: ["两个堆", "大小堆平衡", "动态维护"],
            tags: ["堆", "设计"]
          },
          {
            id: 347,
            title: "前 K 个高频元素",
            difficulty: "中等",
            leetcodeId: 347,
            completed: false,
            description: "找到数组中前k个出现频率最高的元素",
            hints: ["哈希表统计", "最小堆维护", "快速选择"],
            tags: ["堆", "哈希表"]
          }
        ]
      }
    ]
  },

  // ========== 图 (Graph) ==========
  graph: {
    id: "graph",
    name: "图",
    icon: "🕸️",
    description: "掌握图的遍历和基本算法",
    difficulty: "中等偏难",
    estimatedTime: "3-4天",
    progress: 0,
    totalProblems: 6,
    completedProblems: 0,
    category: "数据结构",

    patterns: [
      {
        id: "graph_dfs_bfs",
        name: "图的遍历",
        description: "DFS和BFS在图中的应用",
        visualDemo: "图的深度优先和广度优先遍历",
        coreIdea: "理解图的表示方法和遍历策略",
        problems: [
          {
            id: 200,
            title: "岛屿数量",
            difficulty: "中等",
            leetcodeId: 200,
            completed: false,
            description: "计算二维网格中岛屿的数量",
            hints: ["DFS标记", "BFS搜索", "并查集"],
            tags: ["深度优先搜索", "广度优先搜索", "并查集"]
          },
          {
            id: 133,
            title: "克隆图",
            difficulty: "中等",
            leetcodeId: 133,
            completed: false,
            description: "深拷贝一个无向连通图",
            hints: ["DFS递归", "哈希表映射", "BFS迭代"],
            tags: ["深度优先搜索", "广度优先搜索", "图"]
          },
          {
            id: 417,
            title: "太平洋大西洋水流问题",
            difficulty: "中等",
            leetcodeId: 417,
            completed: false,
            description: "找到能流向太平洋和大西洋的格子",
            hints: ["反向思考", "DFS标记", "两次遍历"],
            tags: ["深度优先搜索", "广度优先搜索", "数组"]
          }
        ]
      },
      {
        id: "graph_topological",
        name: "拓扑排序",
        description: "有向图的拓扑排序算法",
        visualDemo: "拓扑排序过程演示",
        coreIdea: "利用拓扑排序解决依赖关系问题",
        problems: [
          {
            id: 207,
            title: "课程表",
            difficulty: "中等",
            leetcodeId: 207,
            completed: false,
            description: "判断是否可能完成所有课程",
            hints: ["拓扑排序", "环检测", "入度统计"],
            tags: ["深度优先搜索", "广度优先搜索", "图", "拓扑排序"]
          }
        ]
      },
      {
        id: "union_find",
        name: "并查集",
        description: "并查集数据结构的应用",
        visualDemo: "并查集操作演示",
        coreIdea: "利用并查集处理连通性问题",
        problems: [
          {
            id: 323,
            title: "无向图中连通分量的数目",
            difficulty: "中等",
            leetcodeId: 323,
            completed: false,
            description: "计算无向图中的连通分量数目",
            hints: ["DFS遍历", "并查集", "访问标记"],
            tags: ["深度优先搜索", "广度优先搜索", "并查集", "图"],
            premium: true
          },
          {
            id: 128,
            title: "最长连续序列",
            difficulty: "中等",
            leetcodeId: 128,
            completed: false,
            description: "找到未排序数组中最长连续序列的长度",
            hints: ["哈希表", "序列起点", "一次遍历"],
            tags: ["并查集", "数组", "哈希表"]
          }
        ]
      }
    ]
  },

  // ========== 矩阵 (Matrix) ==========
  matrix: {
    id: "matrix",
    name: "矩阵",
    icon: "🧮",
    description: "掌握矩阵操作和算法",
    difficulty: "中等",
    estimatedTime: "2天",
    progress: 0,
    totalProblems: 8,
    completedProblems: 0,
    category: "数据结构",

    patterns: [
      {
        id: "matrix_traversal",
        name: "矩阵遍历",
        description: "矩阵的各种遍历方式",
        visualDemo: "矩阵遍历模式演示",
        coreIdea: "掌握矩阵的行列遍历和特殊遍历方式",
        problems: [
          {
            id: 48,
            title: "旋转图像",
            difficulty: "中等",
            leetcodeId: 48,
            completed: false,
            description: "将图像顺时针旋转90度",
            hints: ["矩阵转置", "水平翻转", "原地旋转"],
            tags: ["数组", "数学", "矩阵"]
          },
          {
            id: 54,
            title: "螺旋矩阵",
            difficulty: "中等",
            leetcodeId: 54,
            completed: false,
            description: "螺旋顺序遍历矩阵",
            hints: ["边界控制", "方向切换", "循环遍历"],
            tags: ["数组", "矩阵", "模拟"]
          },
          {
            id: 73,
            title: "矩阵置零",
            difficulty: "中等",
            leetcodeId: 73,
            completed: false,
            description: "将包含0的行和列都置为0",
            hints: ["原地算法", "标记位置", "第一行列作标记"],
            tags: ["数组", "哈希表", "矩阵"]
          }
        ]
      },
      {
        id: "matrix_search",
        name: "矩阵搜索",
        description: "在矩阵中进行搜索和回溯",
        visualDemo: "矩阵搜索算法演示",
        coreIdea: "利用DFS和回溯在矩阵中进行路径搜索",
        problems: [
          {
            id: 79,
            title: "单词搜索",
            difficulty: "中等",
            leetcodeId: 79,
            completed: false,
            description: "在二维网格中搜索单词",
            hints: ["DFS回溯", "访问标记", "四个方向搜索"],
            tags: ["数组", "回溯"]
          }
        ]
      },
      {
        id: "matrix_dp",
        name: "矩阵动态规划",
        description: "基于矩阵的动态规划问题",
        visualDemo: "矩阵DP状态转移",
        coreIdea: "在矩阵上进行状态转移和路径计算",
        problems: [
          {
            id: 62,
            title: "不同路径",
            difficulty: "中等",
            leetcodeId: 62,
            completed: false,
            description: "计算从左上角到右下角的不同路径数",
            hints: ["网格DP", "组合数学", "状态压缩"],
            tags: ["数学", "动态规划", "组合数学"]
          }
        ]
      },
      {
        id: "matrix_intervals",
        name: "区间问题",
        description: "处理区间合并和调度问题",
        visualDemo: "区间操作演示",
        coreIdea: "通过排序和遍历处理区间问题",
        problems: [
          {
            id: 57,
            title: "插入区间",
            difficulty: "中等",
            leetcodeId: 57,
            completed: false,
            description: "向区间列表中插入一个新区间",
            hints: ["区间合并", "分情况讨论", "线性扫描"],
            tags: ["数组"]
          },
          {
            id: 56,
            title: "合并区间",
            difficulty: "中等",
            leetcodeId: 56,
            completed: false,
            description: "合并所有重叠的区间",
            hints: ["排序", "区间合并", "遍历判断"],
            tags: ["数组", "排序"]
          },
          {
            id: 435,
            title: "无重叠区间",
            difficulty: "中等",
            leetcodeId: 435,
            completed: false,
            description: "计算要移除的区间数量以使剩余区间无重叠",
            hints: ["贪心算法", "按结束时间排序", "区间调度"],
            tags: ["贪心", "数组", "动态规划", "排序"]
          }
        ]
      },
      {
        id: "matrix_math",
        name: "数学计算",
        description: "数学相关的计算问题",
        visualDemo: "数学计算演示",
        coreIdea: "掌握基本的数学计算和处理技巧",
        problems: [
          {
            id: 202,
            title: "快乐数",
            difficulty: "简单",
            leetcodeId: 202,
            completed: false,
            description: "判断一个数是否为快乐数",
            hints: ["循环检测", "快慢指针", "哈希表"],
            tags: ["哈希表", "数学", "双指针"]
          },
          {
            id: 66,
            title: "加一",
            difficulty: "简单",
            leetcodeId: 66,
            completed: false,
            description: "给表示整数的数组加一",
            hints: ["进位处理", "数组操作", "边界情况"],
            tags: ["数组", "数学"]
          }
        ]
      }
    ]
  },

  // ========== 位运算 (Bit Manipulation) ==========
  bit_manipulation: {
    id: "bit_manipulation",
    name: "位运算",
    icon: "⚡",
    description: "掌握位操作的技巧和应用",
    difficulty: "中等",
    estimatedTime: "1-2天",
    progress: 0,
    totalProblems: 5,
    completedProblems: 0,
    category: "数据结构",

    patterns: [
      {
        id: "bit_basic",
        name: "位运算基础",
        description: "常见位操作技巧和优化",
        visualDemo: "二进制位操作演示",
        coreIdea: "利用位运算的高效性解决特定问题",
        problems: [
          {
            id: 371,
            title: "两整数之和",
            difficulty: "中等",
            leetcodeId: 371,
            completed: false,
            description: "不使用+和-运算符计算两整数之和",
            hints: ["异或求和", "与运算求进位", "循环处理进位"],
            tags: ["位运算", "数学"]
          },
          {
            id: 191,
            title: "位1的个数",
            difficulty: "简单",
            leetcodeId: 191,
            completed: false,
            description: "计算无符号整数的二进制中1的个数",
            hints: ["逐位检查", "n & (n-1)", "Brian Kernighan算法"],
            tags: ["位运算"]
          },
          {
            id: 338,
            title: "比特位计数",
            difficulty: "简单",
            leetcodeId: 338,
            completed: false,
            description: "计算0到n中每个数的二进制中1的个数",
            hints: ["动态规划", "位运算递推", "i & (i-1)"],
            tags: ["位运算", "动态规划"]
          },
          {
            id: 268,
            title: "丢失的数字",
            difficulty: "简单",
            leetcodeId: 268,
            completed: false,
            description: "找到0到n中唯一缺失的数字",
            hints: ["异或运算", "数学求和", "二分查找"],
            tags: ["位运算", "数组", "哈希表", "数学", "二分查找", "排序"]
          },
          {
            id: 190,
            title: "颠倒二进制位",
            difficulty: "简单",
            leetcodeId: 190,
            completed: false,
            description: "颠倒给定的32位无符号整数的二进制位",
            hints: ["逐位处理", "左移右移", "位掩码"],
            tags: ["位运算", "分治"]
          }
        ]
      }
    ]
  }
};

// 默认用户进度数据
export const defaultUserProgress = {
  overall: {
    totalProblems: 75,
    completedProblems: 0,
    streak: 0,
    lastStudyDate: null
  },
  chapters: {
    array: { total: 21, completed: 0 },
    string: { total: 11, completed: 0 },
    linked_list: { total: 7, completed: 0 },
    stack: { total: 1, completed: 0 },
    tree: { total: 14, completed: 0 },
    heap: { total: 2, completed: 0 },
    graph: { total: 6, completed: 0 },
    matrix: { total: 8, completed: 0 },
    bit_manipulation: { total: 5, completed: 0 }
  }
};

// 学习路径数据
export const learningPath = [
  {
    week: 1,
    chapters: ["array", "string"],
    focus: "基础数据结构",
    estimatedHours: 20
  },
  {
    week: 2,
    chapters: ["linked_list", "stack"],
    focus: "线性数据结构",
    estimatedHours: 15
  },
  {
    week: 3,
    chapters: ["tree", "heap"],
    focus: "树形数据结构",
    estimatedHours: 25
  },
  {
    week: 4,
    chapters: ["graph", "matrix"],
    focus: "复杂数据结构",
    estimatedHours: 20
  },
  {
    week: 5,
    chapters: ["bit_manipulation"],
    focus: "位运算技巧",
    estimatedHours: 10
  }
];

// 知识图谱节点
export const knowledgeGraphNodes = [
  // 数据结构节点
  { id: "array", label: "数组", level: 1, category: "data_structure" },
  { id: "string", label: "字符串", level: 1, category: "data_structure" },
  { id: "linked_list", label: "链表", level: 1, category: "data_structure" },
  { id: "stack", label: "栈", level: 1, category: "data_structure" },
  { id: "tree", label: "树", level: 2, category: "data_structure" },
  { id: "heap", label: "堆", level: 2, category: "data_structure" },
  { id: "graph", label: "图", level: 3, category: "data_structure" },
  { id: "matrix", label: "矩阵", level: 2, category: "data_structure" },
  { id: "bit_manipulation", label: "位运算", level: 2, category: "data_structure" },

  // 算法模式节点
  { id: "two_pointers", label: "双指针", level: 1, category: "algorithm" },
  { id: "sliding_window", label: "滑动窗口", level: 2, category: "algorithm" },
  { id: "binary_search", label: "二分查找", level: 2, category: "algorithm" },
  { id: "dfs", label: "深度优先搜索", level: 3, category: "algorithm" },
  { id: "bfs", label: "广度优先搜索", level: 3, category: "algorithm" },
  { id: "backtracking", label: "回溯", level: 3, category: "algorithm" },
  { id: "dynamic_programming", label: "动态规划", level: 4, category: "algorithm" },
  { id: "greedy", label: "贪心", level: 3, category: "algorithm" }
];

// 知识图谱边
export const knowledgeGraphEdges = [
  // 数据结构之间的关系
  { from: "array", to: "two_pointers", relation: "enables" },
  { from: "array", to: "sliding_window", relation: "enables" },
  { from: "array", to: "binary_search", relation: "enables" },
  { from: "string", to: "two_pointers", relation: "applies" },
  { from: "string", to: "sliding_window", relation: "applies" },
  { from: "linked_list", to: "two_pointers", relation: "applies" },
  { from: "stack", to: "dfs", relation: "implements" },
  { from: "tree", to: "dfs", relation: "applies" },
  { from: "tree", to: "bfs", relation: "applies" },
  { from: "graph", to: "dfs", relation: "applies" },
  { from: "graph", to: "bfs", relation: "applies" },

  // 算法之间的关系
  { from: "two_pointers", to: "sliding_window", relation: "extends" },
  { from: "dfs", to: "backtracking", relation: "enables" },
  { from: "dynamic_programming", to: "greedy", relation: "relates" },
  { from: "binary_search", to: "dynamic_programming", relation: "optimizes" }
];