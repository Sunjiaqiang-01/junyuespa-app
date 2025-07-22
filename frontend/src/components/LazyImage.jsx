import React, { useState, useRef, useEffect } from 'react'

/**
 * 懒加载图片组件
 * 只有当图片进入视口时才开始加载
 */
const LazyImage = ({ 
  src, 
  alt = '', 
  placeholder = null,
  className = '',
  style = {},
  onLoad = null,
  onError = null,
  threshold = 0.1 // 进入视口的阈值
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef(null)
  const observerRef = useRef(null)

  useEffect(() => {
    const currentImg = imgRef.current
    
    if (!currentImg) return

    // 创建Intersection Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            // 开始加载后就停止观察
            observerRef.current?.unobserve(entry.target)
          }
        })
      },
      {
        threshold,
        rootMargin: '50px' // 提前50px开始加载
      }
    )

    observerRef.current.observe(currentImg)

    return () => {
      if (observerRef.current && currentImg) {
        observerRef.current.unobserve(currentImg)
      }
    }
  }, [threshold])

  const handleLoad = () => {
    setIsLoaded(true)
    setHasError(false)
    onLoad && onLoad()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoaded(false)
    onError && onError()
  }

  // 默认占位符
  const defaultPlaceholder = (
    <div 
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#999',
        fontSize: '12px',
        ...style
      }}
      className={className}
    >
      {hasError ? '加载失败' : '加载中...'}
    </div>
  )

  return (
    <div ref={imgRef} style={{ position: 'relative', ...style }} className={className}>
      {/* 占位符 */}
      {(!isLoaded || hasError) && (placeholder || defaultPlaceholder)}
      
      {/* 真实图片 */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: isLoaded ? 'block' : 'none',
            transition: 'opacity 0.3s ease-in-out',
            opacity: isLoaded ? 1 : 0
          }}
        />
      )}
    </div>
  )
}

export default LazyImage
