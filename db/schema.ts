import { index, jsonb, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

export const students = pgTable('students', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  registrationId: text('registration_id').notNull(),
  semester: text('semester').notNull().default('3'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [
  uniqueIndex('students_registration_id_unique').on(table.registrationId),
  index('students_created_at_idx').on(table.createdAt),
])

export const quizAttempts = pgTable('quiz_attempts', {
  id: text('id').primaryKey(),
  deviceHash: text('device_hash').notNull(),
  courseCode: text('course_code').notNull(),
  result: jsonb('result').notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }).notNull(),
}, table => [index('quiz_attempts_device_idx').on(table.deviceHash)])
