# Palgend 项目实施计划

## 项目概述

Palgend（帕兰德）是一个基于 Nuxt4 + Nitro2 的个人极简数字工作台，包含记账、客户管理、项目台账三大核心模块。

**技术栈**：
- 全栈框架：Nuxt4 + Vue3 + Nitro2
- 移动端UI：Vant 4
- 样式：Tailwind CSS
- 状态管理：Pinia
- 数据库：Drizzle ORM + Neon PostgreSQL
- 认证：JWT Token
- 部署：Vercel 边缘函数

---

## 阶段一：初始化项目结构 ✅ 已完成

### 1.1 创建 Nuxt4 项目 ✅ 已完成

**目标**：搭建符合 Nuxt4 规范的项目骨架

**已完成**：
- ✅ 初始化 Nuxt4 项目
- ✅ 安装所有核心依赖
- ✅ 配置 Nuxt 模块

3. **配置 Nuxt**
   - 创建 `nuxt.config.ts` 配置文件
   - 配置 Tailwind CSS
   - 配置 Pinia 状态管理
   - 配置 Vant 自动导入
   - 配置环境变量

### 1.2 创建目录结构 ✅ 已完成

**目标**：按照 Nuxt4 规范创建完整的项目目录

**目录结构**：
```
palgend/
├── app/                        # 客户端主目录
│   ├── assets/                 # 全局样式、图标
│   │   └── css/
│   │       └── main.css
│   ├── components/             # UI组件
│   │   ├── common/             # 公共组件
│   │   ├── bill/               # 记账组件
│   │   ├── client/             # 客户组件
│   │   └── project/            # 项目组件
│   ├── composables/            # 组合式函数
│   │   ├── useAuth.ts
│   │   ├── useBill.ts
│   │   ├── useClient.ts
│   │   └── useProject.ts
│   ├── layouts/                # 布局组件
│   │   └── default.vue
│   ├── middleware/             # 路由守卫
│   │   └── auth.ts
│   ├── pages/                  # 页面路由
│   │   ├── index.vue           # 首页
│   │   ├── login.vue           # 登录页
│   │   ├── bills/              # 记账模块
│   │   ├── clients/            # 客户管理
│   │   └── projects/           # 项目台账
│   ├── plugins/                # 客户端插件
│   │   ├── vant.ts
│   │   └── pinia-persist.ts
│   ├── stores/                 # Pinia 状态管理
│   │   ├── user.ts
│   │   ├── bill.ts
│   │   ├── client.ts
│   │   └── project.ts
│   ├── utils/                  # 客户端工具函数
│   │   ├── format.ts
│   │   └── export.ts
│   ├── app.vue                 # 根组件
│   └── error.vue               # 错误页面
│
├── server/                     # 服务端目录
│   ├── api/                    # API 接口
│   │   ├── auth/               # 认证接口
│   │   ├── bills/              # 记账接口
│   │   ├── clients/            # 客户接口
│   │   └── projects/           # 项目接口
│   ├── middleware/             # 服务端中间件
│   │   ├── 01.auth.ts
│   │   ├── 02.cors.ts
│   │   └── 03.security.ts
│   ├── db/                     # 数据库
│   │   ├── schema/             # Schema 定义
│   │   │   ├── users.ts
│   │   │   ├── bills.ts
│   │   │   ├── clients.ts
│   │   │   ├── projects.ts
│   │   │   ├── sessions.ts
│   │   │   └── index.ts
│   │   ├── utils/              # 数据库工具
│   │   │   └── id.ts
│   │   └── index.ts            # 数据库连接
│   └── utils/                  # 服务端工具
│       ├── jwt.ts
│       └── password.ts
│
├── shared/                     # 前后端共享
│   ├── types/                  # 类型定义
│   │   ├── auth.ts
│   │   ├── bill.ts
│   │   ├── client.ts
│   │   ├── project.ts
│   │   └── index.ts
│   ├── constants/              # 常量定义
│   │   ├── bill-categories.ts
│   │   └── project-status.ts
│   └── validations/            # 验证规则
│       ├── auth.validation.ts
│       ├── bill.validation.ts
│       ├── client.validation.ts
│       └── project.validation.ts
│
├── public/                     # 静态资源
├── drizzle/                    # 数据库迁移文件
├── .env.example                # 环境变量示例
├── drizzle.config.ts           # Drizzle 配置
└── nuxt.config.ts              # Nuxt 配置
```

