// AI API 调用工具函数
import { getApiUrl, getRequestConfig, handleApiError } from '../config/api.js';
import { normalizeLanguageCode, getTTSConfig } from './languageUtils.js';

/**
 * AI聊天功能 - 支持上下文感知的智能对话
 * @param {string} message - 用户消息
 * @param {object|string} contextOrConfig - 可以是上下文字符串或完整的配置对象
 * @param {string} userLevel - 用户水平 (beginner/intermediate/advanced) - 向后兼容
 * @param {number} maxLength - 回复最大字符数，默认200字 - 向后兼容
 */
export const aiChat = async (message, contextOrConfig = '', userLevel = 'beginner', maxLength = 200) => {
  try {
    let requestBody;

    // 检查是否是新的配置对象格式
    if (typeof contextOrConfig === 'object' && contextOrConfig !== null) {
      requestBody = {
        message,
        context: contextOrConfig.context || '',
        user_level: contextOrConfig.user_level || userLevel,
        max_length: contextOrConfig.max_length || maxLength,
        page_url: contextOrConfig.page_url || '',
        page_type: contextOrConfig.page_type || '',
        recent_actions: contextOrConfig.recent_actions || [],
        language: normalizeLanguageCode(contextOrConfig.language || 'zh-CN'),
        detect_language: contextOrConfig.detect_language || false
      };
    } else {
      // 向后兼容旧的API调用方式
      requestBody = {
        message,
        context: contextOrConfig,
        user_level: userLevel,
        max_length: maxLength,
        page_url: '',
        page_type: '',
        recent_actions: [],
        language: normalizeLanguageCode('zh-CN'),
        detect_language: false
      };
    }

    const response = await fetch(getApiUrl('/ai/chat'), {
      method: 'POST',
      ...getRequestConfig(),
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('AI Chat API Error:', error);
    throw new Error(`AI聊天服务暂时不可用: ${error.message}`);
  }
};

/**
 * TTS语音合成
 * @param {string} text - 要转换的文字
 * @param {string} voice - 声音类型 (alloy/echo/fable/onyx/nova/shimmer)
 * @param {string} model - TTS模型 (tts-1/tts-1-hd)
 */
export const textToSpeech = async (text, voice = 'alloy', model = 'tts-1', language = 'zh-CN') => {
  try {
    // 使用统一的语言工具规范化语言代码
    const normalizedLang = normalizeLanguageCode(language);
    const ttsConfig = getTTSConfig(normalizedLang);
    const selectedVoice = ttsConfig.voice || voice;

    console.log('🎵 TTS API调用:', { text: text.substring(0, 50), voice: selectedVoice, language: normalizedLang });

    // 调用后端OpenAI TTS API - 与ClassroomPage.jsx相同的实现
    const response = await fetch(getApiUrl('/ai/tts'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        voice: selectedVoice,
        model: model
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    console.log('✅ TTS API成功');
    return data.audio_base64;
  } catch (error) {
    console.error('TTS API Error:', error);
    throw new Error(`语音合成服务暂时不可用: ${error.message}`);
  }
};

/**
 * 语音转文字 (STT)
 * @param {File|Blob} audioFile - 音频文件
 * @param {string} language - 语言代码 (可选)
 * @returns {Promise<string>} 转换后的文字
 */
export const speechToText = async (audioFile, language = 'zh-CN') => {
  try {
    console.log('🎤 STT API调用开始:', {
      fileSize: audioFile.size,
      fileType: audioFile.type,
      language: normalizeLanguageCode(language)
    });

    // 创建FormData来上传音频文件
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('language', normalizeLanguageCode(language));

    // 调用后端STT API
    const response = await fetch(getApiUrl('/ai/stt'), {
      method: 'POST',
      body: formData // 注意：不要设置Content-Type，让浏览器自动设置
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    console.log('✅ STT API成功:', data.text?.substring(0, 50) + '...');
    return data.text || '';
  } catch (error) {
    console.error('STT API Error:', error);
    throw new Error(`语音识别服务暂时不可用: ${error.message}`);
  }
};

/**
 * 录制音频工具类
 */
export class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
  }

  async startRecording() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      console.log('🎤 开始录音');
      return true;
    } catch (error) {
      console.error('录音启动失败:', error);
      throw new Error('无法访问麦克风，请检查权限设置');
    }
  }

  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        reject(new Error('录音器未激活'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });

          // 停止所有音频轨道
          if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
          }

          console.log('🎤 录音结束，文件大小:', audioBlob.size);
          resolve(audioBlob);
        } catch (error) {
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  isRecording() {
    return this.mediaRecorder && this.mediaRecorder.state === 'recording';
  }
}

// 导出detectLanguage函数 - 从languageUtils导入以保持一致性
export { detectTextLanguage as detectLanguage } from './languageUtils.js';

// 导出getLanguageName函数 - 从languageUtils导入以保持一致性
export { getLanguageName } from './languageUtils.js';

/**
 * AI代码提示
 * @param {number} problemId - 问题ID
 * @param {string} code - 代码内容
 */
export const getCodeHint = async (problemId, code) => {
  try {
    const response = await fetch(`${getApiUrl('/ai/hint')}?problem_id=${problemId}&code=${encodeURIComponent(code)}`, {
      method: 'POST',
      ...getRequestConfig()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.hint;
  } catch (error) {
    console.error('Code Hint API Error:', error);
    return '代码提示服务暂时不可用，请稍后重试。';
  }
};

/**
 * AI代码反馈
 * @param {number} problemId - 问题ID
 * @param {string} code - 代码内容
 */
export const getCodeFeedback = async (problemId, code) => {
  try {
    const response = await fetch(`${getApiUrl('/ai/feedback')}?problem_id=${problemId}&code=${encodeURIComponent(code)}`, {
      method: 'POST',
      ...getRequestConfig()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.feedback;
  } catch (error) {
    console.error('Code Feedback API Error:', error);
    return '代码反馈服务暂时不可用，请稍后重试。';
  }
};

/**
 * 播放音频（base64格式或模拟数据）
 * @param {string} audioBase64 - base64编码的音频数据或模拟标识符
 * @param {string} text - 如果是模拟数据，使用此文本进行语音合成
 * @returns {Promise<void>}
 */
export const playAudioFromBase64 = async (audioBase64, text = '') => {
  try {
    // 检查是否为模拟的TTS数据
    if (audioBase64.startsWith('mock_tts_')) {
      console.log('🎵 使用Web Speech API播放模拟语音:', text.substring(0, 50));

      // 使用Web Speech API进行语音合成
      if ('speechSynthesis' in window) {
        return new Promise((resolve, reject) => {
          const utterance = new SpeechSynthesisUtterance(text);

          // 设置中文语音
          utterance.lang = 'zh-CN';
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;

          // 尝试使用中文语音
          const voices = speechSynthesis.getVoices();
          const chineseVoice = voices.find(voice =>
            voice.lang.includes('zh') || voice.lang.includes('CN')
          );
          if (chineseVoice) {
            utterance.voice = chineseVoice;
          }

          utterance.onend = () => {
            console.log('✅ 语音播放完成');
            resolve();
          };

          utterance.onerror = (error) => {
            console.error('语音播放错误:', error);
            reject(new Error('语音播放失败'));
          };

          // 停止当前播放的语音
          speechSynthesis.cancel();

          // 开始播放
          speechSynthesis.speak(utterance);
        });
      } else {
        console.warn('浏览器不支持Web Speech API，跳过语音播放');
        return Promise.resolve();
      }
    }

    // 处理真实的base64音频数据
    // 将base64转换为Blob
    const byteCharacters = atob(audioBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'audio/mpeg' });

    // 创建音频URL
    const audioUrl = URL.createObjectURL(blob);

    // 创建并播放音频
    const audio = new Audio(audioUrl);

    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };

      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };

      audio.play().catch(reject);
    });
  } catch (error) {
    console.error('Audio playback error:', error);
    throw new Error('音频播放失败');
  }
};

