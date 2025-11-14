import React, { useState, useRef } from 'react';
import { Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import AIBlackboard from '../core/AIBlackboard';


const AIBlackboardCard = () => {
  const blackboardRef = useRef(null);
  const { isDarkTheme } = useTheme();
  const { t } = useTranslation('home');
  const [demos] = useState([
    { algorithmKey: 'ui.twoSumAlgo', difficultyKey: 'ui.easy' },
    { algorithmKey: 'ui.reverseLinkedList', difficultyKey: 'ui.medium' },
    { algorithmKey: 'ui.numberOfIslands', difficultyKey: 'ui.hard' },
    { algorithmKey: 'ui.climbingStairs', difficultyKey: 'ui.easy' },
    { algorithmKey: 'ui.maxDepthBinaryTree', difficultyKey: 'ui.medium' }
  ]);

  // 处理题目点击事件，直接调用AI黑板的handleAITeach功能
  const handleTopicClick = (topicName) => {
    console.log('🎯 点击算法题目:', topicName);
    console.log('🔍 黑板引用状态:', blackboardRef.current);

    // 使用ref直接调用AI教学功能
    if (blackboardRef.current && blackboardRef.current.handleAITeach) {
      console.log('📋 找到AI黑板实例，开始教学...');
      try {
        blackboardRef.current.handleAITeach(topicName);
        console.log('✅ AI教学方法调用成功');
      } catch (error) {
        console.error('❌ AI教学方法调用失败:', error);
      }
    } else {
      console.warn('❌ 未找到AI黑板实例或handleAITeach方法');
      console.log('💡 可用方法:', blackboardRef.current ? Object.keys(blackboardRef.current) : '无引用');
    }
  };

  return (
    <div style={{
      width: '100vw',
      margin: '80px 0',
      marginLeft: '50%',
      transform: 'translateX(-50%)',
      padding: '40px 0',
      position: 'relative'
    }}>
      {/* 内容容器 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr',
        gap: '48px',
        alignItems: 'start',
        maxWidth: '1250px',
        margin: '0 auto',
        padding: '0 40px',
        position: 'relative'
      }}>


      {/* 左侧：AI智能黑板实时体验 */}
      <div style={{
        background: isDarkTheme
          ? 'rgba(22, 27, 34, 0.8)'
          : 'rgba(160, 120, 59, 0.08)',
        borderRadius: '24px',
        border: isDarkTheme
          ? '1px solid rgba(88, 166, 255, 0.2)'
          : '1px solid rgba(160, 120, 59, 0.25)',
        padding: '24px',
        boxShadow: isDarkTheme
          ? 'none'
          : '0 8px 20px rgba(160, 120, 59, 0.15)',
        backdropFilter: 'blur(16px)',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 1
      }}>
        {/* 头部 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div>
              <h3 style={{
                color: isDarkTheme ? '#F0F6FC' : '#A0783B',
                fontSize: '1.2rem',
                fontWeight: '600',
                margin: 0,
                marginBottom: '4px',
                marginLeft: '30px'
              }}>{t('ui.aiBlackboard')}</h3>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[t('ui.canvasDrawing'), t('ui.structureVisualization')].map((feature) => (
              <Tag key={feature} style={{
                background: isDarkTheme ? 'rgba(88, 166, 255, 0.15)' : 'rgba(212, 146, 111, 0.15)',
                border: isDarkTheme ? '1px solid rgba(88, 166, 255, 0.3)' : '1px solid rgba(212, 146, 111, 0.3)',
                color: isDarkTheme ? '#58A6FF' : '#D4926F',
                fontSize: '11px'
              }}>
                {feature}
              </Tag>
            ))}
          </div>
        </div>

        {/* 黑板区域 */}
        <div style={{
          minHeight: '400px',
          marginBottom: '16px',
          background: isDarkTheme ? 'transparent' : '#FAF9F6',
          borderRadius: '12px'
        }}>
          <AIBlackboard
            ref={blackboardRef}
            courseContent={{ title: '演示模式', content: [] }}
            onDrawingChange={() => {}}
            onAITeach={null}
            onStartVoiceChat={() => {}}
            voiceChatStates={{ isListening: false, isProcessing: false }}
            onTopicClick={() => {}}
            hideTeacherCard={true}
          />
        </div>

      </div>

      {/* 右侧：功能特性与演示 */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* 黑板统计 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(250, 249, 246, 0.7)',
            border: isDarkTheme ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(160, 120, 59, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.4rem',
              fontWeight: '700',
              color: isDarkTheme ? '#58A6FF' : '#D4926F',
              marginBottom: '4px'
            }}>99.2%</div>
            <div style={{
              fontSize: '12px',
              color: '#8B949E',
              fontWeight: '600',
              marginBottom: '2px'
            }}>{t('ui.recognitionAccuracy')}</div>
            <div style={{
              fontSize: '11px',
              color: '#6B7280'
            }}>{t('ui.aiVisionRecognition')}</div>
          </div>

          <div style={{
            background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(250, 249, 246, 0.7)',
            border: isDarkTheme ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(160, 120, 59, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.4rem',
              fontWeight: '700',
              color: '#f59e0b',
              marginBottom: '4px'
            }}>1.2s</div>
            <div style={{
              fontSize: '12px',
              color: '#8B949E',
              fontWeight: '600',
              marginBottom: '2px'
            }}>{t('ui.parsingSpeed')}</div>
            <div style={{
              fontSize: '11px',
              color: '#6B7280'
            }}>{t('ui.realTimeProcessing')}</div>
          </div>

          <div style={{
            background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(250, 249, 246, 0.7)',
            border: isDarkTheme ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(160, 120, 59, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.4rem',
              fontWeight: '700',
              color: '#7D73FF',
              marginBottom: '4px'
            }}>20+</div>
            <div style={{
              fontSize: '12px',
              color: '#8B949E',
              fontWeight: '600'
            }}>{t('ui.supportedProblemTypes')}</div>
          </div>

          <div style={{
            background: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(250, 249, 246, 0.7)',
            border: isDarkTheme ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(160, 120, 59, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '1.4rem',
              fontWeight: '700',
              color: isDarkTheme ? '#58A6FF' : '#D4926F',
              marginBottom: '4px'
            }}>Smart</div>
            <div style={{
              fontSize: '12px',
              color: '#8B949E',
              fontWeight: '600'
            }}>{t('ui.aiLevel')}</div>
          </div>
        </div>

        {/* 算法题目练习区 */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {demos.map((demo, index) => (
              <div
                key={index}
                onClick={() => handleTopicClick(t(demo.algorithmKey))}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '13px'
                }}
              >
                <span style={{ color: isDarkTheme ? '#FFFFFF' : '#A0783B', fontWeight: '500' }}>{t(demo.algorithmKey)}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    color: t(demo.difficultyKey) === t('ui.easy') ? (isDarkTheme ? '#58A6FF' : '#D4926F') :
                          t(demo.difficultyKey) === t('ui.medium') ? '#f59e0b' : '#ef4444',
                    fontWeight: '600',
                    fontSize: '12px'
                  }}>{t(demo.difficultyKey)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
        </div>
      </div>

      <style jsx>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }

        @media (max-width: 1024px) {
          & > div:first-child {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
      </div>
    </div>
  );
};

export default AIBlackboardCard;