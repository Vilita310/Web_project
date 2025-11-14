import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Select, Space, Row, Col, Card } from 'antd';
import { PlayCircleOutlined, CodeOutlined, ClockCircleOutlined, StarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { mockInterviewData, difficulties } from '../../data/mockInterviewData';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Text } = Typography;
const { Option } = Select;

const MinimalMockInterview = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('home');
  const { isDarkTheme } = useTheme();
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 获取过滤后的题目
  const getFilteredProblems = () => {
    let allProblems = [];
    Object.entries(mockInterviewData).forEach(([categoryId, category]) => {
      category.problems.forEach(problem => {
        allProblems.push({
          ...problem,
          categoryId,
          categoryName: category.name
        });
      });
    });

    if (selectedCategory !== 'all') {
      allProblems = allProblems.filter(p => p.categoryId === selectedCategory);
    }
    if (selectedDifficulty !== 'all') {
      allProblems = allProblems.filter(p => p.difficulty === selectedDifficulty);
    }

    return allProblems;
  };

  // 开始面试
  const startInterview = (problemId, categoryId) => {
    navigate(`/interview/session/${problemId}?category=${categoryId}`);
  };

  // 获取难度颜色和样式
  const getDifficultyStyle = (difficulty) => {
    switch(difficulty) {
      case 'Easy':
        return {
          color: '#52c41a',
          background: 'rgba(82, 196, 26, 0.1)',
          border: '1px solid rgba(82, 196, 26, 0.3)'
        };
      case 'Medium':
        return {
          color: '#faad14',
          background: 'rgba(250, 173, 20, 0.1)',
          border: '1px solid rgba(250, 173, 20, 0.3)'
        };
      case 'Hard':
        return {
          color: '#ff4d4f',
          background: 'rgba(255, 77, 79, 0.1)',
          border: '1px solid rgba(255, 77, 79, 0.3)'
        };
      default:
        return {
          color: '#8c8c8c',
          background: 'rgba(140, 140, 140, 0.1)',
          border: '1px solid rgba(140, 140, 140, 0.3)'
        };
    }
  };

  const filteredProblems = getFilteredProblems();

  return (
    <>
      <style>
        {isDarkTheme ? `
          .select-dark-mode .ant-select-selector {
            background-color: rgba(33, 38, 45, 0.8) !important;
            border-color: #30363d !important;
            color: #f0f6fc !important;
          }
          .select-dark-mode .ant-select-selection-item {
            color: #f0f6fc !important;
          }
          .select-dark-mode .ant-select-selection-placeholder {
            color: #8b949e !important;
          }
          .select-dark-mode .ant-select-arrow {
            color: #f0f6fc !important;
          }
          .select-dark-mode:hover .ant-select-selector {
            border-color: #58a6ff !important;
          }
        ` : ''}
      </style>
      <div style={{
        minHeight: '100vh',
        background: isDarkTheme
          ? 'linear-gradient(135deg, #0a0e27 0%, #1a1d3e 50%, #2a2d4e 100%)'
          : '#F5F1E8',
        padding: '40px 24px'
      }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          <Title level={1} style={{
            color: isDarkTheme ? '#f0f6fc' : '#2d180f',
            margin: '0 0 16px 0',
            fontWeight: '700',
            fontSize: '36px',
            background: isDarkTheme
              ? 'linear-gradient(135deg, #f0f6fc 0%, #c9d1d9 100%)'
              : 'linear-gradient(135deg, #2d180f 0%, #8d6e63 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {t('ui.mockInterviewPage.title')}
          </Title>
          <Text style={{
            color: isDarkTheme ? '#8b949e' : '#8d6e63',
            fontSize: '16px',
            display: 'block',
            whiteSpace: 'nowrap',
            margin: '0 auto'
          }}>
            {t('ui.mockInterviewPage.subtitle')}
          </Text>
        </div>

        {/* Filter Section */}
        <div style={{
          background: isDarkTheme
            ? 'rgba(255, 255, 255, 0.03)'
            : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          border: isDarkTheme
            ? '1px solid rgba(255, 255, 255, 0.08)'
            : '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '40px'
        }}>
          <Row gutter={[24, 16]} align="middle" justify="center">
            <Col>
              <Space direction="vertical" size={8} style={{ textAlign: 'center' }}>
                <Text style={{
                  color: isDarkTheme ? '#f0f6fc' : '#2d180f',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {t('ui.mockInterviewPage.filterCategory')}
                </Text>
                <Select
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  style={{
                    width: '180px'
                  }}
                  size="large"
                  dropdownStyle={{
                    background: isDarkTheme ? '#21262d' : '#ffffff',
                    border: isDarkTheme ? '1px solid #30363d' : '1px solid #d1d9e0'
                  }}
                  className={isDarkTheme ? 'select-dark-mode' : ''}
                >
                  <Option value="all">{t('ui.mockInterviewPage.allCategories')}</Option>
                  {Object.entries(mockInterviewData).map(([id, category]) => (
                    <Option key={id} value={id}>
                      {t(`ui.mockInterviewData.categories.${category.name}`) || category.name}
                    </Option>
                  ))}
                </Select>
              </Space>
            </Col>
            <Col>
              <Space direction="vertical" size={8} style={{ textAlign: 'center' }}>
                <Text style={{
                  color: isDarkTheme ? '#f0f6fc' : '#2d180f',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {t('ui.mockInterviewPage.filterDifficulty')}
                </Text>
                <Select
                  value={selectedDifficulty}
                  onChange={setSelectedDifficulty}
                  style={{
                    width: '150px'
                  }}
                  size="large"
                  dropdownStyle={{
                    background: isDarkTheme ? '#21262d' : '#ffffff',
                    border: isDarkTheme ? '1px solid #30363d' : '1px solid #d1d9e0'
                  }}
                  className={isDarkTheme ? 'select-dark-mode' : ''}
                >
                  <Option value="all">{t('ui.mockInterviewPage.allLevels')}</Option>
                  {Object.keys(difficulties).map(diffName => (
                    <Option key={diffName} value={diffName}>{diffName}</Option>
                  ))}
                </Select>
              </Space>
            </Col>
            <Col>
              <div style={{
                background: isDarkTheme
                  ? 'rgba(88, 166, 255, 0.1)'
                  : 'rgba(139, 69, 19, 0.1)',
                border: isDarkTheme
                  ? '1px solid rgba(88, 166, 255, 0.3)'
                  : '1px solid rgba(139, 69, 19, 0.3)',
                borderRadius: '12px',
                padding: '12px 20px',
                textAlign: 'center'
              }}>
                <Text style={{
                  color: isDarkTheme ? '#58a6ff' : '#8b4513',
                  fontSize: '18px',
                  fontWeight: '600'
                }}>
                  {filteredProblems.length}
                </Text>
                <br />
                <Text style={{
                  color: isDarkTheme ? '#8b949e' : '#8d6e63',
                  fontSize: '12px'
                }}>
                  {t('ui.mockInterviewPage.problems')}
                </Text>
              </div>
            </Col>
          </Row>
        </div>

        {/* Problems Grid */}
        <Row gutter={[20, 20]}>
          {filteredProblems.map((problem, index) => {
            const difficultyStyle = getDifficultyStyle(problem.difficulty);
            return (
              <Col xs={24} sm={12} md={8} lg={6} key={`${problem.categoryId}-${problem.id}`}>
                <Card
                  style={{
                    height: '100%',
                    background: 'transparent',
                    backdropFilter: 'blur(20px)',
                    border: isDarkTheme
                      ? '1px solid rgba(88, 166, 255, 0.2)'
                      : '1px solid rgba(255, 152, 0, 0.3)',
                    borderRadius: '16px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  bodyStyle={{
                    padding: '0',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  hoverable
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = isDarkTheme
                      ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                      : '0 8px 32px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    padding: '24px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: isDarkTheme
                      ? 'rgba(255, 255, 255, 0.03)'
                      : 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '16px'
                  }}>
                    <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '16px' }}>
                      <Title level={4} style={{
                        color: isDarkTheme ? '#f0f6fc' : '#A0783B',
                        margin: '0 0 8px 0',
                        fontSize: '18px',
                        fontWeight: '600',
                        lineHeight: '1.4'
                      }}>
                        {t(`ui.mockInterviewData.problems.${problem.title}`) || problem.title}
                      </Title>
                      <Text style={{
                        color: isDarkTheme ? '#8b949e' : '#5A5A5A',
                        fontSize: '13px'
                      }}>
                        {t(`ui.mockInterviewData.categories.${problem.categoryName}`) || problem.categoryName}
                      </Text>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <Space wrap size={[8, 8]}>
                        <div style={{
                          ...difficultyStyle,
                          padding: '4px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {problem.difficulty}
                        </div>
                        {problem.timeLimit && (
                          <div style={{
                            background: isDarkTheme
                              ? 'rgba(255, 255, 255, 0.1)'
                              : 'rgba(0, 0, 0, 0.05)',
                            border: isDarkTheme
                              ? '1px solid rgba(255, 255, 255, 0.2)'
                              : '1px solid rgba(0, 0, 0, 0.1)',
                            color: isDarkTheme ? '#8b949e' : '#8d6e63',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <ClockCircleOutlined style={{ fontSize: '10px' }} />
                            {problem.timeLimit}m
                          </div>
                        )}
                      </Space>
                    </div>

                    {problem.tags && (
                      <div style={{ marginBottom: '20px' }}>
                        <Space wrap size={[6, 6]}>
                          {problem.tags.slice(0, 3).map(tag => (
                            <div key={tag} style={{
                              background: isDarkTheme
                                ? 'rgba(88, 166, 255, 0.1)'
                                : 'rgba(90, 90, 90, 0.1)',
                              color: isDarkTheme ? '#58a6ff' : '#5A5A5A',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '500'
                            }}>
                              {t(`ui.mockInterviewData.tags.${tag}`) || tag}
                            </div>
                          ))}
                          {problem.tags.length > 3 && (
                            <div style={{
                              color: isDarkTheme ? '#6e7681' : '#a1887f',
                              fontSize: '11px'
                            }}>
                              +{problem.tags.length - 3}
                            </div>
                          )}
                        </Space>
                      </div>
                    )}
                  </div>

                    <Button
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={() => startInterview(problem.id, problem.categoryId)}
                      size="large"
                      style={{
                        width: '100%',
                        height: '44px',
                        background: isDarkTheme
                          ? 'linear-gradient(135deg, #4a90e2 0%, #5a9fd8 100%)'
                          : 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '14px',
                        boxShadow: isDarkTheme
                          ? '0 4px 16px rgba(0, 0, 0, 0.3)'
                          : '0 4px 16px rgba(139, 69, 19, 0.3)'
                      }}
                    >
                      {t('ui.mockInterviewPage.startInterview')}
                    </Button>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>

        {filteredProblems.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: isDarkTheme
              ? 'rgba(255, 255, 255, 0.03)'
              : 'rgba(255, 255, 255, 0.7)',
            borderRadius: '16px',
            border: isDarkTheme
              ? '1px solid rgba(255, 255, 255, 0.08)'
              : '1px solid rgba(255, 255, 255, 0.5)'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
              opacity: 0.5
            }}>
              🔍
            </div>
            <Title level={3} style={{
              color: isDarkTheme ? '#8b949e' : '#8d6e63',
              margin: '0 0 8px 0'
            }}>
              {t('ui.mockInterviewPage.noProblemsTitle')}
            </Title>
            <Text style={{
              color: isDarkTheme ? '#6e7681' : '#a1887f',
              fontSize: '14px'
            }}>
              {t('ui.mockInterviewPage.noProblemsDesc')}
            </Text>
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default MinimalMockInterview;