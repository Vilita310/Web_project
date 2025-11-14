/**
 * 对话上下文管理器
 * 用于管理AI对话的上下文信息，提供更好的对话连续性
 */

class ConversationContext {
  constructor() {
    this.sessions = new Map(); // sessionId -> conversation data
    this.maxContextLength = 4000; // 最大上下文长度
    this.maxMessagesInContext = 10; // 最大消息数量
  }

  /**
   * 创建新的对话会话
   */
  createSession(sessionId, initialContext = {}) {
    const session = {
      id: sessionId,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      messages: [],
      context: {
        userLevel: 'intermediate',
        currentProject: null,
        currentFile: null,
        techStack: [],
        learningGoals: [],
        recentTopics: [],
        codeContext: '',
        ...initialContext
      },
      metadata: {
        totalMessages: 0,
        totalTokens: 0,
        topics: new Set(),
        languages: new Set()
      }
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * 获取或创建会话
   */
  getOrCreateSession(sessionId, initialContext = {}) {
    if (this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId);
      session.lastActiveAt = Date.now();
      return session;
    }
    return this.createSession(sessionId, initialContext);
  }

  /**
   * 更新会话上下文
   */
  updateContext(sessionId, contextUpdates) {
    const session = this.getOrCreateSession(sessionId);
    session.context = { ...session.context, ...contextUpdates };
    session.lastActiveAt = Date.now();

    // 提取技术栈和语言信息
    if (contextUpdates.currentFile) {
      const extension = contextUpdates.currentFile.split('.').pop();
      const languageMap = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'java': 'java',
        'cpp': 'cpp',
        'c': 'c',
        'go': 'go',
        'rs': 'rust',
        'php': 'php',
        'rb': 'ruby',
        'swift': 'swift',
        'kt': 'kotlin'
      };

      if (languageMap[extension]) {
        session.metadata.languages.add(languageMap[extension]);
      }
    }

    return session;
  }

  /**
   * 添加消息到对话历史
   */
  addMessage(sessionId, message) {
    const session = this.getOrCreateSession(sessionId);

    const messageObj = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: message.type, // 'user' | 'ai'
      content: message.content,
      timestamp: Date.now(),
      context: { ...session.context }, // 快照当前上下文
      metadata: message.metadata || {}
    };

    session.messages.push(messageObj);
    session.metadata.totalMessages++;
    session.lastActiveAt = Date.now();

    // 提取话题关键词
    this._extractTopics(messageObj.content, session);

    // 限制消息历史长度
    this._trimMessageHistory(session);

