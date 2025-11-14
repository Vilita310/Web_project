import React, { useState, useEffect } from 'react';
import { Typography, Button, Card, Row, Col, Progress, Tag, Badge, Statistic, Divider, Input, Modal } from 'antd';
import {
  RocketOutlined,
  PlayCircleOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  StarOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  SoundOutlined,
  EditOutlined,
  CustomerServiceOutlined,
  BulbOutlined,
  CodeOutlined,
  BookOutlined,
  FireOutlined,
  CrownOutlined,
  TeamOutlined,
  RobotOutlined,
  SendOutlined,
  MenuOutlined,
  CloseOutlined,
  CameraOutlined,
  BugOutlined,
  PictureOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

// Import AI functional components
import AIVoiceChat from '../core/AIVoiceChat';
import AIBlackboard from '../core/AIBlackboard';
import AIAssistantCard from '../features/AIAssistantCard';
import AIBlackboardCard from '../features/AIBlackboardCard';
import AIInterviewCard from '../features/AIInterviewCard';
import AIToolsCard from '../features/AIToolsCard';
import ImpactMetricsSection from '../features/ImpactMetricsSection';
import Footer from '../layout/Footer';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Paragraph, Text } = Typography;

const TechHomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation('home');
  const { isDarkTheme, getThemeClass } = useTheme();

  // AI components states
  const [activeVoiceChat, setActiveVoiceChat] = useState(false);

  // 处理AI功能
  const handleScreenshotAI = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // 处理截图问AI逻辑
        console.log('上传截图:', file);
      }
    };
    input.click();
  };

  const handleAIDebug = () => {
    // 跳转到AI debug页面
    navigate('/ai-debug');
  };

  // 真实项目数据 - 基于开源项目实际情况
  const projectStats = {
    githubStars: '1.2k',    // GitHub星标数
    totalProblems: 75,      // LeetCode 75题库
    aiFeatures: 4,          // AI功能模块数
    completionRate: '92%'   // 项目完成度
  };

  // LeetCode 75核心数据
  const leetcodeStats = {
    totalProblems: 75,
    patterns: 15,
    avgDays: 30,
    successRate: 94
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: isDarkTheme
        ? 'linear-gradient(135deg, #0a0e27 0%, #1a1d3e 50%, #2a2d4e 100%)'
        : '#F5F1E8'
    }}>
      {/* Hero 主区块 - 现代科技感背景 */}
      <div style={{
        height: '90vh',
        background: isDarkTheme ? `
          linear-gradient(135deg, #0B1426 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0B1426 100%),` :
          `#F5F1E8,
          radial-gradient(circle at 20% 80%, rgba(160, 120, 59, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(181, 112, 74, 0.06) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(139, 90, 60, 0.04) 0%, transparent 50%)
        `,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 40px'
      }}>

        {/* 动态光球背景 */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: isDarkTheme
            ? 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.1) 40%, transparent 70%)'
            : 'radial-gradient(circle, rgba(160, 120, 59, 0.15) 0%, rgba(160, 120, 59, 0.08) 40%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'float 6s ease-in-out infinite'
        }} />

        <div style={{
          position: 'absolute',
          top: '50%',
          right: '15%',
          width: '200px',
          height: '200px',
          background: isDarkTheme
            ? 'radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%)'
            : 'radial-gradient(circle, rgba(181, 112, 74, 0.2) 0%, rgba(181, 112, 74, 0.1) 40%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          animation: 'float 4s ease-in-out infinite reverse'
        }} />

        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '20%',
          width: '150px',
          height: '150px',
          background: isDarkTheme
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.1) 40%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139, 90, 60, 0.25) 0%, rgba(139, 90, 60, 0.12) 40%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(30px)',
          animation: 'float 5s ease-in-out infinite'
        }} />

        {/* 流动星空背景 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: isDarkTheme ? `
            radial-gradient(2px 2px at 20px 30px, rgba(99, 102, 241, 0.7), transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(139, 92, 246, 0.5), transparent),
            radial-gradient(1px 1px at 90px 40px, rgba(59, 130, 246, 0.8), transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(99, 102, 241, 0.6), transparent),
            radial-gradient(2px 2px at 160px 30px, rgba(139, 92, 246, 0.4), transparent)
          ` : `
            radial-gradient(2px 2px at 20px 30px, rgba(160, 120, 59, 0.4), transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(181, 112, 74, 0.3), transparent),
            radial-gradient(1px 1px at 90px 40px, rgba(139, 90, 60, 0.5), transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(160, 120, 59, 0.35), transparent),
            radial-gradient(2px 2px at 160px 30px, rgba(181, 112, 74, 0.25), transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 100px',
          animation: 'starMove 20s linear infinite',
          opacity: 0.6,
          pointerEvents: 'none'
        }} />

        {/* 光晕波纹效果 */}
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          border: isDarkTheme ? '1px solid rgba(99, 102, 241, 0.1)' : '1px solid rgba(160, 120, 59, 0.08)',
          animation: 'ripple 8s ease-in-out infinite'
        }} />

        <div style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          border: isDarkTheme ? '1px solid rgba(139, 92, 246, 0.08)' : '1px solid rgba(181, 112, 74, 0.06)',
          animation: 'ripple 12s ease-in-out infinite 2s'
        }} />

        <div style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '1000px',
          height: '1000px',
          borderRadius: '50%',
          border: isDarkTheme ? '1px solid rgba(59, 130, 246, 0.06)' : '1px solid rgba(139, 90, 60, 0.05)',
          animation: 'ripple 15s ease-in-out infinite 4s'
        }} />

        {/* 动态粒子点 */}
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '12%',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: isDarkTheme ? 'rgba(99, 102, 241, 0.9)' : 'rgba(160, 120, 59, 0.7)',
          boxShadow: isDarkTheme ? '0 0 20px rgba(99, 102, 241, 0.7), 0 0 40px rgba(99, 102, 241, 0.3)' : '0 0 15px rgba(160, 120, 59, 0.5), 0 0 25px rgba(160, 120, 59, 0.2)',
          animation: 'pulse 3s ease-in-out infinite'
        }} />

        <div style={{
          position: 'absolute',
          top: '60%',
          left: '15%',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          background: isDarkTheme ? 'rgba(139, 92, 246, 0.9)' : 'rgba(181, 112, 74, 0.8)',
          boxShadow: isDarkTheme ? '0 0 15px rgba(139, 92, 246, 0.6), 0 0 30px rgba(139, 92, 246, 0.3)' : '0 0 12px rgba(181, 112, 74, 0.5), 0 0 20px rgba(181, 112, 74, 0.2)',
          animation: 'pulse 2.5s ease-in-out infinite 1s'
        }} />

        <div style={{
          position: 'absolute',
          top: '35%',
          left: '25%',
          width: '3px',
          height: '3px',
          borderRadius: '50%',
          background: isDarkTheme ? 'rgba(59, 130, 246, 0.8)' : 'rgba(139, 90, 60, 0.7)',
          boxShadow: isDarkTheme ? '0 0 12px rgba(59, 130, 246, 0.5)' : '0 0 10px rgba(139, 90, 60, 0.4)',
          animation: 'pulse 2s ease-in-out infinite 0.5s'
        }} />

        {/* 发光线条 */}
        <div style={{
          position: 'absolute',
          top: '25%',
          right: '20%',
          width: '120px',
          height: '2px',
          background: isDarkTheme
            ? 'linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.6) 50%, transparent 100%)'
            : 'linear-gradient(90deg, transparent 0%, rgba(160, 120, 59, 0.4) 50%, transparent 100%)',
          transform: 'rotate(35deg)',
          filter: 'blur(1px)',
          animation: 'shimmer 4s ease-in-out infinite'
        }} />

        <div style={{
          position: 'absolute',
          bottom: '35%',
          left: '18%',
          width: '80px',
          height: '2px',
          background: isDarkTheme
            ? 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.7) 50%, transparent 100%)'
            : 'linear-gradient(90deg, transparent 0%, rgba(181, 112, 74, 0.5) 50%, transparent 100%)',
          transform: 'rotate(-25deg)',
          filter: 'blur(1px)',
          animation: 'shimmer 3s ease-in-out infinite 1.5s'
        }} />

        {/* 几何形状装饰 */}
        <div style={{
          position: 'absolute',
          top: '18%',
          left: '8%',
          width: '24px',
          height: '24px',
          background: isDarkTheme
            ? 'rgba(99, 102, 241, 0.15)'
            : 'rgba(160, 120, 59, 0.12)',
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          boxShadow: isDarkTheme
            ? '0 0 15px rgba(99, 102, 241, 0.3)'
            : '0 0 12px rgba(160, 120, 59, 0.2)',
          animation: 'rotate 20s linear infinite'
        }} />

        <div style={{
          position: 'absolute',
          bottom: '30%',
          right: '25%',
          width: '18px',
          height: '18px',
          background: isDarkTheme
            ? 'rgba(139, 92, 246, 0.2)'
            : 'rgba(181, 112, 74, 0.15)',
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          boxShadow: isDarkTheme
            ? '0 0 12px rgba(139, 92, 246, 0.4)'
            : '0 0 10px rgba(181, 112, 74, 0.25)',
          animation: 'float 4s ease-in-out infinite'
        }} />

        <div style={{
          position: 'absolute',
          top: '45%',
          right: '8%',
          width: '16px',
          height: '16px',
          background: isDarkTheme
            ? 'rgba(59, 130, 246, 0.18)'
            : 'rgba(139, 90, 60, 0.14)',
          borderRadius: '2px',
          boxShadow: isDarkTheme
            ? '0 0 10px rgba(59, 130, 246, 0.4)'
            : '0 0 8px rgba(139, 90, 60, 0.3)',
          animation: 'float 3s ease-in-out infinite reverse'
        }} />

        {/* 内容区域 */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '800px'
        }}>

          {/* 主标题 */}
          <Title level={1} style={{
            fontSize: isDarkTheme
              ? 'clamp(3.5rem, 8vw, 4.8rem)'
              : 'clamp(3rem, 7vw, 4.2rem)',
            fontWeight: '700',
            color: isDarkTheme ? '#F0F6FC' : '#2D1810',
            marginTop: '120px',
            marginBottom: '32px',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            fontFamily: 'SF Pro Display, -apple-system, sans-serif',
            background: isDarkTheme
              ? 'linear-gradient(135deg, #F0F6FC 0%, #58A6FF 50%, #A5A3FF 100%)'
              : 'linear-gradient(90deg, #A0783B, #B5704A, #8B5A3C)',
            backgroundSize: '200% 100%',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradientFlow 28s linear infinite',
            textShadow: isDarkTheme ? '0 0 20px rgba(88, 166, 255, 0.2), 0 0 40px rgba(165, 163, 255, 0.1)' : '0 1px 2px rgba(0, 0, 0, 0.3)',
          }}>
{t('hero.title')}
          </Title>

          {/* 副标题 */}
          <Paragraph style={{
            fontSize: 'clamp(1.2rem, 3vw, 1.5rem)',
            color: isDarkTheme ? '#A2A8B4' : '#5A5A5A',
            marginTop: '40px',
            marginBottom: '64px',
            fontWeight: '500',
            lineHeight: 1.8,
            fontFamily: 'SF Pro Display, -apple-system, sans-serif',
          }}>
{t('hero.subtitle')}
          </Paragraph>


          {/* CTA 按钮区 */}
          <div style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: '48px'
          }}>
            <Button
              type="primary"
              size="large"
              style={{
                height: '56px',
                fontSize: '16px',
                fontWeight: '600',
                padding: '0 32px',
                background: isDarkTheme
                  ? 'linear-gradient(135deg, #58A6FF 0%, #A5A3FF 100%)'
                  : 'rgba(160, 120, 59, 0.9)',
                border: 'none',
                borderRadius: '28px',
                boxShadow: isDarkTheme
                  ? '0 8px 24px rgba(88, 166, 255, 0.3)'
                  : '0 8px 24px rgba(212, 146, 111, 0.3)',
                minWidth: '200px',
                fontFamily: 'SF Pro Display, -apple-system, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = isDarkTheme
                  ? '0 12px 32px rgba(88, 166, 255, 0.4)'
                  : '0 12px 32px rgba(212, 146, 111, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = isDarkTheme
                  ? '0 8px 24px rgba(88, 166, 255, 0.3)'
                  : '0 8px 24px rgba(212, 146, 111, 0.3)';
              }}
              onClick={() => navigate('/smart-coding-lab')}
            >
{t('buttons.startAIExperience')}
            </Button>

            <Button
              size="large"
              style={{
                height: '56px',
                fontSize: '16px',
                fontWeight: '600',
                padding: '0 32px',
                background: isDarkTheme
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(212, 146, 111, 0.1)',
                border: isDarkTheme
                  ? '1px solid rgba(255, 255, 255, 0.2)'
                  : '1px solid rgba(212, 146, 111, 0.2)',
                borderRadius: '28px',
                color: isDarkTheme ? '#F0F6FC' : '#A0783B',
                minWidth: '200px',
                fontFamily: 'SF Pro Display, -apple-system, sans-serif',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.background = isDarkTheme
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'rgba(212, 146, 111, 0.15)';
                e.target.style.borderColor = isDarkTheme
                  ? 'rgba(255, 255, 255, 0.3)'
                  : 'rgba(212, 146, 111, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.background = isDarkTheme
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(212, 146, 111, 0.1)';
                e.target.style.borderColor = isDarkTheme
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'rgba(212, 146, 111, 0.2)';
              }}
              onClick={() => navigate('/algorithm-hub')}
            >
{t('buttons.viewLearningResults')}
            </Button>
          </div>


        </div>

        {/* 底部渐变过渡 */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: isDarkTheme
            ? 'linear-gradient(to bottom, transparent 0%, rgba(10, 14, 39, 0.1) 15%, rgba(10, 14, 39, 0.3) 35%, rgba(26, 29, 62, 0.6) 60%, rgba(26, 29, 62, 0.85) 80%, #1a1d3e 100%)'
            : 'linear-gradient(to bottom, transparent 0%, rgba(245, 241, 232, 0.1) 15%, rgba(245, 241, 232, 0.3) 35%, rgba(245, 241, 232, 0.6) 60%, rgba(245, 241, 232, 0.85) 80%, #F5F1E8 100%)',
          pointerEvents: 'none',
          zIndex: 5
        }} />

      </div>

      {/* 间距区域 */}
      <div style={{ height: '60px' }} />

      {/* 用户成长数据展示 */}
      <ImpactMetricsSection
        data={{
          salaryIncreaseYearly: 25000,
          offersGained: 850,
          passRateLiftPct: 85,
          studyTimeReducedPct: 60
        }}
      />

      {/* 主要内容区 */}
      <div style={{
        maxWidth: '1350px',
        margin: '0 auto',
        padding: '80px 24px 120px',
        background: isDarkTheme ? 'rgba(22, 27, 34, 1)' : '#F5F1E8'
      }}>

        {/* 解决学习痛点的AI方案 */}
        <div style={{ marginBottom: '120px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <Title level={2} style={{
              fontSize: '2.3rem',
              color: isDarkTheme ? 'white !important' : '#A0783B !important',
              marginBottom: '16px',
              fontWeight: 'bold'
            }} className="section-title-override">
{t('ui.aiFeaturesExperience')}
            </Title>
            <p style={{
              fontSize: '1.1rem',
              color: isDarkTheme ? 'rgba(255,255,255,0.7)' : '#5A5A5A',
              maxWidth: '600px',
              margin: '0 auto',
              display: 'block',
              fontWeight: '400'
            }} className="subtitle-override">
{t('ui.aiFeaturesDescription')}
            </p>
          </div>

          {/* AI功能实体组件展示 - 横向布局 */}
          <div style={{ width: '100%', marginBottom: '0px' }}>

            {/* 第一个：AI智能黑板卡片 */}
            <AIBlackboardCard />

            {/* 第二个：AI面试官卡片 */}
            <AIInterviewCard />

            {/* AI工具助手卡片 */}
            <AIToolsCard />

            {/* 第三个：AI助教卡片 */}
            <AIAssistantCard />

          </div>

          {/* 学习路径规划模块 */}
          <div style={{
            width: '100vw',
            margin: '100px 0 0',
            marginLeft: '50%',
            transform: 'translateX(-50%)',
            padding: '80px 0 0',
            background: isDarkTheme ? 'rgba(22, 27, 34, 0.95)' : '#F5F1E8',
            position: 'relative'
          }}>
            <div style={{
              maxWidth: '1350px',
              margin: '0 auto',
              padding: '0 40px'
            }}>
              {/* 标题区域 */}
              <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h2 style={{
                  fontSize: '2.5rem',
                  color: isDarkTheme ? '#F0F6FC' : '#2D1810',
                  marginBottom: '16px',
                  fontWeight: '700',
                  background: isDarkTheme
                    ? 'linear-gradient(90deg, #58A6FF, #A5A3FF, #F0F6FC)'
                    : 'linear-gradient(90deg, #A0783B, #B5704A, #8B5A3C)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>{t('ui.master30DaysCore')}</h2>
                <p style={{
                  fontSize: '1.2rem',
                  color: isDarkTheme ? '#A2A8B4' : '#5A5A5A',
                  fontWeight: '500'
                }}>{t('ui.learningPathDescription')}</p>
              </div>

              {/* 学习路径展示 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '70% 30%',
                gap: '48px',
                alignItems: 'start'
              }}>

                {/* 左侧：定制学习路线 */}
                <div style={{
                  background: isDarkTheme ? 'rgba(88, 166, 255, 0.1)' : 'rgba(160, 120, 59, 0.08)',
                  border: isDarkTheme ? '1px solid rgba(88, 166, 255, 0.2)' : '1px solid rgba(160, 120, 59, 0.25)',
                  borderRadius: '20px',
                  padding: '40px 32px 20px'
                }}>
                  <h3 style={{
                    color: isDarkTheme ? '#F0F6FC' : '#2D1810',
                    fontSize: '1.3rem',
                    marginBottom: '24px',
                    fontWeight: '600',
                    textAlign: 'center'
                  }}>{t('ui.customLearningPath')}</h3>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{
                      background: isDarkTheme ? 'rgba(88, 166, 255, 0.1)' : 'rgba(160, 120, 59, 0.1)',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ color: isDarkTheme ? '#58A6FF' : '#A0783B', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        {t('ui.basicAlgorithms')}
                      </div>
                      <div style={{ color: isDarkTheme ? '#F0F6FC' : '#2D1810', fontSize: '13px', marginBottom: '8px' }}>
                        {t('ui.thirtyDayStudy')}
                      </div>
                      <div style={{ color: isDarkTheme ? '#8B949E' : '#5A5A5A', fontSize: '11px' }}>
                        {t('ui.basicDescription')}
                      </div>
                    </div>

                    <div style={{
                      background: isDarkTheme ? 'rgba(88, 166, 255, 0.1)' : 'rgba(160, 120, 59, 0.1)',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ color: isDarkTheme ? '#58A6FF' : '#A0783B', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        {t('ui.interviewAlgorithms')}
                      </div>
                      <div style={{ color: isDarkTheme ? '#F0F6FC' : '#2D1810', fontSize: '13px', marginBottom: '8px' }}>
                        {t('ui.twentyOneDayTraining')}
                      </div>
                      <div style={{ color: isDarkTheme ? '#8B949E' : '#5A5A5A', fontSize: '11px' }}>
                        {t('ui.interviewDescription')}
                      </div>
                    </div>
                  </div>

                  <button style={{
                    width: '100%',
                    padding: '12px',
                    background: isDarkTheme
                      ? 'linear-gradient(135deg, #58A6FF, #3b82f6)'
                      : 'rgba(160, 120, 59, 0.9)',
                    border: 'none',
                    borderRadius: '12px',
                    color: isDarkTheme ? '#FFF' : '#2D1810',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = isDarkTheme
                      ? '0 8px 20px rgba(88, 166, 255, 0.3)'
                      : '0 8px 20px rgba(160, 120, 59, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}>
                    {t('ui.startCustomLearning')}
                  </button>
                </div>


                {/* 右侧：AI个性化推荐 */}
                <div style={{
                  background: isDarkTheme ? 'rgba(165, 163, 255, 0.1)' : 'rgba(107, 139, 99, 0.08)',
                  border: isDarkTheme ? '1px solid rgba(165, 163, 255, 0.2)' : '1px solid rgba(107, 139, 99, 0.25)',
                  borderRadius: '20px',
                  padding: '40px 32px 20px'
                }}>
                  <h3 style={{
                    color: isDarkTheme ? '#F0F6FC' : '#2D1810',
                    fontSize: '1.3rem',
                    marginBottom: '24px',
                    fontWeight: '600',
                    textAlign: 'center'
                  }}>{t('ui.aiRecommendations')}</h3>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{
                      background: isDarkTheme ? 'rgba(165, 163, 255, 0.1)' : 'rgba(107, 139, 99, 0.1)',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ color: isDarkTheme ? '#A5A3FF' : '#A0783B', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        {t('ui.recommendedForYou')}
                      </div>
                      <div style={{ color: isDarkTheme ? '#F0F6FC' : '#2D1810', fontSize: '13px', marginBottom: '8px' }}>
                        {t('ui.twoSum')}
                      </div>
                      <div style={{ color: isDarkTheme ? '#8B949E' : '#5A5A5A', fontSize: '11px' }}>
                        {t('ui.twoSumDescription')}
                      </div>
                    </div>

                    <div style={{
                      background: isDarkTheme ? 'rgba(165, 163, 255, 0.1)' : 'rgba(107, 139, 99, 0.1)',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ color: isDarkTheme ? '#A5A3FF' : '#A0783B', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                        {t('ui.practiceConsolidation')}
                      </div>
                      <div style={{ color: isDarkTheme ? '#F0F6FC' : '#2D1810', fontSize: '13px', marginBottom: '8px' }}>
                        {t('ui.validParentheses')}
                      </div>
                      <div style={{ color: isDarkTheme ? '#8B949E' : '#5A5A5A', fontSize: '11px' }}>
                        {t('ui.validParenthesesDescription')}
                      </div>
                    </div>
                  </div>

                  <button style={{
                    width: '100%',
                    padding: '12px',
                    background: isDarkTheme
                      ? 'linear-gradient(135deg, #A5A3FF, #6366f1)'
                      : 'linear-gradient(135deg, #A0783B, #8B5A3C)',
                    border: 'none',
                    borderRadius: '12px',
                    color: isDarkTheme ? '#FFF' : '#2D1810',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = isDarkTheme
                      ? '0 8px 20px rgba(165, 163, 255, 0.3)'
                      : '0 8px 20px rgba(107, 139, 99, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}>
                    {t('ui.startTodayLearning')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>



      </div>


      {/* Footer */}
      <Footer />

      {/* CSS 动画 */}
      <style jsx>{`
        @keyframes gradientFlow {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-10px) translateX(5px);
          }
          50% {
            transform: translateY(-5px) translateX(-5px);
          }
          75% {
            transform: translateY(-15px) translateX(3px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.2);
          }
        }

        @keyframes shimmer {
          0% {
            opacity: 0.3;
            transform: scaleX(0.8);
          }
          50% {
            opacity: 1;
            transform: scaleX(1.2);
          }
          100% {
            opacity: 0.3;
            transform: scaleX(0.8);
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes starMove {
          from {
            background-position: 0% 0%;
          }
          to {
            background-position: 100% 100%;
          }
        }

        @keyframes ripple {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.8);
          }
          50% {
            opacity: 0.3;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.8);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* 强制副标题颜色 */
        .subtitle-override {
          color: #5A5A5A !important;
        }

        /* 深色主题下的副标题颜色 */
        .tech-theme .subtitle-override {
          color: rgba(255,255,255,0.7) !important;
        }

        /* 强制标题颜色 - 浅色主题 */
        .section-title-override.ant-typography {
          color: #A0783B !important;
        }

        /* 强制标题颜色 - 深色主题 */
        .tech-theme .section-title-override.ant-typography {
          color: white !important;
        }

        /* 媒体查询优化 */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TechHomePage;