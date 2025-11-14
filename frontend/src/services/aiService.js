// AI聊天服务
export const aiChat = async (message, context = '', mode = 'basic', maxTokens = 100) => {
  try {
    // 模拟AI响应延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // 根据消息内容生成相应的AI回复
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('code review') || lowerMessage.includes('review') || lowerMessage.includes('代码评审')) {
      return `🔍 **Code Review Report**

**Overall Assessment:** Your code structure is clear and logic is correct!

**Strengths:**
✅ Code formatting is standardized with consistent indentation
✅ Variable naming is semantic
✅ Functions have single responsibility and are easy to understand

**Improvement Suggestions:**
💡 Consider adding error handling mechanisms
💡 Consider using TypeScript for enhanced type safety
💡 Add unit tests to improve code quality

**Performance Optimization:**
⚡ Consider using useCallback to optimize React component performance
⚡ Avoid creating new objects during render

Keep up the good programming habits!`;
    }

    if (lowerMessage.includes('performance') || lowerMessage.includes('性能优化')) {
      return `⚡ **Performance Optimization Suggestions**

**Current Code Analysis:**
🔍 Detected optimizable items

**Optimization Solutions:**
1️⃣ **Memory Optimization**
   • Use React.memo to wrap components
   • Avoid unnecessary re-renders

2️⃣ **Loading Optimization**
   • Implement code splitting
   • Use lazy loading techniques

3️⃣ **Network Optimization**
   • Compress image resources
   • Enable Gzip compression

4️⃣ **Caching Strategy**
   • Use localStorage appropriately
   • Implement API response caching

**Expected Improvement:** Page load speed increased by 30-50%`;
    }

    if (lowerMessage.includes('deploy') || lowerMessage.includes('部署')) {
      return `🚀 **Deployment Solution Recommendations**

**Recommended Platforms:**
🌐 **Vercel** - First choice for React projects
• Zero-configuration deployment
• Automatic HTTPS
• Global CDN acceleration

🌐 **Netlify** - Static site hosting
• Continuous integration
• Form handling
• Serverless functions

**Deployment Steps:**
1️⃣ Build production version: \`npm run build\`
2️⃣ Connect Git repository
3️⃣ Configure build commands
4️⃣ Set environment variables
5️⃣ Domain binding

**Best Practices:**
✅ Configure CI/CD pipeline
✅ Set up monitoring and logging
✅ Implement blue-green deployment

Need specific platform deployment tutorials?`;
    }

    if (lowerMessage.includes('error') || lowerMessage.includes('bug') || lowerMessage.includes('issue') || lowerMessage.includes('错误') || lowerMessage.includes('问题')) {
      return `🐛 **Error Diagnosis Assistant**

**Common Issue Troubleshooting:**

🔍 **Syntax Errors**
• Check if brackets and quotes are matched
• Confirm variables are properly declared
• Verify import/export syntax

🔍 **Runtime Errors**
• Check browser console
• Verify network request status
• Confirm data type matching

🔍 **Style Issues**
• Check CSS selectors
• Confirm responsive design
• Verify browser compatibility

**Debugging Tips:**
💡 Use console.log() for debug output
💡 Utilize browser developer tools
💡 Add try-catch error handling

Please provide specific error information for targeted solutions!`;
    }

    // Default generic response
    return `🤖 **AI Programming Assistant**

I understand your question: "${message}"

**I can help you with:**
🔧 Code review and optimization
⚡ Performance analysis and improvements
🚀 Deployment configuration and guidance
🐛 Error troubleshooting and fixes
📚 Programming best practices
🎯 Project architecture design

**Quick Tips:**
• Type "code review" for code quality analysis
• Type "performance" for performance improvement suggestions
• Type "deploy" for deployment guidance
• Type "error" for debugging help

What specific questions do you need help with?`;
  } catch (error) {
    console.error('AI Chat Error:', error);
    return 'Sorry, AI service is temporarily unavailable. Please try again later.';
  }
};

// 语音合成服务
export const speakText = (text, options = {}) => {
  try {
    if ('speechSynthesis' in window) {
      // 取消之前的语音
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // 设置语音参数
      utterance.lang = options.lang || 'zh-CN';
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      // 语音合成
      speechSynthesis.speak(utterance);

      return true;
    } else {
      console.warn('Browser does not support speech synthesis');
      return false;
    }
  } catch (error) {
    console.error('Speech Synthesis Error:', error);
    return false;
  }
};

// 语音识别服务
export const startSpeechRecognition = (onResult, onError) => {
  try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Browser does not support speech recognition');
      onError && onError('Speech recognition not supported');
      return null;
    }

    const recognition = new SpeechRecognition();

    // 配置识别参数
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'zh-CN';

    // 设置事件监听
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult && onResult(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech Recognition Error:', event.error);
      onError && onError(event.error);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
    };

    // 开始识别
    recognition.start();

    return recognition;
  } catch (error) {
    console.error('Speech Recognition Error:', error);
    onError && onError(error.message);
    return null;
  }
};

export default {
  aiChat,
  speakText,
  startSpeechRecognition
};