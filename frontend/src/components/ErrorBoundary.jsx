import React from 'react';
import { Button, Card } from 'antd-mobile';
import { ExclamationCircleOutline } from 'antd-mobile-icons';

/**
 * 错误边界组件
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误信息
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // 这里可以将错误信息发送到错误监控服务
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      // 自定义的错误 UI
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Card>
            <div style={{ padding: '20px' }}>
              <ExclamationCircleOutline 
                style={{ 
                  fontSize: '48px', 
                  color: '#ff3b30',
                  marginBottom: '16px'
                }} 
              />
              <h3 style={{ 
                margin: '0 0 12px 0',
                fontSize: '18px',
                color: '#333'
              }}>
                {this.props.title || '页面出现错误'}
              </h3>
              <p style={{ 
                margin: '0 0 20px 0',
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.5'
              }}>
                {this.props.message || '抱歉，页面遇到了一些问题。请尝试刷新页面或联系客服。'}
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details style={{ 
                  marginBottom: '20px',
                  textAlign: 'left',
                  fontSize: '12px',
                  color: '#999'
                }}>
                  <summary style={{ cursor: 'pointer', marginBottom: '8px' }}>
                    错误详情（开发模式）
                  </summary>
                  <pre style={{ 
                    background: '#f5f5f5',
                    padding: '8px',
                    borderRadius: '4px',
                    overflow: 'auto',
                    maxHeight: '200px'
                  }}>
                    {this.state.error && this.state.error.toString()}
                    <br />
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div style={{ 
                display: 'flex', 
                gap: '12px',
                justifyContent: 'center'
              }}>
                <Button 
                  color="primary" 
                  onClick={this.handleRetry}
                  size="small"
                >
                  重试
                </Button>
                <Button 
                  color="default" 
                  onClick={() => window.location.reload()}
                  size="small"
                >
                  刷新页面
                </Button>
                {this.props.showHome && (
                  <Button 
                    color="default" 
                    onClick={() => window.location.href = '/'}
                    size="small"
                  >
                    返回首页
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
