CREATE TABLE `payment_record` (
	`id` varchar(255) NOT NULL,
	`order_id` varchar(255) NOT NULL,
	`payment_no` varchar(32) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'pending',
	`payment_method` varchar(20) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`paid_at` timestamp,
	`refunded_at` timestamp,
	`transaction_id` varchar(64),
	CONSTRAINT `payment_record_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_record_payment_no_unique` UNIQUE(`payment_no`)
);
--> statement-breakpoint
ALTER TABLE `payment_record` ADD CONSTRAINT `payment_record_order_id_order_id_fk` FOREIGN KEY (`order_id`) REFERENCES `order`(`id`) ON DELETE no action ON UPDATE no action;