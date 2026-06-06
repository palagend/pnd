import { sql } from 'drizzle-orm'
import { pgTable, text, timestamp, numeric, uuid } from 'drizzle-orm/pg-core'

export const bills = pgTable('bills', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  type: text('type').notNull(), // 'income' or 'expense'
  category: text('category').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  date: timestamp('date').default(sql`CURRENT_TIMESTAMP`).notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull()
})
