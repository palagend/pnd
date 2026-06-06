# 数据库 Schema 设计

本文档详细描述 Palgend 项目的数据库结构设计，包括数据表定义、字段说明、索引设计和 Drizzle ORM 配置。

## 1. 技术选型

| 项目 | 选型 | 说明 |
|------|------|------|
| 数据库 | Neon PostgreSQL | Serverless PostgreSQL，边缘友好 |
| ORM | Drizzle ORM | 类型安全、轻量级、SQL-like |
| 连接方式 | Neon HTTP | 基于 HTTP 的无连接池方式 |
| RLS | Row Level Security | 行级安全策略 |

---

## 2. 数据表设计

### 2.1 用户表 (users)

存储用户账户信息。

```typescript
// server/db/schema/users.ts
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),           // 用户ID (clx开头)
  email: text('email').notNull().unique(), // 邮箱（唯一）
  password: text('password').notNull(),   // 密码（bcrypt加密）
  name: text('name').notNull(),           // 用户昵称
  avatar: text('avatar'),                // 头像URL
  emailVerified: boolean('email_verified').default(false), // 邮箱验证
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
```

**字段说明：**

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | text | PK | 用户唯一标识，格式：`clx` + 随机字符串 |
| email | text | UNIQUE, NOT NULL | 邮箱地址（用于登录） |
| password | text | NOT NULL | bcrypt 加密后的密码 |
| name | text | NOT NULL | 用户昵称 |
| avatar | text | - | 头像 URL |
| emailVerified | boolean | DEFAULT false | 邮箱是否已验证 |
| createdAt | timestamp | DEFAULT NOW() | 创建时间 |
| updatedAt | timestamp | DEFAULT NOW() | 更新时间 |

**索引：**

```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

---

### 2.2 账单表 (bills)

存储记账记录。

```typescript
// server/db/schema/bills.ts
import { pgTable, text, timestamp, decimal, index } from 'drizzle-orm/pg-core'

export const bills = pgTable('bills', {
  id: text('id').primaryKey(),           // 账单ID (blx开头)
  userId: text('user_id').notNull(),     // 所属用户ID
  type: text('type').notNull(),          // 类型: income/expense
  amount: decimal('amount', {            // 金额
    precision: 12,
    scale: 2,
  }).notNull(),
  category: text('category').notNull(),  // 分类标识
  categoryName: text('category_name').notNull(), // 分类名称（冗余存储）
  description: text('description'),     // 备注描述
  date: text('date').notNull(),          // 账单日期 (YYYY-MM-DD)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_bills_user_id').on(table.userId),
  dateIdx: index('idx_bills_date').on(table.date),
  typeIdx: index('idx_bills_type').on(table.type),
  userDateIdx: index('idx_bills_user_date').on(table.userId, table.date),
}))
```

**字段说明：**

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | text | PK | 账单唯一标识，格式：`blx` + 随机字符串 |
| userId | text | NOT NULL, INDEX | 所属用户ID |
| type | text | NOT NULL | 账单类型：`income`（收入）/ `expense`（支出） |
| amount | decimal(12,2) | NOT NULL | 金额，保留两位小数 |
| category | text | NOT NULL | 分类标识（如：`food`、`salary`） |
| categoryName | text | NOT NULL | 分类名称（冗余存储避免关联查询） |
| description | text | - | 备注描述 |
| date | text | NOT NULL | 账单日期，格式：`YYYY-MM-DD` |
| createdAt | timestamp | DEFAULT NOW() | 创建时间 |
| updatedAt | timestamp | DEFAULT NOW() | 更新时间 |

**索引：**

```sql
CREATE INDEX idx_bills_user_id ON bills(user_id);
CREATE INDEX idx_bills_date ON bills(date);
CREATE INDEX idx_bills_type ON bills(type);
CREATE INDEX idx_bills_user_date ON bills(user_id, date);
```

---

### 2.3 客户表 (clients)

存储客户信息。

```typescript
// server/db/schema/clients.ts
import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core'

