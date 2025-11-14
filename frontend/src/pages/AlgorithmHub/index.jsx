import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Typography,
  Progress,
  Button,
  Space,
  Tag,
  Avatar,
  Statistic,
  Timeline,
  Badge,
  Tooltip,
  Collapse,
  Spin
} from 'antd';
import {
  BookOutlined,
  PlayCircleOutlined,
  CodeOutlined,
  TrophyOutlined,
  FireOutlined,
  ClockCircleOutlined,
  StarOutlined,
  BranchesOutlined,
  RocketOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  LockOutlined,
  SoundOutlined,
  PictureOutlined,
  BarChartOutlined
} from '@ant-design/icons';

import { leetcode75Data, learningPath, defaultUserProgress } from '../../data/leetcode75Complete';
import CourseDirectoryComponent from './components/CourseDirectory.jsx';
import { useTheme } from '../../contexts/ThemeContext';
import './algorithmHub.css';
import '../../styles/techTheme.css';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const AlgorithmHub = () => {
  const { t } = useTranslation('learning');
  const navigate = useNavigate();

  // {t('algorithmHub.comments.stateManagement')}
  const [userProgress, setUserProgress] = useState(defaultUserProgress);
  const [selectedChapter, setSelectedChapter] = useState('array');
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [dailyGoal, setDailyGoal] = useState(3);
  const [todayCompleted, setTodayCompleted] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkTheme, getThemeClass } = useTheme();

  // 动态设置CSS变量
  useEffect(() => {
    const root = document.documentElement;

    if (isDarkTheme) {
      // 深色模式 - 设置蓝色
      root.style.setProperty('--tech-primary', '#58A6FF');
    } else {
      // 浅色模式 - 设置橙色
      root.style.setProperty('--tech-primary', '#D4926F');
    }

    return () => {
      // 组件卸载时恢复默认值
      root.style.setProperty('--tech-primary', isDarkTheme ? '#58A6FF' : '#D4926F');
    };
  }, [isDarkTheme]);

  // {t('algorithmHub.comments.calculateProgress')}
  const overallProgress = Math.round(
    (userProgress.overall.completedProblems / userProgress.overall.totalProblems) * 100
  );

  // {t('algorithmHub.comments.getRecommended')}
  const getRecommendedNext = useCallback(() => {
    const chapters = Object.entries(leetcode75Data);
    for (const [chapterId, chapter] of chapters) {
      const progress = userProgress.chapters[chapterId];
      if (progress && progress.completed < progress.total) {
        return {
          chapterId,
          chapterName: chapter.name,
          progress: Math.round((progress.completed / progress.total) * 100)
        };
      }
    }
    return null;
  }, [userProgress]);

  const recommendedNext = getRecommendedNext();

  // {t('algorithmHub.comments.startLearning')}
  const startLearning = (chapterId, patternId = null, problemId = null) => {
    console.log('Start learning:', { chapterId, patternId, problemId });
    setIsLoading(true);

    // 添加一个小延迟来显示加载状态
    setTimeout(() => {
      if (problemId && patternId) {
        // 直接进入编程练习 - 使用patternId而不是chapterId
        const codingUrl = `/algorithm-learning/coding/${patternId}/${problemId}`;
        console.log('Navigate to coding practice:', codingUrl);
        // 重置滚动位置
        window.scrollTo(0, 0);
        navigate(codingUrl);
      } else if (patternId) {
        // 进入AI教室学习模式
        const classroomUrl = `/algorithm-learning/classroom/${chapterId}/${patternId}`;
        console.log('Navigate to AI classroom:', classroomUrl);
        navigate(classroomUrl);
      } else {
        // 进入章节概览
        const overviewUrl = `/algorithm-learning/classroom/${chapterId}`;
        console.log('Navigate to chapter overview:', overviewUrl);
        navigate(overviewUrl);
      }
      setIsLoading(false);
    }, 300);
  };

  // {t('algorithmHub.comments.aiVoiceLearning')}
  const startVoiceLearning = () => {
    if (recommendedNext) {
      // 播放AI语音欢迎
      const welcomeText = t('algorithmHub.voice.welcomeBack', {
        chapterName: recommendedNext.chapterName,
        progress: recommendedNext.progress
      });

      // 这里集成语音合成
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(welcomeText);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }

      // 跳转到推荐的学习内容
      setTimeout(() => {
        startLearning(recommendedNext.chapterId);
      }, 3000);
    }
  };

  // {t('algorithmHub.comments.renderProgressOverview')}
  const renderProgressOverview = () => (
    <Card
      style={{
        background: 'linear-gradient(145deg, rgba(26, 29, 62, 0.95), rgba(31, 35, 70, 0.9))',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        borderRadius: '16px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}
      bodyStyle={{
        background: 'transparent'
      }}
    >
      <Row align="middle" gutter={[24, 16]}>
        <Col span={18}>
          <div>
            <Title level={4} style={{ margin: '0 0 8px 0', color: 'var(--tech-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChartOutlined style={{ color: 'white', fontSize: '18px' }} />
              {t('algorithmHub.progress.overview')}
            </Title>
            <Text style={{
              color: 'var(--tech-text-secondary)',
              fontSize: '14px',
              display: 'block',
              marginBottom: '12px'
            }}>
              {t('algorithmHub.progress.overviewDescription')}
            </Text>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
              <Tag size="small">LeetCode 75</Tag>
              <Tag size="small">⏱️ {t('algorithmHub.progress.consecutiveDays')} {userProgress.overall.streak} {t('algorithmHub.progress.days')}</Tag>
              <Tag size="small">🎯 {t('algorithmHub.progress.completedProblems')} {userProgress.overall.completedProblems} {t('algorithmHub.progress.problems')}</Tag>
              <Tag size="small">📈 {t('algorithmHub.progress.algorithmTraining')}</Tag>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '14px', color: 'var(--tech-text-secondary)', marginBottom: '8px', display: 'block' }}>
                {t('algorithmHub.progress.overallCompletion')}
              </Text>
              <Progress
                percent={overallProgress}
                size="small"
                strokeColor="var(--tech-primary)"
                trailColor="rgba(255,255,255,0.1)"
                format={(percent) => <span style={{ color: '#ffffff' }}>{percent}%</span>}
                style={{ marginBottom: '4px' }}
              />
            </div>
          </div>
        </Col>
        <Col span={6}>
          <div style={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card
                  size="small"
                  style={{
                    textAlign: 'center',
                    background: 'rgba(26, 29, 62, 0.8)',
                    border: '1px solid rgba(0, 255, 255, 0.3)'
                  }}
                  bodyStyle={{ padding: '12px' }}
                >
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--tech-primary)' }}>
                    {Object.keys(leetcode75Data).length}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--tech-text-secondary)' }}>{t('algorithmHub.progress.chapters')}</div>
                </Card>
              </Col>
              <Col span={12}>
                <Card
                  size="small"
                  style={{
                    textAlign: 'center',
                    background: 'rgba(26, 29, 62, 0.8)',
                    border: '1px solid rgba(0, 255, 255, 0.3)'
                  }}
                  bodyStyle={{ padding: '12px' }}
                >
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--tech-primary)' }}>
                    {userProgress.overall.totalProblems}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--tech-text-secondary)' }}>{t('algorithmHub.progress.totalProblems')}</div>
                </Card>
              </Col>
            </Row>
            {recommendedNext && (
              <Button
                type="primary"
                style={{
                  marginTop: '16px',
                  width: '100%',
                  background: 'linear-gradient(135deg, var(--tech-primary), var(--tech-secondary))',
                  border: 'none',
                  color: isDarkTheme ? '#000' : '#fff',
                  fontWeight: 'bold'
                }}
                onClick={() => startLearning(recommendedNext.chapterId)}
              >
                {t('algorithmHub.progress.continueLearning')}
              </Button>
            )}
          </div>
        </Col>
      </Row>
    </Card>
  );



  return (
    <Spin spinning={isLoading} tip={t('algorithmHub.loading.startingEnvironment')} size="large">
      <div className={`algorithm-hub ${getThemeClass()}`}>

        {/* 主体内容 - 三行布局 */}
        <div className="hub-content">
          {/* 第一行：进度总览 */}
          <Row gutter={24} style={{ marginBottom: 60 }}>
            <Col span={24}>
              {renderProgressOverview()}
            </Col>
          </Row>

          {/* 第二行：课程目录 */}
          <div style={{ marginBottom: 40 }}>
            <CourseDirectoryComponent
              data={leetcode75Data}
              userProgress={userProgress}
              selectedChapter={selectedChapter}
              onChapterSelect={setSelectedChapter}
              onPatternSelect={setSelectedPattern}
              onProblemSelect={(patternId, problemId) => startLearning(selectedChapter, patternId, problemId)}
              onPatternLearn={(chapterId, patternId) => startLearning(chapterId, patternId)}
            />
          </div>


        </div>

        {/* 响应式样式 */}
        <style jsx>{`
          @media (max-width: 768px) {
            .algorithm-hub {
              background-attachment: scroll !important;
            }

            .hero-content {
              max-width: 90% !important;
              padding: 20px 30px !important;
              margin: 0 20px !important;
            }

            .hero-title {
              font-size: 2.5rem !important;
            }

            .hero-description {
              font-size: 1.1rem !important;
              margin-bottom: 20px !important;
            }

            .hero-buttons {
              flex-direction: column !important;
              gap: 12px !important;
            }

            .hero-button {
              width: 100% !important;
              height: 48px !important;
              font-size: 14px !important;
            }

            .hub-content {
              padding: 40px 16px !important;
              border-radius: 20px 20px 0 0 !important;
            }

            .section-title {
              font-size: 1.8rem !important;
            }
          }

          @media (max-width: 480px) {
            .hero-content {
              padding: 16px 20px !important;
              margin: 0 10px !important;
            }

            .hero-title {
              font-size: 2rem !important;
              line-height: 1.2 !important;
            }

            .hero-description {
              font-size: 1rem !important;
            }

            .section-title {
              font-size: 1.5rem !important;
              margin-bottom: 20px !important;
            }
          }
        `}</style>

      </div>
    </Spin>
  );
};

export default AlgorithmHub;