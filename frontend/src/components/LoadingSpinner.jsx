import React from 'react';
import { SpinLoading } from 'antd-mobile';

/**
 * 加载动画组件
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  text = '加载中...', 
  style = {},
  className = ''
}) => {
  return (
    <div 
      className={`loading-spinner ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        ...style
      }}
    >
      <SpinLoading 
        color={color} 
        style={{ 
          '--size': size === 'small' ? '20px' : size === 'large' ? '40px' : '30px'
        }} 
      />
      {text && (
        <div 
          style={{ 
            marginTop: '12px', 
            fontSize: '14px', 
            color: '#999',
            textAlign: 'center'
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
