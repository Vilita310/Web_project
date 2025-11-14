// 组件工厂 - 用于创建一致的组件系统

import React from 'react';
import { designTokens } from '../../styles/designTokens';

// 基础样式生成器
export const createBaseStyles = (variant = 'default', size = 'md', theme = 'tech') => {
  const { colors, spacing, typography, borderRadius, shadows } = designTokens;

  const variantStyles = {
    default: {
      background: colors.tech.surface,
      border: `1px solid ${colors.tech.border}`,
      color: colors.tech.text.primary
    },
    primary: {
      background: colors.tech.primary,
      border: `1px solid ${colors.tech.primary}`,
      color: colors.neutral[900]
    },
    accent: {
      background: colors.tech.accent,
      border: `1px solid ${colors.tech.accent}`,
      color: colors.neutral[0]
    },
    ghost: {
      background: 'transparent',
      border: `1px solid ${colors.tech.border}`,
      color: colors.tech.text.primary
    },
    minimal: {
      background: 'transparent',
      border: 'none',
      color: colors.tech.text.primary
    }
  };

  const sizeStyles = {
    xs: {
      padding: spacing[2],
      fontSize: typography.fontSize.xs,
      borderRadius: borderRadius.sm
    },
    sm: {
      padding: `${spacing[2]} ${spacing[3]}`,
      fontSize: typography.fontSize.sm,
      borderRadius: borderRadius.base
    },
    md: {
      padding: `${spacing[3]} ${spacing[4]}`,
      fontSize: typography.fontSize.base,
      borderRadius: borderRadius.md
    },
    lg: {
      padding: `${spacing[4]} ${spacing[5]}`,
      fontSize: typography.fontSize.lg,
      borderRadius: borderRadius.lg
    },
    xl: {
      padding: `${spacing[5]} ${spacing[6]}`,
      fontSize: typography.fontSize.xl,
      borderRadius: borderRadius.xl
    }
  };

  return {
    ...variantStyles[variant],
    ...sizeStyles[size],
    fontFamily: typography.fontFamily.sans.join(', '),
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.none,
    outline: 'none',
    ':hover': {
      opacity: 0.8,
      transform: 'translateY(-1px)',
      boxShadow: shadows.tech.soft
    },
    ':focus': {
      boxShadow: `0 0 0 2px ${colors.tech.primary}`,
      outline: 'none'
    },
    ':active': {
      transform: 'translateY(0)'
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
      transform: 'none'
    }
  };
};

// 组件属性标准化
export const standardizeProps = (props) => {
  const {
    variant = 'default',
    size = 'md',
    theme = 'tech',
    disabled = false,
    loading = false,
    children,
    className = '',
    style = {},
    ...rest
  } = props;

  return {
    variant,
    size,
    theme,
    disabled,
    loading,
    children,
    className: `tech-component ${className}`,
    style: {
      ...createBaseStyles(variant, size, theme),
      ...style
    },
    ...rest
  };
};

// 响应式属性处理器
export const processResponsiveProps = (props, breakpoint = 'md') => {
  const processed = {};

  Object.keys(props).forEach(key => {
    const value = props[key];

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // 处理响应式对象 {xs: value1, md: value2, lg: value3}
      const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
      const currentIndex = breakpointOrder.indexOf(breakpoint);

      // 从当前断点往下查找值
      for (let i = currentIndex; i >= 0; i--) {
        const bp = breakpointOrder[i];
        if (value[bp] !== undefined) {
          processed[key] = value[bp];
          break;
        }
      }

      // 如果没找到，使用默认值
      if (processed[key] === undefined) {
        processed[key] = value.default || value[breakpointOrder[0]];
      }
    } else {
      processed[key] = value;
    }
  });

  return processed;
};

// 主题注入器
export const withTheme = (Component) => {
  return function ThemedComponent(props) {
    const { theme = 'tech', ...rest } = props;
    const themeConfig = designTokens.colors[theme] || designTokens.colors.tech;

    return React.createElement(Component, {
      ...rest,
      theme: themeConfig,
      designTokens
    });
  };
};