/**
 * AI教师讲解文本生成（快速响应，包含黑板绘制指令）
 * @param {string} topic - 讲解主题
 * @param {string} context - 课程上下文
 * @param {string} userLevel - 用户水平
 * @returns {Promise<{text: string, boardActions: Array}>}
 */
export const aiTeacherText = async (topic, context = '', userLevel = 'beginner') => {
  try {
    // 构造增强的教学提示，支持更多元素类型和多语言
    const teachingPrompt = `你是一名具有丰富经验的高级编程教师，专门为"${topic}"设计一堂生动的课程。

课程背景：${context}
学生水平：${userLevel}
教学语言：请用中文进行教学

IMPORTANT: 你必须严格按照以下JSON格式回复，不要添加任何其他文字、标点符号或格式化：

{
  "text": "用100字以内生动有趣地讲解这个知识点，使用比喻和实例，适合语音播放",
  "boardActions": [
    {
      "type": "title",
      "content": "${topic}",
      "position": {"x": 50, "y": 80},
      "style": {"color": "#00d4ff", "size": "xlarge"}
    },
    {
      "type": "concept",
      "content": "💡 核心概念1 - 具体说明",
      "position": {"x": 50, "y": 160},
      "style": {"color": "#ffffff", "size": "large"}
    },
    {
      "type": "concept",
      "content": "✨ 核心概念2 - 具体说明",
      "position": {"x": 50, "y": 240},
      "style": {"color": "#ffffff", "size": "large"}
    },
    {
      "type": "concept",
      "content": "🔥 核心概念3 - 具体说明",
      "position": {"x": 50, "y": 320},
      "style": {"color": "#ffffff", "size": "large"}
    }
  ]
}

要求：
1. 必须返回完整的JSON格式，不要任何其他文字
2. text内容要通俗易懂，适合${userLevel}水平
3. boardActions包含4个元素：1个title + 3个concept
4. 每个concept要有emoji和具体说明
5. 位置垂直排列，间距80px
6. 内容要与${topic}紧密相关

CRITICAL: 只返回JSON，不要markdown格式，不要代码块标记！`;

    // 获取AI讲解内容
    const chatResponse = await aiChat(teachingPrompt, context, userLevel);

    try {
      const responseText = chatResponse.response.trim();
      console.log('🎯 AI原始响应:', responseText);

      // 强化JSON提取逻辑
      const jsonContent = null;
      let parsedResponse = null;

      try {
        // 方法1: 直接解析整个响应（最常见情况）
        parsedResponse = JSON.parse(responseText);
        console.log('✅ 直接解析成功');
      } catch (e) {
        // 方法2: 提取JSON对象
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedResponse = JSON.parse(jsonMatch[0]);
            console.log('✅ JSON对象提取成功');
          } catch (e2) {
            console.log('❌ JSON对象解析失败');
          }
        }
      }

      // 方法3: 去除markdown并重试
      if (!parsedResponse) {
        try {
          const cleaned = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
          const cleanedMatch = cleaned.match(/\{[\s\S]*\}/);
          if (cleanedMatch) {
            parsedResponse = JSON.parse(cleanedMatch[0]);
            console.log('✅ 清理后解析成功');
          }
        } catch (e) {
          console.log('❌ 清理后解析失败');
        }
      }

      if (!parsedResponse) {
        throw new Error('无法解析AI响应JSON');
      }

      console.log('📊 解析成功的AI响应:', parsedResponse);

      // 验证响应结构
      const hasValidText = parsedResponse.text && typeof parsedResponse.text === 'string' && parsedResponse.text.trim().length > 0;
      const hasValidActions = parsedResponse.boardActions && Array.isArray(parsedResponse.boardActions) && parsedResponse.boardActions.length > 0;

      console.log('验证结果:', { hasValidText, hasValidActions, actionCount: parsedResponse.boardActions?.length });

      if (hasValidText && hasValidActions) {
        // 简单垂直布局，确保元素不重叠
        const optimizedBoardActions = parsedResponse.boardActions.map((action, index) => {
          // 垂直排列，间距足够避免重叠
          const optimizedPosition = {
            x: 50,
            y: 80 + index * 80  // 每个元素间隔80px
          };

          // 根据类型调整字体大小
          let adjustedSize = action.style?.size || 'medium';
          if (action.type === 'title') adjustedSize = 'large';
          if (action.type === 'code') adjustedSize = 'small';

          return {
            ...action,
            position: {
              x: Math.max(30, Math.min(750, action.position?.x || optimizedPosition.x)),
              y: Math.max(30, Math.min(450, action.position?.y || optimizedPosition.y))
            },
            style: {
              ...action.style,
              color: action.type === 'title' ? '#00d4ff' : '#ffffff',
              size: adjustedSize
            }
          };
        });

        console.log('✅ AI成功生成优化布局的板书内容:', optimizedBoardActions);
        return {
          text: parsedResponse.text,
          boardActions: optimizedBoardActions
        };
      } else {
        throw new Error('Invalid JSON structure');
      }
    } catch (parseError) {
      console.warn('⚠️ AI未返回有效JSON，使用智能降级方案:', parseError);
      console.log('原始AI回复:', chatResponse.response);

      // 智能降级方案：基于AI文字内容动态生成板书
      const smartFallbackActions = generateSmartFallbackBoardActions(topic, chatResponse.response);

      return {
        text: chatResponse.response,
        boardActions: smartFallbackActions
      };
    }
  } catch (error) {
    console.error('AI Teacher Text Error:', error);
    throw new Error(`AI教师文本生成失败: ${error.message}`);
  }
};