### 1.3 配置文件创建 ✅ 已完成

**已完成配置文件**：

1. ✅ **nuxt.config.ts** - Nuxt 主配置
2. ✅ **tailwind.config.js** - Tailwind 配置
3. ✅ **drizzle.config.ts** - Drizzle 配置
4. ✅ **.env.example** - 环境变量模板
5. ✅ **tsconfig.json** - TypeScript 配置（自动生成）

---

## 阶段二：数据库迁移

### 2.1 配置 Drizzle ORM

**目标**：配置数据库连接和 Schema 定义

**步骤**：

1. **创建数据库连接** (`server/db/index.ts`)
   - 配置 Neon HTTP 连接
   - 创建 Drizzle 实例
   - 导出数据库操作对象

2. **定义数据表 Schema** (`server/db/schema/`)
   - `users.ts` - 用户表
   - `bills.ts` - 账单表
   - `clients.ts` - 客户表
   - `projects.ts` - 项目表
   - `sessions.ts` - 会话表
   - `index.ts` - Schema 聚合导出

3. **创建 ID 生成工具** (`server/db/utils/id.ts`)
   - 使用 nanoid 生成唯一 ID
   - 定义 ID 前缀规则（clx_, blx_, pjx_）

### 2.2 执行数据库迁移

**目标**：将 Schema 同步到数据库

**步骤**：

