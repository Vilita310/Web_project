import React, { useState, useEffect, useRef } from 'react';
import { Card, Typography, Tag, Tooltip, Progress, Button } from 'antd';
import '../../../styles/techTheme.css';
import {
  NodeIndexOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  LockOutlined,
  StarFilled
} from '@ant-design/icons';

const { Title, Text } = Typography;

const KnowledgeGraphComponent = ({
  data,
  userProgress,
  selectedChapter,
  onNodeSelect
}) => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // 精确按照参考图重新设计的算法学习路径数据
  const algorithmMasteryPath = {
    nodes: [
      // 起始节点 - 左下角
      { id: 'fundamentals', name: 'Algorithms & Data Structures\nFundamentals', x: 15, y: 82, size: 'large', color: '#2563eb', icon: '📦', progress: 95 },

      // 第二层 - Stack & Queue
      { id: 'stack_queue', name: 'Stack & Queue', x: 35, y: 75, size: 'medium', color: '#1d4ed8', icon: '📚', progress: 90 },

      // 第三层 - Arrays & Two Pointers
      { id: 'arrays_widgetsset', name: 'Arrays & Widgetsset\nSpecialistset', x: 55, y: 68, size: 'medium', color: '#1e40af', icon: '🗃️', progress: 85 },
      { id: 'two_pointers', name: 'Two Pointers &\nSliding Window', x: 30, y: 62, size: 'medium', color: '#1e40af', icon: '👥', progress: 80 },

      // 第四层 - Hash & DP基础
      { id: 'hash_sliding', name: 'Algorithms & Hash &\nSliding Window', x: 15, y: 55, size: 'medium', color: '#0891b2', icon: '🪟', progress: 75 },
      { id: 'dp_fundamentals', name: 'Dynamic Programming\nFundamentals', x: 65, y: 55, size: 'medium', color: '#059669', icon: '🔄', progress: 70 },

      // 第五层 - Divide & DQ
      { id: 'divide_conquer', name: 'Divide &\nConquer', x: 28, y: 48, size: 'medium', color: '#0891b2', icon: '⚡', progress: 65 },
      { id: 'dq_trees', name: '& DQ', x: 60, y: 45, size: 'medium', color: '#0d9488', icon: '🌿', progress: 60 },

      // 第六层 - Graph Theory
      { id: 'graph_basics', name: 'Graph Theory\nBasics', x: 42, y: 38, size: 'medium', color: '#047857', icon: '🕸️', progress: 55 },

      // 第七层 - Trees & Greedy
      { id: 'trees', name: 'Trees &\nAlgorithms', x: 25, y: 32, size: 'medium', color: '#166534', icon: '🌳', progress: 50 },
      { id: 'greedy', name: 'Greedy\nHeaps', x: 28, y: 25, size: 'medium', color: '#15803d', icon: '💎', progress: 45 },

      // 第八层 - Advanced algorithms
      { id: 'greedy_instea', name: 'Greedy Instea\nAlgorithms', x: 35, y: 18, size: 'medium', color: '#16a34a', icon: '🎯', progress: 40 },
      { id: 'graph_theory', name: 'Graph Theory\nTechniques', x: 68, y: 25, size: 'medium', color: '#22c55e', icon: '🌐', progress: 35 },

      // 第九层 - 高级技术
      { id: 'memoization', name: 'T-Memoization\nAvgol Tree', x: 48, y: 22, size: 'medium', color: '#059669', icon: '🔍', progress: 30 },
      { id: 'advanced_dp', name: 'Advanced DP\nTechniques', x: 78, y: 15, size: 'medium', color: '#7c3aed', icon: '🧠', progress: 25 },

      // 第十层 - String & Graph高级
      { id: 'string_matching', name: 'String Matching\n(KMP)', x: 58, y: 12, size: 'medium', color: '#6d28d9', icon: '🔤', progress: 20 },
      { id: 'graph_algorithms', name: 'Graph Algorithms\n(MST, Shortest Path)', x: 82, y: 8, size: 'medium', color: '#7c3aed', icon: '🗺️', progress: 15 },
      { id: 'advanced_trees', name: 'Advanced Tree Structures\n(Trie, Segment Trees)', x: 88, y: 12, size: 'medium', color: '#8b5cf6', icon: '🌲', progress: 10 },

      // 顶层 - Advanced标签
      { id: 'advanced', name: 'Advanced', x: 72, y: 5, size: 'medium', color: '#6d28d9', icon: '⚡', progress: 8 },

      // 终极目标 - Algorithm Master
      { id: 'algorithm_master', name: 'Algorithm Master', x: 78, y: 2, size: 'large', color: '#7c3aed', icon: '👑', progress: 5 }
    ],

    connections: [
      // 基础路径
      { from: 'fundamentals', to: 'stack_queue', curve: 'gentle' },
      { from: 'stack_queue', to: 'arrays_widgetsset', curve: 'right' },
      { from: 'stack_queue', to: 'two_pointers', curve: 'left' },

      // 中级路径
      { from: 'two_pointers', to: 'hash_sliding', curve: 'left' },
      { from: 'arrays_widgetsset', to: 'dp_fundamentals', curve: 'gentle' },
      { from: 'hash_sliding', to: 'divide_conquer', curve: 'right' },
      { from: 'divide_conquer', to: 'graph_basics', curve: 'right' },
      { from: 'dq_trees', to: 'graph_basics', curve: 'left' },

      // 高级路径
      { from: 'graph_basics', to: 'trees', curve: 'left' },
      { from: 'trees', to: 'greedy', curve: 'gentle' },
      { from: 'greedy', to: 'greedy_instea', curve: 'right' },
      { from: 'dp_fundamentals', to: 'graph_theory', curve: 'gentle' },
      { from: 'graph_theory', to: 'memoization', curve: 'left' },
      { from: 'memoization', to: 'string_matching', curve: 'right' },

      // 专家级路径
      { from: 'graph_theory', to: 'advanced_dp', curve: 'right' },
      { from: 'string_matching', to: 'advanced', curve: 'right' },
      { from: 'advanced_dp', to: 'graph_algorithms', curve: 'gentle' },
      { from: 'graph_algorithms', to: 'advanced_trees', curve: 'right' },

      // 到达终极目标
      { from: 'string_matching', to: 'algorithm_master', curve: 'left' },
      { from: 'advanced', to: 'algorithm_master', curve: 'gentle' },
      { from: 'advanced_trees', to: 'algorithm_master', curve: 'left' }
    ]
  };

  // 获取难度颜色
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#52c41a';
      case 'Medium': return '#faad14';
      case 'Hard': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  };

  // 获取进度状态
  const getProgressStatus = (progress) => {
    if (progress >= 80) return 'success';
    if (progress >= 50) return 'active';
    if (progress > 0) return 'active';
    return 'normal';
  };

  // 渲染算法路径节点
  const renderAlgorithmNode = (node) => {
    const isSelected = selectedNode === node.id;
    const isHovered = hoveredNode === node.id;
    const isLarge = node.size === 'large';

    return (
      <div
        key={node.id}
        className={`algorithm-node ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
        onClick={() => {
          setSelectedNode(node.id);
          onNodeSelect(node.id);
        }}
        onMouseEnter={() => setHoveredNode(node.id)}
        onMouseLeave={() => setHoveredNode(null)}
        style={{
          position: 'absolute',
          left: `${node.x}%`,
          top: `${node.y}%`,
          transform: isHovered
            ? 'translate(-50%, -50%) translateY(-6px) scale(1.08)'
            : 'translate(-50%, -50%)',
          background: `linear-gradient(135deg, ${node.color} 0%, ${node.color}cc 50%, ${node.color}ee 100%)`,
          border: isSelected ? `2px solid #00ffd4` : `1px solid ${node.color}bb`,
          borderRadius: isLarge ? '18px' : '14px',
          padding: isLarge ? '20px 28px' : '14px 20px',
          cursor: 'pointer',
          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isHovered
            ? `0 16px 32px ${node.color}55, 0 6px 12px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255,255,255,0.2)`
            : `0 8px 20px ${node.color}40, 0 4px 8px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255,255,255,0.1)`,
          color: '#ffffff',
          textAlign: 'center',
          minWidth: isLarge ? '180px' : '140px',
          maxWidth: isLarge ? '240px' : '200px',
          backdropFilter: 'blur(12px)',
          overflow: 'hidden',
          zIndex: isHovered ? 10 : isSelected ? 5 : 1,
          filter: isHovered ? 'brightness(1.15)' : 'brightness(1)'
        }}
      >
        {/* 发光边框效果 */}
        {isSelected && (
          <div style={{
            position: 'absolute',
            top: '-3px',
            left: '-3px',
            right: '-3px',
            bottom: '-3px',
            background: 'linear-gradient(45deg, #00ffd4, #00d4ff, #00ffd4)',
            borderRadius: isLarge ? '23px' : '19px',
            zIndex: -1,
            opacity: 0.7,
            animation: 'pulse 2s infinite'
          }} />
        )}

        {/* 背景装饰光点 */}
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '40px',
          height: '40px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          opacity: 0.6
        }} />

        {/* 图标 */}
        <div style={{
          marginBottom: isLarge ? '16px' : '12px',
          fontSize: isLarge ? '36px' : '28px',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'
        }}>
          {node.icon}
        </div>

        {/* 标题 */}
        <div style={{
          fontSize: isLarge ? '18px' : '14px',
          fontWeight: '700',
          marginBottom: isLarge ? '16px' : '12px',
          lineHeight: '1.3',
          textShadow: '0 2px 4px rgba(0,0,0,0.4)',
          whiteSpace: 'pre-line'
        }}>
          {node.name}
        </div>

        {/* 进度条 */}
        <div style={{
          width: '100%',
          height: '4px',
          background: 'rgba(255, 255, 255, 0.25)',
          borderRadius: '2px',
          overflow: 'hidden',
          marginBottom: '8px',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            width: `${node.progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.8) 100%)',
            borderRadius: '2px',
            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 0 8px rgba(255,255,255,0.5)'
          }} />
        </div>

        {/* 进度文字 */}
        <div style={{
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.9)',
          fontWeight: '600',
          textShadow: '0 1px 2px rgba(0,0,0,0.4)'
        }}>
          {node.progress}% Complete
        </div>
      </div>
    );
  };

  // 渲染SVG连接线
  const renderAlgorithmConnections = () => {
    return (
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0
        }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          {/* 定义多种渐变色 */}
          <linearGradient id="connectionGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#1e40af" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="connectionGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#065f46" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="connectionGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#5b21b6" stopOpacity="0.6" />
          </linearGradient>

          {/* 发光效果滤镜 */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {algorithmMasteryPath.connections.map((connection, index) => {
          const fromNode = algorithmMasteryPath.nodes.find(n => n.id === connection.from);
          const toNode = algorithmMasteryPath.nodes.find(n => n.id === connection.to);

          if (!fromNode || !toNode) return null;

          const x1 = fromNode.x;
          const y1 = fromNode.y;
          const x2 = toNode.x;
          const y2 = toNode.y;

          // 根据曲线类型生成控制点
          let cp1x, cp1y, cp2x, cp2y;
          const dx = x2 - x1;
          const dy = y2 - y1;

          switch (connection.curve) {
            case 'left':
              cp1x = x1 - Math.abs(dx) * 0.4;
              cp1y = y1 + dy * 0.3;
              cp2x = x2 - Math.abs(dx) * 0.4;
              cp2y = y2 - dy * 0.3;
              break;
            case 'right':
              cp1x = x1 + Math.abs(dx) * 0.4;
              cp1y = y1 + dy * 0.3;
              cp2x = x2 + Math.abs(dx) * 0.4;
              cp2y = y2 - dy * 0.3;
              break;
            default: // gentle
              cp1x = x1 + dx * 0.3;
              cp1y = y1 + dy * 0.2;
              cp2x = x2 - dx * 0.3;
              cp2y = y2 - dy * 0.2;
          }

          // 选择渐变色
          const gradientId = index % 3 === 0 ? 'connectionGradient1' :
                           index % 3 === 1 ? 'connectionGradient2' : 'connectionGradient3';

          return (
            <g key={`connection-${index}`}>
              {/* 主连接路径 */}
              <path
                d={`M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`}
                stroke={`url(#${gradientId})`}
                strokeWidth="0.5"
                fill="none"
                filter="url(#glow)"
                strokeLinecap="round"
                opacity="0.8"
              />
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <Card
      className="knowledge-graph tech-card"
      bodyStyle={{ padding: '24px', position: 'relative', height: '700px' }}
      style={{
        height: '100%',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
        border: '1px solid rgba(0, 255, 212, 0.2)',
        borderRadius: '24px',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* 使用静态图片作为背景 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url(/hub_hero.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: 0.6,
        zIndex: 0
      }} />

      {/* 遮罩层 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(15, 23, 42, 0.3)',
        zIndex: 1
      }} />

      {/* 标题层 */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '30px',
        zIndex: 3,
        color: '#ffffff'
      }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          margin: 0,
          color: '#00ffd4',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
        }}>
          Algorithm Mastery Path
        </h3>
        <p style={{
          fontSize: '0.9rem',
          margin: '5px 0 0 0',
          color: 'rgba(255, 255, 255, 0.8)',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
        }}>
          Interactive Learning Journey
        </p>
      </div>

      {/* 交互层 - 透明的可点击区域 */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        zIndex: 2
      }}>
        {/* 可点击的透明节点区域 */}
        {algorithmMasteryPath.nodes.map((node) => (
          <div
            key={node.id}
            className={`algorithm-node-clickable ${selectedNode === node.id ? 'selected' : ''} ${hoveredNode === node.id ? 'hovered' : ''}`}
            onClick={() => {
              setSelectedNode(node.id);
              onNodeSelect(node.id);
            }}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            style={{
              position: 'absolute',
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: 'translate(-50%, -50%)',
              width: node.size === 'large' ? '240px' : '200px',
              height: node.size === 'large' ? '120px' : '80px',
              cursor: 'pointer',
              borderRadius: '14px',
              border: selectedNode === node.id ? '3px solid #00ffd4' : 'none',
              background: hoveredNode === node.id
                ? 'rgba(0, 255, 212, 0.2)'
                : selectedNode === node.id
                ? 'rgba(0, 255, 212, 0.1)'
                : 'transparent',
              zIndex: hoveredNode === node.id ? 10 : selectedNode === node.id ? 5 : 1,
              boxShadow: selectedNode === node.id
                ? '0 0 20px rgba(0, 255, 212, 0.6), inset 0 0 20px rgba(0, 255, 212, 0.2)'
                : hoveredNode === node.id
                ? '0 0 15px rgba(0, 255, 212, 0.4)'
                : 'none',
            }}
            title={`${node.name} - ${node.progress}% Complete`}
          >
            {/* 显示节点信息当悬浮时 */}
            {(hoveredNode === node.id || selectedNode === node.id) && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: '600',
                whiteSpace: 'pre-line',
                textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                padding: '8px',
                background: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '8px'
              }}>
                <div style={{ marginBottom: '4px', fontSize: '16px' }}>{node.icon}</div>
                <div style={{ marginBottom: '4px' }}>{node.name}</div>
                <div style={{ fontSize: '10px', color: '#00ffd4' }}>{node.progress}% Complete</div>
              </div>
            )}
          </div>
        ))}

        {/* 右上角开始学习按钮 */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 10
        }}>
          <Button
            type="primary"
            size="large"
            style={{
              background: 'linear-gradient(135deg, #00ffd4 0%, #1890ff 100%)',
              border: 'none',
              borderRadius: '12px',
              height: '48px',
              padding: '0 24px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#000',
              boxShadow: '0 8px 20px rgba(0, 255, 212, 0.3)'
            }}
            onClick={() => {
              const firstNode = algorithmMasteryPath.nodes.find(n => n.progress > 0);
              if (firstNode) {
                setSelectedNode(firstNode.id);
                onNodeSelect(firstNode.id);
              }
            }}
          >
            开始学习
          </Button>
        </div>
      </div>

      <style jsx>{`
        .knowledge-graph .ant-card-body {
          position: relative;
          background: transparent;
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .algorithm-node-clickable {
            width: 160px !important;
            height: 60px !important;
          }

          .algorithm-node-clickable.large {
            width: 180px !important;
            height: 80px !important;
          }
        }

        @media (max-width: 480px) {
          .algorithm-node-clickable {
            width: 140px !important;
            height: 50px !important;
          }

          .algorithm-node-clickable.large {
            width: 160px !important;
            height: 70px !important;
          }
        }

        /* 滚动条美化 */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 212, 0.6);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 255, 212, 0.8);
        }

        /* 确保图片清晰显示 */
        .knowledge-graph .ant-card-body > div:first-child {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }
      `}</style>
    </Card>
  );
};

export default KnowledgeGraphComponent;