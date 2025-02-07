export enum AccountStatus {
  AVAILABLE = 'available',
  SOLD = 'sold',
  ABNORMAL = 'abnormal'
}

export interface Account {
  id: string;
  email: string;
  password: string;
  status: AccountStatus;
  createdAt: Date;
  soldAt?: Date ;
  orderId?: string;
  notes?: string;
}


// 类型守卫：检查字符串是否是有效的 AccountStatus
export function isValidAccountStatus(status: string): status is AccountStatus {
  return Object.values(AccountStatus).includes(status as AccountStatus);
}

// 转换函数
export function toAccountStatus(status: string): AccountStatus {
  if (isValidAccountStatus(status)) {
    return status;
  }
  // 可以选择抛出错误或返回默认值
  return AccountStatus.AVAILABLE; // 默认返回 Available
}

export interface ImportedAccount {
  email: string;
  password: string;
  status: AccountStatus;
  notes?: string;
}

export interface PaginationState {
  pageSize: number;
  currentPage: number;
  totalCount: number;
}

export interface AccountImportProps {
  onImport: (accounts: ImportedAccount[]) => void;
  onClose: () => void;
}