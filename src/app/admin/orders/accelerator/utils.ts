// utils/order/constants.ts
export const ORDER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  EXPIRED: 'expired',
} as const;

export const VERSION_TYPE = {
  PERSONAL: 'personal',
  TEAM: 'team',
} as const;

export const DURATION_OPTIONS = {
  MONTHLY: '1m',
  QUARTERLY: '3m',
  YEARLY: '12m',
} as const;

// utils/order/formatters.ts
export const getVersionBadgeStyle = (version: string) => {
  const styles = {
    [VERSION_TYPE.PERSONAL]: 'bg-blue-100 text-blue-800',
    [VERSION_TYPE.TEAM]: 'bg-purple-100 text-purple-800'
  };
  const labels = {
    [VERSION_TYPE.PERSONAL]: '个人版',
    [VERSION_TYPE.TEAM]: '团队版'
  };
  return { style: styles[version], label: labels[version] };
};

export const getStatusBadgeStyle = (status: string) => {
  const styles = {
    [ORDER_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
    [ORDER_STATUS.ACTIVE]: 'bg-green-100 text-green-800',
    [ORDER_STATUS.EXPIRED]: 'bg-gray-100 text-gray-800'
  };
  const labels = {
    [ORDER_STATUS.PENDING]: '待开通',
    [ORDER_STATUS.ACTIVE]: '使用中',
    [ORDER_STATUS.EXPIRED]: '已到期'
  };
  return { style: styles[status], label: labels[status] };
};

export const formatDuration = (duration: string) => {
  const durationMap = {
    [DURATION_OPTIONS.MONTHLY]: '1个月',
    [DURATION_OPTIONS.QUARTERLY]: '3个月',
    [DURATION_OPTIONS.YEARLY]: '12个月'
  };
  return durationMap[duration] || duration;
};

export const formatDateTime = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

export const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2
  }).format(amount);
};

// utils/order/validators.ts
export const isDeviceExceeded = (currentDevices: number, deviceLimit: number) => {
  return currentDevices > deviceLimit;
};

export const isExpiringSoon = (expiryDate: string | Date, daysThreshold = 7) => {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= daysThreshold && diffDays > 0;
};

// types/order.ts
export interface AcceleratorOrder {
  id: string;
  customer: string;
  contactInfo: string;
  version: typeof VERSION_TYPE[keyof typeof VERSION_TYPE];
  duration: typeof DURATION_OPTIONS[keyof typeof DURATION_OPTIONS];
  deviceLimit: number;
  currentDevices: number;
  amount: number;
  status: typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
  paymentStatus: string;
  startTime: string;
  endTime: string;
  isBundle: boolean;
  createTime: string;
}