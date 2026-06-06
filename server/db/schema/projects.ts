import { sql } from 'drizzle-orm'
import { pgTable, text, timestamp, numeric, uuid } from 'drizzle-orm/pg-core'

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  clientId: uuid('client_id'),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').notNull(), // 'draft', 'active', 'completed', 'cancelled'
  budget: numeric('budget', { precision: 10, scale: 2 }),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull()
})
