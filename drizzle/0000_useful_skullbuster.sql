CREATE TABLE `presence` (
	`room` text NOT NULL,
	`visitor` text NOT NULL,
	`seen` integer NOT NULL,
	`typing` integer NOT NULL,
	PRIMARY KEY(`room`, `visitor`)
);
--> statement-breakpoint
CREATE INDEX `presence_seen` ON `presence` (`seen`);