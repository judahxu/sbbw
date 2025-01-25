// mock/service.ts
import { mockStats, getPaginatedOrders, getMockDevices } from './acceleratorOrders';

// 是否使用mock数据的开关
const USE_MOCK = true;

// Mock服务
export const mockOrderService = {
  // 获取订单列表
  getOrders: (params: {
    page: number;
    pageSize: number;
    search?: string;
    status?: string;
    version?: string;
    duration?: string;
  }) => {
    if (!USE_MOCK) {
      return null;
    }

    return {
      data: getPaginatedOrders(params.page, params.pageSize, {
        search: params.search,
        status: params.status,
        version: params.version,
        duration: params.duration,
      }),
      success: true,
    };
  },

  // 获取统计数据
  getStats: () => {
    if (!USE_MOCK) {
      return null;
    }

    return {
      data: mockStats,
      success: true,
    };
  },

  // 获取设备列表
  getDevices: (orderId: string) => {
    if (!USE_MOCK) {
      return null;
    }

    return {
      data: getMockDevices(orderId),
      success: true,
    };
  },

  // 添加设备
  addDevice: (params: { orderId: string; deviceName: string }) => {
    if (!USE_MOCK) {
      return null;
    }

    const newDevice = {
      id: `DEV${Date.now()}`,
      deviceId: crypto.randomUUID(),
      deviceName: params.deviceName,
      lastActiveAt: new Date().toISOString(),
    };

    return {
      data: newDevice,
      success: true,
    };
  },

  // 移除设备
  removeDevice: (params: { orderId: string; deviceId: string }) => {
    if (!USE_MOCK) {
      return null;
    }

    return {
      success: true,
    };
  },

  // 续期订单
  renewOrder: (params: { orderId: string; duration: string }) => {
    if (!USE_MOCK) {
      return null;
    }

    return {
      success: true,
    };
  },
};