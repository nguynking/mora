-- PostgreSQL equivalent of the existing D1 schema. Historical migrations remain untouched.
CREATE TABLE "rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"created" bigint NOT NULL
);

CREATE TABLE "members" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"joined" bigint NOT NULL
);

CREATE TABLE "bots" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"creator_id" text NOT NULL,
	"created" bigint NOT NULL
);

CREATE TABLE "contexts" (
	"room_id" text PRIMARY KEY NOT NULL,
	"goal" text NOT NULL,
	"repo" text DEFAULT '' NOT NULL,
	"decisions" text NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"editor" text NOT NULL,
	"updated" bigint NOT NULL,
	FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON UPDATE no action ON DELETE no action
);

CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"author_id" text NOT NULL,
	"author" text NOT NULL,
	"text" text NOT NULL,
	"kind" text DEFAULT 'human' NOT NULL,
	"parent_id" text,
	"file_id" text,
	"file_name" text,
	"created" bigint NOT NULL,
	FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON UPDATE no action ON DELETE no action
);

CREATE TABLE "tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"title" text NOT NULL,
	"request" text NOT NULL,
	"plan" text NOT NULL,
	"context_snapshot" text NOT NULL,
	"context_revision" integer NOT NULL,
	"status" text NOT NULL,
	"mode" text NOT NULL,
	"requester" text NOT NULL,
	"approved_by" text,
	"continued_by" text,
	"output" text,
	"error" text,
	"created" bigint NOT NULL,
	"updated" bigint NOT NULL,
	FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON UPDATE no action ON DELETE no action
);

CREATE TABLE "files" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"name" text NOT NULL,
	"size" integer NOT NULL,
	"mime" text NOT NULL,
	"uploader" text NOT NULL,
	"created" bigint NOT NULL,
	FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON UPDATE no action ON DELETE no action
);

CREATE TABLE "reactions" (
	"id" text PRIMARY KEY NOT NULL,
	"message_id" text NOT NULL,
	"user_id" text NOT NULL,
	"emoji" text NOT NULL,
	FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON UPDATE no action ON DELETE no action
);

CREATE TABLE "room_members" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"member_id" text NOT NULL,
	"joined" bigint NOT NULL,
	FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON UPDATE no action ON DELETE no action
);

CREATE TABLE "bot_replies" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"status" text NOT NULL,
	"updated" bigint NOT NULL,
	FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON UPDATE no action ON DELETE no action
);

CREATE INDEX "idx_messages_room_created" ON "messages" ("room_id","created");

CREATE INDEX "idx_tasks_room_created" ON "tasks" ("room_id","created");

CREATE INDEX "idx_room_members_member" ON "room_members" ("member_id","room_id");

ALTER TABLE "rooms" ADD "kind" text DEFAULT 'group' NOT NULL;

ALTER TABLE "rooms" ADD "restricted" integer DEFAULT 0 NOT NULL;

ALTER TABLE "rooms" ADD "direct_key" text;

CREATE UNIQUE INDEX "rooms_direct_key_unique" ON "rooms" ("direct_key");

INSERT INTO room_members (id,room_id,member_id,joined)
SELECT id || ':mora', id, 'mora', created FROM rooms;

CREATE TABLE uploads (
 id text PRIMARY KEY, room_id text NOT NULL REFERENCES rooms(id), user_id text NOT NULL,
 name text NOT NULL, size integer NOT NULL CHECK(size BETWEEN 1 AND 5242880), mime text NOT NULL, expires bigint NOT NULL
);
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploads ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON SCHEMA mora FROM PUBLIC;
