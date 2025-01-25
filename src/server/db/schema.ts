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
  decimal
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
  serviceAccounts: many(serviceAccounts), 
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







// 账号相关枚举定义
export const AccountPlatform = {
  GPT: 'gpt',
  CLAUDE: 'claude',
} as const;

export const AccountStatus = {
  IN_STOCK: 'in_stock',
  ASSIGNED: 'assigned',
  EXPIRED: 'expired',
} as const;

// AI账号表
export const serviceAccounts  = createTable("service_account", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: varchar("email", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  platform: mysqlEnum("platform", ['gpt', 'claude']).notNull(),
  type: mysqlEnum("type", ['permanent', 'temporary']).notNull(),
  status: varchar("status", { length: 20 })
    .notNull()
    .default('in_stock'),
  bundleType: varchar("bundle_type", { length: 255 }), // 套餐类型

      // 临时账号相关
  temporaryDuration: varchar("temporary_duration", { length: 20 }),  // 如 7d, 15d, 30d
  temporaryExpireAt: timestamp("temporary_expire_at"),  // 到期时间
  
  // Plus相关
  plusDuration: varchar("plus_duration", { length: 20 }), // monthly, quarterly, yearly
  plusExpireAt: timestamp("plus_expire_at"), // Plus到期时间
  
  // 加速器相关
  acceleratorDuration: varchar("accelerator_duration", { length: 20 }), // 30d, 90d, 180d, 365d
  acceleratorExpireAt: timestamp("accelerator_expire_at"), // 加速器到期时间
  assignedEmail: varchar("assigned_email", { length: 255 }),  // 改为直接存储邮箱
  assignedAt: timestamp("assigned_at"),
  isActive: boolean("is_active")
    .notNull()
    .default(true),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
  lastCheckedAt: timestamp("last_checked_at"),
  note: text("note"),
}, (account) => ({
  emailIdx: index("service_account_email_idx").on(account.email),
  statusIdx: index("service_account_status_idx").on(account.status),
  plusExpireAtIdx: index("account_plus_expire_at_idx").on(account.plusExpireAt),
  acceleratorExpireAtIdx: index("account_accelerator_expire_at_idx").on(account.acceleratorExpireAt),
  temporaryExpireAtIdx: index("account_temporary_expire_at_idx").on(account.temporaryExpireAt),
}));

// Plus订阅表
export const serviceAccountSubscriptions  = createTable("service_account_subscription", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  accountId: varchar("account_id", { length: 255 })
    .notNull()
    .references(() => serviceAccounts.id),
  subscriptionType: mysqlEnum("subscription_type", ['monthly', 'quarterly', 'yearly'])
    .notNull(),
  startsAt: timestamp("starts_at").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  autoRenewal: boolean("auto_renewal").default(false),
  status: mysqlEnum("status", ['active', 'expired', 'cancelled'])
    .notNull()
    .default('active'),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
}, (subscription) => ({
  accountIdx: index("plus_subscription_account_idx").on(subscription.accountId),
  expiryIdx: index("plus_subscription_expiry_idx").on(subscription.expiresAt),
}));

// API Key表
export const apiKeys = createTable("api_key", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  apiKey: varchar("api_key", { length: 255 }).notNull(),
  platform: mysqlEnum("platform", ['openai', 'claude']).notNull(),
  userEmail: varchar("user_email", { length: 255 }).notNull(),
  quotaLimit: int("quota_limit").notNull(),
  quotaUsed: int("quota_used").default(0),
  expiresAt: timestamp("expires_at"),
  status: mysqlEnum("status", ['active', 'expired', 'disabled'])
    .notNull()
    .default('active'),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
}, (apiKey) => ({
  emailIdx: index("api_key_email_idx").on(apiKey.userEmail),
  expiryIdx: index("api_key_expiry_idx").on(apiKey.expiresAt),
  statusIdx: index("api_key_status_idx").on(apiKey.status),
}));

// 加速器服务表
export const acceleratorServices = createTable("accelerator_service", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  type: mysqlEnum("type", ['personal', 'team']).notNull(),
  deviceLimit: int("device_limit").notNull(),
  accountId: varchar("account_id", { length: 255 }).notNull(),
  userEmail: varchar("user_email", { length: 255 }).notNull(),
  duration: varchar("duration", { length: 20 }).notNull(), // 1m/3m/6m/12m 
  startsAt: timestamp("starts_at").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  status: mysqlEnum("status", ['active', 'expired'])
    .notNull()
    .default('active'),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
}, (service) => ({
  accountIdIdx: index("accelerator_account_id_idx").on(service.accountId),
  userEmailIdx: index("accelerator_user_email_idx").on(service.userEmail),
  expiryIdx: index("accelerator_expiry_idx").on(service.expiresAt),
  statusIdx: index("accelerator_status_idx").on(service.status),
}));