export const clients = pgTable('clients', {
  id: text('id').primaryKey(),           // 客户ID (clx开头)
  userId: text('user_id').notNull(),     // 所属用户ID
  name: text('name').notNull(),          // 客户姓名
  phone: text('phone'),                  // 联系电话
  email: text('email'),                  // 邮箱地址
  company: text('company'),              // 公司名称
  address: text('address'),              // 地址
  remark: text('remark'),                // 备注
  status: text('status').default('active').notNull(), // 状态
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_clients_user_id').on(table.userId),
  statusIdx: index('idx_clients_status').on(table.status),
  nameIdx: index('idx_clients_name').on(table.name),
}))
```

**字段说明：**

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | text | PK | 客户唯一标识，格式：`clx` + 随机字符串 |
| userId | text | NOT NULL, INDEX | 所属用户ID |
| name | text | NOT NULL | 客户姓名 |
| phone | text | - | 联系电话 |
| email | text | - | 邮箱地址 |
| company | text | - | 公司名称 |
| address | text | - | 地址 |
| remark | text | - | 备注 |
| status | text | DEFAULT 'active' | 状态：`active`（活跃）/ `inactive`（不活跃） |
| createdAt | timestamp | DEFAULT NOW() | 创建时间 |
| updatedAt | timestamp | DEFAULT NOW() | 更新时间 |

**索引：**

```sql
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_name ON clients(name);
```

---

### 2.4 项目表 (projects)

存储项目台账信息。

```typescript
// server/db/schema/projects.ts
import { pgTable, text, timestamp, decimal, index } from 'drizzle-orm/pg-core'

