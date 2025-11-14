import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Button,
  Input,
  Avatar,
  List,
  Typography,
  Space,
  message,
  Tooltip,
  Spin,
  Dropdown,
  Tag
} from 'antd';
import {
  AudioOutlined,
  SendOutlined,
  StopOutlined,
  SoundOutlined,
  UserOutlined,
  RobotOutlined,
  CloseOutlined,
  GlobalOutlined,
  DownOutlined
} from '@ant-design/icons';
import { aiChat, textToSpeech, playAudioFromBase64 } from '../../utils/aiApi';
import { getApiUrl } from '../../config/api.js';
import {
  normalizeLanguageCode,
  getTTSConfig,
  detectTextLanguage,
  getBestLanguage,
  prepareLanguageForAPI
} from '../../utils/languageUtils';
import '../../styles/techTheme.css';

const { TextArea } = Input;
const { Text } = Typography;

const AIVoiceChat = ({ visible, onClose, context = '', isInterview = false }) => {
  const { t, i18n } = useTranslation('classroom');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [ttsGenerating, setTtsGenerating] = useState(false);
  const [ttsProgress, setTtsProgress] = useState(0);
  const [recognition, setRecognition] = useState(null);
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState(normalizeLanguageCode(i18n.language));
  const [userSelectedLanguage, setUserSelectedLanguage] = useState(null);
  const messagesEndRef = useRef(null);

  // 获取当前最佳语言 - 使用统一的语言工具
  const getCurrentBestLanguage = () => {
    return getBestLanguage(userSelectedLanguage, detectedLanguage, i18n.language);
  };

  // 语言选择菜单项
  const languageMenuItems = [
    {
      key: 'auto',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GlobalOutlined />
          <span>{t('aiVoiceChat.languageMenu.autoDetect')}</span>
          <Tag size="small" color="blue">{t('aiVoiceChat.languageMenu.recommended')}</Tag>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'zh-CN',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🇨🇳</span>
          <span>{t('aiVoiceChat.languageMenu.chinese')}</span>
        </div>
      ),
    },
    {
      key: 'en',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🇺🇸</span>
          <span>English</span>
        </div>
      ),
    },
    {
      key: 'ja',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🇯🇵</span>
          <span>日本語</span>
        </div>
      ),
    },
    {
      key: 'ko',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🇰🇷</span>
          <span>한국어</span>
        </div>
      ),
    },
  ];

  // 处理语言选择
  const handleLanguageSelect = ({ key }) => {
    if (key === 'auto') {
      setUserSelectedLanguage(null);
      setDetectedLanguage(null); // 清除之前的检测结果
      message.success(t('aiVoiceChat.messages.intelligentDetectionEnabled'));

      // 重置语音识别为页面语言
      if (recognition) {
        const normalizedLang = normalizeLanguageCode(i18n.language);
        const pageConfig = getLanguageConfig(normalizedLang);
        recognition.lang = pageConfig.speechLang;
      }
    } else {
      setUserSelectedLanguage(key);
      const config = getLanguageConfig(key);
      message.success(`${t('aiVoiceChat.messages.languageSwitched')} ${config?.name || key}`);

      // 更新语音识别语言
      if (recognition) {
        recognition.lang = config?.speechLang || key;
      }

      console.log('🌐 User manually selected language:', key, config);
    }
  };

  // 获取当前语言显示
  const getCurrentLanguageDisplay = () => {
    if (!userSelectedLanguage) {
      const current = getCurrentBestLanguage();
      const config = getLanguageConfig(current);
      return {
        name: config?.name || t('aiVoiceChat.languageMenu.defaultLanguage'),
        flag: current === 'zh-CN' ? '🇨🇳' : current === 'en' ? '🇺🇸' : current === 'ja' ? '🇯🇵' : current === 'ko' ? '🇰🇷' : '🇨🇳',
        isAuto: true
      };
    } else {
      const config = getLanguageConfig(userSelectedLanguage);
      return {
        name: config?.name || t('aiVoiceChat.languageMenu.defaultLanguage'),
        flag: userSelectedLanguage === 'zh-CN' ? '🇨🇳' : userSelectedLanguage === 'en' ? '🇺🇸' : userSelectedLanguage === 'ja' ? '🇯🇵' : userSelectedLanguage === 'ko' ? '🇰🇷' : '🇨🇳',
        isAuto: false
      };
    }
  };

  // 使用统一的TTS语音配置
  const getLanguageConfig = (langCode) => {
    return getTTSConfig(langCode);
  };

  // 初始化语音识别
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;

      // 智能语言设置
      const bestLang = getCurrentBestLanguage();
      const config = getLanguageConfig(bestLang);
      recognitionInstance.lang = config.speechLang;

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;

        // 检测语音内容的语言（仅在自动模式下）
        if (!userSelectedLanguage) {
          const speechDetectedLang = detectTextLanguage(transcript);
          setDetectedLanguage(speechDetectedLang);
          console.log('🎤 Speech recognition result:', transcript, 'detected language:', speechDetectedLang);
        } else {
          console.log('🎤 Speech recognition result:', transcript, 'user selected language:', userSelectedLanguage);
        }

        setInputText(transcript);
        setIsRecording(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error(t('aiVoiceChat.errors.speechRecognition'), event.error);

        // 错误回退机制
        if (event.error === 'language-not-supported') {
          message.error(t('aiVoiceChat.errors.languageNotSupported'));
          setUserSelectedLanguage('zh-CN');
          recognitionInstance.lang = 'zh-CN';
        } else if (event.error === 'network') {
          message.error(t('aiVoiceChat.errors.networkFailed'));
        } else {
          message.error(t('aiVoiceChat.errors.speechRecognition') + ' ' + t('aiVoiceChat.messages.aiReplyFailed'));
        }

        setIsRecording(false);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [currentLanguage, t]);

  // 监听页面语言变化
  useEffect(() => {
    const normalizedLang = normalizeLanguageCode(i18n.language);
    setCurrentLanguage(normalizedLang);

    // 如果是自动模式，更新语音识别语言
    if (!userSelectedLanguage && recognition) {
      const config = getLanguageConfig(normalizedLang);
      recognition.lang = config.speechLang;
      console.log('🔄 Page language changed, updating speech recognition:', i18n.language, '->', normalizedLang, config.speechLang);
    }
  }, [i18n.language, userSelectedLanguage, recognition]);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 添加欢迎消息
  useEffect(() => {
    if (visible && messages.length === 0) {
      const welcomeContent = isInterview
        ? t('aiVoiceChat.welcomeInterview', { context })
        : context
          ? t('aiVoiceChat.welcomeAssistant', { context: `关于"${context}"的` })
          : t('aiVoiceChat.welcomeBasic');

      const welcomeMessage = {
        id: Date.now(),
        type: 'ai',
        content: welcomeContent,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages([welcomeMessage]);
    }
  }, [visible, context, isInterview]);

  // 开始/停止录音
  const toggleRecording = () => {
    if (!recognition) {
      message.error(t('aiVoiceChat.speechNotSupported'));
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  // 发送消息
  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputText,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    try {
      let response;

      if (isInterview) {
        // 面试模式：使用专门的面试API
        const apiResponse = await fetch(getApiUrl('/api/ai-chat'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: `面试场景：${context}。应聘者回答：${inputText}`,
            conversation_id: 'ai-interview-session'
          })
        });

        if (!apiResponse.ok) {
          throw new Error(t('aiVoiceChat.errors.interviewApiFailed'));
        }

        const data = await apiResponse.json();
        response = { response: data.reply };
      } else {
        // 学习模式：使用原有的AI聊天
        const contextPrompt = context
          ? `当前学习内容：${context}。用户问题：${inputText}`
          : inputText;

        // 使用统一的语言工具准备API参数
        const languageConfig = prepareLanguageForAPI({
          userSelected: userSelectedLanguage,
          detected: detectedLanguage,
          i18nLanguage: i18n.language,
          enableAutoDetect: !userSelectedLanguage
        });

        console.log('🤖 AI request configuration:', {
          language: languageConfig.language,
          detectLanguage: languageConfig.detect_language,
          userSelected: userSelectedLanguage,
          detected: detectedLanguage,
          i18nLang: i18n.language
        });

        response = await aiChat(
          contextPrompt,
          {
            context: '学习助手',
            user_level: 'advanced',
            max_length: 100,
            language: languageConfig.language,
            detect_language: languageConfig.detect_language
          }
        );
      }

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.response,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, aiMessage]);

      // 生成并播放语音 - 使用多语言TTS
      if (response.response) {
        await speakAiText(response.response, languageConfig.language);
      }

    } catch (error) {
      console.error('AI对话失败:', error);

      // 智能错误处理和回退
      let errorContent = t('aiVoiceChat.errors.generalError');
      let shouldFallback = false;

      if (error.message.includes('language')) {
        errorContent = t('aiVoiceChat.errors.languageError');
        setUserSelectedLanguage('zh-CN');
        shouldFallback = true;
      } else if (error.message.includes('network')) {
        errorContent = t('aiVoiceChat.errors.networkFailed');
      }

      message.error(shouldFallback ? t('aiVoiceChat.messages.languageSwitchToZh') : t('aiVoiceChat.messages.aiReplyFailed'));

      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: errorContent,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // AI语音播放 - 多语言TTS实现
  const speakAiText = async (text, language = 'zh-CN') => {
    if (!text) return;

    setTtsGenerating(true);
    setTtsProgress(0);

    // 启动进度条动画
    const progressInterval = setInterval(() => {
      setTtsProgress(prev => {
        if (prev >= 90) return 90;
        return prev + 10;
      });
    }, 300);

    try {
      // 根据语言选择合适的语音
      const config = getLanguageConfig(language);

      console.log('🎵 TTS language configuration:', { language, voice: config.voice, text: text.substring(0, 50) });

      // 调用后端OpenAI TTS API
      const response = await fetch(getApiUrl('/ai/tts'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: config.voice,
          model: 'tts-1',
          language: language
        })
      });

      if (!response.ok) {
        throw new Error(t('aiVoiceChat.errors.ttsRequestFailed'));
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // 清除进度条并完成
      clearInterval(progressInterval);
      setTtsProgress(100);

      setTimeout(() => {
        setTtsGenerating(false);
        setIsAiSpeaking(true);
        setTtsProgress(0);
      }, 200);

      // 将base64音频数据转换为可播放的音频
      const audioBase64 = data.audio_base64;
      const audioBlob = new Blob([
        Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))
      ], { type: 'audio/mpeg' });

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setIsAiSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsAiSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        console.error(t('aiVoiceChat.errors.audioPlaybackFailed'));
      };

      await audio.play();

    } catch (error) {
      console.error('TTS生成失败:', error);
      clearInterval(progressInterval);
      setTtsGenerating(false);
      setIsAiSpeaking(false);

      // 智能回退机制
      try {
        console.log('🔄 TTS fallback strategy activated');

        // 1. 首先尝试用中文TTS
        const fallbackConfig = getLanguageConfig('zh-CN');
        const audioData = await textToSpeech(text, fallbackConfig.voice, 'tts-1', 'zh-CN');
        setIsAiSpeaking(true);
        await playAudioFromBase64(audioData);
        setIsAiSpeaking(false);

        console.log('✅ TTS fallback successful');
      } catch (fallbackError) {
        console.error('❌ 回退TTS也失败:', fallbackError);

        // 2. 最终回退：纯文本提示
        message.info(t('aiVoiceChat.messages.ttsPlaybackFailed'));
      }
    }
  };

  // 键盘事件处理
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 清理对话
  const clearChat = () => {
    setMessages([]);
    const welcomeMessage = {
      id: Date.now(),
      type: 'ai',
      content: context ? t('aiVoiceChat.conversationCleared', { context: `关于"${context}"的` }) : t('aiVoiceChat.conversationClearedBasic'),
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages([welcomeMessage]);
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RobotOutlined style={{ color: 'var(--tech-primary)' }} />
          <span className="tech-title">{t('aiVoiceChat.title')}</span>
          {context && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              - {context}
            </Text>
          )}
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={600}
      footer={null}
      className="tech-modal"
      destroyOnHidden
    >
      <div style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
        {/* 对话历史 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 0',
          marginBottom: '16px',
          border: '1px solid var(--tech-border)',
          borderRadius: '8px',
          background: 'var(--tech-bg-secondary)'
        }}>
          <List
            dataSource={messages}
            renderItem={(message) => (
              <List.Item style={{ padding: '8px 16px', border: 'none' }}>
                <div style={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    maxWidth: '80%',
                    flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
                  }}>
                    <Avatar
                      icon={message.type === 'user' ? <UserOutlined /> : <RobotOutlined />}
                      style={{
                        backgroundColor: message.type === 'user' ? 'var(--tech-accent)' : 'var(--tech-primary)'
                      }}
                    />
                    <div style={{
                      backgroundColor: message.type === 'user' ? 'var(--tech-accent)' : 'var(--tech-card-bg)',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid var(--tech-border)'
                    }}>
                      <Text className="tech-text" style={{ whiteSpace: 'pre-wrap' }}>
                        {message.content}
                      </Text>
                      <div style={{
                        marginTop: '4px',
                        fontSize: '10px',
                        color: 'var(--tech-text-secondary)',
                        textAlign: message.type === 'user' ? 'right' : 'left'
                      }}>
                        {message.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
          {isProcessing && (
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <Spin />
              <Text style={{ marginLeft: '8px', color: 'var(--tech-text-secondary)' }}>
                {t('aiVoiceChat.thinking')}
              </Text>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div style={{ borderTop: '1px solid var(--tech-border)', paddingTop: '16px' }}>
          <Space.Compact style={{ width: '100%', marginBottom: '12px' }}>
            <TextArea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('aiVoiceChat.inputPlaceholder', { language: getCurrentLanguageDisplay().name })}
              autoSize={{ minRows: 1, maxRows: 3 }}
              style={{ flex: 1 }}
              className="tech-input"
            />
            <Tooltip title={isRecording ? t('aiVoiceChat.stopRecording') : t('aiVoiceChat.startRecording', { language: getCurrentLanguageDisplay().name })}>
              <Button
                type={isRecording ? "primary" : "default"}
                icon={isRecording ? <StopOutlined /> : <AudioOutlined />}
                onClick={toggleRecording}
                style={{
                  height: '40px',
                  backgroundColor: isRecording ? '#ff4d4f' : undefined,
                  borderColor: isRecording ? '#ff4d4f' : undefined
                }}
                loading={isRecording}
              />
            </Tooltip>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={sendMessage}
              disabled={!inputText.trim() || isProcessing}
              className="tech-button"
              style={{ height: '40px' }}
            />
          </Space.Compact>

          {/* 功能按钮 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              {/* 语言选择控制 */}
              <Dropdown
                menu={{
                  items: languageMenuItems,
                  onClick: handleLanguageSelect,
                }}
                placement="topLeft"
                trigger={['click']}
              >
                <Button
                  type="text"
                  size="small"
                  style={{
                    color: 'var(--tech-text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 6px',
                    height: 'auto'
                  }}
                >
                  <span style={{ fontSize: '12px' }}>
                    {getCurrentLanguageDisplay().flag}
                  </span>
                  <Text style={{ fontSize: '11px', color: 'var(--tech-text-secondary)' }}>
                    {getCurrentLanguageDisplay().name}
                  </Text>
                  {getCurrentLanguageDisplay().isAuto && (
                    <Tag size="small" color="processing" style={{ margin: 0, fontSize: '9px', lineHeight: '14px' }}>
                      AUTO
                    </Tag>
                  )}
                  {detectedLanguage && detectedLanguage !== i18n.language && (
                    <Tag size="small" color="success" style={{ margin: 0, fontSize: '9px', lineHeight: '14px' }}>
                      {t('aiVoiceChat.status.detected')}
                    </Tag>
                  )}
                  <DownOutlined style={{ fontSize: '10px' }} />
                </Button>
              </Dropdown>

              {(ttsGenerating || isAiSpeaking) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SoundOutlined style={{ color: 'var(--tech-primary)' }} />
                  <Text style={{ color: 'var(--tech-primary)', fontSize: '12px' }}>
                    {ttsGenerating ? t('aiVoiceChat.messages.ttsGenerating', { progress: ttsProgress }) : t('aiVoiceChat.messages.aiSpeaking')}
                  </Text>
                  {ttsGenerating && (
                    <div style={{
                      width: '60px',
                      height: '4px',
                      background: 'var(--tech-border)',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${ttsProgress}%`,
                        height: '100%',
                        background: 'var(--tech-primary)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  )}
                </div>
              )}
            </Space>
            <Button
              type="text"
              size="small"
              onClick={clearChat}
              style={{ color: 'var(--tech-text-secondary)' }}
            >
              {t('aiVoiceChat.clearChat')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AIVoiceChat;