// 加速器设备表
export const acceleratorDevices = createTable("accelerator_device", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  serviceId: varchar("service_id", { length: 255 })
    .notNull()
    .references(() => acceleratorServices.id),
  deviceId: varchar("device_id", { length: 255 }).notNull(),
  deviceName: varchar("device_name", { length: 255 }),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
}, (device) => ({
  serviceIdx: index("device_service_idx").on(device.serviceId),
  deviceIdx: index("device_id_idx").on(device.deviceId),
}));




export const serviceAccountsRelations  = relations(serviceAccounts, ({ one,many }) => ({
  plusSubscription: one(serviceAccountSubscriptions, {
    fields: [serviceAccounts.id],
    references: [serviceAccountSubscriptions.accountId],
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({

}));

export const acceleratorServicesRelations = relations(acceleratorServices, ({ one, many }) => ({
  devices: many(acceleratorDevices),
}));

export const acceleratorDevicesRelations = relations(acceleratorDevices, ({ one }) => ({
  service: one(acceleratorServices, {
    fields: [acceleratorDevices.serviceId],
    references: [acceleratorServices.id],
  }),
}));


// src/server/db/schema.ts

export const bundles = createTable("bundle", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  accountType: mysqlEnum("account_type", ['permanent', 'temporary']).notNull(),
  platform: mysqlEnum("platform", ['chatgpt', 'claude']).notNull(),
  plusDuration: varchar("plus_duration", { length: 255 }),
  acceleratorDuration: varchar("accelerator_duration", { length: 255 }),
  features: json("features").$type<Array<{ label: string; included: boolean }>>(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }).notNull(),
  tag: varchar("tag", { length: 50 }),
  status: mysqlEnum("status", ['active', 'inactive']).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
}, (table) => ({
  nameIdx: index("bundle_name_idx").on(table.name),
  statusIdx: index("bundle_status_idx").on(table.status),
  platformIdx: index("bundle_platform_idx").on(table.platform)
}));



// 产品表
export const products = createTable("product", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ['account', 'accelerator', 'recharge'])
    .notNull(),
  basePrice: decimal("base_price", { precision: 10, scale: 2 })
    .notNull(),
  status: mysqlEnum("status", ['active', 'inactive'])
    .notNull()
    .default('inactive'),
  description: text("description"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

// 选项组表
export const optionGroups = createTable("option_group", {
  id: varchar("id", { length: 255 })  // 改用字符串ID
  .notNull()
  .primaryKey(),
  productId: varchar("product_id", { length: 255 })
    .notNull()
    .references(() => products.id),
  name: varchar("name", { length: 255 }).notNull(),
  required: boolean("required").default(false),
  dependencies: json("dependencies").$type<{
    groupId: string;
    optionValue: string;
  }>(),
  order: int("order").default(0),
});

// 选项表
export const productOptions = createTable("product_option", {
  id: varchar("id", { length: 255 })  // 改用字符串ID
  .notNull()
  .primaryKey(),
  groupId: varchar("group_id", { length: 255 })  // 改用字符串ID
    .notNull()
    .references(() => optionGroups.id),
  label: varchar("label", { length: 255 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).default("0"),
  order: int("order").default(0),
});

// 关系定义
export const productsRelations = relations(products, ({ many }) => ({
  optionGroups: many(optionGroups)
}));

export const optionGroupsRelations = relations(optionGroups, ({ one, many }) => ({
  product: one(products, {
    fields: [optionGroups.productId],
    references: [products.id]
  }),
  options: many(productOptions)
}));

export const productOptionsRelations = relations(productOptions, ({ one }) => ({
  group: one(optionGroups, {
    fields: [productOptions.groupId],
    references: [optionGroups.id]
  })
}));


// 配置模板表
export const configTemplates = createTable("config_template", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ['account', 'accelerator', 'recharge'])
    .notNull(),
  config: json("config").notNull(),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

// 产品配置表
export const productConfigs = createTable("product_config", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: varchar("product_id", { length: 255 })
    .notNull()
    .references(() => products.id),
  config: json("config").notNull(),
  versionId: varchar("version_id", { length: 255 })
    .references(() => configVersions.id),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at").onUpdateNow(),
});

// 配置版本表
export const configVersions = createTable("config_version", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: varchar("product_id", { length: 255 })
    .notNull()
    .references(() => products.id),
  config: json("config").notNull(),
  version: int("version").notNull(),
  source: varchar("source", { length: 50 })
    .notNull()
    .default('manual'),
  sourceId: varchar("source_id", { length: 255 }),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// 关系定义
export const productConfigsRelations = relations(productConfigs, ({ one }) => ({
  product: one(products, {
    fields: [productConfigs.productId],
    references: [products.id]
  }),
  currentVersion: one(configVersions, {
    fields: [productConfigs.versionId],
    references: [configVersions.id]
  })
}));

export const configVersionsRelations = relations(configVersions, ({ one }) => ({
  product: one(products, {
    fields: [configVersions.productId],
    references: [products.id]
  })
}));




// 基础订单表
export const orders = createTable("order", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orderNumber: varchar("order_number", { length: 255 }).notNull(),
  type: mysqlEnum("type", [
    'account',
    'accelerator', 
    'api',
    'plus_recharge'
  ]).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  userEmail: varchar("user_email", { length: 255 }).notNull(),
  amountUsd: decimal("amount_usd", { precision: 10, scale: 2 }).notNull(),
  amountCny: decimal("amount_cny", { precision: 10, scale: 2 }).notNull(),
  paymentChannel: mysqlEnum("payment_channel", [
    'alipay',
    'wechat',
    'transfer'
  ]).notNull(),
  paymentStatus: mysqlEnum("payment_status", [
    'pending',
    'paid',
    'failed',
    'refunded'
  ]).notNull(),
  orderStatus: mysqlEnum("order_status", [
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled'
  ]).notNull(),
  operatorId: varchar("operator_id", { length: 255 }),
  note: text("note"),
  paymentTime: timestamp("payment_time"),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .onUpdateNow(),
});

// 账号订单详情
export const accountOrders = createTable("account_order", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orderId: varchar("order_id", { length: 255 })
    .notNull()
    .references(() => orders.id),
  productType: mysqlEnum("product_type", ['chatgpt', 'claude']).notNull(),
  accountType: mysqlEnum("account_type", ['permanent', 'temporary']).notNull(),
  bundleType: varchar("bundle_type", { length: 255 }),
  includePlus: boolean("include_plus").default(false),
  temporaryDays: int("temporary_days"),
  acceleratorDays: int("accelerator_days"),
  plusMonths: int("plus_months"),
  accountId: varchar("account_id", { length: 255 }),
  allocationStatus: mysqlEnum("allocation_status", [
    'pending',
    'completed',
    'failed'
  ]).default('pending'),
  accountEmail: varchar("account_email", { length: 255 }),
  acceleratorExpireAt: timestamp("accelerator_expire_at"),
  plusExpireAt: timestamp("plus_expire_at"),
});

// 加速器订单详情
export const acceleratorOrders = createTable("accelerator_order", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orderId: varchar("order_id", { length: 255 })
    .notNull()
    .references(() => orders.id),
  version: mysqlEnum("version", ['personal', 'team']).notNull(),
  duration: varchar("duration", { length: 20 }).notNull(),
  deviceLimit: int("device_limit").notNull(),
  currentDevices: int("current_devices").default(0),
  serviceId: varchar("service_id", { length: 255 }),
  bundleOrderId: varchar("bundle_order_id", { length: 255 }),
  startsAt: timestamp("starts_at"),
  expiresAt: timestamp("expires_at"),
});

// API订单详情
export const apiOrders = createTable("api_order", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orderId: varchar("order_id", { length: 255 })
    .notNull()
    .references(() => orders.id),
  type: mysqlEnum("type", ['token', 'rental']).notNull(),
  platform: mysqlEnum("platform", ['openai', 'anthropic']).notNull(),
  spec: varchar("spec", { length: 255 }).notNull(),
  tokenAmount: int("token_amount"),
  rentalDays: int("rental_days"),
  apiKeyId: varchar("api_key_id", { length: 255 }),
  apiKey: varchar("api_key", { length: 255 }),
  expiresAt: timestamp("expires_at"),
});

