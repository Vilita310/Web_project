import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Avatar,
  Input,
  message,
  Progress,
  Tooltip,
  Drawer,
  Timeline,
  Statistic,
  Modal,
  Rate
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ClockCircleOutlined,
  SendOutlined,
  BugOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  RobotOutlined,
  UserOutlined,
  CodeOutlined,
  FileTextOutlined,
  BarChartOutlined
} from '@ant-design/icons';

import { mockInterviewData, interviewerPersonas } from '../../data/mockInterviewData';
import { useTheme } from '../../contexts/ThemeContext';
import { aiChat } from '../../utils/aiApi';
import './mockInterviewSession.css';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Countdown } = Statistic;

const MockInterviewSession = () => {
  const { problemId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isDarkTheme, getThemeClass } = useTheme();

  const categoryId = searchParams.get('category') || 'array';
  const interviewerType = searchParams.get('interviewer') || 'friendly';

  // 状态管理
  const [currentProblem, setCurrentProblem] = useState(null);
  const [interviewer, setInterviewer] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const chatRef = useRef(null);

  // 初始化面试数据
  useEffect(() => {
    // 查找当前题目
    let foundProblem = null;
    for (const category of Object.values(mockInterviewData)) {
      const problem = category.problems.find(p => p.id === problemId);
      if (problem) {
        foundProblem = problem;
        break;
      }
    }

    if (foundProblem) {
      setCurrentProblem(foundProblem);
      setUserCode(foundProblem.template || '');
      setTimeRemaining(foundProblem.timeLimit * 60); // 转换为秒
      setInterviewer(interviewerPersonas[interviewerType]);

      // 初始化聊天
      initializeChat(foundProblem, interviewerPersonas[interviewerType]);
    } else {
      message.error('题目不存在');
      navigate('/interview');
    }
  }, [problemId, categoryId, interviewerType, navigate]);

  // 初始化AI面试官对话
  const initializeChat = (problem, interviewer) => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'ai',
      content: `你好！我是你的${interviewer.name} ${interviewer.avatar}\n\n今天我们来练习「${problem.title}」这道题目。\n\n我会根据你的表现给予适当的指导。准备好开始了吗？你可以先描述一下你的解题思路。`,
      timestamp: new Date().toLocaleTimeString()
    };
    setChatMessages([welcomeMessage]);
  };

  // 自动滚动聊天区域
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages, isAiTyping]);

  // 计时器
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setIsTimerRunning(false);
            handleTimeUp();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => interval && clearInterval(interval);
  }, [isTimerRunning, timeRemaining]);

  // 时间到处理
  const handleTimeUp = () => {
    message.warning('时间到！面试结束');
    addChatMessage({
      type: 'ai',
      content: '时间到了！让我来评估一下你的表现...'
    });
    // 这里可以添加自动评估逻辑
  };

  // 开始/暂停计时器
  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
    if (!isTimerRunning) {
      addChatMessage({
        type: 'system',
        content: '面试开始，计时器已启动 ⏰'
      });
    }
  };

  // 添加聊天消息
  const addChatMessage = (message) => {
    setChatMessages(prev => [...prev, {
      ...message,
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // 发送消息给AI面试官
  const sendMessage = async () => {
    if (!currentMessage.trim() || isAiTyping) return;

    // 添加用户消息
    addChatMessage({
      type: 'user',
      content: currentMessage.trim()
    });

    const userMsg = currentMessage.trim();
    setCurrentMessage('');
    setIsAiTyping(true);

    try {
      // 构建面试官上下文
      const context = `你是一个${interviewer.name}，正在进行「${currentProblem.title}」的算法面试。
面试风格：${interviewer.description}
题目描述：${currentProblem.description}
候选人当前代码：
\`\`\`
${userCode}
\`\`\`

请根据候选人的回答和代码，给出专业的面试官反馈。保持${interviewer.style}的风格。`;

      const response = await aiChat(userMsg, {
        context: context,
        user_level: 'intermediate',
        max_length: 200,
        page_type: 'mock_interview',
        language: 'zh-CN'
      });

      addChatMessage({
        type: 'ai',
        content: response.response || response.text || '抱歉，我需要一些时间思考你的回答。'
      });

    } catch (error) {
      console.error('AI面试官回复错误:', error);
      addChatMessage({
        type: 'ai',
        content: '抱歉，我遇到了一些技术问题。让我们继续面试，请描述一下你的解题思路。'
      });
    } finally {
      setIsAiTyping(false);
    }
  };

  // 获取提示
  const getHint = () => {
    if (currentProblem && currentProblem.hints && currentHintIndex < currentProblem.hints.length) {
      const hint = currentProblem.hints[currentHintIndex];
      addChatMessage({
        type: 'ai',
        content: `💡 提示 ${currentHintIndex + 1}: ${hint}`
      });
      setCurrentHintIndex(prev => prev + 1);
    } else {
      addChatMessage({
        type: 'ai',
        content: '已经没有更多提示了，试试根据已有的提示继续思考吧！'
      });
    }
  };

  // 提交代码
  const submitCode = () => {
    if (!userCode.trim()) {
      message.error('请先编写代码');
      return;
    }

    // 模拟代码评估
    const result = {
      passed: Math.random() > 0.3, // 70%通过率
      score: Math.floor(Math.random() * 40) + 60, // 60-100分
      feedback: '代码逻辑清晰，时间复杂度合理',
      improvements: [
        '可以优化空间复杂度',
        '边界条件处理可以更完善',
        '代码注释可以更详细'
      ]
    };

    setSubmissionResult(result);
    setShowResult(true);
    setIsTimerRunning(false);

    addChatMessage({
      type: 'ai',
      content: `面试官评估完成！\n\n✅ 得分：${result.score}/100\n📝 评价：${result.feedback}\n\n你完成得不错${result.passed ? '，恭喜通过！' : '，还需要继续努力！'}`
    });
  };

  // 格式化时间
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentProblem || !interviewer) {
    return <div>加载中...</div>;
  }

  return (
    <div className={`mock-interview-session ${getThemeClass()}`} style={{
      background: isDarkTheme
        ? 'linear-gradient(135deg, #0a0e27 0%, #1a1d3e 50%, #2a2d4e 100%)'
        : '#FAF9F6',
      minHeight: '100vh'
    }}>
      {/* 顶部工具栏 */}
      <div className="session-toolbar" style={{
        padding: '16px 24px',
        background: isDarkTheme
          ? 'rgba(22, 27, 34, 0.8)'
          : 'rgba(255, 255, 255, 0.8)',
        borderBottom: isDarkTheme
          ? '1px solid rgba(88, 166, 255, 0.3)'
          : '1px solid rgba(160, 120, 59, 0.3)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/interview')}
                type="text"
                style={{
                  color: isDarkTheme ? '#F0F6FC' : '#A0783B'
                }}
              >
                返回
              </Button>
              <div>
                <Title level={4} style={{
                  margin: 0,
                  color: isDarkTheme ? '#F0F6FC' : '#A0783B'
                }}>
                  {currentProblem.title}
                </Title>
                <Text style={{
                  color: isDarkTheme ? 'rgba(240, 246, 252, 0.6)' : 'rgba(45, 24, 16, 0.6)',
                  fontSize: '12px'
                }}>
                  {interviewer.avatar} {interviewer.name}
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <div className={`timer-display ${timeRemaining < 300 ? 'warning' : ''}`}>
                <div className="timer-number" style={{
                  color: timeRemaining < 300 ? '#ff4d4f' : (isDarkTheme ? '#F0F6FC' : '#A0783B'),
                  fontSize: '24px',
                  marginBottom: '4px'
                }}>
                  {formatTime(timeRemaining)}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: isDarkTheme ? 'rgba(240, 246, 252, 0.6)' : 'rgba(45, 24, 16, 0.6)'
                }}>
                  剩余时间
                </div>
              </div>
              <Button
                type={isTimerRunning ? 'default' : 'primary'}
                icon={isTimerRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={toggleTimer}
              >
                {isTimerRunning ? '暂停' : '开始'}
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* 主要内容区 */}
      <Row style={{ height: 'calc(100vh - 120px)' }}>
        {/* 左侧：题目描述 + 聊天区 */}
        <Col span={10} style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* 题目描述 */}
          <Card
            className="session-card"
            title={
              <span style={{ color: isDarkTheme ? '#F0F6FC' : '#A0783B' }}>
                <FileTextOutlined /> 题目描述
              </span>
            }
            style={{
              marginBottom: '16px',
              flex: '0 0 auto'
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <Tag className="difficulty-badge" color="blue">{currentProblem.difficulty}</Tag>
              {currentProblem.tags.map(tag => (
                <Tag key={tag} className="tag-enhanced">{tag}</Tag>
              ))}
            </div>
            <Paragraph style={{
              color: isDarkTheme ? 'rgba(240, 246, 252, 0.8)' : 'rgba(45, 24, 16, 0.8)',
              lineHeight: '1.6'
            }}>
              {currentProblem.description}
            </Paragraph>
            <Button
              type="link"
              icon={<BulbOutlined />}
              onClick={() => setShowHints(true)}
              style={{
                color: isDarkTheme ? '#58A6FF' : '#D4926F',
                padding: 0
              }}
            >
              查看提示
            </Button>
          </Card>

          {/* AI面试官聊天区 */}
          <Card
            className="session-card"
            title={
              <span style={{ color: isDarkTheme ? '#F0F6FC' : '#A0783B' }}>
                <RobotOutlined className="rotating-icon" /> AI面试官
              </span>
            }
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}
            bodyStyle={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: '16px'
            }}
            extra={
              <Button
                size="small"
                icon={<BulbOutlined />}
                onClick={getHint}
                style={{
                  color: isDarkTheme ? '#58A6FF' : '#D4926F'
                }}
              >
                提示
              </Button>
            }
          >
            {/* 聊天消息区 */}
            <div
              ref={chatRef}
              className="chat-container"
              style={{
                flex: 1,
                overflowY: 'auto',
                marginBottom: '16px',
                padding: '8px'
              }}
            >
              {chatMessages.map(msg => (
                <div
                  key={msg.id}
                  className={`chat-message ${msg.type}`}
                  style={{
                    display: 'flex',
                    marginBottom: '16px',
                    justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  {msg.type === 'ai' && (
                    <Avatar
                      className="chat-avatar ai"
                      style={{
                        marginRight: '8px'
                      }}
                    >
                      {interviewer.avatar}
                    </Avatar>
                  )}
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      background: msg.type === 'user'
                        ? (isDarkTheme ? 'rgba(88, 166, 255, 0.2)' : 'rgba(160, 120, 59, 0.2)')
                        : (isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)'),
                      color: isDarkTheme ? '#F0F6FC' : '#2D1810'
                    }}
                  >
                    <div style={{ whiteSpace: 'pre-line' }}>{msg.content}</div>
                    <div style={{
                      fontSize: '11px',
                      color: isDarkTheme ? 'rgba(240, 246, 252, 0.6)' : 'rgba(45, 24, 16, 0.6)',
                      marginTop: '4px',
                      textAlign: 'right'
                    }}>
                      {msg.timestamp}
                    </div>
                  </div>
                  {msg.type === 'user' && (
                    <Avatar
                      className="chat-avatar user"
                      style={{
                        marginLeft: '8px'
                      }}
                      icon={<UserOutlined />}
                    />
                  )}
                </div>
              ))}

              {/* AI输入中指示器 */}
              {isAiTyping && (
                <div className="ai-typing">
                  <Avatar className="chat-avatar ai">
                    {interviewer.avatar}
                  </Avatar>
                  <Text style={{ color: isDarkTheme ? '#F0F6FC' : '#2D1810' }}>
                    面试官正在思考...
                  </Text>
                  <div className="typing-dots">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="typing-dot" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 输入区 */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input
                className="chat-input"
                placeholder="与面试官交流你的思路..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onPressEnter={sendMessage}
                disabled={isAiTyping}
                style={{
                  flex: 1,
                  color: isDarkTheme ? '#F0F6FC' : '#2D1810'
                }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={sendMessage}
                disabled={isAiTyping || !currentMessage.trim()}
              />
            </div>
          </Card>
        </Col>

        {/* 右侧：代码编辑器 */}
        <Col span={14} style={{ padding: '16px', height: '100%' }}>
          <Card
            className="session-card code-editor-container"
            title={
              <span style={{ color: isDarkTheme ? '#F0F6FC' : '#A0783B' }}>
                <CodeOutlined /> 代码编辑器
              </span>
            }
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
            bodyStyle={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: '16px'
            }}
            extra={
              <Space>
                <Button
                  className="session-button"
                  icon={<BugOutlined />}
                  onClick={() => message.info('调试功能开发中...')}
                >
                  🔍 调试
                </Button>
                <Button
                  className="session-button primary"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={submitCode}
                >
                  ✅ 提交代码
                </Button>
              </Space>
            }
          >
            <TextArea
              className="code-textarea"
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              placeholder="在这里编写你的解决方案..."
              style={{
                flex: 1,
                color: isDarkTheme ? '#d4d4d4' : '#2d1810'
              }}
              rows={20}
            />
          </Card>
        </Col>
      </Row>

      {/* 提示抽屉 */}
      <Drawer
        title="💡 解题提示"
        placement="right"
        onClose={() => setShowHints(false)}
        open={showHints}
        width={400}
      >
        <Timeline>
          {currentProblem.hints.map((hint, index) => (
            <Timeline.Item
              key={index}
              color={index <= currentHintIndex ? 'green' : 'gray'}
              dot={index <= currentHintIndex ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
            >
              <Text style={{
                color: index <= currentHintIndex
                  ? (isDarkTheme ? '#F0F6FC' : '#2D1810')
                  : (isDarkTheme ? 'rgba(240, 246, 252, 0.5)' : 'rgba(45, 24, 16, 0.5)')
              }}>
                {hint}
              </Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Drawer>

      {/* 结果弹窗 */}
      <Modal
        title="面试结果"
        open={showResult}
        onOk={() => {
          setShowResult(false);
          navigate('/interview');
        }}
        onCancel={() => setShowResult(false)}
        footer={[
          <Button key="back" onClick={() => setShowResult(false)}>
            继续练习
          </Button>,
          <Button key="home" type="primary" onClick={() => navigate('/interview')}>
            返回主页
          </Button>
        ]}
      >
        {submissionResult && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                fontSize: '48px',
                color: submissionResult.passed ? '#52c41a' : '#ff4d4f'
              }}>
                {submissionResult.passed ? '🎉' : '😅'}
              </div>
              <Title level={3} style={{
                color: submissionResult.passed ? '#52c41a' : '#ff4d4f',
                margin: '16px 0'
              }}>
                {submissionResult.passed ? '恭喜通过！' : '还需努力'}
              </Title>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>
                {submissionResult.score}/100
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Text strong>面试官评价：</Text>
              <Paragraph style={{ marginTop: '8px' }}>
                {submissionResult.feedback}
              </Paragraph>
            </div>

            <div>
              <Text strong>改进建议：</Text>
              <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                {submissionResult.improvements.map((improvement, index) => (
                  <li key={index}>{improvement}</li>
                ))}
              </ul>
            </div>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <Rate value={Math.floor(submissionResult.score / 20)} disabled />
            </div>
          </div>
        )}
      </Modal>

      <style jsx>{`
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-8px); opacity: 1; }
        }

        .mock-interview-session {
          animation: fadeInUp 0.6s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* 自定义滚动条 */
        .chat-container::-webkit-scrollbar {
          width: 6px;
        }

        .chat-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .chat-container::-webkit-scrollbar-thumb {
          background: rgba(88, 166, 255, 0.4);
          border-radius: 3px;
        }

        .chat-container::-webkit-scrollbar-thumb:hover {
          background: rgba(88, 166, 255, 0.6);
        }

        /* 代码编辑器滚动条 */
        .code-textarea::-webkit-scrollbar {
          width: 8px;
        }

        .code-textarea::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }

        .code-textarea::-webkit-scrollbar-thumb {
          background: rgba(82, 196, 26, 0.4);
          border-radius: 4px;
        }

        .code-textarea::-webkit-scrollbar-thumb:hover {
          background: rgba(82, 196, 26, 0.6);
        }
      `}</style>
    </div>
  );
};

export default MockInterviewSession;