import crypto from 'crypto';
import axios from 'axios';

/**
 * 云够支付服务
 * 官方文档：https://www.yungouos.com/
 */
class YunGouPaymentService {
  constructor() {
    // 云够支付配置（生产环境从环境变量获取）
    this.config = {
      mchId: process.env.YUNGOU_MCH_ID || 'test_mch_id', // 商户号
      key: process.env.YUNGOU_KEY || 'test_key', // 商户密钥
      apiUrl: process.env.YUNGOU_API_URL || 'https://api.pay.yungouos.com',
      notifyUrl: process.env.YUNGOU_NOTIFY_URL || 'http://localhost:3000/api/payments/callback/yungou'
    };
  }

  /**
   * 生成签名
   * @param {Object} params - 参数对象
   * @returns {string} - 签名字符串
   */
  generateSign(params) {
    // 排序参数
    const sortedKeys = Object.keys(params).sort();
    const signString = sortedKeys
      .map(key => `${key}=${params[key]}`)
      .join('&') + `&key=${this.config.key}`;
    
    // MD5签名
    return crypto.createHash('md5').update(signString).digest('hex').toUpperCase();
  }

  /**
   * 验证签名
   * @param {Object} params - 参数对象
   * @param {string} sign - 签名
   * @returns {boolean} - 验证结果
   */
  verifySign(params, sign) {
    const { sign: _, ...paramsWithoutSign } = params;
    const calculatedSign = this.generateSign(paramsWithoutSign);
    return calculatedSign === sign;
  }

  /**
   * 创建支付订单
   * @param {Object} orderData - 订单数据
   * @returns {Promise<Object>} - 支付结果
   */
  async createPayment(orderData) {
    try {
      const {
        outTradeNo,    // 商户订单号
        totalFee,      // 支付金额（分）
        body,          // 商品描述
        attach,        // 附加数据
        timeExpire     // 订单过期时间
      } = orderData;

      // 构建请求参数
      const params = {
        mch_id: this.config.mchId,
        out_trade_no: outTradeNo,
        total_fee: totalFee,
        body: body,
        attach: attach || '',
        notify_url: this.config.notifyUrl,
        time_expire: timeExpire || this.getDefaultExpireTime(),
        nonce_str: this.generateNonceStr()
      };

      // 生成签名
      params.sign = this.generateSign(params);

      // 发送请求
      const response = await axios.post(`${this.config.apiUrl}/api/pay/wxpay/native`, params);
      
      if (response.data.code === '0') {
        return {
          success: true,
          data: {
            paymentId: response.data.paymentId,
            qrCode: response.data.qrCode,
            paymentUrl: response.data.paymentUrl,
            outTradeNo: outTradeNo
          }
        };
      } else {
        throw new Error(response.data.msg || '创建支付订单失败');
      }

    } catch (error) {
      console.error('云够支付创建订单失败:', error);
      return {
        success: false,
        error: error.message || '支付服务异常'
      };
    }
  }

  /**
   * 查询支付状态
   * @param {string} outTradeNo - 商户订单号
   * @returns {Promise<Object>} - 查询结果
   */
  async queryPayment(outTradeNo) {
    try {
      const params = {
        mch_id: this.config.mchId,
        out_trade_no: outTradeNo,
        nonce_str: this.generateNonceStr()
      };

      params.sign = this.generateSign(params);

      const response = await axios.post(`${this.config.apiUrl}/api/pay/query`, params);

      if (response.data.code === '0') {
        return {
          success: true,
          data: {
            tradeState: response.data.trade_state,
            transactionId: response.data.transaction_id,
            totalFee: response.data.total_fee,
            timeEnd: response.data.time_end
          }
        };
      } else {
        throw new Error(response.data.msg || '查询支付状态失败');
      }

    } catch (error) {
      console.error('云够支付查询失败:', error);
      return {
        success: false,
        error: error.message || '查询服务异常'
      };
    }
  }

  /**
   * 处理支付回调
   * @param {Object} callbackData - 回调数据
   * @returns {Object} - 处理结果
   */
  handleCallback(callbackData) {
    try {
      // 验证签名
      if (!this.verifySign(callbackData, callbackData.sign)) {
        return {
          success: false,
          error: '签名验证失败'
        };
      }

      // 检查支付状态
      if (callbackData.trade_state === 'SUCCESS') {
        return {
          success: true,
          data: {
            outTradeNo: callbackData.out_trade_no,
            transactionId: callbackData.transaction_id,
            totalFee: callbackData.total_fee,
            timeEnd: callbackData.time_end,
            attach: callbackData.attach
          }
        };
      } else {
        return {
          success: false,
          error: `支付失败: ${callbackData.trade_state}`
        };
      }

    } catch (error) {
      console.error('处理支付回调失败:', error);
      return {
        success: false,
        error: error.message || '回调处理异常'
      };
    }
  }

  /**
   * 申请退款
   * @param {Object} refundData - 退款数据
   * @returns {Promise<Object>} - 退款结果
   */
  async refund(refundData) {
    try {
      const {
        outTradeNo,     // 原订单号
        outRefundNo,    // 退款单号
        totalFee,       // 原订单金额
        refundFee,      // 退款金额
        refundDesc      // 退款原因
      } = refundData;

      const params = {
        mch_id: this.config.mchId,
        out_trade_no: outTradeNo,
        out_refund_no: outRefundNo,
        total_fee: totalFee,
        refund_fee: refundFee,
        refund_desc: refundDesc || '用户申请退款',
        nonce_str: this.generateNonceStr()
      };

      params.sign = this.generateSign(params);

      const response = await axios.post(`${this.config.apiUrl}/api/pay/refund`, params);

      if (response.data.code === '0') {
        return {
          success: true,
          data: {
            refundId: response.data.refund_id,
            outRefundNo: outRefundNo
          }
        };
      } else {
        throw new Error(response.data.msg || '申请退款失败');
      }

    } catch (error) {
      console.error('云够支付退款失败:', error);
      return {
        success: false,
        error: error.message || '退款服务异常'
      };
    }
  }

  /**
   * 生成随机字符串
   * @returns {string} - 随机字符串
   */
  generateNonceStr() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * 获取默认过期时间（30分钟后）
   * @returns {string} - 过期时间
   */
  getDefaultExpireTime() {
    const expireTime = new Date();
    expireTime.setMinutes(expireTime.getMinutes() + 30);
    return expireTime.toISOString().replace(/[-:]/g, '').split('.')[0];
  }

  /**
   * 金额转换（元转分）
   * @param {number} yuan - 元
   * @returns {number} - 分
   */
  yuanToFen(yuan) {
    return Math.round(yuan * 100);
  }

  /**
   * 金额转换（分转元）
   * @param {number} fen - 分
   * @returns {number} - 元
   */
  fenToYuan(fen) {
    return fen / 100;
  }
}

export default new YunGouPaymentService();
