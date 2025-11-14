import React from 'react';
import { Row, Col, Typography, Space } from 'antd';
import {
  GithubOutlined,
  TwitterOutlined,
  MailOutlined,
  HeartTwoTone,
  CodeOutlined,
  BookOutlined,
  TeamOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Text, Link } = Typography;

const Footer = () => {
  const { isDarkTheme } = useTheme();
  const { t } = useTranslation('home');

  const footerStyle = {
    background: isDarkTheme
      ? 'linear-gradient(135deg, #0a0e27 0%, #161b3a 50%, #1a1d3e 100%)'
      : '#f8fafc',
    borderTop: isDarkTheme
      ? '1px solid rgba(139, 92, 246, 0.1)'
      : '1px solid #e2e8f0',
    padding: '40px 0 20px',
    marginTop: '0px'
  };

  const linkStyle = {
    color: isDarkTheme ? '#8B949E' : '#64748b',
    transition: 'all 0.3s ease'
  };

  const hoverLinkStyle = {
    color: isDarkTheme ? '#3B82F6' : '#A0783B'
  };

  return (
    <footer style={footerStyle}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px'
      }}>
        <Row justify="space-between" align="middle">
          {/* 品牌信息 */}
          <Col xs={24} md={12}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div style={{
                width: 28,
                height: 28,
                background: isDarkTheme
                  ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 50%, #1E40AF 100%)'
                  : 'linear-gradient(135deg, #A0783B 0%, #B5704A 50%, #8B5A3C 100%)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
                boxShadow: isDarkTheme
                  ? '0 4px 12px rgba(59, 130, 246, 0.3)'
                  : '0 4px 12px rgba(160, 120, 59, 0.3)'
              }}>
                <span style={{
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: 14
                }}>L</span>
              </div>
              <Title level={4} style={{
                color: isDarkTheme ? '#F0F6FC' : '#2D1810',
                margin: 0,
                background: isDarkTheme
                  ? 'linear-gradient(90deg, #F0F6FC, #3B82F6)'
                  : 'linear-gradient(90deg, #2D1810, #A0783B)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                LeadCode
              </Title>
            </div>
            <Text style={{
              color: isDarkTheme ? '#8B949E' : '#64748b',
              fontSize: '14px'
            }}>
              {t('ui.intelligentProgrammingPlatform')}
            </Text>
          </Col>

          {/* 快速链接 */}
          <Col xs={24} md={12} style={{ textAlign: 'right' }}>
            <Space size={24}>
              {[
                { label: t('ui.learningResources'), icon: <CodeOutlined /> },
                { label: t('ui.community'), icon: <TeamOutlined /> },
                { label: t('ui.help'), icon: <BookOutlined /> }
              ].map((item) => (
                <Link
                  key={item.label}
                  href="#"
                  style={{
                    ...linkStyle,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = hoverLinkStyle.color}
                  onMouseLeave={(e) => e.currentTarget.style.color = linkStyle.color}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </Space>
          </Col>
        </Row>

        {/* 分隔线 */}
        <div style={{
          height: '1px',
          background: isDarkTheme
            ? 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(160, 120, 59, 0.3), transparent)',
          margin: '30px 0 15px'
        }} />

        {/* 版权信息 */}
        <Row justify="center" align="middle">
          <Col span={24} style={{ textAlign: 'center' }}>
            <Text style={{
              color: isDarkTheme ? '#8B949E' : '#64748b',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              {t('ui.copyrightText').split(' ❤ ').map((part, index) =>
                index === 0 ? part + ' ' :
                index === 1 ? [<HeartTwoTone key="heart" twoToneColor="#f56565" />, ' ' + part] : part
              )}
            </Text>
          </Col>
        </Row>

        {/* 装饰性元素 */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '100px',
          height: '100px',
          background: isDarkTheme
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(160, 120, 59, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />
      </div>
    </footer>
  );
};

export default Footer;