import { relations, sql } from "drizzle-orm";
import {
  bigint,
  index,
  int,
  mysqlTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
  boolean,
  json,
  mysqlEnum,
  decimal,

} from "drizzle-orm/mysql-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = mysqlTableCreator((name) => `${name}`);



export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  hashedPassword: varchar("hashed_password", { length: 255 }),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    fsp: 3,
  }).default(sql`CURRENT_TIMESTAMP(3)`),
  image: varchar("image", { length: 255 }),
  role: varchar("role", { length: 20 }).default("user").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  // serviceAccounts: many(serviceAccounts), 
  // apiKeys: many(apiKeys),
  // acceleratorServices: many(acceleratorServices),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

//新表

export const appleAccounts = createTable("apple_account", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
    
  email: varchar("email", { length: 255 })
    .notNull()
    .unique(),
    
  password: varchar("password", { length: 255 })
    .notNull(),
    
  status: mysqlEnum("status", ['available', 'sold', 'abnormal'])
    .notNull()
    .default('available'),
    
  createdAt: timestamp("created_at", {
    mode: "date",
    fsp: 3,
  })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(3)`),
    
  updatedAt: timestamp("updated_at", {
    mode: "date",
    fsp: 3,
  })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(3)`),
    
  soldAt: timestamp("sold_at", {
    mode: "date",
    fsp: 3,
  }),
    
  orderId: varchar("order_id", { length: 255 }),
    
  notes: text("notes"),
});

export const serverAccounts = createTable("server_account", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  
  name: varchar("name", { length: 255 })
    .notNull(),
  
  config: varchar("config", { length: 1000 })
    .notNull(),
  
  status: varchar("status", { length: 20 })
    .default("available")
    .notNull(),
  
  assignedTo: varchar("assigned_to", { length: 255 })
    .references(() => users.id),
  
  assignmentStart: timestamp("assignment_start", {
    mode: "date",
    fsp: 3,
  }),
  
  duration: int("duration"),
  
  assignmentEnd: timestamp("assignment_end", {
    mode: "date",
    fsp: 3,
  }),
  
  createdAt: timestamp("created_at", {
    mode: "date",
    fsp: 3,
  })
    .default(sql`CURRENT_TIMESTAMP(3)`)
    .notNull(),
  
  updatedAt: timestamp("updated_at", {
    mode: "date",
    fsp: 3,
  })
    .default(sql`CURRENT_TIMESTAMP(3)`)
    .notNull(),
});

// 创建索引
export const appleAccountsIndexes = {
  statusIdx: index("status_idx").on(appleAccounts.status),
  emailIdx: index("email_idx").on(appleAccounts.email),
  orderIdIdx: index("order_id_idx").on(appleAccounts.orderId),
};

// 关系定义（如果需要）
export const appleAccountsRelations = relations(appleAccounts, ({ one }) => ({
  order: one(orders, {
    fields: [appleAccounts.orderId],
    references: [orders.id],
  }),
}));



// 配置类型枚举
export const ConfigType = {
  ACCELERATION: 'acceleration',
  APPSTORE: 'appstore',
  EXCHANGE_RATE: 'exchange_rate',
  SERVICE_FEE: 'service_fee',
} as const;

// 计费周期枚举
export const BillingCycle = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
  ONCE: 'once',
} as const;

// 统一配置表
// 统一配置表
export const configs = createTable("config", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  
  type: varchar("type", { length: 20 })
    .notNull(),
  
  name: varchar("name", { length: 100 })
    .notNull(),
  
  cycle: varchar("cycle", { length: 20 }),
  
  original_price: decimal("original_price", { precision: 10, scale: 2 }),
  
  current_price: decimal("current_price", { precision: 10, scale: 2 }),
  
  exchange_rate: decimal("exchange_rate", { precision: 10, scale: 4 }),
  
  fee_percentage: decimal("fee_percentage", { precision: 5, scale: 2 }),
  
  minimum_fee: decimal("minimum_fee", { precision: 10, scale: 2 }),
  
  maximum_fee: decimal("maximum_fee", { precision: 10, scale: 2 }),
  
  is_active: boolean("is_active")
    .notNull()
    .default(true),
  
  updated_at: timestamp("updated_at", {
    mode: "date",
    fsp: 3,
  })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP(3)`),
  
  updated_by: varchar("updated_by", { length: 255 })
    .notNull(),
});


// 订单主表
export const orders = createTable("order", {
  // 基本信息
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  
  // 关联用户
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id),
  
  // 订单类型
  type: mysqlEnum("type", ['recharge', 'appleId', 'acceleration'])
    .notNull(),
  
  // 订单状态
  status: mysqlEnum("status", [
    'pending_payment',
    'paid',
    'processing',
    'completed',
    'failed',
    'cancelled',
    'refunded'
  ]).notNull(),
  
  // 金额
  amount: decimal("amount", { precision: 10, scale: 2 })
    .notNull(),
  
  // 处理信息
  processedBy: varchar("processed_by", { length: 255 })
    .references(() => users.id),
  processedAt: timestamp("processed_at", {
    mode: "date",
    fsp: 3,
  }),
  
  // 备注
  remark: varchar("remark", { length: 1000 }),
  
  // 时间戳
  createdAt: timestamp("created_at", {
    mode: "date",
    fsp: 3,
  }).default(sql`CURRENT_TIMESTAMP(3)`),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    fsp: 3,
  }).default(sql`CURRENT_TIMESTAMP(3)`),
});

// 充值服务订单扩展表
export const rechargeOrders = createTable("recharge_order", {
  // 关联订单主表
  orderId: varchar("order_id", { length: 255 })
    .notNull()
    .primaryKey()
    .references(() => orders.id),
  
  // 美金金额
  usdAmount: decimal("usd_amount", { precision: 10, scale: 2 })
    .notNull(),
  
  // 汇率
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 4 })
    .notNull(),
  
  // 充值账号
  appliedAccount: varchar("applied_account", { length: 255 })
    .notNull(),
  
  // 礼品卡代码
  giftCardCode: varchar("gift_card_code", { length: 255 }),
});

// 美区账号订单扩展表
export const appleIdOrders = createTable("apple_id_order", {
  // 关联订单主表
  orderId: varchar("order_id", { length: 255 })
    .notNull()
    .primaryKey()
    .references(() => orders.id),
  
  // 账号信息
  email: varchar("email", { length: 255 }),
  password: varchar("password", { length: 255 }),
});

// 加速服务订单扩展表
export const accelerationOrders = createTable("acceleration_order", {
  // 关联订单主表
  orderId: varchar("order_id", { length: 255 })
    .notNull()
    .primaryKey()
    .references(() => orders.id),
  
  // 服务计划
  plan: mysqlEnum("plan", ['monthly', 'quarterly', 'yearly'])
    .notNull(),
  
  // 服务配置
  configuration: json("configuration").$type<{
    server: string;
    port: number;
    password: string;
  }>(),
  
  // 服务期限
  startDate: timestamp("start_date", {
    mode: "date",
    fsp: 3,
  }),
  endDate: timestamp("end_date", {
    mode: "date",
    fsp: 3,
  }),
});