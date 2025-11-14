import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';
import EnhancedMessage from './EnhancedMessage';

const { Text } = Typography;

/**
 * 流式消息显示组件
 * 支持打字机效果的消息渲染
 */
const StreamingMessage = ({
  content,
  isStreaming,
  onStreamComplete,
  type = 'ai'
}) => {
  const [displayContent, setDisplayContent] = useState('');
  const [showCursor, setShowCursor] = useState(false);

  useEffect(() => {
    if (isStreaming) {
      setDisplayContent(content);
      setShowCursor(true);
    } else {
      setDisplayContent(content);
      setShowCursor(false);
      onStreamComplete && onStreamComplete(content);
    }
  }, [content, isStreaming, onStreamComplete]);

  // 光标闪烁效果
  useEffect(() => {
    if (!showCursor) return;

    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, [showCursor, isStreaming]);

  return (
    <div style={{ position: 'relative' }}>
      <EnhancedMessage content={displayContent} type={type} />
      {isStreaming && (
        <span
          style={{
            color: '#ffffff',
            marginLeft: '2px',
            opacity: showCursor ? 1 : 0,
            transition: 'opacity 0.1s ease',
            fontWeight: 'bold'
          }}
        >
          |
        </span>
      )}
    </div>
  );
};

export default StreamingMessage;