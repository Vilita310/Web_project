import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  Card,
  Button,
  Space,
  Select,
  Alert,
  Spin,
  message,
  Typography
} from 'antd';
import { useTranslation } from 'react-i18next';
import { getApiUrl } from '../../config/api.js';
import { useTheme } from '../../contexts/ThemeContext';
import {
  PlayCircleOutlined,
  RobotOutlined,
  BugOutlined,
  BulbOutlined,
  FileTextOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { aiChat } from '../../utils/aiApi';

const { Text } = Typography;
const { Option } = Select;

// 根据主题生成动态样式
const getTechSelectStyle = (isDarkTheme) => `
  .tech-select .ant-select-selector {
    background: ${isDarkTheme
      ? 'linear-gradient(135deg, rgba(26, 29, 62, 0.8), rgba(31, 35, 75, 0.8))'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 247, 244, 0.9))'
    } !important;
    border: 1px solid ${isDarkTheme
      ? 'rgba(88, 166, 255, 0.3)'
      : 'rgba(212, 146, 111, 0.5)'
    } !important;
    border-radius: 8px !important;
    box-shadow: 0 0 10px ${isDarkTheme
      ? 'rgba(88, 166, 255, 0.1)'
      : 'rgba(160, 120, 59, 0.15)'
    } !important;
    backdrop-filter: blur(10px) !important;
  }

  .tech-select .ant-select-selection-item {
    color: ${isDarkTheme ? 'var(--tech-text-primary)' : '#2C2A2E'} !important;
    font-weight: 500 !important;
    font-size: 13px !important;
  }

  .tech-select .ant-select-arrow {
    color: ${isDarkTheme
      ? 'rgba(88, 166, 255, 0.6)'
      : 'rgba(160, 120, 59, 0.8)'
    } !important;
  }

  .tech-select:hover .ant-select-selector {
    border-color: ${isDarkTheme
      ? 'rgba(88, 166, 255, 0.5)'
      : 'rgba(160, 120, 59, 0.7)'
    } !important;
    box-shadow: 0 0 15px ${isDarkTheme
      ? 'rgba(88, 166, 255, 0.2)'
      : 'rgba(160, 120, 59, 0.25)'
    } !important;
  }

  .tech-select.ant-select-focused .ant-select-selector {
    border-color: ${isDarkTheme ? '#58A6FF' : '#D4926F'} !important;
    box-shadow: 0 0 20px ${isDarkTheme
      ? 'rgba(88, 166, 255, 0.3)'
      : 'rgba(160, 120, 59, 0.35)'
    } !important;
  }

  .ant-select-dropdown .ant-select-item {
    background: transparent !important;
    color: ${isDarkTheme ? 'var(--tech-text-primary)' : '#2C2A2E'} !important;
    transition: all 0.3s ease !important;
  }

  .ant-select-dropdown .ant-select-item:hover {
    background: ${isDarkTheme
      ? 'linear-gradient(135deg, rgba(88, 166, 255, 0.1), rgba(165, 163, 255, 0.1))'
      : 'linear-gradient(135deg, rgba(212, 146, 111, 0.15), rgba(181, 112, 74, 0.15))'
    } !important;
  }

  .ant-select-dropdown .ant-select-item-option-selected {
    background: ${isDarkTheme
      ? 'linear-gradient(135deg, rgba(88, 166, 255, 0.2), rgba(165, 163, 255, 0.2))'
      : 'linear-gradient(135deg, rgba(212, 146, 111, 0.25), rgba(181, 112, 74, 0.25))'
    } !important;
  }
`;

// 样式会根据主题动态更新

const MiniCodeEditor = ({
  initialCode = '',
  language = 'javascript',
  height = '300px',
  showLanguageSelector = true,
  title = null, // 使用翻译默认值
  onShowExamples = () => {},
  onHideExamples = () => {},
  onShowHints = () => {},
  onHideHints = () => {},
  onAiTeacherMessage = () => {},
  onAiTeacherStatus = () => {},
  onAiTeacherProgress = () => {},
  onSubmitCode = null,
  interviewMode = false,
  isEvaluating = false,
  onCodeChange = null,
  testCases = [], // 真实的测试用例
  problemData = null // 题目数据，包含测试用例和例子
}) => {
  const { t } = useTranslation('classroom');
  const { isDarkTheme } = useTheme();
  const editorRef = useRef(null);
  const [currentLanguage, setCurrentLanguage] = useState(language);

  // 支持的编程语言
  const languages = [
    {
      value: 'python',
      label: 'Python',
      defaultCode: `# Python Sample Code
def greet(name):
    return f"Hello, {name}!"

# Basic Variables and Operations
name = "World"
message = greet(name)
print(message)

# List Operations
numbers = [1, 2, 3, 4, 5]
squared = [x**2 for x in numbers]
print("Squared numbers:", squared)`
    },
    {
      value: 'javascript',
      label: 'JavaScript',
      defaultCode: `// JavaScript Sample Code
function greet(name) {
    return \`Hello, \${name}!\`;
}

// Basic Variables and Operations
const name = "World";
const message = greet(name);
console.log(message);

// Array Operations
const numbers = [1, 2, 3, 4, 5];
const squared = numbers.map(x => x * x);
console.log("Squared numbers:", squared);`
    },
    {
      value: 'java',
      label: 'Java',
      defaultCode: `// Java Sample Code
import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Basic Output
        System.out.println("Hello, Java!");

        // Variable Operations
        String name = "World";
        System.out.println("Hello, " + name + "!");

        // Array Operations
        int[] numbers = {1, 2, 3, 4, 5};
        System.out.print("Squared numbers: ");
        for (int num : numbers) {
            System.out.print(num * num + " ");
        }
        System.out.println();
    }
}`
    },
    {
      value: 'cpp',
      label: 'C++',
      defaultCode: `// C++ 示例代码
#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    // 基础输出
    cout << "Hello, C++!" << endl;

    // 变量操作
    string name = "World";
    cout << "Hello, " << name << "!" << endl;

    // 向量操作
    vector<int> numbers = {1, 2, 3, 4, 5};
    cout << "Squared numbers" << ": ";
    for (int num : numbers) {
        cout << num * num << " ";
    }
    cout << endl;

    return 0;
}`
    },
    {
      value: 'typescript',
      label: 'TypeScript',
      defaultCode: `// TypeScript 示例代码
interface Person {
    name: string;
    age: number;
}

function greet(person: Person): string {
    return \`Hello, \${person.name}! You are \${person.age} years old.\`;
}

// 基础变量和操作
const user: Person = { name: "Alice", age: 30 };
const message: string = greet(user);
console.log(message);

// 数组操作
const numbers: number[] = [1, 2, 3, 4, 5];
const squared: number[] = numbers.map((x: number) => x * x);
console.log("Squared numbers:", squared);`
    },
    {
      value: 'go',
      label: 'Go',
      defaultCode: `// Go 示例代码
package main

import (
    "fmt"
)

func greet(name string) string {
    return fmt.Sprintf("Hello, %s!", name)
}

func main() {
    // 基础输出
    fmt.Println("Hello, Go!")

    // 变量操作
    name := "World"
    message := greet(name)
    fmt.Println(message)

    // 切片操作
    numbers := []int{1, 2, 3, 4, 5}
    var squared []int
    for _, num := range numbers {
        squared = append(squared, num*num)
    }
    fmt.Println("Squared numbers:", squared)
}`
    },
    {
      value: 'rust',
      label: 'Rust',
      defaultCode: `// Rust 示例代码
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

fn main() {
    // 基础输出
    println!("Hello, Rust!");

    // 变量操作
    let name = "World";
    let message = greet(name);
    println!("{}", message);

    // 向量操作
    let numbers = vec![1, 2, 3, 4, 5];
    let squared: Vec<i32> = numbers.iter().map(|x| x * x).collect();
    println!("Squared numbers: {:?}", squared);
}`
    },
    {
      value: 'php',
      label: 'PHP',
      defaultCode: `<?php
// PHP 示例代码
function greet($name) {
    return "Hello, " . $name . "!";
}

// 基础输出
echo "Hello, PHP!\\n";

// 变量操作
$name = "World";
$message = greet($name);
echo $message . "\\n";

// 数组操作
$numbers = [1, 2, 3, 4, 5];
$squared = array_map(function($x) { return $x * $x; }, $numbers);
echo "Squared numbers: " . implode(", ", $squared) . "\\n";
?>`
    }
  ];

  // 初始化代码：如果有 initialCode 使用它，否则使用语言默认代码
  const getInitialCode = () => {
    if (initialCode && initialCode.trim()) {
      return initialCode;
    }
    const langInfo = languages.find(lang => lang.value === language);
    return langInfo ? langInfo.defaultCode : languages[0].defaultCode;
  };

  const [code, setCode] = useState(getInitialCode());
  const [isRunning, setIsRunning] = useState(false);
  const [lastTestResults, setLastTestResults] = useState([]);

  // 注入样式 - 响应主题变化
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // 移除旧的样式
      const existingStyle = document.getElementById('tech-select-style');
      if (existingStyle) {
        existingStyle.remove();
      }

      // 注入新的主题样式包含Monaco Editor强制黑色背景
      const styleElement = document.createElement('style');
      styleElement.id = 'tech-select-style';
      styleElement.textContent = getTechSelectStyle(isDarkTheme) + `
        /* 强制Monaco Editor背景根据主题 */
        .monaco-editor,
        .monaco-editor .margin,
        .monaco-editor-background,
        .monaco-editor .inputarea.ime-input {
          background: ${isDarkTheme ? '#000000' : '#F8F7F4'} !important;
        }
        .monaco-editor .view-lines,
        .monaco-editor .view-line {
          background: transparent !important;
        }
        .monaco-editor .current-line {
          background: ${isDarkTheme ? '#0a0a0a' : '#f0eeeb'} !important;
        }
      `;
      document.head.appendChild(styleElement);
    }
  }, [isDarkTheme]);

  // 监听主题变化并重新应用Monaco编辑器主题
  useEffect(() => {
    if (editorRef.current) {
      const monaco = window.monaco;
      if (monaco) {
        const currentTheme = isDarkTheme ? 'myDarkTheme' : 'myLightTheme';
        monaco.editor.setTheme(currentTheme);
      }
    }
  }, [isDarkTheme]);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [hasRun, setHasRun] = useState(false); // 用于控制是否显示结果卡片
  const [showExamples, setShowExamples] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);
  const [isTeaching, setIsTeaching] = useState(false);

  // 语音对话状态
  const [isListening, setIsListening] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [ttsGenerating, setTtsGenerating] = useState(false);
  const [ttsProgress, setTtsProgress] = useState(0);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [voiceChatVisible, setVoiceChatVisible] = useState(false);


  // 运行代码和测试用例
  const runCode = async () => {
    setIsRunning(true);
    setOutput('');
    setError('');

    try {
      // 如果有测试用例，就运行测试；否则只是普通的代码执行
      if (testCases && testCases.length > 0) {
        await runTestCases();
      } else {
        await runSimpleExecution();
      }
      setHasRun(true);
    } catch (err) {
      setError(`${t('messages.executionError')}: ${err.message}`);
      message.error(t('messages.codeExecutionFailed'));
      setHasRun(true);
    } finally {
      setIsRunning(false);
    }
  };

  // 运行测试用例
  const runTestCases = async () => {
    const results = [];
    let allPassed = true;
    let outputLog = '';

    for (const testCase of testCases) {
      try {
        // 根据语言构建测试代码
        const testCode = buildTestCode(code, testCase, currentLanguage);

        // 执行测试代码
        const response = await axios.post(getApiUrl('/code-execution/execute'), {
          code: testCode,
          language: currentLanguage,
          input_data: "",
          time_limit: 30,
          memory_limit: 128
        });

        if (response.data.status === 'success') {
          const actualOutput = response.data.output?.trim();
          const expectedOutput = String(testCase.expected).trim();
          const passed = actualOutput === expectedOutput;

          results.push({
            id: testCase.id,
            input: testCase.input,
            expected: testCase.expected,
            actual: actualOutput,
            passed: passed,
            description: testCase.description
          });

          if (!passed) allPassed = false;

          outputLog += `${t('messages.testCase')} ${testCase.id}: ${passed ? '✅ ' + t('messages.passed') : '❌ ' + t('messages.failed')}\n`;
          outputLog += `${t('messages.input')}: ${testCase.input}\n`;
          outputLog += `${t('messages.expected')}: ${testCase.expected}\n`;
          outputLog += `${t('messages.actual')}: ${actualOutput}\n\n`;
        } else {
          results.push({
            id: testCase.id,
            input: testCase.input,
            expected: testCase.expected,
            actual: 'Error: ' + (response.data.error || t('messages.runtimeError')),
            passed: false,
            description: testCase.description
          });
          allPassed = false;
          outputLog += `${t('messages.testCase')} ${testCase.id}: ❌ ${t('messages.testCaseError')}\n`;
          outputLog += `${t('messages.error')}: ${response.data.error}\n\n`;
        }
      } catch (err) {
        results.push({
          id: testCase.id,
          input: testCase.input,
          expected: testCase.expected,
          actual: 'Error: ' + err.message,
          passed: false,
          description: testCase.description
        });
        allPassed = false;
        outputLog += `${t('messages.testCase')} ${testCase.id}: ❌ ${t('messages.executionError')}\n`;
        outputLog += `${t('messages.exception')}: ${err.message}\n\n`;
      }
    }

    setLastTestResults(results);
    setOutput(outputLog);

    if (allPassed) {
      if (!interviewMode) {
        message.success('🎉 恭喜！所有测试用例通过！');
      }
    } else {
      message.error('❌ 部分测试用例未通过，请检查代码');
    }
  };

  // 普通代码执行（没有测试用例时）
  const runSimpleExecution = async () => {
    const response = await axios.post(getApiUrl('/code-execution/execute'), {
      code: code,
      language: currentLanguage,
      input_data: "",
      time_limit: 30,
      memory_limit: 128
    });

    if (response.data.status === 'success') {
      setOutput(response.data.output || t('messages.noOutput'));
      message.success(t('messages.codeExecutionSuccess'));

      // 生成基础的测试结果（为了兼容）
      const basicResults = [
        { id: 1, input: t('messages.basicRun'), expected: t('messages.success'), actual: t('messages.success'), passed: true }
      ];
      setLastTestResults(basicResults);
    } else {
      setError(response.data.error || t('messages.codeExecutionFailed'));
      message.error(`${t('messages.codeExecutionFailed')}: ${response.data.status}`);

      const errorResults = [
        { id: 1, input: t('messages.basicRun'), expected: t('messages.success'), actual: 'Error', passed: false }
      ];
      setLastTestResults(errorResults);
    }
  };

  // 构建测试代码
  const buildTestCode = (userCode, testCase, language) => {
    // 获取题目的函数配置信息
    const functionInfo = problemData?.functionInfo?.[language];

    if (!functionInfo) {
      // 如果没有函数配置，回退到简单执行
      return userCode;
    }

    const { functionName, parameters } = functionInfo;

    if (language === 'javascript') {
      // 构建参数调用
      const paramValues = parameters.map(param => {
        const value = testCase.input[param];
        return JSON.stringify(value);
      }).join(', ');

      return `
${userCode}

// 测试用例执行
try {
  // 检查用户是否定义了正确的函数
  if (typeof ${functionName} === 'function') {
    const result = ${functionName}(${paramValues});
    console.log(result);
  } else {
    console.log('Error: 请定义函数 ${functionName}');
  }
} catch (error) {
  console.log('Error: ' + error.message);
}
      `;
    } else if (language === 'python') {
      // 构建参数调用
      const paramValues = parameters.map(param => {
        const value = testCase.input[param];
        return JSON.stringify(value);
      }).join(', ');

      return `
${userCode}

# 测试用例执行
try:
    # 检查用户是否定义了正确的函数
    if '${functionName}' in globals():
        result = ${functionName}(${paramValues})
        print(result)
    else:
        print('Error: 请定义函数 ${functionName}')
except Exception as error:
    print(f"Error: {error}")
      `;
    }

    return userCode; // 其他语言暂时返回原代码
  };

  // 切换语言
  const handleLanguageChange = (newLanguage) => {
    const langInfo = languages.find(lang => lang.value === newLanguage);
    if (langInfo) {
      setCurrentLanguage(newLanguage);
      setCode(langInfo.defaultCode);
      setHasRun(false); // 重置运行状态
      setOutput('');
      setError('');
    }
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

        // 发送用户消息到聊天框
        onAiTeacherMessage({
          id: Date.now(),
          type: 'user',
          content: transcript,
          timestamp: new Date().toLocaleTimeString()
        });

        // 处理语音输入
        await handleVoiceInput(transcript);
      };

      recognitionInstance.onerror = (event) => {
        console.error(t('codeEditor.speechRecognitionError'), event.error);
        message.error(t('messages.speechRecognitionFailed'));
        setIsListening(false);
        onAiTeacherStatus('idle');
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // 处理语音输入
  const handleVoiceInput = async (transcript) => {
    setAiThinking(true);
    onAiTeacherStatus('thinking');

    try {
      const codeContext = `当前代码：\n${code}\n\n编程语言：${currentLanguage}`;
      const prompt = `作为AI编程教师，请针对学生的问题"${transcript}"，结合以下代码上下文给出详细的教学回答：\n${codeContext}`;

      const response = await aiChat(prompt, t('codeEditor.aiProgrammingTeacher'), 'advanced', 120);

      // 发送AI回复消息到聊天框
      onAiTeacherMessage({
        id: Date.now() + 1,
        type: 'ai',
        content: response.response,
        timestamp: new Date().toLocaleTimeString()
      });

      // 播放AI回复
      await speakResponse(response.response);

    } catch (error) {
      console.error(t('codeEditor.aiTeacherDialogError'), error);
      message.error(t('messages.aiTeacherNotAvailable'));

      // 发送错误消息到聊天框
      onAiTeacherMessage({
        id: Date.now() + 1,
        type: 'ai',
        content: t('codeEditor.defaultErrorReply'),
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      });

      setAiThinking(false);
      onAiTeacherStatus('idle');
    }
  };

  // AI语音播放功能
  const speakResponse = async (text) => {
    if (!text) return;

    setAiThinking(false);
    setTtsGenerating(true);
    setTtsProgress(0);
    onAiTeacherStatus('generating');

    // 启动进度条动画
    const progressInterval = setInterval(() => {
      setTtsProgress(prev => {
        const newProgress = prev >= 90 ? 90 : prev + 10;
        onAiTeacherProgress(newProgress);
        return newProgress;
      });
    }, 300);

    try {
      // 调用后端OpenAI TTS API
      const response = await fetch(getApiUrl('/ai/tts'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: 'alloy',
          model: 'tts-1'
        })
      });

      if (!response.ok) {
        throw new Error(t('errors.ttsRequestFailed'));
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // 清除进度条并完成
      clearInterval(progressInterval);
      setTtsProgress(100);
      onAiTeacherProgress(100);

      setTimeout(() => {
        setTtsGenerating(false);
        setAiSpeaking(true);
        setTtsProgress(0);
        onAiTeacherProgress(0);
        onAiTeacherStatus('speaking');
      }, 200);

      // 将base64音频数据转换为可播放的音频
      const audioBase64 = data.audio_base64;
      const audioBlob = new Blob([
        Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))
      ], { type: 'audio/mpeg' });

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setAiSpeaking(false);
        onAiTeacherStatus('idle');
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setAiSpeaking(false);
        onAiTeacherStatus('idle');
        URL.revokeObjectURL(audioUrl);
        console.error(t('codeEditor.audioPlaybackFailed'));
      };

      await audio.play();

    } catch (error) {
      console.error(t('codeEditor.ttsGenerationFailed'), error);
      clearInterval(progressInterval);
      setTtsGenerating(false);
      setAiSpeaking(false);
      setTtsProgress(0);
      onAiTeacherProgress(0);
      onAiTeacherStatus('idle');
      message.error(t('messages.voicePlaybackFailed'));
    }
  };

  // 开始语音识别
  const startListening = () => {
    if (recognition && !isListening) {
      setIsListening(true);
      recognition.start();
    }
  };

  // AI Teacher 功能 - 现在支持语音对话
  const handleAITeacher = async () => {
    if (isListening || aiThinking || ttsGenerating || aiSpeaking) {
      // 如果正在进行语音功能，停止所有语音活动
      if (recognition) recognition.stop();
      setIsListening(false);
      setAiThinking(false);
      setTtsGenerating(false);
      setAiSpeaking(false);
      onAiTeacherStatus('idle');
      return;
    }

    // 开始语音对话
    startListening();
    onAiTeacherStatus('listening');
    message.info(t('messages.aiTeacherReady'));
  };

  // AI Debug 功能
  const handleAIDebug = async () => {
    setIsDebugging(true);

    // 获取当前代码
    const currentCode = code || '';

    if (!currentCode.trim()) {
      message.warning(t('messages.writeCodeFirst'));
      setIsDebugging(false);
      return;
    }

    try {
      message.info(t('messages.analyzingCode'));

      // 构建调试请求消息
      const debugMessage = {
        id: Date.now(),
        type: 'user',
        content: `请帮我调试以下${currentLanguage}代码，分析其中可能存在的问题、错误或改进建议：\n\n\`\`\`${currentLanguage}\n${currentCode}\n\`\`\``,
        timestamp: new Date().toLocaleTimeString()
      };

      // 发送用户请求到AI助教
      onAiTeacherMessage && onAiTeacherMessage(debugMessage);

      // 调用AI进行代码调试分析
      const debugPrompt = `作为专业的代码调试助手，请分析以下${currentLanguage}代码，重点关注：

1. 语法错误和潜在bug
2. 逻辑错误和边界情况
3. 性能优化建议
4. 代码规范和最佳实践
5. 安全性问题

代码：
\`\`\`${currentLanguage}
${currentCode}
\`\`\`

请提供详细的调试报告，包括问题描述、修复建议和改进的代码示例。`;

      message.loading(t('messages.aiAnalyzingCode'), 0);
      const response = await aiChat(debugPrompt, t('codeEditor.aiDebugAssistant'), 'advanced', 150);
      message.destroy(); // 清除loading消息

      // 发送AI调试结果到AI助教
      const debugResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.response,
        timestamp: new Date().toLocaleTimeString()
      };

      onAiTeacherMessage && onAiTeacherMessage(debugResponse);
      message.success(t('messages.aiDebugComplete'));

    } catch (error) {
      message.destroy(); // 清除可能存在的loading消息
      console.error(t('codeEditor.aiDebugError'), error);

      // 发送错误消息到AI助教
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: t('codeEditor.debugAnalysisError'),
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      onAiTeacherMessage && onAiTeacherMessage(errorMessage);
      message.error(t('messages.aiDebugFailed'));
    } finally {
      setIsDebugging(false);
    }
  };

  // 根据当前语言生成代码示例
  const getCodeExamples = () => {
    const examples = {
      python: [
        {
          title: t('codeEditor.codeExamples.functionDefinition'),
          code: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 计算前10个斐波那契数
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`,
          description: t('codeEditor.codeExamples.recursiveFibonacci')
        },
        {
          title: t('codeEditor.codeExamples.listComprehension'),
          code: `# 数据处理示例
data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

# 筛选偶数并平方
even_squares = [x**2 for x in data if x % 2 == 0]
print(t('codeEditor.codeExamples.evenSquares'), even_squares)`,
          description: t('codeEditor.codeExamples.dataProcessingWithComprehension')
        }
      ],
      javascript: [
        {
          title: t('codeEditor.codeExamples.asyncFunction'),
          code: `async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

// 使用示例
fetchData('https://api.example.com/data');`,
          description: t('codeEditor.codeExamples.asyncDataFetching')
        },
        {
          title: t('codeEditor.codeExamples.arrayMethods'),
          code: `const numbers = [1, 2, 3, 4, 5];

// 链式操作
const result = numbers
    .filter(n => n % 2 === 0)
    .map(n => n * n)
    .reduce((sum, n) => sum + n, 0);

console.log('Sum of even squares:', result);`,
          description: t('codeEditor.codeExamples.functionalArrayMethods')
        }
      ],
      java: [
        {
          title: t('codeEditor.codeExamples.classAndInterface'),
          code: `interface Drawable {
    void draw();
}

class Circle implements Drawable {
    private double radius;

    public Circle(double radius) {
        this.radius = radius;
    }

    @Override
    public void draw() {
        System.out.println("Drawing circle with radius: " + radius);
    }
}`,
          description: t('codeEditor.codeExamples.objectOrientedBasics')
        },
        {
          title: t('codeEditor.codeExamples.setOperations'),
          code: `import java.util.*;
import java.util.stream.*;

List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

// Stream API 使用
List<Integer> evenSquares = numbers.stream()
    .filter(n -> n % 2 == 0)
    .map(n -> n * n)
    .collect(Collectors.toList());

System.out.println(evenSquares);`,
          description: t('codeEditor.codeExamples.javaStreamAPI')
        }
      ],
      cpp: [
        {
          title: t('codeEditor.codeExamples.templateAndSTL'),
          code: `#include <vector>
#include <algorithm>
#include <iostream>

template<typename T>
void printVector(const std::vector<T>& vec) {
    for (const auto& item : vec) {
        std::cout << item << " ";
    }
    std::cout << std::endl;
}

int main() {
    std::vector<int> nums = {5, 2, 8, 1, 9};
    std::sort(nums.begin(), nums.end());
    printVector(nums);
    return 0;
}`,
          description: t('codeEditor.codeExamples.templateFunctionAndSTL')
        }
      ],
      typescript: [
        {
          title: t('codeEditor.codeExamples.genericsAndTypes'),
          code: `interface Repository<T> {
    save(entity: T): Promise<T>;
    findById(id: string): Promise<T | null>;
}

class UserRepository implements Repository<User> {
    async save(user: User): Promise<User> {
        // 保存逻辑
        return user;
    }

    async findById(id: string): Promise<User | null> {
        // 查找逻辑
        return null;
    }
}`,
          description: t('codeEditor.codeExamples.genericInterfaceAndClass')
        }
      ],
      go: [
        {
          title: t('codeEditor.codeExamples.concurrentProgramming'),
          code: `package main

import (
    "fmt"
    "sync"
    "time"
)

func worker(id int, wg *sync.WaitGroup) {
    defer wg.Done()
    fmt.Printf("Worker %d starting\\n", id)
    time.Sleep(time.Second)
    fmt.Printf("Worker %d done\\n", id)
}

func main() {
    var wg sync.WaitGroup

    for i := 1; i <= 3; i++ {
        wg.Add(1)
        go worker(i, &wg)
    }

    wg.Wait()
    fmt.Println("All workers completed")
}`,
          description: t('codeEditor.codeExamples.goroutinesAndWaitGroup')
        }
      ],
      rust: [
        {
          title: t('codeEditor.codeExamples.ownershipAndBorrowing'),
          code: `fn main() {
    let mut data = vec![1, 2, 3, 4, 5];

    // 借用
    let sum = calculate_sum(&data);
    println!("Sum: {}", sum);

    // 可变借用
    modify_data(&mut data);
    println!("Modified: {:?}", data);
}

fn calculate_sum(numbers: &[i32]) -> i32 {
    numbers.iter().sum()
}

fn modify_data(numbers: &mut Vec<i32>) {
    numbers.push(6);
}`,
          description: t('codeEditor.codeExamples.rustOwnershipSystem')
        }
      ],
      php: [
        {
          title: t('codeEditor.codeExamples.classAndNamespace'),
          code: `<?php
namespace App\\Utils;

class StringHelper {
    public static function slugify(string $text): string {
        $text = preg_replace('/[^\\w\\s]/', '', $text);
        $text = preg_replace('/\\s+/', '-', trim($text));
        return strtolower($text);
    }

    public static function truncate(string $text, int $length): string {
        return strlen($text) > $length
            ? substr($text, 0, $length) . '...'
            : $text;
    }
}

// 使用示例
echo StringHelper::slugify("Hello World!"); // "hello-world"
?>`,
          description: t('codeEditor.codeExamples.phpClassAndStaticMethods')
        }
      ]
    };

    return examples[currentLanguage] || examples.python;
  };

  // 解题提示数据
  const debugHints = t('codeEditor.debugHints', { returnObjects: true });

  // 编辑器配置
  const editorOptions = {
    fontSize: 13,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on',
    lineNumbers: 'on',
    folding: false,
    cursorBlinking: 'blink',
    cursorStyle: 'line',
    renderWhitespace: 'none',
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorSmoothCaretAnimation: true,
    // 添加滚动条配置
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible',
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
      verticalSliderSize: 8,
      horizontalSliderSize: 8,
      alwaysConsumeMouseWheel: false
    },
    // 确保滚动条始终可见
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true
  };

  return (
    <div style={{ width: '100%' }}>
      <Card
        className="tech-card tech-fade-in"
        title={
          <span className="tech-title" style={{ fontSize: '14px', color: 'var(--tech-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {(() => {
              const displayTitle = title || t('codeEditor.defaultTitle');
              return displayTitle.includes('💻') ? (
                <>
                  <span>💻</span>
                  <span>{displayTitle.replace('💻 ', '')}</span>
                </>
              ) : (
                displayTitle
              );
            })()}
          </span>
        }
        extra={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {showLanguageSelector && (
              <Select
                value={currentLanguage}
                onChange={handleLanguageChange}
                size="small"
                style={{
                  width: 120,
                }}
                className="tech-select"
                dropdownStyle={{
                  background: isDarkTheme ? 'var(--tech-card-bg)' : 'rgba(255, 255, 255, 0.95)',
                  border: `1px solid ${isDarkTheme ? 'var(--tech-border)' : 'rgba(212, 146, 111, 0.3)'}`,
                  borderRadius: '8px',
                  boxShadow: isDarkTheme
                    ? '0 8px 32px rgba(88, 166, 255, 0.15)'
                    : '0 8px 32px rgba(212, 146, 111, 0.15)',
                  backdropFilter: 'blur(10px)'
                }}
                dropdownRender={(menu) => (
                  <div style={{
                    background: isDarkTheme
                      ? 'linear-gradient(135deg, rgba(26, 29, 62, 0.98), rgba(31, 35, 75, 0.98))'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 247, 244, 0.98))',
                    border: `1px solid ${isDarkTheme ? 'rgba(88, 166, 255, 0.2)' : 'rgba(160, 120, 59, 0.3)'}`,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: isDarkTheme
                    ? '0 8px 32px rgba(88, 166, 255, 0.15)'
                    : '0 8px 32px rgba(212, 146, 111, 0.15)'
                  }}>
                    {menu}
                  </div>
                )}
              >
                {languages.map(lang => (
                  <Option
                    key={lang.value}
                    value={lang.value}
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--tech-text-primary)',
                      fontSize: '13px',
                      fontWeight: 500
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 0'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: lang.value === currentLanguage
                          ? 'linear-gradient(135deg, #58A6FF, #6366f1)'
                          : 'rgba(255, 255, 255, 0.3)'
                      }} />
                      {lang.label}
                    </div>
                  </Option>
                ))}
              </Select>
            )}

            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={runCode}
              loading={isRunning}
              disabled={!code.trim()}
              size="small"
              style={{
                background: isDarkTheme
                  ? 'linear-gradient(135deg, #58A6FF 0%, #6366f1 100%)'
                  : 'linear-gradient(135deg, #D4926F 0%, #A0783B 100%)',
                border: 'none',
                boxShadow: isDarkTheme
                  ? '0 0 20px rgba(88, 166, 255, 0.3)'
                  : '0 0 20px rgba(212, 146, 111, 0.3)',
                fontWeight: 600,
                marginRight: '8px'
              }}
            >
              {t('buttons.runCode')}
            </Button>

            {/* 面试模式下的提交按钮 */}
            {interviewMode && onSubmitCode && (
              <Button
                type="primary"
                icon={<TrophyOutlined />}
                onClick={() => {
                  // 传递当前实际的代码和测试结果
                  onSubmitCode(code, lastTestResults);
                }}
                loading={isEvaluating}
                disabled={!code.trim() || isEvaluating || !hasRun}
                size="small"
                style={{
                  background: hasRun
                    ? 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)'
                    : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                  border: 'none',
                  boxShadow: hasRun
                    ? '0 0 20px rgba(255, 193, 7, 0.3)'
                    : '0 0 20px rgba(107, 114, 128, 0.2)',
                  fontWeight: 600,
                  color: hasRun ? '#000' : '#9ca3af'
                }}
              >
                {isEvaluating ? t('buttons.evaluating') : hasRun ? t('buttons.submitCode') : t('buttons.runFirst')}
              </Button>
            )}
          </div>
        }
        size="small"
        style={{
          height: '500px',
          marginTop: '0px',
          border: isDarkTheme ? '1px solid #3c3c3c' : '1px solid #d9d9d9',
          background: '#000000',
          borderRadius: '12px'
        }}
        headStyle={{
          background: '#000000',
          borderBottom: '1px solid #3c3c3c',
          color: '#ffffff'
        }}
        bodyStyle={{
          padding: '12px',
          height: '440px',
          overflow: 'hidden',
          background: '#000000'
        }}
      >
        <Editor
          height="400px"
          language={currentLanguage}
          value={code}
          onChange={(value) => {
            setCode(value);
            // 通知父组件代码变化
            if (onCodeChange) {
              onCodeChange(value);
            }
          }}
          theme="myDarkTheme"
          options={editorOptions}
          onMount={(editor, monaco) => {
            editorRef.current = editor;

            // 定义深色主题 - 强制黑色背景
            monaco.editor.defineTheme('myDarkTheme', {
              base: 'vs-dark',
              inherit: false,
              rules: [
                { token: '', foreground: 'd4d4d4', background: '000000' }
              ],
              colors: {
                'editor.background': '#000000',
                'editor.foreground': '#d4d4d4',
                'editorLineNumber.foreground': '#858585',
                'editor.selectionBackground': '#264f78',
                'editorCursor.foreground': '#ffffff',
                'editor.lineHighlightBackground': '#0a0a0a',
                'editorIndentGuide.background': '#404040',
                'editorIndentGuide.activeBackground': '#707070',
                'editorWhitespace.foreground': '#404040',
                'scrollbarSlider.background': '#79797966',
                'scrollbarSlider.hoverBackground': '#646464b3'
              }
            });

            // 定义浅色主题 - 使用白色背景
            monaco.editor.defineTheme('myLightTheme', {
              base: 'vs',
              inherit: false,
              rules: [
                { token: '', foreground: '1a1a1a', background: 'F8F7F4' }
              ],
              colors: {
                'editor.background': '#F8F7F4',
                'editor.foreground': '#1a1a1a',
                'editorLineNumber.foreground': '#237893',
                'editor.selectionBackground': '#add6ff',
                'editorCursor.foreground': '#000000',
                'editor.lineHighlightBackground': '#f0eeeb',
                'editorIndentGuide.background': '#e0e0e0',
                'editorIndentGuide.activeBackground': '#c0c0c0',
                'editorWhitespace.foreground': '#e0e0e0',
                'scrollbarSlider.background': '#79797966',
                'scrollbarSlider.hoverBackground': '#646464b3'
              }
            });

            // 应用对应的主题
            const currentTheme = isDarkTheme ? 'myDarkTheme' : 'myLightTheme';
            monaco.editor.setTheme(currentTheme);

            // 确保主题应用到编辑器实例
            setTimeout(() => {
              monaco.editor.setTheme(currentTheme);

              // 强制设置编辑器背景为黑色
              const editorElement = editor.getDomNode();
              if (editorElement) {
                const viewport = editorElement.querySelector('.monaco-editor .view-line');
                const container = editorElement.querySelector('.monaco-editor');
                const lines = editorElement.querySelector('.monaco-editor .view-lines');

                if (container) {
                  container.style.backgroundColor = '#000000 !important';
                }
                if (lines) {
                  lines.style.backgroundColor = '#000000 !important';
                }
              }
            }, 100);
          }}
        />
      </Card>


      {/* 运行结果面板 - 科技风格 */}
      {hasRun && (
        <div className="tech-card tech-fade-in" style={{
          marginTop: '12px',
          border: '1px solid var(--tech-border)',
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'var(--tech-card-bg)',
          boxShadow: isDarkTheme
            ? '0 8px 32px rgba(88, 166, 255, 0.1)'
            : '0 8px 32px rgba(212, 146, 111, 0.1)'
        }}>
          {/* 结果头部 - 科技风格 */}
          <div style={{
            padding: '8px 12px',
            borderBottom: '1px solid var(--tech-border)',
            background: 'var(--tech-header-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {output ? (
                <>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isDarkTheme ? '#58A6FF' : '#00ffff',
                    boxShadow: isDarkTheme
                      ? '0 0 8px rgba(88, 166, 255, 0.5)'
                      : '0 0 8px rgba(212, 146, 111, 0.5)'
                  }} />
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--tech-text-primary)'
                  }}>
                    Accepted
                  </span>
                </>
              ) : (
                <>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#ff6b6b',
                    boxShadow: '0 0 8px rgba(255, 107, 107, 0.5)'
                  }} />
                  <span style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--tech-text-primary)'
                  }}>
                    Runtime Error
                  </span>
                </>
              )}
            </div>

            {/* 执行时间等信息 */}
            <div style={{
              fontSize: '12px',
              color: 'var(--tech-text-secondary)'
            }}>
              {output ? 'Runtime: 0 ms' : 'Error'}
            </div>
          </div>

          {/* 结果内容 */}
          <div style={{
            background: 'var(--tech-card-bg)'
          }}>
            {isRunning ? (
              <div style={{
                padding: '16px',
                textAlign: 'center',
                color: 'var(--tech-text-secondary)'
              }}>
                <Spin size="small" />
                <span style={{ marginLeft: '8px', fontSize: '13px' }}>Running...</span>
              </div>
            ) : (
              <>
                {output && (
                  <div>
                    {/* 输出标签 */}
                    <div style={{
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--tech-text-primary)',
                      background: isDarkTheme
                        ? 'linear-gradient(135deg, rgba(88, 166, 255, 0.1), rgba(165, 163, 255, 0.1))'
                        : 'linear-gradient(135deg, rgba(212, 146, 111, 0.1), rgba(160, 120, 59, 0.1))',
                      borderBottom: '1px solid var(--tech-border)'
                    }}>
                      Output
                    </div>
                    <div style={{
                      padding: '12px',
                      fontFamily: '"JetBrains Mono", "SF Mono", "Consolas", "Monaco", "monospace"',
                      fontSize: '13px',
                      lineHeight: 1.45,
                      color: 'var(--tech-text-primary)',
                      background: 'var(--tech-card-bg)'
                    }}>
                      <pre style={{
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {output}
                      </pre>
                    </div>
                  </div>
                )}

                {error && (
                  <div>
                    {/* 错误标签 */}
                    <div style={{
                      padding: '8px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--tech-text-primary)',
                      background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(245, 34, 45, 0.1))',
                      borderBottom: '1px solid var(--tech-border)'
                    }}>
                      Error Message
                    </div>
                    <div style={{
                      padding: '12px',
                      fontFamily: '"JetBrains Mono", "SF Mono", "Consolas", "Monaco", "monospace"',
                      fontSize: '13px',
                      lineHeight: 1.45,
                      color: '#ff6b6b',
                      background: 'var(--tech-card-bg)'
                    }}>
                      <pre style={{
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {error}
                      </pre>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* 测试用例显示 */}
      {testCases && testCases.length > 0 && (
        <div className="tech-card tech-fade-in" style={{
          marginTop: '12px',
          border: '1px solid var(--tech-border)',
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'var(--tech-card-bg)',
          boxShadow: isDarkTheme
            ? '0 8px 32px rgba(88, 166, 255, 0.1)'
            : '0 8px 32px rgba(212, 146, 111, 0.1)'
        }}>
          {/* 测试用例头部 */}
          <div style={{
            padding: '8px 12px',
            borderBottom: '1px solid var(--tech-border)',
            background: 'var(--tech-header-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isDarkTheme ? '#58A6FF' : '#00ffff',
                boxShadow: isDarkTheme
                  ? '0 0 8px rgba(88, 166, 255, 0.5)'
                  : '0 0 8px rgba(212, 146, 111, 0.5)'
              }} />
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--tech-text-primary)'
              }}>
                {t('messages.testCases')} ({testCases.length}{t('messages.cases')})
              </span>
            </div>
          </div>

          {/* 测试用例内容 */}
          <div style={{
            padding: '12px',
            background: 'var(--tech-card-bg)'
          }}>
            {testCases.map((testCase, index) => (
              <div key={testCase.id} style={{
                marginBottom: index < testCases.length - 1 ? '12px' : '0',
                padding: '8px 12px',
                background: isDarkTheme
                  ? 'linear-gradient(135deg, rgba(88, 166, 255, 0.05), rgba(165, 163, 255, 0.05))'
                  : 'linear-gradient(135deg, rgba(212, 146, 111, 0.05), rgba(160, 120, 59, 0.05))',
                border: isDarkTheme
                  ? '1px solid rgba(88, 166, 255, 0.1)'
                  : '1px solid rgba(212, 146, 111, 0.1)',
                borderRadius: '8px'
              }}>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--tech-text-secondary)',
                  marginBottom: '4px'
                }}>
                  {t('messages.case')} {testCase.id}: {testCase.description}
                </div>
                <div style={{
                  fontSize: '13px',
                  fontFamily: '"SFMono-Regular", "Consolas", "Liberation Mono", "Menlo", "monospace"',
                  color: 'var(--tech-text-primary)'
                }}>
                  <div style={{ marginBottom: '2px' }}>
                    <span style={{ color: isDarkTheme ? '#58A6FF' : '#D4926F' }}>{t('testCases.input')}:</span> {
                      typeof testCase.input === 'object'
                        ? Object.entries(testCase.input).map(([key, value]) =>
                            `${key} = ${JSON.stringify(value)}`
                          ).join(', ')
                        : testCase.input
                    }
                  </div>
                  <div>
                    <span style={{ color: isDarkTheme ? '#A5A3FF' : '#A0783B' }}>{t('testCases.output')}:</span> {testCase.expected}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default MiniCodeEditor;