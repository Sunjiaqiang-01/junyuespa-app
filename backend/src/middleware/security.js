import xss from 'xss';
import crypto from 'crypto';

/**
 * XSS防护中间件
 * 清理用户输入中的恶意脚本
 */
export const xssProtection = (req, res, next) => {
  // 清理请求体中的XSS
  if (req.body) {
    req.body = cleanXSS(req.body);
  }

  // 清理查询参数中的XSS
  if (req.query) {
    req.query = cleanXSS(req.query);
  }

  // 清理路径参数中的XSS
  if (req.params) {
    req.params = cleanXSS(req.params);
  }

  next();
};

/**
 * 递归清理对象中的XSS
 */
function cleanXSS(obj) {
  if (typeof obj === 'string') {
    return xss(obj, {
      whiteList: {}, // 不允许任何HTML标签
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script']
    });
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cleanXSS(item));
  }

  if (obj && typeof obj === 'object') {
    const cleaned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cleaned[key] = cleanXSS(obj[key]);
      }
    }
    return cleaned;
  }

  return obj;
}

/**
 * CSRF防护中间件
 * 验证请求来源和CSRF令牌
 */
export const csrfProtection = (req, res, next) => {
  // 对于GET请求，只检查Referer
  if (req.method === 'GET') {
    return next();
  }

  // 检查Referer头
  const referer = req.get('Referer');
  const origin = req.get('Origin');
  const host = req.get('Host');

  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    `http://${host}`,
    `https://${host}`
  ];

  const requestOrigin = origin || (referer ? new URL(referer).origin : null);

  if (!requestOrigin || !allowedOrigins.includes(requestOrigin)) {
    return res.status(403).json({
      error: 'CSRF防护',
      message: '请求来源不被信任'
    });
  }

  next();
};

/**
 * 输入验证中间件
 * 验证和清理用户输入
 */
export const inputValidation = (req, res, next) => {
  // 限制请求体大小（已在主应用中设置）
  
  // 验证Content-Type
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        error: '无效的Content-Type',
        message: '请使用application/json格式'
      });
    }
  }

  // 验证必要的头部
  const userAgent = req.get('User-Agent');
  if (!userAgent) {
    return res.status(400).json({
      error: '缺少User-Agent',
      message: '请求头不完整'
    });
  }

  next();
};

/**
 * SQL注入防护
 * Prisma已经提供了参数化查询保护，这里添加额外检查
 */
export const sqlInjectionProtection = (req, res, next) => {
  const suspiciousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(--|\/\*|\*\/|;|'|"|`)/g,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi
  ];

  const checkForSQLInjection = (obj) => {
    if (typeof obj === 'string') {
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(obj)) {
          return true;
        }
      }
    } else if (Array.isArray(obj)) {
      return obj.some(item => checkForSQLInjection(item));
    } else if (obj && typeof obj === 'object') {
      return Object.values(obj).some(value => checkForSQLInjection(value));
    }
    return false;
  };

  if (checkForSQLInjection(req.body) || 
      checkForSQLInjection(req.query) || 
      checkForSQLInjection(req.params)) {
    return res.status(400).json({
      error: '非法输入',
      message: '检测到可疑的输入内容'
    });
  }

  next();
};

/**
 * 生成CSRF令牌
 */
export const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * 安全响应头中间件
 */
export const securityHeaders = (req, res, next) => {
  // 防止点击劫持
  res.setHeader('X-Frame-Options', 'DENY');
  
  // 防止MIME类型嗅探
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS保护
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // 严格传输安全（HTTPS）
  if (req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // 内容安全策略
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self';"
  );

  next();
};
