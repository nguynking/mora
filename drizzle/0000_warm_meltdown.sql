CREATE TABLE `contexts` (
	`room_id` text PRIMARY KEY NOT NULL,
	`goal` text NOT NULL,
	`repo` text DEFAULT '' NOT NULL,
	`decisions` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`editor` text NOT NULL,
	`updated` integer NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`name` text NOT NULL,
	`size` integer NOT NULL,
	`mime` text NOT NULL,
	`uploader` text NOT NULL,
	`created` integer NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`joined` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`author_id` text NOT NULL,
	`author` text NOT NULL,
	`text` text NOT NULL,
	`kind` text DEFAULT 'human' NOT NULL,
	`parent_id` text,
	`file_id` text,
	`file_name` text,
	`created` integer NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_messages_room_created` ON `messages` (`room_id`,`created`);--> statement-breakpoint
CREATE TABLE `reactions` (
	`id` text PRIMARY KEY NOT NULL,
	`message_id` text NOT NULL,
	`user_id` text NOT NULL,
	`emoji` text NOT NULL,
	FOREIGN KEY (`message_id`) REFERENCES `messages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`title` text NOT NULL,
	`request` text NOT NULL,
	`plan` text NOT NULL,
	`context_snapshot` text NOT NULL,
	`context_revision` integer NOT NULL,
	`status` text NOT NULL,
	`mode` text NOT NULL,
	`requester` text NOT NULL,
	`approved_by` text,
	`continued_by` text,
	`output` text,
	`error` text,
	`created` integer NOT NULL,
	`updated` integer NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_tasks_room_created` ON `tasks` (`room_id`,`created`);