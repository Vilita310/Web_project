import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Divider,
  Progress,
  message,
  Spin,
  List,
  Alert,
  Avatar,
  Input,
  Modal,
  Rate,
  Select,
  Tooltip
} from 'antd';
import {
  ArrowLeftOutlined,
  PlayCircleOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CodeOutlined,
  RobotOutlined,
  BookOutlined,
  FileTextOutlined,
  BugOutlined,
  CustomerServiceOutlined,
  SendOutlined,
  UserOutlined,
  TrophyOutlined,
  PauseCircleOutlined
} from '@ant-design/icons';

import MiniCodeEditor from '../../components/features/MiniCodeEditor';
import { mockInterviewData, interviewerPersonas } from '../../data/mockInterviewData';
import { useTheme } from '../../contexts/ThemeContext';
import { aiChat } from '../../utils/aiApi';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const SmartInterviewSession = () => {
  const { problemId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDarkTheme } = useTheme();

  const categoryId = searchParams.get('category');

  // 重定向映射表 - 将旧的面试路径重定向到新的算法学习面试路径
  const redirectMapping = {
    'two-sum': {
      pattern: 'array_two_pointers',
      problemId: '1'
    },
    'best-time-stock': {
      pattern: 'array_dynamic_programming',
      problemId: '121'
    },
    'container-water': {
      pattern: 'array_two_pointers',
      problemId: '11'
    },
    'three-sum': {
      pattern: 'array_two_pointers',
      problemId: '15'
    },
    'search-rotated-array': {
      pattern: 'array_binary_search',
      problemId: '33'
    }
  };

  // 检查是否需要重定向到新的算法学习面试页面
  useEffect(() => {
    if (problemId && redirectMapping[problemId]) {
      const { pattern, problemId: newProblemId } = redirectMapping[problemId];
      const newPath = `/algorithm-learning/interview/${pattern}/${newProblemId}`;
      console.log(`重定向: /interview/session/${problemId}?category=${categoryId} -> ${newPath}`);
      navigate(newPath, { replace: true });
      return;
    }
  }, [problemId, categoryId, navigate]);

  // 状态管理
  const [problem, setProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');

  // 面试状态
  const [interviewState, setInterviewState] = useState({
    isActive: false,
    phase: 'preparation', // preparation, discussion, coding, evaluation, completed
    timeRemaining: 30 * 60, // 30分钟
    startTime: null
  });

  // 面试对话
  const [interviewChat, setInterviewChat] = useState([]);
  const [interviewInput, setInterviewInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // 面试官类型
  const [interviewerType, setInterviewerType] = useState('friendly');

  // 主题类相关函数
  const getThemeClass = () => {
    return isDarkTheme ? 'dark-theme' : 'light-theme';
  };

  // 获取题目数据
  useEffect(() => {
    const categoryData = mockInterviewData[categoryId];
    if (categoryData) {
      const foundProblem = categoryData.problems.find(p => p.id === problemId);
      if (foundProblem) {
        setProblem({
          ...foundProblem,
          categoryName: categoryData.name
        });

        // 初始化代码模板
        const template = getCodeTemplate(foundProblem, language);
        setCode(template);

        setIsLoading(false);
      } else {
        message.error('题目不存在');
        navigate('/interview');
      }
    } else {
      message.error('分类不存在');
      navigate('/interview');
    }
  }, [problemId, categoryId, language, navigate]);

  // 获取代码模板
  const getCodeTemplate = (problem, lang) => {
    const templates = {
      python: `def solution(${problem.functionSignature || 'nums, target'}):\n    \"\"\"\n    ${problem.title}\n    \"\"\"\n    pass\n\n# 测试\nif __name__ == "__main__":\n    print(solution())`,
      javascript: `function solution(${problem.functionSignature || 'nums, target'}) {\n    // ${problem.title}\n    \n}\n\n// 测试\nconsole.log(solution());`,
      java: `class Solution {\n    public int[] solution(${problem.functionSignature || 'int[] nums, int target'}) {\n        // ${problem.title}\n        \n    }\n}`
    };

    return templates[lang] || templates.python;
  };

  // 开始面试
  const startInterview = () => {
    setInterviewState({
      isActive: true,
      phase: 'discussion',
      timeRemaining: 30 * 60,
      startTime: Date.now()
    });

    // 初始化AI对话
    const interviewer = interviewerPersonas[interviewerType];
    const initMessage = {
      role: 'assistant',
      content: `${interviewer.greeting} 今天我们来讨论 "${problem.title}" 这个问题。请先分析一下这个问题的核心要求。`,
      timestamp: new Date().toISOString(),
      isTyping: false
    };
    setInterviewChat([initMessage]);
  };

  // 结束面试
  const endInterview = () => {
    setInterviewState(prev => ({
      ...prev,
      isActive: false,
      phase: 'completed'
    }));
  };

  // 发送面试消息
  const sendInterviewMessage = async () => {
    if (!interviewInput.trim()) return;

    const userMessage = {
      role: 'user',
      content: interviewInput,
      timestamp: new Date().toISOString()
    };

    setInterviewChat(prev => [...prev, userMessage]);
    setInterviewInput('');
    setIsAiThinking(true);

    try {
      const interviewer = interviewerPersonas[interviewerType];
      const context = `你是${interviewer.name}，${interviewer.style}。
      面试题目: ${problem.title}
      题目描述: ${problem.description}
      当前代码: ${code}
      面试阶段: ${interviewState.phase}`;

      const aiResponse = await aiChat([
        { role: 'system', content: context },
        ...interviewChat.slice(-5), // 最近5条对话
        userMessage
      ]);

      const assistantMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        isTyping: false
      };

      setInterviewChat(prev => [...prev, assistantMessage]);
    } catch (error) {
      message.error('AI响应失败');
    } finally {
      setIsAiThinking(false);
    }
  };

  // 格式化时间
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 面试计时器
  useEffect(() => {
    let timer;
    if (interviewState.isActive && interviewState.timeRemaining > 0) {
      timer = setInterval(() => {
        setInterviewState(prev => {
          const newTimeRemaining = prev.timeRemaining - 1;
          if (newTimeRemaining <= 0) {
            return {
              ...prev,
              timeRemaining: 0,
              phase: 'completed',
              isActive: false
            };
          }
          return {
            ...prev,
            timeRemaining: newTimeRemaining
          };
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [interviewState.isActive, interviewState.timeRemaining]);

  // 渲染题目描述侧边栏
  const renderProblemDescriptionSidebar = () => (
    <Card
      className="tech-card"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileTextOutlined style={{ color: 'var(--tech-accent)' }} />
          <span className="tech-title">{problem?.title}</span>
        </div>
      }
      style={{
        height: '100%',
        background: 'var(--tech-card-bg)',
        border: '1px solid var(--tech-border)',
        overflow: 'hidden'
      }}
      bodyStyle={{
        padding: '16px',
        height: 'calc(100% - 56px)',
        overflow: 'auto',
        fontSize: '14px'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* 难度标签 */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Tag color={problem?.difficulty === 'Easy' ? 'green' : problem?.difficulty === 'Medium' ? 'orange' : 'red'}>
            {problem?.difficulty}
          </Tag>
          {problem?.tags?.map(tag => (
            <Tag key={tag} style={{ fontSize: '11px' }}>{tag}</Tag>
          ))}
        </div>

        {/* 问题描述 */}
        <div>
          <Text style={{ color: 'var(--tech-text-primary)', lineHeight: 1.6 }}>
            {problem?.description}
          </Text>
        </div>

        {/* 示例 */}
        {problem?.examples && (
          <div style={{ marginTop: '16px' }}>
            <Title level={5} style={{ color: 'var(--tech-accent)', marginBottom: '8px' }}>示例</Title>
            {problem.examples.map((example, index) => (
              <div key={index} style={{
                background: 'var(--tech-code-bg)',
                padding: '12px',
                borderRadius: '6px',
                marginBottom: '8px',
                fontFamily: 'Monaco, Consolas, monospace',
                fontSize: '12px'
              }}>
                <div style={{ marginBottom: '4px' }}>
                  <Text strong>输入: </Text>
                  <Text code>{example.input}</Text>
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <Text strong>输出: </Text>
                  <Text code>{example.output}</Text>
                </div>
                {example.explanation && (
                  <div>
                    <Text strong>解释: </Text>
                    <Text style={{ color: 'var(--tech-text-secondary)' }}>{example.explanation}</Text>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );

  // 渲染主内容区域
  const renderMainContent = () => (
    <Card
      className="tech-card"
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CodeOutlined style={{ color: 'var(--tech-accent)' }} />
            <span className="tech-title">编辑器</span>
            <Select
              value={language}
              onChange={setLanguage}
              size="small"
              style={{ width: 100 }}
            >
              <Select.Option value="python">Python</Select.Option>
              <Select.Option value="javascript">JavaScript</Select.Option>
              <Select.Option value="java">Java</Select.Option>
            </Select>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              icon={<PlayCircleOutlined />}
              type="primary"
              size="small"
              style={{
                background: 'linear-gradient(135deg, var(--tech-accent), var(--tech-primary))',
                border: 'none'
              }}
            >
              运行代码
            </Button>
            <Button
              icon={<BugOutlined />}
              size="small"
              style={{
                background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                border: 'none',
                color: 'white'
              }}
            >
              调试代码
            </Button>
          </div>
        </div>
      }
      style={{
        height: '100%',
        background: 'var(--tech-card-bg)',
        border: '1px solid var(--tech-border)'
      }}
      bodyStyle={{
        padding: 0,
        height: 'calc(100% - 56px)'
      }}
    >
      <MiniCodeEditor
        value={code}
        onChange={setCode}
        language={language}
        height="100%"
      />
    </Card>
  );

  // 渲染面试对话区域
  const renderInterviewChat = () => (
    <Card
      className="tech-card"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CustomerServiceOutlined style={{ color: 'var(--tech-accent)' }} />
          <span className="tech-title">面试对话</span>
          {interviewState.isActive && (
            <Tag color="green">进行中</Tag>
          )}
        </div>
      }
      style={{
        height: '100%',
        background: 'var(--tech-card-bg)',
        border: '1px solid var(--tech-border)',
        display: 'flex',
        flexDirection: 'column'
      }}
      bodyStyle={{
        padding: '16px',
        height: 'calc(100% - 56px)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 聊天历史 */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: '16px',
        padding: '8px',
        background: 'var(--tech-code-bg)',
        borderRadius: '8px'
      }}>
        {interviewChat.length === 0 && !interviewState.isActive ? (
          <div style={{
            textAlign: 'center',
            color: 'var(--tech-text-secondary)',
            padding: '20px'
          }}>
            <CustomerServiceOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
            <div>点击"开始面试"开始与AI面试官对话</div>
          </div>
        ) : (
          <List
            dataSource={interviewChat}
            renderItem={(item) => (
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '12px',
                alignItems: 'flex-start'
              }}>
                <Avatar
                  icon={item.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                  style={{
                    background: item.role === 'user' ? 'var(--tech-accent)' : 'var(--tech-primary)',
                    minWidth: '32px'
                  }}
                />
                <div style={{
                  flex: 1,
                  background: item.role === 'user' ? 'rgba(212, 146, 111, 0.1)' : 'rgba(82, 196, 26, 0.1)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: 'var(--tech-text-primary)'
                }}>
                  {item.content}
                </div>
              </div>
            )}
          />
        )}

        {isAiThinking && (
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <Avatar
              icon={<RobotOutlined />}
              style={{ background: 'var(--tech-primary)' }}
            />
            <div style={{
              background: 'rgba(82, 196, 26, 0.1)',
              padding: '8px 12px',
              borderRadius: '8px'
            }}>
              <Spin size="small" /> AI面试官正在思考...
            </div>
          </div>
        )}
      </div>

      {/* 输入区域 */}
      {interviewState.isActive && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <TextArea
            value={interviewInput}
            onChange={(e) => setInterviewInput(e.target.value)}
            placeholder="输入你的回答..."
            autoSize={{ minRows: 2, maxRows: 4 }}
            style={{ flex: 1 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                sendInterviewMessage();
              }
            }}
          />
          <Button
            icon={<SendOutlined />}
            type="primary"
            onClick={sendInterviewMessage}
            disabled={!interviewInput.trim()}
            style={{
              background: 'linear-gradient(135deg, var(--tech-accent), var(--tech-primary))',
              border: 'none',
              height: 'auto'
            }}
          />
        </div>
      )}
    </Card>
  );

  if (isLoading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={`algorithm-hub ${getThemeClass()} tech-background tech-grid`} style={{
      padding: '16px',
      paddingBottom: '40px',
      minHeight: '100vh',
      background: isDarkTheme ? 'var(--tech-bg-secondary)' : '#F8F7F4'
    }}>
      {/* 导航栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        padding: '12px 20px',
        background: 'var(--tech-code-bg)',
        borderRadius: '12px',
        border: '1px solid var(--tech-border)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 8px rgba(160, 120, 59, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/interview')}
            className="tech-button"
            style={{
              height: '36px',
              color: 'var(--tech-text-secondary)',
              border: '1px solid var(--tech-primary)',
              background: 'white'
            }}
          >
            返回题库
          </Button>

          {interviewState.isActive && (
            <Button
              onClick={endInterview}
              style={{
                height: '36px',
                background: 'linear-gradient(135deg, var(--tech-text-secondary), var(--tech-text-muted))',
                border: 'none',
                color: 'white'
              }}
            >
              退出面试
            </Button>
          )}
        </div>

        {/* 面试状态和计时器 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: interviewState.isActive ? 'rgba(82, 196, 26, 0.1)' : 'rgba(255, 193, 7, 0.1)',
            padding: '6px 12px',
            borderRadius: '8px',
            border: `1px solid ${interviewState.isActive ? 'rgba(82, 196, 26, 0.3)' : 'rgba(255, 193, 7, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: interviewState.isActive ? '#52c41a' : '#ffc107'
            }}></div>
            <Text style={{
              fontSize: '12px',
              color: 'var(--tech-text-primary)',
              fontWeight: '500'
            }}>
              {interviewState.isActive ? '面试进行中' : '准备中'}
            </Text>
          </div>

          <div style={{
            background: 'rgba(255, 77, 79, 0.1)',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 77, 79, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <ClockCircleOutlined style={{ color: '#ff4d4f' }} />
            <Text style={{
              fontSize: '12px',
              color: 'var(--tech-text-primary)',
              fontWeight: '500',
              fontFamily: 'Monaco, Consolas, monospace'
            }}>
              {formatTime(interviewState.timeRemaining)}
            </Text>
          </div>

          {!interviewState.isActive && interviewState.phase === 'preparation' && (
            <Button
              icon={<PlayCircleOutlined />}
              onClick={startInterview}
              className="custom-start-interview-btn"
              style={{
                background: '#000000 !important',
                border: 'none !important',
                height: '36px',
                color: 'white !important'
              }}
            >
              开始面试
            </Button>
          )}
        </div>
      </div>

      {/* 主内容区域 */}
      <Row gutter={16} style={{ height: 'calc(100vh - 120px)' }}>
        {/* 左侧：题目描述 */}
        <Col span={6} style={{ minWidth: 0, overflow: 'hidden' }}>
          {renderProblemDescriptionSidebar()}
        </Col>

        {/* 中间：代码编辑器 */}
        <Col span={12} style={{ minWidth: 0, overflow: 'hidden' }}>
          {renderMainContent()}
        </Col>

        {/* 右侧：面试对话 */}
        <Col span={6} style={{ minWidth: 0, overflow: 'hidden' }}>
          {renderInterviewChat()}
        </Col>
      </Row>

      {/* 强制覆盖按钮样式 */}
      <style jsx global>{`
        .custom-start-interview-btn.ant-btn {
          background: #000000 !important;
          border: none !important;
          color: white !important;
        }
        .custom-start-interview-btn.ant-btn:hover {
          background: #333333 !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default SmartInterviewSession;