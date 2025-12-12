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

  // Handle AI functionality
  const handleScreenshotAI = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Handle screenshot AI logic
        console.log('Upload screenshot:', file);
      }
    };
    input.click();
  };

  const handleAIDebug = () => {
    // Navigate to AI debug page
    navigate('/ai-debug');
  };

  // Real project data - based on open source project status
  const projectStats = {
    githubStars: '1.2k',    // GitHub stars
    totalProblems: 75,      // LeetCode 75 problem set
    aiFeatures: 4,          // Number of AI feature modules
    completionRate: '92%'   // Project completion rate
  };

  // LeetCode 75 core stats
  const leetcodeStats = {
    totalProblems: 75,
    patterns: 15,
    avgDays: 30,
    successRate: 94
  };

  return (
    <div 
      // Core Fix: Add key prop to force React to completely repaint the component on theme switch
      key={isDarkTheme ? 'dark' : 'light'}
      className={getThemeClass()} // Ensure style class names are also applied
      style={{
        minHeight: '100vh',
        background: isDarkTheme
          ? 'linear-gradient(135deg, #0a0e27 0%, #1a1d3e 50%, #2a2d4e 100%)'
          : '#F5F1E8',
        transition: 'background 0.3s ease' // Add smooth transition
      }}
    >
      {/* Hero Section - Modern tech background */}
      <div style={{
        height: '90vh',
        background: isDarkTheme ? `
          linear-gradient(135deg, #0B1426 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0B1426 100%),` :
          `#F5F1E8 radial-gradient(circle at 20% 80%, rgba(160, 120, 59, 0.08) 0%, transparent 50%)`,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 40px'
      }}>

        {/* Dynamic glowing orb background */}
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

        {/* Content area */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '800px'
        }}>

          {/* Main Title - Fix style occlusion issue */}
          <Title level={1} style={{
            fontSize: isDarkTheme
              ? 'clamp(3.5rem, 8vw, 4.8rem)'
              : 'clamp(3rem, 7vw, 4.2rem)',
            fontWeight: '700',
            // Fix: Use dark text directly in light mode, avoid gradient backgrounds that may cause bugs
            color: isDarkTheme ? '#F0F6FC' : '#2D1810',
            marginTop: '120px',
            marginBottom: '32px',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            fontFamily: 'SF Pro Display, -apple-system, sans-serif',
            // Fix: Enable gradient text only in dark mode, disable in light mode to prevent background occlusion
            background: isDarkTheme
              ? 'linear-gradient(135deg, #F0F6FC 0%, #58A6FF 50%, #A5A3FF 100%)'
              : 'none',
            backgroundSize: isDarkTheme ? '200% 100%' : 'auto',
            backgroundClip: isDarkTheme ? 'text' : 'border-box',
            WebkitBackgroundClip: isDarkTheme ? 'text' : 'border-box',
            WebkitTextFillColor: isDarkTheme ? 'transparent' : 'inherit',
            animation: isDarkTheme ? 'gradientFlow 28s linear infinite' : 'none',
            textShadow: isDarkTheme ? '0 0 20px rgba(88, 166, 255, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.1)',
          }}>
            {t('hero.title')}
          </Title>

          {/* Subtitle */}
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


          {/* CTA Button Area */}
          <div style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: '48px'
          }}>
            {/* Start Experience Button */}
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
                  : 'linear-gradient(135deg, #A0783B 0%, #B5704A 100%)', // Give a nice gradient for light mode as well
                border: 'none',
                borderRadius: '28px',
                boxShadow: '0 8px 24px rgba(0,0,0, 0.15)',
                minWidth: '200px',
                color: '#fff',
                fontFamily: 'SF Pro Display, -apple-system, sans-serif',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/algorithm-learning')} // Fix: Ensure route path is correct
            >
              {t('buttons.startAIExperience')}
            </Button>

            {/* View Results Button */}
            <Button
              size="large"
              style={{
                height: '56px',
                fontSize: '16px',
                fontWeight: '600',
                padding: '0 32px',
                background: isDarkTheme
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(255, 255, 255, 0.6)',
                border: isDarkTheme
                  ? '1px solid rgba(255, 255, 255, 0.2)'
                  : '1px solid rgba(160, 120, 59, 0.3)',
                borderRadius: '28px',
                color: isDarkTheme ? '#F0F6FC' : '#A0783B',
                minWidth: '200px',
                fontFamily: 'SF Pro Display, -apple-system, sans-serif',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/interview')} // Fix: Ensure route path is correct
            >
              {t('buttons.viewLearningResults')}
            </Button>
          </div>


        </div>

        {/* Bottom gradient transition */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '200px',
          background: isDarkTheme
            ? 'linear-gradient(to bottom, transparent 0%, rgba(10, 14, 39, 0.1) 15%, rgba(10, 14, 39, 0.3) 35%, rgba(26, 29, 62, 0.6) 60%, rgba(26, 29, 62, 0.85) 80%, #1a1d3e 100%)'
            : 'linear-gradient(to bottom, transparent 0%, rgba(245, 241, 232, 0) 0%, #F5F1E8 100%)',
          pointerEvents: 'none',
          zIndex: 5
        }} />

      </div>

      {/* Spacing area */}
      <div style={{ height: '60px' }} />

      {/* User growth data display */}
      <ImpactMetricsSection
        data={{
          salaryIncreaseYearly: 25000,
          offersGained: 850,
          passRateLiftPct: 85,
          studyTimeReducedPct: 60
        }}
      />

      {/* Main content area */}
      <div style={{
        maxWidth: '1350px',
        margin: '0 auto',
        padding: '80px 24px 120px',
        background: 'transparent'
      }}>

        {/* AI solution for learning pain points */}
        <div style={{ marginBottom: '120px' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <Title level={2} style={{
              fontSize: '2.3rem',
              color: isDarkTheme ? '#fff' : '#2D1810',
              marginBottom: '16px',
              fontWeight: 'bold'
            }}>
              {t('ui.aiFeaturesExperience')}
            </Title>
            <p style={{
              fontSize: '1.1rem',
              color: isDarkTheme ? 'rgba(255,255,255,0.7)' : '#5A5A5A',
              maxWidth: '600px',
              margin: '0 auto',
              display: 'block',
              fontWeight: '400'
            }}>
              {t('ui.aiFeaturesDescription')}
            </p>
          </div>

          {/* AI feature entity component display - Horizontal layout */}
          <div style={{ width: '100%', marginBottom: '0px' }}>
            <AIBlackboardCard />
            <AIInterviewCard />
            <AIToolsCard />
            <AIAssistantCard />
          </div>

          {/* Learning path planning module */}
          <div style={{
            width: '100vw',
            margin: '100px 0 0',
            marginLeft: '50%',
            transform: 'translateX(-50%)',
            padding: '80px 0 0',
            background: isDarkTheme ? 'rgba(22, 27, 34, 0.95)' : '#F0EBE0',
            position: 'relative'
          }}>
            <div style={{
              maxWidth: '1350px',
              margin: '0 auto',
              padding: '0 40px'
            }}>
              {/* Title area */}
              <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h2 style={{
                  fontSize: '2.5rem',
                  color: isDarkTheme ? '#F0F6FC' : '#2D1810',
                  marginBottom: '16px',
                  fontWeight: '700',
                }}>{t('ui.master30DaysCore')}</h2>
                <p style={{
                  fontSize: '1.2rem',
                  color: isDarkTheme ? '#A2A8B4' : '#5A5A5A',
                  fontWeight: '500'
                }}>{t('ui.learningPathDescription')}</p>
              </div>

              {/* Learning path display */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '70% 30%',
                gap: '48px',
                alignItems: 'start'
              }}>

                {/* Left: Custom learning path */}
                <div style={{
                  background: isDarkTheme ? 'rgba(88, 166, 255, 0.1)' : 'rgba(255, 255, 255, 0.6)',
                  border: isDarkTheme ? '1px solid rgba(88, 166, 255, 0.2)' : '1px solid rgba(160, 120, 59, 0.1)',
                  borderRadius: '20px',
                  padding: '40px 32px 20px',
                  boxShadow: isDarkTheme ? 'none' : '0 4px 20px rgba(0,0,0,0.05)'
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
                      background: isDarkTheme ? 'rgba(88, 166, 255, 0.1)' : '#fff',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '12px',
                      border: isDarkTheme ? 'none' : '1px solid rgba(0,0,0,0.05)'
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
                      background: isDarkTheme ? 'rgba(88, 166, 255, 0.1)' : '#fff',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '12px',
                      border: isDarkTheme ? 'none' : '1px solid rgba(0,0,0,0.05)'
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
                      : '#A0783B',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => navigate('/algorithm-learning')}
                  >
                    {t('ui.startCustomLearning')}
                  </button>
                </div>


                {/* Right: AI personalized recommendations */}
                <div style={{
                  background: isDarkTheme ? 'rgba(165, 163, 255, 0.1)' : 'rgba(255, 255, 255, 0.6)',
                  border: isDarkTheme ? '1px solid rgba(165, 163, 255, 0.2)' : '1px solid rgba(107, 139, 99, 0.1)',
                  borderRadius: '20px',
                  padding: '40px 32px 20px',
                  boxShadow: isDarkTheme ? 'none' : '0 4px 20px rgba(0,0,0,0.05)'
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
                      background: isDarkTheme ? 'rgba(165, 163, 255, 0.1)' : '#fff',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '12px',
                      border: isDarkTheme ? 'none' : '1px solid rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ color: isDarkTheme ? '#A5A3FF' : '#3C583F', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
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
                      background: isDarkTheme ? 'rgba(165, 163, 255, 0.1)' : '#fff',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '12px',
                      border: isDarkTheme ? 'none' : '1px solid rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ color: isDarkTheme ? '#A5A3FF' : '#3C583F', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
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
                      : '#3C583F',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#FFF',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => navigate('/interview')}
                  >
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

      {/* CSS Animations - Keep unchanged */}
      <style jsx>{`
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-5px) translateX(-5px); }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; }
        }
      `}</style>
    </div>
  );
};

export default TechHomePage;
