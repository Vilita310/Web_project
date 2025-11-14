import React from 'react';
import { Button, Dropdown, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import '../styles/techTheme.css';

const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation('common');
  const { isDarkTheme } = useTheme();

  const toggleLanguage = () => {
    // 统一使用完整语言代码，提升AI语言切换的准确性
    const currentLang = i18n.language;
    const newLang = (currentLang === 'zh-CN' || currentLang === 'zh') ? 'en' : 'zh-CN';
    console.log('🌐 Language switch:', currentLang, '->', newLang);
    i18n.changeLanguage(newLang);
  };

  return (
    <Button
      onClick={toggleLanguage}
      style={{
        background: 'transparent',
        border: isDarkTheme ? '1px solid #444' : '1px solid #e5e7eb',
        color: isDarkTheme ? '#cbd5e1' : '#6b7280',
        borderRadius: '4px',
        padding: '4px 8px',
        height: '32px',
        fontSize: '14px',
        cursor: 'pointer'
      }}
    >
      {(i18n.language === 'zh-CN' || i18n.language === 'zh') ? 'EN' : '中'}
    </Button>
  );
};

export default LanguageSwitcher;