import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Select,
  Input,
  Spin,
  Alert,
  Row,
  Col,
  Tag,
  Modal,
  Tabs,
  List,
  message,
  Tooltip,
  Image
} from 'antd';
import {
  PictureOutlined,
  BulbOutlined,
  ReloadOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  EditOutlined,
  EyeOutlined,
  BookOutlined,
  CodeOutlined,
  ThunderboltOutlined,
  ClearOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const AIWhiteboard = ({
  topic = '',
  concept = '',
  onImageGenerated = () => {},
  learningMode = false
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [imageHistory, setImageHistory] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('technical');
  const [explanationVisible, setExplanationVisible] = useState(false);
  const [currentExplanation, setCurrentExplanation] = useState('');

  // 预设的图解样式
  const visualizationStyles = [
    {
      id: 'technical',
      name: '技术图解',
      description: '清晰的技术架构图、流程图',
      prompt: 'technical diagram, clean architecture, flowchart style'
    },
    {
      id: 'conceptual',
      name: '概念图解',
      description: '抽象概念的可视化表达',
      prompt: 'conceptual illustration, abstract visualization, educational diagram'
    },
    {
      id: 'interactive',
      name: '交互式图解',
      description: '用户界面和交互流程',
      prompt: 'user interface mockup, interaction flow, UX design'
    },
    {
      id: 'algorithm',
      name: '算法可视化',
      description: '算法步骤和数据结构',
      prompt: 'algorithm visualization, data structure diagram, step-by-step process'
    },
    {
      id: 'mindmap',
      name: '思维导图',
      description: '知识点关系和层次结构',
      prompt: 'mind map, knowledge tree, hierarchical structure'
    }
  ];

  // 预设的学习主题模板
  const learningTemplates = [
    {
      category: '数据结构',
      topics: [
        { name: '二叉树遍历', prompt: '二叉树的前序、中序、后序遍历过程可视化' },
        { name: '哈希表原理', prompt: '哈希表的存储结构和冲突解决机制图解' },
        { name: '栈和队列', prompt: '栈和队列的数据操作过程演示' }
      ]
    },
    {
      category: '算法原理',
      topics: [
        { name: '快速排序', prompt: '快速排序算法的分治过程步骤图解' },
        { name: '动态规划', prompt: '动态规划的状态转移和最优子结构可视化' },
        { name: 'BFS/DFS', prompt: '广度优先和深度优先搜索的遍历过程对比' }
      ]
    },
    {
      category: '系统架构',
      topics: [
        { name: '微服务架构', prompt: '微服务系统的组件交互和数据流向图' },
        { name: 'RESTful API', prompt: 'REST API的请求响应流程和状态码说明' },
        { name: '数据库设计', prompt: '关系型数据库的表结构和关联关系图' }
      ]
    },
    {
      category: '前端技术',
      topics: [
        { name: 'React生命周期', prompt: 'React组件生命周期的各个阶段流程图' },
        { name: '浏览器渲染', prompt: '浏览器从HTML到页面渲染的完整过程' },
        { name: 'Webpack打包', prompt: 'Webpack模块打包和代码分割的流程图' }
      ]
    }
  ];

  // 生成AI图解
  const generateVisualization = async (customPrompt = '') => {
    setIsGenerating(true);

    try {
      const selectedStyleConfig = visualizationStyles.find(s => s.id === selectedStyle);
      const finalPrompt = customPrompt || prompt || `${topic} ${concept}`;

      // 模拟DALL-E API调用
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 模拟生成的图片数据
      const mockImages = [
        'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop&crop=entropy&q=80',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=entropy&q=80',
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop&crop=entropy&q=80',
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop&crop=entropy&q=80'
      ];

      const imageUrl = mockImages[Math.floor(Math.random() * mockImages.length)];

      const newImage = {
        id: Date.now(),
        url: imageUrl,
        prompt: finalPrompt,
        style: selectedStyleConfig.name,
        timestamp: new Date().toLocaleTimeString(),
        explanation: generateExplanation(finalPrompt)
      };

      setCurrentImage(newImage);
      setImageHistory(prev => [newImage, ...prev]);
      onImageGenerated(newImage);

      message.success('图解生成成功！');

    } catch (error) {
      console.error('图解生成失败:', error);
      message.error('图解生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  // 生成图解说明
  const generateExplanation = (prompt) => {
    const explanations = [
      `这个技术图解清晰地展示了${prompt}的核心概念和实现流程。图中的每个组件都代表了系统中的关键环节，箭头表示数据流向和处理顺序。`,
      `通过这个可视化图解，我们可以更好地理解${prompt}的工作原理。图中使用不同的颜色和形状来区分各个模块的功能和重要性。`,
      `这张图解采用了层次化的设计，从上到下展示了${prompt}的完整架构。每一层都有其特定的职责和作用，相互配合完成整个系统的功能。`,
      `该图解运用了直观的视觉元素来表达抽象的技术概念，帮助学习者快速掌握${prompt}的核心要点和实现细节。`
    ];

    return explanations[Math.floor(Math.random() * explanations.length)];
  };

  // 使用模板生成
  const useTemplate = (template) => {
    setPrompt(template.prompt);
    generateVisualization(template.prompt);
  };

  // 显示图解说明
  const showExplanation = (image) => {
    setCurrentExplanation(image.explanation);
    setExplanationVisible(true);
  };

  return (
    <div style={{ height: '100%' }}>
      <Row gutter={[16, 16]} style={{ height: '100%' }}>
        {/* 左侧生成控制 */}
        <Col span={8}>
          <Card title={<><BulbOutlined /> AI智能白板</>} style={{ height: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {/* 输入区域 */}
              <div>
                <Text strong>描述你想要可视化的内容:</Text>
                <TextArea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="例如：React组件生命周期流程图"
                  style={{ marginTop: 8 }}
                />
              </div>

              {/* 样式选择 */}
              <div>
                <Text strong>选择图解样式:</Text>
                <Select
                  value={selectedStyle}
                  onChange={setSelectedStyle}
                  style={{ width: '100%', marginTop: 8 }}
                >
                  {visualizationStyles.map(style => (
                    <Option key={style.id} value={style.id}>
                      {style.name} - {style.description}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* 生成按钮 */}
              <Button
                type="primary"
                icon={<PictureOutlined />}
                onClick={() => generateVisualization()}
                loading={isGenerating}
                disabled={!prompt.trim()}
                block
                size="large"
              >
                {isGenerating ? '生成中...' : '生成AI图解'}
              </Button>

              {/* 学习模板 */}
              {learningMode && (
                <div>
                  <Text strong>快速模板:</Text>
                  <Tabs size="small" style={{ marginTop: 8 }}>
                    {learningTemplates.map(category => (
                      <TabPane tab={category.category} key={category.category}>
                        <List
                          size="small"
                          dataSource={category.topics}
                          renderItem={(topic) => (
                            <List.Item>
                              <div style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Text style={{ fontSize: '12px' }}>{topic.name}</Text>
                                  <Button
                                    size="small"
                                    type="link"
                                    onClick={() => useTemplate(topic)}
                                  >
                                    使用
                                  </Button>
                                </div>
                              </div>
                            </List.Item>
                          )}
                        />
                      </TabPane>
                    ))}
                  </Tabs>
                </div>
              )}

              {/* 提示信息 */}
              <Alert
                message="AI白板提示"
                description="描述越具体，生成的图解越精准。支持中英文输入，建议包含关键技术术语。"
                type="info"
                showIcon
                style={{ fontSize: '11px' }}
              />
            </Space>
          </Card>
        </Col>

        {/* 右侧图解显示 */}
        <Col span={16}>
          <Card
            title="图解显示区域"
            extra={
              currentImage && (
                <Space>
                  <Tooltip title="查看说明">
                    <Button
                      icon={<EyeOutlined />}
                      onClick={() => showExplanation(currentImage)}
                    />
                  </Tooltip>
                  <Tooltip title="下载图片">
                    <Button icon={<DownloadOutlined />} />
                  </Tooltip>
                  <Tooltip title="分享">
                    <Button icon={<ShareAltOutlined />} />
                  </Tooltip>
                </Space>
              )
            }
            style={{ height: '100%' }}
          >
            {isGenerating ? (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text>AI正在生成图解...</Text>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    根据您的描述创建专业的可视化图解
                  </Text>
                </div>
              </div>
            ) : currentImage ? (
              <div style={{ textAlign: 'center' }}>
                <Image
                  src={currentImage.url}
                  alt="AI生成的图解"
                  style={{ maxWidth: '100%', maxHeight: '400px' }}
                  placeholder={
                    <div style={{ padding: '100px', background: '#f0f0f0' }}>
                      <PictureOutlined style={{ fontSize: '48px', color: '#ccc' }} />
                    </div>
                  }
                />
                <div style={{ marginTop: 16, textAlign: 'left' }}>
                  <Space wrap>
                    <Tag color="blue">{currentImage.style}</Tag>
                    <Tag color="green">{currentImage.timestamp}</Tag>
                  </Space>
                  <Paragraph style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                    提示词: {currentImage.prompt}
                  </Paragraph>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <PictureOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">输入描述并点击生成，AI将为您创建专业图解</Text>
                </div>
              </div>
            )}

            {/* 历史记录 */}
            {imageHistory.length > 1 && (
              <div style={{ marginTop: 24 }}>
                <Text strong>历史图解:</Text>
                <div style={{ marginTop: 8, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {imageHistory.slice(1, 4).map((image) => (
                    <div
                      key={image.id}
                      style={{
                        width: '80px',
                        height: '60px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}
                      onClick={() => setCurrentImage(image)}
                    >
                      <img
                        src={image.url}
                        alt="历史图解"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 图解说明模态框 */}
      <Modal
        title="图解说明"
        visible={explanationVisible}
        onCancel={() => setExplanationVisible(false)}
        footer={[
          <Button key="close" onClick={() => setExplanationVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <Paragraph>{currentExplanation}</Paragraph>
      </Modal>
    </div>
  );
};

export default AIWhiteboard;