import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Typography, Menu, Space, Button, Tooltip } from 'antd';
import './styles/techTheme.css';
import './pages/AlgorithmHub/lightTheme.css';
import './i18n'; // 导入i18n配置
import { UserProgressProvider } from './contexts/UserProgressContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ErrorBoundary from './components/core/ErrorBoundary';
// import AuthPage from './components/pages/AuthPage';
// import UserMenu from './components/UserMenu'; // 暂时移除
import LanguageSwitcher from './components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { initSecurity } from './utils/security';
import {
  HomeOutlined,
  CodeOutlined,
  BgColorsOutlined,
  UserOutlined
} from '@ant-design/icons';
import TechHomePage from './components/pages/TechHomePage';


// AI算法学习系统页面
import AlgorithmHub from './pages/AlgorithmHub';
import AIInteractiveClassroom from './pages/AIInteractiveClassroom';

// 模拟面试系统页面
import MockInterviewHub from './pages/MockInterviewHub';
import SmartInterviewSession from './pages/MockInterviewSession/SmartInterviewSession';



const { Header, Content } = Layout;
const { Title } = Typography;


function NavigationMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('common');

  // 菜单项 - 仅保留LeetCode算法学习
  const menuItems = [
    { key: '/', label: t('nav.home'), icon: <HomeOutlined /> },
    { key: '/algorithm-learning', label: t('nav.algorithmLearning'), icon: <CodeOutlined /> }
  ];

  const handleMenuClick = (e) => {
    // 只处理实际的路由，忽略分组键
    if (e.key.startsWith('/')) {
      navigate(e.key);
    }
  };

  return (
    <Menu
      mode="horizontal"
      items={menuItems}
      onClick={handleMenuClick}
      selectedKeys={[location.pathname]}
      style={{ border: 'none', flex: 1, justifyContent: 'center' }}
    />
  );
}