/**
 * 智能降级方案：基于AI文字内容动态生成板书
 */
const generateSmartFallbackBoardActions = (topic, text) => {
  console.log('🔍 开始智能分析AI文字内容生成板书');

  const actions = [];
  const sentences = text.split(/[。！？.!?]/).filter(s => s.trim().length > 5);

  // 垂直布局计数器
  let currentY = 80;
  let itemIndex = 0;

  // 1. 生成主标题
  actions.push({
    type: 'title',
    content: topic,
    position: { x: 50, y: currentY },
    style: { color: '#00d4ff', size: 'xlarge' }
  });
  currentY += 80;
  itemIndex++;

  // 2. 分析文字内容，提取关键概念
  const keyWords = extractKeywords(text, topic);
  const concepts = keyWords.slice(0, 3); // 最多3个核心概念

  concepts.forEach((concept, index) => {
    actions.push({
      type: 'concept',
      content: `💡 ${concept}`,
      position: { x: 50, y: currentY },
      style: { color: '#ffffff', size: 'large' }
    });
    currentY += 80;
    itemIndex++;
  });

  // 3. 如果提到代码相关内容，生成代码示例
  if (text.includes('代码') || text.includes('函数') || text.includes('组件') || text.includes('function')) {
    const codeExample = generateCodeExample(topic, text);
    if (codeExample) {
      actions.push({
        type: 'code',
        content: codeExample,
        position: { x: 50, y: currentY },
        style: { color: '#ffffff', size: 'medium' }
      });
      currentY += 120; // 代码块需要更多空间
      itemIndex++;
    }
  }

  // 4. 如果是流程相关内容，生成流程图
  if (text.includes('流程') || text.includes('过程') || text.includes('步骤') || text.includes('→')) {
    const flowContent = extractFlowContent(text, topic);
    if (flowContent) {
      actions.push({
        type: 'flow',
        content: flowContent,
        position: { x: 50, y: currentY },
        style: { color: '#ffffff', size: 'medium' }
      });
      currentY += 80;
      itemIndex++;
    }
  }

  // 5. 如果是对比内容，生成对比图
  if (text.includes('对比') || text.includes('vs') || text.includes('相比') || text.includes('优势')) {
    const comparisonContent = extractComparisonContent(text, topic);
    if (comparisonContent) {
      actions.push({
        type: 'comparison',
        content: comparisonContent,
        position: { x: 50, y: currentY },
        style: { color: '#ffffff', size: 'medium' }
      });
      currentY += 80;
      itemIndex++;
    }
  }

  console.log('📝 智能生成的板书内容:', actions);
  return actions;
};