// Plus充值订单详情
export const plusRechargeOrders = createTable("plus_recharge_order", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orderId: varchar("order_id", { length: 255 })
    .notNull()
    .references(() => orders.id),
  accountEmail: varchar("account_email", { length: 255 }).notNull(),
  accountPassword: varchar("account_password", { length: 255 }).notNull(),
  contact: varchar("contact", { length: 255 }),
  subscription: varchar("subscription", { length: 20 }).notNull(),
  retryCount: int("retry_count").default(0),
  failureReason: varchar("failure_reason", { length: 255 }),
});

// 订单历史记录
export const orderHistory = createTable("order_history", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orderId: varchar("order_id", { length: 255 })
    .notNull()
    .references(() => orders.id),
  action: varchar("action", { length: 255 }).notNull(),
  content: text("content").notNull(),
  operatorId: varchar("operator_id", { length: 255 }),
  operatorName: varchar("operator_name", { length: 255 }),
  createdAt: timestamp("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  metadata: json("metadata"),
});

// 关系定义
export const ordersRelations = relations(orders, ({ one }) => ({
  accountOrder: one(accountOrders, {
    fields: [orders.id],
    references: [accountOrders.orderId],
  }),
  acceleratorOrder: one(acceleratorOrders, {
    fields: [orders.id],
    references: [acceleratorOrders.orderId],
  }),
  apiOrder: one(apiOrders, {
    fields: [orders.id],
    references: [apiOrders.orderId],
  }),
  plusRechargeOrder: one(plusRechargeOrders, {
    fields: [orders.id],
    references: [plusRechargeOrders.orderId],
  }),
}));