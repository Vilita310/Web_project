import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // 从localStorage获取主题设置，默认为浅色主题
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const saved = localStorage.getItem('leadcode-theme');
    return saved ? JSON.parse(saved) : false;
  });

  // 切换主题
  const toggleTheme = () => {
    setIsDarkTheme(prev => {
      const newTheme = !prev;
      localStorage.setItem('leadcode-theme', JSON.stringify(newTheme));
      return newTheme;
    });
  };

  // 获取主题类名
  const getThemeClass = () => {
    return isDarkTheme ? 'tech-theme' : 'light-theme';
  };

  // 保存主题设置到localStorage
  useEffect(() => {
    localStorage.setItem('leadcode-theme', JSON.stringify(isDarkTheme));
  }, [isDarkTheme]);

  const value = {
    isDarkTheme,
    toggleTheme,
    getThemeClass
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;