// mock/acceleratorOrders.ts

import { ORDER_STATUS, VERSION_TYPE, DURATION_OPTIONS } from '../utils';

// 统计数据
export const mockStats = {
  todayOrders: {
    count: 45,
    amount: 2890
  },
  pendingActivation: 12,
  expiringCount: 28,
  deviceExceeded: 5
};

// 订单列表数据
export const mockOrders = [
  {
    id: "ORD24011901",
    customer: "张三",
    contactInfo: "133****8888",
    version: VERSION_TYPE.PERSONAL,
    duration: DURATION_OPTIONS.YEARLY,
    deviceLimit: 2,
    currentDevices: 1,
    amount: 168,
    status: ORDER_STATUS.ACTIVE,
    paymentStatus: "paid",
    startTime: "2024-01-19",
    endTime: "2025-01-18",
    isBundle: false,
    createTime: "2024-01-19 10:30:00"
  },
  {
    id: "ORD24011902",
    customer: "李四科技有限公司",
    contactInfo: "lee@company.com",
    version: VERSION_TYPE.TEAM,
    duration: DURATION_OPTIONS.QUARTERLY,
    deviceLimit: 5,
    currentDevices: 6,
    amount: 129.9,
    status: ORDER_STATUS.ACTIVE,
    paymentStatus: "paid",
    startTime: "2024-01-19",
    endTime: "2024-04-18",
    isBundle: false,
    createTime: "2024-01-19 14:20:00"
  },
  {
    id: "ORD24011903",
    customer: "王五",
    contactInfo: "wang@example.com",
    version: VERSION_TYPE.PERSONAL,
    duration: DURATION_OPTIONS.MONTHLY,
    deviceLimit: 2,
    currentDevices: 0,
    amount: 19.9,
    status: ORDER_STATUS.PENDING,
    paymentStatus: "paid",
    startTime: null,
    endTime: null,
    isBundle: false,
    createTime: "2024-01-19 16:45:00"
  },
  {
    id: "ORD24011904",
    customer: "智能科技公司",
    contactInfo: "tech@company.com",
    version: VERSION_TYPE.TEAM,
    duration: DURATION_OPTIONS.YEARLY,
    deviceLimit: 5,
    currentDevices: 4,
    amount: 399,
    status: ORDER_STATUS.ACTIVE,
    paymentStatus: "paid",
    startTime: "2024-01-19",
    endTime: "2025-01-18",
    isBundle: true,
    createTime: "2024-01-19 17:30:00"
  },
  {
    id: "ORD24011905",
    customer: "赵六",
    contactInfo: "zhao@gmail.com",
    version: VERSION_TYPE.PERSONAL,
    duration: DURATION_OPTIONS.MONTHLY,
    deviceLimit: 2,
    currentDevices: 2,
    amount: 19.9,
    status: ORDER_STATUS.EXPIRED,
    paymentStatus: "paid",
    startTime: "2023-12-19",
    endTime: "2024-01-18",
    isBundle: false,
    createTime: "2023-12-19 09:15:00"
  },
  {
    id: "ORD24011906",
    customer: "创新工作室",
    contactInfo: "studio@company.com",
    version: VERSION_TYPE.TEAM,
    duration: DURATION_OPTIONS.QUARTERLY,
    deviceLimit: 5,
    currentDevices: 3,
    amount: 129.9,
    status: ORDER_STATUS.ACTIVE,
    paymentStatus: "paid",
    startTime: "2024-01-01",
    endTime: "2024-01-26",
    isBundle: true,
    createTime: "2024-01-01 11:20:00"
  }
];

