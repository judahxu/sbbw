CREATE TABLE IF NOT EXISTS `accelerator_device` (
	`id` varchar(255) NOT NULL,
	`service_id` varchar(255) NOT NULL,
	`device_id` varchar(255) NOT NULL,
	`device_name` varchar(255),
	`last_active_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT IF NOT EXISTS `accelerator_device_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `accelerator_order` (
	`id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`version` enum('personal','team') NOT NULL,
	`duration` varchar(20) NOT NULL,
	`device_limit` int NOT NULL,
	`current_devices` int DEFAULT 0,
	`service_id` varchar(255),
	`bundle_order_id` varchar(255),
	`starts_at` timestamp,
	`expires_at` timestamp,
	CONSTRAINT `accelerator_order_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `accelerator_service` (
	`id` varchar(255) NOT NULL,
	`type` enum('personal','team') NOT NULL,
	`device_limit` int NOT NULL,
	`account_id` varchar(255) NOT NULL,
	`user_email` varchar(255) NOT NULL,
	`duration` varchar(20) NOT NULL,
	`starts_at` timestamp NOT NULL,
	`expires_at` timestamp NOT NULL,
	`status` enum('active','expired') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accelerator_service_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `account_order` (
	`id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`product_type` enum('chatgpt','claude') NOT NULL,
	`account_type` enum('permanent','temporary') NOT NULL,
	`bundle_type` varchar(255),
	`include_plus` boolean DEFAULT false,
	`temporary_days` int,
	`accelerator_days` int,
	`plus_months` int,
	`account_id` varchar(255),
	`allocation_status` enum('pending','completed','failed') DEFAULT 'pending',
	`account_email` varchar(255),
	`accelerator_expire_at` timestamp,
	`plus_expire_at` timestamp,
	CONSTRAINT `account_order_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `account` (
	`user_id` varchar(255) NOT NULL,
	`type` varchar(255) NOT NULL,
	`provider` varchar(255) NOT NULL,
	`provider_account_id` varchar(255) NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` int,
	`token_type` varchar(255),
	`scope` varchar(255),
	`id_token` text,
	`session_state` varchar(255),
	CONSTRAINT `account_provider_provider_account_id_pk` PRIMARY KEY(`provider`,`provider_account_id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `api_key` (
	`id` varchar(255) NOT NULL,
	`api_key` varchar(255) NOT NULL,
	`platform` enum('openai','claude') NOT NULL,
	`user_email` varchar(255) NOT NULL,
	`quota_limit` int NOT NULL,
	`quota_used` int DEFAULT 0,
	`expires_at` timestamp,
	`status` enum('active','expired','disabled') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `api_key_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `api_order` (
	`id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`type` enum('token','rental') NOT NULL,
	`platform` enum('openai','anthropic') NOT NULL,
	`spec` varchar(255) NOT NULL,
	`token_amount` int,
	`rental_days` int,
	`api_key_id` varchar(255),
	`api_key` varchar(255),
	`expires_at` timestamp,
	CONSTRAINT `api_order_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `bundle` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`account_type` enum('permanent','temporary') NOT NULL,
	`platform` enum('chatgpt','claude') NOT NULL,
	`plus_duration` varchar(255),
	`accelerator_duration` varchar(255),
	`features` json,
	`original_price` decimal(10,2) NOT NULL,
	`sale_price` decimal(10,2) NOT NULL,
	`tag` varchar(50),
	`status` enum('active','inactive') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bundle_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `config_template` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('account','accelerator','recharge') NOT NULL,
	`config` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `config_template_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `config_version` (
	`id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`config` json NOT NULL,
	`version` int NOT NULL,
	`source` varchar(50) NOT NULL DEFAULT 'manual',
	`source_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `config_version_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `option_group` (
	`id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`required` boolean DEFAULT false,
	`dependencies` json,
	`order` int DEFAULT 0,
	CONSTRAINT `option_group_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `order_history` (
	`id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`action` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`operator_id` varchar(255),
	`operator_name` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`metadata` json,
	CONSTRAINT `order_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `order` (
	`id` varchar(255) NOT NULL,
	`order_number` varchar(255) NOT NULL,
	`type` enum('account','accelerator','api','plus_recharge') NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`user_email` varchar(255) NOT NULL,
	`amount_usd` decimal(10,2) NOT NULL,
	`amount_cny` decimal(10,2) NOT NULL,
	`payment_channel` enum('alipay','wechat','transfer') NOT NULL,
	`payment_status` enum('pending','paid','failed','refunded') NOT NULL,
	`order_status` enum('pending','processing','completed','failed','cancelled') NOT NULL,
	`operator_id` varchar(255),
	`note` text,
	`payment_time` timestamp,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `order_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `plus_recharge_order` (
	`id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`account_email` varchar(255) NOT NULL,
	`account_password` varchar(255) NOT NULL,
	`contact` varchar(255),
	`subscription` varchar(20) NOT NULL,
	`retry_count` int DEFAULT 0,
	`failure_reason` varchar(255),
	CONSTRAINT `plus_recharge_order_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `product_config` (
	`id` varchar(255) NOT NULL,
	`product_id` varchar(255) NOT NULL,
	`config` json NOT NULL,
	`version_id` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `product_option` (
	`id` varchar(255) NOT NULL,
	`group_id` varchar(255) NOT NULL,
	`label` varchar(255) NOT NULL,
	`value` varchar(255) NOT NULL,
	`price` decimal(10,2) DEFAULT '0',
	`order` int DEFAULT 0,
	CONSTRAINT `product_option_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `product` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('account','accelerator','recharge') NOT NULL,
	`base_price` decimal(10,2) NOT NULL,
	`status` enum('active','inactive') NOT NULL DEFAULT 'inactive',
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `service_account_subscription` (
	`id` varchar(255) NOT NULL,
	`account_id` varchar(255) NOT NULL,
	`subscription_type` enum('monthly','quarterly','yearly') NOT NULL,
	`starts_at` timestamp NOT NULL,
	`expires_at` timestamp NOT NULL,
	`auto_renewal` boolean DEFAULT false,
	`status` enum('active','expired','cancelled') NOT NULL DEFAULT 'active',
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_account_subscription_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `service_account` (
	`id` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`platform` enum('gpt','claude') NOT NULL,
	`type` enum('permanent','temporary') NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'in_stock',
	`bundle_type` varchar(255),
	`temporary_duration` varchar(20),
	`temporary_expire_at` timestamp,
	`plus_duration` varchar(20),
	`plus_expire_at` timestamp,
	`accelerator_duration` varchar(20),
	`accelerator_expire_at` timestamp,
	`assigned_email` varchar(255),
	`assigned_at` timestamp,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	`last_checked_at` timestamp,
	`note` text,
	CONSTRAINT `service_account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `session` (
	`session_token` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `session_session_token` PRIMARY KEY(`session_token`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `user` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255),
	`email` varchar(255) NOT NULL,
	`hashed_password` varchar(255),
	`email_verified` timestamp(3) DEFAULT CURRENT_TIMESTAMP(3),
	`image` varchar(255),
	`role` varchar(20) NOT NULL DEFAULT 'user',
	CONSTRAINT `user_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `verification_token` (
	`identifier` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `verification_token_identifier_token_pk` PRIMARY KEY(`identifier`,`token`)
);
--> statement-breakpoint
ALTER TABLE `accelerator_device` ADD CONSTRAINT `accelerator_device_service_id_accelerator_service_id_fk` FOREIGN KEY (`service_id`) REFERENCES `accelerator_service`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `accelerator_order` ADD CONSTRAINT `accelerator_order_order_id_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `account_order` ADD CONSTRAINT `account_order_order_id_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `api_order` ADD CONSTRAINT `api_order_order_id_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `config_version` ADD CONSTRAINT `config_version_product_id_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `option_group` ADD CONSTRAINT `option_group_product_id_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order_history` ADD CONSTRAINT `order_history_order_id_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `plus_recharge_order` ADD CONSTRAINT `plus_recharge_order_order_id_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_config` ADD CONSTRAINT `product_config_product_id_product_id_fk` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_config` ADD CONSTRAINT `product_config_version_id_config_version_id_fk` FOREIGN KEY (`version_id`) REFERENCES `config_version`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_option` ADD CONSTRAINT `product_option_group_id_option_group_id_fk` FOREIGN KEY (`group_id`) REFERENCES `option_group`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `service_account_subscription` ADD CONSTRAINT `service_account_subscription_account_id_service_account_id_fk` FOREIGN KEY (`account_id`) REFERENCES `service_account`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `device_service_idx` ON `accelerator_device` (`service_id`);--> statement-breakpoint
CREATE INDEX `device_id_idx` ON `accelerator_device` (`device_id`);--> statement-breakpoint
CREATE INDEX `accelerator_account_id_idx` ON `accelerator_service` (`account_id`);--> statement-breakpoint
CREATE INDEX `accelerator_user_email_idx` ON `accelerator_service` (`user_email`);--> statement-breakpoint
CREATE INDEX `accelerator_expiry_idx` ON `accelerator_service` (`expires_at`);--> statement-breakpoint
CREATE INDEX `accelerator_status_idx` ON `accelerator_service` (`status`);--> statement-breakpoint
CREATE INDEX `account_user_id_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `api_key_email_idx` ON `api_key` (`user_email`);--> statement-breakpoint
CREATE INDEX `api_key_expiry_idx` ON `api_key` (`expires_at`);--> statement-breakpoint
CREATE INDEX `api_key_status_idx` ON `api_key` (`status`);--> statement-breakpoint
CREATE INDEX `bundle_name_idx` ON `bundle` (`name`);--> statement-breakpoint
CREATE INDEX `bundle_status_idx` ON `bundle` (`status`);--> statement-breakpoint
CREATE INDEX `bundle_platform_idx` ON `bundle` (`platform`);--> statement-breakpoint
CREATE INDEX `plus_subscription_account_idx` ON `service_account_subscription` (`account_id`);--> statement-breakpoint
CREATE INDEX `plus_subscription_expiry_idx` ON `service_account_subscription` (`expires_at`);--> statement-breakpoint
CREATE INDEX `service_account_email_idx` ON `service_account` (`email`);--> statement-breakpoint
CREATE INDEX `service_account_status_idx` ON `service_account` (`status`);--> statement-breakpoint
CREATE INDEX `account_plus_expire_at_idx` ON `service_account` (`plus_expire_at`);--> statement-breakpoint
CREATE INDEX `account_accelerator_expire_at_idx` ON `service_account` (`accelerator_expire_at`);--> statement-breakpoint
CREATE INDEX `account_temporary_expire_at_idx` ON `service_account` (`temporary_expire_at`);--> statement-breakpoint
CREATE INDEX `session_user_id_idx` ON `session` (`user_id`);