/**
 * 提取关键词
 */
const extractKeywords = (text, topic) => {
  const keywords = [];

  // React相关关键词
  if (topic.includes('React') || text.includes('React')) {
    const reactKeywords = ['组件化', 'Virtual DOM', '状态管理', 'JSX', 'Props', 'Hook', '生命周期'];
    keywords.push(...reactKeywords.filter(kw => text.includes(kw)));
  }

  // 通用技术关键词提取
  const commonKeywords = [
    '性能', '优化', '效率', '架构', '设计', '模式', '原理', '机制',
    '特点', '优势', '核心', '基础', '重要', '关键'
  ];

  commonKeywords.forEach(kw => {
    if (text.includes(kw)) {
      // 尝试提取包含关键词的短语
      const regex = new RegExp(`([^，。！？]*${kw}[^，。！？]*)`, 'g');
      const matches = text.match(regex);
      if (matches) {
        keywords.push(...matches.slice(0, 2).map(m => m.trim()));
      }
    }
  });

  return [...new Set(keywords)].slice(0, 3); // 去重并限制数量
};

/**
 * 生成代码示例
 */
const generateCodeExample = (topic, text) => {
  if (topic.includes('React') || text.includes('React')) {
    if (text.includes('组件') || text.includes('function')) {
      return 'function MyComponent() { return <div>Hello React!</div>; }';
    }
    if (text.includes('Hook') || text.includes('useState')) {
      return 'const [state, setState] = useState(initialValue);';
    }
  }

  // 通用代码示例
  if (text.includes('函数')) {
    return 'function example() { /* 示例代码 */ }';
  }

  return null;
};

