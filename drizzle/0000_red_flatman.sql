CREATE TABLE `acceleration_order` (
	`order_id` varchar(255) NOT NULL,
	`plan` enum('monthly','quarterly','yearly') NOT NULL,
	`configuration` json,
	`start_date` timestamp(3),
	`end_date` timestamp(3),
	CONSTRAINT `acceleration_order_order_id` PRIMARY KEY(`order_id`)
);
--> statement-breakpoint
CREATE TABLE `account` (
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
CREATE TABLE `apple_account` (
	`id` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`status` enum('available','sold','abnormal') NOT NULL DEFAULT 'available',
	`created_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`sold_at` timestamp(3),
	`order_id` varchar(255),
	`notes` text,
	CONSTRAINT `apple_account_id` PRIMARY KEY(`id`),
	CONSTRAINT `apple_account_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `apple_id_order` (
	`order_id` varchar(255) NOT NULL,
	`email` varchar(255),
	`password` varchar(255),
	CONSTRAINT `apple_id_order_order_id` PRIMARY KEY(`order_id`)
);
--> statement-breakpoint
CREATE TABLE `config` (
	`id` varchar(255) NOT NULL,
	`type` varchar(20) NOT NULL,
	`name` varchar(100) NOT NULL,
	`cycle` varchar(20),
	`original_price` decimal(10,2),
	`current_price` decimal(10,2),
	`exchange_rate` decimal(10,4),
	`fee_percentage` decimal(5,2),
	`minimum_fee` decimal(10,2),
	`maximum_fee` decimal(10,2),
	`is_active` boolean NOT NULL DEFAULT true,
	`updated_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_by` varchar(255) NOT NULL,
	CONSTRAINT `config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`type` enum('recharge','appleId','acceleration') NOT NULL,
	`status` enum('pending_payment','paid','processing','completed','failed','cancelled','refunded') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`processed_by` varchar(255),
	`processed_at` timestamp(3),
	`remark` varchar(1000),
	`created_at` timestamp(3) DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` timestamp(3) DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `order_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recharge_order` (
	`order_id` varchar(255) NOT NULL,
	`usd_amount` decimal(10,2) NOT NULL,
	`exchange_rate` decimal(10,4) NOT NULL,
	`applied_account` varchar(255) NOT NULL,
	`gift_card_code` varchar(255),
	CONSTRAINT `recharge_order_order_id` PRIMARY KEY(`order_id`)
);
--> statement-breakpoint
CREATE TABLE `server_account` (
	`id` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`config` varchar(1000) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'available',
	`assigned_to` varchar(255),
	`assignment_start` timestamp(3),
	`duration` int,
	`assignment_end` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `server_account_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session` (
	`session_token` varchar(255) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `session_session_token` PRIMARY KEY(`session_token`)
);
--> statement-breakpoint
CREATE TABLE `user` (
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
CREATE TABLE `verification_token` (
	`identifier` varchar(255) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `verification_token_identifier_token_pk` PRIMARY KEY(`identifier`,`token`)
);
--> statement-breakpoint
ALTER TABLE `acceleration_order` ADD CONSTRAINT `acceleration_order_order_id_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `account` ADD CONSTRAINT `account_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `apple_id_order` ADD CONSTRAINT `apple_id_order_order_id_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order` ADD CONSTRAINT `order_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `order` ADD CONSTRAINT `order_processed_by_user_id_fk` FOREIGN KEY (`processed_by`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `recharge_order` ADD CONSTRAINT `recharge_order_order_id_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `server_account` ADD CONSTRAINT `server_account_assigned_to_user_id_fk` FOREIGN KEY (`assigned_to`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `account_user_id_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_user_id_idx` ON `session` (`user_id`);