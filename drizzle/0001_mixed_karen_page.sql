CREATE TABLE `bot_replies` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`status` text NOT NULL,
	`updated` integer NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `bots` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`creator_id` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `room_members` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`member_id` text NOT NULL,
	`joined` integer NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_room_members_member` ON `room_members` (`member_id`,`room_id`);--> statement-breakpoint
ALTER TABLE `rooms` ADD `kind` text DEFAULT 'group' NOT NULL;--> statement-breakpoint
ALTER TABLE `rooms` ADD `restricted` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `rooms` ADD `direct_key` text;--> statement-breakpoint
CREATE UNIQUE INDEX `rooms_direct_key_unique` ON `rooms` (`direct_key`);
--> statement-breakpoint
INSERT INTO room_members (id,room_id,member_id,joined)
SELECT id || ':mora', id, 'mora', created FROM rooms;
