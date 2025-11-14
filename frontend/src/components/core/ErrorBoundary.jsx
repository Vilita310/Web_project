import React from 'react';
import { Result, Button } from 'antd';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="tech-theme" style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--tech-bg-primary)'
        }}>
          <Result
            status="error"
            title="应用发生错误"
            subTitle="抱歉，应用遇到了一个意外错误。请尝试刷新页面或返回首页。"
            extra={[
              <Button
                type="primary"
                key="reload"
                icon={<ReloadOutlined />}
                onClick={this.handleReload}
                className="tech-button"
              >
                刷新页面
              </Button>,
              <Button
                key="home"
                icon={<HomeOutlined />}
                onClick={this.handleGoHome}
                style={{ marginLeft: 8 }}
              >
                返回首页
              </Button>,
            ]}
            style={{ color: 'var(--tech-text-primary)' }}
          >
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div style={{
                textAlign: 'left',
                background: 'rgba(255,255,255,0.05)',
                padding: 16,
                borderRadius: 8,
                marginTop: 16,
                fontSize: 12,
                fontFamily: 'monospace',
                color: 'var(--tech-text-secondary)'
              }}>
                <details>
                  <summary style={{ cursor: 'pointer', marginBottom: 8 }}>
                    错误详情 (开发模式)
                  </summary>
                  <div style={{ color: '#ff6b6b' }}>
                    {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo && (
                    <div style={{ marginTop: 8, color: '#ffa500' }}>
                      {this.state.errorInfo.componentStack}
                    </div>
                  )}
                </details>
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;