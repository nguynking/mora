import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core';
export const presence = sqliteTable('presence', {
  room: text('room').notNull(),
  visitor: text('visitor').notNull(),
  seen: integer('seen').notNull(),
  typing: integer('typing').notNull(),
}, table => [primaryKey({ columns: [table.room, table.visitor] }), index('presence_seen').on(table.seen)]);
