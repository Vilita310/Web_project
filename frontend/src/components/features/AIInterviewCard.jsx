import React, { useState, useEffect, useRef } from 'react';
import { Button, Tooltip, Tag, Progress, Input, Avatar, List, Typography, Spin, message } from 'antd';
import { CustomerServiceOutlined, SendOutlined, ClockCircleOutlined, StarOutlined, UserOutlined, RobotOutlined, AudioOutlined, StopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { aiChat } from '../../utils/aiApi';
import { getApiUrl } from '../../config/api.js';

const { Text } = Typography;

const AIInterviewCard = () => {
  const { isDarkTheme } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation('home');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [typing, setTyping] = useState(false);
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState('');
  const [interviewMessages, setInterviewMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);

  // 新增面试状态管理
  const [interviewState, setInterviewState] = useState({
    phase: 'preparation', // preparation, questioning, coding, evaluation
    questionCount: 0,
    maxQuestions: 6,
    duration: 1800, // 30分钟
    timeRemaining: 1800,
    startTime: null,
    isActive: false,
    conversationId: null // 固定的会话ID
  });

  // 语音功能状态
  const [recognition, setRecognition] = useState(null);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [ttsGenerating, setTtsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const interviewData = [
    {
      question: t('ui.interviewQuestion1'),
      answer: t('ui.interviewAnswer1'),
      difficulty: t('ui.interviewDifficulty1'),
      category: t('ui.interviewCategory1')
    },
    {
      question: t('ui.interviewQuestion2'),
      answer: t('ui.interviewAnswer2'),
      difficulty: t('ui.interviewDifficulty2'),
      category: t('ui.interviewCategory2')
    }
  ];

  // 处理题目点击事件，启动AI面试
  const handleProblemClick = async (problemName) => {
    console.log('🎯 启动AI面试:', problemName);
    console.log('🎯 设置面试状态为激活');

    // 防止页面滚动
    const currentScrollY = window.scrollY;

    setSelectedProblem(problemName);
    setIsInterviewActive(true);
    setInterviewMessages([]);

    // 立即检查状态
    setTimeout(() => {
      console.log('🔍 面试启动后状态检查 - isInterviewActive应该为true');
    }, 100);

    // 初始化面试状态
    const startTime = new Date();
    const conversationId = `interview-${problemName}-${Date.now()}`;
    setInterviewState({
      phase: 'questioning',
      questionCount: 0,
      maxQuestions: 6,
      duration: 1800,
      timeRemaining: 1800,
      startTime: startTime,
      isActive: true,
      conversationId: conversationId
    });

    // 发送AI面试官的专业开场
    const welcomeMessages = [
      {
        id: Date.now(),
        type: 'ai',
        content: `你好！我是你的AI技术面试官。今天我们将针对"${problemName}"这道算法题进行深入的技术面试。`,
        timestamp: startTime.toLocaleTimeString()
      },
      {
        id: Date.now() + 1,
        type: 'ai',
        content: `面试将分为三个阶段：\n1. 问题理解与思路讨论（6个问题）\n2. 代码实现\n3. 综合评估\n\n现在开始第一阶段。请先简要描述一下你对"${problemName}"这个问题的理解。`,
        timestamp: startTime.toLocaleTimeString()
      }
    ];

    setInterviewMessages(welcomeMessages);

    // 启动计时器
    startInterviewTimer();

    // 延迟启动语音识别，给用户时间准备
    setTimeout(() => {
      if (recognition && !isListening) {
        console.log('🎤 面试开始，自动启动语音识别');
        try {
          recognition.start();
          setIsListening(true);
        } catch (e) {
          if (e.message.includes('already started')) {
            console.log('语音识别已在运行');
            setIsListening(true);
          } else {
            console.error('自动启动语音识别失败:', e);
          }
        }
      }

      // 恢复滚动位置
      window.scrollTo(0, currentScrollY);
    }, 2000);
  };

  // 面试计时器
  const startInterviewTimer = () => {
    const timer = setInterval(() => {
      setInterviewState(prev => {
        if (!prev.isActive || prev.timeRemaining <= 0) {
          clearInterval(timer);
          return prev;
        }
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        };
      });
    }, 1000);
  };

  // 发送用户消息
  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: userInput,
      timestamp: new Date().toLocaleTimeString()
    };

    setInterviewMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsProcessing(true);

    try {
      // 构建智能面试上下文
      const interviewContext = generateInterviewContext();

      const response = await fetch(getApiUrl('/api/ai-chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: interviewContext + `\n\n应聘者回答：${userInput}`,
          conversation_id: `interview-${selectedProblem}-${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('面试API调用失败');
      }

      const data = await response.json();

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString()
      };

      setInterviewMessages(prev => [...prev, aiMessage]);

      // 更新面试状态
      updateInterviewProgress();

      // 语音播放AI回复
      if (data.reply) {
        await playAIResponseSpeech(data.reply);
      }

    } catch (error) {
      console.error('AI面试失败:', error);
      message.error('AI面试官暂时无法回应，请稍后再试');

      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: '抱歉，我遇到了一些技术问题。让我们继续讨论这个算法问题吧。',
        timestamp: new Date().toLocaleTimeString()
      };
      setInterviewMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // 生成面试上下文（针对具体算法题目）
  const generateInterviewContext = () => {
    const phase = interviewState.phase;
    const questionCount = interviewState.questionCount;
    const maxQuestions = interviewState.maxQuestions;

    // 根据选定的算法题目生成专门的面试上下文
    let problemContext = '';
    switch (selectedProblem) {
      case '两数之和':
        problemContext = `
题目：给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值的那两个整数，并返回它们的数组下标。

重点考察：
- 哈希表的使用
- 时间复杂度优化（从O(n²)到O(n)）
- 边界条件处理
- 是否考虑重复元素`;
        break;
      case '反转链表':
        problemContext = `
题目：给你单链表的头节点 head，请你反转链表，并返回反转后的链表。

重点考察：
- 链表操作的基本功
- 迭代和递归两种解法
- 指针操作的理解
- 边界条件（空链表、单节点）`;
        break;
      case '岛屿数量':
        problemContext = `
题目：给你一个由 '1'（陆地）和 '0'（水）组成的二维网格，请你计算网格中岛屿的数量。

重点考察：
- DFS/BFS算法的应用
- 二维数组遍历
- 图论基础
- 递归思维`;
        break;
      case '爬楼梯':
        problemContext = `
题目：假设你正在爬楼梯。需要 n 阶你才能到达楼顶。每次你可以爬 1 或 2 个台阶。

重点考察：
- 动态规划基础
- 斐波那契数列的理解
- 递归与迭代的优化
- 空间复杂度优化`;
        break;
      case '二叉树的最大深度':
        problemContext = `
题目：给定一个二叉树，找出其最大深度。

重点考察：
- 树的遍历（DFS/BFS）
- 递归思维
- 二叉树基本概念
- 代码简洁性`;
        break;
      default:
        problemContext = `
算法题目：${selectedProblem}
请围绕这个具体题目进行深入的技术讨论。`;
    }

    let context = `你是一位专业的技术面试官，正在对候选人进行"${selectedProblem}"算法题的技术面试。

${problemContext}

面试要求：
1. 保持专业和友好的态度
2. 围绕"${selectedProblem}"这个具体题目提问
3. 根据候选人回答进行智能追问
4. 每个阶段有明确目标

当前面试状态：
- 面试题目：${selectedProblem}
- 当前阶段：${phase}
- 问题进度：${questionCount}/${maxQuestions}
- 剩余时间：${Math.floor(interviewState.timeRemaining / 60)}分钟`;

    if (phase === 'questioning') {
      context += `

第一阶段 - 问题理解与思路讨论：
- 确保候选人理解"${selectedProblem}"题目要求
- 引导候选人思考针对这个题目的不同解法
- 讨论具体的算法选择和实现思路
- 分析时间复杂度和空间复杂度
- 询问边界条件和特殊情况的处理
- 如果已问${questionCount}个问题，考虑进入代码实现阶段`;
    } else if (phase === 'coding') {
      context += `

第二阶段 - 代码实现：
- 指导候选人开始编写"${selectedProblem}"的代码
- 观察编程习惯和代码质量
- 提醒验证解法正确性`;
    }

    return context;
  };

  // 更新面试进度
  const updateInterviewProgress = () => {
    setInterviewState(prev => {
      const newQuestionCount = prev.questionCount + 1;
      let newPhase = prev.phase;

      // 第一阶段问完6个问题后进入代码阶段
      if (prev.phase === 'questioning' && newQuestionCount >= prev.maxQuestions) {
        newPhase = 'coding';
        // 自动提示进入编码阶段
        setTimeout(() => {
          const codingPrompt = {
            id: Date.now(),
            type: 'ai',
            content: `很好！基于我们的讨论，现在请开始编写代码实现。你可以选择刚才我们讨论的最优解法。编码完成后，请运行测试用例验证你的解法。`,
            timestamp: new Date().toLocaleTimeString()
          };
          setInterviewMessages(prev => [...prev, codingPrompt]);
        }, 1000);
      }

      return {
        ...prev,
        questionCount: newQuestionCount,
        phase: newPhase
      };
    });
  };

  // 内页的辅助函数
  const getSelectedProblemDescription = () => {
    const descriptions = {
      '两数之和': '给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值的那两个整数，并返回它们的数组下标。',
      '反转链表': '给你单链表的头节点 head，请你反转链表，并返回反转后的链表。',
      '岛屿数量': '给你一个由 \'1\'（陆地）和 \'0\'（水）组成的二维网格，请你计算网格中岛屿的数量。',
      '爬楼梯': '假设你正在爬楼梯。需要 n 阶你才能到达楼顶。每次你可以爬 1 或 2 个台阶。有多少种不同的方法可以爬到楼顶呢？',
      '二叉树的最大深度': '给定一个二叉树，找出其最大深度。二叉树的深度为根节点到最远叶子节点的最长路径上的节点数。'
    };
    return descriptions[selectedProblem] || '算法题目描述';
  };

  // 清理AI回复内容，去掉"面试官:"等前缀 (引用内页代码)
  const cleanAIResponse = (content) => {
    if (!content) return content;

    const prefixes = [
      /^面试官[：:]\s*/,
      /^AI面试官[：:]\s*/,
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

  // 重启语音识别的辅助函数（引用内页代码）
  const restartVoiceRecognition = () => {
    if (isInterviewActive && recognition) {
      setTimeout(() => {
        try {
          recognition.start();
          setIsListening(true);
          console.log('✅ AI语音结束，已重启语音识别');
        } catch (e) {
          if (e.message.includes('already started')) {
            setIsListening(true);
            console.log('✅ 语音识别已在运行');
          } else {
            console.error('❌ 重启语音识别失败:', e);
          }
        }
      }, 500);
    }
  };

  // AI语音播放功能（引用内页完善的实现）
  const playAIResponseSpeech = async (text) => {
    console.log('🎵 开始AI语音播放控制:', text.substring(0, 50));

    // 1. 立即设置AI说话状态（防止语音识别干扰）
    setIsAiSpeaking(true);

    // 2. 强制暂停语音识别
    if (recognition) {
      try {
        recognition.abort(); // 使用abort而不是stop，更强制
        setIsListening(false);
        console.log('🛑 已强制停止语音识别');
      } catch (e) {
        console.warn('停止语音识别失败:', e);
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
        setIsAiSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        console.log('🔊 AI语音播放结束');
        // 重启语音识别
        restartVoiceRecognition();
      };

      audio.onerror = () => {
        setIsAiSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        console.error('音频播放失败');
        // 重启语音识别
        restartVoiceRecognition();
      };

      await audio.play();
    } catch (error) {
      console.error('TTS播放失败:', error);
      setIsAiSpeaking(false);
      // 重启语音识别
      restartVoiceRecognition();
    }
  };

  // 滚动到底部
  const scrollToBottom = () => {
    // 只在消息容器内滚动，不影响整个页面
    if (messagesEndRef.current && isInterviewActive && interviewMessages.length > 2) {
      // 使用元素的scrollIntoView但限制在容器内
      const element = messagesEndRef.current;
      const container = element.closest('[style*="overflow"]');
      if (container) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  // 格式化时间
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 获取阶段文本
  const getPhaseText = (phase) => {
    switch (phase) {
      case 'questioning': return t('ui.interviewPhases.questioning');
      case 'coding': return t('ui.interviewPhases.coding');
      case 'evaluation': return t('ui.interviewPhases.evaluation');
      default: return t('ui.interviewPhases.preparation');
    }
  };

  // 结束面试
  const endInterview = () => {
    // 停止语音识别
    if (recognition && isListening) {
      console.log('🛑 结束面试，停止语音识别');
      recognition.stop();
    }

    setIsInterviewActive(false);
    setIsListening(false);
    setSelectedProblem('');
    setInterviewMessages([]);
    setInterviewState({
      phase: 'preparation',
      questionCount: 0,
      maxQuestions: 6,
      duration: 1800,
      timeRemaining: 1800,
      startTime: null,
      isActive: false,
      conversationId: null
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [interviewMessages]);

  // 初始化语音识别 - 持续收音模式
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      // 配置持续识别
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'zh-CN';
      recognitionInstance.maxAlternatives = 1;

      recognitionInstance.onstart = () => {
        console.log('语音识别已启动');
        setIsListening(true);
      };

      recognitionInstance.onresult = (event) => {
        console.log('语音识别结果:', event.results.length);

        // 获取最新的识别结果
        const lastResultIndex = event.results.length - 1;
        const lastResult = event.results[lastResultIndex];

        if (lastResult.isFinal) {
          const transcript = lastResult[0].transcript.trim();
          console.log('🎯 最终语音结果:', transcript, '长度:', transcript.length);
          console.log('🎯 当前状态 - isAiSpeaking:', isAiSpeaking, 'ttsGenerating:', ttsGenerating, 'isListening:', isListening);

          // 强化AI说话时的语音识别控制 - 如果AI正在说话，直接忽略
          if (isAiSpeaking) {
            console.log('🚫 AI正在说话，忽略语音输入:', transcript);
            return;
          }

          // 只有当识别结果有实际内容时才自动发送
          console.log('🔍 准备发送语音消息 - transcript:', transcript, '长度:', transcript.length);
          if (transcript.length > 2) {
            console.log('✅ 满足发送条件，调用sendVoiceMessage，内容:', transcript);
            sendVoiceMessage(transcript);
          } else {
            console.log('❌ 语音内容太短:', transcript.length, '内容:', transcript);
          }
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('语音识别错误:', event.error);

        // 增强错误处理机制
        if (event.error === 'network') {
          message.error('网络连接问题，请检查网络连接后重试');
        } else if (event.error === 'not-allowed') {
          message.error('请允许麦克风权限以使用语音面试功能');
          setIsListening(false);
          return; // 权限错误不重试
        } else if (event.error === 'service-not-allowed') {
          message.error('语音服务不可用，请稍后重试');
        } else if (event.error === 'bad-grammar') {
          message.warning('语音识别配置问题，正在重新配置...');
        } else if (event.error === 'language-not-supported') {
          message.error('当前语言不支持，切换到中文模式');
          recognitionInstance.lang = 'zh-CN';
        } else if (event.error === 'no-speech') {
          // 静音检测，不显示错误，继续监听
          console.log('未检测到语音，继续监听...');
        } else {
          console.error('语音识别未知错误:', event.error);
          message.warning('语音识别遇到问题，正在重新启动...');
        }

        // 智能重启机制 - 排除不可恢复的错误
        const unrecoverableErrors = ['not-allowed', 'service-not-allowed'];
        if (isInterviewActive && !isAiSpeaking && !ttsGenerating && !unrecoverableErrors.includes(event.error)) {
          setTimeout(() => {
            if (isInterviewActive && !isAiSpeaking && !ttsGenerating && !isListening) {
              console.log('🔄 智能重启语音识别');
              try {
                recognitionInstance.start();
              } catch (e) {
                if (e.message.includes('already started')) {
                  console.log('语音识别已在运行，无需重启');
                } else {
                  console.error('重启语音识别失败:', e);
                  // 如果重启失败，提示用户手动刷新
                  setTimeout(() => {
                    if (isInterviewActive) {
                      message.info('语音识别遇到问题，建议刷新页面重新开始面试');
                    }
                  }, 2000);
                }
              }
            }
          }, 1500); // 增加延迟，给系统恢复时间
        }
      };

      recognitionInstance.onend = () => {
        console.log('语音识别结束');
        setIsListening(false);

        // 如果面试还在进行且AI不在说话，自动重启识别
        if (isInterviewActive && !isAiSpeaking && !ttsGenerating) {
          setTimeout(() => {
            if (isInterviewActive && !isAiSpeaking && !ttsGenerating && !isListening) {
              console.log('🔄 自动重启语音识别');
              try {
                recognitionInstance.start();
                setIsListening(true);
              } catch (e) {
                if (e.message.includes('already started')) {
                  console.log('语音识别已在运行，无需重启');
                  setIsListening(true);
                } else {
                  console.error('自动重启语音识别失败:', e);
                }
              }
            }
          }, 500);
        }
      };

      setRecognition(recognitionInstance);
    }
  }, [isInterviewActive, isAiSpeaking, ttsGenerating]);

  // 使用内页的完整sendVoiceMessage实现
  const sendVoiceMessage = async (transcript) => {
    console.log('sendVoiceMessage 被调用，语音内容:', transcript);
    if (!transcript?.trim()) {
      console.log('语音内容为空，返回');
      return;
    }

    const userMessage = {
      id: interviewMessages.length + 1,
      type: 'candidate', // 使用内页的candidate类型
      content: transcript.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setInterviewMessages(prev => [...prev, userMessage]);

    // 显示AI正在思考的状态
    const thinkingMessage = {
      id: interviewMessages.length + 2,
      type: 'interviewer',
      content: '🤔 正在思考...',
      timestamp: new Date().toLocaleTimeString(),
      isLoading: true
    };
    setInterviewMessages(prev => [...prev, thinkingMessage]);

    try {
      // 构建面试上下文 (使用内页的逻辑)
      const problemTitle = selectedProblem || '两数之和';
      const problemDescription = getSelectedProblemDescription();

      // 获取对话历史上下文
      const conversationHistory = interviewMessages.filter(msg => !msg.isLoading).slice(-6);
      const historyContext = conversationHistory.map(msg =>
        `${msg.type === 'candidate' ? '应聘者' : '面试官'}: ${msg.content}`
      ).join('\n');

      // 统计当前对话轮数
      const conversationRounds = Math.floor(interviewMessages.filter(msg => !msg.isLoading).length / 2);

      // 检查是否有follow-up标记的消息
      const hasFollowUpQuestions = interviewMessages.some(msg => msg.isFollowUp);
      const followUpRounds = interviewMessages.filter(msg => msg.isFollowUp || (msg.type === 'candidate' && hasFollowUpQuestions)).length;

      // 构建AI面试官提示词 (完全使用内页逻辑)
      let interviewPrompt;

      if (hasFollowUpQuestions && followUpRounds >= 4) {
        console.log('🎯 触发最终评估阶段');
        interviewPrompt = `你是一位专业的技术面试官，现在需要对应聘者进行最终评估。

题目：${problemTitle}
题目描述：${problemDescription}

对话历史：
${historyContext}

评估要求：
1. 根据应聘者在整个面试过程中的表现进行综合评估
2. 评价其对算法的理解深度、思考过程、沟通能力
3. 给出具体的评分建议和改进建议
4. 保持专业和建设性的语气

应聘者最新回答：${transcript}

请给出最终的面试评估和建议。`;
      } else if (conversationRounds >= 2 && !hasFollowUpQuestions) {
        console.log('🔄 转入follow-up阶段');
        interviewPrompt = `你是一位专业的技术面试官，正在对应聘者进行"${problemTitle}"的技术面试。

题目：${problemTitle}
题目描述：${problemDescription}

对话历史：
${historyContext}

现在进入深入讨论阶段，请：
1. 针对应聘者的回答进行深入追问
2. 考察其对算法细节的理解
3. 询问时间复杂度、空间复杂度等
4. 探讨边界情况和优化方案
5. 保持友好但专业的询问方式

应聘者回答：${transcript}

请提出有针对性的深入问题。`;
      } else {
        interviewPrompt = `你是一位专业的技术面试官，正在对应聘者进行"${problemTitle}"的技术面试。

题目：${problemTitle}
题目描述：${problemDescription}

对话历史：
${historyContext}

面试要求：
1. 围绕这道具体的算法题进行提问
2. 引导应聘者思考解题思路和方法
3. 保持友好但专业的面试氛围
4. 根据应聘者的回答进行适当的引导
5. 每次回应控制在2-3句话内

应聘者回答：${transcript}

请给出专业的面试官回应。`;
      }

      const response = await fetch(getApiUrl('/api/ai-chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: interviewPrompt,
          conversation_id: interviewState.conversationId || `interview-${selectedProblem}-fallback`
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // 移除思考中的消息，添加AI回复
      setInterviewMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isLoading);
        const aiMessage = {
          id: filteredMessages.length + 1,
          type: 'interviewer',
          content: cleanAIResponse(data.reply || data.response),
          timestamp: new Date().toLocaleTimeString(),
          isFollowUp: conversationRounds >= 2 && !hasFollowUpQuestions
        };
        return [...filteredMessages, aiMessage];
      });

      // 语音播放AI回复 (使用内页的实现)
      if (data.reply || data.response) {
        const cleanedResponse = cleanAIResponse(data.reply || data.response);
        await playAIResponseSpeech(cleanedResponse);
      }

    } catch (error) {
      console.error('AI面试失败:', error);
      message.error('AI面试官暂时无法回应，请稍后再试');

      // 移除思考中的消息，添加错误提示
      setInterviewMessages(prev => {
        const filteredMessages = prev.filter(msg => !msg.isLoading);
        const errorMessage = {
          id: filteredMessages.length + 1,
          type: 'interviewer',
          content: '抱歉，我遇到了一些技术问题。让我们继续讨论这个算法问题吧。',
          timestamp: new Date().toLocaleTimeString()
        };
        return [...filteredMessages, errorMessage];
      });
    }
  };


  useEffect(() => {
    const timer = setInterval(() => {
      setTyping(prev => !prev);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

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
      {/* 左侧：AI面试官对话演示 */}
      <div style={{
        background: isDarkTheme
          ? 'rgba(22, 27, 34, 0.8)'
          : 'rgba(160, 120, 59, 0.08)',
        borderRadius: '24px',
        border: isDarkTheme
          ? '1px solid rgba(88, 166, 255, 0.3)'
          : '1px solid rgba(160, 120, 59, 0.25)',
        boxShadow: isDarkTheme
          ? '0 8px 20px rgba(88, 166, 255, 0.1)'
          : '0 8px 20px rgba(160, 120, 59, 0.15)',
        padding: '24px',
        backdropFilter: 'blur(16px)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* 头部 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <h3 style={{
                color: isDarkTheme ? '#F0F6FC' : '#A0783B',
                fontSize: '1.1rem',
                fontWeight: '600',
                margin: 0
              }}>{t('ui.aiInterviewer')}</h3>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[t('ui.voiceInterview'), t('ui.professionalAssessment')].map((feature) => (
              <Tag key={feature} style={{
                background: isDarkTheme ? 'rgba(88, 166, 255, 0.15)' : 'rgba(160, 120, 59, 0.15)',
                border: isDarkTheme ? '1px solid rgba(88, 166, 255, 0.3)' : '1px solid rgba(160, 120, 59, 0.3)',
                color: isDarkTheme ? '#58A6FF' : '#A0783B',
                fontSize: '11px'
              }}>
                {feature}
              </Tag>
            ))}
          </div>
        </div>

        {/* 面试进度 */}
        <div style={{
          background: isDarkTheme ? 'rgba(88, 166, 255, 0.05)' : 'rgba(160, 120, 59, 0.05)',
          border: isDarkTheme ? '1px solid rgba(88, 166, 255, 0.15)' : '1px solid rgba(160, 120, 59, 0.15)',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <span style={{ color: isDarkTheme ? '#F0F6FC' : '#2D1810', fontSize: '12px', fontWeight: '600' }}>
              {isInterviewActive
                ? `${selectedProblem} - ${getPhaseText(interviewState.phase)} (${interviewState.questionCount}/${interviewState.maxQuestions})`
                : `${t('ui.interviewProgress')} (${currentQuestion + 1}/2)`}
            </span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {isInterviewActive ? (
                <>
                  <span style={{
                    color: '#7D73FF',
                    fontSize: '11px',
                    background: 'rgba(125, 115, 255, 0.1)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid rgba(125, 115, 255, 0.2)'
                  }}>
                    {formatTime(interviewState.timeRemaining)}
                  </span>
                  <Button
                    size="small"
                    type="text"
                    onClick={endInterview}
                    style={{
                      color: '#ff6b6b',
                      fontSize: '11px',
                      height: '24px',
                      padding: '0 8px'
                    }}
                  >
                    {t('ui.endInterview')}
                  </Button>
                </>
              ) : (
                <span style={{ color: isDarkTheme ? '#58A6FF' : '#A0783B', fontSize: '12px' }}>
                  {interviewData[currentQuestion].category}
                </span>
              )}
            </div>
          </div>
          {!isInterviewActive && (
            <Progress
              percent={((currentQuestion + 1) / interviewData.length) * 100}
              strokeColor={isDarkTheme ? "#58A6FF" : "#A0783B"}
              trailColor="rgba(255,255,255,0.1)"
              size="small"
              showInfo={false}
            />
          )}
        </div>

        {/* 对话区域 */}
        <div style={{
          height: '300px',
          overflowY: 'auto',
          marginBottom: '16px',
          padding: '8px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.2) transparent'
        }}>
          {isInterviewActive ? (
            // 真实面试对话
            <>
              {interviewMessages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    marginBottom: '16px',
                    justifyContent: (message.type === 'user' || message.type === 'candidate') ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    maxWidth: '85%',
                    flexDirection: (message.type === 'user' || message.type === 'candidate') ? 'row-reverse' : 'row'
                  }}>
                    <Avatar
                      icon={(message.type === 'user' || message.type === 'candidate') ? <UserOutlined /> : <RobotOutlined />}
                      style={{
                        backgroundColor: (message.type === 'user' || message.type === 'candidate')
                          ? (isDarkTheme ? '#60a5fa' : '#B5704A')
                          : (isDarkTheme ? '#58A6FF' : '#A0783B'),
                        minWidth: '32px'
                      }}
                      size="small"
                    />
                    <div style={{
                      background: (message.type === 'user' || message.type === 'candidate')
                        ? (isDarkTheme ? 'rgba(96, 165, 250, 0.1)' : 'rgba(181, 112, 74, 0.1)')
                        : (isDarkTheme ? 'rgba(88, 166, 255, 0.1)' : 'rgba(160, 120, 59, 0.1)'),
                      border: (message.type === 'user' || message.type === 'candidate')
                        ? (isDarkTheme ? '1px solid rgba(96, 165, 250, 0.3)' : '1px solid rgba(181, 112, 74, 0.3)')
                        : (isDarkTheme ? '1px solid rgba(88, 166, 255, 0.3)' : '1px solid rgba(160, 120, 59, 0.3)'),
                      borderRadius: (message.type === 'user' || message.type === 'candidate') ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      padding: '12px 16px',
                      maxWidth: '80%',
                      minWidth: '250px',
                      opacity: message.isLoading ? 0.7 : 1
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '6px'
                      }}>
                        <span style={{
                          color: (message.type === 'user' || message.type === 'candidate')
                            ? (isDarkTheme ? '#60a5fa' : '#B5704A')
                            : (isDarkTheme ? '#58A6FF' : '#A0783B'),
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {(message.type === 'user' || message.type === 'candidate') ? t('ui.you') : t('ui.aiInterviewer')}
                        </span>
                        <span style={{
                          color: isDarkTheme ? '#8B949E' : '#64748b',
                          fontSize: '10px'
                        }}>
                          {message.timestamp}
                        </span>
                      </div>
                      <p style={{
                        color: isDarkTheme ? '#F0F6FC' : '#2D1810',
                        fontSize: '14px',
                        margin: 0,
                        lineHeight: 1.5,
                        whiteSpace: 'pre-wrap'
                      }}>
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 16px',
                    background: isDarkTheme ? 'rgba(34, 197, 94, 0.05)' : 'rgba(212, 146, 111, 0.05)',
                    borderRadius: '16px',
                  }}>
                    <Spin size="small" />
                    <span style={{ color: isDarkTheme ? '#58A6FF' : '#A0783B', fontSize: '12px' }}>
                      {t('ui.aiThinking')}
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          ) : (
            // 演示对话
            <>
              {/* 面试官问题 */}
              <div style={{
                display: 'flex',
                marginBottom: '16px',
                justifyContent: 'flex-start'
              }}>
                <div style={{
                  background: isDarkTheme ? 'rgba(88, 166, 255, 0.1)' : 'rgba(160, 120, 59, 0.1)',
                  border: isDarkTheme ? '1px solid rgba(88, 166, 255, 0.3)' : '1px solid rgba(160, 120, 59, 0.3)',
                  borderRadius: '16px 16px 16px 4px',
                  padding: '16px',
                  maxWidth: '85%'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <CustomerServiceOutlined style={{ color: isDarkTheme ? '#58A6FF' : '#A0783B' }} />
                    <span style={{ color: isDarkTheme ? '#58A6FF' : '#A0783B', fontSize: '12px', fontWeight: '600' }}>
                      {t('ui.aiInterviewer')}
                    </span>
                    <Tag size="small" style={{
                      background: isDarkTheme ? 'rgba(88, 166, 255, 0.2)' : 'rgba(160, 120, 59, 0.2)',
                      border: 'none',
                      color: isDarkTheme ? '#58A6FF' : '#A0783B',
                      fontSize: '10px'
                    }}>
                      {interviewData[currentQuestion].difficulty}
                    </Tag>
                  </div>
                  <p style={{
                    color: isDarkTheme ? '#F0F6FC' : '#2D1810',
                    fontSize: '14px',
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    {interviewData[currentQuestion].question}
                  </p>
                </div>
              </div>

              {/* 候选人回答 */}
              <div style={{
                display: 'flex',
                marginBottom: '16px',
                justifyContent: 'flex-end'
              }}>
                <div style={{
                  background: isDarkTheme ? 'rgba(96, 165, 250, 0.1)' : 'rgba(181, 112, 74, 0.1)',
                  border: isDarkTheme ? '1px solid rgba(96, 165, 250, 0.3)' : '1px solid rgba(181, 112, 74, 0.3)',
                  borderRadius: '16px 16px 4px 16px',
                  padding: '16px',
                  maxWidth: '85%'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <span style={{ color: isDarkTheme ? '#60a5fa' : '#B5704A', fontSize: '12px', fontWeight: '600' }}>
                      {t('ui.you')}
                    </span>
                    {typing && (
                      <div style={{
                        display: 'flex',
                        gap: '2px'
                      }}>
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            style={{
                              width: '4px',
                              height: '4px',
                              borderRadius: '50%',
                              background: isDarkTheme ? '#60a5fa' : '#B5704A',
                              animation: `typing 1.4s ease-in-out infinite`,
                              animationDelay: `${i * 0.16}s`
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <p style={{
                    color: isDarkTheme ? '#F0F6FC' : '#2D1810',
                    fontSize: '14px',
                    margin: 0,
                    lineHeight: 1.5
                  }}>
                    {interviewData[currentQuestion].answer}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 输入区域 */}
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onPressEnter={sendMessage}
            placeholder={t('ui.enterAnswerPlaceholder')}
            style={{
              flex: 1,
              background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
              border: isDarkTheme ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(160, 120, 59, 0.3)',
              borderRadius: '12px',
              color: isDarkTheme ? '#FFFFFF' : '#2D1810'
            }}
            className="interview-input"
            disabled={!isInterviewActive}
          />
          <Tooltip title="发送回答">
            <Button
              icon={<SendOutlined style={{ color: isDarkTheme ? '#58A6FF' : '#A0783B' }} />}
              onClick={sendMessage}
              disabled={!isInterviewActive || !userInput.trim() || isProcessing}
              loading={isProcessing}
              style={{
                background: isDarkTheme ? 'rgba(88, 166, 255, 0.2)' : 'rgba(160, 120, 59, 0.2)',
                border: isDarkTheme ? '1px solid #58A6FF' : '1px solid #A0783B',
                borderRadius: '12px',
                color: isDarkTheme ? '#58A6FF' : '#A0783B'
              }}
            />
          </Tooltip>
        </div>

        {/* 语音状态指示器 */}
        {isListening && (
          <div style={{
            position: 'absolute',
            bottom: '24px',
            right: '24px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              position: 'absolute',
              width: '32px',
              height: '32px',
              border: isDarkTheme ? '2px solid rgba(88, 166, 255, 0.3)' : '2px solid rgba(160, 120, 59, 0.3)',
              borderTop: isDarkTheme ? '2px solid #58A6FF' : '2px solid #A0783B',
              borderRadius: '50%',
              animation: 'rotate 2s linear infinite'
            }} />
            <div style={{
              width: '12px',
              height: '12px',
              background: isDarkTheme ? '#58A6FF' : '#A0783B',
              borderRadius: '50%',
              animation: 'pulse 1s ease-in-out infinite'
            }} />
          </div>
        )}


        {/* 语音处理状态 */}
        {(isProcessing || isAiSpeaking || ttsGenerating) && (
          <div style={{
            position: 'absolute',
            bottom: '70px',
            right: '24px',
            background: isDarkTheme ? 'rgba(34, 197, 94, 0.1)' : 'rgba(212, 146, 111, 0.1)',
            border: isDarkTheme ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(212, 146, 111, 0.3)',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '11px',
            color: isDarkTheme ? '#58A6FF' : '#A0783B',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {ttsGenerating && (
              <>
                <div style={{
                  width: '10px',
                  height: '10px',
                  border: '2px solid transparent',
                  borderTop: isDarkTheme ? '2px solid #22c55e' : '2px solid #D4926F',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                生成语音...
              </>
            )}
            {isAiSpeaking && (
              <>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#D4926F',
                  borderRadius: '50%',
                  animation: 'pulse 1s ease-in-out infinite'
                }}></div>
                AI正在说话
              </>
            )}
            {isProcessing && (
              <>
                <div style={{
                  width: '10px',
                  height: '10px',
                  border: '2px solid transparent',
                  borderTop: isDarkTheme ? '2px solid #22c55e' : '2px solid #D4926F',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                AI正在思考...
              </>
            )}
          </div>
        )}
      </div>

      {/* 右侧：面试统计与特性 */}
      <div>
        {/* 面试统计 */}
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
              color: isDarkTheme ? '#58A6FF' : '#A0783B',
              marginBottom: '4px'
            }}>98%</div>
            <div style={{
              fontSize: '12px',
              color: isDarkTheme ? '#8B949E' : '#64748b',
              fontWeight: '600',
              marginBottom: '2px'
            }}>{t('ui.questionAccuracy')}</div>
            <div style={{
              fontSize: '11px',
              color: isDarkTheme ? '#6B7280' : '#6b7280'
            }}>{t('ui.intelligentTechQuestions')}</div>
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
            }}>15min</div>
            <div style={{
              fontSize: '12px',
              color: isDarkTheme ? '#8B949E' : '#64748b',
              fontWeight: '600',
              marginBottom: '2px'
            }}>{t('ui.averageDuration')}</div>
            <div style={{
              fontSize: '11px',
              color: isDarkTheme ? '#6B7280' : '#6b7280'
            }}>{t('ui.completeTechInterview')}</div>
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
            }}>50+</div>
            <div style={{
              fontSize: '12px',
              color: isDarkTheme ? '#8B949E' : '#64748b',
              fontWeight: '600'
            }}>{t('ui.questionTypes')}</div>
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
            }}>A+</div>
            <div style={{
              fontSize: '12px',
              color: isDarkTheme ? '#8B949E' : '#64748b',
              fontWeight: '600'
            }}>{t('ui.evaluationLevel')}</div>
          </div>
        </div>

        {/* 算法题目练习区 */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { name: t('ui.algorithmProblems.twoSum'), difficulty: 'Easy', description: t('ui.algorithmProblems.validParentheses') },
              { name: t('ui.algorithmProblems.reverseLinkedList'), difficulty: 'Medium', description: t('ui.algorithmProblems.mergeLists') },
              { name: t('ui.algorithmProblems.numIslands'), difficulty: 'Hard', description: t('ui.algorithmProblems.wordSearchII') },
              { name: t('ui.algorithmProblems.climbingStairs'), difficulty: 'Easy', description: t('ui.algorithmProblems.maxSubarray') },
              { name: t('ui.algorithmProblems.maxDepth'), difficulty: 'Medium', description: t('ui.algorithmProblems.pathSum') }
            ].map((problem, index) => (
              <div
                key={index}
                onClick={() => handleProblemClick(problem.name)}
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
                <span style={{ color: isDarkTheme ? '#FFFFFF' : '#A0783B', fontWeight: '500' }}>{problem.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    color: problem.difficulty === 'Easy' ? (isDarkTheme ? '#58A6FF' : '#A0783B') :
                          problem.difficulty === 'Medium' ? '#f59e0b' : '#ef4444',
                    fontWeight: '600',
                    fontSize: '12px'
                  }}>{problem.difficulty}</span>
                  <span style={{
                    color: isDarkTheme ? '#8B949E' : '#64748b',
                    fontSize: '11px'
                  }}>{problem.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
        </div>
      </div>

      <style jsx global>{`
        .interview-input.ant-input::placeholder {
          color: ${isDarkTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgba(45, 24, 16, 0.5)'} !important;
          opacity: 1 !important;
        }

        .interview-input.ant-input::-webkit-input-placeholder {
          color: ${isDarkTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgba(45, 24, 16, 0.5)'} !important;
        }

        .interview-input.ant-input::-moz-placeholder {
          color: ${isDarkTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgba(45, 24, 16, 0.5)'} !important;
        }

        .interview-input.ant-input:-ms-input-placeholder {
          color: ${isDarkTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgba(45, 24, 16, 0.5)'} !important;
        }

        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }

        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }

        @media (max-width: 768px) {
          & > div:first-child {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>

    </div>
  );
};

export default AIInterviewCard;