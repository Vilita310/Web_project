import React from 'react';
import { Card as AntCard } from 'antd';
import { ComponentPatterns } from './ComponentFactory';
import { designTokens } from '../../styles/designTokens';

const Card = React.forwardRef((props, ref) => {
  const {
    variant = 'default',
    padding = 'md',
    elevation = 'base',
    hover = false,
    children,
    className = '',
    style = {},
    title,
    extra,
    ...rest
  } = props;

  // 根据padding配置获取内边距
  const getPadding = () => {
    switch (padding) {
      case 'none':
        return '0';
      case 'sm':
        return designTokens.spacing[4];
      case 'md':
        return designTokens.spacing[6];
      case 'lg':
        return designTokens.spacing[8];
      case 'xl':
        return designTokens.spacing[10];
      default:
        return designTokens.spacing[6];
    }
  };

  // 根据elevation获取阴影
  const getElevation = () => {
    switch (elevation) {
      case 'none':
        return 'none';
      case 'sm':
        return designTokens.shadows.sm;
      case 'base':
        return designTokens.shadows.tech.soft;
      case 'md':
        return designTokens.shadows.md;
      case 'lg':
        return designTokens.shadows.lg;
      case 'xl':
        return designTokens.shadows.xl;
      default:
        return designTokens.shadows.tech.soft;
    }
  };

  // 创建样式
  const cardStyle = {
    ...ComponentPatterns.card,
    padding: getPadding(),
    boxShadow: getElevation(),
    transition: hover ? 'all 0.3s ease' : 'none',
    cursor: hover ? 'pointer' : 'default',
    ...(hover && {
      ':hover': {
        transform: 'translateY(-2px)',
        boxShadow: designTokens.shadows.lg
      }
    }),
    ...style
  };

  // 变体样式
  const getVariantStyles = () => {
    switch (variant) {
      case 'outlined':
        return {
          background: 'transparent',
          border: `2px solid ${designTokens.colors.tech.border}`
        };
      case 'filled':
        return {
          background: designTokens.colors.tech.surface,
          border: 'none'
        };
      case 'elevated':
        return {
          background: designTokens.colors.tech.surface,
          border: `1px solid ${designTokens.colors.tech.border}`,
          boxShadow: designTokens.shadows.lg
        };
      case 'ghost':
        return {
          background: 'rgba(255, 255, 255, 0.02)',
          border: `1px solid ${designTokens.colors.tech.border}`,
          backdropFilter: 'blur(10px)'
        };
      default:
        return {};
    }
  };

  const finalStyle = {
    ...cardStyle,
    ...getVariantStyles()
  };

  const finalClassName = `tech-card tech-card-${variant} ${hover ? 'tech-card-hover' : ''} ${className}`;

  // 如果有title，使用Ant Design的Card头部
  if (title || extra) {
    return (
      <AntCard
        ref={ref}
        title={title}
        extra={extra}
        className={finalClassName}
        style={finalStyle}
        bordered={false}
        {...rest}
      >
        {children}
      </AntCard>
    );
  }

  // 简单卡片
  return (
    <div
      ref={ref}
      className={finalClassName}
      style={finalStyle}
      {...rest}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;