    return messageObj;
  }

  /**
   * 构建对话上下文字符串
   */
  buildContextString(sessionId, includeCodeContext = true) {
    const session = this.getOrCreateSession(sessionId);
    const context = session.context;

    const contextParts = [];

    // 基础上下文信息
    if (context.currentProject) {
      contextParts.push(`当前项目: ${context.currentProject}`);
    }

    if (context.currentFile) {
      contextParts.push(`当前文件: ${context.currentFile}`);
    }

    if (context.techStack && context.techStack.length > 0) {
      contextParts.push(`技术栈: ${context.techStack.join(', ')}`);
    }

    if (context.userLevel) {
      contextParts.push(`用户水平: ${context.userLevel}`);
    }

    if (context.learningGoals && context.learningGoals.length > 0) {
      contextParts.push(`学习目标: ${context.learningGoals.join(', ')}`);
    }

    // 最近话题
    if (context.recentTopics && context.recentTopics.length > 0) {
      contextParts.push(`最近讨论的话题: ${context.recentTopics.slice(-3).join(', ')}`);
    }

    // 代码上下文（如果需要且可用）
    if (includeCodeContext && context.codeContext) {
      const codeSnippet = context.codeContext.length > 300
        ? context.codeContext.substring(0, 300) + '...'
        : context.codeContext;
      contextParts.push(`代码上下文:\n${codeSnippet}`);
    }

    return contextParts.join('\n');
  }

  /**
   * 获取对话历史用于AI提示
   */
  getConversationHistory(sessionId, maxMessages = 5) {
    const session = this.getOrCreateSession(sessionId);

    // 获取最近的消息，但确保包含足够的上下文
    const recentMessages = session.messages.slice(-maxMessages);

    return recentMessages.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content,
      timestamp: msg.timestamp
    }));
  }

  /**
   * 分析对话模式和用户偏好
   */
  analyzeConversationPatterns(sessionId) {
    const session = this.getOrCreateSession(sessionId);

    const analysis = {
      totalMessages: session.metadata.totalMessages,
      averageMessageLength: 0,
      commonTopics: Array.from(session.metadata.topics).slice(0, 5),
      languages: Array.from(session.metadata.languages),
      conversationDuration: Date.now() - session.createdAt,
      lastActiveAt: session.lastActiveAt,
      userPatterns: {
        questionsAsked: 0,
        codeRequests: 0,
        explanationRequests: 0,
        debugRequests: 0
      }
    };

    // 分析用户消息模式
    const userMessages = session.messages.filter(msg => msg.type === 'user');

    if (userMessages.length > 0) {
      analysis.averageMessageLength = userMessages.reduce((sum, msg) => sum + msg.content.length, 0) / userMessages.length;

      userMessages.forEach(msg => {
        const content = msg.content.toLowerCase();
        if (content.includes('?') || content.includes('如何') || content.includes('怎么')) {
          analysis.userPatterns.questionsAsked++;
        }
        if (content.includes('代码') || content.includes('code') || content.includes('实现')) {
          analysis.userPatterns.codeRequests++;
        }
        if (content.includes('解释') || content.includes('为什么') || content.includes('原理')) {
          analysis.userPatterns.explanationRequests++;
        }
        if (content.includes('错误') || content.includes('bug') || content.includes('调试')) {
          analysis.userPatterns.debugRequests++;
        }
      });
    }

    return analysis;
  }

  /**
   * 清理过期会话
   */
  cleanupExpiredSessions(maxAge = 24 * 60 * 60 * 1000) { // 24小时
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActiveAt > maxAge) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * 提取话题关键词
   */
  _extractTopics(content, session) {
    // 简单的关键词提取（可以用更高级的NLP库替换）
    const techKeywords = [
      'javascript', 'python', 'java', 'react', 'vue', 'angular', 'node',
      'database', 'sql', 'api', 'frontend', 'backend', 'algorithm',
      'data structure', '数据结构', '算法', '前端', '后端', '数据库',
      'function', 'class', 'object', 'array', 'string', 'number',
      '函数', '类', '对象', '数组', '字符串', '数字'
    ];

    const words = content.toLowerCase().split(/\s+/);
    techKeywords.forEach(keyword => {
      if (content.toLowerCase().includes(keyword)) {
        session.metadata.topics.add(keyword);

        // 更新最近话题
        if (!session.context.recentTopics) {
          session.context.recentTopics = [];
        }

        const recentTopics = session.context.recentTopics;
        if (!recentTopics.includes(keyword)) {
          recentTopics.push(keyword);
          // 只保留最近5个话题
          if (recentTopics.length > 5) {
            recentTopics.shift();
          }
        }
      }
    });
  }

  /**
   * 限制消息历史长度
   */
  _trimMessageHistory(session) {
    if (session.messages.length > this.maxMessagesInContext) {
      // 保留系统重要消息和最近的消息
      const recentMessages = session.messages.slice(-this.maxMessagesInContext);
      session.messages = recentMessages;
    }

    // 检查总上下文长度
    const totalLength = session.messages.reduce((sum, msg) => sum + msg.content.length, 0);
    if (totalLength > this.maxContextLength) {
      // 移除最老的消息直到长度合适
      while (session.messages.length > 2 &&
             session.messages.reduce((sum, msg) => sum + msg.content.length, 0) > this.maxContextLength) {
        session.messages.shift();
      }
    }
  }

  /**
   * 导出会话数据（用于调试或分析）
   */
  exportSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return {
      ...session,
      metadata: {
        ...session.metadata,
        topics: Array.from(session.metadata.topics),
        languages: Array.from(session.metadata.languages)
      }
    };
  }

  /**
   * 获取所有活跃会话
   */
  getActiveSessions(maxAge = 60 * 60 * 1000) { // 1小时内活跃
    const now = Date.now();
    const activeSessions = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActiveAt <= maxAge) {
        activeSessions.push({
          sessionId,
          lastActiveAt: session.lastActiveAt,
          messageCount: session.metadata.totalMessages,
          topics: Array.from(session.metadata.topics).slice(0, 3)
        });
      }
    }

    return activeSessions.sort((a, b) => b.lastActiveAt - a.lastActiveAt);
  }
}

// 创建全局实例
const conversationContext = new ConversationContext();

// 定期清理过期会话
setInterval(() => {
  conversationContext.cleanupExpiredSessions();
}, 60 * 60 * 1000); // 每小时清理一次

export default conversationContext;