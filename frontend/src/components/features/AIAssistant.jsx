import React, { useEffect, useState } from 'react';
import { Input, List, Avatar, Typography, Button, Tooltip, Badge, Spin } from 'antd';
import {
  CustomerServiceOutlined,
  AudioOutlined,
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  BulbOutlined,
  HistoryOutlined,
  SettingOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import EnhancedMessage from './EnhancedMessage';
import conversationContext from '../../utils/conversationContext';

const { Text } = Typography;

const AIAssistant = ({
  aiMessages,
  aiInput,
  setAiInput,
  sendAiMessage,
  isListening,
  startListening,
  stopListening,
  supportsSpeech,
  addAiMessage,
  sessionId = 'default',
  contextData = {},
  isAiLoading = false
}) => {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [contextSummary, setContextSummary] = useState('');

  // 初始化或更新会话上下文
  useEffect(() => {
    if (sessionId && contextData) {
      const session = conversationContext.getOrCreateSession(sessionId, {
        userLevel: 'intermediate',
        ...contextData
      });
      setSessionInfo(session);

      // 构建上下文摘要
      const summary = conversationContext.buildContextString(sessionId, false);
      setContextSummary(summary);
    }
  }, [sessionId, contextData]);

  // 监听消息变化，同步到上下文管理器
  useEffect(() => {
    if (sessionId && aiMessages.length > 0) {
      const lastMessage = aiMessages[aiMessages.length - 1];
      if (lastMessage && !lastMessage._synced) {
        conversationContext.addMessage(sessionId, lastMessage);
        // 标记为已同步，避免重复添加
        lastMessage._synced = true;
      }
    }
  }, [aiMessages, sessionId]);

  // 获取对话统计信息
  const getConversationStats = () => {
    if (!sessionId) return null;
    return conversationContext.analyzeConversationPatterns(sessionId);
  };

  return (
    <div style={{
      height: '280px',
      background: '#252526',
      borderRadius: '8px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      {/* Title bar - VS Code style */}
      <div style={{
        padding: '8px 12px',
        background: '#2d2d30',
        borderBottom: '1px solid #3e3e42',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <RobotOutlined style={{ color: '#007acc', fontSize: '14px' }} />
        <Text style={{
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.6)',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", monospace'
        }}>
          AI 助教
        </Text>

        {/* Context indicator */}
        {sessionInfo && (
          <Tooltip title={contextSummary || "对话上下文"}>
            <Badge count={sessionInfo.metadata.totalMessages} size="small">
              <HistoryOutlined
                style={{
                  color: 'rgba(255, 255, 255, 0.4)',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              />
            </Badge>
          </Tooltip>
        )}

        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#52c41a',
          marginLeft: 'auto'
        }} />
      </div>

      {/* Chat message area */}
      <div style={{
        height: '230px',
        padding: '8px',
        overflowY: 'auto',
        background: '#1e1e1e'
      }}>
        <style jsx="true">{`
          div::-webkit-scrollbar {
            width: 6px;
          }
          div::-webkit-scrollbar-track {
            background: #252526;
          }
          div::-webkit-scrollbar-thumb {
            background: #555;
            border-radius: 3px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background: #777;
          }
        `}</style>
        <List
          size="small"
          dataSource={aiMessages}
          renderItem={(msg, index) => (
            <List.Item style={{
              border: 'none',
              padding: '4px 0',
              alignItems: 'flex-start',
              margin: '4px 0'
            }}>
              <div style={{
                display: 'flex',
                width: '100%',
                justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  background: msg.type === 'user'
                    ? 'linear-gradient(135deg, #007bff, #0056b3)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                  padding: '12px 16px',
                  borderRadius: '20px',
                  border: msg.type === 'user'
                    ? 'none'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  maxWidth: '85%',
                  boxShadow: msg.type === 'user'
                    ? '0 4px 12px rgba(0, 123, 255, 0.3)'
                    : '0 4px 12px rgba(0, 0, 0, 0.2)',
                  backdropFilter: msg.type === 'ai' ? 'blur(10px)' : 'none'
                }}>
                  {msg.isTyping ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#ffffff'
                    }}>
                      <Spin
                        indicator={<LoadingOutlined style={{ fontSize: 14, color: '#ffffff' }} />}
                        size="small"
                      />
                      <Text style={{ color: '#ffffff', fontSize: '14px' }}>
                        AI正在思考中...
                      </Text>
                    </div>
                  ) : msg.isStreaming ? (
                    <div style={{ position: 'relative' }}>
                      <EnhancedMessage content={msg.content} type={msg.type} />
                      <span
                        style={{
                          color: '#ffffff',
                          marginLeft: '2px',
                          animation: 'blink 1s infinite',
                          fontWeight: 'bold'
                        }}
                      >
                        |
                      </span>
                      <style>{`
                        @keyframes blink {
                          0%, 50% { opacity: 1; }
                          51%, 100% { opacity: 0; }
                        }
                      `}</style>
                    </div>
                  ) : (
                    <EnhancedMessage content={msg.content} type={msg.type} />
                  )}
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>


      {/* Input area */}
      <div style={{
        padding: '8px',
        background: '#1e1e1e',
        borderTop: '1px solid #3e3e42',
        display: 'flex',
        gap: '4px'
      }}>
        <Input
          value={aiInput}
          onChange={(e) => setAiInput(e.target.value)}
          placeholder={isListening ? "🎤 Listening..." : "Ask AI assistant..."}
          size="small"
          style={{
            background: '#3c3c3c',
            border: '1px solid #555',
            color: 'rgba(255, 255, 255, 0.87)',
            fontSize: '11px',
            borderRadius: '4px',
            fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", monospace'
          }}
          onPressEnter={sendAiMessage}
          disabled={isListening}
        />
        {supportsSpeech && (
          <Button
            size="small"
            onClick={isListening ? stopListening : startListening}
            icon={isListening ? <CustomerServiceOutlined /> : <AudioOutlined />}
            style={{
              background: isListening ? '#fa8c16' : '#3c3c3c',
              border: '1px solid #555',
              color: isListening ? '#fff' : 'rgba(255, 255, 255, 0.6)',
              width: '28px',
              borderRadius: '4px'
            }}
          />
        )}
        <Button
          size="small"
          onClick={sendAiMessage}
          disabled={isAiLoading || !aiInput.trim()}
          loading={isAiLoading}
          icon={!isAiLoading && <SendOutlined />}
          style={{
            background: (aiInput.trim() && !isAiLoading) ? '#007acc' : '#3c3c3c',
            border: '1px solid #555',
            color: (aiInput.trim() && !isAiLoading) ? '#fff' : 'rgba(255, 255, 255, 0.6)',
            width: '28px',
            borderRadius: '4px'
          }}
        />
      </div>
    </div>
  );
};

export default React.memo(AIAssistant);