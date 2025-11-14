import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  SoundFilled,
  ThunderboltFilled,
  CustomerServiceFilled
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import styles from './ImpactMetricsSection.module.css';

export type ImpactMetrics = {
  salaryIncreaseYearly: number;
  offersGained: number;
  passRateLiftPct: number;
  studyTimeReducedPct: number;
};

export type SkillDimension = {
  name: string;
  value: number;
  maxValue: number;
};

export type AIFeature = {
  title: string;
  description: string;
  icon: string;
  highlight: string;
};

export type ImpactMetricsSectionProps = {
  data: ImpactMetrics;
  title?: string;
  subtitle?: string;
  className?: string;
  style?: React.CSSProperties;
};

interface AnimatedNumberProps {
  value: number;
  formatter: (value: number) => string;
  duration: number;
  isVisible: boolean;
  color?: string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  formatter,
  duration,
  isVisible,
  color,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const startValueRef = useRef(0);

  const easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutCubic(progress);

    const currentValue = startValueRef.current + (value - startValueRef.current) * easedProgress;
    setDisplayValue(currentValue);

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [value, duration]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isVisible) {
      return;
    }

    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    startTimeRef.current = undefined;
    startValueRef.current = displayValue;
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, value, animate, displayValue]);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <span
      style={{
        color: color || 'inherit',
        fontSize: '1.8rem',
        fontWeight: '700',
        textShadow: 'none',
        opacity: 1,
        filter: 'none',
        display: 'inline-block'
      }}
    >
      {formatter(displayValue)}
    </span>
  );
};

// 雷达图组件
interface RadarChartProps {
  dimensions: SkillDimension[];
  targetDimensions?: SkillDimension[];
  isVisible: boolean;
}

