// 模拟面试题目数据
export const mockInterviewData = {
  // 数组类题目
  array: {
    name: "数组算法",
    description: "高频数组操作和算法题目",
    icon: "📊",
    problems: [
      {
        id: "two-sum",
        title: "两数之和",
        difficulty: "Easy",
        description: "给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值target的那两个整数，并返回它们的数组下标。",
        companies: ["Google", "Meta", "Amazon", "Apple"],
        tags: ["哈希表", "数组"],
        timeLimit: 30, // 分钟
        hints: [
          "可以使用暴力法，但时间复杂度较高",
          "考虑使用哈希表来优化查找过程",
          "一次遍历就能解决问题"
        ],
        template: `def twoSum(nums, target):
    # 你的代码
    pass`,
        solutionApproach: "使用哈希表存储已遍历的数字及其索引"
      },
      {
        id: "best-time-stock",
        title: "买卖股票的最佳时机",
        difficulty: "Easy",
        description: "给定一个数组prices，它的第i个元素prices[i]表示一支给定股票第i天的价格。你只能选择某一天买入这只股票，并选择在未来的某一天卖出该股票。设计一个算法来计算你所能获取的最大利润。",
        companies: ["Google", "Amazon", "Microsoft"],
        tags: ["数组", "动态规划"],
        timeLimit: 25,
        hints: [
          "记录到目前为止的最低价格",
          "计算当前价格卖出的利润",
          "保持最大利润的记录"
        ],
        template: `def maxProfit(prices):
    # 你的代码
    pass`
      },
      {
        id: "container-water",
        title: "盛最多水的容器",
        difficulty: "Medium",
        description: "给你n个非负整数a1，a2，...，an，每个数代表坐标中的一个点(i, ai)。在坐标内画n条垂直线，垂直线i的两个端点分别为(i, ai)和(i, 0)。找出其中的两条线，使得它们与x轴共同构成的容器可以容纳最多的水。",
        companies: ["Meta", "Google", "Apple"],
        tags: ["双指针", "数组"],
        timeLimit: 35,
        hints: [
          "使用双指针技术",
          "移动较短的那一边",
          "计算每次的面积并保持最大值"
        ],
        template: `def maxArea(height):
    # 你的代码
    pass`
      },
      {
        id: "three-sum",
        title: "三数之和",
        difficulty: "Medium",
        description: "给你一个包含n个整数的数组nums，判断nums中是否存在三个元素a，b，c，使得a + b + c = 0？请你找出所有满足条件且不重复的三元组。",
        companies: ["Meta", "Amazon", "Microsoft"],
        tags: ["数组", "双指针", "排序"],
        timeLimit: 40,
        hints: [
          "先对数组进行排序",
          "固定第一个数，用双指针寻找另外两个数",
          "注意去重处理"
        ],
        template: `def threeSum(nums):
    # 你的代码
    pass`
      },
      {
        id: "search-rotated-array",
        title: "搜索旋转排序数组",
        difficulty: "Medium",
        description: "整数数组nums按升序排列，数组中的值互不相同。在传递给函数之前，nums在预先未知的某个下标k上进行了旋转，使数组变为[nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]。给你旋转后的数组nums和一个整数target，如果nums中存在这个目标值target，则返回它的下标，否则返回-1。",
        companies: ["Google", "Meta", "Apple"],
        tags: ["数组", "二分查找"],
        timeLimit: 35,
        hints: [
          "使用二分查找",
          "判断哪一半是有序的",
          "根据目标值和有序部分的关系决定搜索方向"
        ],
        template: `def search(nums, target):
    # 你的代码
    pass`
      },
      {
        id: "product-except-self",
        title: "除自身以外数组的乘积",
        difficulty: "Medium",
        description: "给你一个长度为n的整数数组nums，其中n > 1，返回输出数组output，其中output[i]等于nums中除nums[i]之外其余各元素的乘积。",
        companies: ["Google", "Amazon", "Apple"],
        tags: ["数组", "前缀和"],
        timeLimit: 30,
        hints: [
          "不能使用除法运算",
          "可以使用左右两次遍历",
          "第一次计算左侧乘积，第二次计算右侧乘积"
        ],
        template: `def productExceptSelf(nums):
    # 你的代码
    pass`
      },
      {
        id: "maximum-subarray",
        title: "最大子数组和",
        difficulty: "Easy",
        description: "给你一个整数数组nums，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。",
        companies: ["Google", "Meta", "Amazon"],
        tags: ["数组", "动态规划"],
        timeLimit: 25,
        hints: [
          "使用动态规划",
          "当前位置的最大和 = max(当前元素, 当前元素 + 前面的最大和)",
          "Kadane算法"
        ],
        template: `def maxSubArray(nums):
    # 你的代码
    pass`
      },
      {
        id: "find-min-rotated",
        title: "寻找旋转排序数组中的最小值",
        difficulty: "Medium",
        description: "已知一个长度为n的数组，预先按照升序排列，经由1到n次旋转后，得到输入数组。给你这个元素互不相同的数组nums，请你找出并返回数组中的最小元素。",
        companies: ["Amazon", "Microsoft", "Apple"],
        tags: ["数组", "二分查找"],
        timeLimit: 30,
        hints: [
          "使用二分查找",
          "比较中点与右端点的值",
          "最小值在无序的一半"
        ],
        template: `def findMin(nums):
    # 你的代码
    pass`
      },
      {
        id: "contains-duplicate",
        title: "存在重复元素",
        difficulty: "Easy",
        description: "给定一个整数数组，判断是否存在重复元素。如果存在一值在数组中出现至少两次，函数返回true。如果数组中每个元素都不相同，则返回false。",
        companies: ["Google", "Amazon", "Apple"],
        tags: ["数组", "哈希表"],
        timeLimit: 15,
        hints: [
          "使用哈希集合",
          "遍历数组，检查元素是否已存在",
          "空间换时间"
        ],
        template: `def containsDuplicate(nums):
    # 你的代码
    pass`
      },
      {
        id: "merge-intervals",
        title: "合并区间",
        difficulty: "Medium",
        description: "以数组intervals表示若干个区间的集合，其中单个区间为intervals[i] = [starti, endi]。请你合并所有重叠的区间，并返回一个不重叠的区间数组，该数组需恰好覆盖输入中的所有区间。",
        companies: ["Meta", "Google", "Microsoft"],
        tags: ["数组", "排序"],
        timeLimit: 35,
        hints: [
          "先按起始位置排序",
          "遍历排序后的区间",
          "合并重叠的区间"
        ],
        template: `def merge(intervals):
    # 你的代码
    pass`
      }
    ]
  },

  // 字符串类题目
  string: {
    name: "字符串算法",
    description: "字符串处理和匹配算法",
    icon: "🔤",
    problems: [
      {
        id: "valid-parentheses",
        title: "有效的括号",
        difficulty: "Easy",
        description: "给定一个只包括'('，')'，'{'，'}'，'['，']'的字符串s，判断字符串是否有效。",
        companies: ["Meta", "Google", "Amazon"],
        tags: ["栈", "字符串"],
        timeLimit: 20,
        hints: [
          "使用栈来跟踪开括号",
          "遇到闭括号时检查栈顶",
          "最后栈应该为空"
        ],
        template: `def isValid(s):
    # 你的代码
    pass`
      },
      {
        id: "longest-substring",
        title: "无重复字符的最长子串",
        difficulty: "Medium",
        description: "给定一个字符串s，请你找出其中不含有重复字符的最长子串的长度。",
        companies: ["Google", "Meta", "Amazon", "Apple"],
        tags: ["滑动窗口", "哈希表"],
        timeLimit: 30,
        hints: [
          "使用滑动窗口技术",
          "用哈希集合记录当前窗口的字符",
          "当遇到重复字符时移动左指针"
        ],
        template: `def lengthOfLongestSubstring(s):
    # 你的代码
    pass`
      },
      {
        id: "group-anagrams",
        title: "字母异位词分组",
        difficulty: "Medium",
        description: "给你一个字符串数组，请你将字母异位词组合在一起。可以按任意顺序返回结果列表。",
        companies: ["Amazon", "Meta", "Google"],
        tags: ["字符串", "哈希表"],
        timeLimit: 30,
        hints: [
          "异位词排序后相同",
          "使用排序后的字符串作为key",
          "用哈希表分组"
        ],
        template: `def groupAnagrams(strs):
    # 你的代码
    pass`
      },
      {
        id: "longest-palindrome",
        title: "最长回文子串",
        difficulty: "Medium",
        description: "给你一个字符串s，找到s中最长的回文子串。",
        companies: ["Amazon", "Microsoft", "Apple"],
        tags: ["字符串", "动态规划"],
        timeLimit: 35,
        hints: [
          "中心扩展算法",
          "考虑奇数和偶数长度的回文",
          "动态规划方法"
        ],
        template: `def longestPalindrome(s):
    # 你的代码
    pass`
      },
      {
        id: "valid-anagram",
        title: "有效的字母异位词",
        difficulty: "Easy",
        description: "给定两个字符串s和t，编写一个函数来判断t是否是s的字母异位词。",
        companies: ["Google", "Amazon", "Apple"],
        tags: ["字符串", "哈希表", "排序"],
        timeLimit: 20,
        hints: [
          "字符频次相同",
          "可以使用排序",
          "也可以使用哈希表统计字符数"
        ],
        template: `def isAnagram(s, t):
    # 你的代码
    pass`
      },
      {
        id: "palindromic-substrings",
        title: "回文子串",
        difficulty: "Medium",
        description: "给你一个字符串s，请你统计并返回这个字符串中回文子串的数目。",
        companies: ["Meta", "Microsoft", "Apple"],
        tags: ["字符串", "动态规划"],
        timeLimit: 30,
        hints: [
          "中心扩展法",
          "每个字符作为中心",
          "分别考虑奇数和偶数长度"
        ],
        template: `def countSubstrings(s):
    # 你的代码
    pass`
      },
      {
        id: "minimum-window",
        title: "最小覆盖子串",
        difficulty: "Hard",
        description: "给你一个字符串s、一个字符串t。返回s中涵盖t所有字符的最小子串。如果s中不存在涵盖t所有字符的子串，则返回空字符串\"\"。",
        companies: ["Google", "Meta", "Amazon"],
        tags: ["字符串", "滑动窗口"],
        timeLimit: 45,
        hints: [
          "滑动窗口算法",
          "用哈希表记录需要的字符",
          "收缩窗口找最小长度"
        ],
        template: `def minWindow(s, t):
    # 你的代码
    pass`
      },
      {
        id: "encode-decode-strings",
        title: "字符串的编码与解码",
        difficulty: "Medium",
        description: "请你设计一个算法，能够将一个字符串列表编码成为一个字符串。这个编码后的字符串能够通过网络进行传输，并能够在另一端被解码成为原来的字符串列表。",
        companies: ["Google", "Meta", "Uber"],
        tags: ["字符串", "设计"],
        timeLimit: 35,
        hints: [
          "设计合适的分隔符",
          "考虑边界情况",
          "长度编码方案"
        ],
        template: `def encode(strs):
    # 你的代码
    pass

def decode(s):
    # 你的代码
    pass`
      }
    ]
  },

  // 树类题目
  tree: {
    name: "树和图算法",
    description: "二叉树、BST和图算法题目",
    icon: "🌳",
    problems: [
      {
        id: "binary-tree-inorder",
        title: "二叉树的中序遍历",
        difficulty: "Easy",
        description: "给定一个二叉树的根节点root，返回它的中序遍历。",
        companies: ["Google", "Meta", "Microsoft"],
        tags: ["树", "递归", "栈"],
        timeLimit: 25,
        hints: [
          "可以使用递归方法",
          "也可以使用迭代+栈的方法",
          "中序遍历：左-根-右"
        ],
        template: `def inorderTraversal(root):
    # 你的代码
    pass`
      },
      {
        id: "max-depth-tree",
        title: "二叉树的最大深度",
        difficulty: "Easy",
        description: "给定一个二叉树，找出其最大深度。二叉树的深度为根节点到最远叶子节点的最长路径上的节点数。",
        companies: ["Amazon", "Google", "Apple"],
        tags: ["树", "递归", "DFS"],
        timeLimit: 20,
        hints: [
          "使用递归思想",
          "最大深度 = max(左子树深度, 右子树深度) + 1",
          "边界条件：空节点深度为0"
        ],
        template: `def maxDepth(root):
    # 你的代码
    pass`
      },
      {
        id: "same-tree",
        title: "相同的树",
        difficulty: "Easy",
        description: "给你两棵二叉树的根节点p和q，编写一个函数来检验这两棵树是否相同。",
        companies: ["Google", "Amazon", "Microsoft"],
        tags: ["树", "递归", "DFS"],
        timeLimit: 15,
        hints: [
          "递归比较",
          "节点值和结构都要相同",
          "边界条件处理"
        ],
        template: `def isSameTree(p, q):
    # 你的代码
    pass`
      },
      {
        id: "invert-tree",
        title: "翻转二叉树",
        difficulty: "Easy",
        description: "翻转一棵二叉树。",
        companies: ["Google", "Apple", "Meta"],
        tags: ["树", "递归", "DFS"],
        timeLimit: 15,
        hints: [
          "交换左右子树",
          "递归处理子树",
          "可以用前序、后序或层序遍历"
        ],
        template: `def invertTree(root):
    # 你的代码
    pass`
      },
      {
        id: "subtree-of-tree",
        title: "另一棵树的子树",
        difficulty: "Easy",
        description: "给你两棵二叉树root和subRoot。检验root中是否包含和subRoot具有相同结构和节点值的子树。",
        companies: ["Meta", "Amazon", "Microsoft"],
        tags: ["树", "递归", "DFS"],
        timeLimit: 25,
        hints: [
          "递归检查每个节点",
          "判断以当前节点为根的子树是否与subRoot相同",
          "结合相同的树的解法"
        ],
        template: `def isSubtree(root, subRoot):
    # 你的代码
    pass`
      },
      {
        id: "lowest-common-ancestor",
        title: "二叉树的最近公共祖先",
        difficulty: "Medium",
        description: "给定一个二叉树, 找到该树中两个指定节点的最近公共祖先。",
        companies: ["Meta", "Amazon", "Google"],
        tags: ["树", "递归", "DFS"],
        timeLimit: 30,
        hints: [
          "递归查找",
          "如果当前节点是其中一个目标节点，返回当前节点",
          "如果左右子树都找到了目标节点，当前节点就是LCA"
        ],
        template: `def lowestCommonAncestor(root, p, q):
    # 你的代码
    pass`
      },
      {
        id: "binary-tree-level-order",
        title: "二叉树的层序遍历",
        difficulty: "Medium",
        description: "给你二叉树的根节点root，返回其节点值的层序遍历。",
        companies: ["Meta", "Amazon", "Microsoft"],
        tags: ["树", "BFS", "队列"],
        timeLimit: 25,
        hints: [
          "使用队列实现BFS",
          "记录每层的节点数",
          "逐层处理"
        ],
        template: `def levelOrder(root):
    # 你的代码
    pass`
      },
      {
        id: "validate-bst",
        title: "验证二叉搜索树",
        difficulty: "Medium",
        description: "给你一个二叉树的根节点root，判断其是否是一个有效的二叉搜索树。",
        companies: ["Amazon", "Meta", "Microsoft"],
        tags: ["树", "递归", "DFS"],
        timeLimit: 30,
        hints: [
          "中序遍历应该是递增的",
          "递归验证，传递上下界",
          "注意整数溢出"
        ],
        template: `def isValidBST(root):
    # 你的代码
    pass`
      },
      {
        id: "kth-smallest-bst",
        title: "二叉搜索树中第K小的元素",
        difficulty: "Medium",
        description: "给定一个二叉搜索树的根节点root，和一个整数k，请你设计一个算法查找其中第k个最小元素。",
        companies: ["Google", "Amazon", "Apple"],
        tags: ["树", "DFS", "BST"],
        timeLimit: 25,
        hints: [
          "中序遍历BST得到有序序列",
          "可以提前终止遍历",
          "用计数器记录已访问的节点数"
        ],
        template: `def kthSmallest(root, k):
    # 你的代码
    pass`
      },
      {
        id: "construct-tree-preorder-inorder",
        title: "从前序与中序遍历序列构造二叉树",
        difficulty: "Medium",
        description: "给定两个整数数组preorder和inorder，其中preorder是二叉树的先序遍历，inorder是同一棵树的中序遍历，请构造二叉树并返回其根节点。",
        companies: ["Meta", "Microsoft", "Apple"],
        tags: ["树", "递归", "分治"],
        timeLimit: 35,
        hints: [
          "前序遍历的第一个元素是根节点",
          "在中序遍历中找到根节点位置",
          "递归构造左右子树"
        ],
        template: `def buildTree(preorder, inorder):
    # 你的代码
    pass`
      },
      {
        id: "serialize-deserialize-tree",
        title: "二叉树的序列化与反序列化",
        difficulty: "Hard",
        description: "序列化是将一个数据结构或者对象转换为连续的比特位的操作。请设计一个算法来实现二叉树的序列化与反序列化。",
        companies: ["Google", "Meta", "Amazon"],
        tags: ["树", "DFS", "BFS"],
        timeLimit: 40,
        hints: [
          "可以使用前序遍历",
          "空节点用特殊字符表示",
          "反序列化时递归构建"
        ],
        template: `def serialize(root):
    # 你的代码
    pass

def deserialize(data):
    # 你的代码
    pass`
      }
    ]
  },

  // 动态规划
  dp: {
    name: "动态规划",
    description: "动态规划经典问题",
    icon: "🧮",
    problems: [
      {
        id: "climbing-stairs",
        title: "爬楼梯",
        difficulty: "Easy",
        description: "假设你正在爬楼梯。需要n阶你才能到达楼顶。每次你可以爬1或2个台阶。你有多少种不同的方法可以爬到楼顶呢？",
        companies: ["Google", "Amazon", "Microsoft"],
        tags: ["动态规划", "递归"],
        timeLimit: 25,
        hints: [
          "这是一个斐波那契数列问题",
          "f(n) = f(n-1) + f(n-2)",
          "可以用动态规划优化空间复杂度"
        ],
        template: `def climbStairs(n):
    # 你的代码
    pass`
      },
      {
        id: "coin-change",
        title: "零钱兑换",
        difficulty: "Medium",
        description: "给你一个整数数组coins，表示不同面额的硬币；以及一个整数amount，表示总金额。计算并返回可以凑成总金额所需的最少的硬币个数。",
        companies: ["Google", "Amazon", "Apple"],
        tags: ["动态规划", "贪心"],
        timeLimit: 35,
        hints: [
          "完全背包问题变形",
          "状态转移：dp[i] = min(dp[i], dp[i-coin] + 1)",
          "初始化时设置为无穷大"
        ],
        template: `def coinChange(coins, amount):
    # 你的代码
    pass`
      },
      {
        id: "longest-increasing-subsequence",
        title: "最长递增子序列",
        difficulty: "Medium",
        description: "给你一个整数数组nums，找到其中最长严格递增子序列的长度。",
        companies: ["Microsoft", "Google", "Meta"],
        tags: ["动态规划", "二分查找"],
        timeLimit: 35,
        hints: [
          "dp[i]表示以nums[i]结尾的最长递增子序列长度",
          "状态转移：dp[i] = max(dp[j] + 1) for j < i and nums[j] < nums[i]",
          "可以用二分查找优化到O(nlogn)"
        ],
        template: `def lengthOfLIS(nums):
    # 你的代码
    pass`
      },
      {
        id: "house-robber",
        title: "打家劫舍",
        difficulty: "Medium",
        description: "你是一个专业的小偷，计划偷窃沿街的房屋。每间房内都藏有一定的现金，影响你偷窃的唯一制约因素就是相邻的房屋装有相互连通的防盗系统。",
        companies: ["Amazon", "Google", "Apple"],
        tags: ["动态规划"],
        timeLimit: 25,
        hints: [
          "不能同时偷相邻的房子",
          "dp[i] = max(dp[i-1], dp[i-2] + nums[i])",
          "空间可以优化到O(1)"
        ],
        template: `def rob(nums):
    # 你的代码
    pass`
      },
      {
        id: "word-break",
        title: "单词拆分",
        difficulty: "Medium",
        description: "给你一个字符串s和一个字符串列表wordDict作为字典。请你判断是否可以利用字典中出现的单词拼接出s。",
        companies: ["Google", "Meta", "Amazon"],
        tags: ["动态规划", "字符串"],
        timeLimit: 30,
        hints: [
          "dp[i]表示前i个字符能否被拆分",
          "检查所有可能的拆分点",
          "用哈希集合优化字典查找"
        ],
        template: `def wordBreak(s, wordDict):
    # 你的代码
    pass`
      },
      {
        id: "combination-sum-iv",
        title: "组合总和 Ⅳ",
        difficulty: "Medium",
        description: "给你一个由不同整数组成的数组nums，和一个目标整数target。请你从nums中找出并返回总和为target的元素组合的个数。",
        companies: ["Meta", "Google", "Amazon"],
        tags: ["动态规划"],
        timeLimit: 30,
        hints: [
          "dp[i]表示和为i的组合数",
          "状态转移：dp[i] += dp[i-num] for num in nums",
          "注意顺序很重要"
        ],
        template: `def combinationSum4(nums, target):
    # 你的代码
    pass`
      }
    ]
  },

  // 链表类题目
  linkedList: {
    name: "链表算法",
    description: "链表操作和算法题目",
    icon: "🔗",
    problems: [
      {
        id: "reverse-linked-list",
        title: "反转链表",
        difficulty: "Easy",
        description: "给你单链表的头节点head，请你反转链表，并返回反转后的链表。",
        companies: ["Google", "Amazon", "Microsoft"],
        tags: ["链表", "递归", "迭代"],
        timeLimit: 20,
        hints: [
          "使用三个指针：prev, curr, next",
          "迭代修改指针方向",
          "也可以用递归实现"
        ],
        template: `def reverseList(head):
    # 你的代码
    pass`
      },
      {
        id: "merge-two-sorted-lists",
        title: "合并两个有序链表",
        difficulty: "Easy",
        description: "将两个升序链表合并为一个新的升序链表并返回。新链表是通过拼接给定的两个链表的所有节点组成的。",
        companies: ["Amazon", "Google", "Apple"],
        tags: ["链表", "递归"],
        timeLimit: 20,
        hints: [
          "比较两个链表的头节点",
          "选择较小的作为新链表的下一个节点",
          "递归或迭代实现"
        ],
        template: `def mergeTwoLists(list1, list2):
    # 你的代码
    pass`
      },
      {
        id: "linked-list-cycle",
        title: "环形链表",
        difficulty: "Easy",
        description: "给你一个链表的头节点head，判断链表中是否有环。",
        companies: ["Meta", "Amazon", "Microsoft"],
        tags: ["链表", "双指针"],
        timeLimit: 20,
        hints: [
          "使用快慢指针（Floyd判圈算法）",
          "快指针每次走2步，慢指针每次走1步",
          "如果有环，快慢指针一定会相遇"
        ],
        template: `def hasCycle(head):
    # 你的代码
    pass`
      },
      {
        id: "remove-nth-node",
        title: "删除链表的倒数第N个结点",
        difficulty: "Medium",
        description: "给你一个链表，删除链表的倒数第n个结点，并且返回链表的头结点。",
        companies: ["Amazon", "Google", "Apple"],
        tags: ["链表", "双指针"],
        timeLimit: 25,
        hints: [
          "使用双指针",
          "第一个指针先走n步",
          "然后两个指针同时走，直到第一个指针到达末尾"
        ],
        template: `def removeNthFromEnd(head, n):
    # 你的代码
    pass`
      },
      {
        id: "reorder-list",
        title: "重排链表",
        difficulty: "Medium",
        description: "给定一个单链表L的头节点head，单链表L表示为：L0 → L1 → … → Ln-1 → Ln。请将其重新排列后变为：L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → …",
        companies: ["Meta", "Amazon", "Microsoft"],
        tags: ["链表", "栈"],
        timeLimit: 35,
        hints: [
          "找到链表中点",
          "反转后半部分",
          "合并两个链表"
        ],
        template: `def reorderList(head):
    # 你的代码
    pass`
      }
    ]
  },

  // 图算法类题目
  graph: {
    name: "图算法",
    description: "图遍历和图算法题目",
    icon: "🌐",
    problems: [
      {
        id: "number-of-islands",
        title: "岛屿数量",
        difficulty: "Medium",
        description: "给你一个由'1'（陆地）和'0'（水）组成的的二维网格，请你计算网格中岛屿的数量。",
        companies: ["Amazon", "Google", "Meta"],
        tags: ["DFS", "BFS", "图"],
        timeLimit: 25,
        hints: [
          "使用DFS或BFS遍历",
          "遇到'1'就开始搜索整个岛屿",
          "将访问过的位置标记为'0'"
        ],
        template: `def numIslands(grid):
    # 你的代码
    pass`
      },
      {
        id: "course-schedule",
        title: "课程表",
        difficulty: "Medium",
        description: "你这个学期必须选修numCourses门课程，记为0到numCourses - 1。在选修某些课程之前需要一些先修课程。先修课程按数组prerequisites给出。请你判断是否可能完成所有课程的学习？",
        companies: ["Google", "Meta", "Amazon"],
        tags: ["图", "拓扑排序", "DFS"],
        timeLimit: 35,
        hints: [
          "检测有向图中是否有环",
          "可以使用拓扑排序",
          "或者用DFS检测环"
        ],
        template: `def canFinish(numCourses, prerequisites):
    # 你的代码
    pass`
      },
      {
        id: "clone-graph",
        title: "克隆图",
        difficulty: "Medium",
        description: "给你无向连通图中一个节点的引用，请你返回该图的深拷贝。",
        companies: ["Meta", "Amazon", "Google"],
        tags: ["图", "DFS", "BFS", "哈希表"],
        timeLimit: 30,
        hints: [
          "使用哈希表记录已访问节点",
          "DFS或BFS遍历",
          "边复制边建立连接"
        ],
        template: `def cloneGraph(node):
    # 你的代码
    pass`
      },
      {
        id: "pacific-atlantic-water",
        title: "太平洋大西洋水流问题",
        difficulty: "Medium",
        description: "有一个m × n的矩形岛屿，与太平洋和大西洋相邻。找到那些水既可以流向太平洋，也可以流向大西洋的陆地单元的坐标。",
        companies: ["Google", "Microsoft", "Apple"],
        tags: ["DFS", "BFS", "图"],
        timeLimit: 40,
        hints: [
          "从边界开始反向搜索",
          "分别标记能到达太平洋和大西洋的点",
          "取交集得到答案"
        ],
        template: `def pacificAtlantic(heights):
    # 你的代码
    pass`
      }
    ]
  },

  // 堆和优先队列
  heap: {
    name: "堆和优先队列",
    description: "堆数据结构相关题目",
    icon: "⛰️",
    problems: [
      {
        id: "top-k-frequent",
        title: "前K个高频元素",
        difficulty: "Medium",
        description: "给你一个整数数组nums和一个整数k，请你返回其中出现频率前k高的元素。你可以按任意顺序返回答案。",
        companies: ["Amazon", "Meta", "Apple"],
        tags: ["堆", "哈希表", "排序"],
        timeLimit: 30,
        hints: [
          "使用哈希表统计频率",
          "使用最小堆维护前k个元素",
          "也可以使用快速选择算法"
        ],
        template: `def topKFrequent(nums, k):
    # 你的代码
    pass`
      },
      {
        id: "merge-k-sorted-lists",
        title: "合并K个升序链表",
        difficulty: "Hard",
        description: "给你一个链表数组，每个链表都已经按升序排列。请你将所有链表合并到一个升序链表中，返回合并后的链表。",
        companies: ["Amazon", "Google", "Meta"],
        tags: ["链表", "堆", "分治"],
        timeLimit: 40,
        hints: [
          "使用最小堆",
          "将每个链表的头节点放入堆中",
          "也可以用分治法两两合并"
        ],
        template: `def mergeKLists(lists):
    # 你的代码
    pass`
      },
      {
        id: "find-median-stream",
        title: "数据流的中位数",
        difficulty: "Hard",
        description: "中位数是有序列表中间的数。请你设计一个支持以下两种操作的数据结构：void addNum(int num) - 从数据流中添加一个整数到数据结构中；double findMedian() - 返回目前所有元素的中位数。",
        companies: ["Google", "Meta", "Amazon"],
        tags: ["堆", "设计"],
        timeLimit: 35,
        hints: [
          "使用两个堆：最大堆存储较小一半，最小堆存储较大一半",
          "保持堆的大小平衡",
          "中位数就是堆顶元素"
        ],
        template: `class MedianFinder:
    def __init__(self):
        # 你的代码
        pass

    def addNum(self, num):
        # 你的代码
        pass

    def findMedian(self):
        # 你的代码
        pass`
      }
    ]
  },

  // 回溯算法
  backtrack: {
    name: "回溯算法",
    description: "回溯和递归相关题目",
    icon: "🔄",
    problems: [
      {
        id: "permutations",
        title: "全排列",
        difficulty: "Medium",
        description: "给定一个不含重复数字的数组nums，返回其所有可能的全排列。你可以按任意顺序返回答案。",
        companies: ["Microsoft", "Amazon", "Google"],
        tags: ["回溯", "递归"],
        timeLimit: 30,
        hints: [
          "使用回溯算法",
          "维护一个路径和访问标记",
          "递归选择下一个数字"
        ],
        template: `def permute(nums):
    # 你的代码
    pass`
      },
      {
        id: "subsets",
        title: "子集",
        difficulty: "Medium",
        description: "给你一个整数数组nums，数组中的元素互不相同。返回该数组所有可能的子集（幂集）。",
        companies: ["Amazon", "Meta", "Apple"],
        tags: ["回溯", "位运算"],
        timeLimit: 25,
        hints: [
          "每个元素都有选择或不选择两种状态",
          "可以用回溯法",
          "也可以用位运算枚举"
        ],
        template: `def subsets(nums):
    # 你的代码
    pass`
      },
      {
        id: "combination-sum",
        title: "组合总和",
        difficulty: "Medium",
        description: "给你一个无重复元素的整数数组candidates和一个目标整数target，找出candidates中可以使数字和为target的所有不同组合。",
        companies: ["Amazon", "Google", "Meta"],
        tags: ["回溯", "递归"],
        timeLimit: 35,
        hints: [
          "回溯算法",
          "每个数可以重复使用",
          "避免重复组合，从当前位置开始搜索"
        ],
        template: `def combinationSum(candidates, target):
    # 你的代码
    pass`
      },
      {
        id: "word-search",
        title: "单词搜索",
        difficulty: "Medium",
        description: "给定一个m x n二维字符网格board和一个字符串单词word。如果word存在于网格中，返回true；否则，返回false。",
        companies: ["Microsoft", "Amazon", "Apple"],
        tags: ["回溯", "DFS"],
        timeLimit: 35,
        hints: [
          "从每个位置开始DFS搜索",
          "使用回溯标记访问状态",
          "搜索完成后恢复状态"
        ],
        template: `def exist(board, word):
    # 你的代码
    pass`
      }
    ]
  },

  // 双指针和滑动窗口
  twoPointer: {
    name: "双指针和滑动窗口",
    description: "双指针技巧相关题目",
    icon: "👉",
    problems: [
      {
        id: "trapping-rain-water",
        title: "接雨水",
        difficulty: "Hard",
        description: "给定n个非负整数表示每个宽度为1的柱子的高度图，计算按此排列的柱子，下雨之后能够接多少雨水。",
        companies: ["Amazon", "Google", "Apple"],
        tags: ["双指针", "动态规划", "栈"],
        timeLimit: 40,
        hints: [
          "使用双指针从两端向中间移动",
          "维护左右两边的最大高度",
          "较低的一边决定能接多少水"
        ],
        template: `def trap(height):
    # 你的代码
    pass`
      },
      {
        id: "sliding-window-maximum",
        title: "滑动窗口最大值",
        difficulty: "Hard",
        description: "给你一个整数数组nums，有一个大小为k的滑动窗口从数组的最左侧移动到数组的最右侧。你只可以看到在滑动窗口内的k个数字。滑动窗口每次只向右移动一位。返回滑动窗口中的最大值。",
        companies: ["Amazon", "Google", "Meta"],
        tags: ["滑动窗口", "双端队列"],
        timeLimit: 35,
        hints: [
          "使用双端队列",
          "维护队列中元素单调递减",
          "队首始终是当前窗口的最大值"
        ],
        template: `def maxSlidingWindow(nums, k):
    # 你的代码
    pass`
      }
    ]
  }
};