// 状态管理器 - 统一组件状态处理
export const createStateManager = (initialState = {}) => {
  const [state, setState] = React.useState(initialState);

  const updateState = React.useCallback((updates) => {
    setState(prevState => ({
      ...prevState,
      ...(typeof updates === 'function' ? updates(prevState) : updates)
    }));
  }, []);

  const resetState = React.useCallback(() => {
    setState(initialState);
  }, [initialState]);

  return {
    state,
    updateState,
    resetState,
    setState
  };
};

// 组件验证器
export const validateComponentProps = (props, schema) => {
  const errors = [];

  Object.keys(schema).forEach(key => {
    const rule = schema[key];
    const value = props[key];

    // 必需属性检查
    if (rule.required && (value === undefined || value === null)) {
      errors.push(`Property '${key}' is required`);
    }

    // 类型检查
    if (value !== undefined && rule.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== rule.type) {
        errors.push(`Property '${key}' expected ${rule.type}, got ${actualType}`);
      }
    }

    // 枚举值检查
    if (value !== undefined && rule.enum && !rule.enum.includes(value)) {
      errors.push(`Property '${key}' must be one of: ${rule.enum.join(', ')}`);
    }

    // 自定义验证
    if (value !== undefined && rule.validator && !rule.validator(value)) {
      errors.push(`Property '${key}' failed custom validation`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// 常用组件模式
export const ComponentPatterns = {
  // 卡片模式
  card: {
    padding: designTokens.spacing[6],
    background: designTokens.colors.tech.surface,
    border: `1px solid ${designTokens.colors.tech.border}`,
    borderRadius: designTokens.borderRadius.lg,
    boxShadow: designTokens.shadows.tech.soft
  },

  // 表单控件模式
  formControl: {
    padding: `${designTokens.spacing[3]} ${designTokens.spacing[4]}`,
    background: designTokens.colors.tech.background,
    border: `1px solid ${designTokens.colors.tech.border}`,
    borderRadius: designTokens.borderRadius.md,
    fontSize: designTokens.typography.fontSize.base,
    color: designTokens.colors.tech.text.primary,
    transition: 'all 0.2s ease',
    ':focus': {
      borderColor: designTokens.colors.tech.primary,
      boxShadow: `0 0 0 2px ${designTokens.colors.tech.primary}40`,
      outline: 'none'
    }
  },

  // 导航模式
  navigation: {
    padding: `${designTokens.spacing[3]} ${designTokens.spacing[4]}`,
    color: designTokens.colors.tech.text.secondary,
    textDecoration: 'none',
    borderRadius: designTokens.borderRadius.md,
    transition: 'all 0.2s ease',
    ':hover': {
      color: designTokens.colors.tech.text.primary,
      background: designTokens.colors.tech.surface
    }
  },

  // 按钮模式
  button: {
    primary: createBaseStyles('primary', 'md'),
    secondary: createBaseStyles('ghost', 'md'),
    accent: createBaseStyles('accent', 'md'),
    minimal: createBaseStyles('minimal', 'md')
  }
};

// 组件工厂函数
export const createComponent = (baseComponent, defaultProps = {}, patterns = []) => {
  return React.forwardRef((props, ref) => {
    const mergedProps = { ...defaultProps, ...props };
    const standardizedProps = standardizeProps(mergedProps);

    // 应用模式样式
    const patternStyles = patterns.reduce((acc, pattern) => ({
      ...acc,
      ...ComponentPatterns[pattern]
    }), {});

    const finalProps = {
      ...standardizedProps,
      ref,
      style: {
        ...patternStyles,
        ...standardizedProps.style
      }
    };

    return React.createElement(baseComponent, finalProps);
  });
};

export default {
  createBaseStyles,
  standardizeProps,
  processResponsiveProps,
  withTheme,
  createStateManager,
  validateComponentProps,
  ComponentPatterns,
  createComponent
};