/**
 * 提取流程内容
 */
const extractFlowContent = (text, topic) => {
  if (topic.includes('Virtual DOM') || text.includes('Virtual DOM')) {
    return 'JSX → Virtual DOM → Diff算法 → 更新DOM';
  }

  if (topic.includes('React') || text.includes('React')) {
    return '编写组件 → 渲染界面 → 状态更新 → 重新渲染';
  }

  // 尝试从文本中提取包含箭头的流程
  const arrowMatch = text.match(/[^。！？]*→[^。！？]*/);
  if (arrowMatch) {
    return arrowMatch[0].trim();
  }

  return null;
};

/**
 * 提取对比内容
 */
const extractComparisonContent = (text, topic) => {
  if (topic.includes('Virtual DOM') || text.includes('Virtual DOM')) {
    return '传统DOM: 直接操作，性能低 ❌\nVirtual DOM: 优化算法，性能高 ✅';
  }

  if (text.includes('优势') || text.includes('优点')) {
    return '传统方式: 复杂难维护 ❌\n新技术: 简单高效 ✅';
  }

  return null;
};

/**
 * 生成降级的板书内容（保留原有功能）
 */
const generateFallbackBoardActions = (topic, text) => {
  const actions = [];

  // 根据主题类型生成不同的板书内容
  if (topic.includes('React') || topic.includes('组件')) {
    actions.push(
      {
        type: 'title',
        content: 'React框架核心概念',
        position: { x: 250, y: 40 },
        style: { color: '#61dafb', size: 'xlarge' }
      },
      {
        type: 'concept',
        content: '🔧 组件化开发',
        position: { x: 80, y: 100 },
        style: { color: '#4fc3f7', size: 'large' }
      },
      {
        type: 'concept',
        content: '⚡ Virtual DOM',
        position: { x: 300, y: 100 },
        style: { color: '#66bb6a', size: 'large' }
      },
      {
        type: 'concept',
        content: '🔄 单向数据流',
        position: { x: 500, y: 100 },
        style: { color: '#ff7043', size: 'large' }
      },
      {
        type: 'diagram',
        content: 'React组件架构',
        position: { x: 50, y: 150 },
        style: { color: '#ffffff', size: 'medium' }
      },
      {
        type: 'code',
        content: 'function App() { return <div>Hello React!</div>; }',
        position: { x: 80, y: 280 },
        style: { color: '#ffd54f', size: 'medium' }
      }
    );
  } else if (topic.includes('Virtual DOM') || topic.includes('DOM')) {
    actions.push(
      {
        type: 'title',
        content: 'Virtual DOM 工作原理',
        position: { x: 200, y: 40 },
        style: { color: '#f59e0b', size: 'xlarge' }
      },
      {
        type: 'flow',
        content: 'JSX → Virtual DOM → Diff算法 → Real DOM',
        position: { x: 50, y: 120 },
        style: { color: '#f59e0b', size: 'medium' }
      },
      {
        type: 'comparison',
        content: '传统DOM操作: 慢 ❌\nVirtual DOM: 快 ✅',
        position: { x: 100, y: 200 },
        style: { color: '#06b6d4', size: 'medium' }
      },
      {
        type: 'concept',
        content: '🚀 性能优化核心技术',
        position: { x: 350, y: 200 },
        style: { color: '#10b981', size: 'large' }
      }
    );
  } else if (topic.includes('基础') || topic.includes('基本原理')) {
    actions.push(
      {
        type: 'title',
        content: topic,
        position: { x: 150, y: 40 },
        style: { color: '#00d4ff', size: 'xlarge' }
      },
      {
        type: 'concept',
        content: '📚 ' + text.substring(0, 40),
        position: { x: 80, y: 120 },
        style: { color: '#10b981', size: 'large' }
      },
      {
        type: 'concept',
        content: '💡 核心特点',
        position: { x: 80, y: 180 },
        style: { color: '#8b5cf6', size: 'large' }
      },
      {
        type: 'concept',
        content: '🎯 实际应用',
        position: { x: 350, y: 180 },
        style: { color: '#f48fb1', size: 'large' }
      }
    );
  } else {
    // 通用模板
    actions.push(
      {
        type: 'title',
        content: topic,
        position: { x: 150, y: 40 },
        style: { color: '#00d4ff', size: 'xlarge' }
      },
      {
        type: 'concept',
        content: '📖 ' + text.substring(0, 50) + '...',
        position: { x: 80, y: 120 },
        style: { color: '#ffffff', size: 'medium' }
      }
    );
  }

  return actions;
};

