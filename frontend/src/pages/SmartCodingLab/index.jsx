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
  TrophyOutlined
} from '@ant-design/icons';

import MiniCodeEditor from '../../components/features/MiniCodeEditor';
import AIBlackboard from '../../components/core/AIBlackboard';
import AIVoiceChat from '../../components/core/AIVoiceChat';
import { leetcode75Data } from '../../data/leetcode75Complete';
import { getEnhancedProblem, getEnhancedPattern } from '../../data/algorithms/AlgorithmContentAdapter';
import { aiChat, textToSpeech, playAudioFromBase64, aiTeacherLecture } from '../../utils/aiApi';
import { getApiUrl } from '../../config/api.js';
import { useDataTranslation } from '../../hooks/useDataTranslation';
import { useTheme } from '../../contexts/ThemeContext';
import './codingLab.css';
import '../AlgorithmHub/lightTheme.css';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const SmartCodingLab = () => {
  const { t } = useTranslation(['learning', 'classroom']);
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

  // t('smartCodingLab.comments.stateManagement')
  const [currentProblem, setCurrentProblem] = useState(null);
  const [currentPattern, setCurrentPattern] = useState(null);
  const [enhancedProblemData, setEnhancedProblemData] = useState(null);
  const [enhancedPatternData, setEnhancedPatternData] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [userCode, setUserCode] = useState('');

  // t('smartCodingLab.comments.editorRelated')
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

  // t('smartCodingLab.comments.aiBlackboardStates')
  const [drawingData, setDrawingData] = useState(null);
  const [voiceChatStates, setVoiceChatStates] = useState({
    isRecording: false,
    isThinking: false,
    isSpeaking: false
  });

  // t('smartCodingLab.comments.pageStateManagement')
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // t('smartCodingLab.comments.aiTeacherChat')
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: t('smartCodingLab.aiTeacher.greeting'),
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  // t('smartCodingLab.comments.interviewChat')
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

  // t('smartCodingLab.comments.interviewEvaluation')
  const [interviewEvaluation, setInterviewEvaluation] = useState(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // t('smartCodingLab.comments.codeExamples') - 默认隐藏
  const [showCodeExamples, setShowCodeExamples] = useState(false);

  // t('smartCodingLab.comments.aiBlackboard') - 默认隐藏
  const [showAIBlackboard, setShowAIBlackboard] = useState(false);

  // t('smartCodingLab.comments.aiTeacherVoice')
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [ttsGenerating, setTtsGenerating] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // t('smartCodingLab.comments.interviewMode')
  const [interviewMode, setInterviewMode] = useState(false);
  const [interviewState, setInterviewState] = useState({
    isActive: false,
    startTime: null,
    duration: 1800, // t('smartCodingLab.comments.duration') (秒)
    timeRemaining: 1800,
    phase: 'preparation', // preparation, active, paused, completed
    score: 0,
    feedback: [],
    questions: [],
    currentQuestionIndex: 0
  });

  // t('smartCodingLab.comments.voiceInterviewChat')
  const [voiceInterviewVisible, setVoiceInterviewVisible] = useState(false);

  // t('smartCodingLab.comments.voiceRecognition')
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isAiSpeakingInInterview, setIsAiSpeakingInInterview] = useState(false);
  const [recognitionHealthCheck, setRecognitionHealthCheck] = useState(null);

  // 翻译问题描述
  const translateProblemDescription = useCallback((problemId) => {
    if (problemId === 1 || problemId === "1") {
      return t('smartCodingLab.problemDescriptions.twoSum');
    }
    return currentProblem?.description || '';
  }, [t, currentProblem]);

  // 翻译示例
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

  // 翻译测试用例描述
  const translateTestCaseDescription = useCallback((description, caseIndex) => {
    if (currentProblem?.id === 1 || currentProblem?.id === "1") {
      const caseKey = `case${caseIndex + 1}`;
      return t(`smartCodingLab.testCaseDescriptions.twoSum.${caseKey}`);
    }
    return description;
  }, [t, currentProblem]);

  // 翻译约束条件
  const translateConstraint = useCallback((constraint, constraintIndex) => {
    if (currentProblem?.id === 1 || currentProblem?.id === "1") {
      const constraintKey = `constraint${constraintIndex + 1}`;
      return t(`smartCodingLab.constraints.twoSum.${constraintKey}`);
    }
    return constraint;
  }, [t, currentProblem]);

  // 翻译相关标签
  const translateRelatedTags = useCallback(() => {
    if (currentProblem?.id === 1 || currentProblem?.id === "1") {
      const tags = t(`smartCodingLab.relatedTags.twoSum`, { returnObjects: true });
      return Array.isArray(tags) ? tags : [];
    }
    return currentProblem?.tags || [];
  }, [t, currentProblem]);

  // t('smartCodingLab.voiceRecognition.initializing')
  useEffect(() => {
    console.log(t('smartCodingLab.voiceRecognition.initializing'));

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      console.log(t('smartCodingLab.voiceRecognition.supported'));
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'zh-CN';
      recognitionInstance.maxAlternatives = 1;

      console.log(t('smartCodingLab.voiceRecognition.configComplete'), {
        continuous: recognitionInstance.continuous,
        interimResults: recognitionInstance.interimResults,
        lang: recognitionInstance.lang,
        maxAlternatives: recognitionInstance.maxAlternatives
      });

      recognitionInstance.onstart = () => {
        console.log('语音识别已启动');
        setIsListening(true);
      };

      recognitionInstance.onresult = (event) => {
        console.log('语音识别事件触发，结果数量:', event.results.length);

        // 获取最新的识别结果
        const lastResultIndex = event.results.length - 1;
        const lastResult = event.results[lastResultIndex];

        if (lastResult.isFinal) {
          const transcript = lastResult[0].transcript.trim();
          console.log('最终语音识别结果:', transcript, '长度:', transcript.length);

          // 双重检查AI是否正在说话（面试AI或教师AI），如果是则忽略识别结果
          if (isAiSpeakingInInterview || isAiSpeaking) {
            console.log('🚫', t('smartCodingLab.voiceRecognition.aiSpeaking'), transcript, {
              interviewAI: isAiSpeakingInInterview,
              teacherAI: isAiSpeaking
            });
            return;
          }

          // 延迟一小段时间再次检查，防止时序问题
          setTimeout(() => {
            if (isAiSpeakingInInterview || isAiSpeaking) {
              console.log('🚫', t('smartCodingLab.voiceRecognition.delayedCheck'), transcript, {
                interviewAI: isAiSpeakingInInterview,
                teacherAI: isAiSpeaking
              });
              return;
            }

            // 只有当识别结果有实际内容时才发送
            if (transcript.length > 2) {
              console.log('✅', t('smartCodingLab.voiceRecognition.readyToSend'), transcript);
              console.log('Interview state:', interviewState.isActive);
              console.log('Interview mode:', interviewMode);
              console.log('Interview phase:', interviewState.phase);

              // Send voice recognition result directly, don't depend on input box state
              console.log('📤', t('smartCodingLab.voiceRecognition.directSend'));
              sendVoiceMessage(transcript);
            } else {
              console.log(t('smartCodingLab.voiceRecognition.tooShort'), transcript.length);
            }
          }, 100); // Delay 100ms to check again
        } else {
          // Interim result - don't display in input box, only log in console
          const interimTranscript = lastResult[0].transcript;
          console.log(t('smartCodingLab.voiceRecognition.interimResult'), interimTranscript);
          // Remove interim result display to avoid user confusion
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error(t('smartCodingLab.voiceRecognition.error'), event.error, event);

        // Show error message to user
        switch (event.error) {
          case 'not-allowed':
            message.error(t('smartCodingLab.voiceRecognition.microphonePermissionDenied'));
            break;
          case 'no-speech':
            console.log(t('smartCodingLab.voiceRecognition.noSpeechDetected'));
            break;
          case 'network':
            message.error(t('smartCodingLab.voiceRecognition.networkError'));
            break;
          default:
            console.log('语音识别错误:', event.error);
        }

        // 如果是在面试进行中且AI没在说话，自动重启识别（除非是权限错误）
        if (interviewMode && interviewState.isActive && !isAiSpeakingInInterview && !isAiSpeaking && event.error !== 'not-allowed') {
          setTimeout(() => {
            // 再次检查AI说话状态
            if (!isAiSpeakingInInterview && !isAiSpeaking) {
              try {
                if (!isListening) {
                  recognitionInstance.start();
                  setIsListening(true);
                  console.log('语音识别错误后自动重启成功, 错误类型:', event.error);
                } else {
                  console.log('语音识别已在运行，无需重启');
                }
              } catch (e) {
                if (e.message.includes('already started')) {
                  console.log('语音识别已在运行，重启跳过');
                  setIsListening(true);
                } else {
                  console.log('重启失败:', e);
                  setIsListening(false);
                }
              }
            } else {
              console.log('AI正在说话，暂不重启语音识别');
            }
          }, 1000);
        } else {
          setIsListening(false);
          console.log('不满足重启条件: 面试模式:', interviewMode, '面试活跃:', interviewState.isActive, 'AI说话:', isAiSpeakingInInterview, '错误类型:', event.error);
        }
      };

      recognitionInstance.onend = () => {
        console.log('语音识别结束事件触发, AI说话状态:', isAiSpeakingInInterview);
        setIsListening(false);

        // 如果是在面试进行中且AI没有在说话，自动重启识别
        if (interviewMode && interviewState.isActive && !isAiSpeakingInInterview && !isAiSpeaking) {
          setTimeout(() => {
            // 再次检查AI说话状态，防止在延时期间AI开始说话
            if (!isAiSpeakingInInterview && !isAiSpeaking) {
              try {
                recognitionInstance.start();
                setIsListening(true);
                console.log('语音识别结束，自动重启成功');
              } catch (e) {
                if (e.message.includes('already started')) {
                  console.log('语音识别已在运行，重启跳过');
                  setIsListening(true);
                } else {
                  console.log('重启失败:', e);
                  setIsListening(false);
                }
              }
            } else {
              console.log('AI正在说话，暂不重启语音识别');
            }
          }, 500);
        } else {
          console.log('不满足重启条件: 面试模式:', interviewMode, '面试活跃:', interviewState.isActive, 'AI说话:', isAiSpeakingInInterview);
        }
      };

      setRecognition(recognitionInstance);
      console.log('语音识别实例已创建并保存');

      // 设置语音识别健康检查
      const healthCheckInterval = setInterval(() => {
        // 只在面试进行中且AI没说话时检查
        if (interviewMode && interviewState.isActive && !isAiSpeakingInInterview) {
          // 检查语音识别状态
          if (!isListening) {
            console.log('🔍 检测到语音识别未运行，尝试重启');
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

      // 检查麦克风权限
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(() => {
            console.log('麦克风权限已获得');
          })
          .catch((error) => {
            console.error('麦克风权限被拒绝:', error);
            message.warning(t('smartCodingLab.voiceRecognition.microphonePermissionRequired'));
          });
      }
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
  }, []);

  // 修复页面跳转时的滚动问题
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  // 清理AI回复内容，去掉"面试官:"等前缀
  const cleanAIResponse = (content) => {
    if (!content) return content;

    // 去掉各种可能的面试官前缀
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

  // 重启语音识别的辅助函数
  const restartVoiceRecognition = () => {
    if (interviewMode && interviewState.isActive && recognition) {
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

  // 语音录音控制（测试用）
  const toggleListening = () => {
    if (!recognition) {
      message.error(t('smartCodingLab.voiceRecognition.browserNotSupported'));
      return;
    }

    if (isListening) {
      console.log('手动停止语音识别');
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        console.log('手动启动语音识别');
        recognition.start();
        message.info(t('smartCodingLab.voiceRecognition.startingTest'));
      } catch (e) {
        console.error('手动启动失败:', e);
        message.error(t('smartCodingLab.voiceRecognition.startupFailed') + ': ' + e.message);
      }
    }
  };

  // 测试语音识别功能
  const testSpeechRecognition = () => {
    console.log('开始测试语音识别...');
    console.log('recognition object:', recognition);
    console.log('isListening:', isListening);
    console.log('interviewState.isActive:', interviewState.isActive);

    if (recognition) {
      if (!isListening) {
        try {
          console.log('尝试启动语音识别测试');
          recognition.start();
          message.success(t('smartCodingLab.voiceRecognition.testStarted'));
        } catch (e) {
          if (e.message.includes('already started')) {
            console.log('语音识别已在运行，测试继续');
            message.info(t('smartCodingLab.voiceRecognition.alreadyRunning'));
          } else {
            console.error('测试启动失败:', e);
            message.error(t('smartCodingLab.voiceRecognition.testFailed') + ': ' + e.message);
          }
        }
      } else {
        console.log('语音识别已在运行，请直接测试');
        message.info(t('smartCodingLab.voiceRecognition.alreadyRunning'));
      }
    } else {
      message.error(t('smartCodingLab.voiceRecognition.notInitialized'));
    }
  };

  // 格式化时间显示
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 开始面试
  const startInterview = () => {
    setInterviewState(prev => ({
      ...prev,
      isActive: true,
      startTime: new Date(),
      phase: 'active'
    }));

    // 自动开始语音识别监听
    if (recognition) {
      if (!isListening) {
        try {
          console.log('正在启动语音识别...');
          recognition.start();
          // setIsListening将在onstart事件中设置
          console.log('语音识别启动命令已发送');
        } catch (e) {
          if (e.message.includes('already started')) {
            console.log('语音识别已经在运行，无需重复启动');
            setIsListening(true);
            message.info(t('smartCodingLab.voiceRecognition.listeningStarted'));
          } else {
            console.error('启动语音识别失败:', e);
            message.error(t('smartCodingLab.voiceRecognition.startupFailed') + ': ' + e.message);
            setIsListening(false);
          }
        }
      } else {
        console.log('语音识别已经在运行');
        message.info(t('smartCodingLab.voiceRecognition.listeningStarted'));
      }
    } else {
      console.error('语音识别不可用');
      message.warning('浏览器不支持语音识别功能');
    }

    // 生成AI驱动的初始面试问题
    generateInitialInterviewQuestions();
  };

  // 暂停/恢复面试
  const toggleInterviewPause = () => {
    setInterviewState(prev => ({
      ...prev,
      isActive: !prev.isActive,
      phase: prev.isActive ? 'paused' : 'active'
    }));
  };

  // 结束面试
  const endInterview = () => {
    setInterviewState(prev => ({
      ...prev,
      isActive: false,
      phase: 'completed'
    }));
    setInterviewMode(false);
  };

  // 加载课程数据
  const loadCourseLesson = async (courseId, lessonId) => {
    try {
      // 使用fetch加载JSON文件
      const response = await fetch(`/src/data/courses/${courseId}/chapter1/lesson${lessonId}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const lessonData = await response.json();
      return lessonData;
    } catch (error) {
      console.error('课程数据加载失败:', error);
      return null;
    }
  };

  // 获取问题数据
  useEffect(() => {
    const loadProblemData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (pattern && problemId) {
          // 检查是否是课程路径（如 react-fullstack）
          if (pattern.includes('-')) {
            // 加载课程数据
            const lessonData = await loadCourseLesson(pattern, problemId);
            if (lessonData) {
              setCurrentProblem(lessonData);
              setCurrentPattern({ id: pattern, name: lessonData.meta?.title || pattern });
              // 课程使用默认代码模板
              setUserCode(getDefaultTemplate(selectedLanguage));
            } else {
              setError('课程数据加载失败');
            }
          } else {
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
      const template = functionTemplate || fallbackTemplate || getDefaultTemplate(selectedLanguage);
      setUserCode(template);
    }
  }, [selectedLanguage, currentProblem]);

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
          navigate(`/algorithm-learning/coding/${pattern.id}/${probId}`, { replace: true });
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
  const addAIMessage = useCallback((content, type = 'ai') => {
    setAiMessages(prev => [...prev, {
      id: Date.now(),
      type,
      content,
      timestamp: new Date().toLocaleTimeString()
    }]);
  }, []);

  // 处理AI Teacher消息
  const handleAITeacherMessage = useCallback((message) => {
    setAiMessages(prev => [...prev, message]);
  }, []);

  // 处理AI Teacher状态
  const handleAITeacherStatus = useCallback((status) => {
    setAiTeacherStatus(status);
  }, []);

  // 处理AI助教聊天发送
  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: chatMessages.length + 1,
      type: 'user',
      content: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    // 模拟AI回复
    setTimeout(() => {
      const aiMessage = {
        id: chatMessages.length + 2,
        type: 'ai',
        content: t('smartCodingLab.aiTeacher.helpPrompt'),
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

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

      // 统计当前对话轮数（不包括加载中的消息）
      const conversationRounds = Math.floor(interviewMessages.filter(msg => !msg.isLoading).length / 2);

      // 检查是否有follow-up标记的消息
      const hasFollowUpQuestions = interviewMessages.some(msg => msg.isFollowUp);
      const followUpRounds = interviewMessages.filter(msg => msg.isFollowUp || (msg.type === 'candidate' && hasFollowUpQuestions)).length;

      // 构建AI面试官提示词
      let interviewPrompt;

      // 如果已经在follow-up阶段且回答了2-3轮，进行最终评估
      if (hasFollowUpQuestions && followUpRounds >= 4) {
        console.log('🎯 触发最终评估阶段');

        // 构建最终评估提示词
        const evaluationPrompt = `你是一名专业的技术面试官，现在需要对候选人的技术面试表现进行最终评估。

面试题目：${problemTitle}
题目描述：${problemDescription}

对话记录：
${historyContext}
候选人最新回答：${userInput}

请从以下几个维度对候选人进行综合评估，并给出最终结论：

1. 算法理解能力（对问题本质的把握）
2. 解题思路清晰度（逻辑表达能力）
3. 技术深度（算法复杂度分析、优化思考）
4. 沟通交流能力（回答的条理性和专业性）
5. 学习态度（对建议的接受度和思考深度）

评估标准：优秀(90-100)、良好(75-89)、一般(60-74)、待提高(60以下)

请用以下JSON格式输出评估结果：
{
  "overall_score": 总分(0-100),
  "algorithm_understanding": 算法理解得分,
  "problem_solving": 解题能力得分,
  "technical_depth": 技术深度得分,
  "communication": 沟通能力得分,
  "learning_attitude": 学习态度得分,
  "strengths": ["优势1", "优势2"],
  "improvements": ["改进点1", "改进点2"],
  "final_comment": "综合评价总结",
  "recommendation": "是否建议进入下一轮"
}`;

        const evaluationResponse = await aiChat(evaluationPrompt, {
          context: `interview_evaluation`,
          user_level: 'interviewer',
          max_length: 300,
          temperature: 0.3
        });

        console.log('🎯 最终评估AI回复:', evaluationResponse);

        // 移除thinking消息并添加最终评估
        setInterviewMessages(prev => {
          const filtered = prev.filter(msg => !msg.isLoading);
          const finalMessage = {
            id: Date.now(),
            type: 'interviewer',
            content: cleanAIResponse(evaluationResponse.response || evaluationResponse.message || t('smartCodingLab.interviewer.evaluationComplete')),
            timestamp: new Date().toLocaleTimeString(),
            isFinalEvaluation: true
          };
          return [...filtered, finalMessage];
        });

        // 尝试解析评估结果
        try {
          const evaluationData = JSON.parse(evaluationResponse.response || evaluationResponse.message || '{}');
          setInterviewEvaluation(evaluationData);

          // 延迟显示评估弹窗
          setTimeout(() => {
            setShowEvaluation(true);
          }, 2000);
        } catch (parseError) {
          console.log(t('smartCodingLab.errors.parseFailed'), parseError);
          setInterviewEvaluation({
            final_comment: evaluationResponse.response || evaluationResponse.message || t('smartCodingLab.interviewer.evaluationComplete')
          });
          setTimeout(() => {
            setShowEvaluation(true);
          }, 2000);
        }

        // 语音播报最终评估
        if (evaluationResponse.response || evaluationResponse.message) {
          setIsAiSpeakingInInterview(true);
          // 暂停语音识别
          if (recognition && isListening) {
            recognition.stop();
            setIsListening(false);
            console.log('AI开始说话，暂停语音识别');
          }

          try {
            const cleanedText = cleanAIResponse(evaluationResponse.response || evaluationResponse.message);
            const audioBase64 = await textToSpeech(cleanedText);
            if (audioBase64) {
              await playAudioFromBase64(audioBase64);
            }
          } catch (audioError) {
            console.error('语音播报失败:', audioError);
          } finally {
            setIsAiSpeakingInInterview(false);
            // 重新启动语音识别
            if (interviewMode && interviewState.isActive && recognition) {
              setTimeout(() => {
                try {
                  recognition.start();
                  setIsListening(true);
                  console.log('AI说话结束，重新启动语音识别');
                } catch (e) {
                  if (e.message.includes('already started')) {
                    setIsListening(true);
                  }
                }
              }, 500);
            }
          }
        }

        return;
      }

      // 如果对话轮数达到6轮，引导用户开始编码
      if (conversationRounds >= 6) {
        console.log('💻 触发编码引导阶段');

        const codingPrompt = `你是一名专业的技术面试官，现在需要引导候选人开始编码环节。

面试题目：${problemTitle}
题目描述：${problemDescription}

对话记录：
${historyContext}
候选人最新回答：${userInput}

现在请引导候选人开始实际编码：
1. 简要总结他们的思路（1句话）
2. 鼓励他们开始在编辑器中实现代码
3. 提醒他们可以边写边讲解思路

要求：语言简洁，鼓励性，引导开始编码实战。`;

        const codingResponse = await aiChat(codingPrompt, {
          context: `interview_coding_start`,
          user_level: 'interviewer',
          max_length: 50,
          temperature: 0.4
        });

        console.log('💻 编码引导AI回复:', codingResponse);

        // 移除thinking消息并添加编码引导
        setInterviewMessages(prev => {
          const filtered = prev.filter(msg => !msg.isLoading);
          const codingMessage = {
            id: Date.now(),
            type: 'interviewer',
            content: cleanAIResponse(codingResponse.response || codingResponse.message || t('smartCodingLab.interviewer.codingPrompt')),
            timestamp: new Date().toLocaleTimeString(),
            isCodingStart: true
          };
          return [...filtered, codingMessage];
        });

        // 语音播报编码引导
        if (codingResponse.response || codingResponse.message) {
          setIsAiSpeakingInInterview(true);
          // 暂停语音识别
          if (recognition && isListening) {
            recognition.stop();
            setIsListening(false);
            console.log('AI开始说话，暂停语音识别');
          }

          try {
            const cleanedText = cleanAIResponse(codingResponse.response || codingResponse.message);
            const audioBase64 = await textToSpeech(cleanedText);
            if (audioBase64) {
              await playAudioFromBase64(audioBase64);
            }
          } catch (audioError) {
            console.error('语音播报失败:', audioError);
          } finally {
            setIsAiSpeakingInInterview(false);
            // 重新启动语音识别
            if (interviewMode && interviewState.isActive && recognition) {
              setTimeout(() => {
                try {
                  recognition.start();
                  setIsListening(true);
                  console.log('AI说话结束，重新启动语音识别');
                } catch (e) {
                  if (e.message.includes('already started')) {
                    setIsListening(true);
                  }
                }
              }, 500);
            }
          }
        }

        return;
      }

      // 如果对话轮数达到4轮且还没有follow-up，开始深入提问
      if (conversationRounds >= 4 && conversationRounds < 6 && !hasFollowUpQuestions) {
        console.log('🔄 触发Follow-up提问阶段');

        const followUpPrompt = `你是一名资深的技术面试官，现在需要对候选人进行深入的follow-up提问。

面试题目：${problemTitle}
题目描述：${problemDescription}

前面的对话记录：
${historyContext}
候选人最新回答：${userInput}

现在请你作为面试官，针对候选人前面的回答进行一个深入的follow-up问题。要求：
1. 基于候选人已有的理解，提一个更深层次的技术问题
2. 可以问算法优化、边界条件、扩展场景等
3. 保持专业和友好的语气
4. 问题要具体，避免太宽泛

面试官要求：简洁专业，不超过20字，一次只问一个深入问题：`;

        const followUpResponse = await aiChat(followUpPrompt, {
          context: `interview_followup`,
          user_level: 'interviewer',
          max_length: 50,
          temperature: 0.4
        });

        console.log('🔄 Follow-up AI回复:', followUpResponse);

        // 移除thinking消息并添加follow-up问题
        setInterviewMessages(prev => {
          const filtered = prev.filter(msg => !msg.isLoading);
          const followUpMessage = {
            id: Date.now(),
            type: 'interviewer',
            content: cleanAIResponse(followUpResponse.response || followUpResponse.message || t('smartCodingLab.interviewer.followUpQuestion')),
            timestamp: new Date().toLocaleTimeString(),
            isFollowUp: true
          };
          return [...filtered, followUpMessage];
        });

        // 语音播报follow-up问题
        if (followUpResponse.response || followUpResponse.message) {
          setIsAiSpeakingInInterview(true);
          // 暂停语音识别
          if (recognition && isListening) {
            recognition.stop();
            setIsListening(false);
            console.log('AI开始说话，暂停语音识别');
          }

          try {
            const cleanedText = cleanAIResponse(followUpResponse.response || followUpResponse.message);
            const audioBase64 = await textToSpeech(cleanedText);
            if (audioBase64) {
              await playAudioFromBase64(audioBase64);
            }
          } catch (audioError) {
            console.error('语音播报失败:', audioError);
          } finally {
            setIsAiSpeakingInInterview(false);
            // 重新启动语音识别
            if (interviewMode && interviewState.isActive && recognition) {
              setTimeout(() => {
                try {
                  recognition.start();
                  setIsListening(true);
                  console.log('AI说话结束，重新启动语音识别');
                } catch (e) {
                  if (e.message.includes('already started')) {
                    setIsListening(true);
                  }
                }
              }, 500);
            }
          }
        }

        return;
      }

      // 普通面试对话阶段
      if (conversationRounds === 0) {
        // 首轮回合 - 开场问题
        interviewPrompt = `你是一名友好但专业的技术面试官，现在开始对候选人进行技术面试。

面试题目：《${problemTitle}》
题目描述：${problemDescription}

候选人刚才说：${userInput}

请作为面试官对候选人的回答进行回应，并继续推进面试流程：
1. 如果候选人回答了解题思路，请给予适当反馈并询问更多细节
2. 如果候选人表达了困惑，请给出适当的引导和提示
3. 保持专业友好的面试官语气
4. 每次回复控制在1-2句话内

面试官回复指导原则：
- 鼓励候选人表达完整思路
- 适时询问算法复杂度
- 关注解题过程中的逻辑思考

示例格式："请先说说你对这道题的理解，有什么解题思路？"`;

        const aiResponse = await aiChat(interviewPrompt, {
          context: `interview_start`,
          user_level: 'interviewer',
          max_length: 40,
          temperature: 0.5
        });

        console.log('🤖 开场AI回复:', aiResponse);

        // 移除thinking消息并添加开场回复
        setInterviewMessages(prev => {
          const filtered = prev.filter(msg => !msg.isLoading);
          const aiMessage = {
            id: Date.now(),
            type: 'interviewer',
            content: cleanAIResponse(aiResponse.response || aiResponse.message || t('smartCodingLab.interviewer.understandingPrompt')),
            timestamp: new Date().toLocaleTimeString()
          };
          return [...filtered, aiMessage];
        });

        // 语音播报开场回复
        if (aiResponse.response || aiResponse.message) {
          setIsAiSpeakingInInterview(true);
          // 暂停语音识别
          if (recognition && isListening) {
            recognition.stop();
            setIsListening(false);
            console.log('AI开始说话，暂停语音识别');
          }

          try {
            const cleanedText = cleanAIResponse(aiResponse.response || aiResponse.message);
            const audioBase64 = await textToSpeech(cleanedText);
            if (audioBase64) {
              await playAudioFromBase64(audioBase64);
            }
          } catch (audioError) {
            console.error('语音播报失败:', audioError);
          } finally {
            setIsAiSpeakingInInterview(false);
            // 重新启动语音识别
            if (interviewMode && interviewState.isActive && recognition) {
              setTimeout(() => {
                try {
                  recognition.start();
                  setIsListening(true);
                  console.log('AI说话结束，重新启动语音识别');
                } catch (e) {
                  if (e.message.includes('already started')) {
                    setIsListening(true);
                  }
                }
              }, 500);
            }
          }
        }

        return;
      }

      // 检查是否已进入编码阶段（第6轮之后）
      const isInCodingPhase = conversationRounds >= 6;
      const hasCodingStartMessage = interviewMessages.some(msg => msg.isCodingStart);

      if (isInCodingPhase || hasCodingStartMessage) {
        // 编码阶段 - 减少AI干扰，只在必要时回应
        const shouldRespond =
          userInput.includes(t('smartCodingLab.interviewKeywords.completed')) ||
          userInput.includes(t('smartCodingLab.interviewKeywords.finished')) ||
          userInput.includes(t('smartCodingLab.interviewKeywords.how')) ||
          userInput.includes(t('smartCodingLab.interviewKeywords.correct')) ||
          userInput.includes(t('smartCodingLab.interviewKeywords.right')) ||
          userInput.includes(t('smartCodingLab.interviewKeywords.problem')) ||
          userInput.includes(t('smartCodingLab.interviewKeywords.error')) ||
          userInput.includes('help') ||
          userInput.includes(t('smartCodingLab.interviewKeywords.help')) ||
          userInput.length < 10; // 短句可能是求助

        if (!shouldRespond) {
          // 不需要回应，只在控制台记录用户在编码
          console.log('👨‍💻 用户在编码中，AI保持静默:', userInput);

          // 移除thinking消息，不添加新回复
          setInterviewMessages(prev => prev.filter(msg => !msg.isLoading));

          return; // 直接返回，不触发AI回复
        }

        // 需要回应时使用编码阶段的简短回复
        interviewPrompt = `你是一名技术面试官，候选人正在编码。请给出简短的回应（1句话）：

候选人说：${userInput}

如果他们：
- 遇到问题：给出简短提示
- 询问方向：简要确认或建议
- 完成编码：鼓励并可以询问复杂度或优化

要求：回复极其简洁（1句话，不超过15字），不要打断编码思路。`;

      } else {
        // 普通面试对话阶段
        interviewPrompt = `你是一名专业的技术面试官，正在进行技术面试的第${conversationRounds + 1}轮对话。

面试题目：${problemTitle}
题目描述：${problemDescription}

对话历史：
${historyContext}
候选人最新回答：${userInput}

请作为面试官继续面试对话，要求：
1. 针对候选人的回答给出专业反馈
2. 根据面试进度提出合适的后续问题
3. 保持友好但专业的面试官语气
4. 控制回复长度在1-2句话内
5. 逐步深入技术细节

面试评估重点：
- 算法思维逻辑
- 代码实现能力
- 复杂度分析
- 问题解决思路

回复要求：简洁专业，适当引导，逐步深入`;
      }

      console.log('🤖 发送给AI的提示词:', interviewPrompt);
      console.log('🤖 AI调用参数:', { context: `interview_conversation`, user_level: 'interviewer', max_length: conversationRounds >= 6 ? 50 : 60 });

      const aiResponse = await aiChat(interviewPrompt, {
        context: `interview_conversation`,
        user_level: 'interviewer',
        max_length: conversationRounds >= 6 ? 50 : 60,
        temperature: 0.4
      });

      console.log('🤖 AI回复结果:', aiResponse);

      // 移除thinking消息并添加AI回复
      setInterviewMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        const aiMessage = {
          id: Date.now(),
          type: 'interviewer',
          content: cleanAIResponse(aiResponse.response || aiResponse.message || t('smartCodingLab.interviewer.continueThinking')),
          timestamp: new Date().toLocaleTimeString()
        };
        return [...filtered, aiMessage];
      });

      // 语音播报AI回复
      if (aiResponse.response || aiResponse.message) {
        setIsAiSpeakingInInterview(true);
        // 暂停语音识别
        if (recognition && isListening) {
          recognition.stop();
          setIsListening(false);
          console.log('AI开始说话，暂停语音识别');
        }

        try {
          const cleanedText = cleanAIResponse(aiResponse.response || aiResponse.message);
          const audioBase64 = await textToSpeech(cleanedText);
          if (audioBase64) {
            await playAudioFromBase64(audioBase64);
          }
        } catch (audioError) {
          console.error('语音播报失败:', audioError);
        } finally {
          setIsAiSpeakingInInterview(false);
          // 重新启动语音识别
          if (interviewMode && interviewState.isActive && recognition) {
            setTimeout(() => {
              try {
                recognition.start();
                setIsListening(true);
                console.log('AI说话结束，重新启动语音识别');
              } catch (e) {
                if (e.message.includes('already started')) {
                  setIsListening(true);
                }
              }
            }, 500);
          }
        }
      }

    } catch (error) {
      console.error('AI面试对话失败:', error);

      // 移除thinking消息并添加错误提示
      setInterviewMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        const errorMessage = {
          id: Date.now(),
          type: 'interviewer',
          content: t('smartCodingLab.interviewer.errorResponse'),
          timestamp: new Date().toLocaleTimeString(),
          isError: true
        };
        return [...filtered, errorMessage];
      });
    }
  };

  // 处理AI面试官聊天发送 - 使用真实的AI API
  const handleInterviewChatSend = async () => {
    console.log('handleInterviewChatSend 被调用，输入内容:', interviewInput);
    if (!interviewInput.trim()) {
      console.log('输入内容为空，返回');
      return;
    }

    const userMessage = {
      id: interviewMessages.length + 1,
      type: 'candidate',
      content: interviewInput.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    setInterviewMessages(prev => [...prev, userMessage]);
    const userInput = interviewInput.trim();
    setInterviewInput('');

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

      // 统计当前对话轮数（不包括加载中的消息）
      const conversationRounds = Math.floor(interviewMessages.filter(msg => !msg.isLoading).length / 2);

      // 检查是否有follow-up标记的消息
      const hasFollowUpQuestions = interviewMessages.some(msg => msg.isFollowUp);
      const followUpRounds = interviewMessages.filter(msg => msg.isFollowUp || (msg.type === 'candidate' && hasFollowUpQuestions)).length;

      // 构建AI面试官提示词
      let interviewPrompt;

      // 如果已经在follow-up阶段且回答了2-3轮，进行最终评估
      if (hasFollowUpQuestions && followUpRounds >= 4) {
        // 自动触发最终评估
        setTimeout(() => {
          generateFinalEvaluation();
        }, 1000);

        interviewPrompt = `非常好！我已经了解了你的想法。现在让我对你的整体面试表现进行评估，请稍候...`;
      } else if (conversationRounds >= 6 && !hasFollowUpQuestions) {
        // 6轮对话后，引导开始写代码
        interviewPrompt = `你是一位经验丰富的技术面试官，正在进行算法题的技术面试。

面试题目：《${problemTitle}》
题目描述：${problemDescription}

对话历史：
${historyContext}

候选人刚刚回答：${userInput}

你们已经讨论了${conversationRounds}轮，现在应该引导候选人开始写代码了（达到6轮面试对话限制）。

请引导候选人开始编写代码，可以说类似：
"很好的想法！现在让我们开始写代码吧。请在右侧的代码编辑器中实现你的解决方案。"
"理解得很透彻！现在请动手实现这个算法，我会观察你的编码过程。"
"思路很清晰！那么现在开始coding吧，有问题随时问我。"

面试官要求：简洁专业，不超过25字，只引导编码：`;
      } else if (hasFollowUpQuestions) {
        // 在follow-up阶段，继续深入提问
        interviewPrompt = `你是技术面试官，候选人已提交代码，你在进行follow-up提问。

当前问题：《${problemTitle}》
候选人刚回答：${userInput}

请继续深入提问，重点关注：
1. 算法复杂度分析
2. 优化方案
3. 实际应用场景
4. 边界情况

面试官要求：简短专业，不超过20字，一次只问一个深入问题：`;
      } else {
        // 前3轮，继续提问引导思考
        interviewPrompt = `你是一位经验丰富的技术面试官，正在进行算法题的技术面试。

面试题目：《${problemTitle}》
题目描述：${problemDescription}

对话历史：
${historyContext}

候选人刚刚回答：${userInput}

这是第${conversationRounds + 1}轮对话，你需要继续通过提问来评估候选人的思考过程。要求：
1. 保持专业和友好的面试氛围
2. 根据候选人的回答水平调整问题难度
3. 重点关注算法思路、复杂度分析、边界情况
4. 如果候选人答错或不知道，给出适当提示而不是直接给答案
5. 每次回复控制在60字以内，保持对话的流畅性
6. 针对具体的题目《${problemTitle}》进行相关提问

面试官要求：简洁专业，不超过30字，不详细解释，只提问或简短回应：`;
      }

      // 调用真实的AI API
      console.log('🤖 发送给AI的提示词:', interviewPrompt);
      console.log('🤖 AI调用参数:', { context: `interview_manual`, user_level: 'interviewer', max_length: conversationRounds >= 6 ? 50 : 60 });

      const aiResponse = await aiChat(interviewPrompt, {
        context: `interview_manual`,
        user_level: 'interviewer',
        max_length: conversationRounds >= 6 ? 50 : 60,
        page_url: window.location.href,
        page_type: 'algorithm_interview',
        recent_actions: ['面试对话'],
        language: 'zh-CN'
      });

      console.log('🤖 AI原始响应:', aiResponse);

      // 移除思考中的消息，添加AI回复
      setInterviewMessages(prev => prev.filter(msg => !msg.isLoading));

      const aiMessage = {
        id: interviewMessages.length + 3,
        type: 'interviewer',
        content: aiResponse.response || t('smartCodingLab.interviewer.fallbackResponse'),
        timestamp: new Date().toLocaleTimeString()
      };
      setInterviewMessages(prev => [...prev, aiMessage]);

      // 播放AI回复的语音
      if (aiResponse.response && interviewMode && interviewState.isActive) {
        const cleanedText = cleanAIResponse(aiResponse.response);
        await playAIResponseSpeech(cleanedText);
      }

    } catch (error) {
      console.error('🚨 AI面试官API调用失败:', error);
      console.log('🚨 用户输入:', userInput);
      console.log('🚨 问题标题:', problemTitle);

      // 移除思考中的消息，添加错误回复
      setInterviewMessages(prev => prev.filter(msg => !msg.isLoading));

      // 降级到本地逻辑
      const fallbackResponse = generateFallbackResponse(userInput, problemTitle);
      console.log('🚨 使用fallback回复:', fallbackResponse);

      const aiMessage = {
        id: interviewMessages.length + 3,
        type: 'interviewer',
        content: fallbackResponse,
        timestamp: new Date().toLocaleTimeString()
      };
      setInterviewMessages(prev => [...prev, aiMessage]);
    }
  };

  // 降级方案：当AI API不可用时的本地逻辑
  const generateFallbackResponse = (userInput, problemTitle) => {
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes(t('smartCodingLab.interviewKeywords.unknown')) || lowerInput.includes(t('smartCodingLab.interviewKeywords.unclear'))) {
      return t('smartCodingLab.fallback.unknownResponse', { title: problemTitle });
    }
    if (lowerInput.includes(t('smartCodingLab.interviewKeywords.hash')) || lowerInput.includes('hash')) {
      return t('smartCodingLab.fallback.hashMapResponse');
    }
    if (lowerInput.includes(t('smartCodingLab.interviewKeywords.bruteForce')) || lowerInput.includes(t('smartCodingLab.interviewKeywords.loop'))) {
      return t('smartCodingLab.fallback.bruteForceResponse');
    }
    if (lowerInput.includes('o(n') || lowerInput.includes(t('smartCodingLab.interviewKeywords.complexity'))) {
      return t('smartCodingLab.fallback.complexityResponse');
    }

    // 默认回复
    const conversationRound = Math.floor(interviewMessages.length / 2);
    if (conversationRound <= 1) {
      return t('smartCodingLab.fallback.implementationResponse');
    } else if (conversationRound === 2) {
      return t('smartCodingLab.fallback.analysisResponse');
    } else {
      return t('smartCodingLab.fallback.boundaryResponse');
    }
  };

  // AI语音讲解功能 - 参考课堂页面实现
  const handleAiVoiceLecture = async (topic, boardActionCallback = null) => {
    // 清除之前的聊天消息，避免显示缓存的内容
    setChatMessages([]);

    // 添加准备消息
    const preparingMessage = {
      id: Date.now(),
      type: 'ai',
      content: `🎯 正在为你准备《${topic}》的详细讲解...`,
      timestamp: new Date().toLocaleTimeString(),
      isLoading: true
    };

    setChatMessages(prev => [...prev, preparingMessage]);

    try {
      // 第一步：生成AI讲解内容
      setAiThinking(true);

      const problemTitle = translateProblem(currentProblem?.id) || '当前算法题目';
      const problemDescription = enhancedProblemData?.description || currentProblem?.description || '';

      const lecturePrompt = `作为专业的算法教师，请为算法题《${problemTitle}》提供关于"${topic}"的详细讲解。

题目描述：${problemDescription}

请提供：
1. 清晰的概念解释
2. 具体的算法分析
3. 实用的解题技巧
4. 相关的复杂度分析

要求：讲解要深入浅出，适合算法学习者理解，控制在200字以内。`;

      const textResult = await aiTeacherLecture(lecturePrompt, {
        context: `算法教学 - ${problemTitle}`,
        user_level: 'intermediate',
        max_length: 200,
        page_url: window.location.href,
        page_type: 'algorithm_teaching'
      });

      setAiThinking(false);

      // 移除加载消息
      setChatMessages(prev => prev.filter(msg => !msg.isLoading));

      // 添加文本内容
      const textMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: textResult.text || textResult.response || `关于${topic}的讲解内容已生成`,
        timestamp: new Date().toLocaleTimeString(),
        hasText: true
      };

      setChatMessages(prev => [...prev, textMessage]);

      // 如果有黑板回调，执行黑板动作
      if (boardActionCallback) {
        const boardMessage = {
          id: Date.now() + 1.5,
          type: 'ai',
          content: `📝 正在黑板上为你绘制${topic}的图解...`,
          timestamp: new Date().toLocaleTimeString(),
          isLoading: true
        };

        setChatMessages(prev => [...prev, boardMessage]);

        try {
          await boardActionCallback();
        } catch (boardError) {
          console.error('黑板操作失败:', boardError);
        }

        // 2秒后移除黑板消息
        setTimeout(() => {
          setChatMessages(prev => prev.filter(msg => msg.content !== boardMessage.content));
        }, 2000);
      }

      // 第二步：生成语音（后台进行）
      setIsPlayingAudio(true);
      const audioMessage = {
        id: Date.now() + 2,
        type: 'ai',
        content: `🎵 正在生成语音，即将播放...`,
        timestamp: new Date().toLocaleTimeString(),
        isLoading: true
      };

      setChatMessages(prev => [...prev, audioMessage]);

      try {
        setTtsGenerating(true);
        const audioBase64 = await textToSpeech(textResult.text || textResult.response, 'alloy', 'tts-1');
        setTtsGenerating(false);

        // 移除语音生成消息
        setChatMessages(prev => prev.filter(msg => !msg.isLoading));

        // 播放语音
        setIsAiSpeaking(true);
        // 如果在面试模式，也要控制语音识别
        if (interviewMode && interviewState.isActive && recognition && isListening) {
          recognition.stop();
          setIsListening(false);
          console.log('🛑 AI教师语音：暂停面试语音识别');
        }

        await playAudioFromBase64(audioBase64);
        setIsAiSpeaking(false);

        // 如果在面试模式，重新启动语音识别
        if (interviewMode && interviewState.isActive && recognition) {
          setTimeout(() => {
            try {
              recognition.start();
              setIsListening(true);
              console.log('✅ AI教师语音结束：重启面试语音识别');
            } catch (e) {
              if (e.message.includes('already started')) {
                setIsListening(true);
              }
            }
          }, 500);
        }

        // 更新文本消息，标记为已播放语音
        setChatMessages(prev => prev.map(msg =>
          msg.hasText ? {
            ...msg,
            content: `🎵 ${textResult.text || textResult.response}`,
            hasAudio: true
          } : msg
        ));

      } catch (audioError) {
        console.error('语音生成失败:', audioError);
        setTtsGenerating(false);
        setIsAiSpeaking(false);

        // 移除语音加载消息
        setChatMessages(prev => prev.filter(msg => !msg.isLoading));

        // 添加语音失败提示
        const audioErrorMessage = {
          id: Date.now() + 3,
          type: 'ai',
          content: '⚠️ 语音生成失败，但文字内容已准备好供你阅读',
          timestamp: new Date().toLocaleTimeString(),
          isError: true
        };

        setChatMessages(prev => [...prev, audioErrorMessage]);

        // 使用浏览器内置TTS作为备选
        try {
          setIsAiSpeaking(true);
          // 如果在面试模式，也要控制语音识别
          if (interviewMode && interviewState.isActive && recognition && isListening) {
            recognition.stop();
            setIsListening(false);
            console.log('🛑 备选AI语音：暂停面试语音识别');
          }

          const utterance = new SpeechSynthesisUtterance(textResult.text || textResult.response);
          utterance.lang = 'zh-CN';
          utterance.rate = 0.9;
          utterance.onend = () => {
            setIsAiSpeaking(false);
            // 如果在面试模式，重新启动语音识别
            if (interviewMode && interviewState.isActive && recognition) {
              setTimeout(() => {
                try {
                  recognition.start();
                  setIsListening(true);
                  console.log('✅ 备选AI语音结束：重启面试语音识别');
                } catch (e) {
                  if (e.message.includes('already started')) {
                    setIsListening(true);
                  }
                }
              }, 500);
            }
          };
          speechSynthesis.speak(utterance);
        } catch (fallbackError) {
          setIsAiSpeaking(false);
          console.error('备选语音也失败:', fallbackError);
        }
      }

      setIsPlayingAudio(false);

    } catch (error) {
      console.error('AI讲解生成失败:', error);
      setAiThinking(false);
      setTtsGenerating(false);
      setIsAiSpeaking(false);
      setIsPlayingAudio(false);

      // 移除所有加载消息
      setChatMessages(prev => prev.filter(msg => !msg.isLoading));

      // 添加错误消息
      const errorMessage = {
        id: Date.now() + 4,
        type: 'ai',
        content: `❌ 抱歉，${topic}的讲解生成失败，请稍后重试。错误信息：${error.message}`,
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };

      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  // 处理AI教师主题点击 - 重写为真实AI调用
  const handleTopicClick = async (topic) => {
    // 调用AI语音讲解功能
    await handleAiVoiceLecture(topic);
  };

  // 处理TTS进度
  const handleTTSProgress = useCallback((progress) => {
    setTtsProgress(progress);
  }, []);

  // AIBlackboard回调函数
  const handleDrawingChange = useCallback((data) => {
    setDrawingData(data);
  }, []);

  const handleAITeach = useCallback((topic, boardActionCallback) => {
    console.log('AI黑板教学触发:', topic);
    console.log('黑板回调函数:', boardActionCallback);
    // 调用AI语音讲解功能，传入黑板回调
    handleAiVoiceLecture(topic, boardActionCallback);
  }, []);

  const handleStartVoiceChat = useCallback(() => {
    setVoiceChatStates(prev => ({ ...prev, isRecording: true }));
    addAIMessage(t('smartCodingLab.voiceChat.starting'));
  }, [addAIMessage]);

  // 显示示例代码
  const handleShowExamples = useCallback(() => {
    setShowExamples(true);
    setCurrentTab('examples');
  }, []);

  // 隐藏示例代码
  const handleHideExamples = useCallback(() => {
    setShowExamples(false);
  }, []);

  // 显示提示
  const handleShowHints = useCallback(() => {
    setShowHints(true);
    setCurrentTab('hints');
  }, []);

  // 面试代码提交处理 - 先问follow-up问题
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
        user_level: 'interviewer',
        max_length: 50,
        page_url: window.location.href,
        page_type: 'interview_followup'
      });

      // 移除思考中的消息
      setInterviewMessages(prev => prev.filter(msg => !msg.isLoading));

      // 添加AI面试官的follow-up问题
      const followUpMessage = {
        id: interviewMessages.length + 1,
        type: 'interviewer',
        content: followUpResponse.response || followUpResponse || t('smartCodingLab.followUp.timeComplexityQuestion'),
        timestamp: new Date().toLocaleTimeString(),
        isFollowUp: true
      };

      setInterviewMessages(prev => [...prev, followUpMessage]);

    } catch (error) {
      console.error('Follow-up问题生成失败:', error);

      // 移除思考中的消息
      setInterviewMessages(prev => prev.filter(msg => !msg.isLoading));

      // 生成默认follow-up问题
      const defaultQuestions = [
        t('smartCodingLab.followUp.timeComplexityQuestion'),
        t('smartCodingLab.followUp.otherApproachQuestion'),
        t('smartCodingLab.followUp.optimizationQuestion'),
        t('smartCodingLab.followUp.boundaryQuestion')
      ];

      // 基于测试结果选择问题而不是随机选择
      const passRate = testResults.filter(t => t.passed).length / testResults.length;
      let contextualQuestion;
      if (passRate === 1.0) {
        contextualQuestion = t('smartCodingLab.followUp.allTestsPassed');
      } else if (passRate >= 0.5) {
        contextualQuestion = t('smartCodingLab.followUp.mostTestsPassed');
      } else {
        contextualQuestion = t('smartCodingLab.followUp.fewTestsPassed');
      }
      const randomQuestion = contextualQuestion;

      const followUpMessage = {
        id: interviewMessages.length + 1,
        type: 'interviewer',
        content: randomQuestion,
        timestamp: new Date().toLocaleTimeString(),
        isFollowUp: true
      };

      setInterviewMessages(prev => [...prev, followUpMessage]);
    }
  };

  // 最终评估函数 - 在follow-up对话结束后调用
  const generateFinalEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const problemTitle = translateProblem(currentProblem?.id) || t('smartCodingLab.ui.twoSum');
      const conversationHistory = interviewMessages
        .filter(msg => !msg.isLoading)
        .map(msg => `${msg.type === 'candidate' ? t('smartCodingLab.evaluationCriteria.candidate') : t('smartCodingLab.evaluationCriteria.interviewer')}: ${msg.content}`)
        .join('\n');
      const passRate = Math.round((testResults.filter(t => t.passed).length / testResults.length) * 100);

      const evaluationPrompt = `作为资深技术面试官，请对整个面试过程进行综合评估：

题目：${problemTitle}
代码：${userCode}
测试通过率：${passRate}%
完整对话记录：${conversationHistory}

请从以下维度评分（1-10分）并给出JSON格式：
{
  "correctness": 分数,
  "efficiency": 分数,
  "quality": 分数,
  "communication": 分数,
  "problemSolving": 分数,
  "totalScore": 总分,
  "grade": "优秀/良好/一般/待改进",
  "summary": "总体评价",
  "strengths": ["优点1", "优点2"],
  "improvements": ["建议1", "建议2"],
  "recommendation": "是否建议进入下一轮"
}`;

      const evaluationResponse = await aiChat(evaluationPrompt, {
        context: `技术面试最终评估 - ${problemTitle}`,
        user_level: 'interviewer',
        max_length: 300,
        page_url: window.location.href,
        page_type: 'interview_final_evaluation'
      });

      let evaluation;
      try {
        // 尝试解析AI返回的JSON
        const responseData = evaluationResponse.response || evaluationResponse;

        // 如果是字符串，尝试解析JSON
        if (typeof responseData === 'string') {
          evaluation = JSON.parse(responseData);
        } else {
          evaluation = responseData;
        }

        // 验证评估结果的必要字段
        if (!evaluation.totalScore || !evaluation.grade) {
          throw new Error('评估结果格式不完整');
        }

        console.log('AI评估结果:', evaluation);
      } catch (parseError) {
        console.error('AI评估解析失败:', parseError);
        console.log('原始AI响应:', evaluationResponse);

        // 如果AI返回失败，基于测试通过率生成基础评估
        const passRate = testResults.filter(t => t.passed).length / testResults.length;
        const baseScore = Math.round(passRate * 6 + 2); // 2-8分范围

        evaluation = {
          correctness: Math.min(Math.max(baseScore, 1), 10),
          efficiency: Math.min(Math.max(baseScore - 1, 1), 10),
          quality: Math.min(Math.max(baseScore - 1, 1), 10),
          communication: 5, // 默认中等水平
          problemSolving: Math.min(Math.max(baseScore, 1), 10),
          totalScore: Math.round((baseScore * 4 + 5) / 5 * 10) / 10,
          grade: passRate >= 0.8 ? t('smartCodingLab.evaluation.good') : passRate >= 0.6 ? t('smartCodingLab.evaluation.average') : t('smartCodingLab.evaluation.needsImprovement'),
          summary: t('smartCodingLab.evaluation.testSummary', { rate: Math.round(passRate * 100), result: passRate >= 0.8 ? t('smartCodingLab.evaluation.goodPerformance') : t('smartCodingLab.evaluation.needsEffort') }),
          strengths: passRate >= 0.8 ? [t('smartCodingLab.evaluation.basicCorrect')] : [t('smartCodingLab.evaluation.activeAttempt')],
          improvements: passRate < 0.8 ? [t('smartCodingLab.evaluation.needsImprovement')] : [t('smartCodingLab.evaluation.canOptimize')],
          recommendation: passRate >= 0.6 ? t('smartCodingLab.evaluation.proceedNext') : t('smartCodingLab.evaluation.furtherImprovement')
        };
      }

      setInterviewEvaluation(evaluation);
      setShowEvaluation(true);

    } catch (error) {
      console.error('最终评估失败:', error);
      const defaultEvaluation = {
        correctness: 6, efficiency: 6, quality: 6, communication: 7, problemSolving: 6,
        totalScore: 6.2, grade: t('smartCodingLab.evaluation.average'), summary: t('smartCodingLab.evaluation.systemUnavailable'),
        strengths: [t('smartCodingLab.evaluation.activeParticipation')], improvements: [t('smartCodingLab.evaluation.needsFurtherEvaluation')],
        recommendation: t('smartCodingLab.evaluation.needsFurtherEvaluation')
      };
      setInterviewEvaluation(defaultEvaluation);
      setShowEvaluation(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  // 保存面试记录
  const saveInterviewRecord = () => {
    if (!interviewEvaluation) return;

    const interviewRecord = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      problemTitle: translateProblem(currentProblem?.id) || t('problemInterface.twoSum'),
      problemId: currentProblem?.id,
      patternId: currentPattern?.id,
      duration: Math.round((1800 - interviewState.timeRemaining) / 60), // 面试时长（分钟）
      evaluation: interviewEvaluation,
      conversation: interviewMessages.filter(msg => !msg.isLoading),
      submittedCode: userCode,
      language: selectedLanguage,
      testResults: testResults
    };

    // 保存到localStorage
    const existingRecords = JSON.parse(localStorage.getItem('interviewRecords') || '[]');
    const updatedRecords = [interviewRecord, ...existingRecords].slice(0, 10); // 最多保存10条记录
    localStorage.setItem('interviewRecords', JSON.stringify(updatedRecords));

    message.success(t('smartCodingLab.interview.recordSaved'));
    setShowEvaluation(false);

    // 可以在这里添加发送到后端的逻辑
    console.log('面试记录已保存:', interviewRecord);
  };

  // 隐藏提示
  const handleHideHints = useCallback(() => {
    setShowHints(false);
  }, []);

  // 生成AI驱动的初始面试问题
  const generateInitialInterviewQuestions = async () => {
    try {
      const problemTitle = translateProblem(currentProblem?.id) || '算法题目';
      const problemDescription = enhancedProblemData?.description || currentProblem?.description || '';
      const difficulty = translateDifficulty(currentProblem?.difficulty) || '中等';

      // 先设置欢迎消息和正在生成状态
      setInterviewMessages([
        {
          id: 1,
          type: 'interviewer',
          content: '👋 你好！欢迎参加这次技术面试。',
          timestamp: new Date().toLocaleTimeString()
        },
        {
          id: 2,
          type: 'interviewer',
          content: `🎯 今天我们要讨论的题目是《${problemTitle}》`,
          timestamp: new Date().toLocaleTimeString()
        },
        {
          id: 3,
          type: 'interviewer',
          content: '🤔 AI面试官正在准备开场问题...',
          timestamp: new Date().toLocaleTimeString(),
          isLoading: true
        }
      ]);

      // 生成个性化的开场问题
      const initialPrompt = `你是技术面试官，即将开始面试算法题《${problemTitle}》。
题目难度：${difficulty}
题目描述：${problemDescription}

请生成一个个性化的开场问题，要求：
- 简洁专业，不超过30字
- 基于具体题目特点
- 引导候选人先描述理解和思路
- 像真实面试官的开场

示例格式："请先说说你对这道题的理解，有什么解题思路？"`;

      const aiResponse = await aiChat(initialPrompt, {
        context: `技术面试开场 - ${problemTitle}`,
        user_level: 'interviewer',
        max_length: 40,
        page_url: window.location.href,
        page_type: 'interview_opening'
      });

      // 移除loading消息，添加AI生成的开场问题
      setInterviewMessages(prev => prev.filter(msg => !msg.isLoading));

      const openingQuestion = {
        id: 3,
        type: 'interviewer',
        content: aiResponse.response || t('smartCodingLab.interviewer.startPrompt'),
        timestamp: new Date().toLocaleTimeString()
      };

      setInterviewMessages(prev => [...prev, openingQuestion]);

    } catch (error) {
      console.error('生成初始面试问题失败:', error);

      // 如果AI失败，使用默认问题
      setInterviewMessages(prev => prev.filter(msg => !msg.isLoading));

      const fallbackQuestion = {
        id: 3,
        type: 'interviewer',
        content: t('smartCodingLab.interviewer.startPrompt'),
        timestamp: new Date().toLocaleTimeString()
      };

      setInterviewMessages(prev => [...prev, fallbackQuestion]);
    }
  };

  // Monaco编辑器处理函数
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    // 配置编辑器主题和选项
    monaco.editor.defineTheme('myTheme', {
      base: isDarkTheme ? 'vs-dark' : 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#000000',
        'editor.foreground': isDarkTheme ? '#ffffff' : '#000000',
        'editorLineNumber.foreground': isDarkTheme ? '#cbd5e1' : '#666666',
        'editor.selectionBackground': isDarkTheme ? '#2a2d4e' : '#add6ff',
        'editorCursor.foreground': isDarkTheme ? '#00d4ff' : '#000000',
      }
    });
    monaco.editor.setTheme('myTheme');
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    // 根据语言设置初始代码模板
    const templates = {
      python: `def twoSum(nums, target):
    # 在这里实现你的代码
    pass`,
      javascript: `function twoSum(nums, target) {
    // 在这里实现你的代码

}`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // 在这里实现你的代码
        return new int[]{};
    }
}`
    };
    setUserCode(templates[language] || templates.python);
  };

  const runCode = async () => {
    setIsRunning(true);
    try {
      const executionResult = await executeCode(userCode, selectedLanguage);
      if (executionResult.success) {
        setTestResults(executionResult.testResults);
        const passedCount = executionResult.testResults.filter(r => r.passed).length;
        if (passedCount === executionResult.testResults.length) {
          message.success(t('smartCodingLab.codeTemplate.allTestsPassed'));
        } else {
          message.warning(`${passedCount}/${executionResult.testResults.length} ${t('smartCodingLab.codeTemplate.testCaseResults')}`);
        }
      } else {
        message.error(`❌ ${t('smartCodingLab.codeExecution.failed')}: ${executionResult.error}`);
      }
    } catch (error) {
      message.error(`❌ ${t('smartCodingLab.codeExecution.failed')}: ${error.message}`);
    }
    setIsRunning(false);
  };

  const debugCode = async () => {
    setIsDebugging(true);
    // 模拟AI调试
    setTimeout(() => {
      message.info(t('smartCodingLab.debugging.inDevelopment'));
      setIsDebugging(false);
    }, 1000);
  };

  // 执行代码并获取测试结果
  const executeCode = async (code, language) => {
    try {
      message.loading(t('smartCodingLab.codeExecution.executing'), 0);

      const response = await fetch(getApiUrl('/code-execution/execute'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          problem_id: currentProblem?.id,
          test_cases: currentProblem?.testCases || []
        })
      });

      message.destroy();

      if (!response.ok) {
        throw new Error(`代码执行失败: ${response.status}`);
      }

      const result = await response.json();

      // 转换后端返回的测试结果格式
      const testResults = result.test_results?.map((test, index) => ({
        id: index + 1,
        input: test.input,
        expected: test.expected,
        actual: test.actual,
        passed: test.passed
      })) || [];

      return {
        success: result.success,
        output: result.output,
        error: result.error,
        testResults: testResults
      };
    } catch (error) {
      message.destroy();
      console.error('代码执行错误:', error);
      throw error;
    }
  };

  // 运行代码并提交
  const handleSubmitCode = async (actualCode = userCode, actualTestResults = []) => {
    // 添加提交记录
    const newSubmission = {
      id: Date.now(),
      code: actualCode, // 使用实际传入的代码
      language: selectedLanguage,
      timestamp: new Date().toLocaleTimeString(),
      status: 'pending'
    };
    setSubmissions(prev => [newSubmission, ...prev]);

    let finalTestResults = actualTestResults;

    // 如果没有传入测试结果，则执行代码获取测试结果
    if (actualTestResults.length === 0) {
      try {
        const executionResult = await executeCode(actualCode, selectedLanguage);

        if (executionResult.success) {
          finalTestResults = executionResult.testResults;
        } else {
          // 执行失败，更新提交状态
          setSubmissions(prev => prev.map(sub =>
            sub.id === newSubmission.id
              ? { ...sub, status: 'error', error: executionResult.error }
              : sub
          ));
          message.error(`❌ ${t('smartCodingLab.codeExecution.failed')}: ${executionResult.error}`);
          return;
        }
      } catch (error) {
        // 执行出错，更新提交状态
        setSubmissions(prev => prev.map(sub =>
          sub.id === newSubmission.id
            ? { ...sub, status: 'error', error: error.message }
            : sub
        ));
        message.error(`❌ 代码执行失败: ${error.message}`);
        return;
      }
    }

    setTestResults(finalTestResults);

    // 更新提交状态
    const allPassed = finalTestResults.every(result => result.passed);
    const status = allPassed ? 'accepted' : 'failed';

    setSubmissions(prev => prev.map(sub =>
      sub.id === newSubmission.id
        ? { ...sub, status: status, results: finalTestResults }
        : sub
    ));

    if (allPassed) {
      if (!interviewMode) {
        message.success(t('smartCodingLab.codeTemplate.congratulations'));
        addAIMessage(t('smartCodingLab.feedback.solutionComplete'));
      }
    } else {
      if (!interviewMode) {
        message.error(t('smartCodingLab.codeTemplate.partialPass'));
        addAIMessage(t('smartCodingLab.feedback.solutionIncomplete'));
      } else {
        message.error(t('smartCodingLab.codeTemplate.partialPass'));
      }
    }

    // 如果是面试模式，自动触发评估
    if (interviewMode && interviewState.isActive) {
      setTimeout(() => {
        evaluateInterviewSubmission(actualCode, finalTestResults, interviewMessages);
      }, 1000);
    }
  };

  // 渲染问题描述
  const renderProblemDescription = () => (
    <Card
      title={
        <Space>
          <Tag color={
            currentProblem?.difficulty === 'Easy' ? '#B5704A' :
            currentProblem?.difficulty === 'Medium' ? '#D4926F' : '#A0783B'
          }>
            {translateDifficulty(currentProblem?.difficulty)}
          </Tag>
          <span>{translateProblem(currentProblem?.id)}</span>
          <Tag color="var(--tech-primary)">{translatePattern(currentPattern?.id)}</Tag>
        </Space>
      }
      className="problem-description-card"
      extra={
        <Space>
          <Button
            size="small"
            onClick={() => navigate(`/algorithm-learning/classroom/${pattern}`)}
            icon={<BookOutlined />}
          >
            {t('smartCodingLab.ui.returnToClassroom')}
          </Button>
        </Space>
      }
    >
      <Paragraph>{translateProblemDescription(currentProblem?.id)}</Paragraph>

      {currentProblem?.hints && (
        <div style={{ marginTop: 16 }}>
          <Text strong>{t('smartCodingLab.ui.hint')}</Text>
          <ul style={{ marginTop: 8 }}>
            {currentProblem.hints.map((hint, index) => (
              <li key={index}>{translateHint(hint)}</li>
            ))}
          </ul>
        </div>
      )}

      <Divider />

      <Space>
        <Text strong>{t('smartCodingLab.ui.learningObjective')}</Text>
        <Text>{currentProblem?.learningObjective || t('smartCodingLab.ui.masterApplication', { pattern: translatePattern(currentPattern?.id) })}</Text>
      </Space>
    </Card>
  );

  // 渲染测试结果
  const renderTestResults = () => (
    <Card
      className="tech-card"
      size="small"
      title={`🧪 ${t('smartCodingLab.ui.testResults')}`}
      style={{
        background: 'var(--tech-card-bg)',
        border: '1px solid var(--tech-border)',
        boxShadow: '0 2px 8px rgba(160, 120, 59, 0.1)'
      }}
    >
      {testResults.length > 0 ? (
        <List
          size="small"
          dataSource={testResults}
          renderItem={(result) => (
            <List.Item style={{
              background: 'var(--tech-code-bg)',
              border: '1px solid var(--tech-border)',
              borderRadius: '8px',
              marginBottom: '8px',
              padding: '12px'
            }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  {result.passed ?
                    <CheckCircleOutlined style={{ color: 'var(--tech-accent)' }} /> :
                    <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                  }
                  <Text strong style={{ color: 'var(--tech-text-primary)' }}>
                    {t('smartCodingLab.codeTemplate.testCase')} {result.id}
                  </Text>
                  <Tag style={{
                    background: result.passed ? 'var(--tech-accent)' : '#ff4d4f',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px'
                  }}>
                    {result.passed ? t('codingLab.passed') : t('codingLab.failed')}
                  </Tag>
                </Space>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--tech-text-muted)',
                  background: 'var(--tech-code-bg)',
                  padding: '8px',
                  borderRadius: '4px',
                  fontFamily: 'monospace'
                }}>
                  <div style={{ marginBottom: '4px' }}>
                    <span style={{ color: '#D4926F', fontWeight: 'bold' }}>
                      {t('practice.testExample.input')}
                    </span>
                    <span style={{ marginLeft: '8px' }}>{result.input}</span>
                  </div>
                  <div style={{ marginBottom: '4px' }}>
                    <span style={{ color: '#A0783B', fontWeight: 'bold' }}>
                      {t('practice.testExample.expected')}:
                    </span>
                    <span style={{ marginLeft: '8px' }}>{result.expected}</span>
                  </div>
                  <div>
                    <span style={{
                      color: result.passed ? '#B5704A' : '#ff4d4f',
                      fontWeight: 'bold'
                    }}>
                      {t('codingLab.actual')}:
                    </span>
                    <span style={{ marginLeft: '8px' }}>{result.actual}</span>
                  </div>
                </div>
              </Space>
            </List.Item>
          )}
        />
      ) : (
        <Text style={{ color: 'var(--tech-text-muted)' }}>{t('smartCodingLab.testResults.noResults')}</Text>
      )}
    </Card>
  );

  // 渲染提交历史
  const renderSubmissions = () => (
    <Card size="small" title={`📝 ${t('smartCodingLab.ui.submissionHistory')}`}>
      {submissions.length > 0 ? (
        <List
          size="small"
          dataSource={submissions.slice(0, 5)}
          renderItem={(submission) => (
            <List.Item>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <Avatar size="small" icon={<CodeOutlined />} />
                  <Text strong>{submission.timestamp}</Text>
                  <Tag color={
                    submission.status === 'accepted' ? 'success' :
                    submission.status === 'pending' ? 'processing' : 'error'
                  }>
                    {submission.status === 'accepted' ? t('codingLab.passed') :
                     submission.status === 'pending' ? t('smartCodingLab.ui.loading') : t('codingLab.failed')}
                  </Tag>
                </Space>
                <Text style={{ fontSize: '12px', color: 'var(--tech-text-muted)' }}>
                  {submission.language} • {submission.code.length} 字符
                </Text>
              </Space>
            </List.Item>
          )}
        />
      ) : (
        <Text type="secondary">{t('smartCodingLab.submissions.noRecords')}</Text>
      )}
    </Card>
  );


  // 处理加载状态
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
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
            {translateProblem(currentProblem?.id) || t('smartCodingLab.ui.loading')}
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

  // 渲染中间主内容区域
  const renderMainContent = () => (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '0px',
      minWidth: 0,
      overflow: 'hidden'
    }}>

      {/* AI教师 - 始终显示 */}
      <div style={{ marginBottom: '5px' }}>
        <Card
          className="tech-card"
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserOutlined style={{ color: 'var(--tech-accent)' }} />
              <span className="tech-title">{t('smartCodingLab.ui.aiTeacher')}</span>
            </div>
          }
          style={{
            background: 'var(--tech-card-bg)',
            border: '1px solid var(--tech-border)',
            boxShadow: '0 8px 32px rgba(160, 120, 59, 0.1)'
          }}
          bodyStyle={{ padding: '16px' }}
        >
          <div>
            <Text style={{
              color: 'var(--tech-text-secondary)',
              fontSize: '14px',
              display: 'block',
              marginBottom: '16px'
            }}>
              {t('smartCodingLab.aiTeacher.conceptExplanation')}
            </Text>

            <div style={{ marginBottom: '16px' }}>
              <Text style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--tech-text-secondary)',
                display: 'block',
                marginBottom: '12px'
              }}>
                {t('smartCodingLab.aiTeacher.selectTopic')}
              </Text>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {getCurrentTopics().map((topic, index) => (
                  <Button
                    key={topic.id || index}
                    onClick={() => handleTopicClick(topic.title)}
                    style={{
                      background: 'linear-gradient(135deg, var(--tech-secondary) 0%, var(--tech-primary) 100%)',
                      border: 'none',
                      color: 'white',
                      height: '40px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      paddingLeft: '16px'
                    }}
                  >
                    {topic.title}
                  </Button>
                ))}
              </div>

              {/* AI教师状态提示 */}
              {(aiThinking || ttsGenerating || isAiSpeaking || speechError) && (
                <div style={{
                  padding: '8px 12px',
                  marginTop: '8px',
                  borderTop: isDarkTheme ? '1px solid #444' : '1px solid var(--tech-border)',
                  background: isDarkTheme ?
                    ((aiThinking || ttsGenerating || isAiSpeaking) ? '#2a2a2a' : '#2a2a2a') :
                    ((aiThinking || ttsGenerating || isAiSpeaking) ? 'var(--tech-code-bg)' : 'var(--tech-code-bg)'),
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: (aiThinking || ttsGenerating || isAiSpeaking) ? 'var(--tech-primary)' : 'var(--tech-secondary)'
                }}>
                  {speechError ? (
                    <span style={{ color: 'var(--tech-accent)' }}>❌ {speechError}</span>
                  ) : (
                    <>
                      {aiThinking && <span>🤔 AI教师正在思考中...</span>}
                      {ttsGenerating && (
                        <div>
                          <span>🎵 正在生成语音...</span>
                          <Progress
                            percent={ttsProgress}
                            size="small"
                            strokeColor="var(--tech-accent)"
                            style={{ marginTop: '4px' }}
                          />
                        </div>
                      )}
                      {isAiSpeaking && <span>🔊 AI教师正在讲解中...</span>}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* AI智能黑板 - 条件渲染 */}
      {showAIBlackboard && (
        <div style={{ marginBottom: '5px' }}>
          <AIBlackboard
          courseContent={{
            title: translateProblem(currentProblem?.id) || t('problemInterface.twoSum'),
            description: enhancedProblemData?.description || currentProblem?.description || t('problemInterface.targetDescription'),
            examples: enhancedProblemData?.examples || [
              {
                input: "nums = [2,7,11,15], target = 9",
                output: "[0,1]",
                explanation: t('smartCodingLab.examples.twoSumExplanation')
              }
            ],
            hints: enhancedProblemData?.hints || [
              t('smartCodingLab.examples.bruteForceHint'),
              t('smartCodingLab.examples.hashTableHint'),
              t('smartCodingLab.examples.hashTableCheck')
            ]
          }}
          onDrawingChange={handleDrawingChange}
          onAITeach={handleAITeach}
          onStartVoiceChat={handleStartVoiceChat}
          voiceChatStates={voiceChatStates}
          onTopicClick={handleTopicClick}
          hideTeacherCard={true}
        />
      </div>
      )}

      {/* 代码编辑器区域 */}
      <MiniCodeEditor
        initialCode={userCode}
        language={selectedLanguage}
        title={t('ui.editor', { ns: 'classroom' })}
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
        problemData={enhancedProblemData}
        interviewMode={interviewMode}
        isEvaluating={isEvaluating}
        onSubmitCode={handleSubmitCode}
      />
    </div>
  );

  // 渲染右侧开发提示
  const renderDevelopmentTips = () => (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 解题提示 */}
      <Card
        className="tech-card tech-fade-in"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BulbOutlined style={{ color: 'var(--tech-primary)' }} />
            <span className="tech-title" style={{ fontSize: '16px' }}>{t('smartCodingLab.ui.solutionHints')}</span>
          </div>
        }
        style={{
          background: isDarkTheme ? 'var(--tech-card-bg)' : 'white',
          border: isDarkTheme ? '1px solid var(--tech-border)' : '1px solid var(--tech-border)',
          boxShadow: '0 8px 32px var(--tech-orange-shadow)'
        }}
        bodyStyle={{ padding: '16px' }}
      >
        <div style={{
          padding: '16px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--tech-text-primary)',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--tech-primary), var(--tech-secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '10px',
              fontWeight: 600
            }}>💡</div>
            {t('smartCodingLab.solutionHints.title')}
          </div>
          <div style={{ color: 'var(--tech-text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>
            {enhancedProblemData?.hints ? (
              enhancedProblemData.hints.slice(0, 4).map((hint, index) => (
                <div key={index} style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--tech-text-primary)' }}>{index + 1}. </strong>
                  {translateHint(hint)}
                </div>
              ))
            ) : (
              <>
                <div style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--tech-text-primary)' }}>1. </strong>
                  {t('smartCodingLab.ui.problemDescription')}：{currentProblem?.description || t('smartCodingLab.examples.requirementAnalysis')}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--tech-text-primary)' }}>2. </strong>
                  {t('smartCodingLab.guidance.analyzePattern', { pattern: translatePattern(currentPattern?.id) || t('smartCodingLab.ui.algorithmTopic') })}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--tech-text-primary)' }}>3. </strong>
                  {t('smartCodingLab.guidance.implementLogic')}
                </div>
                <div>
                  <strong style={{ color: 'var(--tech-text-primary)' }}>4. </strong>
                  {t('smartCodingLab.practiceStage.steps.test')}：{t('smartCodingLab.practiceStage.stepDescriptions.test')}
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* AI功能按钮卡片 */}
      <Card
        className="tech-card"
        style={{
          background: 'var(--tech-card-bg)',
          border: '1px solid var(--tech-border)',
          borderRadius: '12px',
          boxShadow: '0 4px 16px var(--tech-orange-light)'
        }}
        bodyStyle={{ padding: '16px' }}
      >
        {/* 第一行：AI Teacher 和 AI Debug */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          marginBottom: '12px'
        }}>
          <Button
            onClick={() => handleTopicClick(getCurrentTopics()[0]?.title || '题目解读')}
            style={{
              background: 'linear-gradient(135deg, var(--tech-primary) 0%, var(--tech-accent) 100%)',
              border: 'none',
              color: 'white',
              boxShadow: '0 8px 32px var(--tech-orange-shadow), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
              fontWeight: 600,
              height: '36px',
              width: '150px',
              borderRadius: '10px',
              fontSize: '12px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 40px var(--tech-orange-shadow), 0 0 0 1px rgba(255, 255, 255, 0.1) inset';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 32px var(--tech-orange-shadow), 0 0 0 1px rgba(255, 255, 255, 0.1) inset';
            }}
          >
            {t('smartCodingLab.ui.aiTeacher')}
          </Button>
          <Button
            onClick={() => console.log('AI Debug clicked')}
            style={{
              background: 'linear-gradient(135deg, var(--tech-accent) 0%, var(--tech-secondary) 100%)',
              border: 'none',
              color: 'white',
              boxShadow: '0 8px 32px rgba(245, 158, 11, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
              fontWeight: 600,
              height: '36px',
              width: '150px',
              borderRadius: '10px',
              fontSize: '12px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 40px rgba(245, 158, 11, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1) inset';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 32px rgba(245, 158, 11, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset';
            }}
          >
            {t('smartCodingLab.ui.aiDebug')}
          </Button>
        </div>

        {/* 第二行：代码示例 和 AI智能黑板 */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          marginBottom: '12px'
        }}>
          <Button
            onClick={() => setShowCodeExamples(!showCodeExamples)}
            style={{
              background: showCodeExamples
                ? 'linear-gradient(135deg, var(--tech-secondary) 0%, var(--tech-primary) 100%)'
                : 'linear-gradient(135deg, var(--tech-primary) 0%, var(--tech-secondary) 100%)',
              border: 'none',
              color: 'white',
              boxShadow: showCodeExamples
                ? '0 8px 32px var(--tech-orange-shadow), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                : '0 8px 32px var(--tech-orange-shadow), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
              fontWeight: 600,
              height: '36px',
              width: '150px',
              borderRadius: '10px',
              fontSize: '12px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = showCodeExamples
                ? '0 12px 40px var(--tech-orange-shadow), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                : '0 12px 40px var(--tech-orange-shadow), 0 0 0 1px rgba(255, 255, 255, 0.1) inset';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = showCodeExamples
                ? '0 8px 32px rgba(181, 112, 74, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                : '0 8px 32px rgba(160, 120, 59, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset';
            }}
          >
{t('smartCodingLab.ui.codeExamples')}
          </Button>
          <Button
            onClick={() => setShowAIBlackboard(!showAIBlackboard)}
            style={{
              background: showAIBlackboard
                ? 'linear-gradient(135deg, var(--tech-accent) 0%, var(--tech-secondary) 100%)'
                : 'linear-gradient(135deg, var(--tech-primary) 0%, var(--tech-accent) 100%)',
              border: 'none',
              color: 'white',
              boxShadow: showAIBlackboard
                ? '0 8px 32px var(--tech-orange-shadow), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                : '0 8px 32px var(--tech-orange-shadow), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
              fontWeight: 600,
              height: '36px',
              width: '150px',
              borderRadius: '10px',
              fontSize: '12px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = showAIBlackboard
                ? '0 12px 40px var(--tech-orange-shadow), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                : '0 12px 40px var(--tech-orange-shadow), 0 0 0 1px rgba(255, 255, 255, 0.1) inset';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = showAIBlackboard
                ? '0 8px 32px rgba(181, 112, 74, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                : '0 8px 32px rgba(160, 120, 59, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset';
            }}
          >
            {t('smartCodingLab.ui.aiBlackboard')}
          </Button>
        </div>

        {/* 第三行：模拟面试 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
          <Button
            onClick={() => {
              // 导航到面试模式页面
              navigate(`/algorithm-learning/interview/${pattern}/${problemId}`);
            }}
            style={{
              background: 'linear-gradient(135deg, var(--tech-primary) 0%, var(--tech-accent) 100%)',
              border: 'none',
              color: 'white',
              boxShadow: '0 8px 32px var(--tech-orange-shadow), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
              fontWeight: 600,
              height: '36px',
              width: '320px',
              borderRadius: '10px',
              fontSize: '12px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 40px var(--tech-orange-shadow), 0 0 0 1px rgba(255, 255, 255, 0.1) inset';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 32px var(--tech-orange-shadow), 0 0 0 1px rgba(255, 255, 255, 0.1) inset';
            }}
          >
            {t('smartCodingLab.ui.mockInterview')}
          </Button>
        </div>
      </Card>

      {/* 代码示例 - 条件渲染 */}
      {showCodeExamples && (
        <Card
          className="tech-card tech-fade-in"
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileTextOutlined style={{ color: 'var(--tech-primary)' }} />
              <span className="tech-title" style={{ fontSize: '16px' }}>{t('smartCodingLab.ui.codeExamples')}</span>
            </div>
          }
          style={{
            background: 'var(--tech-card-bg)',
            border: '1px solid var(--tech-border)',
            boxShadow: '0 8px 32px var(--tech-orange-shadow)'
          }}
          bodyStyle={{ padding: '16px' }}
        >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Python代码示例 */}
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, var(--tech-orange-light), var(--tech-warm-bg))',
            border: '1px solid var(--tech-orange-border)',
            borderRadius: '8px'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--tech-text-primary)',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--tech-primary), var(--tech-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '10px',
                fontWeight: 600
              }}>Py</div>
              Python 解法
            </div>
            <div style={{
              background: 'var(--tech-card-bg)',
              padding: '12px',
              borderRadius: '6px',
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
              fontSize: '12px',
              lineHeight: '1.4',
              color: 'var(--tech-text-secondary)',
              overflowX: 'auto'
            }}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--tech-text-secondary)' }}>
                {enhancedProblemData?.solutions?.[1]?.code?.python ||
                 enhancedProblemData?.solutions?.[0]?.code?.python ||
                 `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        """
        ${t('problemInterface.twoSum')} - ${t('smartCodingLab.codeExampleTexts.hashMapOptimized')}

        ${t('smartCodingLab.codeExampleTexts.approach')}

        ${t('smartCodingLab.codeExampleTexts.timeComplexity')}
        ${t('smartCodingLab.codeExampleTexts.spaceComplexity')}

        ${t('smartCodingLab.codeExampleTexts.args')}
            nums: ${t('smartCodingLab.codeExampleTexts.integerArray')}
            target: ${t('smartCodingLab.codeExampleTexts.targetSum')}

        ${t('smartCodingLab.codeExampleTexts.returns')}:
            ${t('smartCodingLab.codeExampleTexts.indexesList')}
        """
        # ${t('smartCodingLab.codeExampleTexts.createHashMap')}
        hash_map = {}

        # ${t('smartCodingLab.codeExampleTexts.traverseArray')}
        for i, num in enumerate(nums):
            # ${t('smartCodingLab.codeExampleTexts.calculateComplement')}
            complement = target - num

            # ${t('smartCodingLab.codeExampleTexts.checkComplement')}
            if complement in hash_map:
                # ${t('smartCodingLab.codeExampleTexts.foundPair')}
                return [hash_map[complement], i]

            # ${t('smartCodingLab.codeExampleTexts.storeInHashMap')}
            # ${t('smartCodingLab.codeExampleTexts.keyValueComment')}
            hash_map[num] = i

        # ${t('smartCodingLab.codeExampleTexts.notFoundReturn')}
        # ${t('smartCodingLab.codeExampleTexts.guaranteedSolution')}
        return []

# ==================== ${t('smartCodingLab.codeExampleTexts.testCode')} ====================
if __name__ == "__main__":
    # ${t('smartCodingLab.codeExampleTexts.createInstance')}
    solution = Solution()

    print("🔍 ${t('problemInterface.twoSum')} ${t('smartCodingLab.codeExampleTexts.algorithmTest')}")
    print("=" * 50)

    # ${t('smartCodingLab.codeExampleTexts.testCase1')}
    nums1 = [2, 7, 11, 15]
    target1 = 9
    result1 = solution.twoSum(nums1, target1)
    print(f"📝 ${t('smartCodingLab.codeExampleTexts.testNumber')}1:")
    print(f"   ${t('smartCodingLab.codeExampleTexts.input')}: nums = {nums1}, target = {target1}")
    print(f"   ${t('smartCodingLab.codeExampleTexts.output')}: {result1}")
    print(f"   ${t('smartCodingLab.codeExampleTexts.verification')}: {nums1[result1[0]]} + {nums1[result1[1]]} = {nums1[result1[0]] + nums1[result1[1]]}")
    print()

    # ${t('smartCodingLab.codeExampleTexts.testCase2')}
    nums2 = [3, 2, 4]
    target2 = 6
    result2 = solution.twoSum(nums2, target2)
    print(f"📝 ${t('smartCodingLab.codeExampleTexts.testNumber')}2:")
    print(f"   ${t('smartCodingLab.codeExampleTexts.input')}: nums = {nums2}, target = {target2}")
    print(f"   ${t('smartCodingLab.codeExampleTexts.output')}: {result2}")
    print(f"   ${t('smartCodingLab.codeExampleTexts.verification')}: {nums2[result2[0]]} + {nums2[result2[1]]} = {nums2[result2[0]] + nums2[result2[1]]}")
    print()

    # ${t('smartCodingLab.codeExampleTexts.testCase3')}
    nums3 = [3, 3]
    target3 = 6
    result3 = solution.twoSum(nums3, target3)
    print(f"📝 ${t('smartCodingLab.codeExampleTexts.testNumber')}3:")
    print(f"   ${t('smartCodingLab.codeExampleTexts.input')}: nums = {nums3}, target = {target3}")
    print(f"   ${t('smartCodingLab.codeExampleTexts.output')}: {result3}")
    print(f"   ${t('smartCodingLab.codeExampleTexts.verification')}: {nums3[result3[0]]} + {nums3[result3[1]]} = {nums3[result3[0]] + nums3[result3[1]]}")

    print(f"\\n✅ ${t('smartCodingLab.codeExampleTexts.allTestsPassed')}")`}
              </pre>
            </div>
          </div>
        </div>
      </Card>
      )}

      {/* AI助教 */}
      <Card
        className="tech-card tech-fade-in"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CustomerServiceOutlined style={{ color: 'var(--tech-primary)' }} />
            <span className="tech-title" style={{ fontSize: '16px' }}>{t('smartCodingLab.ui.aiAssistant')}</span>
          </div>
        }
        style={{
          background: 'var(--tech-card-bg)',
          border: '1px solid var(--tech-border)',
          boxShadow: '0 8px 32px var(--tech-orange-shadow)',
          height: '400px',
          display: 'flex',
          flexDirection: 'column'
        }}
        headStyle={{
          background: 'transparent',
          borderBottom: '1px solid var(--tech-border)',
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
        {/* 聊天消息区域 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
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
                    ? 'linear-gradient(135deg, var(--tech-primary), var(--tech-secondary))'
                    : isDarkTheme ? 'rgba(42, 45, 78, 0.9)' : 'rgba(212, 146, 111, 0.1)',
                  color: message.type === 'user' ? '#fff' : isDarkTheme ? '#fff' : 'var(--tech-text-primary)',
                  fontSize: '13px',
                  lineHeight: 1.4,
                  wordBreak: 'break-word',
                  border: message.type === 'user'
                    ? 'none'
                    : isDarkTheme ? '1px solid rgba(212, 146, 111, 0.2)' : '1px solid rgba(212, 146, 111, 0.3)'
                }}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>

        {/* 输入区域 */}
        <div style={{
          flexShrink: 0,
          borderTop: '1px solid var(--tech-border)',
          paddingTop: '12px'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Input
              placeholder={t('smartCodingLab.chat.placeholder')}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onPressEnter={handleChatSend}
              className="tech-input"
              style={{
                flex: 1,
                backgroundColor: 'rgba(42, 45, 78, 0.8)',
                border: '1px solid var(--tech-border)',
                color: 'var(--tech-text-primary)',
                fontSize: '13px'
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleChatSend}
              disabled={!chatInput.trim()}
              className="tech-button"
              style={{
                background: 'linear-gradient(135deg, var(--tech-primary), var(--tech-accent))',
                border: 'none',
                color: 'var(--tech-text-primary)'
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );

  // 渲染面试评估结果Modal
  const renderInterviewEvaluation = () => (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrophyOutlined style={{ color: 'var(--tech-accent)', fontSize: '20px' }} />
          <span style={{ color: 'var(--tech-text-primary)', fontWeight: 'bold' }}>面试评估报告</span>
        </div>
      }
      open={showEvaluation}
      onCancel={() => setShowEvaluation(false)}
      footer={[
        <Button key="close" onClick={() => setShowEvaluation(false)}>
          关闭
        </Button>,
        <Button
          key="save"
          type="primary"
          onClick={saveInterviewRecord}
          style={{
            background: 'linear-gradient(135deg, var(--tech-primary), var(--tech-secondary))',
            border: 'none'
          }}
        >
          保存报告
        </Button>
      ]}
      width={800}
      style={{ background: 'var(--tech-card-bg)' }}
      bodyStyle={{ background: 'var(--tech-card-bg)', color: 'var(--tech-text-primary)' }}
    >
      {interviewEvaluation && (
        <div style={{ padding: '16px 0' }}>
          {/* 总体评分 */}
          <Card size="small" style={{ marginBottom: '16px', background: 'rgba(212, 146, 111, 0.1)', border: '1px solid rgba(212, 146, 111, 0.3)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--tech-primary)', marginBottom: '8px' }}>
                {interviewEvaluation.totalScore?.toFixed(1) || '7.4'}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                {interviewEvaluation.grade || t('smartCodingLab.evaluation.good')}
              </div>
              <div style={{ color: 'var(--tech-text-secondary)' }}>
                {interviewEvaluation.summary || t('smartCodingLab.evaluation.overallGood')}
              </div>
            </div>
          </Card>

          {/* 详细评分 */}
          <Card size="small" style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '12px', fontWeight: 'bold' }}>详细评分</div>
            <Row gutter={[16, 12]}>
              <Col span={12}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{t('smartCodingLab.evaluation.algorithmCorrectness')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Progress percent={(interviewEvaluation.correctness || 8) * 10} size="small" showInfo={false} strokeColor="var(--tech-primary)" />
                    <span style={{ fontWeight: 'bold' }}>{interviewEvaluation.correctness || 8}/10</span>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>代码效率</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Progress percent={(interviewEvaluation.efficiency || 7) * 10} size="small" showInfo={false} strokeColor="var(--tech-primary)" />
                    <span style={{ fontWeight: 'bold' }}>{interviewEvaluation.efficiency || 7}/10</span>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>代码质量</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Progress percent={(interviewEvaluation.quality || 7) * 10} size="small" showInfo={false} strokeColor="var(--tech-primary)" />
                    <span style={{ fontWeight: 'bold' }}>{interviewEvaluation.quality || 7}/10</span>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>沟通表达</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Progress percent={(interviewEvaluation.communication || 8) * 10} size="small" showInfo={false} strokeColor="var(--tech-primary)" />
                    <span style={{ fontWeight: 'bold' }}>{interviewEvaluation.communication || 8}/10</span>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>问题解决</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Progress percent={(interviewEvaluation.problemSolving || 7) * 10} size="small" showInfo={false} strokeColor="var(--tech-primary)" />
                    <span style={{ fontWeight: 'bold' }}>{interviewEvaluation.problemSolving || 7}/10</span>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>

          {/* 优点和改进建议 */}
          <Row gutter={16}>
            <Col span={12}>
              <Card size="small" style={{ height: '120px' }}>
                <div style={{ marginBottom: '8px', fontWeight: 'bold', color: 'var(--tech-accent)' }}>✅ 表现优点</div>
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                  {(interviewEvaluation.strengths || [t('smartCodingLab.evaluation.clearThinking'), t('smartCodingLab.evaluation.correctImplementation')]).map((strength, index) => (
                    <li key={index} style={{ marginBottom: '4px' }}>{strength}</li>
                  ))}
                </ul>
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" style={{ height: '120px' }}>
                <div style={{ marginBottom: '8px', fontWeight: 'bold', color: 'var(--tech-primary)' }}>💡 改进建议</div>
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                  {(interviewEvaluation.improvements || [t('smartCodingLab.evaluation.canOptimizeEfficiency'), t('smartCodingLab.evaluation.codeStyle')]).map((improvement, index) => (
                    <li key={index} style={{ marginBottom: '4px' }}>{improvement}</li>
                  ))}
                </ul>
              </Card>
            </Col>
          </Row>

          {/* 最终建议 */}
          <Card size="small" style={{ marginTop: '16px', background: 'rgba(82, 196, 26, 0.1)', border: '1px solid rgba(82, 196, 26, 0.3)' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>面试官建议</div>
            <div style={{ color: 'var(--tech-text-secondary)' }}>
              {interviewEvaluation.recommendation || t('smartCodingLab.evaluation.proceedNextRound')}
            </div>
          </Card>
        </div>
      )}
    </Modal>
  );

  return (
    <div className={`algorithm-hub ${getThemeClass()} tech-background tech-grid`} style={{
      padding: '16px',
      paddingBottom: '40px',
      minHeight: '200vh',
      height: 'auto',
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
            onClick={() => navigate('/algorithm-learning')}
            className="tech-button"
            style={{
              height: '36px',
              color: 'var(--tech-text-secondary)',
              border: '1px solid var(--tech-primary)',
              background: 'white'
            }}
          >
            {t('smartCodingLab.ui.returnToProblemBank')}
          </Button>

          {/* 独立的退出面试按钮 */}
          {interviewMode && interviewState.phase !== 'idle' && (
            <Button
              onClick={endInterview}
              style={{
                height: '36px',
                background: 'linear-gradient(135deg, var(--tech-text-secondary), var(--tech-text-muted))',
                border: 'none',
                color: 'white'
              }}
            >
              {t('smartCodingLab.ui.exitInterview')}
            </Button>
          )}
        </div>

        {/* 面试模式控制器 */}
        {interviewMode && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            {/* 面试状态和控制按钮 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: interviewState.phase === 'completed'
                ? 'linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 152, 0, 0.2))'
                : 'linear-gradient(135deg, rgba(212, 146, 111, 0.2), rgba(160, 120, 59, 0.2))',
              border: interviewState.phase === 'completed'
                ? '1px solid rgba(255, 193, 7, 0.5)'
                : '1px solid rgba(212, 146, 111, 0.5)',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: interviewState.isActive ? 'var(--tech-accent)' : interviewState.phase === 'paused' ? 'var(--tech-primary)' : 'var(--tech-accent)',
                animation: interviewState.isActive ? 'pulse 2s infinite' : 'none'
              }} />
              <span style={{
                color: interviewState.phase === 'completed' ? 'var(--tech-accent)' : 'var(--tech-primary)',
                fontWeight: 600,
                fontSize: '14px',
                background: interviewState.phase === 'completed' ? 'transparent' : 'rgba(212, 146, 111, 0.1)',
                padding: interviewState.phase === 'completed' ? '0' : '2px 8px',
                borderRadius: interviewState.phase === 'completed' ? '0' : '4px'
              }}>
                {t('smartCodingLab.interview.mode')} - {
                  interviewState.phase === 'preparation' ? t('smartCodingLab.interview.preparing') :
                  interviewState.phase === 'active' ? t('smartCodingLab.interview.active') :
                  interviewState.phase === 'paused' ? t('smartCodingLab.interview.paused') : t('smartCodingLab.interview.completed')
                }
              </span>

              {/* 控制按钮 */}
              {interviewState.phase === 'preparation' && (
                <Button
                  type="primary"
                  size="small"
                  onClick={startInterview}
                  style={{ marginLeft: '8px' }}
                >
                  开始面试
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
                  : 'linear-gradient(135deg, rgba(212, 146, 111, 0.2), rgba(160, 120, 59, 0.2))',
                border: `1px solid ${interviewState.timeRemaining <= 300 ? 'rgba(255, 77, 79, 0.5)' : 'rgba(212, 146, 111, 0.5)'}`,
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
        )}

        <div></div>
      </div>

      {/* 条件渲染：根据面试模式显示不同布局 */}
      {interviewMode ? (
        // 面试模式布局 - 三栏布局（专门为面试优化）
        <Row gutter={16} style={{ height: 'calc(100vh - 120px)' }}>
          {/* 左侧：题目描述 */}
          <Col span={6} style={{ minWidth: 0, overflow: 'hidden' }}>
            {renderProblemDescriptionSidebar()}
          </Col>

          {/* 中间：代码编辑器 + 面试官 */}
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
                title={
                  <Space>
                    <CodeOutlined style={{ color: 'var(--tech-primary)' }} />
                    <span className="tech-title">{t('smartCodingLab.ui.editor')}</span>
                  </Space>
                }
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
                  title={t('ui.editor', { ns: 'classroom' })}
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
                />
              </Card>
            </div>
          </Col>

          {/* 右侧：面试专用工具栏 */}
          <Col span={6} style={{ minWidth: 0, overflow: 'hidden' }}>
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* 面试官对话区域 */}
              <Card
                className="tech-card"
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <UserOutlined style={{ color: 'var(--tech-primary)' }} />
                      <span className="tech-title">{t('smartCodingLab.ui.interviewDialogue')}</span>
                    </div>
                  </div>
                }
                style={{
                  background: 'var(--tech-card-bg)',
                  border: '1px solid var(--tech-orange-border)',
                  boxShadow: '0 8px 32px var(--tech-orange-shadow)',
                  height: '600px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                headStyle={{
                  background: 'transparent',
                  borderBottom: '1px solid rgba(212, 146, 111, 0.3)',
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
                    <p style={{ marginTop: '16px', padding: '12px', background: 'rgba(212, 146, 111, 0.1)', borderRadius: '8px', border: '1px solid rgba(212, 146, 111, 0.3)' }}>
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
                              backgroundColor: message.type === 'candidate'
                                ? 'var(--tech-primary)'
                                : 'rgba(212, 146, 111, 0.15)',
                              color: message.type === 'candidate' ? 'var(--tech-text-primary)' : 'var(--tech-text-primary)',
                              fontSize: '13px',
                              lineHeight: '1.4',
                              wordWrap: 'break-word',
                              border: message.type === 'candidate'
                                ? 'none'
                                : '1px solid rgba(212, 146, 111, 0.3)',
                              boxShadow: message.type === 'candidate'
                                ? '0 2px 8px rgba(212, 146, 111, 0.2)'
                                : '0 2px 8px rgba(212, 146, 111, 0.1)'
                            }}
                          >
                            {message.content}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 输入区域 */}
                    <div style={{
                      flexShrink: 0,
                      borderTop: '1px solid rgba(212, 146, 111, 0.3)',
                      paddingTop: '12px'
                    }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Input
                          placeholder={t('smartCodingLab.interview.chatPlaceholder')}
                          value={interviewInput}
                          onChange={(e) => setInterviewInput(e.target.value)}
                          onPressEnter={handleInterviewChatSend}
                          disabled={!interviewState.isActive}
                          className="tech-input"
                          style={{
                            flex: 1,
                            backgroundColor: 'rgba(42, 45, 78, 0.8)',
                            border: '1px solid var(--tech-orange-border)',
                            color: 'var(--tech-text-primary)',
                            fontSize: '13px'
                          }}
                        />
                        <Button
                          type="primary"
                          icon={<SendOutlined />}
                          onClick={handleInterviewChatSend}
                          disabled={!interviewInput.trim() || !interviewState.isActive}
                          className="tech-button"
                          style={{
                            background: 'linear-gradient(135deg, var(--tech-accent), var(--tech-primary))',
                            border: 'none',
                            color: 'var(--tech-text-primary)'
                          }}
                        />

                        {/* 动画麦克风 */}
                        {interviewState.isActive && (
                          <div style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '40px'
                          }}>
                            {/* 麦克风图标 */}
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: isListening ? 'rgba(212, 146, 111, 0.2)' : 'rgba(128, 128, 128, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px',
                              color: isListening ? 'var(--tech-primary)' : 'var(--tech-text-muted)',
                              transition: 'all 0.3s ease',
                              zIndex: 2,
                              border: isListening ? '2px solid var(--tech-primary)' : '2px solid transparent'
                            }}>
                              🎤
                            </div>

                            {/* 动画波纹效果 */}
                            {isListening && (
                              <>
                                <div style={{
                                  position: 'absolute',
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  border: '2px solid rgba(212, 146, 111, 0.8)',
                                  animation: 'microphonePulse 1.5s infinite',
                                  zIndex: 1
                                }}></div>
                                <div style={{
                                  position: 'absolute',
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  border: '2px solid rgba(212, 146, 111, 0.6)',
                                  animation: 'microphonePulse 1.5s infinite 0.3s',
                                  zIndex: 0
                                }}></div>
                                <div style={{
                                  position: 'absolute',
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  border: '2px solid rgba(212, 146, 111, 0.4)',
                                  animation: 'microphonePulse 1.5s infinite 0.6s',
                                  zIndex: -1
                                }}></div>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  </>
                )}
              </Card>


              {/* 面试要点提醒 */}
              <Card
                className="tech-card"
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BulbOutlined style={{ color: 'var(--tech-accent)' }} />
                    <span className="tech-title" style={{ fontSize: '16px' }}>{t('smartCodingLab.ui.interviewTips')}</span>
                  </div>
                }
                style={{
                  background: 'var(--tech-card-bg)',
                  border: '1px solid var(--tech-border)',
                  boxShadow: '0 8px 32px rgba(82, 196, 26, 0.1)'
                }}
                bodyStyle={{ padding: '16px' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{
                    padding: '8px 12px',
                    background: 'rgba(82, 196, 26, 0.1)',
                    borderRadius: '6px',
                    border: '1px solid rgba(82, 196, 26, 0.2)',
                    fontSize: '12px'
                  }}>
                    <Text style={{ color: 'var(--tech-text-primary)' }}>
                      {t('smartCodingLab.interviewTips.expressThoughts')}
                    </Text>
                  </div>
                  <div style={{
                    padding: '8px 12px',
                    background: 'rgba(82, 196, 26, 0.1)',
                    borderRadius: '6px',
                    border: '1px solid rgba(82, 196, 26, 0.2)',
                    fontSize: '12px'
                  }}>
                    <Text style={{ color: 'var(--tech-text-primary)' }}>
                      📊 分析时间空间复杂度
                    </Text>
                  </div>
                  <div style={{
                    padding: '8px 12px',
                    background: 'rgba(82, 196, 26, 0.1)',
                    borderRadius: '6px',
                    border: '1px solid rgba(82, 196, 26, 0.2)',
                    fontSize: '12px'
                  }}>
                    <Text style={{ color: 'var(--tech-text-primary)' }}>
                      考虑边界条件
                    </Text>
                  </div>
                  <div style={{
                    padding: '8px 12px',
                    background: 'rgba(82, 196, 26, 0.1)',
                    borderRadius: '6px',
                    border: '1px solid rgba(82, 196, 26, 0.2)',
                    fontSize: '12px'
                  }}>
                    <Text style={{ color: 'var(--tech-text-primary)' }}>
                      🚀 优化解法思考
                    </Text>
                  </div>
                </div>
              </Card>

            </div>
          </Col>
        </Row>
      ) : (
        // 学习模式布局 - 三栏布局
        <Row gutter={16} style={{ height: 'calc(100vh - 120px)' }}>
          {/* 左侧：题目描述 */}
          <Col span={6} style={{ minWidth: 0, overflow: 'hidden' }}>
            {renderProblemDescriptionSidebar()}
          </Col>

          {/* 中间：题目内容区 */}
          <Col span={12} style={{ minWidth: 0, overflow: 'hidden' }}>
            {renderMainContent()}
          </Col>

          {/* 右侧：开发提示 */}
          <Col span={6} style={{ minWidth: 0, overflow: 'hidden' }}>
            {renderDevelopmentTips()}
          </Col>
        </Row>
      )}

      {/* 面试评估结果Modal */}
      {renderInterviewEvaluation()}

      {/* 评估加载状态覆盖 */}
      {isEvaluating && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(10, 14, 39, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <Card style={{ textAlign: 'center', background: 'var(--tech-card-bg)', border: '1px solid var(--tech-border)' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px', color: 'var(--tech-text-primary)' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>AI面试官正在评估中...</div>
              <div style={{ fontSize: '14px', color: 'var(--tech-text-secondary)' }}>
                {t('smartCodingLab.evaluation.analyzing')}
              </div>
            </div>
          </Card>
        </div>
      )}


    </div>
  );
};

export default SmartCodingLab;