const RadarChart: React.FC<RadarChartProps> = ({ dimensions, targetDimensions, isVisible }) => {
  const { isDarkTheme } = useTheme();
  const size = 220;
  const center = size / 2;
  const radius = 75;
  const levels = 5;

  // 计算多边形顶点
  const getPolygonPoints = (values: number[]) => {
    return values.map((value, index) => {
      const angle = (index * 2 * Math.PI) / dimensions.length - Math.PI / 2;
      const normalizedValue = (value / 100) * radius;
      const x = center + normalizedValue * Math.cos(angle);
      const y = center + normalizedValue * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  // 计算标签位置
  const getLabelPosition = (index: number) => {
    const angle = (index * 2 * Math.PI) / dimensions.length - Math.PI / 2;
    const labelRadius = radius + 30;
    const x = center + labelRadius * Math.cos(angle);
    const y = center + labelRadius * Math.sin(angle);
    return { x, y };
  };

  return (
    <div className={styles.radarContainer}>
      <svg width={size} height={size} className={styles.radarSvg}>
        {/* 背景网格 */}
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDarkTheme ? "#3b82f6" : "#A0783B"} stopOpacity="0.4" />
            <stop offset="50%" stopColor={isDarkTheme ? "#8b5cf6" : "#B5704A"} stopOpacity="0.3" />
            <stop offset="100%" stopColor={isDarkTheme ? "#6366f1" : "#8B5A3C"} stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* 同心圆网格 */}
        {Array.from({ length: levels }, (_, i) => (
          <polygon
            key={i}
            points={getPolygonPoints(Array(dimensions.length).fill((i + 1) * 20))}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
          />
        ))}

        {/* 轴线 */}
        {dimensions.map((_, index) => {
          const angle = (index * 2 * Math.PI) / dimensions.length - Math.PI / 2;
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          );
        })}

        {/* 学习前数据多边形（第一层） */}
        <polygon
          points={getPolygonPoints(dimensions.map(d => d.value))}
          fill={isDarkTheme ? "rgba(59, 130, 246, 0.9)" : "rgba(160, 120, 59, 0.9)"}
          stroke={isDarkTheme ? "#3b82f6" : "#A0783B"}
          strokeWidth="4"
          style={{
            opacity: isVisible ? 0.7 : 0,
            transition: 'opacity 1s ease-out',
            filter: isDarkTheme ? 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.6))' : 'drop-shadow(0 0 12px rgba(160, 120, 59, 0.6))',
          }}
        />

        {/* 学习后数据多边形（第二层 - 六边形战士） */}
        {targetDimensions && (
          <polygon
            points={getPolygonPoints(targetDimensions.map(d => d.value))}
            fill={isDarkTheme ? "rgba(255, 255, 255, 0.3)" : "rgba(181, 112, 74, 0.3)"}
            stroke={isDarkTheme ? "#ffffff" : "#B5704A"}
            strokeWidth="0.5"
            strokeDasharray="5,5"
            className={styles.radarPolygon}
            style={{
              opacity: isVisible ? 1 : 0,
              transition: 'opacity 1.2s ease-out',
              filter: 'none',
            }}
          />
        )}

        {/* 学习前数据点 */}
        {dimensions.map((dimension, index) => {
          const angle = (index * 2 * Math.PI) / dimensions.length - Math.PI / 2;
          const normalizedValue = (dimension.value / 100) * radius;
          const x = center + normalizedValue * Math.cos(angle);
          const y = center + normalizedValue * Math.sin(angle);
          return (
            <circle
              key={`before-${index}`}
              cx={x}
              cy={y}
              r="1"
              fill={isDarkTheme ? "#3b82f6" : "#A0783B"}
              style={{
                opacity: isVisible ? 0.8 : 0,
                transition: `opacity 1s ease-out ${index * 0.1}s`,
              }}
            />
          );
        })}

        {/* 学习后数据点（六边形战士） */}
        {targetDimensions && targetDimensions.map((dimension, index) => {
          const angle = (index * 2 * Math.PI) / targetDimensions.length - Math.PI / 2;
          const normalizedValue = (dimension.value / 100) * radius;
          const x = center + normalizedValue * Math.cos(angle);
          const y = center + normalizedValue * Math.sin(angle);
          return (
            <circle
              key={`after-${index}`}
              cx={x}
              cy={y}
              r="2"
              fill={isDarkTheme ? "#ffffff" : "#B5704A"}
              className={styles.radarPoint}
              style={{
                opacity: isVisible ? 1 : 0,
                transition: `opacity 1.2s ease-out ${index * 0.1 + 0.5}s`,
                filter: isDarkTheme ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))' : 'drop-shadow(0 0 8px rgba(160, 120, 59, 0.8))',
              }}
            />
          );
        })}
      </svg>

      {/* 技能标签（显示学习后的数据） */}
      <div className={styles.radarLabels}>
        {targetDimensions && targetDimensions.map((dimension, index) => {
          const pos = getLabelPosition(index);
          return (
            <div
              key={index}
              className={styles.radarLabel}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className={styles.radarLabelText}>{dimension.name}</div>
              <div className={styles.radarLabelValue}>{dimension.value}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ImpactMetricsSection: React.FC<ImpactMetricsSectionProps> = ({
  data,
  title,
  subtitle,
  className,
  style,
}) => {
  const { t } = useTranslation('home');
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const { isDarkTheme } = useTheme();

  // 使用翻译或默认值
  const displayTitle = title || t('ui.userGrowthData');
  const displaySubtitle = subtitle || t('ui.userGrowthDescription');


  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.2,
      }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  // 技能雷达图数据（学习前的基础水平 - 不均衡、有明显短板）
  const skillDimensions: SkillDimension[] = [
    { name: t('ui.algorithmDesign'), value: 45, maxValue: 100 },
    { name: t('ui.dataStructures'), value: 25, maxValue: 100 },
    { name: t('ui.codeOptimization'), value: 60, maxValue: 100 },
    { name: t('ui.problemSolving'), value: 20, maxValue: 100 },
    { name: t('ui.timeComplexity'), value: 35, maxValue: 100 },
    { name: t('ui.spaceComplexity'), value: 30, maxValue: 100 },
  ];

  // 第二层数据（学习后的显著提升 - 更真实的成长）
  const targetDimensions: SkillDimension[] = [
    { name: t('ui.algorithmDesign'), value: 85, maxValue: 100 },
    { name: t('ui.dataStructures'), value: 78, maxValue: 100 },
    { name: t('ui.codeOptimization'), value: 92, maxValue: 100 },
    { name: t('ui.problemSolving'), value: 88, maxValue: 100 },
    { name: t('ui.timeComplexity'), value: 75, maxValue: 100 },
    { name: t('ui.spaceComplexity'), value: 82, maxValue: 100 },
  ];

  // AI核心功能
  const aiFeatures: AIFeature[] = [
    {
      title: t('ui.aiCompanion'),
      description: t('ui.aiCompanionDesc'),
      icon: "CustomerServiceFilled",
      highlight: t('ui.instantResponse')
    },
    {
      title: t('ui.personalizedPath'),
      description: t('ui.personalizedPathDesc'),
      icon: "ThunderboltFilled",
      highlight: t('ui.preciseMatching')
    },
    {
      title: t('ui.realTimeFeedback'),
      description: t('ui.realTimeFeedbackDesc'),
      icon: "SoundFilled",
      highlight: t('ui.continuousOptimization')
    }
  ];

  const formatNumber = (value: number): string => {
    return Math.round(value).toLocaleString();
  };

  const formatSalary = (value: number): string => {
    return `$${formatNumber(value)}`;
  };

  const formatPercentage = (value: number): string => {
    return `${Math.round(value)}%`;
  };

  return (
    <section
      ref={sectionRef}
      className={`${styles.container} ${className || ''}`}
      style={{
        background: isDarkTheme ? 'rgba(22, 27, 34, 1)' : '#F5F1E8',
        ...style
      }}
      aria-label={t('ui.userGrowthData')}
    >
      <div className={styles.wrapper}>
        {/* 标题区域 */}
        <div className={styles.header}>
          <h2 className={styles.title} style={{
            color: isDarkTheme ? '#ffffff' : '#A0783B'
          }}>{displayTitle}</h2>
          <p className={styles.subtitle} style={{
            color: isDarkTheme ? '#ffffff' : '#5A5A5A'
          }}>{displaySubtitle}</p>
        </div>

        {/* 主要内容区域 */}
        <div className={styles.mainContent}>
          {/* 左侧：雷达图 */}
          <div className={styles.leftSection}>
            {/* 技能雷达图区域 */}
            <div className={styles.radarSection} style={{
              background: isDarkTheme
                ? 'rgba(255, 255, 255, 0.06)'
                : 'rgba(160, 120, 59, 0.08)',
              border: isDarkTheme
                ? '1px solid rgba(255, 255, 255, 0.12)'
                : '1px solid rgba(160, 120, 59, 0.25)',
              boxShadow: isDarkTheme
                ? 'none'
                : '0 8px 20px rgba(160, 120, 59, 0.15)'
            }}>
              <h3 className={styles.radarTitle} style={{
                color: isDarkTheme ? '#ffffff' : '#A0783B',
                fontWeight: 'bold'
              }}>{t('ui.impactMetrics.aiAssessmentPath')}</h3>
              <RadarChart
                dimensions={skillDimensions}
                targetDimensions={targetDimensions}
                isVisible={isVisible}
              />
              <p className={styles.radarSubtitle} style={{
                color: isDarkTheme ? '#94a3b8' : '#5A5A5A',
                fontWeight: 'bold'
              }}>{t('ui.impactMetrics.comprehensiveGrowth')}</p>
            </div>
          </div>

          {/* 右侧：数据卡片和AI功能描述 */}
          <div className={styles.rightSection}>
            {/* 数据统计卡片 */}
            <div className={styles.dataCards}>
              <div className={styles.statItem} style={{
                background: isDarkTheme
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(160, 120, 59, 0.08)',
                border: isDarkTheme
                  ? '1px solid rgba(255, 255, 255, 0.06)'
                  : '1px solid rgba(160, 120, 59, 0.25)',
                boxShadow: isDarkTheme
                  ? 'none'
                  : '0 8px 20px rgba(160, 120, 59, 0.15)'
              }}>
                <div className={styles.statValue} style={{
                  fontWeight: 'bold',
                  color: isDarkTheme ? '#ffffff' : '#A0783B'
                }}>
                  <AnimatedNumber
                    value={data.passRateLiftPct}
                    formatter={formatPercentage}
                    duration={2000}
                    isVisible={isVisible}
                    color={isDarkTheme ? '#ffffff' : '#A0783B'}
                  />
                </div>
                <div className={styles.statLabel} style={{
                  fontWeight: 'bold'
                }}>{t('ui.impactMetrics.passRateImprovement')}</div>
              </div>

              <div className={styles.statItem} style={{
                background: isDarkTheme
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(160, 120, 59, 0.08)',
                border: isDarkTheme
                  ? '1px solid rgba(255, 255, 255, 0.06)'
                  : '1px solid rgba(160, 120, 59, 0.25)',
                boxShadow: isDarkTheme
                  ? 'none'
                  : '0 8px 20px rgba(160, 120, 59, 0.15)'
              }}>
                <div className={styles.statValue} style={{
                  fontWeight: 'bold',
                  color: isDarkTheme ? '#ffffff' : '#A0783B'
                }}>
                  <AnimatedNumber
                    value={data.salaryIncreaseYearly}
                    formatter={formatSalary}
                    duration={2500}
                    isVisible={isVisible}
                    color={isDarkTheme ? '#ffffff' : '#A0783B'}
                  />
                </div>
                <div className={styles.statLabel} style={{
                  fontWeight: 'bold'
                }}>{t('ui.impactMetrics.salaryIncreaseYearly')}</div>
              </div>

              <div className={styles.statItem} style={{
                background: isDarkTheme
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(160, 120, 59, 0.08)',
                border: isDarkTheme
                  ? '1px solid rgba(255, 255, 255, 0.06)'
                  : '1px solid rgba(160, 120, 59, 0.25)',
                boxShadow: isDarkTheme
                  ? 'none'
                  : '0 8px 20px rgba(160, 120, 59, 0.15)'
              }}>
                <div className={styles.statValue} style={{
                  fontWeight: 'bold',
                  color: isDarkTheme ? '#ffffff' : '#A0783B'
                }}>
                  <AnimatedNumber
                    value={data.offersGained}
                    formatter={formatNumber}
                    duration={3000}
                    isVisible={isVisible}
                    color={isDarkTheme ? '#ffffff' : '#A0783B'}
                  />
                </div>
                <div className={styles.statLabel} style={{
                  fontWeight: 'bold'
                }}>{t('ui.impactMetrics.offersGained')}</div>
              </div>

              <div className={styles.statItem} style={{
                background: isDarkTheme
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(160, 120, 59, 0.08)',
                border: isDarkTheme
                  ? '1px solid rgba(255, 255, 255, 0.06)'
                  : '1px solid rgba(160, 120, 59, 0.25)',
                boxShadow: isDarkTheme
                  ? 'none'
                  : '0 8px 20px rgba(160, 120, 59, 0.15)'
              }}>
                <div className={styles.statValue} style={{
                  fontWeight: 'bold',
                  color: isDarkTheme ? '#ffffff' : '#A0783B'
                }}>
                  <AnimatedNumber
                    value={data.studyTimeReducedPct}
                    formatter={formatPercentage}
                    duration={2200}
                    isVisible={isVisible}
                    color={isDarkTheme ? '#ffffff' : '#A0783B'}
                  />
                </div>
                <div className={styles.statLabel} style={{
                  fontWeight: 'bold'
                }}>{t('ui.impactMetrics.studyTimeReduced')}</div>
              </div>
            </div>

            {/* AI陪伴功能描述 */}
            <div className={styles.aiCompanionDesc}>
              <div className={styles.aiCompanionItem} style={{
                background: isDarkTheme
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(160, 120, 59, 0.08)',
                border: isDarkTheme
                  ? '1px solid rgba(255, 255, 255, 0.06)'
                  : '1px solid rgba(160, 120, 59, 0.25)',
                boxShadow: isDarkTheme
                  ? 'none'
                  : '0 8px 20px rgba(160, 120, 59, 0.15)'
              }}>
                <span className={styles.aiCompanionText} style={{
                  color: isDarkTheme ? '#94a3b8' : '#5A5A5A',
                  fontWeight: 'bold'
                }}>{t('ui.impactMetrics.aiFullCompanion')}</span>
              </div>
              <div className={styles.aiCompanionItem} style={{
                background: isDarkTheme
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(160, 120, 59, 0.08)',
                border: isDarkTheme
                  ? '1px solid rgba(255, 255, 255, 0.06)'
                  : '1px solid rgba(160, 120, 59, 0.25)',
                boxShadow: isDarkTheme
                  ? 'none'
                  : '0 8px 20px rgba(160, 120, 59, 0.15)'
              }}>
                <span className={styles.aiCompanionText} style={{
                  color: isDarkTheme ? '#94a3b8' : '#5A5A5A',
                  fontWeight: 'bold'
                }}>{t('ui.impactMetrics.smartPathRecommendation')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactMetricsSection;