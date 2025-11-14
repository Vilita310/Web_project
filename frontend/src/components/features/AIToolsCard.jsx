import React, { useState } from 'react';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

const AIToolsCard = () => {
  const { isDarkTheme } = useTheme();
  const { t } = useTranslation('home');
  // 构建国际化的代码模板
  const getCodeTemplate = () => `${t('ui.codeToolboxTitle')}
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

${t('ui.testFunction')}
${t('ui.printFibonacci')}
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")

${t('ui.optimizeTodo')}
${t('ui.optimizeHint')}`;

  const [editorContent, setEditorContent] = useState(getCodeTemplate());

  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [hasRun, setHasRun] = useState(false);
  const [lastTestResults, setLastTestResults] = useState([]);
  const [currentProblem, setCurrentProblem] = useState(null);

  // LeetCode题目答案模板
  const leetCodeSolutions = {
    "Two Sum": `# Two Sum - Easy
# 给定一个整数数组 nums 和一个目标值 target
# 请你在该数组中找出和为目标值的那两个整数，并返回它们的数组下标

def two_sum(nums, target):
    """
    使用哈希表解决两数之和问题
    时间复杂度: O(n)
    空间复杂度: O(n)
    """
    num_map = {}  # 创建哈希表存储数值和索引

    for i, num in enumerate(nums):
        complement = target - num  # 计算需要的补数

        if complement in num_map:
            return [num_map[complement], i]  # 找到答案

        num_map[num] = i  # 将当前数字存入哈希表

    return []  # 没找到返回空列表

# 测试用例
nums = [2, 7, 11, 15]
target = 9
result = two_sum(nums, target)
print(f"输入: nums = {nums}, target = {target}")
print(f"输出: {result}")  # [0, 1]`,

    "Valid Parentheses": `# Valid Parentheses - Easy
# 给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串 s
# 判断字符串是否有效

def is_valid(s):
    """
    有效的括号
    时间复杂度: O(n)
    空间复杂度: O(n)
    """
    stack = []  # 使用栈来匹配括号
    mapping = {')': '(', '}': '{', ']': '['}  # 右括号到左括号的映射

    for char in s:
        if char in mapping:  # 遇到右括号
            # 栈为空或栈顶元素不匹配
            if not stack or stack[-1] != mapping[char]:
                return False
            stack.pop()  # 匹配成功，弹出栈顶元素
        else:  # 遇到左括号
            stack.append(char)  # 压入栈

    return not stack  # 栈为空说明所有括号都匹配

# 测试用例
test_cases = ["()", "()[]{}", "(]", "([)]", "{[]}"]

for test in test_cases:
    result = is_valid(test)
    print(f"输入: '{test}' -> 输出: {result}")`,

    "Longest Substring": `# Longest Substring Without Repeating Characters - Medium
# 给定一个字符串 s，请你找出其中不含有重复字符的最长子串的长度

def length_of_longest_substring(s):
    """
    无重复字符的最长子串
    时间复杂度: O(n)
    空间复杂度: O(min(m, n))，m是字符集大小
    """
    if not s:
        return 0

    char_map = {}  # 字符到索引的映射
    left = 0  # 滑动窗口左边界
    max_length = 0  # 最长子串长度

    for right in range(len(s)):
        # 如果字符已经在当前窗口中出现过
        if s[right] in char_map and char_map[s[right]] >= left:
            # 移动左边界到重复字符的下一个位置
            left = char_map[s[right]] + 1

        # 更新字符的最新索引
        char_map[s[right]] = right

        # 更新最大长度
        max_length = max(max_length, right - left + 1)

    return max_length

# 测试用例
test_cases = ["abcabcbb", "bbbbb", "pwwkew", "", "dvdf"]

for test in test_cases:
    result = length_of_longest_substring(test)
    print(f"输入: '{test}' -> 最长子串长度: {result}")`
  };

  // 处理题目点击事件
  const handleProblemClick = (problemName) => {
    if (leetCodeSolutions[problemName]) {
      setEditorContent(leetCodeSolutions[problemName]);
      setCurrentProblem(problemName);
      setHasRun(false);
      setOutput('');
      setError('');
      setLastTestResults([]);
    }
  };

  // 运行代码功能
  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      if (currentProblem) {
        const mockOutput = `测试用例执行结果:
测试用例 1: ✅ 通过
输入: {"nums": [2, 7, 11, 15], "target": 9}
期望: [0, 1]
实际: [0, 1]

测试用例 2: ✅ 通过
输入: {"nums": [3, 2, 4], "target": 6}
期望: [1, 2]
实际: [1, 2]

测试用例 3: ✅ 通过
输入: {"nums": [3, 3], "target": 6}
期望: [0, 1]
实际: [0, 1]

所有测试用例通过！🎉`;
        setOutput(mockOutput);
        setLastTestResults([
          { id: 1, passed: true },
          { id: 2, passed: true },
          { id: 3, passed: true }
        ]);
        message.success('🎉 恭喜！所有测试用例通过！');
      } else {
        const mockOutput = `斐波那契数列前10项:
F(0) = 0
F(1) = 1
F(2) = 1
F(3) = 2
F(4) = 3
F(5) = 5
F(6) = 8
F(7) = 13
F(8) = 21
F(9) = 34`;
        setOutput(mockOutput);
        setLastTestResults([
          { id: 1, passed: true }
        ]);
        message.success('代码执行成功！');
      }

      setHasRun(true);
    } catch (err) {
      setError(`执行错误: ${err.message}`);
      message.error('代码执行失败');
      setHasRun(true);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '3.5fr 2.2fr',
      gap: '48px',
      alignItems: 'start',
      maxWidth: '1250px',
      margin: '80px auto',
      padding: '0 40px'
    }}>
      {/* 左侧：AI编辑器 */}
      <div style={{
        background: isDarkTheme
          ? 'rgba(22, 27, 34, 0.8)'
          : 'rgba(160, 120, 59, 0.08)',
        boxShadow: isDarkTheme
          ? 'none'
          : '0 8px 20px rgba(160, 120, 59, 0.15)',
        borderRadius: '24px',
        border: isDarkTheme
          ? '1px solid rgba(88, 166, 255, 0.3)'
          : '1px solid rgba(160, 120, 59, 0.25)',
        padding: '24px',
        backdropFilter: 'blur(16px)',
        position: 'relative',
        overflow: 'hidden',
        height: hasRun ? '700px' : '500px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 编辑器标题 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isDarkTheme ? '#58A6FF' : '#D4926F',
              animation: 'breathe 2s ease-in-out infinite'
            }} />
            <h3 style={{
              color: isDarkTheme ? '#F0F6FC' : '#A0783B',
              fontSize: '1.1rem',
              fontWeight: '600',
              margin: 0
            }}>{t('ui.aiEditor')}</h3>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select defaultValue="python" style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: isDarkTheme ? '#F0F6FC' : '#2D1810',
              padding: '4px 8px',
              fontSize: '12px'
            }}>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="typescript">TypeScript</option>
              <option value="swift">Swift</option>
              <option value="kotlin">Kotlin</option>
            </select>
            <button
              onClick={runCode}
              disabled={isRunning || !editorContent.trim()}
              style={{
                background: isRunning ? '#6b7280' : `linear-gradient(135deg, ${isDarkTheme ? '#58A6FF' : '#D4926F'} 0%, ${isDarkTheme ? '#A5A3FF' : '#B5704A'} 100%)`,
                border: 'none',
                borderRadius: '8px',
                color: isDarkTheme ? 'white' : '#2D1810',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                opacity: isRunning || !editorContent.trim() ? 0.6 : 1
              }}
            >
              {isRunning ? t('ui.running') : t('ui.runCode')}
            </button>
          </div>
        </div>

        {/* 代码区域 */}
        <div style={{
          border: '1px solid rgba(255, 255, 255, 0.1)',
          height: hasRun ? '300px' : 'calc(100% - 80px)',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          <textarea
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            style={{
              width: '100%',
              height: '100%',
              background: '#0f1017',
              backgroundColor: '#0f1017',
              color: '#ffffff',
              fontSize: '14px',
              fontFamily: 'Monaco, Menlo, "SF Mono", Consolas, monospace',
              lineHeight: '1.5',
              resize: 'none',
              padding: '16px',
              border: 'none',
              outline: 'none'
            }}
            spellCheck={false}
          />
        </div>

        {/* 测试结果区域 - 在编辑器容器内部 */}
        {hasRun && (
          <div style={{
            marginTop: '16px',
            flex: 1,
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* 结果头部 */}
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {(lastTestResults.length > 0 && lastTestResults.every(r => r.passed)) ? (
                    <>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: isDarkTheme ? '#58A6FF' : '#D4926F',
                        boxShadow: '0 0 6px rgba(212, 146, 111, 0.5)'
                      }} />
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: isDarkTheme ? '#58A6FF' : '#D4926F'
                      }}>
                        ✅ Accepted
                      </span>
                    </>
                  ) : (
                    <>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#ef4444',
                        boxShadow: '0 0 6px rgba(239, 68, 68, 0.5)'
                      }} />
                      <span style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#ef4444'
                      }}>
                        ❌ Failed
                      </span>
                    </>
                  )}
                </div>

                <div style={{
                  fontSize: '11px',
                  color: '#8B949E'
                }}>
                  {lastTestResults.length > 0 && `${lastTestResults.filter(r => r.passed).length}/${lastTestResults.length} 通过`}
                </div>
              </div>

              {/* 输出信息 */}
              <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '16px'
              }}>
                {output && (
                  <>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: isDarkTheme ? '#F0F6FC' : '#2D1810',
                      marginBottom: '8px'
                    }}>
                      执行输出:
                    </div>
                    <pre style={{
                      margin: 0,
                      padding: '12px',
                      background: 'rgba(0, 0, 0, 0.4)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: isDarkTheme ? '#F0F6FC' : '#2D1810',
                      fontFamily: 'Monaco, Menlo, monospace',
                      lineHeight: 1.4,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {output}
                    </pre>
                  </>
                )}

                {error && (
                  <>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#ef4444',
                      marginBottom: '8px',
                      marginTop: output ? '12px' : '0'
                    }}>
                      错误信息:
                    </div>
                    <pre style={{
                      margin: 0,
                      padding: '12px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#ef4444',
                      fontFamily: 'Monaco, Menlo, monospace',
                      lineHeight: 1.4,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {error}
                    </pre>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 右侧：工具统计与功能 */}
      <div>
        {/* AI编辑器统计 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(250, 249, 246, 0.7)',
            border: isDarkTheme ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(160, 120, 59, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.4rem',
              fontWeight: '700',
              color: isDarkTheme ? '#58A6FF' : '#D4926F',
              marginBottom: '4px'
            }}>15+</div>
            <div style={{
              fontSize: '12px',
              color: '#8B949E',
              fontWeight: '600',
              marginBottom: '2px'
            }}>{t('ui.supportedLanguages')}</div>
            <div style={{
              fontSize: '11px',
              color: '#6B7280'
            }}>{t('ui.multiLanguageProgramming')}</div>
          </div>

          <div style={{
            background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(250, 249, 246, 0.7)',
            border: isDarkTheme ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(160, 120, 59, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.4rem',
              fontWeight: '700',
              color: '#f59e0b',
              marginBottom: '4px'
            }}>0.8s</div>
            <div style={{
              fontSize: '12px',
              color: '#8B949E',
              fontWeight: '600',
              marginBottom: '2px'
            }}>{t('ui.executionSpeed')}</div>
            <div style={{
              fontSize: '11px',
              color: '#6B7280'
            }}>{t('ui.realTimeCompilation')}</div>
          </div>

          <div style={{
            background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(250, 249, 246, 0.7)',
            border: isDarkTheme ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(160, 120, 59, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.4rem',
              fontWeight: '700',
              color: '#7D73FF',
              marginBottom: '4px'
            }}>AI</div>
            <div style={{
              fontSize: '12px',
              color: '#8B949E',
              fontWeight: '600'
            }}>{t('ui.intelligentHints')}</div>
          </div>

          <div style={{
            background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(250, 249, 246, 0.7)',
            border: isDarkTheme ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(160, 120, 59, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.4rem',
              fontWeight: '700',
              color: '#10b981',
              marginBottom: '4px'
            }}>100%</div>
            <div style={{
              fontSize: '12px',
              color: '#8B949E',
              fontWeight: '600'
            }}>{t('ui.accuracy')}</div>
          </div>
        </div>

        {/* 算法题目练习区 */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { nameKey: 'ui.twoSumAlgo', difficultyKey: 'ui.easy', solutionKey: 'Two Sum' },
              { nameKey: 'ui.validParenthesesAlgo', difficultyKey: 'ui.easy', solutionKey: 'Valid Parentheses' },
              { nameKey: 'ui.longestSubstring', difficultyKey: 'ui.medium', solutionKey: 'Longest Substring' },
              { nameKey: 'ui.reverseLinkedList', difficultyKey: 'ui.easy', solutionKey: 'Reverse Linked List' },
              { nameKey: 'ui.binaryTreeInorder', difficultyKey: 'ui.medium', solutionKey: 'Binary Tree Inorder' }
            ].map((problem, index) => (
              <div
                key={index}
                onClick={() => handleProblemClick(problem.solutionKey)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '13px'
                }}
              >
                <span style={{ color: isDarkTheme ? '#FFFFFF' : '#A0783B', fontWeight: '500' }}>{t(problem.nameKey)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    color: t(problem.difficultyKey) === t('ui.easy') ? isDarkTheme ? '#58A6FF' : '#D4926F' :
                          t(problem.difficultyKey) === t('ui.medium') ? '#f59e0b' : '#ef4444',
                    fontWeight: '600',
                    fontSize: '12px'
                  }}>{t(problem.difficultyKey)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style jsx global>{`
        textarea {
          background: #0f1017 !important;
          background-color: #0f1017 !important;
          background-image: none !important;
        }

        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default AIToolsCard;