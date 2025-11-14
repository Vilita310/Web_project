import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Select
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
  PauseCircleOutlined,
  AudioOutlined
} from '@ant-design/icons';

import MiniCodeEditor from '../../components/features/MiniCodeEditor';
import AIBlackboard from '../../components/core/AIBlackboard';
import AIVoiceChat from '../../components/core/AIVoiceChat';
import { leetcode75Data } from '../../data/leetcode75Complete';
import { getEnhancedProblem, getEnhancedPattern } from '../../data/algorithms/AlgorithmContentAdapter';
import { aiChat, textToSpeech, playAudioFromBase64, aiTeacherLecture, getApiUrl } from '../../utils/aiApi';
import { useDataTranslation } from '../../hooks/useDataTranslation';
import { useTheme } from '../../contexts/ThemeContext';
import './codingLab.css';
import '../AlgorithmHub/lightTheme.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const AlgorithmInterviewMode = () => {
  const { t, i18n } = useTranslation(['learning', 'classroom']);
  const navigate = useNavigate();
  const { pattern, problemId } = useParams();
  const { translateProblem, translatePattern, translateDifficulty, translateTag, translateTags } = useDataTranslation();

  // 翻译hints内容
  const translateHint = useCallback((hint) => {
    const hintMappings = {
      "一个简单的实现是使用两层 for 循环，时间复杂度是 O(n²)": t('smartCodingLab.hints.bruteForceLoop'),
      "你可以使用哈希表将时间复杂度降低到 O(n)": t('smartCodingLab.hints.hashTableOptimization'),
      "当遍历到数字 x 时，检查哈希表中是否存在 target - x": t('smartCodingLab.hints.complementCheck')
    };
    return hintMappings[hint] || hint;
  }, [t]);

  const { isDarkTheme, getThemeClass } = useTheme();

  // 基础状态管理
  const [currentProblem, setCurrentProblem] = useState(null);
  const [currentPattern, setCurrentPattern] = useState(null);
  const [enhancedProblemData, setEnhancedProblemData] = useState(null);
  const [enhancedPatternData, setEnhancedPatternData] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [userCode, setUserCode] = useState('');

  // 编辑器相关状态
  const editorRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [showHints, setShowHints] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiTeacherStatus, setAiTeacherStatus] = useState('idle');
  const [ttsProgress, setTtsProgress] = useState(0);

  // AI黑板状态
  const [drawingData, setDrawingData] = useState(null);
  const [voiceChatStates, setVoiceChatStates] = useState({
    isRecording: false,
    isThinking: false,
    isSpeaking: false
  });

  // 页面状态管理
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // AI教师聊天
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: t('smartCodingLab.aiTeacher.greeting'),
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  // 面试评估
  const [interviewEvaluation, setInterviewEvaluation] = useState(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // 代码示例 - 默认隐藏
  const [showCodeExamples, setShowCodeExamples] = useState(false);

  // AI黑板 - 默认隐藏
  const [showAIBlackboard, setShowAIBlackboard] = useState(false);

  // AI教师语音
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [ttsGenerating, setTtsGenerating] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // 面试模式
  const [interviewMode] = useState(true); // 永远为true，因为这是专门的面试页面
  const [interviewState, setInterviewState] = useState({
    isActive: false,
    startTime: null,
    duration: 1800, // 30分钟 (秒)
    timeRemaining: 1800,
    phase: 'preparation', // preparation, active, paused, completed
    score: 0,
    feedback: [],
    questions: [],
    currentQuestionIndex: 0
  });

  // 语音面试聊天
  const [voiceInterviewVisible, setVoiceInterviewVisible] = useState(false);

  // 面试对话相关状态
  const [interviewMessages, setInterviewMessages] = useState([
    {
      id: 1,
      type: 'interviewer',
      content: `👋 ${t('smartCodingLab.interviewer.greeting')}`,
      timestamp: new Date().toLocaleTimeString()
    },
    {
      id: 2,
      type: 'interviewer',
      content: `🎯 ${t('smartCodingLab.interviewer.todayTopic', { title: translateProblem(currentProblem?.id) || t('smartCodingLab.ui.algorithmTopic') })}`,
      timestamp: new Date().toLocaleTimeString()
    },
    {
      id: 3,
      type: 'interviewer',
      content: `💭 ${t('smartCodingLab.interviewer.startPrompt')}`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [interviewInput, setInterviewInput] = useState('');

  // 语音识别
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeakingInInterview, setIsAiSpeakingInInterview] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [recognitionHealthCheck, setRecognitionHealthCheck] = useState(null);

  // 翻译函数
  const translateProblemDescription = useCallback((problemId) => {
    if (problemId === 1 || problemId === "1") {
      return t('smartCodingLab.problemDescriptions.twoSum');
    }
    return currentProblem?.description || '';
  }, [t, currentProblem]);

  const translateExample = useCallback((exampleData, exampleIndex) => {
    if (currentProblem?.id === 1 || currentProblem?.id === "1") {
      const exampleKey = `example${exampleIndex + 1}`;
      return {
        input: t(`smartCodingLab.problemExamples.twoSum.${exampleKey}.input`),
        output: t(`smartCodingLab.problemExamples.twoSum.${exampleKey}.output`),
        explanation: t(`smartCodingLab.problemExamples.twoSum.${exampleKey}.explanation`)
      };
    }
    return exampleData;
  }, [t, currentProblem]);

  const translateTestCaseDescription = useCallback((description, caseIndex) => {
    if (currentProblem?.id === 1 || currentProblem?.id === "1") {
      const caseKey = `case${caseIndex + 1}`;
      return t(`smartCodingLab.testCaseDescriptions.twoSum.${caseKey}`);
    }
    return description;
  }, [t, currentProblem]);

  const translateConstraint = useCallback((constraint, constraintIndex) => {
    if (currentProblem?.id === 1 || currentProblem?.id === "1") {
      const constraintKey = `constraint${constraintIndex + 1}`;
      return t(`smartCodingLab.constraints.twoSum.${constraintKey}`);
    }
    return constraint;
  }, [t, currentProblem]);

  const translateRelatedTags = useCallback(() => {
    if (currentProblem?.id === 1 || currentProblem?.id === "1") {
      const tags = t(`smartCodingLab.relatedTags.twoSum`, { returnObjects: true });
      return Array.isArray(tags) ? tags : [];
    }
    return currentProblem?.tags || [];
  }, [t, currentProblem]);

  // 获取当前的AI教师topics
  const getCurrentTopics = () => {
    // 检查是否是课程路径
    if (pattern && pattern.includes('-')) {
      // 课程相关topics
      return [
        { title: t('smartCodingLab.topics.whatIsReact'), id: 'what-is-react' },
        { title: t('smartCodingLab.topics.componentDevelopment'), id: 'components' },
        { title: t('smartCodingLab.topics.virtualDOM'), id: 'virtual-dom' },
        { title: t('smartCodingLab.topics.jsxSyntax'), id: 'jsx-syntax' }
      ];
    }

    if (currentProblem?.aiTeacher?.topics) {
      return currentProblem.aiTeacher.topics;
    }
    // 默认算法题topics
    return [
      { title: t('smartCodingLab.topics.problemReading'), id: 'problem' },
      { title: t('smartCodingLab.topics.thoughtAnalysis'), id: 'analysis' },
      { title: t('smartCodingLab.topics.complexityAnalysis'), id: 'complexity' },
      { title: t('smartCodingLab.topics.followUpQuestions'), id: 'questions' }
    ];
  };

  // 查找问题数据 - 支持智能重定向
  const findProblemData = (patternId, probId) => {
    // 首先尝试按模式ID查找
    for (const [chapterId, chapter] of Object.entries(leetcode75Data)) {
      const foundPattern = chapter.patterns.find(p => p.id === patternId);
      if (foundPattern) {
        const problem = foundPattern.problems.find(p => p.id === parseInt(probId));
        if (problem) {
          return {
            problem,
            pattern: foundPattern,
            chapter
          };
        }
      }
    }

    // 如果没找到，可能是使用了章节ID，尝试智能重定向
    if (leetcode75Data[patternId]) {
      // patternId实际上是chapterId，查找该章节下指定ID的题目
      const chapter = leetcode75Data[patternId];
      for (const pattern of chapter.patterns) {
        const problem = pattern.problems.find(p => p.id === parseInt(probId));
        if (problem) {
          // 自动重定向到正确的URL
          navigate(`/algorithm-learning/interview/${pattern.id}/${probId}`, { replace: true });
          return {
            problem,
            pattern,
            chapter
          };
        }
      }
    }

    return null;
  };

  // 获取默认代码模板
  const getDefaultTemplate = (language) => {
    const templates = {
      python: `def solution():\n    # ${t('smartCodingLab.codeTemplate.writeCodeHere')}\n    pass\n\n# ${t('smartCodingLab.codeTemplate.testCase')}\nif __name__ == "__main__":\n    print(solution())`,
      javascript: `function solution() {\n    // ${t('smartCodingLab.codeTemplate.writeCodeHere')}\n    \n}\n\n// ${t('smartCodingLab.codeTemplate.testCase')}\nconsole.log(solution());`,
      java: `public class Solution {\n    public void solution() {\n        // ${t('smartCodingLab.codeTemplate.writeCodeHere')}\n        \n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solution() {\n        // ${t('smartCodingLab.codeTemplate.writeCodeHere')}\n        \n    }\n};`
    };
    return templates[language] || templates.python;
  };

  // 添加AI消息
  const addAIMessage = (content, type = 'info') => {
    const message = {
      id: Date.now(),
      type: 'ai',
      content,
      timestamp: new Date().toLocaleTimeString(),
      messageType: type
    };
    setAiMessages(prev => [...prev, message]);
  };

  // 加载问题数据
  useEffect(() => {
    const loadProblemData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (pattern && problemId) {
          // 原有算法题数据加载逻辑
          const problemData = findProblemData(pattern, problemId);
          if (problemData) {
            setCurrentProblem(problemData.problem);
            setCurrentPattern(problemData.pattern);

            // 初始化代码模板 - 优先使用新的函数模板
            const functionTemplate = problemData.problem.functionInfo?.[selectedLanguage]?.template;
            const fallbackTemplate = problemData.problem.template?.[selectedLanguage];
            const template = functionTemplate || fallbackTemplate || getDefaultTemplate(selectedLanguage);
            setUserCode(template);

            // 异步加载增强内容
            const loadEnhancedContent = async () => {
              try {
                const [enhancedProblem, enhancedPattern] = await Promise.all([
                  getEnhancedProblem(parseInt(problemId)),
                  getEnhancedPattern(pattern)
                ]);

                setEnhancedProblemData(enhancedProblem);
                setEnhancedPatternData(enhancedPattern);

                console.log('🚀 Enhanced content loaded:', {
                  problem: enhancedProblem,
                  pattern: enhancedPattern
                });

                // 加载完成后更新AI欢迎消息
                if (enhancedProblem?._enhanced) {
                  addAIMessage(`🚀 ${t('smartCodingLab.loading.enhancedContent', { title: enhancedProblem.title })}`);
                }
              } catch (enhancedError) {
                console.warn('Enhanced content loading failed, using basic data:', enhancedError);
              }
            };

            // 先添加基础欢迎消息
            addAIMessage(t('smartCodingLab.loading.welcomeMessage', { title: problemData.problem.title, difficulty: problemData.problem.difficulty, pattern: problemData.pattern.name }));

            // 异步加载增强内容
            loadEnhancedContent();
          } else {
            setError(t('smartCodingLab.loading.problemNotFound', { pattern, problemId }));
          }
        } else {
          setError(t('smartCodingLab.loading.missingParams'));
        }
      } catch (err) {
        setError(t('smartCodingLab.loading.loadFailed', { message: err.message }));
      } finally {
        setLoading(false);
      }
    };

    loadProblemData();
  }, [pattern, problemId]);

  // 处理语言切换
  useEffect(() => {
    if (currentProblem) {
      // 优先使用新的函数模板
      const functionTemplate = currentProblem.functionInfo?.[selectedLanguage]?.template;
      const fallbackTemplate = currentProblem.template?.[selectedLanguage];
      const getDefaultTemplate = (language) => {
        const templates = {
          python: `def solution():\n    # ${t('smartCodingLab.codeTemplate.writeCodeHere')}\n    pass\n\n# ${t('smartCodingLab.codeTemplate.testCase')}\nif __name__ == "__main__":\n    print(solution())`,
          javascript: `function solution() {\n    // ${t('smartCodingLab.codeTemplate.writeCodeHere')}\n    \n}\n\n// ${t('smartCodingLab.codeTemplate.testCase')}\nconsole.log(solution());`,
          java: `public class Solution {\n    public void solution() {\n        // ${t('smartCodingLab.codeTemplate.writeCodeHere')}\n        \n    }\n}`,
          cpp: `#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solution() {\n        // ${t('smartCodingLab.codeTemplate.writeCodeHere')}\n        \n    }\n};`
        };
        return templates[language] || templates.python;
      };
      const template = functionTemplate || fallbackTemplate || getDefaultTemplate(selectedLanguage);
      setUserCode(template);
    }
  }, [selectedLanguage, currentProblem, t]);

  // 开始面试
  const startInterview = useCallback(() => {
    setInterviewState(prev => ({
      ...prev,
      isActive: true,
      phase: 'active',
      startTime: Date.now(),
      timeRemaining: prev.duration
    }));

    // 初始化面试对话
    const welcomeMessage = {
      id: 1,
      type: 'interviewer',
      content: `${t('smartCodingLab.interviewer.greeting')} 今天我们来做一道题目：${translateProblem(currentProblem?.id)}`,
      timestamp: new Date().toLocaleTimeString()
    };

    setInterviewMessages([welcomeMessage]);

    // 初始化语音识别
    initializeVoiceRecognition();

    // 播放欢迎语音
    playAIResponseSpeech(welcomeMessage.content);
  }, [t, translateProblem, currentProblem]);

  // 初始化语音识别
  const initializeVoiceRecognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognitionInstance = new window.webkitSpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'zh-CN';

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[event.resultIndex][0].transcript;
        console.log('Voice recognition result:', transcript);
        sendVoiceMessage(transcript);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        console.log('Speech recognition ended');
        if (interviewState.isActive && !isAiSpeakingInInterview) {
          // 自动重启语音识别
          setTimeout(() => {
            try {
              recognitionInstance.start();
              setIsListening(true);
            } catch (e) {
              console.log('Failed to restart recognition:', e);
            }
          }, 1000);
        } else {
          setIsListening(false);
        }
      };

      setRecognition(recognitionInstance);

      // 启动语音识别
      try {
        recognitionInstance.start();
        setIsListening(true);
        console.log('Speech recognition started');
      } catch (e) {
        console.error('Failed to start speech recognition:', e);
        message.warning(t('smartCodingLab.voiceRecognition.browserNotSupported'));
      }

      // 健康检查
      const healthCheckInterval = setInterval(() => {
        if (interviewState.isActive && !isAiSpeakingInInterview) {
          const currentState = recognitionInstance.recognition?.state;
          if (currentState !== 'started' && !isListening) {
            console.log('♥️ 语音识别健康检查：尝试重启');
            try {
              recognitionInstance.start();
              setIsListening(true);
              console.log('✅ 心跳检查：语音识别重启成功');
            } catch (e) {
              if (e.message.includes('already started')) {
                setIsListening(true);
                console.log('✅ 心跳检查：语音识别已在运行');
              } else {
                console.error('❌ 心跳检查：重启失败', e);
              }
            }
          } else {
            console.log('💗 心跳检查：语音识别正常运行');
          }
        }
      }, 10000); // 每10秒检查一次

      setRecognitionHealthCheck(healthCheckInterval);
    } else {
      console.error('浏览器不支持语音识别');
      message.warning(t('smartCodingLab.voiceRecognition.browserNotSupported'));
    }

    // 清理函数
    return () => {
      if (recognitionHealthCheck) {
        clearInterval(recognitionHealthCheck);
        console.log('清理语音识别健康检查定时器');
      }
    };
  }, [interviewState.isActive, isAiSpeakingInInterview, isListening, t, recognitionHealthCheck]);

  // 结束面试
  const endInterview = useCallback(() => {
    setInterviewState(prev => ({
      ...prev,
      isActive: false,
      phase: 'completed'
    }));

    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }

    if (recognitionHealthCheck) {
      clearInterval(recognitionHealthCheck);
    }
  }, [recognition, recognitionHealthCheck]);

  // 暂停/继续面试
  const toggleInterviewPause = useCallback(() => {
    setInterviewState(prev => ({
      ...prev,
      isActive: !prev.isActive
    }));
  }, []);

  // 发送语音识别结果到面试系统
  const sendVoiceMessage = async (transcript) => {
    console.log('sendVoiceMessage 被调用，语音内容:', transcript);
    if (!transcript?.trim()) {
      console.log('语音内容为空，返回');
      return;
    }

    const userMessage = {
      id: interviewMessages.length + 1,
      type: 'candidate',
      content: transcript.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setInterviewMessages(prev => [...prev, userMessage]);
    const userInput = transcript.trim();

    // 显示AI正在思考的状态
    const thinkingMessage = {
      id: interviewMessages.length + 2,
      type: 'interviewer',
      content: `🤔 ${t('smartCodingLab.interviewer.thinking')}`,
      timestamp: new Date().toLocaleTimeString(),
      isLoading: true
    };
    setInterviewMessages(prev => [...prev, thinkingMessage]);

    try {
      // 构建面试上下文
      const problemTitle = translateProblem(currentProblem?.id) || t('smartCodingLab.ui.twoSum');
      const problemDescription = enhancedProblemData?.description || currentProblem?.description || t('smartCodingLab.ui.targetDescription');

      // 获取对话历史上下文
      const conversationHistory = interviewMessages.filter(msg => !msg.isLoading).slice(-6); // 最近3轮对话
      const historyContext = conversationHistory.map(msg =>
        `${msg.type === 'candidate' ? t('smartCodingLab.codeTemplate.candidate') : t('smartCodingLab.codeTemplate.interviewer')}: ${msg.content}`
      ).join('\n');

      // 构建AI面试官提示词
      const interviewPrompt = `你是一名专业的技术面试官。

面试题目：${problemTitle}
题目描述：${problemDescription}

对话记录：
${historyContext}
候选人最新回答：${userInput}

面试要求：
1. 以专业面试官的身份与候选人交流
2. 适当引导候选人分析问题、设计算法
3. 在候选人回答后提出适当的follow-up问题
4. 保持专业和友好的语调
5. 回复长度保持在20-30字左右

请给出你的面试回复：`;

      const response = await aiChat(interviewPrompt, {
        context: 'interview_main_conversation',
        maxLength: 100
      });

      // 清理AI回复内容，去掉"面试官:"等前缀
      const cleanResponse = cleanAIResponse(response);

      // 移除正在思考的消息
      setInterviewMessages(prev => prev.filter(msg => !msg.isLoading));

      // 添加AI回复消息
      const aiMessage = {
        id: Date.now(),
        type: 'interviewer',
        content: cleanResponse,
        timestamp: new Date().toLocaleTimeString()
      };

      setInterviewMessages(prev => [...prev, aiMessage]);

      // 播放语音
      if (cleanResponse) {
        await playAIResponseSpeech(cleanResponse);
      }

    } catch (error) {
      console.error('面试AI回复失败:', error);

      // 移除加载消息
      setInterviewMessages(prev => prev.filter(msg => !msg.isLoading));

      // 添加错误消息
      const errorMessage = {
        id: Date.now(),
        type: 'interviewer',
        content: `❗ 抱歉，面试系统出现了问题，请稍后重试。错误信息：${error.message}`,
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };

      setInterviewMessages(prev => [...prev, errorMessage]);
    }
  };

  // 清理AI回复内容，去掉"面试官:"等前缀
  const cleanAIResponse = (content) => {
    if (!content) return content;

    // 去掉各种可能的面试官前缀
    const prefixes = [
      /^面试官[：:]/,
      /^AI面试官[：:]/,
      /^面试官\s+/,
      /^AI面试官\s+/,
      /^Interviewer[：:]\s*/i,
      /^AI[：:]\s*/
    ];

    let cleaned = content;
    for (const prefix of prefixes) {
      cleaned = cleaned.replace(prefix, '');
    }

    return cleaned.trim();
  };

  // AI语音播放功能（带语音识别控制）
  const playAIResponseSpeech = async (text) => {
    console.log('🎵 开始AI语音播放控制:', text.substring(0, 50));

    // 1. 设置AI说话状态
    setIsAiSpeakingInInterview(true);

    // 2. 暂停语音识别
    if (recognition && isListening) {
      try {
        recognition.stop();
        setIsListening(false);
        console.log('🛑 playAIResponseSpeech: 已暂停语音识别');
      } catch (e) {
        console.warn('暂停语音识别失败:', e);
      }
    }

    try {
      // 3. 调用TTS API
      const response = await fetch(getApiUrl('/ai/tts'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: 'alloy',
          model: 'tts-1',
          language: 'zh-CN'
        })
      });

      if (!response.ok) {
        throw new Error('TTS请求失败');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // 4. 播放音频
      const audioBase64 = data.audio_base64;
      const audioBlob = new Blob([
        Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))
      ], { type: 'audio/mpeg' });

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setIsAiSpeakingInInterview(false);
        URL.revokeObjectURL(audioUrl);
        console.log('🔊 AI语音播放结束');
        // 重启语音识别
        restartVoiceRecognition();
      };

      audio.onerror = () => {
        setIsAiSpeakingInInterview(false);
        URL.revokeObjectURL(audioUrl);
        console.error('音频播放失败');
        // 重启语音识别
        restartVoiceRecognition();
      };

      await audio.play();
    } catch (error) {
      console.error('TTS播放失败:', error);
      setIsAiSpeakingInInterview(false);
      // 重启语音识别
      restartVoiceRecognition();
    }
  };

  // 重启语音识别
  const restartVoiceRecognition = useCallback(() => {
    if (interviewState.isActive && recognition && !isAiSpeakingInInterview) {
      setTimeout(() => {
        try {
          recognition.start();
          setIsListening(true);
          console.log('✅ AI语音结束后重启语音识别成功');
        } catch (e) {
          if (e.message.includes('already started')) {
            setIsListening(true);
            console.log('✅ 语音识别已在运行');
          } else {
            console.error('❌ 重启语音识别失败:', e);
          }
        }
      }, 1000);
    }
  }, [interviewState.isActive, recognition, isAiSpeakingInInterview]);

  // 格式化时间
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 面试计时器效果
  useEffect(() => {
    let timer;
    if (interviewMode && interviewState.isActive && interviewState.timeRemaining > 0) {
      timer = setInterval(() => {
        setInterviewState(prev => {
          const newTimeRemaining = prev.timeRemaining - 1;
          if (newTimeRemaining <= 0) {
            // 时间到，自动结束面试
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
  }, [interviewMode, interviewState.isActive, interviewState.timeRemaining]);

  // 代码提交处理 - 先问follow-up问题
  const evaluateInterviewSubmission = async (code, testResults, interviewHistory) => {
    try {
      const problemTitle = translateProblem(currentProblem?.id) || t('smartCodingLab.ui.twoSum');
      const passRate = Math.round((testResults.filter(t => t.passed).length / testResults.length) * 100);

      // 显示AI正在思考follow-up问题的状态
      const thinkingMessage = {
        id: interviewMessages.length + 1,
        type: 'interviewer',
        content: '🤔 AI面试官正在分析你的代码...',
        timestamp: new Date().toLocaleTimeString(),
        isLoading: true
      };

      setInterviewMessages(prev => [...prev, thinkingMessage]);

      // 基于测试结果生成follow-up问题
      const followUpPrompt = `作为技术面试官，候选人刚刚完成了《${problemTitle}》的代码实现。

代码：
${code}

测试通过率：${passRate}%

现在请提出一个follow-up问题来深入了解候选人的算法思维，请从以下方面选择：
1. 算法复杂度分析（时间/空间复杂度）
2. 代码优化可能性
3. 边界情况处理
4. 其他解法探讨
5. 实际场景应用

面试官要求：简洁专业，不超过20字，一次只问一个深入问题：`;

      const followUpResponse = await aiChat(followUpPrompt, {
        context: `interview_followup_code`,
        maxLength: 50
      });

      // 移除加载状态消息
      setInterviewMessages(prev => prev.filter(msg => !msg.isLoading));

      // 添加follow-up问题消息
      const followUpMessage = {
        id: Date.now(),
        type: 'interviewer',
        content: followUpResponse,
        timestamp: new Date().toLocaleTimeString(),
        isFollowUp: true
      };

      setInterviewMessages(prev => [...prev, followUpMessage]);

      // 播放follow-up问题语音
      await playAIResponseSpeech(followUpResponse);

    } catch (error) {
      console.error('生成follow-up问题失败:', error);

      // 移除加载消息
      setInterviewMessages(prev => prev.filter(msg => !msg.isLoading));

      const errorMessage = {
        id: Date.now(),
        type: 'interviewer',
        content: '代码提交成功！请继续回答其他问题。',
        timestamp: new Date().toLocaleTimeString()
      };

      setInterviewMessages(prev => [...prev, errorMessage]);
    }
  };

  // 代码提交处理
  const handleSubmitCode = async (code) => {
    console.log('Submitted code:', code);

    if (interviewState.isActive) {
      // 面试模式下的特殊处理
      const feedback = `看起来你已经提交了代码。让我来检查一下你的解决方案...`;
      const assistantMessage = {
        id: Date.now(),
        type: 'interviewer',
        content: feedback,
        timestamp: new Date().toLocaleTimeString(),
        isTyping: false
      };
      setInterviewMessages(prev => [...prev, assistantMessage]);

      await playAIResponseSpeech(feedback);

      // 模拟测试结果并进行面试评估
      const mockTestResults = [
        { passed: true, input: 'test1', expected: 'result1', actual: 'result1' },
        { passed: true, input: 'test2', expected: 'result2', actual: 'result2' }
      ];

      // 延迟后进行follow-up评估
      setTimeout(() => {
        evaluateInterviewSubmission(code, mockTestResults, interviewMessages);
      }, 2000);
    }
  };

  // AI教师话题处理
  const handleAITeacherTopic = async (topic) => {
    try {
      // 保存当前滚动位置
      const currentScrollY = window.scrollY;

      setAiThinking(true);
      setAiTeacherStatus('thinking');

      const problemTitle = translateProblem(currentProblem?.id) || t('smartCodingLab.ui.twoSum');
      const problemDescription = enhancedProblemData?.description || currentProblem?.description || t('smartCodingLab.ui.targetDescription');

      const teachingPrompt = `作为算法教师，请讲解《${problemTitle}》中关于"${topic.title}"的内容。

题目描述：${problemDescription}

请用通俗易懂的方式讲解，控制在100字以内。`;

      const response = await aiTeacherLecture(teachingPrompt, {
        context: `teaching_${topic.id}`,
        maxLength: 100
      });

      addAIMessage(`📚 ${topic.title}：${response}`, 'teaching');

      // 播放语音
      if (response) {
        await playTeacherSpeech(response);
      }
    } catch (error) {
      console.error('AI教师讲解失败:', error);
      addAIMessage(`❌ 讲解失败，请稍后重试。`, 'error');
    } finally {
      setAiThinking(false);
      setAiTeacherStatus('idle');
      // 恢复滚动位置
      setTimeout(() => {
        window.scrollTo(0, currentScrollY);
      }, 100);
    }
  };

  // AI教师聊天处理
  const handleAITeacherChat = async (message) => {
    try {
      setVoiceChatStates(prev => ({ ...prev, isThinking: true }));

      const problemTitle = translateProblem(currentProblem?.id) || t('smartCodingLab.ui.twoSum');
      const chatPrompt = `作为算法教师，学生问：${message}

当前题目是《${problemTitle}》。请简洁回答学生的问题，控制在50字以内。`;

      const response = await aiChat(chatPrompt, {
        context: 'teacher_chat',
        maxLength: 50
      });

      addAIMessage(`💬 ${response}`, 'chat');

      // 播放语音
      if (response) {
        await playTeacherSpeech(response);
      }
    } catch (error) {
      console.error('AI教师聊天失败:', error);
      addAIMessage(`❌ 聊天失败，请稍后重试。`, 'error');
    } finally {
      setVoiceChatStates(prev => ({ ...prev, isThinking: false }));
    }
  };

  // 播放教师语音
  const playTeacherSpeech = async (text) => {
    try {
      setIsAiSpeaking(true);
      setVoiceChatStates(prev => ({ ...prev, isSpeaking: true }));

      const response = await textToSpeech(text, {
        voice: 'alloy',
        model: 'tts-1'
      });

      if (response.audio_base64) {
        await playAudioFromBase64(response.audio_base64);
      }
    } catch (error) {
      console.error('语音播放失败:', error);
    } finally {
      setIsAiSpeaking(false);
      setVoiceChatStates(prev => ({ ...prev, isSpeaking: false }));
    }
  };

  // 返回算法学习页面
  const goBackToLearning = () => {
    // 在导航前重置滚动位置
    window.scrollTo(0, 0);
    navigate(`/algorithm-learning/coding/${pattern}/${problemId}`);
  };

  // 渲染左侧题目描述
  const renderProblemDescriptionSidebar = () => {
    const difficultyColors = {
      [t('smartCodingLab.difficulty.easy')]: 'var(--tech-accent)',
      [t('smartCodingLab.difficulty.medium')]: 'var(--tech-primary)',
      [t('smartCodingLab.difficulty.hard')]: 'var(--tech-secondary)'
    };

    // 完全使用动态数据，基础数据只提供标题和难度
    const displayData = enhancedProblemData || {};
    const isEnhanced = enhancedProblemData?._enhanced;
    const basicData = currentProblem || {};

    return (
      <Card
        className="tech-card"
        title={
          <span className="tech-title" style={{ fontSize: '16px', color: 'var(--tech-primary)' }}>
{translateProblem(currentProblem?.id) || '两数之和'}
          </span>
        }
        bodyStyle={{ padding: '16px 12px', background: 'var(--tech-card-bg)' }}
        style={{ height: '100%', background: 'var(--tech-card-bg)', border: '1px solid var(--tech-border)', boxShadow: '0 2px 8px rgba(160, 120, 59, 0.1)' }}
      >
        {/* 题目标题和难度 */}
        <div style={{ marginBottom: '20px' }}>
          {displayData?.estimatedTime && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Text style={{ color: 'var(--tech-text-secondary)', fontSize: '12px' }}>
                {displayData.estimatedTime}
              </Text>
            </div>
          )}
        </div>

        {/* 题目描述 */}
        <div style={{ marginBottom: '20px' }}>
          <Text strong style={{ color: 'var(--tech-primary)', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
            {t('smartCodingLab.ui.problemDescription')}
          </Text>
          <Paragraph style={{
            color: 'var(--tech-text-secondary)',
            fontSize: '13px',
            lineHeight: 1.6,
            margin: 0,
            background: 'var(--tech-code-bg)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid var(--tech-border)'
          }}>
            {translateProblemDescription(currentProblem?.id) || t('smartCodingLab.ui.loadingProblemInfo')}
          </Paragraph>
        </div>

        {/* 示例 */}
        <div style={{ marginBottom: '20px' }}>
          <Text strong style={{ color: 'var(--tech-primary)', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
            {t('smartCodingLab.ui.examples')}
          </Text>
          {displayData?.examples?.length > 0 ?
            displayData.examples.slice(0, 2).map((example, index) => {
              const translatedExample = translateExample(example, index);
              return (
              <div key={index} style={{
                background: 'var(--tech-code-bg)',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--tech-border)',
                fontSize: '12px',
                fontFamily: 'monospace',
                marginBottom: '8px'
              }}>
                <div style={{ marginBottom: '6px' }}>
                  <Text style={{ color: 'var(--tech-primary)', fontWeight: 'bold' }}>{t('smartCodingLab.ui.input')}:</Text>
                  <Text style={{ color: 'var(--tech-text-secondary)' }}> {translatedExample.input}</Text>
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <Text style={{ color: 'var(--tech-accent)', fontWeight: 'bold' }}>{t('smartCodingLab.ui.output')}:</Text>
                  <Text style={{ color: 'var(--tech-text-secondary)' }}> {translatedExample.output}</Text>
                </div>
                {translatedExample.explanation && (
                  <div>
                    <Text style={{ color: 'var(--tech-secondary)', fontWeight: 'bold' }}>{t('smartCodingLab.ui.explanation')}:</Text>
                    <Text style={{ color: 'var(--tech-text-secondary)' }}> {translatedExample.explanation}</Text>
                  </div>
                )}
              </div>
            )})
          :
            <div style={{
              background: 'var(--tech-code-bg)',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid var(--tech-border)',
              fontSize: '12px'
            }}>
              <Text style={{ color: 'var(--tech-text-secondary)' }}>
                {t('smartCodingLab.ui.loadingExamples')}
              </Text>
            </div>
          }
        </div>

        {/* 提示 */}
        <div style={{ marginBottom: '20px' }}>
          <Text strong style={{ color: 'var(--tech-primary)', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
            {t('smartCodingLab.ui.solutionHints')}
          </Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(displayData?.hints || [t('smartCodingLab.ui.loading')]).slice(0, 3).map((hint, index) => (
              <div key={index} style={{
                background: 'var(--tech-code-bg)',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--tech-border)',
                fontSize: '12px'
              }}>
                <Text style={{ color: 'var(--tech-text-secondary)' }}>
                  {index + 1}. {translateHint(hint)}
                </Text>
              </div>
            ))}
          </div>
        </div>

        {/* 约束条件 */}
        {displayData?.constraints?.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <Text strong style={{ color: 'var(--tech-primary)', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              {t('smartCodingLab.ui.constraints')}
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {displayData.constraints.map((constraint, index) => (
                <div key={index} style={{
                  background: 'var(--tech-code-bg)',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  fontSize: '11px'
                }}>
                  <Text style={{ color: 'var(--tech-text-secondary)' }}>
                    {translateConstraint(constraint, index)}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 标签 */}
        <div>
          <Text strong style={{ color: 'var(--tech-primary)', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
            {t('smartCodingLab.ui.relatedTags')}
          </Text>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(translateRelatedTags() || translateTags(displayData?.tags || basicData?.tags) || [t('smartCodingLab.tags.algorithm'), t('smartCodingLab.tags.dataStructure')]).map((tag, index) => (
              <Tag key={index} size="small" style={{ fontSize: '11px', background: 'var(--tech-secondary)', color: 'white', border: 'none' }}>
                {tag}
              </Tag>
            ))}
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div style={{
        background: isDarkTheme
          ? 'linear-gradient(135deg, #0a0e27 0%, #1a1d3e 50%, #2a2d4e 100%)'
          : '#F5F1E8',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>{t('smartCodingLab.loading.problem')}</p>
      </div>
    );
  }

  // 处理错误状态
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Alert
          message={t('smartCodingLab.loading.failed')}
          description={error}
          type="error"
          showIcon
          action={
            <Space>
              <Button size="small" onClick={() => navigate('/algorithm-learning')}>
                {t('smartCodingLab.ui.returnToProblemBank')}
              </Button>
              <Button size="small" type="primary" onClick={() => window.location.reload()}>
                重新加载
              </Button>
            </Space>
          }
        />
      </div>
    );
  }

  // 检查数据完整性
  if (!currentProblem || !currentPattern) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Alert
          message={t('smartCodingLab.error.dataMissing')}
          description={t('smartCodingLab.error.loadingFailed')}
          type="warning"
          showIcon
          action={
            <Button type="primary" onClick={() => navigate('/algorithm-learning')}>
              {t('smartCodingLab.ui.returnToProblemBank')}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{
      background: isDarkTheme ? '#1a1d3e' : '#F5F1E8',
      minHeight: '100vh',
      height: '100%',
      padding: '20px',
      paddingBottom: '40px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'auto'
    }}>
      {/* 顶部返回按钮 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={goBackToLearning}
          style={{
            background: 'transparent',
            border: '1px solid var(--tech-border)',
            color: 'var(--tech-text-primary)'
          }}
        >
          {t('learning.backToLearning')}
        </Button>
      </div>

      {/* 面试模式控制器 - 完全复制自SmartCodingLab */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        background: isDarkTheme
          ? 'rgba(255, 255, 255, 0.03)'
          : 'rgba(255, 255, 255, 0.7)',
        borderRadius: '12px',
        marginTop: '40px',
        marginBottom: '20px',
        border: isDarkTheme
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid var(--tech-control-panel-border)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px var(--tech-control-panel-shadow)'
      }}>
        {/* 左侧：面试状态和控制按钮 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {interviewState.phase === 'preparation' && (
              <Button
                type="primary"
                onClick={startInterview}
                style={{
                  background: isDarkTheme
                    ? 'linear-gradient(135deg, #1890ff, #40a9ff)' // 深色主题用蓝色
                    : 'linear-gradient(135deg, #fa8c16, #fa541c)', // 浅色主题用橙色
                  border: 'none',
                  color: 'white',
                  marginLeft: '8px',
                  boxShadow: isDarkTheme
                    ? '0 4px 12px rgba(24, 144, 255, 0.4)' // 蓝色发光
                    : '0 2px 8px rgba(250, 140, 22, 0.4)', // 橙色发光
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '16px',
                  padding: '8px 16px',
                  height: 'auto'
                }}
              >
{(i18n.language === 'zh-CN' || i18n.language === 'zh') ? '开始面试' : 'Start Interview'}
              </Button>
            )}

            {(interviewState.phase === 'active' || interviewState.phase === 'paused') && (
              <Button
                size="small"
                onClick={toggleInterviewPause}
                style={{
                  background: interviewState.isActive
                    ? 'linear-gradient(135deg, var(--tech-accent), var(--tech-secondary))'
                    : 'linear-gradient(135deg, var(--tech-primary), var(--tech-secondary))',
                  border: 'none',
                  color: 'white',
                  marginLeft: '8px'
                }}
              >
                {interviewState.isActive ? t('smartCodingLab.interview.pause') : t('smartCodingLab.interview.continue')}
              </Button>
            )}

          </div>

          {/* 右侧：计时器和退出按钮 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {/* 计时器显示 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: interviewState.timeRemaining <= 300
                ? 'linear-gradient(135deg, rgba(255, 77, 79, 0.2), rgba(255, 107, 107, 0.2))'
                : 'linear-gradient(135deg, var(--tech-orange-bg), var(--tech-warm-bg))',
              border: `1px solid ${interviewState.timeRemaining <= 300 ? 'rgba(255, 77, 79, 0.5)' : 'var(--tech-orange-border)'}`,
              borderRadius: '8px'
            }}>
              <ClockCircleOutlined style={{
                color: interviewState.timeRemaining <= 300 ? '#ff4d4f' : 'var(--tech-primary)',
                fontSize: '16px'
              }} />
              <span style={{
                color: interviewState.timeRemaining <= 300 ? '#ff4d4f' : 'var(--tech-primary)',
                fontWeight: 600,
                fontSize: '16px',
                fontFamily: 'monospace'
              }}>
                {formatTime(interviewState.timeRemaining)}
              </span>
            </div>
          </div>
        </div>

        <div></div>
      </div>

      {/* 面试模式布局 - 三栏布局（完全复制自SmartCodingLab） */}
      <Row gutter={16} style={{ height: 'calc(100vh - 180px)' }}>
        {/* 左侧：题目描述 */}
        <Col span={6} style={{ minWidth: 0, overflow: 'hidden' }}>
          {renderProblemDescriptionSidebar()}
        </Col>

        {/* 中间：代码编辑器 */}
        <Col span={12} style={{ minWidth: 0, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* 代码编辑器区域 */}
            <Card
              className="tech-card"
              style={{
                flex: '1 1 auto',
                background: 'var(--tech-card-bg)',
                border: '1px solid var(--tech-border)'
              }}
              bodyStyle={{ padding: '12px' }}
            >
              <MiniCodeEditor
                initialCode={userCode}
                language={selectedLanguage}
                title={(i18n.language === 'zh-CN' || i18n.language === 'zh') ? '代码编辑器' : 'Code Editor'}
                height="500px"
                showLanguageSelector={true}
                onCodeChange={(newCode) => setUserCode(newCode)}
                onLanguageChange={(newLanguage) => setSelectedLanguage(newLanguage)}
                onRun={handleSubmitCode}
                placeholder={t('smartCodingLab.codeTemplate.placeholder')}
                testCases={(enhancedProblemData?.testCases || currentProblem?.testCases || []).map((testCase, index) => ({
                  ...testCase,
                  description: translateTestCaseDescription(testCase.description, index)
                }))}
                problemData={enhancedProblemData || currentProblem}
                interviewMode={interviewMode}
                isEvaluating={isEvaluating}
                onSubmitCode={handleSubmitCode}
                theme="dark"
                editorOptions={{
                  theme: 'vs-dark',
                  backgroundColor: '#000000'
                }}
                style={{ backgroundColor: '#000000' }}
              />
            </Card>
          </div>
        </Col>

        {/* 右侧：多功能工具栏 */}
        <Col span={6} style={{ minWidth: 0, overflow: 'hidden' }}>
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>


            {/* 面试对话区域 */}
            <Card
              className="tech-card"
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserOutlined style={{ color: 'var(--tech-primary)' }} />
                    <span className="tech-title">{(i18n.language === 'zh-CN' || i18n.language === 'zh') ? 'AI面试官' : 'AI Interviewer'}</span>
                  </div>
                </div>
              }
              style={{
                background: 'var(--tech-card-bg)',
                border: '1px solid var(--tech-orange-border)',
                boxShadow: '0 8px 32px var(--tech-orange-shadow)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
              headStyle={{
                background: 'transparent',
                borderBottom: '1px solid var(--tech-orange-border)',
                color: 'var(--tech-primary)',
                flexShrink: 0
              }}
              bodyStyle={{
                padding: '12px',
                flex: 1,
                overflowY: 'auto',
                background: 'transparent',
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {interviewState.phase === 'preparation' ? (
                // 准备阶段静态内容
                <div style={{ color: 'var(--tech-text-primary)', fontSize: '14px' }}>
                  <p>{t('smartCodingLab.interviewer.greeting')}</p>
                  <p>{t('smartCodingLab.interviewer.todayTopic', { title: translateProblem(currentProblem?.id) })}</p>
                  <p>{t('smartCodingLab.interviewer.startPrompt')}</p>
                  <p style={{ marginTop: '16px', padding: '12px', background: 'var(--tech-orange-bg)', borderRadius: '8px', border: '1px solid var(--tech-orange-border)' }}>
                    📝 <strong>{t('smartCodingLab.interviewTips.expressThoughts')}：</strong>{t('smartCodingLab.interviewer.interviewStart')}
                  </p>

                </div>
              ) : (
                // 面试进行中 - 交互式聊天界面
                <>
                  {/* 聊天消息区域 */}
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    marginBottom: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {interviewMessages.map((message) => (
                      <div
                        key={message.id}
                        style={{
                          display: 'flex',
                          justifyContent: message.type === 'candidate' ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div
                          style={{
                            maxWidth: message.type === 'candidate' ? '70%' : '85%',
                            padding: '10px 14px',
                            borderRadius: message.type === 'candidate' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            background: message.type === 'candidate'
                              ? 'linear-gradient(135deg, var(--tech-primary), var(--tech-accent))'
                              : message.isError
                                ? 'linear-gradient(135deg, rgba(255, 77, 79, 0.2), rgba(255, 107, 107, 0.2))'
                                : message.isLoading
                                  ? 'var(--tech-orange-bg)'
                                  : 'var(--tech-orange-bg)',
                            color: message.type === 'candidate' ? 'white' : 'var(--tech-text-primary)',
                            fontSize: '12px',
                            lineHeight: '1.5',
                            border: message.type === 'candidate' ? 'none' : '1px solid var(--tech-orange-border)',
                            boxShadow: message.type === 'candidate'
                              ? '0 4px 12px var(--tech-orange-shadow)'
                              : '0 2px 8px var(--tech-orange-shadow)',
                            animation: message.isLoading ? 'pulse 1.5s ease-in-out infinite' : 'none'
                          }}
                        >
                          <div style={{
                            fontSize: '10px',
                            opacity: 0.8,
                            marginBottom: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {message.type === 'candidate' ? (
                              <>
                                <span>👤</span>
                                <span>{t('smartCodingLab.codeTemplate.candidate')}</span>
                              </>
                            ) : (
                              <>
                                <span>👨‍💼</span>
                                <span>{t('smartCodingLab.codeTemplate.interviewer')}</span>
                              </>
                            )}
                            <span style={{ marginLeft: 'auto', fontSize: '9px' }}>
                              {message.timestamp}
                            </span>
                          </div>

                          <div style={{ wordBreak: 'break-word' }}>
                            {message.isLoading ? (
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontStyle: 'italic',
                                color: 'var(--tech-text-secondary)'
                              }}>
                                <Spin size="small" />
                                <span>{message.content}</span>
                              </div>
                            ) : (
                              message.content
                            )}
                          </div>

                          {message.isFollowUp && (
                            <div style={{
                              marginTop: '8px',
                              padding: '6px 10px',
                              background: 'rgba(82, 196, 26, 0.1)',
                              border: '1px solid rgba(82, 196, 26, 0.3)',
                              borderRadius: '8px',
                              fontSize: '11px',
                              color: 'var(--tech-accent)'
                            }}>
                              🔍 Follow-up 问题
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* 语音识别状态显示 */}
                    {interviewState.isActive && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '8px',
                        background: isListening
                          ? 'linear-gradient(135deg, rgba(82, 196, 26, 0.1), rgba(115, 209, 61, 0.1))'
                          : 'var(--tech-orange-light)',
                        borderRadius: '12px',
                        border: isListening
                          ? '1px solid rgba(82, 196, 26, 0.3)'
                          : '1px solid var(--tech-orange-border)',
                        position: 'sticky',
                        bottom: 0,
                        zIndex: 1
                      }}>
                        {/* 语音识别状态 */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          fontSize: '12px',
                          color: isListening ? '#52c41a' : 'var(--tech-text-secondary)'
                        }}>
                          <div style={{
                            position: 'relative',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <AudioOutlined style={{
                              fontSize: '16px',
                              color: isListening ? '#52c41a' : 'var(--tech-text-secondary)',
                              zIndex: 1
                            }} />
                            {isListening && (
                              <>
                                <div style={{
                                  position: 'absolute',
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  border: '2px solid rgba(82, 196, 26, 0.6)',
                                  animation: 'microphonePulse 1.5s infinite',
                                  zIndex: 0
                                }}></div>
                                <div style={{
                                  position: 'absolute',
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  border: '2px solid var(--tech-orange-border)',
                                  animation: 'microphonePulse 1.5s infinite 0.3s',
                                  zIndex: 0
                                }}></div>
                                <div style={{
                                  position: 'absolute',
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  border: '2px solid var(--tech-warm-border)',
                                  animation: 'microphonePulse 1.5s infinite 0.6s',
                                  zIndex: -1
                                }}></div>
                              </>
                            )}
                          </div>

                          <div>
                            <div style={{ fontWeight: 600 }}>
                              {isAiSpeakingInInterview
                                ? '🔊 AI面试官正在说话...'
                                : isListening
                                  ? '🎤 正在倾听你的说话...'
                                  : '😴 语音识别已暂停'
                              }
                            </div>
                            <div style={{ fontSize: '10px', opacity: 0.8 }}>
                              {isListening ? '直接说话，AI会自动识别' : '请等待AI说话结束'}
                            </div>
                          </div>
                        </div>

                        {isListening && (
                          <div style={{
                            position: 'absolute',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: '2px solid rgba(82, 196, 26, 0.8)',
                            animation: 'microphonePulse 1.5s infinite 0s',
                            zIndex: 0
                          }}></div>
                        )}
                        {isListening && (
                          <div style={{
                            position: 'absolute',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: '2px solid var(--tech-orange-border)',
                            animation: 'microphonePulse 1.5s infinite 0.3s',
                            zIndex: 0
                          }}></div>
                        )}
                        {isListening && (
                          <div style={{
                            position: 'absolute',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: '2px solid var(--tech-warm-border)',
                            animation: 'microphonePulse 1.5s infinite 0.6s',
                            zIndex: -1
                          }}></div>
                        )}
                      </div>
                    )}

                  </div>
                </>
              )}
            </Card>


            {/* 面试要点提醒 */}

          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AlgorithmInterviewMode;