import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Card,
  Button,
  Space,
  Tabs,
  message,
  Typography,
  Input,
  Avatar,
  Progress,
  Tag
} from 'antd';
import { getAlgorithmScript } from '../../utils/algorithmTeachingScripts';
import { renderAlgorithmStep } from '../../utils/algorithmVisualizationEngine';
import { textToSpeech, playAudioFromBase64 } from '../../utils/aiApi';
import {
  EditOutlined,
  ClearOutlined,
  UndoOutlined,
  RedoOutlined,
  SaveOutlined,
  PlayCircleOutlined,
  PauseOutlined,
  FullscreenOutlined,
  RobotOutlined,
  UserOutlined,
  BookOutlined,
  SettingOutlined,
  FontSizeOutlined,
  BorderOutlined,
  RadiusUpleftOutlined,
  ArrowRightOutlined,
  DownloadOutlined,
  UploadOutlined,
  BgColorsOutlined,
  CloseOutlined,
  AppstoreOutlined,
  DashboardOutlined,
  SelectOutlined,
  DesktopOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;
const { TextArea } = Input;

// ========== AI智能黑板组件 ==========

const AIBlackboard = React.forwardRef(({ courseContent, onDrawingChange, onAITeach, onStartVoiceChat, voiceChatStates, onTopicClick, hideTeacherCard = false }, ref) => {
  const { t, i18n } = useTranslation('classroom');
  const { isDarkTheme } = useTheme();

  // 调试语言设置
  console.log('AIBlackboard current language:', i18n.language);
  console.log('drawingTools translation:', t('drawingTools'));

  // 临时强制设置为中文用于测试
  React.useEffect(() => {
    if (i18n.language !== 'zh') {
      i18n.changeLanguage('zh');
    }
  }, [i18n]);

  // Force color display for color swatches
  React.useEffect(() => {
    const interval = setInterval(() => {
      const colorSwatches = document.querySelectorAll('.color-swatch');
      colorSwatches.forEach(swatch => {
        const color = swatch.getAttribute('data-color');
        if (color) {
          swatch.style.backgroundColor = color;
          swatch.style.background = color;
          swatch.style.backgroundImage = 'none';
        }
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#00d4ff');
  const [lineWidth, setLineWidth] = useState(3);
  const [fontSize, setFontSize] = useState(16);
  const [currentFont, setCurrentFont] = useState('Arial');
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [layers, setLayers] = useState([]);
  const [currentLayer, setCurrentLayer] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedTemplate, setSelectedTemplate] = useState(false);
  const [isResizingTemplate, setIsResizingTemplate] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null); // 'nw', 'ne', 'sw', 'se', 'n', 'e', 's', 'w'
  const [resizeStart, setResizeStart] = useState(null);
  const [hoveredHandle, setHoveredHandle] = useState(null);
  const [shapeStart, setShapeStart] = useState({ x: 0, y: 0 });
  // 绘图元素选择和编辑状态
  const [selectedElement, setSelectedElement] = useState(null);
  const [editingElement, setEditingElement] = useState(null);
  const [draggedPoint, setDraggedPoint] = useState(null); // 'start' | 'end' | 'whole'
  const [elements, setElements] = useState([]); // 存储所有绘制的元素
  const [tempCanvas, setTempCanvas] = useState(null);
  const [drawingHistory, setDrawingHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [aiTeaching, setAiTeaching] = useState(false);
  const [teachingInput, setTeachingInput] = useState('');
  const [showTools, setShowTools] = useState(false); // 默认隐藏工具栏
  const [currentSpeech, setCurrentSpeech] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [teachingProgress, setTeachingProgress] = useState(0);
  const [templateElements, setTemplateElements] = useState([]);  // 存储模板元素位置信息
  const [editingText, setEditingText] = useState('');           // 编辑中的文字
  const [currentTemplate, setCurrentTemplate] = useState(null); // 存储当前应用的完整模板
  const [templateTextEdits, setTemplateTextEdits] = useState({}); // 存储所有文字编辑记录
  const [templateScale, setTemplateScale] = useState(1); // 模板缩放比例
  const [templateOffset, setTemplateOffset] = useState({ x: 0, y: 0 }); // 模板偏移位置
  const [showTemplateModal, setShowTemplateModal] = useState(false); // 模板选择悬浮框
  const [showQuickTools, setShowQuickTools] = useState(false); // 快捷工具悬浮状态
  const [showDrawingTools, setShowDrawingTools] = useState(false); // 绘图工具悬浮状态
  const [showColorPalette, setShowColorPalette] = useState(false); // 颜色面板悬浮状态
  const [showSettings, setShowSettings] = useState(false); // 设置面板悬浮状态
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(false); // 工具栏展开状态
  const [isResizing, setIsResizing] = useState(false); // 是否正在调整大小

  // Click outside to close panels
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      // 检查是否点击在模板卡片外部
      if (showTemplateModal) {
        const templateModal = document.querySelector('[data-panel="template-modal"]');
        if (templateModal && !templateModal.contains(event.target)) {
          setShowTemplateModal(false);
        }
      }

      // 检查是否点击在颜色面板外部
      if (showColorPalette) {
        const colorPanel = document.querySelector('[data-panel="color-palette"]');
        if (colorPanel && !colorPanel.contains(event.target)) {
          setShowColorPalette(false);
        }
      }

      // 检查是否点击在设置面板外部
      if (showSettings) {
        const settingsPanel = document.querySelector('[data-panel="settings-panel"]');
        if (settingsPanel && !settingsPanel.contains(event.target)) {
          setShowSettings(false);
        }
      }

      // 检查是否点击在绘图工具面板外部
      if (showDrawingTools) {
        const drawingToolsPanel = document.querySelector('[data-panel="drawing-tools"]');
        if (drawingToolsPanel && !drawingToolsPanel.contains(event.target)) {
          setShowDrawingTools(false);
        }
      }

      // 检查是否点击在快捷工具面板外部
      if (showQuickTools) {
        const quickToolsPanel = document.querySelector('[data-panel="quick-tools"]');
        if (quickToolsPanel && !quickToolsPanel.contains(event.target)) {
          setShowQuickTools(false);
        }
      }
    };

    // 只有当有面板打开时才添加监听器
    if (showTemplateModal || showColorPalette || showSettings || showDrawingTools || showQuickTools) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTemplateModal, showColorPalette, showSettings, showDrawingTools, showQuickTools]);

  // Drawing-related state
  const drawingRef = useRef({
    isDrawing: false,
    lastX: 0,
    lastY: 0
  });

  // AI teaching preset content - fully dynamic based on course data
  const generateTeachingPresets = () => {
    if (!courseContent) {
      return [t('blackboard.loadingContent', { ns: 'classroom' })];
    }

    // 优先使用课程数据中的AI教师主题（完全数据驱动）
    if (courseContent.aiTeacher && courseContent.aiTeacher.topics && courseContent.aiTeacher.topics.length > 0) {
      // 从课程数据动态获取主题
      return courseContent.aiTeacher.topics.map(topic => topic.title);
    }

    // 如果有算法题相关数据结构，返回算法主题
    if (courseContent.hints || courseContent.examples || courseContent.testCases || courseContent.solutions) {
      return [
        '题目解读',
        '思路分析',
        '复杂度解析',
        '追问问题'
      ];
    }

    // 修复：正确读取课程数据并生成4个具体的教学主题
    const theoryStage = courseContent.stages?.theory;
    const courseTopic = theoryStage?.topic || courseContent.topic || courseContent.meta?.title;
    const keyPoints = courseContent.summary?.keyPoints || theoryStage?.keyPoints || courseContent.keyPoints;
    const lessonTitle = courseContent.meta?.title || '';

    console.log('Course data for topics:', {
      courseTopic,
      keyPoints: keyPoints?.length,
      courseTitle: courseContent.meta?.title,
      lessonTitle
    });

    // 针对不同类型的课程生成差异化的教学主题
    const topicGenerators = {
      // JavaScript基础语法课程
      'javascript-basic': () => [
        '变量声明与命名',
        '数据类型系统',
        '运算符应用',
        '代码规范实践'
      ],

      // JavaScript函数课程
      'javascript-function': () => [
        '📦 函数定义语法',
        '🔄 参数与返回值',
        '🏃 作用域机制',
        '💡 高阶函数应用'
      ],

      // JavaScript对象课程
      'javascript-object': () => [
        '🏗️ 对象字面量',
        '🔧 属性访问方式',
        '🔗 原型继承',
        '📚 面向对象设计'
      ],

      // 算法相关课程
      'algorithm': () => [
        '📝 题目分析方法',
        '🧠 解题思路构建',
        '⚡ 算法复杂度',
        '🔄 代码优化技巧'
      ],

      // React相关课程
      'react': () => [
        '⚛️ React核心概念',
        '🧩 组件化思维',
        '🌐 Virtual DOM',
        '📝 JSX语法规则'
      ],

      // 通用编程课程
      'general': () => [
        '核心概念解析',
        '实际应用场景',
        '最佳实践',
        '问题排查技巧'
      ]
    };

    // 根据课程内容智能选择主题生成器
    let selectedGenerator = 'general';

    if (lessonTitle.includes('JavaScript') || lessonTitle.includes('JS')) {
      if (lessonTitle.includes('基础') || lessonTitle.includes('语法')) {
        selectedGenerator = 'javascript-basic';
      } else if (lessonTitle.includes('函数')) {
        selectedGenerator = 'javascript-function';
      } else if (lessonTitle.includes('对象')) {
        selectedGenerator = 'javascript-object';
      }
    } else if (courseTopic?.includes('算法') || courseContent.hints || courseContent.testCases) {
      selectedGenerator = 'algorithm';
    } else if (lessonTitle.includes('React') || courseTopic?.includes('React')) {
      selectedGenerator = 'react';
    }

    return topicGenerators[selectedGenerator]();
  };

  const teachingPresets = generateTeachingPresets();

  // Teaching script data structure - dynamically generated from course content
  const generateTeachingScripts = () => {
    if (!courseContent) {
      return {
        [t('blackboard.loadingContent', { ns: 'classroom' })]: [
          {
            speech: t('blackboard.loadingContent', { ns: 'classroom' }),
            boardAction: "renderTitle",
            delay: 0
          }
        ]
      };
    }

    const scripts = {};

    // Generate scripts for each teaching preset
    teachingPresets.forEach(preset => {
      if (preset.includes("What is") && courseContent.topic) {
        scripts[preset] = [
          {
            speech: `Hello everyone, today we will learn about ${courseContent.topic}. This is an important learning content.`,
            boardAction: "renderTitle",
            delay: 0
          },
          {
            speech: courseContent.content || `Let's dive deep into the knowledge about ${courseContent.topic}.`,
            boardAction: "renderDefinition",
            delay: 4000
          }
        ];
      } else if (preset.includes("Basic principles") && courseContent.keyPoints) {
        const firstKey = courseContent.keyPoints[0] || "";
        const explanation = firstKey.split(' - ')[1] || firstKey;
        scripts[preset] = [
          {
            speech: `The core principles of ${courseContent.topic} include the following aspects.`,
            boardAction: "renderConcept",
            delay: 0
          },
          {
            speech: explanation || "Let's understand these important concepts in detail.",
            boardAction: "renderKeyPoints",
            delay: 4000
          }
        ];
      } else {
        // Generate generic scripts for other questions
        scripts[preset] = [
          {
            speech: `Regarding ${preset.replace('?', '')}, let me explain in detail for everyone.`,
            boardAction: "renderTitle",
            delay: 0
          },
          {
            speech: "This is an important knowledge point that we need to understand and master carefully.",
            boardAction: "renderExplanation",
            delay: 4000
          }
        ];
      }
    });

    // 动态生成算法题目的教学脚本
    try {
      scripts['两数之和'] = getAlgorithmScript('两数之和');
      scripts['反转链表'] = getAlgorithmScript('反转链表');
      scripts['二分查找'] = getAlgorithmScript('二分查找');
      // 可以继续添加更多算法...
      console.log('✅ 成功加载算法教学脚本，支持的算法:', ['两数之和', '反转链表', '二分查找']);
    } catch (error) {
      console.error('❌ 加载算法教学脚本失败:', error);
    }

    return scripts;
  };

  const teachingScripts = generateTeachingScripts();

  // Save drawing history
  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL();
      const newHistory = drawingHistory.slice(0, historyStep + 1);
      newHistory.push(imageData);
      setDrawingHistory(newHistory);
      setHistoryStep(newHistory.length - 1);
    }
  }, [drawingHistory, historyStep]);

  // Undo drawing
  const undoDrawing = useCallback(() => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const newStep = historyStep - 1;
        const imageData = drawingHistory[newStep];

        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          setHistoryStep(newStep);
        };
        img.src = imageData;
      }
    }
  }, [historyStep, drawingHistory]);

  // Redo drawing
  const redoDrawing = useCallback(() => {
    if (historyStep < drawingHistory.length - 1) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const newStep = historyStep + 1;
        const imageData = drawingHistory[newStep];

        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          setHistoryStep(newStep);
        };
        img.src = imageData;
      }
    }
  }, [historyStep, drawingHistory]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = lineWidth;

      // Set high quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.textRenderingOptimization = 'optimizeQuality';

      // Set canvas background - pure blackboard color background
      ctx.fillStyle = '#1a1a1a'; // Pure blackboard color, consistent with clearCanvas
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle texture effects to simulate real blackboard
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.02})`;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Save initial state
      saveToHistory();
    }

    // Initialize Speech Synthesis - 初始化语音合成
    const initializeSpeechSynthesis = () => {
      console.log('🎤 初始化语音合成系统...');

      if ('speechSynthesis' in window) {
        // 获取语音列表（可能需要等待）
        const loadVoices = () => {
          const voices = speechSynthesis.getVoices();
          console.log('🎵 可用语音数量:', voices.length);

          if (voices.length > 0) {
            const chineseVoices = voices.filter(voice =>
              voice.lang.includes('zh') ||
              voice.name.includes('Chinese') ||
              voice.name.includes('中文') ||
              voice.name.includes('Mandarin')
            );
            console.log('🇨🇳 中文语音列表:', chineseVoices.map(v => v.name));

            if (chineseVoices.length === 0) {
              console.log('⚠️ 未检测到中文语音，语音功能可能受限');
            }
          }
        };

        // 立即尝试加载
        loadVoices();

        // 监听语音列表加载完成事件
        if (speechSynthesis.addEventListener) {
          speechSynthesis.addEventListener('voiceschanged', loadVoices);
        }
      } else {
        console.error('❌ 浏览器不支持语音合成功能');
      }
    };

    initializeSpeechSynthesis();

    // Initialize templates - 算法题常用模板
    const educationalTemplates = [
      // === 基础模板 ===
      {
        id: 'flowchart_basic',
        name: '基础流程图',
        type: 'flowchart',
        elements: [
          { type: 'rectangle', x: 100, y: 50, width: 120, height: 60, text: 'Start' },
          { type: 'diamond', x: 300, y: 50, width: 100, height: 80, text: 'Decision?' },
          { type: 'rectangle', x: 500, y: 30, width: 120, height: 60, text: 'Process A' },
          { type: 'rectangle', x: 500, y: 100, width: 120, height: 60, text: 'Process B' },
          { type: 'arrow', fromX: 220, fromY: 80, toX: 300, toY: 90 },
          { type: 'arrow', fromX: 400, fromY: 70, toX: 500, toY: 60 },
          { type: 'arrow', fromX: 400, fromY: 110, toX: 500, toY: 130 }
        ]
      },

      // === 数据结构模板 ===
      {
        id: 'array_structure',
        name: '数组结构',
        type: 'data_structure',
        elements: [
          { type: 'rectangle', x: 50, y: 100, width: 60, height: 40, text: '[0]' },
          { type: 'rectangle', x: 110, y: 100, width: 60, height: 40, text: '[1]' },
          { type: 'rectangle', x: 170, y: 100, width: 60, height: 40, text: '[2]' },
          { type: 'rectangle', x: 230, y: 100, width: 60, height: 40, text: '[3]' },
          { type: 'rectangle', x: 290, y: 100, width: 60, height: 40, text: '[4]' },
          { type: 'rectangle', x: 350, y: 100, width: 60, height: 40, text: '...' },
          { type: 'rectangle', x: 50, y: 140, width: 60, height: 40, text: '1' },
          { type: 'rectangle', x: 110, y: 140, width: 60, height: 40, text: '3' },
          { type: 'rectangle', x: 170, y: 140, width: 60, height: 40, text: '5' },
          { type: 'rectangle', x: 230, y: 140, width: 60, height: 40, text: '7' },
          { type: 'rectangle', x: 290, y: 140, width: 60, height: 40, text: '9' },
          { type: 'rectangle', x: 350, y: 140, width: 60, height: 40, text: 'n' }
        ]
      },
      {
        id: 'linked_list',
        name: '链表结构',
        type: 'data_structure',
        elements: [
          { type: 'rectangle', x: 50, y: 100, width: 80, height: 50, text: 'Node1\nval|next' },
          { type: 'rectangle', x: 200, y: 100, width: 80, height: 50, text: 'Node2\nval|next' },
          { type: 'rectangle', x: 350, y: 100, width: 80, height: 50, text: 'Node3\nval|next' },
          { type: 'rectangle', x: 500, y: 100, width: 60, height: 50, text: 'NULL' },
          { type: 'arrow', fromX: 130, fromY: 125, toX: 200, toY: 125 },
          { type: 'arrow', fromX: 280, fromY: 125, toX: 350, toY: 125 },
          { type: 'arrow', fromX: 430, fromY: 125, toX: 500, toY: 125 }
        ]
      },
      {
        id: 'binary_tree',
        name: '二叉树',
        type: 'tree',
        elements: [
          { type: 'circle', x: 250, y: 50, radius: 25, text: 'Root' },
          { type: 'circle', x: 150, y: 150, radius: 25, text: 'L' },
          { type: 'circle', x: 350, y: 150, radius: 25, text: 'R' },
          { type: 'circle', x: 100, y: 250, radius: 20, text: 'LL' },
          { type: 'circle', x: 200, y: 250, radius: 20, text: 'LR' },
          { type: 'circle', x: 300, y: 250, radius: 20, text: 'RL' },
          { type: 'circle', x: 400, y: 250, radius: 20, text: 'RR' },
          { type: 'line', fromX: 235, fromY: 70, toX: 165, toY: 130 },
          { type: 'line', fromX: 265, fromY: 70, toX: 335, toY: 130 },
          { type: 'line', fromX: 135, fromY: 170, toX: 115, toY: 230 },
          { type: 'line', fromX: 165, fromY: 170, toX: 185, toY: 230 },
          { type: 'line', fromX: 335, fromY: 170, toX: 315, toY: 230 },
          { type: 'line', fromX: 365, fromY: 170, toX: 385, toY: 230 }
        ]
      },

      // === 算法模板 ===
      {
        id: 'recursion_flow',
        name: '递归流程',
        type: 'algorithm',
        elements: [
          { type: 'rectangle', x: 150, y: 30, width: 120, height: 50, text: '递归函数' },
          { type: 'diamond', x: 150, y: 120, width: 120, height: 60, text: '终止条件?' },
          { type: 'rectangle', x: 350, y: 135, width: 100, height: 30, text: '返回结果' },
          { type: 'rectangle', x: 50, y: 220, width: 100, height: 40, text: '处理逻辑' },
          { type: 'rectangle', x: 200, y: 220, width: 120, height: 40, text: '递归调用' },
          { type: 'arrow', fromX: 210, fromY: 80, toX: 210, toY: 120 },
          { type: 'arrow', fromX: 270, fromY: 150, toX: 350, toY: 150 },
          { type: 'arrow', fromX: 180, fromY: 180, toX: 100, toY: 220 },
          { type: 'arrow', fromX: 230, fromY: 180, toX: 260, toY: 220 },
          { type: 'arrow', fromX: 260, fromY: 260, toX: 260, toY: 300 },
          { type: 'arrow', fromX: 260, fromY: 300, toX: 50, toY: 300 },
          { type: 'arrow', fromX: 50, fromY: 300, toX: 50, toY: 50 },
          { type: 'arrow', fromX: 50, fromY: 50, toX: 150, toY: 50 }
        ]
      },
      {
        id: 'dp_table',
        name: '动态规划表',
        type: 'algorithm',
        elements: [
          { type: 'rectangle', x: 50, y: 50, width: 40, height: 30, text: 'dp' },
          { type: 'rectangle', x: 90, y: 50, width: 40, height: 30, text: '0' },
          { type: 'rectangle', x: 130, y: 50, width: 40, height: 30, text: '1' },
          { type: 'rectangle', x: 170, y: 50, width: 40, height: 30, text: '2' },
          { type: 'rectangle', x: 210, y: 50, width: 40, height: 30, text: '3' },
          { type: 'rectangle', x: 250, y: 50, width: 40, height: 30, text: '...' },
          { type: 'rectangle', x: 50, y: 80, width: 40, height: 30, text: '0' },
          { type: 'rectangle', x: 90, y: 80, width: 40, height: 30, text: '0' },
          { type: 'rectangle', x: 130, y: 80, width: 40, height: 30, text: '1' },
          { type: 'rectangle', x: 170, y: 80, width: 40, height: 30, text: '1' },
          { type: 'rectangle', x: 210, y: 80, width: 40, height: 30, text: '2' },
          { type: 'rectangle', x: 250, y: 80, width: 40, height: 30, text: '...' },
          { type: 'rectangle', x: 50, y: 110, width: 40, height: 30, text: '1' },
          { type: 'rectangle', x: 90, y: 110, width: 40, height: 30, text: '1' },
          { type: 'rectangle', x: 130, y: 110, width: 40, height: 30, text: '2' },
          { type: 'rectangle', x: 170, y: 110, width: 40, height: 30, text: '3' },
          { type: 'rectangle', x: 210, y: 110, width: 40, height: 30, text: '5' },
          { type: 'rectangle', x: 250, y: 110, width: 40, height: 30, text: '...' }
        ]
      },
      {
        id: 'two_pointers',
        name: '双指针',
        type: 'algorithm',
        elements: [
          { type: 'rectangle', x: 50, y: 100, width: 50, height: 40, text: 'left' },
          { type: 'rectangle', x: 100, y: 100, width: 50, height: 40, text: 'arr[1]' },
          { type: 'rectangle', x: 150, y: 100, width: 50, height: 40, text: 'arr[2]' },
          { type: 'rectangle', x: 200, y: 100, width: 50, height: 40, text: 'arr[3]' },
          { type: 'rectangle', x: 250, y: 100, width: 50, height: 40, text: 'arr[4]' },
          { type: 'rectangle', x: 300, y: 100, width: 50, height: 40, text: 'right' },
          { type: 'arrow', fromX: 75, fromY: 80, toX: 75, toY: 100 },
          { type: 'arrow', fromX: 325, fromY: 80, toX: 325, toY: 100 },
          { type: 'rectangle', x: 50, y: 50, width: 50, height: 25, text: '← left' },
          { type: 'rectangle', x: 300, y: 50, width: 50, height: 25, text: 'right →' }
        ]
      },
      {
        id: 'sliding_window',
        name: '滑动窗口',
        type: 'algorithm',
        elements: [
          { type: 'rectangle', x: 50, y: 100, width: 40, height: 40, text: 'a' },
          { type: 'rectangle', x: 90, y: 100, width: 40, height: 40, text: 'b' },
          { type: 'rectangle', x: 130, y: 100, width: 40, height: 40, text: 'c' },
          { type: 'rectangle', x: 170, y: 100, width: 40, height: 40, text: 'd' },
          { type: 'rectangle', x: 210, y: 100, width: 40, height: 40, text: 'e' },
          { type: 'rectangle', x: 250, y: 100, width: 40, height: 40, text: 'f' },
          { type: 'rectangle', x: 90, y: 80, width: 120, height: 15, text: 'window' },
          { type: 'line', fromX: 90, fromY: 95, toX: 90, toY: 100 },
          { type: 'line', fromX: 210, fromY: 95, toX: 210, toY: 100 },
          { type: 'arrow', fromX: 230, fromY: 60, toX: 260, toY: 60 },
          { type: 'rectangle', x: 200, y: 45, width: 80, height: 30, text: '滑动方向' }
        ]
      },

      // === 时间复杂度模板 ===
      {
        id: 'complexity_analysis',
        name: '复杂度分析',
        type: 'analysis',
        elements: [
          { type: 'rectangle', x: 50, y: 50, width: 150, height: 40, text: '时间复杂度' },
          { type: 'rectangle', x: 250, y: 50, width: 150, height: 40, text: '空间复杂度' },
          { type: 'rectangle', x: 50, y: 110, width: 70, height: 30, text: 'O(1)' },
          { type: 'rectangle', x: 130, y: 110, width: 70, height: 30, text: '常数' },
          { type: 'rectangle', x: 50, y: 150, width: 70, height: 30, text: 'O(n)' },
          { type: 'rectangle', x: 130, y: 150, width: 70, height: 30, text: '线性' },
          { type: 'rectangle', x: 50, y: 190, width: 70, height: 30, text: 'O(log n)' },
          { type: 'rectangle', x: 130, y: 190, width: 70, height: 30, text: '对数' },
          { type: 'rectangle', x: 50, y: 230, width: 70, height: 30, text: 'O(n²)' },
          { type: 'rectangle', x: 130, y: 230, width: 70, height: 30, text: '平方' },
          { type: 'rectangle', x: 250, y: 110, width: 70, height: 30, text: 'O(1)' },
          { type: 'rectangle', x: 330, y: 110, width: 70, height: 30, text: '常数' },
          { type: 'rectangle', x: 250, y: 150, width: 70, height: 30, text: 'O(n)' },
          { type: 'rectangle', x: 330, y: 150, width: 70, height: 30, text: '线性' }
        ]
      },

      // === 原有模板 ===
      {
        id: 'mindmap_basic',
        name: '思维导图',
        type: 'mindmap',
        elements: [
          { type: 'circle', x: 350, y: 200, radius: 60, text: 'Main Topic' },
          { type: 'circle', x: 150, y: 100, radius: 40, text: 'Branch 1' },
          { type: 'circle', x: 150, y: 300, radius: 40, text: 'Branch 2' },
          { type: 'circle', x: 550, y: 100, radius: 40, text: 'Branch 3' },
          { type: 'circle', x: 550, y: 300, radius: 40, text: 'Branch 4' },
          { type: 'line', fromX: 290, fromY: 160, toX: 190, toY: 120 },
          { type: 'line', fromX: 290, fromY: 240, toX: 190, toY: 280 },
          { type: 'line', fromX: 410, fromY: 160, toX: 510, toY: 120 },
          { type: 'line', fromX: 410, fromY: 240, toX: 510, toY: 280 }
        ]
      },
      {
        id: 'comparison_table',
        name: '📊 对比表格',
        type: 'comparison',
        elements: [
          { type: 'rectangle', x: 50, y: 50, width: 200, height: 40, text: 'Feature' },
          { type: 'rectangle', x: 250, y: 50, width: 150, height: 40, text: 'Option A' },
          { type: 'rectangle', x: 400, y: 50, width: 150, height: 40, text: 'Option B' },
          { type: 'rectangle', x: 50, y: 90, width: 200, height: 40, text: 'Performance' },
          { type: 'rectangle', x: 250, y: 90, width: 150, height: 40, text: 'Fast' },
          { type: 'rectangle', x: 400, y: 90, width: 150, height: 40, text: 'Medium' },
          { type: 'rectangle', x: 50, y: 130, width: 200, height: 40, text: 'Cost' },
          { type: 'rectangle', x: 250, y: 130, width: 150, height: 40, text: 'High' },
          { type: 'rectangle', x: 400, y: 130, width: 150, height: 40, text: 'Low' }
        ]
      }
    ];
    setTemplates(educationalTemplates);
  }, []);

  // Draw shapes function
  const drawShape = useCallback((ctx, shape, startX, startY, endX, endY) => {
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = lineWidth;
    ctx.fillStyle = currentColor;

    const width = endX - startX;
    const height = endY - startY;

    ctx.beginPath();

    switch (shape) {
      case 'rectangle':
        ctx.rect(startX, startY, width, height);
        ctx.stroke();
        break;

      case 'circle':
        const radius = Math.sqrt(width * width + height * height) / 2;
        const centerX = startX + width / 2;
        const centerY = startY + height / 2;
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 'line':
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        break;

      case 'arrow':
        // Draw line
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(endY - startY, endX - startX);
        const headlen = 15; // length of arrow head in pixels

        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - headlen * Math.cos(angle - Math.PI / 6),
          endY - headlen * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - headlen * Math.cos(angle + Math.PI / 6),
          endY - headlen * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        break;
    }
  }, [currentColor, lineWidth]);

  // Draw text function
  const drawText = useCallback((ctx, text, x, y) => {
    ctx.fillStyle = currentColor;
    ctx.font = `${fontSize}px ${currentFont}`;
    ctx.textBaseline = 'top';
    ctx.fillText(text, x, y);
  }, [currentColor, fontSize, currentFont]);

  // Apply template to canvas
  const applyTemplate = useCallback((template) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Clear canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set default styles - 模板使用白色
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = lineWidth;
    ctx.font = `${fontSize}px ${currentFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 存储模板元素信息以供后续编辑
    const elementsWithBounds = [];

    // Draw template elements
    template.elements.forEach((element, index) => {
      switch (element.type) {
        case 'rectangle':
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          if (element.text) {
            const textX = element.x + element.width/2;
            const textY = element.y + element.height/2;
            ctx.fillText(element.text, textX, textY);

            // 存储文字区域信息
            elementsWithBounds.push({
              id: `${template.id}_${index}`,
              type: 'text',
              text: element.text,
              x: textX,
              y: textY,
              bounds: {
                x: element.x,
                y: element.y,
                width: element.width,
                height: element.height
              },
              originalElement: element
            });
          }
          break;
        case 'circle':
          ctx.beginPath();
          ctx.arc(element.x, element.y, element.radius, 0, Math.PI * 2);
          ctx.stroke();
          if (element.text) {
            ctx.fillText(element.text, element.x, element.y);

            // 存储圆形文字区域信息
            elementsWithBounds.push({
              id: `${template.id}_${index}`,
              type: 'text',
              text: element.text,
              x: element.x,
              y: element.y,
              bounds: {
                x: element.x - element.radius,
                y: element.y - element.radius,
                width: element.radius * 2,
                height: element.radius * 2
              },
              originalElement: element
            });
          }
          break;
        case 'diamond':
          const centerX = element.x + element.width/2;
          const centerY = element.y + element.height/2;
          ctx.beginPath();
          ctx.moveTo(centerX, element.y);
          ctx.lineTo(element.x + element.width, centerY);
          ctx.lineTo(centerX, element.y + element.height);
          ctx.lineTo(element.x, centerY);
          ctx.closePath();
          ctx.stroke();
          if (element.text) {
            ctx.fillText(element.text, centerX, centerY);

            // 存储菱形文字区域信息
            elementsWithBounds.push({
              id: `${template.id}_${index}`,
              type: 'text',
              text: element.text,
              x: centerX,
              y: centerY,
              bounds: {
                x: element.x,
                y: element.y,
                width: element.width,
                height: element.height
              },
              originalElement: element
            });
          }
          break;
        case 'line':
          ctx.beginPath();
          ctx.moveTo(element.fromX, element.fromY);
          ctx.lineTo(element.toX, element.toY);
          ctx.stroke();
          break;
        case 'arrow':
          // Draw line
          ctx.beginPath();
          ctx.moveTo(element.fromX, element.fromY);
          ctx.lineTo(element.toX, element.toY);
          ctx.stroke();

          // Draw arrowhead
          const angle = Math.atan2(element.toY - element.fromY, element.toX - element.fromX);
          const headlen = 10;
          ctx.beginPath();
          ctx.moveTo(element.toX, element.toY);
          ctx.lineTo(
            element.toX - headlen * Math.cos(angle - Math.PI / 6),
            element.toY - headlen * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(element.toX, element.toY);
          ctx.lineTo(
            element.toX - headlen * Math.cos(angle + Math.PI / 6),
            element.toY - headlen * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
          break;
      }
    });

    // 存储模板元素信息以供编辑
    setTemplateElements(elementsWithBounds);
    setCurrentTemplate(template); // 存储完整模板
    setTemplateTextEdits({}); // 清除之前的文字编辑记录
    setTemplateScale(1); // 重置缩放
    setTemplateOffset({ x: 0, y: 0 }); // 重置偏移

    saveToHistory();
    if (onDrawingChange) {
      onDrawingChange(canvas.toDataURL());
    }

    // 模板已应用，静默保存，不显示弹窗
  }, [lineWidth, fontSize, currentFont, saveToHistory, onDrawingChange]);

  // Redraw complete template with all text edits, scale and offset
  const redrawTemplateWithAllEdits = useCallback((template, textEdits, scale = templateScale, offset = templateOffset) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Clear canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Set default styles - 模板使用白色
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = lineWidth;
    ctx.font = `${Math.round(fontSize * scale)}px ${currentFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw template elements with all applied edits, scale and offset
    template.elements.forEach((element, index) => {
      const elementId = `${template.id}_${index}`;
      // 优先使用编辑过的文字，否则使用原始文字
      const displayText = textEdits[elementId] || element.text;

      // 应用缩放和偏移变换
      const transformElement = (el) => ({
        ...el,
        x: el.x * scale + offset.x,
        y: el.y * scale + offset.y,
        width: el.width ? el.width * scale : undefined,
        height: el.height ? el.height * scale : undefined,
        radius: el.radius ? el.radius * scale : undefined,
        fromX: el.fromX ? el.fromX * scale + offset.x : undefined,
        fromY: el.fromY ? el.fromY * scale + offset.y : undefined,
        toX: el.toX ? el.toX * scale + offset.x : undefined,
        toY: el.toY ? el.toY * scale + offset.y : undefined
      });

      const scaledElement = transformElement(element);

      switch (element.type) {
        case 'rectangle':
          ctx.strokeRect(scaledElement.x, scaledElement.y, scaledElement.width, scaledElement.height);
          if (displayText) {
            ctx.fillText(displayText, scaledElement.x + scaledElement.width/2, scaledElement.y + scaledElement.height/2);
          }
          break;
        case 'circle':
          ctx.beginPath();
          ctx.arc(scaledElement.x, scaledElement.y, scaledElement.radius, 0, Math.PI * 2);
          ctx.stroke();
          if (displayText) {
            ctx.fillText(displayText, scaledElement.x, scaledElement.y);
          }
          break;
        case 'diamond':
          const centerX = scaledElement.x + scaledElement.width/2;
          const centerY = scaledElement.y + scaledElement.height/2;
          ctx.beginPath();
          ctx.moveTo(centerX, scaledElement.y);
          ctx.lineTo(scaledElement.x + scaledElement.width, centerY);
          ctx.lineTo(centerX, scaledElement.y + scaledElement.height);
          ctx.lineTo(scaledElement.x, centerY);
          ctx.closePath();
          ctx.stroke();
          if (displayText) {
            ctx.fillText(displayText, centerX, centerY);
          }
          break;
        case 'line':
          ctx.beginPath();
          ctx.moveTo(scaledElement.fromX, scaledElement.fromY);
          ctx.lineTo(scaledElement.toX, scaledElement.toY);
          ctx.stroke();
          break;
        case 'arrow':
          // Draw line
          ctx.beginPath();
          ctx.moveTo(scaledElement.fromX, scaledElement.fromY);
          ctx.lineTo(scaledElement.toX, scaledElement.toY);
          ctx.stroke();

          // Draw arrowhead
          const angle = Math.atan2(scaledElement.toY - scaledElement.fromY, scaledElement.toX - scaledElement.fromX);
          const headlen = 10 * scale;
          ctx.beginPath();
          ctx.moveTo(scaledElement.toX, scaledElement.toY);
          ctx.lineTo(
            scaledElement.toX - headlen * Math.cos(angle - Math.PI / 6),
            scaledElement.toY - headlen * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(scaledElement.toX, scaledElement.toY);
          ctx.lineTo(
            scaledElement.toX - headlen * Math.cos(angle + Math.PI / 6),
            scaledElement.toY - headlen * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
          break;
      }
    });

    // 绘制选中边框
    if (selectedTemplate && currentTool === 'select') {
      const bounds = getTemplateBounds(template);
      const scaledBounds = {
        x: bounds.x * scale + offset.x,
        y: bounds.y * scale + offset.y,
        width: bounds.width * scale,
        height: bounds.height * scale
      };

      // 绘制虚线选中边框
      ctx.save();
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.globalAlpha = 0.8;
      const margin = 5;
      ctx.strokeRect(
        scaledBounds.x - margin,
        scaledBounds.y - margin,
        scaledBounds.width + margin * 2,
        scaledBounds.height + margin * 2
      );

      // 绘制8个方向的拖拽手柄
      ctx.setLineDash([]);
      ctx.fillStyle = '#00d4ff';
      ctx.globalAlpha = 1;
      const handleSize = 6;

      // 所有8个拖拽手柄：4个角 + 4个边中点
      const handles = [
        // 四个角
        { x: scaledBounds.x - margin, y: scaledBounds.y - margin, type: 'corner' },
        { x: scaledBounds.x + scaledBounds.width + margin, y: scaledBounds.y - margin, type: 'corner' },
        { x: scaledBounds.x - margin, y: scaledBounds.y + scaledBounds.height + margin, type: 'corner' },
        { x: scaledBounds.x + scaledBounds.width + margin, y: scaledBounds.y + scaledBounds.height + margin, type: 'corner' },
        // 四个边中点
        { x: scaledBounds.x + scaledBounds.width / 2, y: scaledBounds.y - margin, type: 'edge' },
        { x: scaledBounds.x + scaledBounds.width + margin, y: scaledBounds.y + scaledBounds.height / 2, type: 'edge' },
        { x: scaledBounds.x + scaledBounds.width / 2, y: scaledBounds.y + scaledBounds.height + margin, type: 'edge' },
        { x: scaledBounds.x - margin, y: scaledBounds.y + scaledBounds.height / 2, type: 'edge' }
      ];

      handles.forEach(handle => {
        if (handle.type === 'corner') {
          // 角手柄：正方形
          ctx.fillRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
        } else {
          // 边手柄：圆形
          ctx.beginPath();
          ctx.arc(handle.x, handle.y, handleSize/2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.restore();
    }
  }, [lineWidth, fontSize, currentFont, templateScale, templateOffset, selectedTemplate, currentTool]);

  // Get template bounding box
  const getTemplateBounds = useCallback((template) => {
    if (!template || !template.elements.length) return { x: 0, y: 0, width: 0, height: 0 };

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    template.elements.forEach(element => {
      switch (element.type) {
        case 'rectangle':
        case 'diamond':
          minX = Math.min(minX, element.x);
          minY = Math.min(minY, element.y);
          maxX = Math.max(maxX, element.x + element.width);
          maxY = Math.max(maxY, element.y + element.height);
          break;
        case 'circle':
          minX = Math.min(minX, element.x - element.radius);
          minY = Math.min(minY, element.y - element.radius);
          maxX = Math.max(maxX, element.x + element.radius);
          maxY = Math.max(maxY, element.y + element.radius);
          break;
        case 'line':
        case 'arrow':
          minX = Math.min(minX, element.fromX, element.toX);
          minY = Math.min(minY, element.fromY, element.toY);
          maxX = Math.max(maxX, element.fromX, element.toX);
          maxY = Math.max(maxY, element.fromY, element.toY);
          break;
      }
    });

    return {
      x: minX === Infinity ? 0 : minX,
      y: minY === Infinity ? 0 : minY,
      width: maxX === -Infinity ? 0 : maxX - minX,
      height: maxY === -Infinity ? 0 : maxY - minY
    };
  }, []);

  // Handle tool change and clear selection when switching away from select tool
  const handleToolChange = useCallback((newTool) => {
    if (currentTool === 'select' && newTool !== 'select') {
      setSelectedTemplate(false);
    }
    setCurrentTool(newTool);
  }, [currentTool]);

  // Check if point hits a resize handle
  const checkResizeHandle = useCallback((x, y) => {
    if (!selectedTemplate || !currentTemplate) {
      return null;
    }

    const bounds = getTemplateBounds(currentTemplate);
    const scaledBounds = {
      x: bounds.x * templateScale + templateOffset.x,
      y: bounds.y * templateScale + templateOffset.y,
      width: bounds.width * templateScale,
      height: bounds.height * templateScale
    };

    const margin = 5;
    const handleSize = 6;
    const tolerance = 8; // 增加点击容差

    // 定义所有拖拽手柄的位置
    const handles = {
      nw: { x: scaledBounds.x - margin, y: scaledBounds.y - margin },
      ne: { x: scaledBounds.x + scaledBounds.width + margin, y: scaledBounds.y - margin },
      sw: { x: scaledBounds.x - margin, y: scaledBounds.y + scaledBounds.height + margin },
      se: { x: scaledBounds.x + scaledBounds.width + margin, y: scaledBounds.y + scaledBounds.height + margin },
      n: { x: scaledBounds.x + scaledBounds.width / 2, y: scaledBounds.y - margin },
      e: { x: scaledBounds.x + scaledBounds.width + margin, y: scaledBounds.y + scaledBounds.height / 2 },
      s: { x: scaledBounds.x + scaledBounds.width / 2, y: scaledBounds.y + scaledBounds.height + margin },
      w: { x: scaledBounds.x - margin, y: scaledBounds.y + scaledBounds.height / 2 }
    };

    // 检查哪个手柄被点击
    for (const [handleName, handle] of Object.entries(handles)) {
      const distanceX = Math.abs(x - handle.x);
      const distanceY = Math.abs(y - handle.y);

      if (distanceX <= tolerance && distanceY <= tolerance) {
        return handleName;
      }
    }

    return null;
  }, [selectedTemplate, currentTemplate, templateScale, templateOffset]);

  // Check if a point hits the template area
  const checkTemplateHit = useCallback((x, y) => {
    if (!currentTemplate || !templateElements || templateElements.length === 0) return false;

    // 使用整体模板边界进行检测
    const bounds = getTemplateBounds(currentTemplate);
    const scaledBounds = {
      x: bounds.x * templateScale + templateOffset.x,
      y: bounds.y * templateScale + templateOffset.y,
      width: bounds.width * templateScale,
      height: bounds.height * templateScale
    };

    // 添加一些边距，使点击更容易
    const margin = 10;
    return x >= scaledBounds.x - margin &&
           x <= scaledBounds.x + scaledBounds.width + margin &&
           y >= scaledBounds.y - margin &&
           y <= scaledBounds.y + scaledBounds.height + margin;
  }, [currentTemplate, templateElements, templateScale, templateOffset]);

  // Check if a point hits a drawing element
  const checkElementHit = useCallback((x, y) => {
    if (!elements || elements.length === 0) return null;

    // 从后往前检查（最新绘制的在最上层）
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      const tolerance = 10; // 点击容差

      switch (element.type) {
        case 'line':
        case 'arrow':
          // 检查是否点击了线条
          const dist = distanceToLine(x, y, element.fromX, element.fromY, element.toX, element.toY);
          if (dist <= tolerance) {
            return { element, index: i, hitType: 'line' };
          }

          // 检查是否点击了起点
          if (Math.sqrt((x - element.fromX) ** 2 + (y - element.fromY) ** 2) <= tolerance) {
            return { element, index: i, hitType: 'start' };
          }

          // 检查是否点击了终点
          if (Math.sqrt((x - element.toX) ** 2 + (y - element.toY) ** 2) <= tolerance) {
            return { element, index: i, hitType: 'end' };
          }
          break;

        case 'rectangle':
          // 检查是否点击了矩形边框
          if (x >= element.x - tolerance && x <= element.x + element.width + tolerance &&
              y >= element.y - tolerance && y <= element.y + element.height + tolerance &&
              (x <= element.x + tolerance || x >= element.x + element.width - tolerance ||
               y <= element.y + tolerance || y >= element.y + element.height - tolerance)) {
            return { element, index: i, hitType: 'shape' };
          }
          break;

        case 'circle':
          // 检查是否点击了圆形边框
          const centerX = element.x + element.radius;
          const centerY = element.y + element.radius;
          const distFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          if (Math.abs(distFromCenter - element.radius) <= tolerance) {
            return { element, index: i, hitType: 'shape' };
          }
          break;
      }
    }
    return null;
  }, [elements]);

  // Calculate distance from point to line segment
  const distanceToLine = useCallback((px, py, x1, y1, x2, y2) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    if (lenSq === 0) return Math.sqrt(A * A + B * B);

    let param = dot / lenSq;
    param = Math.max(0, Math.min(1, param));

    const xx = x1 + param * C;
    const yy = y1 + param * D;

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Draw a single element
  const drawElement = useCallback((ctx, element) => {
    ctx.strokeStyle = element.color || currentColor;
    ctx.lineWidth = element.lineWidth || lineWidth;

    switch (element.type) {
      case 'line':
        ctx.beginPath();
        ctx.moveTo(element.fromX, element.fromY);
        ctx.lineTo(element.toX, element.toY);
        ctx.stroke();
        break;

      case 'arrow':
        // 绘制箭头线
        ctx.beginPath();
        ctx.moveTo(element.fromX, element.fromY);
        ctx.lineTo(element.toX, element.toY);
        ctx.stroke();

        // 绘制箭头头部
        const angle = Math.atan2(element.toY - element.fromY, element.toX - element.fromX);
        const headlen = 15;
        ctx.beginPath();
        ctx.moveTo(element.toX, element.toY);
        ctx.lineTo(
          element.toX - headlen * Math.cos(angle - Math.PI / 6),
          element.toY - headlen * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(element.toX, element.toY);
        ctx.lineTo(
          element.toX - headlen * Math.cos(angle + Math.PI / 6),
          element.toY - headlen * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        break;

      case 'rectangle':
        ctx.strokeRect(element.x, element.y, element.width, element.height);
        break;

      case 'circle':
        ctx.beginPath();
        ctx.arc(element.x + element.radius, element.y + element.radius, element.radius, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 'text':
        ctx.fillStyle = element.color || currentColor;
        ctx.font = `${element.fontSize || fontSize}px ${element.fontFamily || currentFont}`;
        ctx.fillText(element.text, element.x, element.y);
        break;
    }
  }, [currentColor, lineWidth, fontSize, currentFont]);

  // Draw edit handles for selected element
  const drawElementEditHandles = useCallback((ctx, element) => {
    if (!element) return;

    ctx.save();
    ctx.fillStyle = '#00d4ff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    const handleSize = 8;

    switch (element.type) {
      case 'line':
      case 'arrow':
        // 绘制起点手柄
        ctx.beginPath();
        ctx.arc(element.fromX, element.fromY, handleSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 绘制终点手柄
        ctx.beginPath();
        ctx.arc(element.toX, element.toY, handleSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        break;

      case 'rectangle':
        // 绘制四个角的手柄
        const corners = [
          { x: element.x, y: element.y },
          { x: element.x + element.width, y: element.y },
          { x: element.x, y: element.y + element.height },
          { x: element.x + element.width, y: element.y + element.height }
        ];
        corners.forEach(corner => {
          ctx.fillRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
          ctx.strokeRect(corner.x - handleSize / 2, corner.y - handleSize / 2, handleSize, handleSize);
        });
        break;

      case 'circle':
        const centerX = element.x + element.radius;
        const centerY = element.y + element.radius;
        // 绘制四个方向的手柄
        const positions = [
          { x: centerX, y: centerY - element.radius },
          { x: centerX + element.radius, y: centerY },
          { x: centerX, y: centerY + element.radius },
          { x: centerX - element.radius, y: centerY }
        ];
        positions.forEach(pos => {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, handleSize / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
        break;
    }

    ctx.restore();
  }, []);

  // Add text to canvas
  const addTextToCanvas = useCallback(() => {
    if (textInput.trim() && textPosition) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (editingElement && currentTemplate) {
        // 编辑模板文字：记录编辑并重新绘制整个模板
        const updatedElements = templateElements.map(element => {
          if (element.id === editingElement.id) {
            return { ...element, text: textInput };
          }
          return element;
        });
        setTemplateElements(updatedElements);

        // 更新文字编辑记录
        const updatedTextEdits = {
          ...templateTextEdits,
          [editingElement.id]: textInput
        };
        setTemplateTextEdits(updatedTextEdits);

        // 使用新的重绘函数绘制完整模板（包含所有之前的编辑）
        redrawTemplateWithAllEdits(currentTemplate, updatedTextEdits, templateScale, templateOffset);

        // 模板文字已更新
      } else {
        // 普通文字添加
        const x = textPosition.canvasX || textPosition.x;
        const y = textPosition.canvasY || textPosition.y;
        drawText(ctx, textInput, x, y);
      }

      // 清理状态
      setTextInput('');
      setShowTextInput(false);
      setTextPosition(null);
      setEditingElement(null);
      setEditingText('');
      saveToHistory();

      if (onDrawingChange) {
        onDrawingChange(canvas.toDataURL());
      }
    }
  }, [textInput, textPosition, drawText, saveToHistory, onDrawingChange, editingElement, templateElements, currentTemplate, templateTextEdits, redrawTemplateWithAllEdits]);

  // Save canvas as image
  const saveCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `blackboard-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  }, []);

  // Manual save current state to history
  const manualSave = useCallback(() => {
    saveToHistory();
    message.success(t('aiBlackboard.saveSuccess'), 1.5);
  }, [saveToHistory]);

  // Redraw template when selection state changes
  useEffect(() => {
    if (currentTemplate && templateElements.length > 0) {
      redrawTemplateWithAllEdits(currentTemplate, templateTextEdits, templateScale, templateOffset);
    }
  }, [selectedTemplate, currentTemplate, templateElements, templateTextEdits, templateScale, templateOffset, redrawTemplateWithAllEdits]);

  // Redraw all elements when selection state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // 重新绘制所有元素
    if (elements && elements.length > 0) {
      // 清除画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制背景
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制所有元素
      elements.forEach(element => {
        drawElement(ctx, element);
      });

      // 绘制模板（如果有）
      if (currentTemplate && templateElements.length > 0) {
        redrawTemplateWithAllEdits(currentTemplate, templateTextEdits, templateScale, templateOffset);
      }

      // 绘制选中元素的编辑手柄
      if (selectedElement && editingElement) {
        drawElementEditHandles(ctx, editingElement);
      }
    }
  }, [elements, selectedElement, editingElement, drawElement, drawElementEditHandles, currentTemplate, templateElements, templateTextEdits, templateScale, templateOffset, redrawTemplateWithAllEdits]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        manualSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [manualSave]);

  // Load image to canvas
  const loadImage = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');

          // Clear canvas first
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#1a1a1a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Draw image scaled to fit canvas
          const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
          const x = (canvas.width - img.width * scale) / 2;
          const y = (canvas.height - img.height * scale) / 2;

          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          saveToHistory();

          if (onDrawingChange) {
            onDrawingChange(canvas.toDataURL());
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
    // Reset input value to allow loading the same file again
    event.target.value = '';
  }, [saveToHistory, onDrawingChange]);


  // Start drawing or dragging
  const startDrawing = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 如果当前正在显示文字输入框，不处理其他绘图事件
    if (showTextInput) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    // 计算缩放比例并调整坐标
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // 处理选择拖拽工具
    if (currentTool === 'select') {
      // 如果有选中的模板，首先检查是否点击了模板的拖拽手柄
      if (templateElements.length > 0) {
        const handleClicked = checkResizeHandle(x, y);

        if (handleClicked) {
          drawingRef.current.isDrawing = true;
          setIsDrawing(true);
          setIsResizingTemplate(true);
          setResizeHandle(handleClicked);
          setResizeStart({ x, y });
          setSelectedElement(null); // 清除绘图元素选择
          return;
        }

        // 检查是否点击了模板区域
        const isInTemplate = checkTemplateHit(x, y);
        if (isInTemplate) {
          drawingRef.current.isDrawing = true;
          setIsDrawing(true);
          setIsDragging(true);
          setSelectedTemplate(true);
          setDragStart({ x, y });
          setDragOffset({ x: 0, y: 0 });
          setSelectedElement(null); // 清除绘图元素选择
          return;
        }
      }

      // 检查是否点击了绘图元素
      const elementHit = checkElementHit(x, y);

      if (elementHit) {
        drawingRef.current.isDrawing = true;
        setIsDrawing(true);
        setSelectedElement(elementHit);
        setEditingElement(elementHit.element);
        setDraggedPoint(elementHit.hitType);
        setDragStart({ x, y });
        setSelectedTemplate(false); // 清除模板选择
        return;
      }

      // 如果都没点中，清除所有选择
      // 点击空白区域，取消选中
      setSelectedTemplate(false);
      setSelectedElement(null);
      setEditingElement(null);
    }

    drawingRef.current = {
      isDrawing: true,
      lastX: x,
      lastY: y
    };

    setIsDrawing(true);

    if (currentTool === 'pen') {
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (currentTool === 'eraser') {
      const ctx = canvas.getContext('2d');
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, lineWidth * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    } else if (['rectangle', 'circle', 'line', 'arrow'].includes(currentTool)) {
      setShapeStart({ x, y });
    } else if (currentTool === 'text') {
      // 阻止事件冒泡，防止触发其他事件
      e.preventDefault();
      e.stopPropagation();

      // Calculate position relative to canvas container - 修复位置计算逻辑
      const canvasRect = canvas.getBoundingClientRect();
      const containerRect = canvas.parentElement.getBoundingClientRect();

      // 计算显示坐标（考虑缩放）
      const displayX = x / scaleX;
      const displayY = y / scaleY;

      // 使用相对于页面的绝对位置
      const absoluteX = canvasRect.left + displayX;
      const absoluteY = canvasRect.top + displayY;

      // 相对于容器的位置
      const relativeX = absoluteX - containerRect.left;
      const relativeY = absoluteY - containerRect.top;

      console.log('文字工具点击位置:', {
        canvasX: x,
        canvasY: y,
        absoluteX,
        absoluteY,
        relativeX,
        relativeY
      });

      setTextPosition({
        x: relativeX,
        y: relativeY,
        canvasX: x,
        canvasY: y
      });
      setShowTextInput(true);
      setIsDrawing(false); // Don't use normal drawing for text

      // 强制触发重新渲染，并确保输入框获得焦点
      setTimeout(() => {
        console.log('文字输入框状态:', { showTextInput: true, textPosition: { x: relativeX, y: relativeY } });
        // 确保输入框获得焦点
        const textInput = document.querySelector('input[placeholder*="输入文字内容"]');
        if (textInput) {
          textInput.focus();
        }
      }, 100);
    }
  }, [currentTool, showTextInput]);

  // Handle double click for template text editing
  const handleDoubleClick = useCallback((e) => {
    if (templateElements.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // 计算缩放比例并调整坐标
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // 检查是否点击了模板中的文字区域（考虑缩放和偏移）
    const clickedElement = templateElements.find(element => {
      const bounds = element.bounds;
      // 应用缩放和偏移变换
      const scaledBounds = {
        x: bounds.x * templateScale + templateOffset.x,
        y: bounds.y * templateScale + templateOffset.y,
        width: bounds.width * templateScale,
        height: bounds.height * templateScale
      };
      return x >= scaledBounds.x && x <= scaledBounds.x + scaledBounds.width &&
             y >= scaledBounds.y && y <= scaledBounds.y + scaledBounds.height;
    });

    if (clickedElement) {
      // 启动文字编辑模式
      setEditingElement(clickedElement);
      setEditingText(clickedElement.text);

      // 计算输入框位置（考虑缩放和偏移）
      const canvasRect = canvas.getBoundingClientRect();
      const containerRect = canvas.parentElement.getBoundingClientRect();
      const scaledX = clickedElement.x * templateScale + templateOffset.x;
      const scaledY = clickedElement.y * templateScale + templateOffset.y;

      // 计算显示坐标（考虑Canvas缩放）
      const displayScaleX = canvasRect.width / canvas.width;
      const displayScaleY = canvasRect.height / canvas.height;
      const displayX = scaledX * displayScaleX;
      const displayY = scaledY * displayScaleY;

      const absoluteX = canvasRect.left + displayX;
      const absoluteY = canvasRect.top + displayY;
      const relativeX = absoluteX - containerRect.left;
      const relativeY = absoluteY - containerRect.top;

      setTextPosition({
        x: relativeX - 50, // 居中偏移
        y: relativeY - 15, // 稍微往上
        canvasX: displayX,
        canvasY: displayY
      });
      setTextInput(clickedElement.text);
      setShowTextInput(true);
    }
  }, [templateElements, templateScale, templateOffset]);

  // Drawing process
  const draw = useCallback((e) => {
    if (!drawingRef.current.isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    // 计算缩放比例并调整坐标
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // 缩放模式处理
    if (currentTool === 'select' && isResizingTemplate && resizeStart && resizeHandle) {
      const deltaX = x - resizeStart.x;
      const deltaY = y - resizeStart.y;

      const bounds = getTemplateBounds(currentTemplate);
      const originalWidth = bounds.width;
      const originalHeight = bounds.height;

      let newScale = templateScale;
      const newOffset = { ...templateOffset };

      // 根据不同的手柄调整缩放和偏移
      switch (resizeHandle) {
        case 'se': // 右下角 - 保持左上角固定
          const scaleX = Math.max(0.1, (originalWidth * templateScale + deltaX) / originalWidth);
          const scaleY = Math.max(0.1, (originalHeight * templateScale + deltaY) / originalHeight);
          newScale = Math.min(scaleX, scaleY); // 等比缩放
          break;
        case 'nw': // 左上角 - 保持右下角固定
          const scaleX2 = Math.max(0.1, (originalWidth * templateScale - deltaX) / originalWidth);
          const scaleY2 = Math.max(0.1, (originalHeight * templateScale - deltaY) / originalHeight);
          newScale = Math.min(scaleX2, scaleY2);
          // 调整偏移以保持右下角固定
          newOffset.x = templateOffset.x + (originalWidth * templateScale - originalWidth * newScale);
          newOffset.y = templateOffset.y + (originalHeight * templateScale - originalHeight * newScale);
          break;
        case 'ne': // 右上角
          const scaleX3 = Math.max(0.1, (originalWidth * templateScale + deltaX) / originalWidth);
          const scaleY3 = Math.max(0.1, (originalHeight * templateScale - deltaY) / originalHeight);
          newScale = Math.min(scaleX3, scaleY3);
          newOffset.y = templateOffset.y + (originalHeight * templateScale - originalHeight * newScale);
          break;
        case 'sw': // 左下角
          const scaleX4 = Math.max(0.1, (originalWidth * templateScale - deltaX) / originalWidth);
          const scaleY4 = Math.max(0.1, (originalHeight * templateScale + deltaY) / originalHeight);
          newScale = Math.min(scaleX4, scaleY4);
          newOffset.x = templateOffset.x + (originalWidth * templateScale - originalWidth * newScale);
          break;
        case 'e': // 右边中点 - 只调整宽度
          newScale = Math.max(0.1, (originalWidth * templateScale + deltaX) / originalWidth);
          break;
        case 'w': // 左边中点 - 只调整宽度
          newScale = Math.max(0.1, (originalWidth * templateScale - deltaX) / originalWidth);
          newOffset.x = templateOffset.x + (originalWidth * templateScale - originalWidth * newScale);
          break;
        case 's': // 下边中点 - 只调整高度
          newScale = Math.max(0.1, (originalHeight * templateScale + deltaY) / originalHeight);
          break;
        case 'n': // 上边中点 - 只调整高度
          newScale = Math.max(0.1, (originalHeight * templateScale - deltaY) / originalHeight);
          newOffset.y = templateOffset.y + (originalHeight * templateScale - originalHeight * newScale);
          break;
      }

      // 限制缩放范围
      newScale = Math.max(0.1, Math.min(3, newScale));

      // 实时更新缩放和偏移状态
      setTemplateScale(newScale);
      setTemplateOffset(newOffset);

      // 重绘模板
      if (currentTemplate && templateElements.length > 0) {
        redrawTemplateWithAllEdits(currentTemplate, templateTextEdits, newScale, newOffset);
      }
      return;
    }

    // 拖拽模式处理
    if (currentTool === 'select' && isDragging && dragStart) {
      const deltaX = x - dragStart.x;
      const deltaY = y - dragStart.y;

      // 更新拖拽偏移量
      setDragOffset({ x: deltaX, y: deltaY });

      // 重绘整个模板（包含所有编辑和新的偏移位置）
      if (currentTemplate && templateElements.length > 0) {
        const newOffset = {
          x: templateOffset.x + deltaX,
          y: templateOffset.y + deltaY
        };
        redrawTemplateWithAllEdits(currentTemplate, templateTextEdits, templateScale, newOffset);
      }
      return;
    }

    // 绘图元素编辑模式处理
    if (currentTool === 'select' && selectedElement && editingElement && dragStart) {
      const deltaX = x - dragStart.x;
      const deltaY = y - dragStart.y;

      // 创建元素的副本进行修改
      const newElements = [...elements];
      const elementIndex = selectedElement.index;
      const element = { ...newElements[elementIndex] };

      switch (draggedPoint) {
        case 'start':
          // 拖拽起点
          if (element.type === 'line' || element.type === 'arrow') {
            element.fromX = element.fromX + deltaX;
            element.fromY = element.fromY + deltaY;
          }
          break;
        case 'end':
          // 拖拽终点
          if (element.type === 'line' || element.type === 'arrow') {
            element.toX = element.toX + deltaX;
            element.toY = element.toY + deltaY;
          }
          break;
        case 'line':
          // 拖拽整条线
          if (element.type === 'line' || element.type === 'arrow') {
            element.fromX = element.fromX + deltaX;
            element.fromY = element.fromY + deltaY;
            element.toX = element.toX + deltaX;
            element.toY = element.toY + deltaY;
          }
          break;
        case 'shape':
          // 拖拽整个形状
          element.x = element.x + deltaX;
          element.y = element.y + deltaY;
          break;
      }

      newElements[elementIndex] = element;
      setElements(newElements);

      // 重新绘制所有内容
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制背景
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制所有元素
      newElements.forEach(el => {
        drawElement(ctx, el);
      });

      // 绘制模板（如果有）
      if (currentTemplate && templateElements.length > 0) {
        redrawTemplateWithAllEdits(currentTemplate, templateTextEdits, templateScale, templateOffset);
      }

      // 绘制选中的元素的编辑手柄
      drawElementEditHandles(ctx, element);

      return;
    }

    ctx.strokeStyle = currentColor;
    ctx.lineWidth = lineWidth;

    if (currentTool === 'pen') {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (currentTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, lineWidth * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    } else if (['rectangle', 'circle', 'line', 'arrow'].includes(currentTool)) {
      // For shape tools, we'll draw the preview in stopDrawing
      // Here we just track the current position
      drawingRef.current.currentX = x;
      drawingRef.current.currentY = y;
    }

    drawingRef.current.lastX = x;
    drawingRef.current.lastY = y;
  }, [currentColor, lineWidth, currentTool, isDragging, dragStart, dragOffset, templateElements, templateTextEdits, templateScale, templateOffset, redrawTemplateWithAllEdits]);

  // End drawing
  const stopDrawing = useCallback(() => {
    if (drawingRef.current.isDrawing) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // 缩放完成处理
      if (currentTool === 'select' && isResizingTemplate) {
        // 缩放已经在draw函数中实时更新了，这里只需要保存最终状态
        setIsResizingTemplate(false);
        setResizeHandle(null);
        setResizeStart(null);

        // 保存状态并通知父组件
        saveToHistory();
        if (onDrawingChange) {
          onDrawingChange(canvas.toDataURL());
        }

        drawingRef.current.isDrawing = false;
        setIsDrawing(false);
        return;
      }

      // 拖拽完成处理
      if (currentTool === 'select' && isDragging) {
        // 将拖拽偏移量应用到模板的永久偏移位置
        setTemplateOffset(prev => ({
          x: prev.x + dragOffset.x,
          y: prev.y + dragOffset.y
        }));

        // 重置拖拽状态
        setIsDragging(false);
        setDragStart(null);
        setDragOffset({ x: 0, y: 0 });

        // 保存状态并通知父组件
        saveToHistory();
        if (onDrawingChange) {
          onDrawingChange(canvas.toDataURL());
        }

        drawingRef.current.isDrawing = false;
        setIsDrawing(false);
        return;
      }

      // 绘图元素编辑完成处理
      if (currentTool === 'select' && selectedElement && editingElement) {
        // 重置编辑状态
        setDraggedPoint(null);
        setDragStart(null);

        // 保存状态并通知父组件
        saveToHistory();
        if (onDrawingChange) {
          onDrawingChange(canvas.toDataURL());
        }

        drawingRef.current.isDrawing = false;
        setIsDrawing(false);
        return;
      }

      // Draw shapes when mouse is released
      if (['rectangle', 'circle', 'line', 'arrow'].includes(currentTool)) {
        const { currentX, currentY } = drawingRef.current;

        // Draw the shape on canvas
        drawShape(ctx, currentTool, shapeStart.x, shapeStart.y, currentX, currentY);

        // Create element object and add to elements array
        const newElement = {
          type: currentTool,
          color: currentColor,
          lineWidth: lineWidth,
          id: Date.now() + Math.random() // Simple unique ID
        };

        // Add specific properties based on shape type
        switch (currentTool) {
          case 'line':
          case 'arrow':
            newElement.fromX = shapeStart.x;
            newElement.fromY = shapeStart.y;
            newElement.toX = currentX;
            newElement.toY = currentY;
            break;
          case 'rectangle':
            newElement.x = shapeStart.x;
            newElement.y = shapeStart.y;
            newElement.width = currentX - shapeStart.x;
            newElement.height = currentY - shapeStart.y;
            break;
          case 'circle':
            const radius = Math.sqrt((currentX - shapeStart.x) ** 2 + (currentY - shapeStart.y) ** 2) / 2;
            newElement.x = shapeStart.x;
            newElement.y = shapeStart.y;
            newElement.radius = radius;
            break;
        }

        // Add element to the array
        setElements(prev => [...prev, newElement]);
      }

      drawingRef.current.isDrawing = false;
      setIsDrawing(false);
      saveToHistory();

      // Notify parent component of drawing content changes
      if (onDrawingChange) {
        onDrawingChange(canvas.toDataURL());
      }
    }
  }, [saveToHistory, onDrawingChange, currentTool, shapeStart, isDragging, dragOffset]);

  // Clear canvas - pure blackboard style
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Clear elements array
      setElements([]);
      const ctx = canvas.getContext('2d');

      // First completely clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create pure blackboard color background - opaque dark gray-black
      ctx.fillStyle = '#1a1a1a'; // Pure blackboard color
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle texture effects to simulate real blackboard
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.02})`;
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 1, 0, Math.PI * 2);
        ctx.fill();
      }

      saveToHistory();
    }
  }, [saveToHistory]);

  // Undo
  const undo = useCallback(() => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = drawingHistory[historyStep - 1];
      setHistoryStep(historyStep - 1);
    }
  }, [historyStep, drawingHistory]);

  // Redo
  const redo = useCallback(() => {
    if (historyStep < drawingHistory.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = drawingHistory[historyStep + 1];
      setHistoryStep(historyStep + 1);
    }
  }, [historyStep, drawingHistory]);

  // Voice playback functionality
  // 语音播放功能 - 使用真实AI语音
  const speakText = useCallback(async (text) => {
    if (!text || text.trim().length === 0) return;

    // 如果已经在播放，先停止
    if (isPlaying) {
      console.log('🛑 停止当前正在播放的语音');
      stopSpeech();
      // 等待一小段时间确保停止完成
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    try {
      console.log('🎵 开始真实AI语音合成:', text.substring(0, 50) + '...');
      setIsPlaying(true);

      // 停止任何现有的语音和音频
      speechSynthesis.cancel();

      // 停止页面上所有可能的音频播放
      const allAudios = document.querySelectorAll('audio');
      allAudios.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });

      // 预处理文字，使AI语音更自然
      const processedText = text
        .replace(/\.\.\./g, '，，，')  // 将...替换为语音停顿
        .replace(/([，。！？])/g, '$1 ')  // 在标点后添加空格
        .replace(/([0-9]+)/g, ' $1 ')   // 数字前后添加空格，让发音更清晰
        .replace(/O\(n\)/g, 'O 括号 n 括号')  // 算法复杂度发音优化
        .replace(/\s+/g, ' ')           // 合并多余空格
        .trim();

      console.log('🎙️ 语音文本预处理:', processedText);

      // 使用真实AI TTS API - 选择男性声音 (onyx 是深沉的男声)
      const audioBase64 = await textToSpeech(processedText, 'onyx', 'tts-1', 'zh-CN');

      // 再次检查是否仍然应该播放（用户可能已经停止了）
      if (!isPlaying) {
        console.log('🛑 用户已停止播放，跳过音频播放');
        return;
      }

      // 播放AI生成的音频
      await playAudioFromBase64(audioBase64);

      console.log('✅ AI语音播放完成');
      setIsPlaying(false);
    } catch (error) {
      console.error('❌ AI语音播放错误:', error);
      setIsPlaying(false);

      // 降级到浏览器TTS作为备选方案
      console.log('⚠️ 降级到浏览器语音');
      fallbackToWebSpeech(text);
    }
  }, [isPlaying]);

  // 备选的浏览器语音播放
  const fallbackToWebSpeech = useCallback((text) => {
    if (!('speechSynthesis' in window)) {
      console.warn('浏览器不支持语音合成');
      return;
    }

    // 停止当前播放的语音
    speechSynthesis.cancel();

    const processedText = text
      .replace(/\.\.\./g, '，，，')
      .replace(/([，。！？])/g, '$1 ')
      .replace(/([0-9]+)/g, ' $1 ')
      .replace(/O\(n\)/g, 'O 括号 n 括号')
      .trim();

    const utterance = new SpeechSynthesisUtterance(processedText);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setCurrentSpeech(utterance);
    speechSynthesis.speak(utterance);
  }, []);

  // Stop voice - 停止所有类型的语音播放
  const stopSpeech = useCallback(() => {
    console.log('🛑 强制停止所有语音播放');

    // 停止浏览器TTS
    speechSynthesis.cancel();

    // 停止页面上所有可能的音频元素
    const allAudios = document.querySelectorAll('audio');
    allAudios.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
      // 移除音频元素避免内存泄漏
      if (audio.src && audio.src.startsWith('blob:')) {
        URL.revokeObjectURL(audio.src);
      }
    });

    // 重置状态
    setIsPlaying(false);
    setCurrentSpeech(null);

    console.log('✅ 所有语音播放已停止');
  }, []);

  // Blackboard rendering actions - supports AI-generated structured instructions
  const performBoardAction = useCallback((actionData) => {
    console.log('🎨 AI黑板执行板书指令:', actionData);

    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('❌ 黑板画布不存在');
      return;
    }

    const ctx = canvas.getContext('2d');

    // 清空画布，准备显示新内容
    clearCanvas();
    console.log('🧹 画布已清空');

    // Process single action or action array
    const actions = Array.isArray(actionData) ? actionData : [actionData];
    console.log(`🚀 开始渲染 ${actions.length} 个板书元素`);

    // 立即渲染所有元素，不使用延迟，确保实时响应
    actions.forEach((action, index) => {
      console.log(`✨ 渲染第 ${index + 1} 个元素:`, action);
      try {
        drawSingleAction(ctx, action);
        console.log(`✅ 第 ${index + 1} 个元素渲染成功`);
      } catch (error) {
        console.error(`❌ 第 ${index + 1} 个元素渲染失败:`, error);
      }
    });

    // 只在最后保存一次历史记录
    saveToHistory();
    console.log('💾 板书渲染完成，已保存历史记录');
  }, [saveToHistory]);

  // 智能文字换行处理函数
  const wrapText = useCallback((ctx, text, maxWidth) => {
    if (maxWidth <= 0) return [text]; // 防止无效宽度

    const lines = [];
    let currentLine = '';

    // 对于中文和英文混合文本，按字符逐个检查
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine !== '') {
        // 如果当前行不为空且添加字符后超宽，则换行
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    console.log('📝 文字换行结果:', {
      原文: text,
      最大宽度: maxWidth,
      行数: lines.length,
      行内容: lines
    });

    return lines;
  }, []);

  // Draw single action - enhanced version with text wrapping and boundary detection
  const drawSingleAction = useCallback((ctx, action) => {
    if (typeof action === 'string') {
      // Compatible with old string action format
      drawLegacyAction(ctx, action);
      return;
    }

    console.log('🎨 绘制板书元素:', action);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const { type, content, position = { x: 50, y: 60 }, style = {} } = action;
    const { color = '#ffffff', size = 'medium', animation = false } = style;

    // Set font size - optimize clarity
    const fontSize = {
      'small': '16px',
      'medium': '20px',
      'large': '28px',
      'xlarge': '36px'
    }[size] || '20px';

    // 获取Canvas边界
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const padding = 20; // 边距
    const maxWidth = canvasWidth - position.x - padding;

    console.log('📏 字体大小:', fontSize, '颜色:', color, 'Canvas尺寸:', canvasWidth, 'x', canvasHeight);

    ctx.fillStyle = color;

    switch (type) {
      case 'title':
        ctx.font = `bold ${fontSize} 'SF Pro Display', system-ui, sans-serif`;
        ctx.fillStyle = '#00d4ff';

        // 标题换行处理
        const titleLines = wrapText(ctx, content, maxWidth);
        const titleLineHeight = parseInt(fontSize) * 1.2;
        titleLines.forEach((line, index) => {
          const yPos = position.y + (index * titleLineHeight);
          if (yPos < canvasHeight - padding) { // 边界检查
            ctx.fillText(line, position.x, yPos);
          }
        });
        break;

      case 'concept':
        ctx.font = `${fontSize} 'SF Pro Display', system-ui, sans-serif`;
        ctx.fillStyle = '#ffffff';

        // 概念文字换行处理
        const conceptLines = wrapText(ctx, content, maxWidth);
        const conceptLineHeight = parseInt(fontSize) * 1.2;
        conceptLines.forEach((line, index) => {
          const yPos = position.y + (index * conceptLineHeight);
          if (yPos < canvasHeight - padding) { // 边界检查
            ctx.fillText(line, position.x, yPos);
          }
        });
        break;

      case 'diagram':
        drawDiagram(ctx, content, position, style);
        break;

      case 'code':
        ctx.font = `${fontSize} 'SF Mono', 'Monaco', monospace`;

        // Canvas boundary calculation for code block
        const codeCanvasWidth = canvas.width;
        const codeMaxWidth = codeCanvasWidth - position.x - 40; // 40px right margin
        const codeLineHeight = 24;
        const codePadding = 16;

        // Code block processing with text wrapping
        const originalLines = content.split('\n');
        const wrappedLines = [];

        originalLines.forEach(line => {
          const lineWrapped = wrapText(ctx, line.trim(), Math.max(200, codeMaxWidth - codePadding * 2));
          wrappedLines.push(...lineWrapped);
        });

        // Calculate code block dimensions
        const maxLineWidth = Math.max(...wrappedLines.map(line => ctx.measureText(line).width));
        const boxWidth = Math.min(Math.max(300, maxLineWidth + codePadding * 2), codeMaxWidth);
        const boxHeight = wrappedLines.length * codeLineHeight + codePadding * 2;

        // Draw white border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(position.x, position.y - codePadding, boxWidth, boxHeight);

        // Draw code content - white text
        ctx.fillStyle = '#ffffff';
        wrappedLines.forEach((line, index) => {
          const lineY = position.y + codePadding/2 + (index * codeLineHeight);
          ctx.fillText(line, position.x + codePadding, lineY);
        });
        break;

      case 'flow':
        drawFlowChart(ctx, content, position, style);
        break;

      case 'comparison':
        drawComparison(ctx, content, position, style);
        break;

      case 'highlight':
        // 高亮背景 with text wrapping
        const highlightPadding = 8;
        ctx.font = `bold ${fontSize} 'SF Pro Display', system-ui, sans-serif`;

        // Canvas boundary calculation
        const highlightCanvasWidth = canvas.width;
        const highlightMaxWidth = highlightCanvasWidth - position.x - 40; // 40px right margin
        const highlightLines = wrapText(ctx, content, Math.max(200, highlightMaxWidth - highlightPadding * 2));
        const highlightLineHeight = parseInt(fontSize) + 4;

        // Calculate highlight block dimensions
        const maxHighlightWidth = Math.max(...highlightLines.map(line => ctx.measureText(line).width));
        const highlightWidth = Math.min(maxHighlightWidth + highlightPadding * 2, highlightMaxWidth);
        const highlightHeight = highlightLines.length * highlightLineHeight + highlightPadding;

        // 绘制黄色高亮背景
        ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
        ctx.fillRect(
          position.x - highlightPadding,
          position.y - parseInt(fontSize) - highlightPadding/2,
          highlightWidth,
          highlightHeight
        );

        // 高亮文字
        ctx.fillStyle = '#f59e0b';
        highlightLines.forEach((line, index) => {
          const lineY = position.y + (index * highlightLineHeight);
          ctx.fillText(line, position.x, lineY);
        });
        break;

      case 'tip':
        // 提示框样式 with text wrapping
        const tipPadding = 12;
        ctx.font = `${fontSize} 'SF Pro Display', system-ui, sans-serif`;

        // Canvas boundary calculation
        const tipCanvasWidth = canvas.width;
        const tipMaxWidth = tipCanvasWidth - position.x - 40; // 40px right margin
        const tipLines = wrapText(ctx, content, Math.max(200, tipMaxWidth - tipPadding * 2));
        const tipLineHeight = parseInt(fontSize) + 4;

        // Calculate tip box dimensions
        const maxTipWidth = Math.max(...tipLines.map(line => ctx.measureText(line).width));
        const tipWidth = Math.min(maxTipWidth + tipPadding * 2, tipMaxWidth);
        const tipHeight = tipLines.length * tipLineHeight + tipPadding;

        // 绘制提示框背景
        ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.fillRect(
          position.x - tipPadding,
          position.y - parseInt(fontSize) - tipPadding/2,
          tipWidth,
          tipHeight
        );

        // 绘制提示框边框
        ctx.strokeStyle = '#D4926F';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          position.x - tipPadding,
          position.y - parseInt(fontSize) - tipPadding/2,
          tipWidth,
          tipHeight
        );

        // 提示文字
        ctx.fillStyle = '#D4926F';
        tipLines.forEach((line, index) => {
          const lineY = position.y + (index * tipLineHeight);
          ctx.fillText(line, position.x, lineY);
        });
        break;

      case 'algorithm_visualization':
        renderAlgorithmStep(ctx, content.step, content.data, position, style);
        break;

      default:
        // 增强默认渲染和调试信息 with text wrapping
        console.log(`AI黑板渲染 - 未知类型: ${type}, 内容: ${content}, 位置:`, position, '样式:', style);
        ctx.font = `${fontSize} 'SF Pro Display', system-ui, sans-serif`;
        ctx.fillStyle = color || style?.color || '#ffffff';

        // Apply text wrapping for default case
        const defaultCanvasWidth = canvas.width;
        const defaultMaxWidth = defaultCanvasWidth - position.x - 40; // 40px right margin
        const defaultLines = wrapText(ctx, content, Math.max(200, defaultMaxWidth));
        const defaultLineHeight = parseInt(fontSize) + 4;

        defaultLines.forEach((line, index) => {
          const lineY = position.y + (index * defaultLineHeight);
          ctx.fillText(line, position.x, lineY);
        });
    }
  }, [wrapText]);

  // 算法可视化主函数
  // 算法可视化已移至独立引擎：algorithmVisualizationEngine.js

  // 算法可视化函数已移至独立引擎：algorithmVisualizationEngine.js

  // Draw diagrams - enhanced version
  const drawDiagram = useCallback((ctx, content, position, style) => {
    const { color = '#ffffff' } = style;

    if (content.includes('Component') || content.includes('React')) {
      // Draw React component tree - beautified version
      const startX = position.x;
      const startY = position.y;

      // Set gradient colors
      const gradient = ctx.createLinearGradient(startX, startY, startX + 400, startY + 200);
      gradient.addColorStop(0, '#61dafb');
      gradient.addColorStop(1, '#21232a');

      // Draw background box
      ctx.fillStyle = 'rgba(97, 218, 251, 0.1)';
      ctx.fillRect(startX - 20, startY - 30, 450, 140);

      // Root component - App
      ctx.fillStyle = '#61dafb';
      ctx.fillRect(startX + 180, startY - 15, 120, 35);
      ctx.fillStyle = '#21232a';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('🚀 App', startX + 210, startY + 5);

      // Child component styles
      const components = [
        { name: '📋 Header', x: startX + 50, color: '#4fc3f7' },
        { name: '📝 Content', x: startX + 180, color: '#66bb6a' },
        { name: '📞 Footer', x: startX + 310, color: '#ff7043' }
      ];

      components.forEach((comp, index) => {
        // Component box
        ctx.fillStyle = comp.color;
        ctx.fillRect(comp.x, startY + 50, 100, 30);

        // Component text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(comp.name, comp.x + 10, startY + 70);

        // Connection lines - beautified
        ctx.strokeStyle = comp.color;
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(startX + 240, startY + 20);
        ctx.lineTo(comp.x + 50, startY + 50);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Add description text
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.fillText('Component Architecture - Reusable, Independent, Composable', startX + 120, startY + 100);

    } else {
      // Generic chart - add decoration
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(position.x - 10, position.y - 20, 300, 40);

      ctx.fillStyle = color;
      ctx.font = 'bold 16px Arial';
      ctx.fillText('📊 ' + content, position.x, position.y);
    }
  }, []);

  // Draw flowchart - enhanced version
  const drawFlowChart = useCallback((ctx, content, position, style) => {
    const { color = '#f59e0b' } = style;
    const steps = content.split('→').map(s => s.trim());

    const startX = position.x;
    const startY = position.y;

    // Draw background
    ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
    ctx.fillRect(startX - 20, startY - 35, steps.length * 140 + 40, 70);

    steps.forEach((step, index) => {
      const x = startX + index * 140;
      const y = startY;

      // Create gradient effect
      const gradient = ctx.createLinearGradient(x, y - 20, x + 120, y + 20);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, '#fbbf24');

      // Draw rounded rectangle step box
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y - 20, 120, 40, 8);
      ctx.fill();

      // Add border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw step text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      const textWidth = ctx.measureText(step).width;
      ctx.fillText(step, x + (120 - textWidth) / 2, y + 5);

      // Draw beautified arrows
      if (index < steps.length - 1) {
        const arrowX = x + 120;
        const arrowY = y;

        // Arrow body
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(arrowX + 5, arrowY);
        ctx.lineTo(arrowX + 15, arrowY - 8);
        ctx.lineTo(arrowX + 15, arrowY - 3);
        ctx.lineTo(arrowX + 25, arrowY - 3);
        ctx.lineTo(arrowX + 25, arrowY + 3);
        ctx.lineTo(arrowX + 15, arrowY + 3);
        ctx.lineTo(arrowX + 15, arrowY + 8);
        ctx.closePath();
        ctx.fill();

        // Arrow glow effect
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // Add flow description
    ctx.fillStyle = '#ffffff';
    ctx.font = '11px Arial';
    ctx.fillText('🔄 Data Flow', startX, startY + 40);
  }, []);

  // Draw comparison - enhanced version
  const drawComparison = useCallback((ctx, content, position, style) => {
    const { color = '#D4926F' } = style;
    const lines = content.split('\n');

    const startX = position.x;
    const startY = position.y;

    // Draw comparison background
    ctx.fillStyle = 'rgba(6, 182, 212, 0.1)';
    ctx.fillRect(startX - 20, startY - 30, 400, lines.length * 40 + 40);

    // Draw VS separator line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(startX + 180, startY - 20);
    ctx.lineTo(startX + 180, startY + lines.length * 40);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw VS identifier
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('VS', startX + 170, startY - 5);

    lines.forEach((line, index) => {
      const y = startY + index * 40;
      const isGood = line.includes('✓') || line.includes('good') || line.includes('fast');
      const isBad = line.includes('✗') || line.includes('×') || line.includes('slow');

      // Determine position (bad on left, good on right)
      const x = isBad ? startX : startX + 200;
      const bgColor = isGood ? '#D4926F' : isBad ? '#ef4444' : color;

      // Draw comparison item background
      ctx.fillStyle = bgColor + '30';
      ctx.beginPath();
      ctx.roundRect(x - 10, y - 20, 150, 35, 8);
      ctx.fill();

      // Draw comparison item border
      ctx.strokeStyle = bgColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw comparison text
      ctx.fillStyle = bgColor;
      ctx.font = 'bold 14px Arial';
      ctx.fillText(line, x, y);

      // Add icons
      if (isGood) {
        ctx.fillStyle = '#D4926F';
        ctx.font = '20px Arial';
        ctx.fillText('✅', x + 130, y);
      } else if (isBad) {
        ctx.fillStyle = '#ef4444';
        ctx.font = '20px Arial';
        ctx.fillText('❌', x + 130, y);
      }
    });

    // Add comparison description
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText('📊 Performance Comparison Analysis', startX, startY + lines.length * 40 + 20);
  }, []);

  // Compatible with old action format
  const drawLegacyAction = useCallback((ctx, action) => {
    switch (action) {
      case 'renderTitle':
        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 24px Arial';
        ctx.fillText('Course Topic', 50, 60);
        break;
      // ... other old actions
      default:
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.fillText('Blackboard Content', 50, 60);
    }
  }, []);

  // AI teaching functionality - supports synchronized blackboard drawing
  const handleAITeach = useCallback(async (topic) => {
    console.log('🚀 开始AI教学，话题:', topic);
    setAiTeaching(true);
    setTeachingProgress(0);

    // 停止之前的语音并等待完成
    stopSpeech();
    await new Promise(resolve => setTimeout(resolve, 300));

    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      clearCanvas();
      console.log('🧹 画布已清空');
    }

    message.loading('AI teacher started explaining...', 1);

    try {
      // Call ClassroomPage's onAITeach callback, passing blackboard drawing callback
      if (onAITeach) {
        console.log('📞 使用外部onAITeach回调');
        setTeachingProgress(25);

        // Call AI teacher and pass blackboard drawing function
        await onAITeach(topic, performBoardAction);

        setTeachingProgress(100);

        setTimeout(() => {
          setAiTeaching(false);
        }, 1000);
      } else {
        console.log('🎭 使用内置教学脚本');
        // Fallback solution: use preset teaching scripts
        const script = teachingScripts[topic];
        console.log('📚 找到教学脚本:', script ? '是' : '否', topic);
        if (!script) {
          setAiTeaching(false);
          message.error('No teaching content available for this topic');
          return;
        }

        // Execute teaching script - 串行执行避免语音重叠
        console.log('🎬 开始执行教学脚本，共', script.length, '个步骤');

        const executeStepSequentially = async (stepIndex) => {
          if (stepIndex >= script.length) {
            // 所有步骤完成
            setTimeout(() => {
              setAiTeaching(false);
              console.log('✅ 教学脚本执行完成');
            }, 2000);
            return;
          }

          const step = script[stepIndex];
          console.log(`📍 执行第 ${stepIndex + 1} 步:`, step.speech);
          console.log('🎨 板书指令:', step.boardAction);

          // 更新进度
          setTeachingProgress(((stepIndex + 1) / script.length) * 100);

          // 先执行板书动作
          performBoardAction(step.boardAction);

          try {
            // 等待语音播放完成再进行下一步
            await speakText(step.speech);
            console.log(`✅ 第 ${stepIndex + 1} 步语音播放完成`);

            // 等待一段时间再执行下一步
            setTimeout(() => {
              executeStepSequentially(stepIndex + 1);
            }, 1500);
          } catch (error) {
            console.error(`❌ 第 ${stepIndex + 1} 步执行失败:`, error);
            // 即使出错也继续下一步
            setTimeout(() => {
              executeStepSequentially(stepIndex + 1);
            }, 1500);
          }
        };

        // 开始执行第一步
        executeStepSequentially(0);
      }
    } catch (error) {
      console.error('AI teaching failed:', error);
      message.error('AI teaching service is temporarily unavailable');
      setAiTeaching(false);
    }
  }, [speakText, performBoardAction, stopSpeech, onAITeach, saveToHistory, teachingScripts]);

  // 暴露方法给父组件
  React.useImperativeHandle(ref, () => ({
    handleAITeach,
    drawOnBoard: (boardActions) => {
      if (boardActions && boardActions.length > 0) {
        const canvas = canvasRef.current;
        if (canvas) {
          clearCanvas();
        }
        performBoardAction(boardActions);
      }
    }
  }), [handleAITeach, performBoardAction]);

  // Public blackboard drawing method for external calls
  const drawOnBoard = useCallback((boardActions) => {
    if (boardActions && boardActions.length > 0) {
      // Clear canvas
      const canvas = canvasRef.current;
      if (canvas) {
        clearCanvas();
      }

      // Draw new content
      performBoardAction(boardActions);
    }
  }, [performBoardAction]);

  // Color picker
  const colors = ['#D4926F', '#B5704A', '#A0783B', '#f59e0b', '#D4926F', '#ef4444', '#ffffff'];

  const toolbarItems = [
    {
      key: 'drawing',
      label: t('tools.codeEditor', { ns: 'classroom' }),
      children: (
        <div style={{ padding: '16px' }}>
          {/* Tool selection */}
          <div style={{ marginBottom: '16px' }}>
            <Text className="tech-text-secondary" style={{ fontSize: '13px', marginBottom: '8px', display: 'block' }}>
              {t('tools.codeEditor', { ns: 'classroom' })}
            </Text>
            <Space wrap>
              <Button
                type={currentTool === 'select' ? 'primary' : 'default'}
                icon={<SelectOutlined />}
                onClick={() => handleToolChange('select')}
                className={currentTool === 'select' ? 'tech-button' : ''}
              >
                选择
              </Button>
              <Button
                type={currentTool === 'pen' ? 'primary' : 'default'}
                icon={<EditOutlined />}
                onClick={() => handleToolChange('pen')}
                className={currentTool === 'pen' ? 'tech-button' : ''}
              >
                自由绘制
              </Button>
              <Button
                type={currentTool === 'text' ? 'primary' : 'default'}
                icon={<FontSizeOutlined />}
                onClick={() => {
                  handleToolChange('text');
                  console.log('文字工具已激活，请点击画布添加文字');
                }}
                className={currentTool === 'text' ? 'tech-button' : ''}
              >
                文字
              </Button>
              <Button
                type={currentTool === 'eraser' ? 'primary' : 'default'}
                onClick={() => handleToolChange('eraser')}
                className={currentTool === 'eraser' ? 'tech-button' : ''}
              >
                橡皮擦
              </Button>
            </Space>
          </div>

          {/* Shape tools */}
          <div style={{ marginBottom: '16px' }}>
            <Text className="tech-text-secondary" style={{ fontSize: '13px', marginBottom: '8px', display: 'block' }}>
              形状工具
            </Text>
            <Space wrap>
              <Button
                type={currentTool === 'rectangle' ? 'primary' : 'default'}
                icon={<BorderOutlined />}
                onClick={() => setCurrentTool('rectangle')}
                className={currentTool === 'rectangle' ? 'tech-button' : ''}
                size="small"
              >
                矩形
              </Button>
              <Button
                type={currentTool === 'circle' ? 'primary' : 'default'}
                icon={<RadiusUpleftOutlined />}
                onClick={() => setCurrentTool('circle')}
                className={currentTool === 'circle' ? 'tech-button' : ''}
                size="small"
              >
                圆形
              </Button>
              <Button
                type={currentTool === 'line' ? 'primary' : 'default'}
                onClick={() => setCurrentTool('line')}
                className={currentTool === 'line' ? 'tech-button' : ''}
                size="small"
              >
                直线
              </Button>
              <Button
                type={currentTool === 'arrow' ? 'primary' : 'default'}
                icon={<ArrowRightOutlined />}
                onClick={() => setCurrentTool('arrow')}
                className={currentTool === 'arrow' ? 'tech-button' : ''}
                size="small"
              >
                箭头
              </Button>
            </Space>
          </div>

          {/* Color selection */}
          <div style={{ marginBottom: '16px' }}>
            <Text className="tech-text-secondary" style={{ fontSize: '13px', marginBottom: '8px', display: 'block' }}>
              颜色选择
            </Text>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {colors.map(color => (
                <div
                  key={color}
                  onClick={() => setCurrentColor(color)}
                  style={{
                    width: '24px',
                    height: '24px',
                    border: currentColor === color ? '2px solid #D4926F' : '2px solid rgba(255,255,255,0.3)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    boxShadow: currentColor === color ? '0 0 12px rgba(212, 146, 111, 0.4)' : '0 2px 4px rgba(0,0,0,0.2)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    style={{
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      borderRadius: '2px'
                    }}
                  >
                    <rect
                      width="24"
                      height="24"
                      fill={color}
                      rx="2"
                    />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Brush size */}
          <div style={{ marginBottom: '16px' }}>
            <Text className="tech-text-secondary" style={{ fontSize: '13px', marginBottom: '8px', display: 'block' }}>
              {currentTool === 'eraser' ? `橡皮擦大小: ${lineWidth}px (擦除直径: ${lineWidth * 4}px)` : `画笔大小: ${lineWidth}px`}
            </Text>
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--tech-primary)'
              }}
            />
          </div>

          {/* Font settings - show only when text tool is selected */}
          {currentTool === 'text' && (
            <div style={{ marginBottom: '16px' }}>
              <Text className="tech-text-secondary" style={{ fontSize: '13px', marginBottom: '8px', display: 'block' }}>
                字体设置
              </Text>
              <div style={{ marginBottom: '8px' }}>
                <Text style={{ fontSize: '12px', marginRight: '8px', color: '#ffffff' }}>字体:</Text>
                <select
                  value={currentFont}
                  onChange={(e) => setCurrentFont(e.target.value)}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid var(--tech-border)',
                    borderRadius: '4px',
                    background: 'var(--tech-bg-secondary)',
                    color: 'var(--tech-text-primary)',
                    fontSize: '12px'
                  }}
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                </select>
              </div>
              <div>
                <Text style={{ fontSize: '12px', color: '#ffffff' }}>大小: {fontSize}px</Text>
                <input
                  type="range"
                  min="12"
                  max="48"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: 'var(--tech-primary)',
                    marginTop: '4px'
                  }}
                />
              </div>
            </div>
          )}

          {/* Templates - 算法题专用模板集合 */}
          <div style={{ marginBottom: '16px' }}>
            <Text className="tech-text-secondary" style={{ fontSize: '13px', marginBottom: '12px', display: 'block' }}>
              📚 算法题模板库
            </Text>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '8px',
              maxHeight: '200px',
              overflowY: 'auto',
              padding: '4px'
            }}>
              {templates.map(template => (
                <Button
                  key={template.id}
                  size="small"
                  onClick={() => applyTemplate(template)}
                  style={{
                    background: 'linear-gradient(135deg, rgba(26, 29, 62, 0.9), rgba(31, 35, 75, 0.9))',
                    border: '1px solid rgba(0, 255, 255, 0.3)',
                    color: '#ffffff',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    height: 'auto',
                    minHeight: '36px',
                    fontSize: '11px',
                    fontWeight: 500,
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    boxShadow: '0 2px 8px rgba(0, 255, 255, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(124, 58, 237, 0.2))';
                    e.target.style.borderColor = 'rgba(0, 255, 255, 0.6)';
                    e.target.style.boxShadow = '0 4px 16px rgba(0, 255, 255, 0.2)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, rgba(26, 29, 62, 0.9), rgba(31, 35, 75, 0.9))';
                    e.target.style.borderColor = 'rgba(0, 255, 255, 0.3)';
                    e.target.style.boxShadow = '0 2px 8px rgba(0, 255, 255, 0.1)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    width: '100%'
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 600 }}>
                      {template.name}
                    </span>
                    <span style={{
                      fontSize: '9px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginTop: '2px'
                    }}>
                      {template.type === 'data_structure' ? '数据结构' :
                       template.type === 'algorithm' ? '算法模式' :
                       template.type === 'analysis' ? '复杂度分析' :
                       template.type === 'tree' ? '树结构' : '基础模板'}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Template Controls - 模板调整 */}
          {currentTemplate && (
            <div style={{ marginBottom: '16px' }}>
              <Text className="tech-text-secondary" style={{ fontSize: '13px', marginBottom: '8px', display: 'block' }}>
                🎚️ 模板调整
              </Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <Text style={{ fontSize: '12px', color: '#ffffff', marginRight: '8px' }}>
                    大小: {Math.round(templateScale * 100)}%
                  </Text>
                  <input
                    type="range"
                    min="0.3"
                    max="2.0"
                    step="0.1"
                    value={templateScale}
                    onChange={(e) => {
                      const newScale = parseFloat(e.target.value);
                      setTemplateScale(newScale);
                      if (currentTemplate) {
                        redrawTemplateWithAllEdits(currentTemplate, templateTextEdits, newScale, templateOffset);
                      }
                    }}
                    style={{
                      width: '100%',
                      accentColor: 'var(--tech-primary)'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    size="small"
                    onClick={() => {
                      setTemplateScale(1);
                      setTemplateOffset({ x: 0, y: 0 });
                      if (currentTemplate) {
                        redrawTemplateWithAllEdits(currentTemplate, templateTextEdits, 1, { x: 0, y: 0 });
                      }
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '11px'
                    }}
                  >
                    重置大小
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setTemplateOffset({ x: 0, y: 0 });
                      if (currentTemplate) {
                        redrawTemplateWithAllEdits(currentTemplate, templateTextEdits, templateScale, { x: 0, y: 0 });
                      }
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '11px'
                    }}
                  >
                    居中位置
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <Space wrap>
            <Button
              icon={<UndoOutlined />}
              onClick={undo}
              disabled={historyStep <= 0}
              className="tech-button"
            >
              撤销
            </Button>
            <Button
              icon={<RedoOutlined />}
              onClick={redo}
              disabled={historyStep >= drawingHistory.length - 1}
              className="tech-button"
            >
              重做
            </Button>
            <Button
              icon={<SaveOutlined />}
              onClick={manualSave}
              className="tech-button"
              style={{
                background: 'linear-gradient(135deg, #D4926F 0%, #B5704A 100%)',
                border: '1px solid rgba(212, 146, 111, 0.3)',
                color: 'white'
              }}
            >
              保存 (Ctrl+S)
            </Button>
            <Button
              icon={<ClearOutlined />}
              onClick={clearCanvas}
              className="tech-button-danger"
            >
              清除
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={saveCanvas}
              className="tech-button"
            >
              导出
            </Button>
            <Button
              icon={<UploadOutlined />}
              onClick={() => document.getElementById('imageInput').click()}
              className="tech-button"
            >
              导入
            </Button>
          </Space>

          {/* Hidden file input for image import */}
          <input
            id="imageInput"
            type="file"
            accept="image/*"
            onChange={loadImage}
            style={{ display: 'none' }}
          />
        </div>
      )
    },
    {
      key: 'ai-teach',
      label: t('features.aiTeacher', { ns: 'classroom' }),
      children: (
        <div style={{ padding: '16px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Avatar icon={<RobotOutlined />} style={{ backgroundColor: 'var(--tech-primary)' }} />
              <Text className="tech-text-primary" style={{ fontWeight: 600 }}>{t('aiTeacher.aiTeacher', { ns: 'classroom' })}</Text>
            </div>
            <Text className="tech-text-secondary" style={{ fontSize: '13px' }}>
{t('aiTeacher.teacherDescription', { ns: 'classroom' })}
            </Text>
          </div>

          {/* Preset teaching topics */}
          <div style={{ marginBottom: '16px' }}>
            <Text className="tech-text-secondary" style={{ fontSize: '13px', marginBottom: '8px', display: 'block' }}>
{t('blackboard.selectTopic')}
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {teachingPresets.map((topic, index) => (
                <Button
                  key={index}
                  onClick={() => handleAITeach(topic)}
                  loading={aiTeaching}
                  className="tech-button"
                  style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                >
                  <BookOutlined style={{ marginRight: '8px' }} />
                  {topic}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom teaching request */}
          <div>
            <Text className="tech-text-secondary" style={{ fontSize: '13px', marginBottom: '8px', display: 'block' }}>
              Custom Teaching Content
            </Text>
            <TextArea
              placeholder="Enter content you want the AI teacher to explain..."
              value={teachingInput}
              onChange={(e) => setTeachingInput(e.target.value)}
              rows={3}
              className="tech-input"
              style={{ marginBottom: '8px' }}
            />
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => teachingInput && handleAITeach(teachingInput)}
              disabled={!teachingInput.trim() || aiTeaching}
              loading={aiTeaching}
              className="tech-button"
              block
            >
              Start AI Teaching
            </Button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div style={{
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: isDarkTheme ? 'transparent' : '#FAF9F6'
    }}>
      {/* AI teaching area - conditional display */}
      {!hideTeacherCard && (
        <Card
          className="tech-card tech-fade-in"
          style={{ marginBottom: '16px' }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserOutlined style={{ color: 'var(--tech-primary)', fontSize: '16px' }} />
                <Text style={{ fontWeight: 600, color: 'var(--tech-primary)', fontSize: '16px' }}>{t('aiTeacher.aiTeacher', { ns: 'classroom' })}</Text>
              </div>
              <Tag
                style={{
                  background: voiceChatStates?.isListening ?
                    'linear-gradient(135deg, #28a745 0%, #20c997 100%)' :
                    (voiceChatStates?.aiThinking ? 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)' :
                    (voiceChatStates?.ttsGenerating ? 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)' :
                    (voiceChatStates?.aiSpeaking ? 'linear-gradient(135deg, #fd7e14 0%, #dc6502 100%)' :
                    'linear-gradient(135deg, #A0783B 0%, #D4926F 100%)'))),
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: '600',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => {
                  console.log('AI Teacher tag clicked - starting voice chat');
                  // 启动语音对话功能，与下方AI Teacher按钮相同
                  if (onStartVoiceChat) {
                    onStartVoiceChat();
                  }
                }}
              >
                {voiceChatStates?.isListening ? '录音中...' :
                 (voiceChatStates?.aiThinking ? 'AI思考中...' :
                 (voiceChatStates?.ttsGenerating ? '生成语音...' :
                 (voiceChatStates?.aiSpeaking ? 'AI说话中...' : 'AI teacher')))}
              </Tag>
            </div>
          }
          bodyStyle={{ padding: '16px' }}
        >
          <div style={{ marginBottom: '16px' }}>
            <Text className="tech-text-primary" style={{ fontSize: '13px', color: 'var(--tech-text-primary)' }}>
  {t('aiTeacher.teacherDescription', { ns: 'classroom' })}
            </Text>
          </div>

          {/* 预设教学主题 */}
          <div>
            <Text className="tech-text-primary" style={{ fontSize: '13px', marginBottom: '8px', display: 'block', color: 'var(--tech-text-primary)' }}>
  {t('blackboard.selectTopic')}
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {teachingPresets.map((topic, index) => (
                <Button
                  key={index}
                  onClick={() => {
                    // 如果是算法页面并且有onTopicClick回调，使用新的交互方式
                    const isAlgorithmPage = courseContent.hints || courseContent.examples || courseContent.title?.includes('算法') || courseContent.title?.includes('题目');
                    if ((courseContent.hints || courseContent.examples || isAlgorithmPage) && onTopicClick) {
                      onTopicClick(topic);
                    } else {
                      // 否则使用原来的AI教学方式
                      handleAITeach(topic);
                    }
                  }}
                  loading={aiTeaching}
                  className="tech-button"
                  style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                >
                  <BookOutlined style={{ marginRight: '8px' }} />
                  {topic}
                </Button>
              ))}
            </div>
          </div>

          {/* AI teaching control and progress */}
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'rgba(0, 212, 255, 0.1)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <RobotOutlined style={{ color: 'var(--tech-primary)' }} />
              <Text style={{ color: 'var(--tech-primary)', fontSize: '14px', fontWeight: 600 }}>
                {aiTeaching || isPlaying ? 'AI teacher is explaining' : 'AI语音系统'}
              </Text>
              {isPlaying && (
                <Button
                  size="small"
                  icon={<PauseOutlined />}
                  onClick={stopSpeech}
                  style={{
                    background: 'rgba(239, 68, 68, 0.8)',
                    border: 'none',
                    color: '#fff'
                  }}
                >
                  停止语音
                </Button>
              )}
              {/* 语音测试按钮 - 总是显示 */}
              <Button
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => speakText('您好，我是您的AI算法导师。我将为您提供专业的算法讲解和可视化演示。让我们开始这段智能学习之旅吧！')}
                style={{
                  background: isPlaying ? 'rgba(156, 163, 175, 0.5)' : 'rgba(212, 146, 111, 0.8)',
                  border: 'none',
                  color: '#fff'
                }}
                disabled={isPlaying}
              >
                测试语音
              </Button>
            </div>
              {teachingProgress > 0 && (
                <div style={{ width: '100%' }}>
                  <Progress
                    percent={teachingProgress}
                    size="small"
                    strokeColor="var(--tech-primary)"
                    trailColor="rgba(255, 255, 255, 0.2)"
                    showInfo={false}
                  />
                  <Text style={{ color: 'var(--tech-text-secondary)', fontSize: '12px' }}>
                    Teaching Progress {Math.round(teachingProgress)}%
                  </Text>
                </div>
              )}
          </div>

        </Card>
      )}

      {/* Toolbar - conditional display */}
      {showTools && (
        <Card
          className="tech-card tech-fade-in"
          style={{ marginBottom: '16px', position: 'relative' }}
          bodyStyle={{ padding: '8px 16px' }}
        >
          <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setShowTools(false)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                color: 'var(--tech-secondary)',
                border: 'none',
                background: 'transparent',
                zIndex: 10
              }}
            />
          <Tabs
            items={[toolbarItems[0]]} // Only keep drawing tools, remove AI teaching
            className="tech-modal-tabs"
            size="small"
          />
        </Card>
      )}

      {/* AI blackboard canvas */}
      <Card
        style={{
          flex: 1,
          maxHeight: '600px',
          border: 'none',
          borderRadius: '0',
          boxShadow: 'none',
          backgroundColor: 'transparent'
        }}
        bodyStyle={{ padding: '0', height: '100%', maxHeight: '600px', position: 'relative' }}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onDoubleClick={handleDoubleClick}
          style={{
            width: '100%',
            height: '100%',
            margin: '0',
            border: 'none',
            borderRadius: '12px',
            cursor: currentTool === 'pen' ? 'crosshair' :
                   currentTool === 'eraser' ? (() => {
                     const size = Math.max(16, Math.min(40, lineWidth * 4)); // 动态大小：16-40px
                     const radius = Math.max(4, Math.min(16, lineWidth * 1.5)); // 动态半径
                     const center = size / 2;
                     return `url("data:image/svg+xml,%3csvg width='${size}' height='${size}' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='${center}' cy='${center}' r='${radius}' fill='%23ff9999' stroke='%23ffffff' stroke-width='2' opacity='0.8'/%3e%3ccircle cx='${center}' cy='${center}' r='${Math.max(2, radius * 0.4)}' fill='%23ffffff' opacity='0.6'/%3e%3c/svg%3e") ${center} ${center}, auto`;
                   })() :
                   ['rectangle', 'circle', 'line', 'arrow'].includes(currentTool) ? 'crosshair' :
                   currentTool === 'text' ? 'text' :
                   currentTool === 'select' ? 'move' : 'default',
            background: isDarkTheme ? '#1a1a1a' : '#FAF9F6',
            boxShadow: `
              inset 0 0 30px rgba(0, 212, 255, 0.15),
              0 8px 32px rgba(0, 0, 0, 0.3),
              0 0 0 1px rgba(100, 149, 237, 0.2)
            `,
            transition: 'all 0.3s ease',
            transform: 'perspective(1000px) rotateX(1deg)',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'perspective(1000px) rotateX(0deg) scale(1.01)';
            e.target.style.boxShadow = `
              inset 0 0 40px rgba(0, 212, 255, 0.25),
              0 12px 40px rgba(0, 0, 0, 0.4),
              0 0 0 2px rgba(100, 149, 237, 0.4)
            `;
          }}
          onMouseLeave={(e) => {
            if (!isDrawing) {
              e.target.style.transform = 'perspective(1000px) rotateX(1deg) scale(1)';
              e.target.style.boxShadow = `
                inset 0 0 30px rgba(0, 212, 255, 0.15),
                0 8px 32px rgba(0, 0, 0, 0.3),
                0 0 0 1px rgba(100, 149, 237, 0.2)
              `;
            }
            stopDrawing();
          }}
        />

        {/* Text input overlay - 增强显示逻辑 */}
        {showTextInput && textPosition && (
          <div
            data-text-input-container="true"
            style={{
              position: 'absolute',
              left: Math.max(10, Math.min(textPosition.x, window.innerWidth - 250)),
              top: Math.max(10, Math.min(textPosition.y, window.innerHeight - 100)),
              zIndex: 1000,
              background: 'rgba(0, 0, 0, 0.9)',
              border: '2px solid var(--tech-primary)',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 8px 32px rgba(0, 255, 255, 0.3)',
              minWidth: '200px'
            }}
            onMouseDown={(e) => {
              // 阻止鼠标按下事件冒泡到画布
              e.stopPropagation();
            }}
          >
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onPressEnter={addTextToCanvas}
              onBlur={(e) => {
                // 检查焦点是否移动到了输入框容器内的元素
                const relatedTarget = e.relatedTarget;
                const isInContainer = relatedTarget && relatedTarget.closest('[data-text-input-container]');

                // 只有当焦点完全离开容器且没有输入内容时才关闭
                if (!isInContainer && !textInput.trim()) {
                  setTimeout(() => {
                    setShowTextInput(false);
                    setTextPosition(null);
                  }, 100);
                }
              }}
              placeholder={editingElement ? t('aiBlackboard.editTextPlaceholder', { text: editingElement.text }) : t('aiBlackboard.textInputPlaceholder')}
              autoFocus
              style={{
                background: editingElement ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                border: editingElement ? '2px solid #ffd700' : '1px solid rgba(255, 255, 255, 0.3)',
                color: currentColor,
                fontSize: `${fontSize}px`,
                fontFamily: currentFont,
                borderRadius: '4px',
                padding: '8px',
                boxShadow: editingElement ? '0 0 20px rgba(255, 215, 0, 0.3)' : 'none'
              }}
            />
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
              <Button
                size="small"
                type="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  addTextToCanvas();
                }}
                disabled={!textInput.trim()}
                style={{
                  background: 'var(--tech-primary)',
                  border: 'none',
                  fontWeight: 600
                }}
              >
                确认添加
              </Button>
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTextInput(false);
                  setTextPosition(null);
                  setTextInput('');
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}
              >
                取消
              </Button>
            </div>
          </div>
        )}

        {/* 右上角 - 撤销/重做/设置 工具栏 */}
        <div style={{
          position: 'absolute',
          right: '32px',
          top: '32px',
          display: 'flex',
          flexDirection: 'row',
          gap: '8px',
          zIndex: 100
        }}>
          {/* 撤销按钮 */}
          <Button
              shape="circle"
              icon={<UndoOutlined />}
              onClick={undoDrawing}
              disabled={historyStep <= 0}
              style={{
                width: '32px',
                height: '32px',
                background: 'rgba(30, 30, 30, 0.8)',
                border: '1px solid rgba(60, 60, 60, 0.5)',
                color: historyStep <= 0 ? '#555' : '#ccc',
                backdropFilter: 'blur(10px)',
                boxShadow: 'none',
                transition: 'all 0.3s ease'
              }}
            />

          {/* 重做按钮 */}
          <Button
              shape="circle"
              icon={<RedoOutlined />}
              onClick={redoDrawing}
              disabled={historyStep >= drawingHistory.length - 1}
              style={{
                width: '32px',
                height: '32px',
                background: 'rgba(30, 30, 30, 0.8)',
                border: '1px solid rgba(60, 60, 60, 0.5)',
                color: historyStep >= drawingHistory.length - 1 ? '#555' : '#ccc',
                backdropFilter: 'blur(10px)',
                boxShadow: 'none',
                transition: 'all 0.3s ease'
              }}
            />

          {/* 设置按钮 */}
          <Button
              shape="circle"
              icon={<SettingOutlined />}
              onClick={() => setShowSettings(!showSettings)}
              style={{
                width: '32px',
                height: '32px',
                background: 'rgba(30, 30, 30, 0.8)',
                border: '1px solid rgba(60, 60, 60, 0.5)',
                color: isDarkTheme ? '#58A6FF' : '#A0783B',
                backdropFilter: 'blur(10px)',
                boxShadow: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(50, 50, 50, 0.9)';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(30, 30, 30, 0.8)';
                e.target.style.transform = 'scale(1)';
              }}
            />
        </div>

        {/* 右下角 - 可折叠功能工具栏 */}
        <div style={{
          position: 'absolute',
          right: '32px',
          bottom: '32px',
          display: 'flex',
          flexDirection: 'row',
          gap: '8px',
          zIndex: 100
        }}>
          {/* 主切换按钮 */}
          <Button
            shape="circle"
            icon={isToolbarExpanded ? <CloseOutlined /> : <SettingOutlined />}
            onClick={() => setIsToolbarExpanded(!isToolbarExpanded)}
            style={{
              width: '40px',
              height: '40px',
              background: isDarkTheme ? 'rgba(88, 166, 255, 0.15)' : 'rgba(212, 146, 111, 0.15)',
              border: isDarkTheme ? '1px solid rgba(88, 166, 255, 0.4)' : '1px solid rgba(212, 146, 111, 0.4)',
              color: isDarkTheme ? '#58A6FF' : '#D4926F',
              backdropFilter: 'blur(10px)',
              boxShadow: isDarkTheme ? '0 4px 12px rgba(88, 166, 255, 0.2)' : '0 4px 12px rgba(212, 146, 111, 0.2)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = isDarkTheme ? 'rgba(88, 166, 255, 0.25)' : 'rgba(212, 146, 111, 0.25)';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = isDarkTheme ? 'rgba(88, 166, 255, 0.15)' : 'rgba(212, 146, 111, 0.15)';
              e.target.style.transform = 'scale(1)';
            }}
          />

          {/* 工具按钮组 - 仅在展开时显示 */}
          {isToolbarExpanded && (
            <>
              {/* 模板快捷按钮 */}
              <Button
                shape="circle"
                icon={<AppstoreOutlined />}
                onClick={() => setShowTemplateModal(true)}
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'rgba(212, 146, 111, 0.1)',
                  border: '1px solid rgba(212, 146, 111, 0.3)',
                  color: '#D4926F',
                  backdropFilter: 'blur(10px)',
                  boxShadow: 'none',
                  transition: 'all 0.3s ease',
                  animation: 'slideInRight 0.3s ease-out'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(212, 146, 111, 0.2)';
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(139, 92, 246, 0.1)';
                  e.target.style.transform = 'scale(1)';
                }}
              />

              {/* 绘图工具按钮 */}
              <Button
                  shape="circle"
                  icon={<EditOutlined />}
                  onClick={() => setShowDrawingTools(!showDrawingTools)}
                  style={{
                    width: '36px',
                    height: '36px',
                    background: 'rgba(212, 146, 111, 0.1)',
                    border: '1px solid rgba(212, 146, 111, 0.3)',
                    color: '#D4926F',
                    backdropFilter: 'blur(10px)',
                    boxShadow: 'none',
                    transition: 'all 0.3s ease',
                    animation: 'slideInRight 0.4s ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(212, 146, 111, 0.2)';
                    e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(212, 146, 111, 0.1)';
                    e.target.style.transform = 'scale(1)';
                  }}
                />

              {/* 形状工具快捷按钮 */}
              <Button
                  shape="circle"
                  icon={<BorderOutlined />}
                  onClick={() => setShowQuickTools(!showQuickTools)}
                  style={{
                    width: '36px',
                    height: '36px',
                    background: 'rgba(212, 146, 111, 0.1)',
                    border: '1px solid rgba(212, 146, 111, 0.3)',
                    color: '#D4926F',
                    backdropFilter: 'blur(10px)',
                    boxShadow: 'none',
                    transition: 'all 0.3s ease',
                    animation: 'slideInRight 0.5s ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(59, 130, 246, 0.2)';
                    e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(59, 130, 246, 0.1)';
                    e.target.style.transform = 'scale(1)';
                  }}
                />

              {/* 颜色选择按钮 */}
              <Button
                  shape="circle"
                  icon={<BgColorsOutlined />}
                  onClick={() => setShowColorPalette(!showColorPalette)}
                  style={{
                    width: '36px',
                    height: '36px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: '#f59e0b',
                    backdropFilter: 'blur(10px)',
                    boxShadow: 'none',
                    transition: 'all 0.3s ease',
                    animation: 'slideInRight 0.6s ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(245, 158, 11, 0.2)';
                    e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(245, 158, 11, 0.1)';
                    e.target.style.transform = 'scale(1)';
                  }}
                />

              {/* 清除画布按钮 */}
              <Button
                  shape="circle"
                  icon={<ClearOutlined />}
                  onClick={() => {
                    const canvas = canvasRef.current;
                    if (canvas) {
                      const ctx = canvas.getContext('2d');
                      ctx.clearRect(0, 0, canvas.width, canvas.height);
                      ctx.fillStyle = '#1a1a1a';
                      ctx.fillRect(0, 0, canvas.width, canvas.height);
                      setElements([]);
                      saveToHistory();
                    }
                  }}
                  style={{
                    width: '36px',
                    height: '36px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    backdropFilter: 'blur(10px)',
                    boxShadow: 'none',
                    transition: 'all 0.3s ease',
                    animation: 'slideInRight 0.7s ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                    e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.target.style.transform = 'scale(1)';
                  }}
                />
            </>
          )}
        </div>

          {/* 绘图工具展开面板 */}
          {showDrawingTools && (
            <div
              data-panel="drawing-tools"
              style={{
                position: 'absolute',
                right: '84px',
                bottom: '80px',
                background: 'rgba(22, 27, 34, 0.95)',
              border: '1px solid rgba(212, 146, 111, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              minWidth: '150px'
            }}>
              <Text style={{ color: '#D4926F', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
                绘图工具
              </Text>
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={() => { setCurrentTool('pen'); setShowDrawingTools(false); }}
                style={{
                  justifyContent: 'flex-start',
                  background: currentTool === 'pen' ? 'rgba(212, 146, 111, 0.2)' : 'transparent',
                  border: 'none',
                  color: '#f8fafc'
                }}
              >
                画笔
              </Button>
              <Button
                size="small"
                icon={<ClearOutlined />}
                onClick={() => { setCurrentTool('eraser'); setShowDrawingTools(false); }}
                style={{
                  justifyContent: 'flex-start',
                  background: currentTool === 'eraser' ? 'rgba(212, 146, 111, 0.2)' : 'transparent',
                  border: 'none',
                  color: '#f8fafc'
                }}
              >
                橡皮擦
              </Button>
              <Button
                size="small"
                icon={<SelectOutlined />}
                onClick={() => { setCurrentTool('select'); setShowDrawingTools(false); }}
                style={{
                  justifyContent: 'flex-start',
                  background: currentTool === 'select' ? 'rgba(212, 146, 111, 0.2)' : 'transparent',
                  border: 'none',
                  color: '#f8fafc'
                }}
              >
                选择
              </Button>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />
              <Text style={{ color: '#64748b', fontSize: '11px' }}>
                画笔粗细: {lineWidth}px
              </Text>
              <input
                type="range"
                min="1"
                max="20"
                value={lineWidth}
                onChange={(e) => setLineWidth(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '4px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '2px',
                  outline: 'none'
                }}
              />
            </div>
          )}

          {/* 颜色面板 */}
          {showColorPalette && (
            <div
              data-panel="color-palette"
              style={{
                position: 'absolute',
                right: '84px',
                bottom: '80px',
                background: 'rgba(22, 27, 34, 0.95)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minWidth: '180px'
              }}>
              <Text style={{ color: '#f59e0b', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
                颜色选择
              </Text>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {[
                  '#ffffff', '#ff4444', '#44ff44', '#4444ff',
                  '#ffff44', '#ff44ff', '#44ffff', '#ff8844',
                  '#8844ff', '#44ff88', '#888888', '#2D1810'
                ].map((color) => (
                  <div
                    key={color}
                    onClick={() => { setCurrentColor(color); setShowColorPalette(false); }}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: currentColor === color ? '3px solid #f59e0b' : '2px solid rgba(255,255,255,0.5)',
                      transition: 'all 0.2s ease',
                      boxShadow: color === '#2D1810' || color === '#ffffff'
                        ? 'inset 0 0 0 1px rgba(128,128,128,0.5)'
                        : '0 2px 8px rgba(0,0,0,0.2)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    <svg
                      width="32"
                      height="32"
                      style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        borderRadius: '6px'
                      }}
                    >
                      <rect
                        width="32"
                        height="32"
                        fill={color}
                        rx="6"
                      />
                    </svg>
                  </div>
                ))}
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />
              <Text style={{ color: '#64748b', fontSize: '11px' }}>
                当前颜色: {currentColor}
              </Text>
              <div style={{
                width: '100%',
                height: '20px',
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <svg
                  width="100%"
                  height="20"
                  style={{
                    position: 'absolute',
                    top: '0',
                    left: '0'
                  }}
                >
                  <rect
                    width="100%"
                    height="20"
                    fill={currentColor}
                    rx="3"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* 设置面板 */}
          {showSettings && (
            <div
              data-panel="settings-panel"
              style={{
                position: 'absolute',
                right: '60px',
                top: '70%',
                transform: 'translateY(-50%)',
                background: 'rgba(22, 27, 34, 0.95)',
                border: '1px solid rgba(156, 163, 175, 0.3)',
                borderRadius: '12px',
                padding: '16px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minWidth: '160px'
              }}>
              <Text style={{ color: '#9ca3af', fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>
                设置选项
              </Text>
              <Button
                size="small"
                icon={<SaveOutlined />}
                onClick={() => {
                  const canvas = canvasRef.current;
                  if (canvas) {
                    const link = document.createElement('a');
                    link.download = 'blackboard.png';
                    link.href = canvas.toDataURL();
                    link.click();
                  }
                  setShowSettings(false);
                }}
                style={{ justifyContent: 'flex-start', background: 'transparent', border: 'none', color: '#f8fafc' }}
              >
                保存画布
              </Button>
              <Button
                size="small"
                icon={<FullscreenOutlined />}
                onClick={() => {
                  if (canvasRef.current?.requestFullscreen) {
                    canvasRef.current.requestFullscreen();
                  }
                  setShowSettings(false);
                }}
                style={{ justifyContent: 'flex-start', background: 'transparent', border: 'none', color: '#f8fafc' }}
              >
                全屏模式
              </Button>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />
              <Text style={{ color: '#64748b', fontSize: '11px' }}>
                字体大小: {fontSize}px
              </Text>
              <input
                type="range"
                min="12"
                max="48"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: '4px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '2px',
                  outline: 'none'
                }}
              />
            </div>
          )}

          {/* 快捷形状展开面板 */}
          {showQuickTools && (
            <div
              data-panel="quick-tools"
              style={{
                position: 'absolute',
                right: '60px',
                bottom: '80px',
                background: 'rgba(22, 27, 34, 0.95)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              padding: '12px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              minWidth: '120px'
            }}>
              <Button
                size="small"
                icon={<BorderOutlined />}
                onClick={() => { setCurrentTool('rectangle'); setShowQuickTools(false); }}
                style={{ justifyContent: 'flex-start', background: 'transparent', border: 'none', color: '#f8fafc' }}
              >
                矩形
              </Button>
              <Button
                size="small"
                icon={<RadiusUpleftOutlined />}
                onClick={() => { setCurrentTool('circle'); setShowQuickTools(false); }}
                style={{ justifyContent: 'flex-start', background: 'transparent', border: 'none', color: '#f8fafc' }}
              >
                圆形
              </Button>
              <Button
                size="small"
                icon={<ArrowRightOutlined />}
                onClick={() => { setCurrentTool('arrow'); setShowQuickTools(false); }}
                style={{ justifyContent: 'flex-start', background: 'transparent', border: 'none', color: '#f8fafc' }}
              >
                箭头
              </Button>
              <Button
                size="small"
                icon={<FontSizeOutlined />}
                onClick={() => { setCurrentTool('text'); setShowQuickTools(false); }}
                style={{ justifyContent: 'flex-start', background: 'transparent', border: 'none', color: '#f8fafc' }}
              >
                文字
              </Button>
            </div>
          )}

        {/* 模板选择悬浮框 */}
        {showTemplateModal && (
          <div
            data-panel="template-modal"
            style={{
              position: 'absolute',
              right: '84px',
              bottom: '80px',
              background: 'rgba(22, 27, 34, 0.95)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '12px',
              padding: '12px',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              maxWidth: '280px',
              maxHeight: '320px',
              overflowY: 'auto',
              minWidth: '260px',
              zIndex: 1000
            }}
            >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <Text style={{ fontSize: '15px', fontWeight: '600', color: '#f8fafc' }}>
                  选择模板
                </Text>
                <Button
                  shape="circle"
                  icon={<CloseOutlined />}
                  onClick={() => setShowTemplateModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#8B949E'
                  }}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px'
              }}>
                {templates.slice(0, 8).map((template) => (
                  <div
                    key={template.id}
                    onClick={() => {
                      applyTemplate(template);
                      setShowTemplateModal(false);
                    }}
                    style={{
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '6px',
                      padding: '8px 6px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(212, 146, 111, 0.2)';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(139, 92, 246, 0.1)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    <Text style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: '#f8fafc',
                      display: 'block'
                    }}>
                      {template.name}
                    </Text>
                  </div>
                ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
});

export default AIBlackboard;