import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Typography } from 'antd';
import { useTheme } from '../../contexts/ThemeContext';

const { Text } = Typography;

const EnhancedMessage = ({ content, type }) => {
  const { isDarkTheme } = useTheme();
  // 自定义组件渲染
  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';

      return !inline && match ? (
        <div style={{ margin: '8px 0' }}>
          <div style={{
            background: '#2d2d30',
            padding: '4px 8px',
            fontSize: '10px',
            color: isDarkTheme ? 'rgba(255, 255, 255, 0.6)' : '#5A5A5A',
            fontFamily: '"Monaco", "Menlo", monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {language}
          </div>
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={language}
            PreTag="div"
            customStyle={{
              margin: 0,
              borderRadius: '0 0 4px 4px',
              background: '#1e1e1e',
              fontSize: '11px',
              lineHeight: '1.4',
              fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", monospace',
              maxWidth: '100%',
              overflowX: 'auto',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '2px 4px',
            borderRadius: '2px',
            fontSize: '11px',
            fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", monospace',
            color: '#ffd700'
          }}
          {...props}
        >
          {children}
        </code>
      );
    },

    p({ children, ...props }) {
      return (
        <div style={{
          margin: '6px 0',
          lineHeight: '1.6'
        }} {...props}>
          {children}
        </div>
      );
    },

    h1({ children, ...props }) {
      return (
        <div style={{
          fontSize: '14px',
          fontWeight: '600',
          margin: '12px 0 8px 0',
          color: isDarkTheme ? 'rgba(255, 255, 255, 0.95)' : '#2D1810',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          paddingBottom: '4px'
        }} {...props}>
          {children}
        </div>
      );
    },

    h2({ children, ...props }) {
      return (
        <div style={{
          fontSize: '13px',
          fontWeight: '600',
          margin: '10px 0 6px 0',
          color: isDarkTheme ? 'rgba(255, 255, 255, 0.9)' : '#2D1810'
        }} {...props}>
          {children}
        </div>
      );
    },

    h3({ children, ...props }) {
      return (
        <div style={{
          fontSize: '12px',
          fontWeight: '600',
          margin: '8px 0 4px 0',
          color: isDarkTheme ? 'rgba(255, 255, 255, 0.85)' : '#2D1810'
        }} {...props}>
          {children}
        </div>
      );
    },

    ul({ children, ...props }) {
      return (
        <ul style={{
          margin: '6px 0',
          paddingLeft: '16px',
          listStyle: 'none'
        }} {...props}>
          {children}
        </ul>
      );
    },

    ol({ children, ...props }) {
      return (
        <ol style={{
          margin: '6px 0',
          paddingLeft: '16px'
        }} {...props}>
          {children}
        </ol>
      );
    },

    li({ children, ...props }) {
      return (
        <li style={{
          margin: '3px 0',
          position: 'relative'
        }} {...props}>
          <span style={{
            position: 'absolute',
            left: '-12px',
            color: '#007acc',
            fontSize: '10px'
          }}>•</span>
          {children}
        </li>
      );
    },

    blockquote({ children, ...props }) {
      return (
        <div style={{
          borderLeft: '3px solid #007acc',
          paddingLeft: '12px',
          margin: '8px 0',
          background: 'rgba(0, 122, 204, 0.1)',
          padding: '8px 12px',
          borderRadius: '0 4px 4px 0',
          fontStyle: 'italic'
        }} {...props}>
          {children}
        </div>
      );
    },

    br({ ...props }) {
      return <br {...props} />;
    },

    strong({ children, ...props }) {
      return (
        <span style={{
          fontWeight: '600',
          color: isDarkTheme ? 'rgba(255, 255, 255, 0.95)' : '#A0783B'
        }} {...props}>
          {children}
        </span>
      );
    },

    em({ children, ...props }) {
      return (
        <span style={{
          fontStyle: 'italic',
          color: isDarkTheme ? 'rgba(255, 255, 255, 0.8)' : '#5A5A5A'
        }} {...props}>
          {children}
        </span>
      );
    },

    table({ children, ...props }) {
      return (
        <div style={{ overflowX: 'auto', margin: '8px 0' }}>
          <table style={{
            borderCollapse: 'collapse',
            width: '100%',
            fontSize: '11px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }} {...props}>
            {children}
          </table>
        </div>
      );
    },

    th({ children, ...props }) {
      return (
        <th style={{
          padding: '6px 8px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          fontWeight: '600',
          textAlign: 'left'
        }} {...props}>
          {children}
        </th>
      );
    },

    td({ children, ...props }) {
      return (
        <td style={{
          padding: '6px 8px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }} {...props}>
          {children}
        </td>
      );
    }
  };

  // 检测是否包含代码块
  const hasCodeBlocks = content.includes('```');
  const hasInlineCode = content.includes('`') && !hasCodeBlocks;
  const hasMarkdown = /[#*_`\[\]()>-]/.test(content);

  // 如果是用户消息或者不包含markdown语法，使用简单文本显示
  if (type === 'user' || (!hasMarkdown && !hasCodeBlocks && !hasInlineCode)) {
    return (
      <Text style={{
        color: type === 'user' ? '#fff' : (isDarkTheme ? 'rgba(255, 255, 255, 0.95)' : '#2D1810'),
        fontSize: '12px',
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'block',
        fontWeight: '400'
      }}>
        {content}
      </Text>
    );
  }

  // AI消息使用增强的markdown渲染
  return (
    <div style={{
      color: isDarkTheme ? 'rgba(255, 255, 255, 0.95)' : '#2D1810',
      fontSize: '12px',
      lineHeight: '1.6',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontWeight: '400',
      width: '100%',
      maxWidth: '100%',
      overflowWrap: 'break-word',
      wordWrap: 'break-word',
      wordBreak: 'break-word',
      hyphens: 'auto'
    }}>
      <ReactMarkdown
        components={components}
        remarkPlugins={[]}
        rehypePlugins={[]}
        remarkRehypeOptions={{ allowDangerousHtml: false }}
        breaks={true}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default React.memo(EnhancedMessage);