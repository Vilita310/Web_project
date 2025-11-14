import React, { useState, useRef, useEffect } from 'react';
import { Button, Tooltip, Modal, Input, message } from 'antd';
import { SoundOutlined, SendOutlined, CameraOutlined, BugOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { aiChat } from '../../utils/aiApi';
import EnhancedMessage from './EnhancedMessage';

const AIAssistantCard = () => {
  const [micActive, setMicActive] = useState(true);
  const [demoInput, setDemoInput] = useState('');
  const { isDarkTheme } = useTheme();
  const { t, i18n } = useTranslation('home');
  const [showModal, setShowModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);

  // 初始化欢迎消息并监听语言变化
  useEffect(() => {
    setChatMessages([{
      id: 1,
      type: 'ai',
      content: t('ui.aiAssistantGreeting'),
      timestamp: new Date().toLocaleTimeString()
    }]);
  }, [t, i18n.language]);

  // 自动滚动到最新消息
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isAiTyping]);

  // 添加聊天消息
  const addChatMessage = (message) => {
    setChatMessages(prev => [...prev, {
      ...message,
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  // 处理发送消息
  const handleSendMessage = () => {
    if (!demoInput.trim() || isAiTyping) return;

    // 添加用户消息
    addChatMessage({
      type: 'user',
      content: demoInput.trim()
    });

    // 调用真实AI回复
    getRealAiResponse(demoInput.trim());

    // 清空输入框
    setDemoInput('');
  };

  // 真实AI回复
  const getRealAiResponse = async (userMessage) => {
    setIsAiTyping(true);

    try {
      // 构建对话上下文
      const context = t('ui.aiAssistantContext');

      // 构建增强的配置对象
      const chatConfig = {
        context: context,
        user_level: 'beginner', // 可以根据需要调整
        max_length: 300, // 控制回复长度
        page_url: window.location.href,
        page_type: 'ai_assistant_chat',
        recent_actions: [],
        language: 'zh-CN',
        detect_language: false
      };

      console.log('🤖 发送AI聊天请求:', { message: userMessage, config: chatConfig });

      // 调用真实AI API
      const response = await aiChat(userMessage, chatConfig);

      console.log('✅ AI回复成功:', response);

      // 添加AI回复消息
      addChatMessage({
        type: 'ai',
        content: response.response || response.text || '抱歉，我现在无法回复您的问题，请稍后再试。'
      });

    } catch (error) {
      console.error('❌ AI聊天错误:', error);

      // 发生错误时显示友好的错误消息
      addChatMessage({
        type: 'ai',
        content: '抱歉，AI服务暂时不可用。我会尝试用模拟回复来帮助您：\n\n' + getSimulatedResponse(userMessage)
      });

      message.error('AI服务暂时不可用，已切换到模拟模式');
    } finally {
      setIsAiTyping(false);
    }
  };

  // 备用的模拟回复函数（保留作为降级方案）
  const getSimulatedResponse = (userMessage) => {
    if (userMessage.includes('截图') || userMessage.includes('图片')) {
      return '我看到了你的截图！这是一个二叉树的遍历问题。让我来解释一下：\n\n1. 前序遍历：根 → 左 → 右\n2. 中序遍历：左 → 根 → 右\n3. 后序遍历：左 → 右 → 根\n\n这种题目的关键是理解递归结构。你想了解哪种遍历方式？';
    } else if (userMessage.includes('debug') || userMessage.includes('错误') || userMessage.includes('bug')) {
      return '让我帮你分析这个代码问题！\n\n常见的debug步骤：\n1. 检查语法错误\n2. 验证逻辑流程\n3. 添加日志输出\n4. 单步调试\n\n请告诉我具体的错误信息，我可以提供更精准的帮助。';
    } else if (userMessage.includes('算法') || userMessage.includes('algorithm')) {
      return '很好的算法问题！让我为你详细解释：\n\n算法学习的四个层次：\n1. 理解问题本质\n2. 设计解决方案\n3. 编码实现\n4. 优化性能\n\n你想深入了解哪个方面呢？';
    } else {
      return '这是一个很好的问题！基于你的描述，我建议从以下几个角度来分析：\n\n• 理解问题的核心要求\n• 寻找相似的模式\n• 设计测试用例\n• 逐步实现解决方案\n\n你需要我详细解释其中哪个部分吗？';
    }
  };

  // 处理截图AI功能
  const handleScreenshotAI = () => {
    // 添加用户截图消息
    addChatMessage({
      type: 'user',
      content: '我上传了一张截图，请帮我分析这个算法问题',
      imageData: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuS6jOWPieaggeetlOW8gOmimOezu+e7nzwvdGV4dD4KPC9zdmc+'
    });

    // 调用真实AI分析截图
    getRealAiResponse('我上传了一张截图，请帮我分析这个算法问题');
  };

  // 处理AI Debug功能
  const handleAIDebug = () => {
    // 添加用户debug请求消息
    addChatMessage({
      type: 'user',
      content: '我的代码有bug，能帮我debug吗？\n\n```python\ndef binary_search(arr, target):\n    left, right = 0, len(arr)\n    while left < right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid\n    return -1\n```'
    });

    // 调用真实AI debug分析
    getRealAiResponse('我的代码有bug，能帮我debug吗？这是一个二分查找的Python代码。');
  };

  return (
    // AI Assistant Card (drop-in replacement for "AI Voice Intelligence")
    <div style={{
      display: 'grid',
      gridTemplateColumns: '3.5fr 2.2fr',
      gap: '48px',
      alignItems: 'start',
      maxWidth: '1250px',
      margin: '80px auto',
      padding: '0 40px'
    }}>
      {/* 左侧：AI 助教对话预览 */}
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
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isDarkTheme ? '#58A6FF' : '#D4926F',
              animation: 'breathe 2s ease-in-out infinite'
            }} />
            <h3 style={{
              color: isDarkTheme ? '#F0F6FC' : '#A0783B',
              fontSize: '1.1rem',
              fontWeight: '600',
              margin: 0
            }}>{t('ui.aiAssistant')}</h3>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Tooltip title="Toggle microphone">
              <Button
                shape="circle"
                size="small"
                icon={<SoundOutlined />}
                onClick={() => setMicActive(!micActive)}
                style={{
                  background: micActive ? (isDarkTheme ? 'rgba(88, 166, 255, 0.2)' : 'rgba(160, 120, 59, 0.2)') : 'rgba(255,255,255,0.1)',
                  border: `1px solid ${micActive ? (isDarkTheme ? '#58A6FF' : '#D4926F') : 'rgba(255,255,255,0.2)'}`,
                  color: micActive ? (isDarkTheme ? '#58A6FF' : '#D4926F') : '#8B949E',
                  animation: micActive ? 'micPulse 1.5s ease-in-out infinite' : 'none'
                }}
              />
            </Tooltip>
            <Tooltip title="Copy demo question">
              <Button
                shape="circle"
                size="small"
                icon={<SendOutlined />}
                onClick={() => setDemoInput('Explain binary tree traversals with a diagram')}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#8B949E'
                }}
              />
            </Tooltip>
          </div>
        </div>

        {/* 消息区域 */}
        <div
          ref={chatContainerRef}
          style={{
            height: '340px',
            overflowY: 'auto',
            marginBottom: '16px',
            padding: '8px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.2) transparent'
          }}>
          {/* 渲染聊天消息 */}
          {chatMessages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                marginBottom: '16px',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                background: message.type === 'user'
                  ? 'rgba(96, 165, 250, 0.1)'
                  : (isDarkTheme ? 'rgba(88, 166, 255, 0.1)' : 'rgba(160, 120, 59, 0.1)'),
                border: message.type === 'user'
                  ? '1px solid rgba(96, 165, 250, 0.3)'
                  : (isDarkTheme ? '1px solid rgba(88, 166, 255, 0.3)' : '1px solid rgba(160, 120, 59, 0.3)'),
                borderRadius: message.type === 'user'
                  ? '16px 16px 4px 16px'
                  : '16px 16px 16px 4px',
                padding: '12px 16px',
                maxWidth: '80%',
                minWidth: '250px'
              }}>
                <div style={{
                  width: '100%',
                  maxWidth: '100%',
                  overflowWrap: 'break-word',
                  wordWrap: 'break-word',
                  wordBreak: 'break-word',
                  hyphens: 'auto'
                }}>
                  <EnhancedMessage
                    content={message.content}
                    type={message.type}
                  />
                </div>

                {/* 显示截图图片 */}
                {message.imageData && (
                  <div style={{ marginTop: '8px' }}>
                    <img
                      src={message.imageData}
                      alt="截图"
                      style={{
                        maxWidth: '200px',
                        maxHeight: '120px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    />
                  </div>
                )}

                <div style={{
                  fontSize: '11px',
                  color: '#8B949E',
                  marginTop: '4px',
                  textAlign: 'right'
                }}>
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* AI正在输入指示器 */}
          {isAiTyping && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: '8px'
            }}>
              <div style={{
                background: isDarkTheme ? 'rgba(88, 166, 255, 0.05)' : 'rgba(160, 120, 59, 0.05)',
                border: isDarkTheme ? '1px solid rgba(88, 166, 255, 0.2)' : '1px solid rgba(160, 120, 59, 0.2)',
                borderRadius: '16px 16px 16px 4px',
                padding: '12px 16px'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center'
                }}>
                  <span style={{
                    color: isDarkTheme ? '#58A6FF' : '#A0783B',
                    fontSize: '12px',
                    marginRight: '8px'
                  }}>AI正在思考...</span>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: isDarkTheme ? '#58A6FF' : '#A0783B',
                        animation: `typing ${0.6}s ease-in-out infinite`,
                        animationDelay: `${i * 0.2}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 输入区域 */}
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          marginRight: micActive ? '48px' : '0px' // 为右侧圆形图标留出空间
        }}>
          <Input
            placeholder={t('ui.askQuestionPlaceholder')}
            value={demoInput}
            onChange={(e) => setDemoInput(e.target.value)}
            onPressEnter={handleSendMessage}
            style={{
              background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
              border: isDarkTheme ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(160, 120, 59, 0.3)',
              borderRadius: '12px',
              color: isDarkTheme ? '#FFFFFF' : '#2D1810',
              '--placeholder-color': isDarkTheme ? '#FFFFFF' : '#2D1810'
            }}
            className="white-placeholder-input"
            disabled={isAiTyping}
          />
        </div>

        {/* 动态麦克风 - 双环旋转 */}
        {micActive && (
          <div style={{
            position: 'absolute',
            bottom: '4px',
            right: '16px',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'translateY(-50%)'
          }}>
            <div style={{
              position: 'absolute',
              width: '32px',
              height: '32px',
              border: isDarkTheme ? '2px solid rgba(88, 166, 255, 0.3)' : '2px solid rgba(160, 120, 59, 0.3)',
              borderTop: isDarkTheme ? '2px solid #58A6FF' : '2px solid #D4926F',
              borderRadius: '50%',
              animation: 'rotate 20s linear infinite'
            }} />
            <div style={{
              position: 'absolute',
              width: '24px',
              height: '24px',
              border: isDarkTheme ? '1px solid rgba(88, 166, 255, 0.5)' : '1px solid rgba(160, 120, 59, 0.5)',
              borderBottom: isDarkTheme ? '1px solid #58A6FF' : '1px solid #D4926F',
              borderRadius: '50%',
              animation: 'rotateReverse 15s linear infinite'
            }} />
            <div style={{
              width: '12px',
              height: '12px',
              background: isDarkTheme ? '#58A6FF' : '#D4926F',
              borderRadius: '50%',
              animation: 'breathe 2s ease-in-out infinite'
            }} />
          </div>
        )}
      </div>

      {/* 右侧：指标与特性 */}
      <div>
        {/* 四宫格指标 */}
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
              color: isDarkTheme ? '#58A6FF' : '#D4926F',
              marginBottom: '4px'
            }}>99.7%</div>
            <div style={{
              fontSize: '12px',
              color: '#8B949E',
              fontWeight: '600',
              marginBottom: '2px'
            }}>{t('ui.understanding')}</div>
            <div style={{
              fontSize: '11px',
              color: '#6B7280'
            }}>{t('ui.intentEntityPrecision')}</div>
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
            }}>&lt;50ms</div>
            <div style={{
              fontSize: '12px',
              color: '#8B949E',
              fontWeight: '600',
              marginBottom: '2px'
            }}>{t('ui.response')}</div>
            <div style={{
              fontSize: '11px',
              color: '#6B7280'
            }}>{t('ui.streamingFirstToken')}</div>
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
            }}>15+</div>
            <div style={{
              fontSize: '12px',
              color: '#8B949E',
              fontWeight: '600'
            }}>{t('ui.languages')}</div>
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
            }}>24/7</div>
            <div style={{
              fontSize: '12px',
              color: '#8B949E',
              fontWeight: '600'
            }}>{t('ui.availability')}</div>
          </div>
        </div>



        {/* AI工具按钮 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <Button
            size="large"
            className="ai-tool-button-override"
            style={{
              height: '48px',
              fontSize: '14px',
              fontWeight: '500',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '12px',
              color: isDarkTheme ? '#FFFFFF' : '#A0783B',
              fontFamily: 'SF Pro Display, -apple-system, sans-serif'
            }}
            onClick={handleScreenshotAI}
          >
            {t('ui.aiScreenshotQuestion')}
          </Button>

          <Button
            size="large"
            className="ai-tool-button-override"
            style={{
              height: '48px',
              fontSize: '14px',
              fontWeight: '500',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '12px',
              color: isDarkTheme ? '#FFFFFF' : '#A0783B',
              fontFamily: 'SF Pro Display, -apple-system, sans-serif'
            }}
            onClick={handleAIDebug}
          >
            {t('ui.aiCodeDebug')}
          </Button>
        </div>
      </div>

      {/* Modal */}
      <Modal
        title="AI Tutor Preview"
        open={showModal}
        onOk={() => setShowModal(false)}
        onCancel={() => setShowModal(false)}
        width={600}
        styles={{
          content: {
            background: isDarkTheme
              ? 'rgba(22, 27, 34, 0.95)'
              : 'rgba(160, 120, 59, 0.9)',
            border: '1px solid rgba(255,255,255,0.1)'
          },
          header: {
            background: 'transparent',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      >
        <div style={{ color: isDarkTheme ? '#F0F6FC' : '#2D1810', lineHeight: 1.6 }}>
          <h4 style={{ color: '#D4926F', marginBottom: '16px' }}>Binary Search Explanation</h4>
          <p>Binary search is a highly efficient algorithm for finding a specific element in a sorted array.
          Here's how it works:</p>

          <ol style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li><strong>Divide:</strong> Start by examining the middle element of the array.</li>
            <li><strong>Compare:</strong> If it matches your target, you're done! If the target is smaller,
            search the left half; if larger, search the right half.</li>
            <li><strong>Conquer:</strong> Repeat this process on the chosen half until you find the element
            or determine it doesn't exist.</li>
          </ol>

          <p><strong>Time Complexity:</strong> O(log n) - because we eliminate half of the remaining
          elements with each comparison.</p>

          <p><strong>Space Complexity:</strong> O(1) for iterative implementation, O(log n) for recursive
          due to the call stack.</p>
        </div>
      </Modal>

      <style jsx global>{`
        .white-placeholder-input input::placeholder {
          color: #FFFFFF !important;
          opacity: 1 !important;
        }

        .white-placeholder-input input {
          color: #FFFFFF !important;
        }

        .white-placeholder-input .ant-input::placeholder {
          color: #FFFFFF !important;
          opacity: 1 !important;
        }

        .white-placeholder-input .ant-input {
          color: #FFFFFF !important;
        }

        .ant-input.white-placeholder-input::placeholder {
          color: #FFFFFF !important;
          opacity: 1 !important;

        /* AI工具按钮颜色强制覆盖 - 最高优先级 */
        .ai-tool-button-override,
        .ai-tool-button-override.ant-btn,
        .ai-tool-button-override span,
        .ant-btn.ai-tool-button-override,
        .ant-btn.ai-tool-button-override span,
        .ai-tool-button-override *,
        button.ai-tool-button-override {
          color: #A0783B !important;
        }

        /* 深色主题下的AI工具按钮颜色 - 最高优先级 */
        .tech-theme .ai-tool-button-override,
        .tech-theme .ai-tool-button-override.ant-btn,
        .tech-theme .ai-tool-button-override span,
        .tech-theme .ant-btn.ai-tool-button-override,
        .tech-theme .ant-btn.ai-tool-button-override span,
        .tech-theme .ai-tool-button-override *,
        .tech-theme button.ai-tool-button-override,
        :global(.tech-theme) .ai-tool-button-override,
        :global(.tech-theme) .ai-tool-button-override.ant-btn,
        :global(.tech-theme) .ai-tool-button-override span,
        :global(.tech-theme) .ai-tool-button-override * {
          color: #FFFFFF !important;
        }

        /* 悬停状态也要保持正确颜色 - 浅色主题 */
        .ai-tool-button.ant-btn:hover,
        .ai-tool-button.ant-btn:hover span,
        .ant-btn.ai-tool-button:hover,
        .ant-btn.ai-tool-button:hover span {
          color: #A0783B !important;
        }

        /* 深色主题悬停状态 */
        .tech-theme .ai-tool-button.ant-btn:hover,
        .tech-theme .ai-tool-button.ant-btn:hover span,
        .tech-theme .ant-btn.ai-tool-button:hover,
        .tech-theme .ant-btn.ai-tool-button:hover span,
        :global(.tech-theme) .ai-tool-button.ant-btn:hover,
        :global(.tech-theme) .ai-tool-button.ant-btn:hover span {
          color: #FFFFFF !important;
        }

        .ant-input.white-placeholder-input {
          color: #FFFFFF !important;
        }

        input.white-placeholder-input::placeholder {
          color: #FFFFFF !important;
          opacity: 1 !important;
        }

        .white-placeholder-input::placeholder {
          color: var(--placeholder-color, #FFFFFF) !important;
          opacity: 1 !important;
        }

        .white-placeholder-input {
          color: #FFFFFF !important;
        }

        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }

        @keyframes micPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(160, 120, 59, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(160, 120, 59, 0); }
        }

        @keyframes typewriter {
          0% { width: 0; }
          100% { width: 100%; }
        }

        .typewriter {
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
          animation: typewriter 3s steps(60) 1s both;
        }

        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-8px); opacity: 1; }
        }

        @keyframes waveform {
          0% { height: 12px; opacity: 0.6; }
          50% { height: 20px; opacity: 1; }
          100% { height: 12px; opacity: 0.6; }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes rotateReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }

        @media (max-width: 1024px) {
          & > div:first-child {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AIAssistantCard;