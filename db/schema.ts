import { index, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const quizAttempts = pgTable('quiz_attempts', {
  id: text('id').primaryKey(),
  deviceHash: text('device_hash').notNull(),
  courseCode: text('course_code').notNull(),
  result: jsonb('result').notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }).notNull(),
}, table => [index('quiz_attempts_device_idx').on(table.deviceHash)])
