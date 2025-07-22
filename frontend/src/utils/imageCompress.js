/**
 * 图片压缩工具
 * 用于优化上传图片的大小和质量
 */

/**
 * 压缩图片文件
 * @param {File} file - 原始图片文件
 * @param {Object} options - 压缩选项
 * @returns {Promise<File>} 压缩后的图片文件
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    // 默认压缩选项
    const defaultOptions = {
      maxWidth: 800,        // 最大宽度
      maxHeight: 800,       // 最大高度
      quality: 0.8,         // 压缩质量 (0-1)
      maxSize: 500 * 1024,  // 最大文件大小 500KB
    }
    
    const config = { ...defaultOptions, ...options }
    
    // 如果不是图片文件，直接返回
    if (!file.type.startsWith('image/')) {
      resolve(file)
      return
    }
    
    // 如果文件已经很小，直接返回
    if (file.size <= config.maxSize) {
      resolve(file)
      return
    }
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // 计算压缩后的尺寸
      let { width, height } = calculateSize(img.width, img.height, config.maxWidth, config.maxHeight)
      
      // 设置canvas尺寸
      canvas.width = width
      canvas.height = height
      
      // 绘制压缩后的图片
      ctx.drawImage(img, 0, 0, width, height)
      
      // 转换为blob
      canvas.toBlob((blob) => {
        if (blob) {
          // 创建新的File对象
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          })
          
          console.log(`图片压缩完成: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB`)
          resolve(compressedFile)
        } else {
          reject(new Error('图片压缩失败'))
        }
      }, file.type, config.quality)
    }
    
    img.onerror = () => {
      reject(new Error('图片加载失败'))
    }
    
    // 加载图片
    img.src = URL.createObjectURL(file)
  })
}

/**
 * 计算压缩后的尺寸
 * @param {number} width - 原始宽度
 * @param {number} height - 原始高度
 * @param {number} maxWidth - 最大宽度
 * @param {number} maxHeight - 最大高度
 * @returns {Object} 压缩后的尺寸
 */
const calculateSize = (width, height, maxWidth, maxHeight) => {
  let newWidth = width
  let newHeight = height
  
  // 如果宽度超出限制
  if (newWidth > maxWidth) {
    newHeight = (newHeight * maxWidth) / newWidth
    newWidth = maxWidth
  }
  
  // 如果高度超出限制
  if (newHeight > maxHeight) {
    newWidth = (newWidth * maxHeight) / newHeight
    newHeight = maxHeight
  }
  
  return {
    width: Math.round(newWidth),
    height: Math.round(newHeight)
  }
}

/**
 * 批量压缩图片
 * @param {File[]} files - 图片文件数组
 * @param {Object} options - 压缩选项
 * @param {Function} onProgress - 进度回调
 * @returns {Promise<File[]>} 压缩后的图片文件数组
 */
export const compressImages = async (files, options = {}, onProgress = null) => {
  const compressedFiles = []
  
  for (let i = 0; i < files.length; i++) {
    try {
      const compressedFile = await compressImage(files[i], options)
      compressedFiles.push(compressedFile)
      
      // 调用进度回调
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: files.length,
          percentage: Math.round(((i + 1) / files.length) * 100)
        })
      }
    } catch (error) {
      console.error(`压缩第${i + 1}张图片失败:`, error)
      // 压缩失败时使用原文件
      compressedFiles.push(files[i])
    }
  }
  
  return compressedFiles
}

/**
 * 生成缩略图
 * @param {File} file - 图片文件
 * @param {number} size - 缩略图尺寸
 * @returns {Promise<string>} 缩略图的base64数据
 */
export const generateThumbnail = (file, size = 150) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('不是图片文件'))
      return
    }
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // 计算缩略图尺寸（正方形）
      const minSize = Math.min(img.width, img.height)
      const scale = size / minSize
      
      canvas.width = size
      canvas.height = size
      
      // 居中裁剪
      const sx = (img.width - minSize) / 2
      const sy = (img.height - minSize) / 2
      
      ctx.drawImage(img, sx, sy, minSize, minSize, 0, 0, size, size)
      
      // 转换为base64
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8)
      resolve(thumbnail)
    }
    
    img.onerror = () => {
      reject(new Error('图片加载失败'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}
