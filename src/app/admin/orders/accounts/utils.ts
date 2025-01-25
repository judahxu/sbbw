import { OrderStatus, PaymentStatus, AllocationStatus } from './types';

// 格式化金额
export const formatCurrency = (amount: number, currency: 'USD' | 'CNY' = 'CNY') => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// 格式化日期时间
export const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date);
};

// 获取订单状态样式
export const getOrderStatusStyle = (status: OrderStatus) => {
  const styles = {
    pending_payment: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };

  const labels = {
    pending_payment: '待付款',
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消'
  };

  return {
    className: styles[status],
    label: labels[status]
  };
};

// 获取分配状态样式
export const getAllocationStatusStyle = (status: AllocationStatus) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  };

  const labels = {
    pending: '待分配',
    completed: '已分配',
    failed: '分配失败'
  };

  return {
    className: styles[status],
    label: labels[status]
  };
};

// 获取支付状态样式
export const getPaymentStatusStyle = (status: PaymentStatus) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800'
  };

  const labels = {
    pending: '待支付',
    paid: '已支付',
    failed: '支付失败',
    refunded: '已退款'
  };

  return {
    className: styles[status],
    label: labels[status]
  };
};

// 获取日期范围过滤器选项
export const getDateRangeOptions = () => {
  return [
    { value: 'today', label: '今日' },
    { value: 'yesterday', label: '昨日' },
    { value: '7days', label: '最近7天' },
    { value: '30days', label: '最近30天' },
    { value: 'custom', label: '自定义' }
  ];
};

// 计算日期范围
export const getDateRange = (range: string) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (range) {
    case 'today':
      return {
        from: today,
        to: now
      };
    case 'yesterday':
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        from: yesterday,
        to: today
      };
    case '7days':
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return {
        from: sevenDaysAgo,
        to: now
      };
    case '30days':
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return {
        from: thirtyDaysAgo,
        to: now
      };
    default:
      return {
        from: today,
        to: now
      };
  }
};

// 复制文本到剪贴板
export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy text:', error);
    return false;
  }
};