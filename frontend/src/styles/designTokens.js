// 设计系统 - 设计令牌

// 颜色系统
export const colors = {
  // 主色调
  primary: {
    50: '#f0f4ff',
    100: '#dbe4ff',
    200: '#bfccff',
    300: '#91a7ff',
    400: '#748ffc',
    500: '#5c7cfa', // 主色
    600: '#4c63d2',
    700: '#364fc7',
    800: '#2f3f8a',
    900: '#2b3875'
  },

  // 辅助色
  accent: {
    50: '#fff0f6',
    100: '#ffdeeb',
    200: '#fcc2d7',
    300: '#faa2c1',
    400: '#f783ac',
    500: '#f06595', // 强调色
    600: '#e64980',
    700: '#d6336c',
    800: '#c2255c',
    900: '#a61e4d'
  },

  // 语义化颜色
  semantic: {
    success: '#51cf66',
    warning: '#ffd43b',
    error: '#ff6b6b',
    info: '#339af0'
  },

  // 中性色
  neutral: {
    0: '#ffffff',
    50: '#f8f9fa',
    100: '#f1f3f4',
    200: '#e9ecef',
    300: '#dee2e6',
    400: '#ced4da',
    500: '#adb5bd',
    600: '#868e96',
    700: '#495057',
    800: '#343a40',
    900: '#212529',
    950: '#0a0e27'
  },

  // 技术主题色（保持现有的tech变量）
  tech: {
    primary: '#64ffda',
    accent: '#ff6b95',
    background: '#0a0e27',
    surface: '#1a1f3e',
    border: '#2a2f5e',
    text: {
      primary: '#ffffff',
      secondary: '#b8c5d1',
      muted: '#868e96'
    }
  }
};

// 间距系统 (基于4px网格)
export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
  40: '160px',
  48: '192px',
  56: '224px',
  64: '256px'
};

// 字体系统
export const typography = {
  fontFamily: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
    display: ['Inter Display', 'Inter', 'sans-serif']
  },

  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '64px'
  },

  fontWeight: {
    thin: '100',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  },

  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2'
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em'
  }
};

// 圆角系统
export const borderRadius = {
  none: '0',
  sm: '4px',
  base: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px'
};

// 阴影系统
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',

  // 技术主题阴影
  tech: {
    glow: '0 0 20px rgba(100, 255, 218, 0.3)',
    glowAccent: '0 0 20px rgba(255, 107, 149, 0.3)',
    soft: '0 4px 20px rgba(0, 0, 0, 0.3)'
  }
};

// 层级系统
export const zIndex = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modal: '1040',
  popover: '1050',
  tooltip: '1060',
  toast: '1070'
};

// 动画时长
export const duration = {
  75: '75ms',
  100: '100ms',
  150: '150ms',
  200: '200ms',
  300: '300ms',
  500: '500ms',
  700: '700ms',
  1000: '1000ms'
};

// 动画缓动函数
export const easing = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
};

// 布局断点
export const breakpoints = {
  xs: '480px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  '2xl': '1600px'
};

// 组件尺寸系统
export const sizes = {
  xs: {
    height: '24px',
    padding: '4px 8px',
    fontSize: '12px'
  },
  sm: {
    height: '32px',
    padding: '6px 12px',
    fontSize: '14px'
  },
  md: {
    height: '40px',
    padding: '8px 16px',
    fontSize: '16px'
  },
  lg: {
    height: '48px',
    padding: '12px 20px',
    fontSize: '18px'
  },
  xl: {
    height: '56px',
    padding: '16px 24px',
    fontSize: '20px'
  }
};

// 导出所有令牌
export const designTokens = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  zIndex,
  duration,
  easing,
  breakpoints,
  sizes
};

export default designTokens;