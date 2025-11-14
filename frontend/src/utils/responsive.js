// 响应式断点配置
export const breakpoints = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600
};

// 媒体查询生成器
export const media = {
  xs: `@media (max-width: ${breakpoints.xs}px)`,
  sm: `@media (max-width: ${breakpoints.sm}px)`,
  md: `@media (max-width: ${breakpoints.md}px)`,
  lg: `@media (max-width: ${breakpoints.lg}px)`,
  xl: `@media (max-width: ${breakpoints.xl}px)`,
  xxl: `@media (max-width: ${breakpoints.xxl}px)`,

  // 最小宽度
  minXs: `@media (min-width: ${breakpoints.xs + 1}px)`,
  minSm: `@media (min-width: ${breakpoints.sm + 1}px)`,
  minMd: `@media (min-width: ${breakpoints.md + 1}px)`,
  minLg: `@media (min-width: ${breakpoints.lg + 1}px)`,
  minXl: `@media (min-width: ${breakpoints.xl + 1}px)`,
  minXxl: `@media (min-width: ${breakpoints.xxl + 1}px)`,

  // 范围查询
  only: {
    xs: `@media (max-width: ${breakpoints.xs}px)`,
    sm: `@media (min-width: ${breakpoints.xs + 1}px) and (max-width: ${breakpoints.sm}px)`,
    md: `@media (min-width: ${breakpoints.sm + 1}px) and (max-width: ${breakpoints.md}px)`,
    lg: `@media (min-width: ${breakpoints.md + 1}px) and (max-width: ${breakpoints.lg}px)`,
    xl: `@media (min-width: ${breakpoints.lg + 1}px) and (max-width: ${breakpoints.xl}px)`,
    xxl: `@media (min-width: ${breakpoints.xl + 1}px)`
  }
};

// Hook for detecting screen size
export const useResponsive = () => {
  const [screenSize, setScreenSize] = React.useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  const [currentBreakpoint, setCurrentBreakpoint] = React.useState('lg');

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreenSize({ width, height });

      // 确定当前断点
      if (width <= breakpoints.xs) setCurrentBreakpoint('xs');
      else if (width <= breakpoints.sm) setCurrentBreakpoint('sm');
      else if (width <= breakpoints.md) setCurrentBreakpoint('md');
      else if (width <= breakpoints.lg) setCurrentBreakpoint('lg');
      else if (width <= breakpoints.xl) setCurrentBreakpoint('xl');
      else setCurrentBreakpoint('xxl');
    };

    handleResize(); // 初始调用

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    ...screenSize,
    breakpoint: currentBreakpoint,
    isMobile: screenSize.width <= breakpoints.md,
    isTablet: screenSize.width > breakpoints.md && screenSize.width <= breakpoints.lg,
    isDesktop: screenSize.width > breakpoints.lg,
    isSmallScreen: screenSize.width <= breakpoints.sm,
    isLargeScreen: screenSize.width > breakpoints.xl
  };
};

// 响应式样式生成器
export const generateResponsiveStyles = (styles) => {
  const result = {};

  Object.keys(styles).forEach(key => {
    if (key.startsWith('_')) {
      // 处理响应式属性 (例如: _sm, _md, _lg)
      const breakpoint = key.substring(1);
      if (media[breakpoint]) {
        result[media[breakpoint]] = styles[key];
      }
    } else {
      result[key] = styles[key];
    }
  });

  return result;
};

// 根据屏幕尺寸获取值
export const getResponsiveValue = (values, breakpoint) => {
  if (typeof values !== 'object') return values;

  const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);

  // 从当前断点往下查找，直到找到值
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }

  // 如果没找到，返回默认值
  return values.default || values[breakpointOrder[0]];
};

// 常用的响应式配置
export const responsiveConfig = {
  // 栅格配置
  grid: {
    mobile: { xs: 24, sm: 24, md: 12, lg: 8, xl: 6 },
    tablet: { xs: 24, sm: 12, md: 8, lg: 6, xl: 4 },
    desktop: { xs: 24, sm: 12, md: 6, lg: 4, xl: 3 }
  },

  // 间距配置
  spacing: {
    mobile: { padding: '12px', margin: '8px', gap: '8px' },
    tablet: { padding: '16px', margin: '12px', gap: '12px' },
    desktop: { padding: '24px', margin: '16px', gap: '16px' }
  },

  // 字体大小配置
  fontSize: {
    title: { xs: '18px', sm: '20px', md: '24px', lg: '28px', xl: '32px' },
    subtitle: { xs: '14px', sm: '16px', md: '18px', lg: '20px', xl: '22px' },
    body: { xs: '12px', sm: '14px', md: '14px', lg: '16px', xl: '16px' },
    caption: { xs: '10px', sm: '11px', md: '12px', lg: '12px', xl: '13px' }
  }
};