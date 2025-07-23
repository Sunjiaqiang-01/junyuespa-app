import crypto from 'crypto';

// 加密密钥（生产环境应该从环境变量获取）
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'junyuespa-encryption-key-32-chars';
const ALGORITHM = 'aes-256-cbc';

/**
 * 加密敏感信息
 * @param {string} text - 要加密的文本
 * @returns {string} - 加密后的文本（格式：iv:encryptedData）
 */
export function encrypt(text) {
  if (!text) return text;
  
  try {
    // 生成随机初始化向量
    const iv = crypto.randomBytes(16);
    
    // 创建加密器
    const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
    
    // 加密数据
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // 返回格式：iv:encryptedData
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('加密失败:', error);
    return text; // 加密失败时返回原文本
  }
}

/**
 * 解密敏感信息
 * @param {string} encryptedText - 加密的文本（格式：iv:encryptedData）
 * @returns {string} - 解密后的文本
 */
export function decrypt(encryptedText) {
  if (!encryptedText || !encryptedText.includes(':')) {
    return encryptedText; // 如果不是加密格式，直接返回
  }
  
  try {
    // 分离IV和加密数据
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    
    // 创建解密器
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
    
    // 解密数据
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('解密失败:', error);
    return encryptedText; // 解密失败时返回原文本
  }
}

/**
 * 加密技师联系方式
 * @param {string} contactInfo - 联系方式
 * @returns {string} - 加密后的联系方式
 */
export function encryptContactInfo(contactInfo) {
  return encrypt(contactInfo);
}

/**
 * 解密技师联系方式（仅管理员可用）
 * @param {string} encryptedContactInfo - 加密的联系方式
 * @returns {string} - 解密后的联系方式
 */
export function decryptContactInfo(encryptedContactInfo) {
  return decrypt(encryptedContactInfo);
}

/**
 * 脱敏显示联系方式（用于前端显示）
 * @param {string} contactInfo - 联系方式
 * @returns {string} - 脱敏后的联系方式
 */
export function maskContactInfo(contactInfo) {
  if (!contactInfo) return '';
  
  // 手机号脱敏：138****8888
  if (/^1[3-9]\d{9}$/.test(contactInfo)) {
    return contactInfo.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }
  
  // 微信号脱敏：abc****xyz
  if (contactInfo.length > 6) {
    const start = contactInfo.substring(0, 3);
    const end = contactInfo.substring(contactInfo.length - 3);
    return start + '****' + end;
  }
  
  return '****';
}