export const projects = pgTable('projects', {
  id: text('id').primaryKey(),           // 项目ID (pjx开头)
  userId: text('user_id').notNull(),     // 所属用户ID
  clientId: text('client_id'),           // 关联客户ID
  name: text('name').notNull(),          // 项目名称
  description: text('description'),      // 项目描述
  amount: decimal('amount', {            // 项目金额
    precision: 12,
    scale: 2,
  }).default('0'),
  status: text('status').default('ongoing').notNull(), // 状态
  progress: integer('progress').default(0), // 项目进度 0-100
  startDate: text('start_date'),         // 开始日期
  endDate: text('end_date'),             // 结束日期
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_projects_user_id').on(table.userId),
  clientIdIdx: index('idx_projects_client_id').on(table.clientId),
  statusIdx: index('idx_projects_status').on(table.status),
}))
```

**字段说明：**

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | text | PK | 项目唯一标识，格式：`pjx` + 随机字符串 |
| userId | text | NOT NULL, INDEX | 所属用户ID |
| clientId | text | INDEX | 关联客户ID（可为空） |
| name | text | NOT NULL | 项目名称 |
| description | text | - | 项目描述 |
| amount | decimal(12,2) | DEFAULT 0 | 项目金额 |
| status | text | DEFAULT 'ongoing' | 项目状态：`ongoing`（进行中）/ `completed`（已完成）/ `cancelled`（已取消） |
| progress | integer | DEFAULT 0 | 项目进度（0-100） |
| startDate | text | - | 开始日期 |
| endDate | text | - | 结束日期 |
| createdAt | timestamp | DEFAULT NOW() | 创建时间 |
| updatedAt | timestamp | DEFAULT NOW() | 更新时间 |

**索引：**

```sql
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
```

---

### 2.5 会话表 (sessions)

存储用户会话信息（用于 JWT 黑名单等）。

```typescript
// server/db/schema/sessions.ts
import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core'

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),           // 会话ID
  userId: text('user_id').notNull(),     // 用户ID
  token: text('token').notNull().unique(), // Token哈希
  expiresAt: timestamp('expires_at').notNull(), // 过期时间
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_sessions_user_id').on(table.userId),
  tokenIdx: index('idx_sessions_token').on(table.token),
}))
```

---

## 3. 实体关系图 (ERD)

```mermaid
erDiagram
    users ||--o{ bills : "1:N"
    users ||--o{ clients : "1:N"
    users ||--o{ projects : "1:N"
    clients ||--o{ projects : "1:N"

    users {
        text id PK "用户ID"
        text email UK "邮箱"
        text password "密码"
        text name "昵称"
        text avatar "头像"
        timestamp created_at "创建时间"
        timestamp updated_at "更新时间"
    }

    bills {
        text id PK "账单ID"
        text user_id FK "用户ID"
        text type "类型: income/expense"
        decimal amount "金额"
        text category "分类"
        text date "日期"
        text description "备注"
        timestamp created_at "创建时间"
        timestamp updated_at "更新时间"
    }

    clients {
        text id PK "客户ID"
        text user_id FK "用户ID"
        text name "姓名"
        text phone "电话"
        text email "邮箱"
        text company "公司"
        text address "地址"
        text remark "备注"
        text status "状态"
        timestamp created_at "创建时间"
        timestamp updated_at "更新时间"
    }

    projects {
        text id PK "项目ID"
        text user_id FK "用户ID"
        text client_id FK "客户ID"
        text name "项目名称"
        text description "描述"
        decimal amount "金额"
        text status "状态"
        integer progress "进度"
        text start_date "开始日期"
        text end_date "结束日期"
        timestamp created_at "创建时间"
        timestamp updated_at "更新时间"
    }
```

---

## 4. Drizzle 配置

### 4.1 Schema 聚合导出

```typescript
// server/db/schema/index.ts
import { users } from './users'
import { bills } from './bills'
import { clients } from './clients'
import { projects } from './projects'
import { sessions } from './sessions'

export const schema = {
  users,
  bills,
  clients,
  projects,
  sessions,
}

export type Schema = typeof schema
```

### 4.2 数据库连接

```typescript
// server/db/index.ts
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

// 创建 Neon HTTP 客户端
const sql = neon(process.env.DATABASE_URL!)

// 创建 Drizzle 实例
export const db = drizzle(sql, { schema })

// 导出 schema 类型
export type Database = typeof db
```

### 4.3 环境变量

```bash
# .env.example
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

---

## 5. RLS 行级安全策略

### 5.1 启用 RLS

```sql
-- 启用行级安全
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
```

### 5.2 创建策略

```sql
-- 账单表策略：用户只能操作自己的数据
CREATE POLICY "bills_user_isolation" ON bills
  FOR ALL
  USING (user_id = current_setting('app.current_user_id')::text)
  WITH CHECK (user_id = current_setting('app.current_user_id')::text);

-- 客户表策略
CREATE POLICY "clients_user_isolation" ON clients
  FOR ALL
  USING (user_id = current_setting('app.current_user_id')::text)
  WITH CHECK (user_id = current_setting('app.current_user_id')::text);

-- 项目表策略
CREATE POLICY "projects_user_isolation" ON projects
  FOR ALL
  USING (user_id = current_setting('app.current_user_id')::text)
  WITH CHECK (user_id = current_setting('app.current_user_id')::text);
```

### 5.3 服务端设置用户上下文

```typescript
// server/middleware/01.auth.ts
export default defineEventHandler(async (event) => {
  // ... 认证逻辑 ...

  // 设置 RLS 用户上下文
  if (event.context.user) {
    await db.execute(
      sql`SELECT set_config('app.current_user_id', ${event.context.user.id}, true)`
    )
  }
})
```

---

## 6. 初始数据

### 6.1 账单分类

```typescript
// shared/constants/bill-categories.ts
export const BILL_CATEGORIES = {
  income: [
    { value: 'salary', label: '工资' },
    { value: 'bonus', label: '奖金' },
    { value: 'investment', label: '投资收益' },
    { value: 'gift', label: '礼金' },
    { value: 'other_income', label: '其他收入' },
  ],
  expense: [
    { value: 'food', label: '餐饮' },
    { value: 'transport', label: '交通' },
    { value: 'shopping', label: '购物' },
    { value: 'entertainment', label: '娱乐' },
    { value: 'housing', label: '居住' },
    { value: 'medical', label: '医疗' },
    { value: 'education', label: '教育' },
    { value: 'clothing', label: '服饰' },
    { value: 'digital', label: '数码' },
    { value: 'other_expense', label: '其他支出' },
  ],
}
```

### 6.2 项目状态

```typescript
// shared/constants/project-status.ts
export const PROJECT_STATUS = {
  ongoing: { value: 'ongoing', label: '进行中', color: 'primary' },
  completed: { value: 'completed', label: '已完成', color: 'success' },
  cancelled: { value: 'cancelled', label: '已取消', color: 'danger' },
}
```

---

## 7. 数据库迁移

### 7.1 Drizzle Kit 配置

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './server/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

### 7.2 迁移命令

```bash
# 生成迁移文件
pnpm drizzle:generate

# 执行迁移
pnpm drizzle:migrate

# 推送 Schema 到数据库（开发环境）
pnpm drizzle:push

# Studio 可视化
pnpm drizzle:studio
```

---

## 8. 性能优化建议

### 8.1 索引优化

- 对高频查询字段添加索引（已在 Schema 中定义）
- 对复合查询使用复合索引（如 `user_id + date`）
- 定期分析表统计信息：`ANALYZE table_name`

### 8.2 查询优化

```typescript
// 好的实践：使用 select 明确指定字段
const bills = await db.select({
  id: bills.id,
  amount: bills.amount,
  date: bills.date,
}).from(bills).where(eq(bills.userId, userId))

// 避免：select *
const bills = await db.select().from(bills)
```

### 8.3 分页优化

```typescript
// 使用 keyset 分页（性能更好）
const bills = await db.select().from(bills)
  .where(
    and(
      eq(bills.userId, userId),
      bills.date < lastDate // 使用上一页最后一条的日期
    )
  )
  .limit(pageSize)

// 替代 offset 分页（大数据量时性能差）
const bills = await db.select().from(bills)
  .where(eq(bills.userId, userId))
  .limit(20)
  .offset(1000)
```

---

## 附录：完整 Schema 文件

### server/db/schema/index.ts

```typescript
import { users } from './users'
import { bills } from './bills'
import { clients } from './clients'
import { projects } from './projects'
import { sessions } from './sessions'

export * from './users'
export * from './bills'
export * from './clients'
export * from './projects'
export * from './sessions'

export const schema = {
  users,
  bills,
  clients,
  projects,
  sessions,
}
```

### server/db/schema/users.ts

```typescript
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core'
import { createId } from '../utils/id'

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => `clx_${createId()}`),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
```

### server/db/schema/bills.ts

```typescript
import { pgTable, text, timestamp, decimal, integer, index } from 'drizzle-orm/pg-core'
import { createId } from '../utils/id'

export const bills = pgTable('bills', {
  id: text('id').primaryKey().$defaultFn(() => `blx_${createId()}`),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // income | expense
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  category: text('category').notNull(),
  categoryName: text('category_name').notNull(),
  description: text('description'),
  date: text('date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_bills_user_id').on(table.userId),
  dateIdx: index('idx_bills_date').on(table.date),
  userDateIdx: index('idx_bills_user_date').on(table.userId, table.date),
}))

import { users } from './users'
```

### server/db/schema/clients.ts

```typescript
import { pgTable, text, timestamp, index } from 'drizzle-orm/pg-core'
import { createId } from '../utils/id'
import { users } from './users'

export const clients = pgTable('clients', {
  id: text('id').primaryKey().$defaultFn(() => `clx_${createId()}`),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  company: text('company'),
  address: text('address'),
  remark: text('remark'),
  status: text('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_clients_user_id').on(table.userId),
  statusIdx: index('idx_clients_status').on(table.status),
}))
```

### server/db/schema/projects.ts

```typescript
import { pgTable, text, timestamp, decimal, integer, index } from 'drizzle-orm/pg-core'
import { createId } from '../utils/id'
import { users } from './users'
import { clients } from './clients'

export const projects = pgTable('projects', {
  id: text('id').primaryKey().$defaultFn(() => `pjx_${createId()}`),
  userId: text('user_id').notNull().references(() => users.id),
  clientId: text('client_id').references(() => clients.id),
  name: text('name').notNull(),
  description: text('description'),
  amount: decimal('amount', { precision: 12, scale: 2 }).default('0'),
  status: text('status').default('ongoing').notNull(),
  progress: integer('progress').default(0),
  startDate: text('start_date'),
  endDate: text('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_projects_user_id').on(table.userId),
  clientIdIdx: index('idx_projects_client_id').on(table.clientId),
  statusIdx: index('idx_projects_status').on(table.status),
}))
```

### server/db/utils/id.ts

```typescript
import { nanoid } from 'nanoid'

export const createId = () => nanoid(16)
```
