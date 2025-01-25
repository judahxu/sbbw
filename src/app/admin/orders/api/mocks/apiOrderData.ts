// mocks/apiOrderData.ts
export const mockStats = {
  total: 285,
  totalAmountUsd: 5600,
  totalAmountCny: 39200,
  processing: 12,
  successRate: 95.5,
  averageProcessTime: 15
};

export const mockOrders = [
  {
    id: "API20240120001",
    orderNumber: "ORD20240120001",
    customer: "john@example.com",
    type: "token",
    spec: "100K Tokens",
    amountUsd: 20,
    amountCny: 138,
    apiKey: "sk-YtP8VbnM3k9L2xQ7WpKjHs4F8gNz2CvX",
    apiKeyStatus: "active",
    status: "completed",
    createdAt: "2024-01-20 10:30:00",
    usage: {
      used: 25000,
      total: 100000
    }
  },
  {
    id: "API20240120002",
    orderNumber: "ORD20240120002",
    customer: "company@enterprise.com",
    type: "rental",
    spec: "团队版 - 30天",
    amountUsd: 100,
    amountCny: 699,
    apiKey: "sk-JpK4NmR7Hs2W9Yx5BvL8qTc3MdQ9nZx",
    apiKeyStatus: "active",
    status: "completed",
    createdAt: "2024-01-20 11:45:00",
    usage: {
      remainingDays: 25
    }
  },
  {
    id: "API20240120003",
    orderNumber: "ORD20240120003",
    customer: "alice@startup.co",
    type: "token",
    spec: "500K Tokens",
    amountUsd: 65,
    amountCny: 439,
    apiKey: "sk-ThM2BvC8Gn5X4Zp9KjY7Wt6RsL3mNb",
    apiKeyStatus: "warning",
    status: "completed",
    createdAt: "2024-01-20 14:20:00",
    usage: {
      used: 480000,
      total: 500000
    }
  },
  {
    id: "API20240120004",
    orderNumber: "ORD20240120004",
    customer: "bob@gmail.com",
    type: "token",
    spec: "1M Tokens",
    amountUsd: 120,
    amountCny: 799,
    apiKey: "sk-Qw3Er5Ty7Ui9Op1Mn2Bv4Cx6Zs8Kj",
    apiKeyStatus: "depleted",
    status: "completed",
    createdAt: "2024-01-20 15:30:00",
    usage: {
      used: 1000000,
      total: 1000000
    }
  },
  {
    id: "API20240120005",
    orderNumber: "ORD20240120005",
    customer: "developer@tech.co",
    type: "rental",
    spec: "个人版 - 90天",
    amountUsd: 50,
    amountCny: 369,
    apiKey: "sk-Lk9Mj8Nh7Bg6Vf5Cd4Xs3Zw2Qy1T",
    apiKeyStatus: "warning",
    status: "completed",
    createdAt: "2024-01-20 16:15:00",
    usage: {
      remainingDays: 5
    }
  },
  {
    id: "API20240120006",
    orderNumber: "ORD20240120006",
    customer: "sarah@research.org",
    type: "token",
    spec: "300K Tokens",
    amountUsd: 40,
    amountCny: 279,
    apiKey: "sk-Wd4Rf6Tg8Yh0Uj2Mk9Nl5Bx7Cv3",
    apiKeyStatus: "active",
    status: "processing",
    createdAt: "2024-01-20 17:00:00",
    usage: {
      used: 50000,
      total: 300000
    }
  },
  {
    id: "API20240120007",
    orderNumber: "ORD20240120007",
    customer: "team@agency.com",
    type: "rental",
    spec: "团队版 - 365天",
    amountUsd: 399,
    amountCny: 2799,
    apiKey: "sk-Po2Wi9Qm4Nx6Bv8Hy7Jk5Fg3Ds1",
    apiKeyStatus: "active",
    status: "pending",
    createdAt: "2024-01-20 17:45:00",
    usage: {
      remainingDays: 365
    }
  },
  {
    id: "API20240120008",
    orderNumber: "ORD20240120008",
    customer: "david@freelance.net",
    type: "token",
    spec: "100K Tokens",
    amountUsd: 20,
    amountCny: 138,
    apiKey: "sk-Yt6Ui9Op2Lk4Mj7Nh0Bx3Vf5Cz8",
    apiKeyStatus: "failed",
    status: "failed",
    createdAt: "2024-01-20 18:20:00",
    usage: {
      used: 0,
      total: 100000
    }
  }
];

// Token包定价
export const tokenPackages = [
  { value: '100k', label: '10万 tokens', price: 99, tokens: 100000 },
  { value: '300k', label: '30万 tokens', price: 279, tokens: 300000 },
  { value: '500k', label: '50万 tokens', price: 439, tokens: 500000 },
  { value: '1000k', label: '100万 tokens', price: 799, tokens: 1000000 }
];

// 租用时长定价
export const rentalPackages = [
  { value: '7d', label: '7天', price: 199 },
  { value: '15d', label: '15天', price: 369 },
  { value: '30d', label: '30天', price: 699 },
  { value: '90d', label: '90天', price: 1899 },
  { value: '365d', label: '365天', price: 2799 }
];

// 历史记录
export const mockOrderHistory = [
  {
    id: '1',
    orderId: 'API20240120001',
    action: 'create_order',
    content: '订单创建',
    operatorId: 'system',
    operatorName: '系统',
    createdAt: '2024-01-20 10:30:00'
  },
  {
    id: '2',
    orderId: 'API20240120001',
    action: 'payment_success',
    content: '支付成功 - 支付宝',
    operatorId: 'system',
    operatorName: '系统',
    createdAt: '2024-01-20 10:31:23'
  },
  {
    id: '3',
    orderId: 'API20240120001',
    action: 'key_generation',
    content: 'API Key生成完成',
    operatorId: 'system',
    operatorName: '系统',
    createdAt: '2024-01-20 10:31:25'
  },
  {
    id: '4',
    orderId: 'API20240120001',
    action: 'status_update',
    content: '订单状态更新为: completed',
    operatorId: 'operator001',
    operatorName: '客服小王',
    createdAt: '2024-01-20 10:32:00'
  }
];