// 公司信息
export const companies = {
  "Google": {
    name: "Google",
    logo: "🟦",
    color: "#4285f4",
    focus: ["算法效率", "系统设计", "代码质量"]
  },
  "Meta": {
    name: "Meta",
    logo: "🟣",
    color: "#1877f2",
    focus: ["产品思维", "算法优化", "扩展性"]
  },
  "Amazon": {
    name: "Amazon",
    logo: "🟠",
    color: "#ff9900",
    focus: ["客户导向", "算法实现", "性能优化"]
  },
  "Apple": {
    name: "Apple",
    logo: "🍎",
    color: "#000000",
    focus: ["用户体验", "代码设计", "性能优化"]
  },
  "Microsoft": {
    name: "Microsoft",
    logo: "🟢",
    color: "#00a1f1",
    focus: ["技术深度", "系统思维", "协作能力"]
  }
};

// 默认用户面试进度
export const defaultInterviewProgress = {
  overall: {
    totalProblems: Object.values(mockInterviewData).reduce((acc, category) => acc + category.problems.length, 0),
    completedProblems: 0,
    totalInterviews: 0,
    passedInterviews: 0,
    averageTime: 0,
    streak: 0
  },
  categories: Object.keys(mockInterviewData).reduce((acc, categoryId) => {
    acc[categoryId] = {
      total: mockInterviewData[categoryId].problems.length,
      completed: 0,
      averageScore: 0
    };
    return acc;
  }, {}),
  recentInterviews: []
};

// 难度配置
export const difficulties = {
  "Easy": {
    color: "#52c41a",
    bgColor: "rgba(82, 196, 26, 0.1)",
    timeRange: "15-25分钟"
  },
  "Medium": {
    color: "#faad14",
    bgColor: "rgba(250, 173, 20, 0.1)",
    timeRange: "25-40分钟"
  },
  "Hard": {
    color: "#ff4d4f",
    bgColor: "rgba(255, 77, 79, 0.1)",
    timeRange: "40-60分钟"
  }
};

// AI面试官配置
export const interviewerPersonas = {
  friendly: {
    name: "友好型面试官",
    description: "耐心引导，提供适当提示",
    avatar: "😊",
    style: "supportive"
  },
  strict: {
    name: "严格型面试官",
    description: "注重细节，要求完美实现",
    avatar: "🧐",
    style: "demanding"
  },
  casual: {
    name: "轻松型面试官",
    description: "氛围轻松，注重思路沟通",
    avatar: "😎",
    style: "conversational"
  }
};