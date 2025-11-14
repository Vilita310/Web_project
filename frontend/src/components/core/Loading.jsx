import React from 'react';
import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

const Loading = ({
  size = 'large',
  text = '加载中...',
  style = {},
  fullScreen = false,
  className = ''
}) => {
  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: size === 'large' ? 48 : size === 'small' ? 16 : 24,
        color: 'var(--tech-primary)'
      }}
      spin
    />
  );

  const LoadingContent = () => (
    <div
      className={`${className} tech-loading`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        ...style
      }}
    >
      <Spin indicator={antIcon} />
      {text && (
        <Text className="tech-text-secondary" style={{ fontSize: 14 }}>
          {text}
        </Text>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(10, 14, 39, 0.8)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <LoadingContent />
      </div>
    );
  }

  return <LoadingContent />;
};

// 页面级别的Loading组件
export const PageLoading = ({ text = '页面加载中...' }) => (
  <div
    style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <Loading text={text} />
  </div>
);

// 按钮Loading组件
export const ButtonLoading = ({ text = '处理中...' }) => (
  <Loading size="small" text={text} style={{ padding: '8px 16px' }} />
);

// 卡片Loading组件
export const CardLoading = ({ text = '加载中...' }) => (
  <div
    style={{
      padding: '40px 20px',
      textAlign: 'center'
    }}
  >
    <Loading text={text} />
  </div>
);

export default Loading;