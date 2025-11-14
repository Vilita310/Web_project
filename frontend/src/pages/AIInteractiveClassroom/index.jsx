import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Space,
  Avatar,
  Progress,
  Tag,
  message,
  Spin,
  Drawer,
  List,
  Tabs,
  Divider,
  Tooltip,
  Input
} from 'antd';
import {
  PlayCircleOutlined,
  PauseOutlined,
  SoundOutlined,
  BulbOutlined,
  BookOutlined,
  ArrowLeftOutlined,
  FullscreenOutlined,
  UserOutlined,
  RobotOutlined,
  CheckCircleOutlined,
  LockOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  ThunderboltOutlined,
  CodeOutlined,
  ExperimentOutlined,
  BugOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  SendOutlined
} from '@ant-design/icons';

import AIBlackboard from '../../components/core/AIBlackboard';
import SlidingWindowDemo from '../../components/AlgorithmAnimation/SlidingWindowDemo';
// import ClassroomNotes from '../../components/ClassroomNotes';
import { leetcode75Data } from '../../data/leetcode75Complete';
import { aiChat } from '../../utils/aiApi';
import './classroom.css';

const { Title, Text, Paragraph } = Typography;

const AIInteractiveClassroom = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { chapterId, patternId } = useParams();

  // 状态管理
  const [currentPattern, setCurrentPattern] = useState(null);
  const [isTeaching, setIsTeaching] = useState(false);
  const [aiTeacherStatus, setAiTeacherStatus] = useState('idle');
  const [teachingProgress, setTeachingProgress] = useState(0);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentConcept, setCurrentConcept] = useState(0);

  // 工具函数：获取难度对应的颜色
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case '简单': return 'green';
      case '中等': return 'orange';
      case '困难': return 'red';
      default: return 'blue';
    }
  };

  // 工具函数：获取所有题目
  const getAllProblems = () => {
    return currentPattern?.problems || [];
  };
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState('theory');

  // AI语音相关状态
  const [isListening, setIsListening] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [ttsProgress, setTtsProgress] = useState(0);
  const [recognition, setRecognition] = useState(null);

  // AI黑板状态
  const [blackboardActions, setBlackboardActions] = useState([]);
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);

  // 获取当前模式数据
  useEffect(() => {
    if (chapterId && patternId) {
      // 根据chapterId和patternId参数查找对应的算法模式
      const patternData = findPatternData(chapterId, patternId);
      setCurrentPattern(patternData);

      if (patternData) {
        // 初始化AI黑板内容
        initializeBlackboard(patternData);
        // 添加欢迎消息
        addConversationMessage('ai', `欢迎来到${patternData.name}的AI互动教室！让我们开始学习吧。`);
      }
    }
  }, [chapterId, patternId]);

  // AI助教聊天状态
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // 处理聊天发送
  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsAiTyping(true);

    try {
      // 这里可以集成AI API
      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          type: 'ai',
          content: `关于"${userMessage.content}"，这是一个很好的问题。在${currentPattern?.name}中，我们需要理解核心思想：${currentPattern?.coreIdea}`,
          timestamp: new Date().toLocaleTimeString()
        };
        setChatMessages(prev => [...prev, aiResponse]);
        setIsAiTyping(false);
      }, 1500);
    } catch (error) {
      console.error('AI回复错误:', error);
      setIsAiTyping(false);
    }
  };

  // 渲染AI助教聊天框
  const renderAIAssistantChat = () => {
    return (
      <Card
        title={
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RobotOutlined style={{ color: '#1890ff' }} />
            <span style={{ color: '#fff' }}>AI助教</span>
          </span>
        }
        style={{
          minHeight: '400px',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          background: 'rgba(26, 29, 62, 0.8)',
          borderRadius: '12px'
        }}
        headStyle={{
          background: 'transparent',
          borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
          color: 'var(--tech-primary)'
        }}
        bodyStyle={{
          padding: '12px',
          background: 'transparent'
        }}
      >
        {/* 消息列表 */}
        <div style={{
          height: '300px',
          overflowY: 'auto',
          marginBottom: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {chatMessages.length === 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                maxWidth: '80%',
                padding: '8px 12px',
                borderRadius: '16px 16px 16px 4px',
                backgroundColor: 'rgba(42, 45, 78, 0.9)',
                color: '#fff',
                fontSize: '13px',
                lineHeight: 1.4,
                border: '1px solid rgba(0, 212, 255, 0.2)',
                wordBreak: 'break-word'
              }}>
                你好！我是你的AI助教<br/>
                可以通过文字与我交流学习问题
              </div>
            </div>
          )}

          {chatMessages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  maxWidth: '80%',
                  padding: '8px 12px',
                  borderRadius: message.type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  backgroundColor: message.type === 'user'
                    ? 'linear-gradient(135deg, #00d4ff, #0096cc)'
                    : 'rgba(42, 45, 78, 0.9)',
                  color: message.type === 'user' ? '#000' : '#fff',
                  fontSize: '13px',
                  lineHeight: 1.4,
                  border: message.type === 'user' ? 'none' : '1px solid rgba(0, 212, 255, 0.2)',
                  wordBreak: 'break-word'
                }}
              >
                {message.content}
              </div>
            </div>
          ))}

          {isAiTyping && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: '8px 12px',
                borderRadius: '16px 16px 16px 4px',
                backgroundColor: 'rgba(42, 45, 78, 0.9)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                color: '#fff',
                fontSize: '13px'
              }}>
                AI正在思考中...
              </div>
            </div>
          )}
        </div>

        {/* 输入框 */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <Input
            placeholder="问我任何学习问题..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onPressEnter={handleChatSend}
            style={{
              flex: 1,
              backgroundColor: 'rgba(42, 45, 78, 0.8)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              color: '#fff'
            }}
            disabled={isAiTyping}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleChatSend}
            disabled={!chatInput.trim() || isAiTyping}
            style={{
              background: 'linear-gradient(135deg, #00d4ff, #0096cc)',
              border: 'none',
              color: '#000'
            }}
          />
        </div>
      </Card>
    );
  };

  // 查找算法模式数据
  const findPatternData = (chapterId, patternId) => {
    const chapter = leetcode75Data[chapterId];
    if (chapter) {
      const pattern = chapter.patterns.find(p => p.id === patternId);
      if (pattern) {
        return {
          ...pattern,
          chapterId,
          chapterName: chapter.name
        };
      }
    }
    return null;
  };

  // 初始化AI黑板
  const initializeBlackboard = (patternData) => {
    const initialActions = [
      {
        type: 'title',
        content: patternData.name,
        position: { x: 400, y: 80 },
        style: { fontSize: '32px', color: '#1890ff', fontWeight: 'bold' }
      },
      {
        type: 'concept',
        content: patternData.description,
        position: { x: 50, y: 150 },
        style: { fontSize: '18px', color: '#333' }
      },
      {
        type: 'highlight',
        content: `核心思想: ${patternData.coreIdea}`,
        position: { x: 50, y: 220 },
        style: { fontSize: '16px', color: '#52c41a', backgroundColor: '#f6ffed' }
      }
    ];
    setBlackboardActions(initialActions);
  };

  // 初始化语音识别
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'zh-CN';

      recognitionInstance.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);

        // 添加用户消息到对话历史
        addConversationMessage('user', transcript);

        // 处理AI回复
        await handleVoiceInput(transcript);
      };

      recognitionInstance.onerror = (event) => {
        console.error('语音识别错误:', event.error);
        setIsListening(false);
        setAiTeacherStatus('idle');
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // 添加对话消息
  const addConversationMessage = (type, content, timestamp = new Date().toLocaleTimeString()) => {
    setConversationHistory(prev => [...prev, {
      id: Date.now(),
      type,
      content,
      timestamp
    }]);
  };

  // 处理语音输入
  const handleVoiceInput = async (transcript) => {
    setAiTeacherStatus('thinking');

    try {
      const contextPrompt = buildContextPrompt(transcript);
      const response = await aiChat(contextPrompt, 'AI算法教师', 'advanced', 120);

      // 添加AI回复到对话
      addConversationMessage('ai', response.response);

      // 更新AI黑板内容
      await updateBlackboardFromAI(response.response, transcript);

      // 播放AI语音回复
      await speakResponse(response.response);

    } catch (error) {
      console.error('AI教师回复错误:', error);
      addConversationMessage('ai', '抱歉，我现在无法回复。请稍后重试。');
      setAiTeacherStatus('idle');
    }
  };

  // 构建上下文提示
  const buildContextPrompt = (userInput) => {
    const patternContext = currentPattern ? `
当前学习模式: ${currentPattern.name}
模式描述: ${currentPattern.description}
核心思想: ${currentPattern.coreIdea}
相关问题: ${currentPattern.problems.map(p => p.title).join(', ')}
` : '';

    return `作为AI算法教师，请针对学生的问题"${userInput}"进行教学回答。

${patternContext}

请提供:
1. 清晰的概念解释
2. 具体的例子
3. 可视化描述（我会在AI黑板上演示）
4. 实际应用场景

回复格式要求:
- 使用友好、鼓励的语调
- 避免过于复杂的术语
- 提供具体可操作的学习建议`;
  };

  // 从AI回复更新黑板内容
  const updateBlackboardFromAI = async (aiResponse, userQuestion) => {
    // 根据AI回复内容生成黑板动作
    const newActions = [...blackboardActions];

    // 添加用户问题
    newActions.push({
      type: 'concept',
      content: `Q: ${userQuestion}`,
      position: { x: 50, y: 300 + (conversationHistory.length * 60) },
      style: { fontSize: '16px', color: '#1890ff' }
    });

    // 添加AI回复要点
    newActions.push({
      type: 'concept',
      content: `A: ${aiResponse.substring(0, 100)}...`,
      position: { x: 50, y: 330 + (conversationHistory.length * 60) },
      style: { fontSize: '14px', color: '#333' }
    });

    setBlackboardActions(newActions);
  };

  // AI语音播放
  const speakResponse = async (text) => {
    if (!text) return;

    setAiTeacherStatus('speaking');
    setAiSpeaking(true);

    try {
      // 这里可以集成TTS API
      // 暂时使用浏览器内置语音合成
      if ('speechSynthesis' in window && window.SpeechSynthesisUtterance) {
        const utterance = new window.SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;

        utterance.onend = () => {
          setAiSpeaking(false);
          setAiTeacherStatus('idle');
        };

        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('语音播放失败:', error);
      setAiSpeaking(false);
      setAiTeacherStatus('idle');
    }
  };

  // 开始语音对话
  const startVoiceConversation = () => {
    if (recognition && !isListening) {
      setIsListening(true);
      setAiTeacherStatus('listening');
      recognition.start();
      message.info('🎤 AI老师正在听您说话...');
    }
  };

  // 停止所有AI活动
  const stopAllAIActivity = () => {
    if (recognition) recognition.stop();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsListening(false);
    setAiSpeaking(false);
    setAiTeacherStatus('idle');
  };

  // 开始算法演示
  const startAlgorithmDemo = () => {
    setIsAnimationPlaying(true);
    setTeachingProgress(0);

    // 根据当前模式播放相应动画
    if (currentPattern?.id === 'sliding_window') {
      // 启动滑动窗口演示
      message.info('🎬 开始滑动窗口算法演示');
    }
  };

  // 渲染AI教师面板
  const renderAITeacher = () => (
    <Card
      className="ai-teacher-panel"
      title={
        <Space>
          <Avatar
            size="large"
            icon={<RobotOutlined />}
            style={{
              backgroundColor: '#00d4ff',
              color: '#000'
            }}
          />
          <div>
            <Title level={4} style={{ margin: 0, color: '#fff' }}>AI 算法教师</Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>
              {aiTeacherStatus === 'idle' && '待命中，随时为您答疑'}
              {aiTeacherStatus === 'listening' && '🎤 正在听您说话...'}
              {aiTeacherStatus === 'thinking' && '🤔 思考中...'}
              {aiTeacherStatus === 'speaking' && '🗣️ 正在讲解...'}
            </Text>
          </div>
        </Space>
      }
      style={{
        background: 'rgba(26, 29, 62, 0.95)',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        color: '#fff'
      }}
      headStyle={{ background: 'transparent', border: 'none' }}
      bodyStyle={{ padding: '16px' }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* AI状态显示 */}
        <div className="ai-status">
          <Progress
            percent={
              aiTeacherStatus === 'speaking' ? ttsProgress :
              aiTeacherStatus === 'thinking' ? 50 :
              aiTeacherStatus === 'listening' ? 100 : 0
            }
            status={aiTeacherStatus === 'listening' ? 'active' : 'normal'}
            strokeColor={
              aiTeacherStatus === 'listening' ? '#52c41a' :
              aiTeacherStatus === 'thinking' ? '#00d4ff' :
              aiTeacherStatus === 'speaking' ? '#faad14' : 'rgba(255, 255, 255, 0.2)'
            }
            trailColor="rgba(26, 29, 62, 0.6)"
            showInfo={false}
            strokeWidth={4}
          />
        </div>

        {/* 控制按钮 */}
        <Space style={{ width: '100%', justifyContent: 'center' }}>
          <Button
            type="primary"
            icon={<SoundOutlined />}
            onClick={startVoiceConversation}
            loading={isListening}
            disabled={aiSpeaking}
            style={{
              background: isListening ?
                'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)' :
                'linear-gradient(135deg, #00d4ff 0%, #0096cc 100%)',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600
            }}
          >
            {isListening ? '录音中...' : '语音提问'}
          </Button>

          <Button
            icon={<PlayCircleOutlined />}
            onClick={startAlgorithmDemo}
            disabled={isAnimationPlaying}
            style={{
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              color: '#00d4ff',
              borderRadius: '8px'
            }}
          >
            演示算法
          </Button>
        </Space>

        {/* 快捷问题 */}
        <div className="quick-questions">
          <Text strong style={{ color: '#00d4ff', fontSize: '13px', marginBottom: '8px', display: 'block' }}>
            💡 快捷问题:
          </Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              '这个算法的核心思想是什么？',
              '能给我举个具体例子吗？',
              '时间复杂度是多少？',
              '什么情况下使用这个模式？'
            ].map((question, index) => (
              <Button
                key={index}
                size="small"
                type="text"
                style={{
                  textAlign: 'left',
                  color: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(0, 212, 255, 0.2)',
                  fontSize: '11px',
                  padding: '4px 8px',
                  height: 'auto',
                  borderRadius: '6px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(0, 212, 255, 0.1)';
                  e.target.style.color = '#00d4ff';
                  e.target.style.borderColor = 'rgba(0, 212, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                  e.target.style.borderColor = 'rgba(0, 212, 255, 0.2)';
                }}
                onClick={() => handleVoiceInput(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      </Space>
    </Card>
  );

  // 渲染理论学习部分
  const renderTheorySection = () => (
    <Row gutter={16} className="theory-content">
      {/* 左侧：AI Teacher */}
      <Col span={6}>
        {renderAITeacher()}
      </Col>

      {/* 中央：AI黑板 */}
      <Col span={showSidebar ? 12 : 18}>
        <Card
          title="🎨 AI智能黑板"
          className="blackboard-container"
          style={{ height: '600px' }}
        >
          <AIBlackboard
            boardActions={blackboardActions}
            isInteractive={true}
            onUserDraw={(drawingData) => {
              console.log('用户绘制:', drawingData);
              // 这里可以集成手绘识别
            }}
          />

          {/* 算法动画演示区域 */}
          {currentPattern.id === 'sliding_window' && (
            <div style={{ marginTop: 16 }}>
              <SlidingWindowDemo
                onAIBlackboardRender={(actions) => {
                  setBlackboardActions(prev => [...prev, ...actions]);
                }}
              />
            </div>
          )}
        </Card>
      </Col>

      {/* 右侧：学习助手（可隐藏）*/}
      {showSidebar && (
        <Col span={6}>
          {renderLearningAssistant()}
        </Col>
      )}
    </Row>
  );

  // 渲染题目练习部分
  const renderPracticeSection = () => (
    <div className="practice-content">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        padding: '16px 20px',
        background: 'rgba(0, 212, 255, 0.1)',
        border: '1px solid rgba(0, 212, 255, 0.3)',
        borderRadius: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #00d4ff, #0096cc)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          💪
        </div>
        <div>
          <Title level={4} style={{ margin: 0, color: '#00d4ff' }}>
            题目练习
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
            通过实际编程练习巩固{currentPattern.name}的理解
          </Text>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Tag color="green" style={{ fontSize: '12px', padding: '4px 8px' }}>
            {currentPattern.problems.length}道题目
          </Tag>
        </div>
      </div>

      <Row gutter={16}>
        {currentPattern.problems.map((problem, index) => (
          <Col span={8} key={problem.id} style={{ marginBottom: 16 }}>
            <Card
              hoverable
              className="problem-card"
              onClick={() => {
                window.scrollTo(0, 0);
                navigate(`/algorithm-learning/coding/${patternId}/${problem.id}`);
              }}
              style={{
                background: 'rgba(26, 29, 62, 0.8)',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                borderRadius: '12px',
                transition: 'all 0.3s ease'
              }}
              bodyStyle={{ padding: '20px' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.border = '1px solid rgba(0, 212, 255, 0.5)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 212, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.border = '1px solid rgba(0, 212, 255, 0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text strong style={{ color: '#00d4ff', fontSize: '14px' }}>
                    #{problem.leetcodeId || index + 1}
                  </Text>
                  <Tag color={
                    problem.difficulty === '简单' ? 'green' :
                    problem.difficulty === '中等' ? 'orange' : 'red'
                  } style={{ fontSize: '11px' }}>
                    {problem.difficulty}
                  </Tag>
                </div>

                <Title level={5} style={{ margin: 0, color: '#fff', fontSize: '16px' }}>
                  {problem.title}
                </Title>

                <Text style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {problem.description}
                </Text>

                {problem.tags && (
                  <Space wrap>
                    {problem.tags.slice(0, 3).map(tag => (
                      <Tag key={tag} size="small" style={{
                        background: 'rgba(0, 212, 255, 0.1)',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        color: '#00d4ff',
                        fontSize: '10px'
                      }}>
                        {tag}
                      </Tag>
                    ))}
                    {problem.tags.length > 3 && (
                      <Tag size="small" style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '10px'
                      }}>
                        +{problem.tags.length - 3}
                      </Tag>
                    )}
                  </Space>
                )}

                <Button
                  type="primary"
                  size="small"
                  style={{
                    marginTop: 12,
                    width: '100%',
                    background: 'linear-gradient(135deg, #00d4ff 0%, #0096cc 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.scrollTo(0, 0);
                    navigate(`/algorithm-learning/coding/${patternId}/${problem.id}`);
                  }}
                >
                  开始练习
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );

  // 渲染学习助手面板
  const renderLearningAssistant = () => (
    <div className="learning-assistant">
      <Card
        title="📚 学习要点"
        style={{
          background: 'rgba(26, 29, 62, 0.95)',
          border: '1px solid rgba(0, 212, 255, 0.2)'
        }}
        headStyle={{ background: 'transparent', border: 'none' }}
        bodyStyle={{ padding: '16px' }}
      >
        {currentPattern && (
          <List
            size="small"
            dataSource={[
              { label: '算法模式', value: currentPattern.name, icon: '🎯' },
              { label: '所属章节', value: currentPattern.chapterName, icon: '📖' },
              { label: '核心思想', value: currentPattern.coreIdea, icon: '💡' },
              { label: '相关题目', value: `${currentPattern.problems.length}道`, icon: '📝' }
            ]}
            renderItem={item => (
              <List.Item style={{
                padding: '8px 0',
                borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
                color: '#fff'
              }}>
                <Space>
                  <span style={{ fontSize: '14px' }}>{item.icon}</span>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>
                    {item.label}:
                  </Text>
                  <Text style={{ color: '#fff', fontSize: '12px', fontWeight: 500 }}>
                    {item.value}
                  </Text>
                </Space>
              </List.Item>
            )}
          />
        )}
      </Card>

      <Card
        title="💬 对话历史"
        style={{
          marginTop: 16,
          background: 'rgba(26, 29, 62, 0.95)',
          border: '1px solid rgba(0, 212, 255, 0.2)'
        }}
        headStyle={{ background: 'transparent', border: 'none' }}
        bodyStyle={{ padding: '12px', maxHeight: 300, overflow: 'auto' }}
      >
        {conversationHistory.length > 0 ? (
          <List
            dataSource={conversationHistory.slice(-5)}
            renderItem={item => (
              <List.Item style={{
                padding: '8px 0',
                borderBottom: '1px solid rgba(0, 212, 255, 0.1)'
              }}>
                <Space align="start">
                  <Avatar
                    size="small"
                    icon={item.type === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    style={{
                      backgroundColor: item.type === 'user' ? '#00d4ff' : '#52c41a'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <Text style={{
                      fontSize: '10px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      display: 'block',
                      marginBottom: '4px'
                    }}>
                      {item.timestamp}
                    </Text>
                    <Paragraph style={{
                      margin: 0,
                      fontSize: '12px',
                      color: '#fff',
                      lineHeight: 1.4
                    }}>
                      {item.content.length > 100 ? `${item.content.substring(0, 100)}...` : item.content}
                    </Paragraph>
                  </div>
                </Space>
              </List.Item>
            )}
          />
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            color: 'rgba(255, 255, 255, 0.5)'
          }}>
            <RobotOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
            <div style={{ fontSize: '12px' }}>
              开始与AI老师对话
            </div>
          </div>
        )}
      </Card>
    </div>
  );

  if (!currentPattern) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>加载算法模式中...</p>
      </div>
    );
  }

  // 渲染左侧学习导航
  const renderLeftSidebar = () => (
    <Card
      className="tech-card tech-fade-in"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BookOutlined style={{ color: '#00d4ff' }} />
          <span style={{ color: '#fff', fontSize: '16px' }}>学习导航</span>
        </div>
      }
      bodyStyle={{ padding: '12px' }}
      style={{
        background: 'rgba(26, 29, 62, 0.95)',
        border: '1px solid rgba(0, 212, 255, 0.2)'
      }}
      headStyle={{ background: 'transparent', border: 'none' }}
    >
      {/* 学习项目列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* 理论学习卡片 */}
        <div
          onClick={() => setSelectedProblem('theory')}
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: `1px solid ${selectedProblem === 'theory' ? '#00d4ff' : 'rgba(0, 212, 255, 0.2)'}`,
            background: selectedProblem === 'theory'
              ? 'rgba(0, 212, 255, 0.1)'
              : 'rgba(26, 29, 62, 0.4)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: selectedProblem === 'theory' ? '0 0 15px rgba(0, 212, 255, 0.3)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (selectedProblem !== 'theory') {
              e.target.style.background = 'rgba(0, 212, 255, 0.05)';
              e.target.style.borderColor = 'rgba(0, 212, 255, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedProblem !== 'theory') {
              e.target.style.background = 'rgba(26, 29, 62, 0.4)';
              e.target.style.borderColor = 'rgba(0, 212, 255, 0.2)';
            }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* 理论学习图标 */}
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: selectedProblem === 'theory' ? '#00d4ff' : 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: selectedProblem === 'theory' ? '#000' : '#fff',
              fontSize: '12px',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              <BulbOutlined style={{ fontSize: '14px' }} />
            </div>

            {/* 理论学习信息 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: selectedProblem === 'theory' ? '#00d4ff' : '#fff',
                marginBottom: '4px',
                lineHeight: 1.3
              }}>
                理论学习
              </div>


              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                <Tag
                  size="small"
                  style={{
                    fontSize: '9px',
                    background: 'rgba(0, 212, 255, 0.1)',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    color: '#00d4ff',
                    margin: 0
                  }}
                >
                  核心思想
                </Tag>
                <Tag
                  size="small"
                  style={{
                    fontSize: '9px',
                    background: 'rgba(0, 212, 255, 0.1)',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    color: '#00d4ff',
                    margin: 0
                  }}
                >
                  算法动画
                </Tag>
              </div>
            </div>
          </div>
        </div>

        {/* 题目练习列表 */}
        {currentPattern.problems.map((problem, index) => {
          const isSelected = selectedProblem === problem.id;
          const isCompleted = false; // 这里应该从用户进度获取

          return (
            <div
              key={problem.id}
              onClick={() => {
                // 直接跳转到编程练习页面
                window.scrollTo(0, 0);
                navigate(`/algorithm-learning/coding/${patternId}/${problem.id}`);
              }}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: `1px solid ${isSelected ? '#00d4ff' : 'rgba(0, 212, 255, 0.2)'}`,
                background: isSelected
                  ? 'rgba(0, 212, 255, 0.1)'
                  : isCompleted
                    ? 'rgba(82, 196, 26, 0.05)'
                    : 'rgba(26, 29, 62, 0.4)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: isSelected ? '0 0 15px rgba(0, 212, 255, 0.3)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.target.style.background = 'rgba(0, 212, 255, 0.05)';
                  e.target.style.borderColor = 'rgba(0, 212, 255, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.target.style.background = isCompleted ? 'rgba(82, 196, 26, 0.05)' : 'rgba(26, 29, 62, 0.4)';
                  e.target.style.borderColor = 'rgba(0, 212, 255, 0.2)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* 题目编号 */}
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: isCompleted
                    ? '#52c41a'
                    : isSelected
                      ? '#00d4ff'
                      : 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isCompleted || isSelected ? '#000' : '#fff',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  {isCompleted ? (
                    <CheckCircleOutlined style={{ fontSize: '14px' }} />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* 题目信息 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: isSelected ? '#00d4ff' : '#fff',
                    marginBottom: '4px',
                    lineHeight: 1.3
                  }}>
                    {problem.title}
                  </div>


                  {/* 标签 */}
                  {problem.tags && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {problem.tags.slice(0, 2).map(tag => (
                        <Tag
                          key={tag}
                          size="small"
                          style={{
                            fontSize: '9px',
                            background: 'rgba(0, 212, 255, 0.1)',
                            border: '1px solid rgba(0, 212, 255, 0.3)',
                            color: '#00d4ff',
                            margin: 0
                          }}
                        >
                          {tag}
                        </Tag>
                      ))}
                      {problem.tags.length > 2 && (
                        <Text style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.5)' }}>
                          +{problem.tags.length - 2}
                        </Text>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </Card>
  );

  // 旧的 renderRightSidebar 函数已被替代，新的函数位于下方

  // 渲染主要内容区域
  const renderMainContent = () => {
    if (selectedProblem === 'theory') {
      // 理论学习模式 - 参考ClassroomPage的theory阶段布局
      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 课程信息头部 */}
          <Card
            className="tech-card tech-fade-in"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 212, 255, 0.4))',
              border: '1px solid rgba(0, 212, 255, 0.6)'
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#00d4ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000',
                fontSize: '20px'
              }}>
                💡
              </div>
              <div>
                <Title level={4} style={{ margin: 0, fontSize: '18px', color: '#fff' }}>
                  理论学习 - {currentPattern.name}
                </Title>
                <Text style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>
                  {currentPattern.description}
                </Text>
              </div>
            </div>
          </Card>

          {/* 主要内容区域 - AI智能黑板 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* AI智能黑板 */}
            <div style={{ flex: 1 }}>
              <AIBlackboard
                boardActions={blackboardActions}
                isInteractive={true}
                onUserDraw={(drawingData) => {
                  console.log('用户绘制:', drawingData);
                }}
                onAITeach={(topic, boardActionCallback) => {
                  console.log('AI Teaching Topic:', topic);
                  console.log('Board callback function:', boardActionCallback);
                  // 这里可以集成AI教学功能
                }}
              />
            </div>

            {/* AI助手按钮组 */}
            <div style={{
              textAlign: 'center',
              marginTop: '16px',
              display: 'flex',
              gap: '12px',
              justifyContent: 'center'
            }}>
              <Button
                type="primary"
                onClick={() => {
                  message.info('📸 截图提问功能');
                  // 这里可以添加截图提问功能
                }}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                }}
              >
                截图提问
              </Button>

              <Button
                type="primary"
                icon={<SoundOutlined />}
                onClick={() => {
                  if (isListening) {
                    stopAllAIActivity();
                    message.info('🔇 已停止语音对话');
                  } else {
                    startVoiceConversation();
                  }
                }}
                style={{
                  background: isListening ?
                    'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)' :
                    'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(72, 187, 120, 0.4)'
                }}
              >
                {isListening ? '停止对话' : 'AI语音对话'}
              </Button>

            </div>
          </div>
        </div>
      );
    } else {
      // 题目练习模式 - 显示题目详情
      const problem = currentPattern.problems.find(p => p.id === selectedProblem);
      if (!problem) {
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <BookOutlined style={{ fontSize: '48px', color: 'rgba(255, 255, 255, 0.3)' }} />
            <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '16px' }}>
              请从左侧选择一个学习项目
            </Text>
          </div>
        );
      }

      return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 题目信息头部 */}
          <Card
            className="tech-card tech-fade-in"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 212, 255, 0.4))',
              border: '1px solid rgba(0, 212, 255, 0.6)'
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: problem.difficulty === '简单' ? '#52c41a' :
                           problem.difficulty === '中等' ? '#faad14' : '#ff4d4f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                #{problem.leetcodeId || currentPattern.problems.findIndex(p => p.id === selectedProblem) + 1}
              </div>
              <div style={{ flex: 1 }}>
                <Title level={4} style={{ margin: 0, fontSize: '18px', color: '#fff' }}>
                  {problem.title}
                </Title>
                <Text style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>
                  {problem.description}
                </Text>
              </div>
              <Button
                type="primary"
                size="large"
                onClick={() => {
                  window.scrollTo(0, 0);
                  navigate(`/algorithm-learning/coding/${patternId}/${selectedProblem}`);
                }}
                style={{
                  background: 'linear-gradient(135deg, #00d4ff 0%, #0096cc 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600
                }}
              >
                开始练习
              </Button>
            </div>
          </Card>

          {/* 题目详情内容 */}
          <Card
            className="tech-card tech-fade-in"
            title="题目详情"
            style={{
              flex: 1,
              background: 'rgba(26, 29, 62, 0.95)',
              border: '1px solid rgba(0, 212, 255, 0.2)'
            }}
            headStyle={{ background: 'transparent', border: 'none' }}
            bodyStyle={{ padding: '20px' }}
          >
            <div style={{ color: '#fff', lineHeight: 1.6 }}>
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ color: '#00d4ff', fontSize: '14px' }}>难度：</Text>
                <Tag
                  color={problem.difficulty === '简单' ? 'green' :
                        problem.difficulty === '中等' ? 'orange' : 'red'}
                  style={{ marginLeft: '8px' }}
                >
                  {problem.difficulty}
                </Tag>
              </div>

              {problem.tags && (
                <div style={{ marginBottom: '16px' }}>
                  <Text strong style={{ color: '#00d4ff', fontSize: '14px' }}>相关标签：</Text>
                  <div style={{ marginTop: '8px' }}>
                    {problem.tags.map(tag => (
                      <Tag key={tag} style={{ margin: '2px 4px 2px 0' }}>{tag}</Tag>
                    ))}
                  </div>
                </div>
              )}

              {problem.hints && (
                <div style={{ marginBottom: '16px' }}>
                  <Text strong style={{ color: '#00d4ff', fontSize: '14px' }}>解题提示：</Text>
                  <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                    {problem.hints.map((hint, index) => (
                      <li key={index} style={{
                        marginBottom: '4px',
                        color: 'rgba(255, 255, 255, 0.8)'
                      }}>
                        {hint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </div>
      );
    }
  };

  // 渲染右侧栏 - 匹配ClassroomPage设计
  const renderRightSidebarContent = () => {
    if (selectedProblem === 'theory') {
      // 理论学习模式的右侧栏
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 课堂笔记 */}
          <ClassroomNotes
            lessonData={{
              stages: {
                theory: {
                  topic: currentPattern.name,
                  content: currentPattern.description,
                  keyPoints: [
                    '理解算法的核心思想和应用场景',
                    '掌握基本的实现模板和代码结构',
                    '分析时间复杂度和空间复杂度',
                    '学会识别适用该算法的题目特征'
                  ],
                  examples: [
                    {
                      title: '基础示例',
                      explanation: '展示算法的基本用法和实现方式'
                    },
                    {
                      title: '进阶应用',
                      explanation: '在复杂场景下的算法应用技巧'
                    }
                  ]
                }
              }
            }}
            courseId="algorithm-learning"
            chapterId={chapterId}
            lessonId={patternId}
            style={{
              background: 'var(--tech-card-bg)',
              border: '1px solid var(--tech-border)',
              height: '400px'
            }}
            bodyStyle={{
              padding: 0,
              height: 'calc(100% - 57px)'
            }}
          />

          {/* AI助教聊天框 */}
          <div style={{ marginTop: '16px' }}>
            {renderAIAssistantChat()}
          </div>

        </div>
      );
    } else if (selectedProblem) {
      // 题目练习模式的右侧栏
      const problem = getAllProblems().find(p => p.id === selectedProblem);

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 题目信息卡片 */}
          <Card
            className="tech-card"
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CodeOutlined style={{ color: 'var(--tech-accent)' }} />
                <span className="tech-title" style={{ fontSize: '14px' }}>题目信息</span>
              </div>
            }
            style={{
              background: 'var(--tech-card-bg)',
              border: '1px solid var(--tech-border)',
              minHeight: '200px'
            }}
            headStyle={{
              background: 'rgba(42, 45, 78, 0.8)',
              borderBottom: '1px solid var(--tech-border)',
              padding: '12px 16px'
            }}
            bodyStyle={{ padding: '16px' }}
          >
            <div>
              <div style={{
                color: 'var(--tech-primary)',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '8px'
              }}>
                {problem?.title}
              </div>
              <div style={{
                color: 'var(--tech-text-secondary)',
                fontSize: '13px',
                lineHeight: 1.6,
                marginBottom: '12px'
              }}>
                <div>难度: <Tag color={getDifficultyColor(problem?.difficulty)}>{problem?.difficulty}</Tag></div>
                <div style={{ marginTop: '8px' }}>
                  标签: {problem?.tags?.map(tag => (
                    <Tag key={tag} size="small" style={{ marginRight: '4px' }}>
                      {tag}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* AI功能按钮区域 - 题目练习专用 */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'center',
            padding: '16px',
            background: 'var(--tech-card-bg)',
            border: '1px solid var(--tech-border)',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 255, 255, 0.05)'
          }}>
            {/* AI Debug 按钮 */}
            <Button
              icon={<BugOutlined />}
              onClick={() => {
                console.log('AI Debug clicked in right panel');
              }}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: 'white',
                boxShadow: '0 8px 32px rgba(245, 158, 11, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                fontWeight: 600,
                height: '40px',
                width: '100%',
                borderRadius: '12px',
                fontSize: '14px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              AI代码调试
            </Button>

            {/* 代码提示 */}
            <Button
              icon={<FileTextOutlined />}
              onClick={() => {
                console.log('Code hints clicked');
              }}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: 'white',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                fontWeight: 600,
                height: '40px',
                width: '100%',
                borderRadius: '12px',
                fontSize: '14px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              代码提示
            </Button>

            {/* 解题思路 */}
            <Button
              icon={<BulbOutlined />}
              onClick={() => {
                console.log('Solution approach clicked');
              }}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: 'white',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                fontWeight: 600,
                height: '40px',
                width: '100%',
                borderRadius: '12px',
                fontSize: '14px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              解题思路
            </Button>
          </div>
        </div>
      );
    } else {
      // 默认右侧栏
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '200px',
          color: 'var(--tech-text-secondary)',
          background: 'var(--tech-card-bg)',
          border: '1px solid var(--tech-border)',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</div>
          <div style={{ fontSize: '14px', textAlign: 'center' }}>
            选择学习内容后，这里将显示相应的学习工具和辅助功能
          </div>
        </div>
      );
    }
  };

  return (
    <div className="tech-theme tech-background tech-grid" style={{
      padding: '16px',
      paddingBottom: '40px',
      minHeight: '100vh'
    }}>
      {/* 导航栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        padding: '12px 20px',
        background: 'rgba(26, 29, 62, 0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 212, 255, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/algorithm-learning')}
            style={{
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              color: '#00d4ff'
            }}
          >
            返回Hub
          </Button>
          <Title level={3} style={{ margin: 0, color: '#fff', textAlign: 'center', flex: 1 }}>
            {currentPattern.name}
          </Title>
        </div>

        <Space>
          <Tag color="blue">{currentPattern.chapterName}</Tag>

          {/* 侧边栏控制按钮 */}
          <Button
            icon={showLeftSidebar ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            onClick={() => setShowLeftSidebar(!showLeftSidebar)}
            style={{
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              color: '#00d4ff'
            }}
          >
            {showLeftSidebar ? '隐藏' : '显示'}题目
          </Button>

          <Button
            icon={showRightSidebar ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            onClick={() => setShowRightSidebar(!showRightSidebar)}
            style={{
              background: 'rgba(0, 212, 255, 0.1)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              color: '#00d4ff'
            }}
          >
            {showRightSidebar ? '隐藏' : '显示'}工具
          </Button>
        </Space>
      </div>

      {/* 主要布局容器 */}
      <div style={{
        display: 'flex',
        gap: '20px',
        padding: '0 4px'
      }}>
        {/* 左侧：学习阶段导航 (20%) */}
        {showLeftSidebar && (
          <div style={{ width: '20%', minWidth: '280px' }}>
            {renderLeftSidebar()}
          </div>
        )}

        {/* 中间：主要内容区域 */}
        <div style={{
          width: !showLeftSidebar && !showRightSidebar ? '100%'
               : !showLeftSidebar ? '75%'
               : !showRightSidebar ? '80%'
               : '55%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s ease'
        }}>
          <Card
            className="tech-card tech-fade-in"
            bodyStyle={{ padding: '24px' }}
            style={{
              background: 'rgba(26, 29, 62, 0.95)',
              border: '1px solid rgba(0, 212, 255, 0.2)'
            }}
            headStyle={{ background: 'transparent', border: 'none' }}
          >
            {renderMainContent()}
          </Card>
        </div>

        {/* 右侧：工具和AI助手 (25%) */}
        {showRightSidebar && (
          <div style={{ width: '25%', minWidth: '320px' }}>
            {renderRightSidebarContent()}
          </div>
        )}

        {/* 显示右侧栏按钮 */}
        {!showRightSidebar && (
          <Button
            type="primary"
            icon={<MenuOutlined />}
            onClick={() => setShowRightSidebar(true)}
            style={{
              position: 'fixed',
              top: '50%',
              right: '16px',
              transform: 'translateY(-50%)',
              zIndex: 100,
              background: 'linear-gradient(135deg, #00d4ff 0%, #0096cc 100%)',
              border: 'none'
            }}
          >
            工具栏
          </Button>
        )}
      </div>

    </div>
  );
};

export default AIInteractiveClassroom;