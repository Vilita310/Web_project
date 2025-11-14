import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Space, Slider, Typography, Tag } from 'antd';
import {
  PlayCircleOutlined,
  PauseOutlined,
  StepForwardOutlined,
  ReloadOutlined,
  FastForwardOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const SlidingWindowDemo = ({
  array = [1, 3, -1, -3, 5, 3, 6, 7],
  windowSize = 3,
  title = "滑动窗口最大值演示",
  onAIBlackboardRender
}) => {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState(1000);
  const [windowStart, setWindowStart] = useState(0);
  const [maxValue, setMaxValue] = useState(null);
  const [result, setResult] = useState([]);

  // 动画步骤数据
  const totalSteps = array.length - windowSize + 1;

  useEffect(() => {
    drawAnimation();
  }, [currentStep, windowStart]);

  useEffect(() => {
    let interval;
    if (isPlaying && currentStep < totalSteps) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          const newStep = prev + 1;
          if (newStep >= totalSteps) {
            setIsPlaying(false);
            return prev;
          }
          return newStep;
        });
        setWindowStart(currentStep);
      }, speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, speed, totalSteps]);

  const drawAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 绘制标题
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#1890ff';
    ctx.textAlign = 'center';
    ctx.fillText(title, width / 2, 40);

    // 计算数组绘制位置
    const arrayStartX = 80;
    const arrayY = 120;
    const cellWidth = 60;
    const cellHeight = 50;

    // 绘制数组元素
    array.forEach((value, index) => {
      const x = arrayStartX + index * (cellWidth + 10);
      const isInWindow = index >= windowStart && index < windowStart + windowSize;

      // 绘制单元格
      ctx.fillStyle = isInWindow ? '#ff7875' : '#f0f0f0';
      ctx.fillRect(x, arrayY, cellWidth, cellHeight);

      // 绘制边框
      ctx.strokeStyle = isInWindow ? '#ff4d4f' : '#d9d9d9';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, arrayY, cellWidth, cellHeight);

      // 绘制数值
      ctx.fillStyle = isInWindow ? '#fff' : '#000';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(value, x + cellWidth / 2, arrayY + cellHeight / 2 + 6);

      // 绘制索引
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.fillText(index, x + cellWidth / 2, arrayY + cellHeight + 20);
    });

    // 绘制窗口边框
    if (windowStart < array.length) {
      const windowX = arrayStartX + windowStart * (cellWidth + 10);
      ctx.strokeStyle = '#1890ff';
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(windowX - 5, arrayY - 5, windowSize * (cellWidth + 10) - 5, cellHeight + 10);
      ctx.setLineDash([]);

      // 绘制窗口标签
      ctx.fillStyle = '#1890ff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`窗口 [${windowStart}, ${windowStart + windowSize - 1}]`,
                   windowX + (windowSize * (cellWidth + 10)) / 2 - 5, arrayY - 15);
    }

    // 计算并显示当前窗口的最大值
    if (windowStart + windowSize <= array.length) {
      const windowValues = array.slice(windowStart, windowStart + windowSize);
      const currentMax = Math.max(...windowValues);

      // 绘制当前最大值
      ctx.fillStyle = '#52c41a';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`当前窗口最大值: ${currentMax}`, arrayStartX, arrayY + 100);

      // 高亮最大值元素
      const maxIndex = windowValues.indexOf(currentMax) + windowStart;
      const maxX = arrayStartX + maxIndex * (cellWidth + 10);
      ctx.strokeStyle = '#52c41a';
      ctx.lineWidth = 4;
      ctx.strokeRect(maxX - 2, arrayY - 2, cellWidth + 4, cellHeight + 4);
    }

    // 绘制结果数组
    if (result.length > 0) {
      ctx.fillStyle = '#000';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('结果数组:', arrayStartX, arrayY + 140);

      result.forEach((value, index) => {
        const x = arrayStartX + index * (cellWidth + 10);
        const y = arrayY + 160;

        // 绘制结果单元格
        ctx.fillStyle = index === currentStep ? '#52c41a' : '#e6f7ff';
        ctx.fillRect(x, y, cellWidth, cellHeight);

        ctx.strokeStyle = index === currentStep ? '#52c41a' : '#1890ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cellWidth, cellHeight);

        // 绘制数值
        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(value, x + cellWidth / 2, y + cellHeight / 2 + 6);
      });
    }

    // 绘制算法步骤说明
    const steps = [
      '1. 初始化窗口到数组开始位置',
      '2. 计算当前窗口内的最大值',
      '3. 将最大值添加到结果数组',
      '4. 窗口向右滑动一位',
      '5. 重复步骤2-4直到数组末尾'
    ];

    ctx.fillStyle = '#666';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    steps.forEach((step, index) => {
      const isCurrentStep = (
        (index === 0 && currentStep === 0) ||
        (index === 1 && currentStep >= 0) ||
        (index === 2 && currentStep >= 0) ||
        (index === 3 && currentStep > 0) ||
        (index === 4 && currentStep > 0)
      );

      ctx.fillStyle = isCurrentStep ? '#1890ff' : '#666';
      ctx.fillText(step, arrayStartX, arrayY + 280 + index * 25);
    });

    // 如果设置了AI黑板渲染回调，将Canvas内容发送给AI黑板
    if (onAIBlackboardRender) {
      const boardActions = [
        {
          type: 'title',
          content: title,
          position: { x: 50, y: 50 },
          style: { color: '#1890ff', fontSize: '24px' }
        },
        {
          type: 'concept',
          content: `当前步骤: ${currentStep + 1}/${totalSteps}`,
          position: { x: 50, y: 100 },
          style: { color: '#52c41a' }
        }
      ];

      onAIBlackboardRender(boardActions);
    }
  };

  const handlePlay = () => {
    if (currentStep >= totalSteps) {
      resetAnimation();
    }
    setIsPlaying(!isPlaying);
  };

  const resetAnimation = () => {
    setCurrentStep(0);
    setWindowStart(0);
    setResult([]);
    setIsPlaying(false);
  };

  const stepForward = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      setWindowStart(currentStep + 1);

      // 计算当前窗口最大值并添加到结果
      if (currentStep + 1 + windowSize <= array.length) {
        const windowValues = array.slice(currentStep + 1, currentStep + 1 + windowSize);
        const maxVal = Math.max(...windowValues);
        setResult(prev => [...prev, maxVal]);
      }
    }
  };

  // 计算完整结果用于对比
  useEffect(() => {
    const completeResult = [];
    for (let i = 0; i <= array.length - windowSize; i++) {
      const windowValues = array.slice(i, i + windowSize);
      completeResult.push(Math.max(...windowValues));
    }

    // 只显示到当前步骤的结果
    setResult(completeResult.slice(0, currentStep + 1));
  }, [currentStep, array, windowSize]);

  return (
    <Card title="🎬 滑动窗口算法可视化">
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={isPlaying ? <PauseOutlined /> : <PlayCircleOutlined />}
            onClick={handlePlay}
          >
            {isPlaying ? '暂停' : '播放'}
          </Button>
          <Button icon={<StepForwardOutlined />} onClick={stepForward}>
            单步执行
          </Button>
          <Button icon={<ReloadOutlined />} onClick={resetAnimation}>
            重置
          </Button>
          <Text>速度:</Text>
          <Slider
            style={{ width: 100 }}
            min={200}
            max={2000}
            step={200}
            value={speed}
            onChange={setSpeed}
            tooltip={{ formatter: (v) => `${v}ms` }}
          />
        </Space>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Space>
          <Text>输入数组:</Text>
          {array.map((val, idx) => (
            <Tag key={idx} color={idx >= windowStart && idx < windowStart + windowSize ? 'red' : 'default'}>
              {val}
            </Tag>
          ))}
          <Text>窗口大小: {windowSize}</Text>
        </Space>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        style={{
          border: '1px solid #d9d9d9',
          borderRadius: '6px',
          backgroundColor: '#fafafa'
        }}
      />

      <div style={{ marginTop: 16 }}>
        <Text strong>进度: </Text>
        <Text>{currentStep + 1} / {totalSteps}</Text>
        <div style={{ marginTop: 8 }}>
          <Text strong>当前结果: </Text>
          {result.map((val, idx) => (
            <Tag key={idx} color="green">{val}</Tag>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default SlidingWindowDemo;