/**
 * AI教师语音讲解（组合聊天和TTS）
 * @param {string} topic - 讲解主题
 * @param {string} context - 课程上下文
 * @param {string} userLevel - 用户水平
 * @returns {Promise<{text: string, audioBase64: string}>}
 */
export const aiTeacherLecture = async (topic, context = '', userLevel = 'beginner') => {
  try {
    // 先获取文本
    const textResult = await aiTeacherText(topic, context, userLevel);

    // 再生成语音
    const audioBase64 = await textToSpeech(textResult.text, 'alloy', 'tts-1');

    return {
      text: textResult.text,
      audioBase64: audioBase64
    };
  } catch (error) {
    console.error('AI Teacher Lecture Error:', error);
    throw new Error(`AI教师讲解服务暂时不可用: ${error.message}`);
  }
};

/**
 * AI简历生成
 * @param {string} courseName - 课程名称
 * @param {Array} skills - 技能列表
 * @param {string} projectContext - 项目上下文
 * @param {string} userLevel - 用户水平
 * @returns {Promise<{resume_content: string, course: string, timestamp: string}>}
 */
export const generateResume = async (courseName, skills = [], projectContext = '', userLevel = 'beginner') => {
  try {
    const response = await fetch(getApiUrl('/ai/resume'), {
      method: 'POST',
      ...getRequestConfig(),
      body: JSON.stringify({
        course_name: courseName,
        skills: skills,
        project_context: projectContext,
        user_level: userLevel
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error('Resume Generation API Error:', error);
    throw new Error(`AI简历生成服务暂时不可用: ${error.message}`);
  }
};

// 导出API配置 (从config/api.js导入)
export { API_CONFIG, getApiUrl } from '../config/api.js';