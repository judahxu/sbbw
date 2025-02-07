ALTER TABLE `order` DROP FOREIGN KEY `order_processed_by_user_id_fk`;
--> statement-breakpoint
ALTER TABLE `acceleration_order` MODIFY COLUMN `configuration` varchar(255);