export default function App() {
  const { t } = useTranslation('common');

  // 初始化安全设置
  useEffect(() => {
    initSecurity();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <UserProgressProvider>
            <BrowserRouter>
              <AppLayout />
            </BrowserRouter>
          </UserProgressProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { isDarkTheme, toggleTheme, getThemeClass } = useTheme();

  // 不显示Header的页面
  const hideHeaderPages = ['/code-editor'];
  const shouldHideHeader = hideHeaderPages.includes(location.pathname);


  return (
    <div
      className={getThemeClass()}
      style={{
        background: isDarkTheme
          ? 'linear-gradient(135deg, #0a0e27 0%, #1a1d3e 50%, #2a2d4e 100%)'
          : '#FAF9F6',
        minHeight: '100vh'
      }}
    >
      <Layout style={{
        minHeight: '100vh',
        background: isDarkTheme
          ? 'linear-gradient(135deg, #0a0e27 0%, #1a1d3e 50%, #2a2d4e 100%)'
          : '#FAF9F6'
      }}>
        {!shouldHideHeader && (
          <Header className="minimal-header"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0 40px',
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              height: '80px',
              display: 'flex',
              alignItems: 'center'
            }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {/* 左侧品牌 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => navigate('/')}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
              tabIndex={0}
              role="button">
                <div style={{
                  width: 36,
                  height: 36,
                  background: isDarkTheme
                    ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 50%, #1E40AF 100%)'
                    : 'linear-gradient(135deg, #A0783B 0%, #B5704A 50%, #8B5A3C 100%)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                  boxShadow: isDarkTheme
                    ? '0 4px 20px rgba(59, 130, 246, 0.3)'
                    : '0 4px 20px rgba(160, 120, 59, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = isDarkTheme
                    ? '0 6px 25px rgba(59, 130, 246, 0.4)'
                    : '0 6px 25px rgba(160, 120, 59, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = isDarkTheme
                    ? '0 4px 20px rgba(59, 130, 246, 0.3)'
                    : '0 4px 20px rgba(160, 120, 59, 0.3)';
                }}>
                  <span style={{
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: 18,
                    fontFamily: 'SF Pro Display, -apple-system, sans-serif'
                  }}>L</span>
                </div>
                <span style={{
                  color: isDarkTheme ? '#F0F6FC' : '#2D1810',
                  fontSize: 22,
                  fontWeight: '700',
                  fontFamily: 'SF Pro Display, -apple-system, sans-serif',
                  background: isDarkTheme
                    ? 'linear-gradient(90deg, #F0F6FC, #3B82F6)'
                    : 'linear-gradient(90deg, #2D1810, #A0783B)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {t('brand.name')}
                </span>
              </div>

              {/* 中间导航 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: isDarkTheme
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.05)',
                border: isDarkTheme
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '50px',
                padding: '6px',
                backdropFilter: 'blur(20px)'
              }}>
                <Button
                  type="text"
                  icon={<HomeOutlined />}
                  onClick={() => navigate('/')}
                  style={{
                    color: location.pathname === '/'
                      ? (isDarkTheme ? '#F0F6FC' : '#2D1810')
                      : (isDarkTheme ? 'rgba(240, 246, 252, 0.7)' : 'rgba(45, 24, 16, 0.7)'),
                    background: location.pathname === '/'
                      ? (isDarkTheme ? 'rgba(59, 130, 246, 0.2)' : 'rgba(160, 120, 59, 0.2)')
                      : 'transparent',
                    border: 'none',
                    borderRadius: '24px',
                    padding: '8px 16px',
                    height: '40px',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== '/') {
                      e.target.style.color = isDarkTheme ? '#F0F6FC' : '#2D1810';
                      e.target.style.background = isDarkTheme
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== '/') {
                      e.target.style.color = isDarkTheme
                        ? 'rgba(240, 246, 252, 0.7)'
                        : 'rgba(45, 24, 16, 0.7)';
                      e.target.style.background = 'transparent';
                    }
                  }}>
                  {t('nav.home')}
                </Button>

                <Button
                  type="text"
                  icon={<CodeOutlined />}
                  onClick={() => navigate('/algorithm-learning')}
                  style={{
                    color: location.pathname === '/algorithm-learning'
                      ? (isDarkTheme ? '#F0F6FC' : '#2D1810')
                      : (isDarkTheme ? 'rgba(240, 246, 252, 0.7)' : 'rgba(45, 24, 16, 0.7)'),
                    background: location.pathname === '/algorithm-learning'
                      ? (isDarkTheme ? 'rgba(59, 130, 246, 0.2)' : 'rgba(160, 120, 59, 0.2)')
                      : 'transparent',
                    border: 'none',
                    borderRadius: '24px',
                    padding: '8px 16px',
                    height: '40px',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== '/algorithm-learning') {
                      e.target.style.color = isDarkTheme ? '#F0F6FC' : '#2D1810';
                      e.target.style.background = isDarkTheme
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== '/algorithm-learning') {
                      e.target.style.color = isDarkTheme
                        ? 'rgba(240, 246, 252, 0.7)'
                        : 'rgba(45, 24, 16, 0.7)';
                      e.target.style.background = 'transparent';
                    }
                  }}>
                  {t('nav.algorithmLearning')}
                </Button>

                <Button
                  type="text"
                  icon={<UserOutlined />}
                  onClick={() => navigate('/interview')}
                  style={{
                    color: location.pathname === '/interview'
                      ? (isDarkTheme ? '#F0F6FC' : '#2D1810')
                      : (isDarkTheme ? 'rgba(240, 246, 252, 0.7)' : 'rgba(45, 24, 16, 0.7)'),
                    background: location.pathname === '/interview'
                      ? (isDarkTheme ? 'rgba(59, 130, 246, 0.2)' : 'rgba(160, 120, 59, 0.2)')
                      : 'transparent',
                    border: 'none',
                    borderRadius: '24px',
                    padding: '8px 16px',
                    height: '40px',
                    fontWeight: '500',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== '/interview') {
                      e.target.style.color = isDarkTheme ? '#F0F6FC' : '#2D1810';
                      e.target.style.background = isDarkTheme
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== '/interview') {
                      e.target.style.color = isDarkTheme
                        ? 'rgba(240, 246, 252, 0.7)'
                        : 'rgba(45, 24, 16, 0.7)';
                      e.target.style.background = 'transparent';
                    }
                  }}>
                  {t('nav.interview')}
                </Button>
              </div>

              {/* 右侧工具 */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Tooltip title={isDarkTheme ? t('theme.switchToLight') : t('theme.switchToDark')}>
                  <Button
                    type="text"
                    icon={<BgColorsOutlined />}
                    onClick={toggleTheme}
                    style={{
                      color: isDarkTheme ? 'rgba(240, 246, 252, 0.7)' : 'rgba(45, 24, 16, 0.7)',
                      background: isDarkTheme
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.05)',
                      border: isDarkTheme
                        ? '1px solid rgba(255, 255, 255, 0.1)'
                        : '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = isDarkTheme ? '#F0F6FC' : '#2D1810';
                      e.target.style.background = isDarkTheme
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.1)';
                      e.target.style.borderColor = isDarkTheme
                        ? 'rgba(255, 255, 255, 0.2)'
                        : 'rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = isDarkTheme
                        ? 'rgba(240, 246, 252, 0.7)'
                        : 'rgba(45, 24, 16, 0.7)';
                      e.target.style.background = isDarkTheme
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.05)';
                      e.target.style.borderColor = isDarkTheme
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.1)';
                    }}
                  />
                </Tooltip>
                <LanguageSwitcher />
                {/* <UserMenu /> */}
              </div>
            </div>
          </Header>
        )}
        <Content
          className="tech-background"
          style={{
            padding: 0,
            paddingTop: shouldHideHeader ? 0 : '80px',
            background: isDarkTheme
              ? 'linear-gradient(135deg, #0a0e27 0%, #1a1d3e 50%, #2a2d4e 100%)'
              : '#FAF9F6'
          }}>
          <ErrorBoundary>
            <Routes>
              {/* 公开路由 */}
              <Route path="/" element={<TechHomePage />} />
              {/* <Route path="/auth" element={<AuthPage />} /> */}

              {/* 仅保留LeetCode算法学习路由 */}

              {/* AI算法学习系统路由 */}
              <Route path="/algorithm-learning" element={<AlgorithmHub />} />
              <Route path="/algorithm-learning/classroom/:chapterId/:patternId" element={<AIInteractiveClassroom />} />

              {/* 模拟面试路由 */}
              <Route path="/interview" element={<MockInterviewHub />} />
              <Route path="/interview/session/:problemId" element={<SmartInterviewSession />} />


              {/* Removed test routes */}
              <Route path="*" element={<TechHomePage />} />
            </Routes>
          </ErrorBoundary>
        </Content>
      </Layout>
    </div>
  );
}