// 设备列表数据
export const mockDevices = {
  "ORD24011901": [
    {
      id: "DEV001",
      deviceId: "d4f21a3b-8c7d-4e9f-b5a2-6c8d9e0a1b3c",
      deviceName: "MacBook Pro",
      lastActiveAt: "2024-01-20 15:30:00"
    }
  ],
  "ORD24011902": [
    {
      id: "DEV002",
      deviceId: "7a1b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
      deviceName: "开发机-01",
      lastActiveAt: "2024-01-20 16:45:00"
    },
    {
      id: "DEV003",
      deviceId: "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
      deviceName: "开发机-02",
      lastActiveAt: "2024-01-20 16:40:00"
    },
    {
      id: "DEV004",
      deviceId: "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
      deviceName: "测试机-01",
      lastActiveAt: "2024-01-20 16:30:00"
    },
    {
      id: "DEV005",
      deviceId: "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
      deviceName: "测试机-02",
      lastActiveAt: "2024-01-20 16:20:00"
    },
    {
      id: "DEV006",
      deviceId: "5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t",
      deviceName: "演示机",
      lastActiveAt: "2024-01-20 16:10:00"
    }
  ],
  "ORD24011904": [
    {
      id: "DEV007",
      deviceId: "6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u",
      deviceName: "研发-01",
      lastActiveAt: "2024-01-20 15:00:00"
    },
    {
      id: "DEV008",
      deviceId: "7g8h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v",
      deviceName: "研发-02",
      lastActiveAt: "2024-01-20 14:30:00"
    },
    {
      id: "DEV009",
      deviceId: "8h9i0j1k-2l3m-4n5o-6p7q-8r9s0t1u2v3w",
      deviceName: "设计-01",
      lastActiveAt: "2024-01-20 14:00:00"
    },
    {
      id: "DEV010",
      deviceId: "9i0j1k2l-3m4n-5o6p-7q8r-9s0t1u2v3w4x",
      deviceName: "运维-01",
      lastActiveAt: "2024-01-20 13:30:00"
    }
  ],
  "ORD24011905": [
    {
      id: "DEV011",
      deviceId: "0j1k2l3m-4n5o-6p7q-8r9s-0t1u2v3w4x5y",
      deviceName: "Windows PC",
      lastActiveAt: "2024-01-18 23:59:59"
    },
    {
      id: "DEV012",
      deviceId: "1k2l3m4n-5o6p-7q8r-9s0t-1u2v3w4x5y6z",
      deviceName: "MacBook Air",
      lastActiveAt: "2024-01-18 23:59:59"
    }
  ],
  "ORD24011906": [
    {
      id: "DEV013",
      deviceId: "2l3m4n5o-6p7q-8r9s-0t1u-2v3w4x5y6z7a",
      deviceName: "工作站-01",
      lastActiveAt: "2024-01-20 12:30:00"
    },
    {
      id: "DEV014",
      deviceId: "3m4n5o6p-7q8r-9s0t-1u2v-3w4x5y6z7a8b",
      deviceName: "工作站-02",
      lastActiveAt: "2024-01-20 12:00:00"
    },
    {
      id: "DEV015",
      deviceId: "4n5o6p7q-8r9s-0t1u-2v3w-4x5y6z7a8b9c",
      deviceName: "笔记本-01",
      lastActiveAt: "2024-01-20 11:30:00"
    }
  ]
};

export const getMockDevices = (orderId: string) => {
  return mockDevices[orderId] || [];
};

// 分页数据模拟
export const getPaginatedOrders = (
  page: number,
  pageSize: number,
  filters?: {
    search?: string;
    status?: string;
    version?: string;
    duration?: string;
  }
) => {
  let filteredOrders = [...mockOrders];

  // 应用过滤
  if (filters) {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredOrders = filteredOrders.filter(order => 
        order.id.toLowerCase().includes(searchLower) ||
        order.customer.toLowerCase().includes(searchLower) ||
        order.contactInfo.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status && filters.status !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === filters.status);
    }

    if (filters.version && filters.version !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.version === filters.version);
    }

    if (filters.duration && filters.duration !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.duration === filters.duration);
    }
  }

  // 计算分页
  const total = filteredOrders.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = filteredOrders.slice(start, end);

  return {
    items,
    total,
    page,
    pageSize,
  };
};