1. **配置 Drizzle Kit** (`drizzle.config.ts`)
   ```typescript
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

2. **添加迁移脚本** (`package.json`)
   ```json
   {
     "scripts": {
       "db:generate": "drizzle-kit generate",
       "db:migrate": "drizzle-kit migrate",
       "db:push": "drizzle-kit push",
       "db:studio": "drizzle-kit studio"
     }
   }
   ```

3. **执行迁移**
   ```bash
   # 生成迁移文件
   pnpm db:generate

   # 推送到数据库（开发环境）
   pnpm db:push
   ```

### 2.3 配置 RLS 行级安全

**目标**：为生产环境配置数据隔离策略

**步骤**：

1. 创建 RLS 策略 SQL 脚本
2. 在认证中间件中设置用户上下文
3. 测试数据隔离效果

---

## 阶段三：实现 API 接口

### 3.1 认证模块 API

**目标**：实现完整的用户认证系统

**接口清单**：

1. **POST /api/auth/register** - 用户注册
   - 邮箱验证
   - 密码加密
   - 用户创建
   - Token 生成

2. **POST /api/auth/login** - 用户登录
   - 密码验证
   - Token 生成
   - 会话创建

3. **GET /api/auth/me** - 获取当前用户
   - Token 验证
   - 返回用户信息

4. **PUT /api/auth/me** - 更新用户信息
   - 修改昵称
   - 修改密码（需验证旧密码）

5. **POST /api/auth/logout** - 退出登录
   - 删除会话
   - 清除 Token

6. **POST /api/auth/refresh** - 刷新 Token
   - 验证 Refresh Token
   - 生成新的 Access Token

**实现步骤**：

1. 创建 JWT 工具函数 (`server/utils/jwt.ts`)
   - `generateAccessToken()` - 生成访问令牌
   - `generateRefreshToken()` - 生成刷新令牌
   - `verifyToken()` - 验证令牌

2. 创建密码工具函数 (`server/utils/password.ts`)
   - `hashPassword()` - 密码加密
   - `verifyPassword()` - 密码验证

3. 创建认证中间件 (`server/middleware/01.auth.ts`)
   - Token 提取和验证
   - 用户信息注入
   - 公开路径白名单

4. 实现各认证接口

### 3.2 记账模块 API

**目标**：实现记账模块的完整 CRUD 接口

**接口清单**：

1. **GET /api/bills** - 获取账单列表
   - 支持分页
   - 支持筛选（类型、分类、日期范围）
   - 返回统计信息

2. **GET /api/bills/:id** - 获取单条账单

3. **POST /api/bills** - 创建账单
   - 数据验证
   - 分类名称填充

4. **PUT /api/bills/:id** - 更新账单

5. **DELETE /api/bills/:id** - 删除账单

6. **GET /api/bills/stats** - 获取账单统计
   - 收入支出统计
   - 分类统计

7. **GET /api/bills/categories** - 获取分类列表

**实现步骤**：

1. 创建账单验证规则 (`shared/validations/bill.validation.ts`)
2. 创建账单接口文件：
   - `server/api/bills/index.get.ts`
   - `server/api/bills/index.post.ts`
   - `server/api/bills/[id].get.ts`
   - `server/api/bills/[id].put.ts`
   - `server/api/bills/[id].delete.ts`
   - `server/api/bills/stats.get.ts`
   - `server/api/bills/categories.get.ts`

### 3.3 客户管理模块 API

**目标**：实现客户管理的完整 CRUD 接口

**接口清单**：

1. **GET /api/clients** - 获取客户列表
   - 支持分页
   - 支持搜索（姓名、电话、公司）
   - 支持状态筛选

2. **GET /api/clients/:id** - 获取单条客户
   - 包含关联项目信息

3. **POST /api/clients** - 创建客户

4. **PUT /api/clients/:id** - 更新客户

5. **DELETE /api/clients/:id** - 删除客户
   - 检查关联项目

**实现步骤**：

1. 创建客户验证规则 (`shared/validations/client.validation.ts`)
2. 创建客户接口文件：
   - `server/api/clients/index.get.ts`
   - `server/api/clients/index.post.ts`
   - `server/api/clients/[id].get.ts`
   - `server/api/clients/[id].put.ts`
   - `server/api/clients/[id].delete.ts`

### 3.4 项目台账模块 API

**目标**：实现项目台账的完整 CRUD 接口

**接口清单**：

1. **GET /api/projects** - 获取项目列表
   - 支持分页
   - 支持状态筛选
   - 支持客户筛选

2. **GET /api/projects/:id** - 获取单条项目
   - 包含客户信息

3. **POST /api/projects** - 创建项目

4. **PUT /api/projects/:id** - 更新项目
   - 更新进度
   - 更新状态

5. **DELETE /api/projects/:id** - 删除项目

6. **GET /api/projects/stats** - 获取项目统计

**实现步骤**：

1. 创建项目验证规则 (`shared/validations/project.validation.ts`)
2. 创建项目接口文件：
   - `server/api/projects/index.get.ts`
   - `server/api/projects/index.post.ts`
   - `server/api/projects/[id].get.ts`
   - `server/api/projects/[id].put.ts`
   - `server/api/projects/[id].delete.ts`
   - `server/api/projects/stats.get.ts`

### 3.5 系统接口

**目标**：实现系统级接口

**接口清单**：

1. **GET /api/health** - 健康检查
2. **GET /api/data/export** - 全量数据导出

---

## 阶段四：实现认证系统

### 4.1 服务端认证实现

**目标**：完成服务端认证逻辑

**实现内容**：

1. **JWT Token 管理**
   - Access Token（7天有效期）
   - Refresh Token（30天有效期）
   - Token 刷新机制

2. **密码安全**
   - bcrypt 加密（SALT_ROUNDS = 12）
   - 密码强度验证

3. **会话管理**
   - 会话表存储
   - Token 黑名单
   - 多设备登录管理

4. **安全策略**
   - 登录失败限制（5次/5分钟）
   - Token 自动续期
   - 安全响应头

### 4.2 客户端认证实现

**目标**：完成客户端认证逻辑

**实现内容**：

1. **Pinia Store** (`app/stores/user.ts`)
   - 用户状态管理
   - Token 存储
   - 登录状态

2. **Composable** (`app/composables/useAuth.ts`)
   - 登录方法
   - 注册方法
   - 登出方法
   - 认证检查

3. **路由守卫** (`app/middleware/auth.ts`)
   - 未登录跳转
   - Token 验证

4. **Token 自动刷新** (`app/plugins/auth.client.ts`)
   - 定时刷新
   - 失效处理

---

## 阶段五：前端页面开发

### 5.1 基础布局和组件

**目标**：搭建前端基础框架

**实现内容**：

1. **全局布局** (`app/layouts/default.vue`)
   - 顶部导航栏
   - 底部标签栏
   - 主内容区域

2. **公共组件** (`app/components/common/`)
   - `NavBar.vue` - 导航栏
   - `TabBar.vue` - 标签栏
   - `Loading.vue` - 加载状态
   - `Empty.vue` - 空状态
   - `Toast.vue` - 提示消息

3. **全局样式** (`app/assets/css/main.css`)
   - Tailwind 基础样式
   - 主题变量
   - 暗黑模式支持

### 5.2 登录注册页面

**目标**：实现用户认证界面

**页面清单**：

1. **登录页面** (`app/pages/login.vue`)
   - 邮箱输入
   - 密码输入
   - 登录按钮
   - 注册链接

2. **注册页面** (`app/pages/register.vue`)
   - 邮箱输入
   - 密码输入
   - 昵称输入
   - 注册按钮

### 5.3 记账模块页面

**目标**：实现记账模块完整界面

**页面清单**：

1. **账单列表页** (`app/pages/bills/index.vue`)
   - 月份选择器
   - 收支统计卡片
   - 账单列表
   - 筛选功能

2. **添加账单页** (`app/pages/bills/add.vue`)
   - 收支类型切换
   - 金额输入
   - 分类选择
   - 日期选择
   - 备注输入

3. **账单详情页** (`app/pages/bills/[id].vue`)
   - 账单信息展示
   - 编辑功能
   - 删除功能

4. **账单统计页** (`app/pages/bills/stats.vue`)
   - 收支趋势图
   - 分类占比图
   - 月度对比

**组件清单**：

1. **BillCard.vue** - 账单卡片
2. **BillForm.vue** - 账单表单
3. **CategoryPicker.vue** - 分类选择器
4. **MonthPicker.vue** - 月份选择器
5. **StatsChart.vue** - 统计图表

### 5.4 客户管理页面

**目标**：实现客户管理完整界面

**页面清单**：

1. **客户列表页** (`app/pages/clients/index.vue`)
   - 搜索栏
   - 客户列表
   - 状态筛选

2. **添加客户页** (`app/pages/clients/add.vue`)
   - 基本信息表单
   - 联系方式输入

3. **客户详情页** (`app/pages/clients/[id].vue`)
   - 客户信息展示
   - 关联项目列表
   - 操作按钮

**组件清单**：

1. **ClientCard.vue** - 客户卡片
2. **ClientForm.vue** - 客户表单
3. **ClientSearch.vue** - 客户搜索

### 5.5 项目台账页面

**目标**：实现项目台账完整界面

**页面清单**：

1. **项目列表页** (`app/pages/projects/index.vue`)
   - 状态标签页
   - 项目列表
   - 搜索筛选

2. **添加项目页** (`app/pages/projects/add.vue`)
   - 项目信息表单
   - 客户关联
   - 日期选择

3. **项目详情页** (`app/pages/projects/[id].vue`)
   - 项目信息展示
   - 进度条
   - 操作记录

**组件清单**：

1. **ProjectCard.vue** - 项目卡片
2. **ProjectForm.vue** - 项目表单
3. **ProgressBar.vue** - 进度条
4. **StatusTag.vue** - 状态标签

### 5.6 个人中心页面

**目标**：实现用户设置界面

**页面清单**：

1. **个人中心页** (`app/pages/me/index.vue`)
   - 用户信息展示
   - 功能菜单
   - 退出登录

2. **个人信息页** (`app/pages/me/profile.vue`)
   - 修改昵称
   - 修改密码

3. **设置页** (`app/pages/me/settings.vue`)
   - 主题切换
   - 数据导出
   - 关于我们

---

## 验证与测试

### 单元测试

- 测试工具函数
- 测试验证规则
- 测试 API 接口

### 集成测试

- 测试认证流程
- 测试 CRUD 操作
- 测试数据隔离

### E2E 测试

- 测试用户注册登录
- 测试记账流程
- 测试客户管理流程
- 测试项目管理流程

---

## 部署准备

### 环境变量配置

```bash
# .env.example
DATABASE_URL=postgresql://user:password@host/database
JWT_SECRET=your-secret-key-at-least-32-characters
CORS_ORIGIN=https://your-domain.com
```

### Vercel 配置

1. 创建 `vercel.json` 配置文件
2. 配置边缘函数
3. 配置环境变量

### 数据库配置

1. 创建 Neon 数据库
2. 配置连接字符串
3. 执行数据库迁移

---

## 开发规范

### 代码规范

- 使用 TypeScript 严格模式
- 使用 ESLint + Prettier 格式化
- 遵循 Vue 3 Composition API 最佳实践

### Git 提交规范

- feat: 新功能
- fix: 修复 Bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 重构
- test: 测试
- chore: 构建/工具链

### 分支管理

- main: 主分支（生产环境）
- develop: 开发分支
- feature/*: 功能分支
- hotfix/*: 紧急修复分支

---

## 时间规划

| 阶段 | 任务 | 预计工作量 |
|------|------|-----------|
| 阶段一 | 初始化项目结构 | 1-2天 |
| 阶段二 | 数据库迁移 | 1天 |
| 阶段三 | 实现 API 接口 | 3-4天 |
| 阶段四 | 实现认证系统 | 2天 |
| 阶段五 | 前端页面开发 | 4-5天 |
| 测试与部署 | 测试与部署 | 2天 |

**总计**：约 13-16 天

---

## 风险与注意事项

### 技术风险

1. **Nuxt4 稳定性**：Nuxt4 为最新版本，可能存在未知问题
   - 解决方案：关注官方更新，及时修复

2. **边缘函数限制**：Vercel 边缘函数有运行时限制
   - 解决方案：优化代码，避免长时间运行的操作

3. **数据库连接**：Neon HTTP 连接可能有延迟
   - 解决方案：使用连接池，优化查询

### 业务风险

1. **数据安全**：个人财务数据敏感
   - 解决方案：加密存储，RLS 隔离

2. **离线同步**：PWA 离线功能复杂
   - 解决方案：简化离线功能，优先保证在线体验

### 开发风险

1. **时间估算**：实际开发可能超出预期
   - 解决方案：优先核心功能，迭代开发

2. **技术学习**：新技术栈需要学习成本
   - 解决方案：边学边做，记录问题

---

## 后续优化方向

### 功能优化

- 数据可视化增强
- 智能分类推荐
- 预算管理功能
- 多账本支持

### 性能优化

- 接口响应缓存
- 图片懒加载
- 代码分割优化
- PWA 缓存策略

### 体验优化

- 骨架屏加载
- 手势操作
- 快捷记账
- 语音输入

---

## 总结

本计划按照"先基础后业务、先后端后前端"的原则，分五个阶段逐步实施。每个阶段都有明确的目标和可交付成果，确保项目有序推进。在实施过程中，应遵循"极简克制"的原则，优先保证核心功能稳定可用，再逐步迭代优化。
