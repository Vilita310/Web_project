import React from 'react';
import { Button as AntButton } from 'antd';
import { createBaseStyles, standardizeProps } from './ComponentFactory';
import { designTokens } from '../../styles/designTokens';

const Button = React.forwardRef((props, ref) => {
  const {
    variant = 'default',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    iconPosition = 'left',
    children,
    className = '',
    style = {},
    ...rest
  } = props;

  // 从rest中移除disabled以避免重复属性
  const { disabled: _, ...restProps } = rest;

  // 创建样式
  const baseStyles = createBaseStyles(variant, size);

  // 合并样式
  const buttonStyle = {
    ...baseStyles,
    ...style,
    // 覆盖Ant Design默认样式
    border: baseStyles.border,
    background: baseStyles.background,
    color: baseStyles.color,
    height: 'auto',
    padding: baseStyles.padding,
    fontSize: baseStyles.fontSize,
    borderRadius: baseStyles.borderRadius,
    fontWeight: designTokens.typography.fontWeight.medium
  };

  // 处理变体特殊样式
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'ant-btn-primary tech-button-primary';
      case 'accent':
        return 'tech-button-accent';
      case 'ghost':
        return 'ant-btn-ghost tech-button-ghost';
      case 'minimal':
        return 'tech-button-minimal';
      default:
        return 'tech-button-default';
    }
  };

  const finalClassName = `tech-button ${getVariantClass()} ${className}`;

  return (
    <AntButton
      ref={ref}
      loading={loading}
      disabled={disabled}
      className={finalClassName}
      style={buttonStyle}
      {...restProps}
    >
      {icon && iconPosition === 'left' && (
        <span className="tech-button-icon tech-button-icon-left" style={{ marginRight: '8px' }}>
          {icon}
        </span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="tech-button-icon tech-button-icon-right" style={{ marginLeft: '8px' }}>
          {icon}
        </span>
      )}
    </AntButton>
  );
});

Button.displayName = 'Button';

export default Button;