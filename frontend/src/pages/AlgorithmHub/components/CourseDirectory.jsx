import React, { useState, useEffect } from 'react';
import { Card, List, Progress, Tag, Badge, Typography, Space, Button, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import '../../../styles/techTheme.css';
import {
  BookOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  LockOutlined,
  StarOutlined,
  ClockCircleOutlined,
  RightOutlined,
  BulbOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const CourseDirectoryComponent = ({
  data,
  userProgress,
  selectedChapter,
  onChapterSelect,
  onPatternSelect,
  onProblemSelect,
  onPatternLearn
}) => {
  const { t } = useTranslation('learning');

  // 翻译助手函数
  const translateText = (text) => {
    // 尝试不同类型的翻译键
    const keys = [
      `dataStructures.${text}`,
      `algorithmPatterns.${text}`,
      `difficulties.${text}`,
      `problems.${text}`
    ];

    for (const key of keys) {
      try {
        const translation = t(key);
        // 如果翻译结果不是键本身（即找到了翻译）
        if (translation !== key) {
          return translation;
        }
      } catch (error) {
        continue;
      }
    }

    // 如果没有找到翻译，返回原文
    return text;
  };
  const [activeChapter, setActiveChapter] = useState(selectedChapter || Object.keys(data)[0]);
  const [activePattern, setActivePattern] = useState(null);

  // 初始化时自动选择第一个算法模式
  useEffect(() => {
    if (data && activeChapter && data[activeChapter] && data[activeChapter].patterns.length > 0) {
      const firstPattern = data[activeChapter].patterns[0];
      setActivePattern(firstPattern.id);
    }
  }, [activeChapter, data]);

  // 计算章节完成进度
  const getChapterProgress = (chapterId) => {
    const progress = userProgress.chapters[chapterId];
    if (!progress) return 0;
    return Math.round((progress.completed / progress.total) * 100);
  };

  // 获取章节状态
  const getChapterStatus = (chapterId) => {
    const progress = getChapterProgress(chapterId);
    if (progress === 100) return 'completed';
    if (progress > 0) return 'in-progress';
    return 'locked';
  };

  // 处理章节选择
  const handleChapterSelect = (chapterId) => {
    setActiveChapter(chapterId);
    onChapterSelect(chapterId);
    // activePattern 会由 useEffect 自动设置为该章节的第一个算法模式
  };

  // 处理算法模式选择
  const handlePatternSelect = (patternId) => {
    setActivePattern(patternId);
    onPatternSelect(patternId);
  };

  // 渲染左侧章节列表项
  const renderChapterItem = (chapter, chapterId) => {
    const progress = getChapterProgress(chapterId);
    const status = getChapterStatus(chapterId);
    const isActive = activeChapter === chapterId;

    const statusConfig = {
      completed: { color: 'var(--tech-secondary)', icon: <CheckCircleOutlined /> },
      'in-progress': { color: 'var(--tech-primary)', icon: <PlayCircleOutlined /> },
      locked: { color: 'var(--tech-text-muted)', icon: <LockOutlined /> }
    };

    return (
      <div
        key={chapterId}
        className={`chapter-item ${isActive ? 'active' : ''} ${status}`}
        onClick={() => handleChapterSelect(chapterId)}
      >
        <div className="chapter-item-content">
          <div className="chapter-main">
            <div className="chapter-icon">
              <StarOutlined style={{ color: '#faad14', fontSize: '18px' }} />
            </div>
            <div className="chapter-info">
              <div className="chapter-title">
                <Text strong style={{ color: isActive ? 'var(--tech-primary)' : statusConfig[status].color }}>
                  {translateText(chapter.name)}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染中间算法模式列表
  const renderPatternList = () => {
    if (!activeChapter || !data[activeChapter]) return null;

    const chapter = data[activeChapter];

    return (
      <div className="pattern-list">
        <div className="pattern-list-header">
          <h4 style={{ color: 'var(--tech-text-primary)', margin: 0 }}>{t('courseDirectory.algorithmPatterns')}</h4>
        </div>
        <div className="pattern-items">
          {chapter.patterns.map((pattern) => (
            <div
              key={pattern.id}
              className={`pattern-item ${activePattern === pattern.id ? 'active' : ''}`}
              onClick={() => handlePatternSelect(pattern.id)}
            >
              <div className="pattern-item-content">
                <div className="pattern-main">
                  <StarOutlined style={{ color: '#faad14', fontSize: '16px' }} />
                  <div className="pattern-info">
                    <Text strong style={{ color: activePattern === pattern.id ? 'var(--tech-primary)' : 'var(--tech-text-primary)' }}>
                      {translateText(pattern.name)}
                    </Text>
                    <Text type="secondary" size="small" className="pattern-description">
                      {translateText(pattern.description)}
                    </Text>
                  </div>
                </div>
                <div className="pattern-actions">
                  <div className="pattern-count">
                    <Text type="secondary" size="small">
                      {pattern.problems.length} {t('courseDirectory.problemCount')}
                    </Text>
                  </div>
                </div>
                {activePattern === pattern.id && <RightOutlined className="pattern-arrow" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 渲染右侧题目列表
  const renderProblemList = () => {
    if (!activeChapter || !activePattern || !data[activeChapter]) return (
      <div className="problem-list-placeholder">
        <div className="placeholder-content">
          <BookOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
          <Text type="secondary">{t('courseDirectory.selectPatternToView')}</Text>
        </div>
      </div>
    );

    const chapter = data[activeChapter];
    const pattern = chapter.patterns.find(p => p.id === activePattern);

    if (!pattern) return null;

    return (
      <div className="problem-list">
        <div className="problem-list-header">
          <div className="problem-title-section">
            <StarOutlined style={{ color: '#faad14', fontSize: '20px' }} />
            <div>
              <h4 style={{ margin: 0, color: 'var(--tech-primary)' }}>{translateText(pattern.name)}</h4>
              <Text type="secondary">{translateText(pattern.description)}</Text>
            </div>
          </div>
          <div className="problem-stats">
            <Tooltip title="开始学习">
              <Button
                type="primary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onPatternLearn && onPatternLearn(activeChapter, pattern.id);
                }}
                style={{
                  background: 'linear-gradient(135deg, #00d4ff 0%, #0096cc 100%)',
                  border: 'none',
                  marginRight: '8px'
                }}
              >
                {t('courseDirectory.theoryStudy')}
              </Button>
            </Tooltip>
          </div>
        </div>

        <div className="problem-items">
          {pattern.problems.map((problem) => {
            const isCompleted = false; // 这里应该从userProgress获取
            const difficulty = problem.difficulty;

            const difficultyColors = {
              '简单': 'green',
              '中等': 'orange',
              '困难': 'red'
            };

            return (
              <div
                key={problem.id}
                className={`problem-item ${isCompleted ? 'completed' : ''}`}
                onClick={() => onProblemSelect(pattern.id, problem.id)}
              >
                <div className="problem-item-content">
                  <div className="problem-main">
                    {isCompleted ? (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : (
                      <BulbOutlined style={{ color: '#faad14' }} />
                    )}
                    <div className="problem-info">
                      <Text strong style={{ color: 'var(--tech-text-primary)' }}>{translateText(problem.title)}</Text>
                      {problem.leetcodeId && (
                        <Text type="secondary" size="small">
                          #{problem.leetcodeId}
                        </Text>
                      )}
                    </div>
                  </div>
                  <Tag color={difficultyColors[difficulty]} size="small">
                    {translateText(difficulty)}
                  </Tag>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card
      title={
        <Space style={{ color: 'var(--tech-text-primary)' }}>
          <BookOutlined style={{ color: 'var(--tech-text-primary)' }} />
          <span style={{ color: 'var(--tech-text-primary)' }}>{t('courseDirectory.title')}</span>
        </Space>
      }
      className="course-directory tech-card"
      bodyStyle={{ padding: 0, border: 'none' }}
      style={{ border: 'none' }}
    >
      <div className="course-directory-layout">
        {/* 左侧数据结构列表 */}
        <div className="course-directory-sidebar">
          <div className="sidebar-header">
            <Text strong style={{ color: 'var(--tech-primary)' }}>{t('courseDirectory.dataStructuresTitle')}</Text>
          </div>
          <div className="chapter-list">
            {Object.entries(data).map(([chapterId, chapter]) =>
              renderChapterItem(chapter, chapterId)
            )}
          </div>
        </div>

        {/* 中间算法模式列表 */}
        <div className="course-directory-middle">
          {renderPatternList()}
        </div>

        {/* 右侧题目列表 */}
        <div className="course-directory-content">
          {renderProblemList()}
        </div>
      </div>

      <style jsx>{`
        .course-directory {
          height: 100%;
          overflow: hidden;
          border: none !important;
          box-shadow: none !important;
        }

        .course-directory .ant-card-body {
          border: none !important;
          border-bottom: none !important;
        }

        .course-directory .ant-card-head {
          border-bottom: none !important;
        }

        .course-directory.ant-card {
          border: none !important;
          box-shadow: none !important;
        }

        .course-directory-layout {
          display: flex;
          min-height: 500px;
          gap: 20px;
          position: relative;
          background: linear-gradient(135deg,
            rgba(26, 29, 62, 0.95) 0%,
            rgba(13, 25, 45, 0.95) 50%,
            rgba(26, 29, 62, 0.95) 100%);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.3);
          animation: containerFadeIn 0.8s ease-out;
          padding: 20px;
          width: 100%;
          overflow: hidden;
        }

        @keyframes containerFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* 左侧数据结构列表样式 */
        .course-directory-sidebar {
          flex: 0 0 340px;
          min-width: 320px;
          max-width: 380px;
          background: linear-gradient(135deg,
            rgba(0, 212, 255, 0.1) 0%,
            rgba(26, 29, 62, 0.8) 100%);
          border-radius: 16px;
          padding: 20px 24px;
          position: relative;
          overflow: hidden;
        }

        .course-directory-sidebar::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg,
            transparent 0%,
            #00d4ff 50%,
            transparent 100%);
          animation: shimmer 3s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        /* 中间算法模式列表样式 */
        .course-directory-middle {
          flex: 0 0 400px;
          min-width: 370px;
          max-width: 440px;
          background: linear-gradient(135deg,
            rgba(26, 29, 62, 0.6) 0%,
            rgba(0, 212, 255, 0.05) 50%,
            rgba(26, 29, 62, 0.6) 100%);
          border-radius: 16px;
          padding: 20px 24px;
          position: relative;
          overflow: hidden;
        }

        .course-directory-middle::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(0, 212, 255, 0.5) 50%,
            transparent 100%);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: translateY(-50%) scaleX(0.8);
          }
          50% {
            opacity: 0.8;
            transform: translateY(-50%) scaleX(1);
          }
        }

        .sidebar-header {
          padding: 12px 0 20px 0;
          margin-bottom: 20px;
          position: relative;
          text-align: center;
        }

        .sidebar-header::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00d4ff, transparent);
          animation: headerGlow 2s ease-in-out infinite;
        }

        @keyframes headerGlow {
          0%, 100% { opacity: 0.5; transform: translateX(-50%) scaleX(0.8); }
          50% { opacity: 1; transform: translateX(-50%) scaleX(1.2); }
        }

        .chapter-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chapter-item {
          padding: 16px 30px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          border: 1px solid rgba(0, 212, 255, 0.1);
          position: relative;
          background: linear-gradient(135deg,
            rgba(26, 29, 62, 0.3) 0%,
            rgba(0, 212, 255, 0.05) 100%);
          transform: translateX(0);
          animation: itemSlideIn 0.6s ease-out;
          animation-fill-mode: both;
        }

        .chapter-item:nth-child(1) { animation-delay: 0.1s; }
        .chapter-item:nth-child(2) { animation-delay: 0.2s; }
        .chapter-item:nth-child(3) { animation-delay: 0.3s; }
        .chapter-item:nth-child(4) { animation-delay: 0.4s; }
        .chapter-item:nth-child(5) { animation-delay: 0.5s; }

        @keyframes itemSlideIn {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .chapter-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 12px;
          background: linear-gradient(135deg,
            rgba(0, 212, 255, 0.1) 0%,
            rgba(0, 212, 255, 0.05) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }


        .chapter-item:hover {
          transform: translateX(8px) scale(1.02);
          border-color: rgba(0, 212, 255, 0.5);
          box-shadow:
            0 8px 25px rgba(0, 212, 255, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .chapter-item:hover::before {
          opacity: 1;
        }

        .chapter-item.active {
          background: linear-gradient(135deg,
            rgba(0, 212, 255, 0.2) 0%,
            rgba(0, 150, 200, 0.1) 100%);
          border-color: #00d4ff;
          transform: translateX(12px) scale(1.05);
          box-shadow:
            0 12px 35px rgba(0, 212, 255, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            0 0 0 1px rgba(0, 212, 255, 0.5);
          animation: activeGlow 2s ease-in-out infinite;
        }

        @keyframes activeGlow {
          0%, 100% {
            box-shadow:
              0 12px 35px rgba(0, 212, 255, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.2),
              0 0 0 1px rgba(0, 212, 255, 0.5);
          }
          50% {
            box-shadow:
              0 15px 40px rgba(0, 212, 255, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.3),
              0 0 0 2px rgba(0, 212, 255, 0.7);
          }
        }

        .chapter-item-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chapter-main {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .chapter-icon {
          font-size: 18px;
          width: 32px;
          text-align: center;
        }

        .chapter-info {
          flex: 1;
        }

        .chapter-title {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 2px;
        }

        .chapter-meta {
          margin-top: 2px;
        }

        .chapter-progress {
          flex: 0 0 60px;
          text-align: right;
        }

        .chapter-arrow {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          color: #00d4ff;
          font-size: 12px;
        }


        /* 右侧题目列表样式 */
        .course-directory-content {
          flex: 1;
          min-width: 0;
          background: linear-gradient(135deg,
            rgba(26, 29, 62, 0.3) 0%,
            rgba(13, 25, 45, 0.4) 100%);
          border-radius: 16px;
          padding: 20px 20px;
          overflow-y: auto;
        }

        /* 算法模式列表样式 */
        .pattern-list-header {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 16px;
          position: relative;
        }

        .pattern-list-header::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg,
            rgba(0, 212, 255, 0.5) 0%,
            rgba(0, 212, 255, 0.1) 50%,
            rgba(0, 212, 255, 0.5) 100%);
          animation: lineFlow 3s ease-in-out infinite;
        }

        @keyframes lineFlow {
          0%, 100% { transform: scaleX(0.8); opacity: 0.5; }
          50% { transform: scaleX(1); opacity: 1; }
        }

        .pattern-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pattern-item {
          padding: 16px 14px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 1px solid rgba(0, 212, 255, 0.1);
          position: relative;
          background: linear-gradient(135deg,
            rgba(26, 29, 62, 0.4) 0%,
            rgba(0, 212, 255, 0.03) 100%);
          overflow: hidden;
          animation: patternFadeIn 0.8s ease-out;
          animation-fill-mode: both;
        }

        .pattern-item:nth-child(1) { animation-delay: 0.1s; }
        .pattern-item:nth-child(2) { animation-delay: 0.2s; }
        .pattern-item:nth-child(3) { animation-delay: 0.3s; }
        .pattern-item:nth-child(4) { animation-delay: 0.4s; }
        .pattern-item:nth-child(5) { animation-delay: 0.5s; }

        @keyframes patternFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px) rotateX(-10deg);
          }
          to {
            opacity: 1;
            transform: translateY(0) rotateX(0deg);
          }
        }

        .pattern-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg,
            transparent,
            rgba(0, 212, 255, 0.1),
            transparent);
          transition: left 0.5s ease;
        }


        .pattern-item:hover {
          transform: translateY(-4px) scale(1.03);
          border-color: rgba(0, 212, 255, 0.4);
          box-shadow:
            0 12px 30px rgba(0, 212, 255, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .pattern-item:hover::before {
          left: 100%;
        }

        .pattern-item.active {
          background: linear-gradient(135deg,
            rgba(0, 212, 255, 0.15) 0%,
            rgba(0, 150, 200, 0.08) 100%);
          border-color: #00d4ff;
          transform: translateY(-6px) scale(1.02);
          box-shadow:
            0 16px 40px rgba(0, 212, 255, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.2),
            0 0 20px rgba(0, 212, 255, 0.3);
          animation: patternActiveGlow 2.5s ease-in-out infinite;
        }

        @keyframes patternActiveGlow {
          0%, 100% {
            box-shadow:
              0 16px 40px rgba(0, 212, 255, 0.25),
              inset 0 1px 0 rgba(255, 255, 255, 0.2),
              0 0 20px rgba(0, 212, 255, 0.3);
          }
          50% {
            box-shadow:
              0 20px 50px rgba(0, 212, 255, 0.35),
              inset 0 1px 0 rgba(255, 255, 255, 0.3),
              0 0 30px rgba(0, 212, 255, 0.5);
          }
        }

        .pattern-item-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pattern-main {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .pattern-info {
          flex: 1;
        }

        .pattern-description {
          display: block;
          margin-top: 4px;
          color: rgba(255, 255, 255, 0.7) !important;
        }

        .pattern-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pattern-count {
          margin-right: 8px;
        }

        .pattern-arrow {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          color: #00d4ff;
          font-size: 12px;
        }

        /* 题目列表样式 */
        .problem-list-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          min-height: 240px;
          animation: placeholderFadeIn 0.8s ease-out;
        }

        @keyframes placeholderFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .placeholder-content {
          text-align: center;
          padding: 30px;
          border-radius: 12px;
          background: rgba(26, 29, 62, 0.2);
          border: 1px dashed rgba(0, 212, 255, 0.3);
        }

        .problem-list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 16px 20px;
          background: linear-gradient(135deg,
            rgba(0, 212, 255, 0.1) 0%,
            rgba(26, 29, 62, 0.4) 100%);
          border-radius: 12px;
          border: 1px solid rgba(0, 212, 255, 0.2);
          position: relative;
          overflow: hidden;
        }

        .problem-list-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(0, 212, 255, 0.05) 50%,
            transparent 100%);
          animation: headerShine 3s ease-in-out infinite;
        }

        @keyframes headerShine {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }

        .problem-title-section {
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 1;
          position: relative;
        }

        .problem-stats {
          text-align: center;
          z-index: 1;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .problem-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 400px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .problem-items::-webkit-scrollbar {
          width: 6px;
        }

        .problem-items::-webkit-scrollbar-track {
          background: rgba(26, 29, 62, 0.3);
          border-radius: 3px;
        }

        .problem-items::-webkit-scrollbar-thumb {
          background: rgba(0, 212, 255, 0.4);
          border-radius: 3px;
        }

        .problem-items::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 212, 255, 0.6);
        }

        .problem-item {
          padding: 18px 20px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          background: linear-gradient(135deg,
            rgba(26, 29, 62, 0.4) 0%,
            rgba(0, 212, 255, 0.02) 100%);
          border: 1px solid rgba(0, 212, 255, 0.1);
          position: relative;
          overflow: hidden;
          animation: problemSlideIn 0.6s ease-out;
          animation-fill-mode: both;
        }

        .problem-item:nth-child(1) { animation-delay: 0.1s; }
        .problem-item:nth-child(2) { animation-delay: 0.15s; }
        .problem-item:nth-child(3) { animation-delay: 0.2s; }
        .problem-item:nth-child(4) { animation-delay: 0.25s; }
        .problem-item:nth-child(5) { animation-delay: 0.3s; }

        @keyframes problemSlideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .problem-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg,
            transparent,
            rgba(0, 212, 255, 0.08),
            transparent);
          transition: left 0.6s ease;
        }


        .problem-item:hover {
          background: linear-gradient(135deg,
            rgba(0, 212, 255, 0.08) 0%,
            rgba(26, 29, 62, 0.6) 100%);
          border-color: rgba(0, 212, 255, 0.3);
          transform: translateY(-2px) scale(1.02);
          box-shadow:
            0 8px 25px rgba(0, 212, 255, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .problem-item:hover::before {
          left: 100%;
        }

        .problem-item.completed {
          background: linear-gradient(135deg,
            rgba(82, 196, 26, 0.1) 0%,
            rgba(26, 29, 62, 0.4) 100%);
          border: 1px solid rgba(82, 196, 26, 0.3);
        }


        .problem-item.completed:hover {
          background: linear-gradient(135deg,
            rgba(82, 196, 26, 0.15) 0%,
            rgba(26, 29, 62, 0.6) 100%);
          border-color: rgba(82, 196, 26, 0.5);
        }

        .problem-item-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 1;
          position: relative;
        }

        .problem-main {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        .problem-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .chapter-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(0, 212, 255, 0.2);
        }

        .chapter-title-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .chapter-icon-large {
          font-size: 32px;
          width: 48px;
          text-align: center;
        }

        .chapter-stats {
          display: flex;
          gap: 24px;
        }

        .stat {
          text-align: center;
        }

        .patterns-section h4 {
          margin-bottom: 16px;
        }

        .pattern-detail-item {
          margin-bottom: 20px;
          padding: 16px;
          background: rgba(26, 29, 62, 0.3);
          border-radius: 8px;
          border: 1px solid rgba(0, 212, 255, 0.1);
        }

        .pattern-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          cursor: pointer;
          padding: 4px 0;
        }

        .pattern-detail-header:hover {
          background: rgba(0, 212, 255, 0.1);
          border-radius: 4px;
        }

        .pattern-detail-description {
          display: block;
          margin-bottom: 12px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }

        .problem-detail-list {
          margin-top: 8px;
        }

        .problem-detail-item {
          padding: 8px 12px;
          margin: 4px 0;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(26, 29, 62, 0.2);
        }

        .problem-detail-item:hover {
          background: rgba(0, 212, 255, 0.1);
        }

        .problem-detail-item.completed {
          background: rgba(82, 196, 26, 0.1);
          border: 1px solid rgba(82, 196, 26, 0.3);
        }

        /* 响应式设计 */
        @media (min-width: 1600px) {
          .course-directory-layout {
            min-height: 600px;
          }

          .course-directory-sidebar {
            flex: 0 0 380px;
            max-width: 420px;
          }

          .course-directory-middle {
            flex: 0 0 420px;
            max-width: 460px;
          }
        }

        @media (max-width: 1400px) {
          .course-directory-sidebar {
            flex: 0 0 320px;
            min-width: 300px;
            max-width: 360px;
          }

          .course-directory-middle {
            flex: 0 0 360px;
            min-width: 340px;
            max-width: 400px;
          }
        }

        @media (max-width: 1200px) {
          .course-directory-layout {
            gap: 15px;
            padding: 15px;
          }

          .course-directory-sidebar {
            flex: 0 0 300px;
            min-width: 280px;
            max-width: 340px;
            padding: 15px 18px;
          }

          .course-directory-middle {
            flex: 0 0 340px;
            min-width: 320px;
            max-width: 380px;
            padding: 15px 18px;
          }

          .course-directory-content {
            padding: 15px 16px;
          }
        }

        @media (max-width: 1024px) {
          .course-directory-sidebar {
            flex: 0 0 280px;
            min-width: 260px;
            max-width: 320px;
            padding: 12px 16px;
          }

          .course-directory-middle {
            flex: 0 0 300px;
            min-width: 280px;
            max-width: 340px;
            padding: 12px 16px;
          }

          .course-directory-content {
            padding: 12px 14px;
          }
        }

        @media (max-width: 768px) {
          .course-directory-layout {
            flex-direction: column;
            min-height: auto;
            gap: 16px;
            padding: 16px;
          }

          .course-directory-sidebar,
          .course-directory-middle,
          .course-directory-content {
            flex: 1 1 auto;
            min-width: 100%;
            max-width: none;
            min-height: 300px;
          }
        }
      `}</style>
    </Card>
  );
};

export default CourseDirectoryComponent;