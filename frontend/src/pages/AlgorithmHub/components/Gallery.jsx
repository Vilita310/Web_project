import React, { useState } from 'react';
import { Card, Typography, Tag, Badge, Avatar, Space, Tooltip, Modal, Button } from 'antd';
import '../../../styles/techTheme.css';
import {
  PictureOutlined,
  HeartOutlined,
  EyeOutlined,
  ShareAltOutlined,
  PlayCircleOutlined,
  StarOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const GalleryComponent = ({
  selectedPattern,
  onArtworkSelect
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewArtwork, setPreviewArtwork] = useState(null);

  // 模拟用户作品数据
  const artworkData = [
    {
      id: 1,
      title: "双指针算法可视化",
      description: "用户手绘的双指针移动过程",
      author: "小明",
      avatar: "https://joeschmoe.io/api/v1/random",
      likes: 24,
      views: 156,
      chapterId: "array_string",
      patternId: "two_pointers",
      thumbnail: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gPGRlZnM+IDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPiA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNDI5OGZmIiBzdG9wLW9wYWNpdHk9IjAuOCIvPiA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM4NmQ2ZmYiIHN0b3Atb3BhY2l0eT0iMC42Ii8+IDwvbGluZWFyR3JhZGllbnQ+IDwvZGVmcz4gPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmFkaWVudCkiLz4gPGNpcmNsZSBjeD0iNDAiIGN5PSI2MCIgcj0iMTUiIGZpbGw9IiNmZmYiIHN0cm9rZT0iIzQyOThmZiIgc3Ryb2tlLXdpZHRoPSIyIi8+IDxjaXJjbGUgY3g9IjE2MCIgY3k9IjYwIiByPSIxNSIgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjZmY0ZDRmIiBzdHJva2Utd2lkdGg9IjIiLz4gPGxpbmUgeDE9IjQwIiB5MT0iODAiIHgyPSIxNjAiIHkyPSI4MCIgc3Ryb2tlPSIjZGRkIiBzdHJva2Utd2lkdGg9IjIiLz4gPHRleHQgeD0iMTAwIiB5PSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMzMzIj7ljY7mjIfpl7Q8L3RleHQ+IDwvc3ZnPg==",
      tags: ["手绘", "算法", "双指针"],
      difficulty: "简单",
      created: "2024-01-15"
    },
    {
      id: 2,
      title: "链表遍历动画",
      description: "快慢指针检测环的可视化",
      author: "算法小能手",
      avatar: "https://joeschmoe.io/api/v1/random",
      likes: 38,
      views: 289,
      chapterId: "linked_list",
      patternId: "fast_slow_pointers",
      thumbnail: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gPGRlZnM+IDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQyIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4gPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzcyMmVkMSIgc3RvcC1vcGFjaXR5PSIwLjgiLz4gPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjYWQ2ZWZmIiBzdG9wLW9wYWNpdHk9IjAuNiIvPiA8L2xpbmVhckdyYWRpZW50PiA8L2RlZnM+IDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZGllbnQyKSIvPiA8Y2lyY2xlIGN4PSIzMCIgY3k9IjYwIiByPSIxMiIgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjNzIyZWQxIiBzdHJva2Utd2lkdGg9IjIiLz4gPGNpcmNsZSBjeD0iODAiIGN5PSI2MCIgcj0iMTIiIGZpbGw9IiNmZmYiIHN0cm9rZT0iIzcyMmVkMSIgc3Ryb2tlLXdpZHRoPSIyIi8+IDxjaXJjbGUgY3g9IjEzMCIgY3k9IjYwIiByPSIxMiIgZmlsbD0iI2ZmZiIgc3Ryb2tlPSIjNzIyZWQxIiBzdHJva2Utd2lkdGg9IjIiLz4gPGxpbmUgeDE9IjQyIiB5MT0iNjAiIHgyPSI2OCIgeTI9IjYwIiBzdHJva2U9IiM3MjJlZDEiIHN0cm9rZS13aWR0aD0iMyIgbWFya2VyLWVuZD0idXJsKCNhcnJvdykiLz4gPGxpbmUgeDE9IjkyIiB5MT0iNjAiIHgyPSIxMTgiIHkyPSI2MCIgc3Ryb2tlPSIjNzIyZWQxIiBzdHJva2Utd2lkdGg9IjMiLz4gPHRleHQgeD0iMTAwIiB5PSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMzMzIj7pk77ooag8L3RleHQ+IDwvc3ZnPg==",
      tags: ["动画", "链表", "快慢指针"],
      difficulty: "中等",
      created: "2024-01-20"
    },
    {
      id: 3,
      title: "滑动窗口演示",
      description: "字符串滑动窗口的手绘过程",
      author: "视觉学习者",
      avatar: "https://joeschmoe.io/api/v1/random",
      likes: 15,
      views: 98,
      chapterId: "array_string",
      patternId: "sliding_window",
      thumbnail: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gPGRlZnM+IDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQzIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4gPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzUyYzQxYSIgc3RvcC1vcGFjaXR5PSIwLjgiLz4gPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjOTVkZTY0IiBzdG9wLW9wYWNpdHk9IjAuNiIvPiA8L2xpbmVhckdyYWRpZW50PiA8L2RlZnM+IDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZGllbnQzKSIvPiA8cmVjdCB4PSIyMCIgeT0iNDAiIHdpZHRoPSIzMCIgaGVpZ2h0PSI0MCIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjgpIiBzdHJva2U9IiM1MmM0MWEiIHN0cm9rZS13aWR0aD0iMiIgcng9IjQiLz4gPHJlY3QgeD0iNjAiIHk9IjQwIiB3aWR0aD0iMzAiIGhlaWdodD0iNDAiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC42KSIgc3Ryb2tlPSIjNTJjNDFhIiBzdHJva2Utd2lkdGg9IjEiIHJ4PSI0Ii8+IDxyZWN0IHg9IjEwMCIgeT0iNDAiIHdpZHRoPSIzMCIgaGVpZ2h0PSI0MCIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjQpIiBzdHJva2U9IiM1MmM0MWEiIHN0cm9rZS13aWR0aD0iMSIgcng9IjQiLz4gPHRleHQgeD0iMTAwIiB5PSIzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjMzMzIj7mu5Hliqjnqpflj6M8L3RleHQ+IDwvc3ZnPg==",
      tags: ["滑动窗口", "字符串", "手绘"],
      difficulty: "中等",
      created: "2024-01-18"
    }
  ];

  // 过滤作品（根据选中的模式）
  const filteredArtworks = selectedPattern
    ? artworkData.filter(artwork => artwork.patternId === selectedPattern)
    : artworkData;

  // 预览作品
  const handlePreviewArtwork = (artwork) => {
    setPreviewArtwork(artwork);
    setPreviewVisible(true);
  };

  // 难度颜色配置
  const difficultyColors = {
    '简单': 'green',
    '中等': 'orange',
    '困难': 'red'
  };

  // 渲染作品卡片 - 重构版本
  const renderArtworkCard = (artwork) => (
    <div
      key={artwork.id}
      className="modern-artwork-card"
      onClick={() => handlePreviewArtwork(artwork)}
    >
      {/* 卡片头部 - 缩略图和覆盖层 */}
      <div className="artwork-image-container">
        <img
          src={artwork.thumbnail}
          alt={artwork.title}
          className="artwork-thumbnail"
        />
        <div className="artwork-overlay">
          <div className="overlay-content">
            <EyeOutlined className="preview-icon" />
            <Text className="preview-text">预览作品</Text>
          </div>
        </div>

        {/* 难度标签 */}
        <div className="difficulty-badge">
          <Tag color={difficultyColors[artwork.difficulty]} className="difficulty-tag">
            {artwork.difficulty}
          </Tag>
        </div>
      </div>

      {/* 卡片内容区域 */}
      <div className="artwork-info">
        {/* 标题和统计 */}
        <div className="artwork-header-modern">
          <Title level={5} className="artwork-title-modern" ellipsis={{ rows: 1 }}>
            {artwork.title}
          </Title>
          <div className="artwork-stats">
            <Space size={4}>
              <HeartOutlined className="stat-icon" />
              <Text className="stat-number">{artwork.likes}</Text>
            </Space>
            <Space size={4}>
              <EyeOutlined className="stat-icon" />
              <Text className="stat-number">{artwork.views}</Text>
            </Space>
          </div>
        </div>

        {/* 描述 */}
        <Text
          className="artwork-description-modern"
          ellipsis={{ rows: 2 }}
        >
          {artwork.description}
        </Text>

        {/* 标签区域 */}
        <div className="artwork-tags-modern">
          {artwork.tags.slice(0, 2).map(tag => (
            <span key={tag} className="modern-tag">
              {tag}
            </span>
          ))}
          {artwork.tags.length > 2 && (
            <span className="more-tags">+{artwork.tags.length - 2}</span>
          )}
        </div>

        {/* 作者信息和操作 */}
        <div className="artwork-footer-modern">
          <div className="author-info">
            <Avatar size={20} src={artwork.avatar} className="author-avatar" />
            <Text className="author-name">{artwork.author}</Text>
          </div>

          <Button
            type="primary"
            size="small"
            icon={<PlayCircleOutlined />}
            className="use-artwork-btn"
            onClick={(e) => {
              e.stopPropagation();
              onArtworkSelect(artwork);
            }}
          >
            使用
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="modern-gallery-container">
      {/* 重构的标题区域 */}
      <div className="gallery-header">
        <div className="header-left">
          <div className="header-icon">
            <PictureOutlined />
          </div>
          <Title level={4} className="gallery-title">
            学习作品集
          </Title>
          {selectedPattern && (
            <div className="pattern-badge">
              <Badge
                count={filteredArtworks.length}
                style={{
                  backgroundColor: 'var(--tech-primary)',
                  boxShadow: '0 0 8px rgba(0, 212, 255, 0.6)'
                }}
              />
            </div>
          )}
        </div>

        <div className="header-right">
          <Text className="gallery-subtitle">
            优秀学习作品展示
          </Text>
        </div>
      </div>

      {/* 重构的作品网格 */}
      <div className="modern-artworks-grid">
        {filteredArtworks.length > 0 ? (
          filteredArtworks.map(renderArtworkCard)
        ) : (
          <div className="modern-empty-gallery">
            <div className="empty-icon">
              <PictureOutlined />
            </div>
            <Title level={5} className="empty-title">暂无相关作品</Title>
            <Text className="empty-description">
              选择不同的算法模式查看相关学习作品
            </Text>
          </div>
        )}
      </div>

      {/* 预览模态框 */}
      <Modal
        title={previewArtwork?.title}
        visible={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Space key="actions">
            <Button icon={<HeartOutlined />}>
              点赞 ({previewArtwork?.likes})
            </Button>
            <Button icon={<ShareAltOutlined />}>
              分享
            </Button>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => {
                onArtworkSelect(previewArtwork);
                setPreviewVisible(false);
              }}
            >
              使用此作品学习
            </Button>
          </Space>
        ]}
        width={600}
      >
        {previewArtwork && (
          <div className="artwork-preview">
            <img
              src={previewArtwork.thumbnail}
              alt={previewArtwork.title}
              style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }}
            />

            <div className="preview-info">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>描述：</Text>
                  <Text>{previewArtwork.description}</Text>
                </div>

                <div>
                  <Text strong>作者：</Text>
                  <Space>
                    <Avatar size="small" src={previewArtwork.avatar} />
                    <Text>{previewArtwork.author}</Text>
                  </Space>
                </div>

                <div>
                  <Text strong>标签：</Text>
                  <Space wrap>
                    {previewArtwork.tags.map(tag => (
                      <Tag key={tag} color="blue">{tag}</Tag>
                    ))}
                  </Space>
                </div>

                <div className="preview-stats">
                  <Space size={24}>
                    <Space>
                      <HeartOutlined />
                      <Text>{previewArtwork.likes} 点赞</Text>
                    </Space>
                    <Space>
                      <EyeOutlined />
                      <Text>{previewArtwork.views} 查看</Text>
                    </Space>
                    <Space>
                      <StarOutlined />
                      <Tag color={difficultyColors[previewArtwork.difficulty]}>
                        {previewArtwork.difficulty}
                      </Tag>
                    </Space>
                  </Space>
                </div>
              </Space>
            </div>
          </div>
        )}
      </Modal>

      <style jsx>{`
        /* 现代化画廊容器 */
        .modern-gallery-container {
          background: linear-gradient(145deg, rgba(15, 18, 42, 0.98), rgba(26, 29, 62, 0.95));
          border: 1px solid rgba(0, 212, 255, 0.25);
          borderRadius: 20px;
          backdropFilter: blur(30px);
          boxShadow:
            0 16px 48px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(0, 212, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          padding: 28px;
          height: 100%;
          position: relative;
          overflow: hidden;
        }

        .modern-gallery-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            radial-gradient(circle at 20% 20%, rgba(0, 212, 255, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(114, 46, 209, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(0, 255, 255, 0.04) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        .modern-gallery-container > * {
          position: relative;
          z-index: 1;
        }

        /* 画廊标题区域 */
        .gallery-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(0, 212, 255, 0.2);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, var(--tech-primary), var(--tech-secondary));
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
          font-size: 16px;
          font-weight: bold;
        }

        .gallery-title {
          margin: 0 !important;
          color: var(--tech-text-primary) !important;
          font-weight: 600;
          font-size: 18px;
        }

        .pattern-badge {
          position: relative;
        }

        .gallery-subtitle {
          color: var(--tech-text-secondary);
          font-size: 14px;
        }

        /* 现代化作品网格 */
        .modern-artworks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          max-height: 450px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .modern-artworks-grid::-webkit-scrollbar {
          width: 6px;
        }

        .modern-artworks-grid::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .modern-artworks-grid::-webkit-scrollbar-thumb {
          background: var(--tech-primary);
          border-radius: 3px;
        }

        /* 现代化作品卡片 */
        .modern-artwork-card {
          background: linear-gradient(145deg, rgba(25, 30, 65, 0.85), rgba(18, 22, 52, 0.95));
          border: 1px solid rgba(0, 212, 255, 0.2);
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          height: fit-content;
          position: relative;
          backdrop-filter: blur(10px);
          box-shadow:
            0 8px 24px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(0, 212, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .modern-artwork-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.03), rgba(114, 46, 209, 0.02));
          opacity: 0;
          transition: opacity 0.4s ease;
          z-index: 0;
        }

        .modern-artwork-card:hover::before {
          opacity: 1;
        }

        .modern-artwork-card:hover {
          transform: translateY(-8px) scale(1.03);
          border-color: rgba(0, 212, 255, 0.6);
          box-shadow:
            0 20px 40px rgba(0, 212, 255, 0.25),
            0 0 30px rgba(0, 212, 255, 0.15),
            0 0 0 1px rgba(0, 212, 255, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }

        .modern-artwork-card > * {
          position: relative;
          z-index: 1;
        }

        /* 图片容器 */
        .artwork-image-container {
          position: relative;
          height: 140px;
          overflow: hidden;
          border-radius: 12px 12px 0 0;
        }

        .artwork-thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          filter: brightness(0.9) contrast(1.1);
        }

        .modern-artwork-card:hover .artwork-thumbnail {
          transform: scale(1.15) rotate(1deg);
          filter: brightness(1.1) contrast(1.2) saturate(1.2);
        }

        .artwork-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            linear-gradient(135deg, rgba(0, 212, 255, 0.85), rgba(114, 46, 209, 0.85)),
            radial-gradient(circle at center, rgba(255, 255, 255, 0.1), transparent 70%);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          transform: translateY(10px);
          backdrop-filter: blur(4px);
        }

        .modern-artwork-card:hover .artwork-overlay {
          opacity: 1;
          transform: translateY(0);
        }

        .overlay-content {
          text-align: center;
          color: white;
        }

        .preview-icon {
          font-size: 24px;
          margin-bottom: 4px;
          display: block;
        }

        .preview-text {
          font-size: 12px;
          color: white !important;
          font-weight: 500;
        }

        .difficulty-badge {
          position: absolute;
          top: 8px;
          right: 8px;
        }

        .difficulty-tag {
          border: none !important;
          font-weight: 600 !important;
          font-size: 10px !important;
          padding: 2px 6px !important;
          border-radius: 8px !important;
        }

        /* 卡片信息区域 */
        .artwork-info {
          padding: 16px;
        }

        .artwork-header-modern {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .artwork-title-modern {
          margin: 0 !important;
          color: var(--tech-text-primary) !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          line-height: 1.3 !important;
          flex: 1;
          margin-right: 8px !important;
        }

        .artwork-stats {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .stat-icon {
          color: var(--tech-primary);
          font-size: 12px;
        }

        .stat-number {
          color: var(--tech-text-secondary) !important;
          font-size: 11px !important;
          font-weight: 500;
        }

        .artwork-description-modern {
          color: var(--tech-text-secondary) !important;
          font-size: 12px !important;
          line-height: 1.4 !important;
          margin-bottom: 12px !important;
        }

        /* 现代化标签 */
        .artwork-tags-modern {
          display: flex;
          gap: 8px;
          margin-bottom: 14px;
          flex-wrap: wrap;
          align-items: center;
        }

        .modern-tag {
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 212, 255, 0.1));
          color: var(--tech-primary);
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 12px;
          border: 1px solid rgba(0, 212, 255, 0.4);
          backdrop-filter: blur(4px);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .modern-tag::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .modern-artwork-card:hover .modern-tag::before {
          left: 100%;
        }

        .modern-tag:hover {
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(0, 212, 255, 0.2));
          border-color: rgba(0, 212, 255, 0.6);
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(0, 212, 255, 0.3);
        }

        .more-tags {
          background: linear-gradient(135deg, rgba(114, 46, 209, 0.2), rgba(114, 46, 209, 0.1));
          color: rgba(114, 46, 209, 1);
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 12px;
          border: 1px solid rgba(114, 46, 209, 0.4);
          backdrop-filter: blur(4px);
          transition: all 0.3s ease;
        }

        .more-tags:hover {
          background: linear-gradient(135deg, rgba(114, 46, 209, 0.3), rgba(114, 46, 209, 0.2));
          border-color: rgba(114, 46, 209, 0.6);
          transform: scale(1.05);
          box-shadow: 0 2px 8px rgba(114, 46, 209, 0.3);
        }

        /* 底部作者和操作区域 */
        .artwork-footer-modern {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .author-info {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .author-avatar {
          border: 1px solid rgba(0, 212, 255, 0.3) !important;
        }

        .author-name {
          color: var(--tech-text-secondary) !important;
          font-size: 11px !important;
          font-weight: 500;
        }

        .use-artwork-btn {
          background: linear-gradient(135deg, var(--tech-primary), var(--tech-secondary)) !important;
          border: none !important;
          color: #000 !important;
          font-weight: 600 !important;
          font-size: 11px !important;
          height: 24px !important;
          padding: 0 8px !important;
          border-radius: 6px !important;
          box-shadow: 0 2px 4px rgba(0, 212, 255, 0.3);
        }

        .use-artwork-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 212, 255, 0.4) !important;
        }

        /* 现代化空状态 */
        .modern-empty-gallery {
          text-align: center;
          padding: 60px 20px;
          background: rgba(26, 29, 62, 0.5);
          border-radius: 12px;
          border: 1px solid rgba(0, 212, 255, 0.1);
        }

        .empty-icon {
          font-size: 48px;
          color: rgba(0, 212, 255, 0.3);
          margin-bottom: 16px;
        }

        .empty-title {
          color: var(--tech-text-primary) !important;
          margin-bottom: 8px !important;
          font-weight: 500 !important;
        }

        .empty-description {
          color: var(--tech-text-secondary) !important;
          font-size: 14px;
        }

        .artwork-preview {
          text-align: center;
        }

        .preview-info {
          margin-top: 16px;
          text-align: left;
        }

        .preview-stats {
          padding-top: 12px;
          border-top: 1px solid #f0f0f0;
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .modern-artworks-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .gallery-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .header-right {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default GalleryComponent;