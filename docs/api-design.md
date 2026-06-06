# API 接口设计文档

本文档详细描述 Palgend 项目所有 API 接口的设计规范、请求响应格式和安全策略。

## 1. 接口设计规范

### 1.1 RESTful 风格

- 使用标准 HTTP 方法：`GET`（查询）、`POST`（创建）、`PUT`（更新）、`DELETE`（删除）
- 资源命名使用复数形式：`/api/bills`、`/api/clients`、`/api/projects`
- 嵌套资源使用路径参数：`/api/projects/{id}/invoices`

### 1.2 基础规范

| 项目 | 规范 |
|------|------|
| Base URL | `/api` |
| 认证方式 | Bearer Token (JWT) |
| Content-Type | `application/json` |
| 字符编码 | UTF-8 |
| 时间格式 | ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ) |

### 1.3 请求格式

```typescript
// 请求头
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json",
  "Accept": "application/json"
}

// 查询参数示例
GET /api/bills?type=expense&startDate=2024-01-01&endDate=2024-01-31&limit=20&offset=0

// 请求体示例 (POST/PUT)
{
  "amount": 1000.00,
  "category": "food",
  "description": "午餐",
  "date": "2024-01-15"
}
```

### 1.4 响应格式

```typescript
// 成功响应
{
  "code": 0,
  "message": "success",
  "data": { ... }
}

// 列表响应（分页）
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [...],
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}

// 错误响应
{
  "code": 40001,
  "message": "参数错误",
  "errors": [
    { "field": "amount", "message": "金额必须大于0" }
  ]
}
```

### 1.5 状态码规范

| HTTP 状态码 | 说明 | 业务 code |
|-------------|------|-----------|
| 200 | 成功 | 0 |
| 201 | 创建成功 | 0 |
| 400 | 请求参数错误 | 40001 |
| 401 | 未认证 / Token 无效 | 40101 |
| 403 | 无权限访问 | 40301 |
| 404 | 资源不存在 | 40401 |
| 409 | 资源冲突 | 40901 |
| 422 | 业务校验失败 | 42201 |
| 500 | 服务器内部错误 | 50001 |

---

## 2. 认证接口

### 2.1 用户注册

```
POST /api/auth/register
```

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码（8-32位） |
| name | string | 是 | 用户昵称 |

**请求示例：**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "张三"
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "user": {
      "id": "clx1234567890",
      "email": "user@example.com",
      "name": "张三",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2.2 用户登录

```
POST /api/auth/login
```

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码 |

**请求示例：**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "user": {
      "id": "clx1234567890",
      "email": "user@example.com",
      "name": "张三",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2.3 获取当前用户信息

```
GET /api/auth/me
```

**请求头：**

```
Authorization: Bearer <token>
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "张三",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 2.4 更新用户信息

```
PUT /api/auth/me
```

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 否 | 用户昵称 |
| password | string | 否 | 新密码（需包含旧密码） |
| oldPassword | string | 否 | 旧密码（修改密码时必填） |

**请求示例：**

```json
{
  "name": "李四",
  "password": "NewPass123",
  "oldPassword": "SecurePass123"
}
```

---

### 2.5 退出登录

```
POST /api/auth/logout
```

**请求头：**

```
Authorization: Bearer <token>
```

**响应示例：**

```json
{
  "code": 0,
  "message": "退出成功"
}
```

---

## 3. 记账模块接口

### 3.1 获取账单列表

```
GET /api/bills
```

**查询参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 否 | 账单类型：`income`（收入）/ `expense`（支出） |
| category | string | 否 | 分类标识 |
| startDate | string | 否 | 开始日期（YYYY-MM-DD） |
| endDate | string | 否 | 结束日期（YYYY-MM-DD） |
| limit | number | 否 | 每页数量，默认 20 |
| offset | number | 否 | 偏移量，默认 0 |

**请求示例：**

```
GET /api/bills?type=expense&startDate=2024-01-01&endDate=2024-01-31&limit=20&offset=0
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "blx1234567890",
        "type": "expense",
        "amount": 35.50,
        "category": "food",
        "categoryName": "餐饮",
        "description": "午餐",
        "date": "2024-01-15",
        "createdAt": "2024-01-15T12:00:00.000Z",
        "updatedAt": "2024-01-15T12:00:00.000Z"
      }
    ],
    "total": 50,
    "limit": 20,
    "offset": 0
  }
}
```

---

### 3.2 获取单条账单

```
GET /api/bills/:id
```

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 账单 ID |

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "blx1234567890",
    "type": "expense",
    "amount": 35.50,
    "category": "food",
    "categoryName": "餐饮",
    "description": "午餐",
    "date": "2024-01-15",
    "createdAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

---

### 3.3 创建账单

```
POST /api/bills
```

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 是 | 账单类型：`income` / `expense` |
| amount | number | 是 | 金额（大于 0） |
| category | string | 是 | 分类标识 |
| description | string | 否 | 备注描述 |
| date | string | 是 | 日期（YYYY-MM-DD） |

**请求示例：**

```json
{
  "type": "expense",
  "amount": 35.50,
  "category": "food",
  "description": "午餐",
  "date": "2024-01-15"
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "创建成功",
  "data": {
    "id": "blx1234567890",
    "type": "expense",
    "amount": 35.50,
    "category": "food",
    "categoryName": "餐饮",
    "description": "午餐",
    "date": "2024-01-15",
    "createdAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

---

### 3.4 更新账单

```
PUT /api/bills/:id
```

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 账单 ID |

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| type | string | 否 | 账单类型 |
| amount | number | 否 | 金额 |
| category | string | 否 | 分类 |
| description | string | 否 | 备注 |
| date | string | 否 | 日期 |

**请求示例：**

```json
{
  "amount": 40.00,
  "description": "午餐+咖啡"
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "id": "blx1234567890",
    "type": "expense",
    "amount": 40.00,
    "category": "food",
    "categoryName": "餐饮",
    "description": "午餐+咖啡",
    "date": "2024-01-15",
    "createdAt": "2024-01-15T12:00:00.000Z",
    "updatedAt": "2024-01-15T14:00:00.000Z"
  }
}
```

---

### 3.5 删除账单

```
DELETE /api/bills/:id
```

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 账单 ID |

**响应示例：**

```json
{
  "code": 0,
  "message": "删除成功"
}
```

---

### 3.6 获取账单统计

```
GET /api/bills/stats
```

**查询参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "totalIncome": 15000.00,
    "totalExpense": 8000.00,
    "balance": 7000.00,
    "expenseByCategory": [
      { "category": "food", "categoryName": "餐饮", "amount": 2000.00 },
      { "category": "transport", "categoryName": "交通", "amount": 500.00 }
    ],
    "incomeByCategory": [
      { "category": "salary", "categoryName": "工资", "amount": 15000.00 }
    ]
  }
}
```

---

### 3.7 获取账单分类列表

```
GET /api/bills/categories
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "income": [
      { "value": "salary", "label": "工资" },
      { "value": "bonus", "label": "奖金" },
      { "value": "investment", "label": "投资收益" }
    ],
    "expense": [
      { "value": "food", "label": "餐饮" },
      { "value": "transport", "label": "交通" },
      { "value": "shopping", "label": "购物" },
      { "value": "entertainment", "label": "娱乐" },
      { "value": "housing", "label": "居住" },
      { "value": "medical", "label": "医疗" }
    ]
  }
}
```

---

## 4. 客户管理模块接口

### 4.1 获取客户列表

```
GET /api/clients
```

**查询参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | string | 否 | 状态：`active`（活跃）/ `inactive`（不活跃） |
| search | string | 否 | 搜索关键词（姓名/电话/公司） |
| limit | number | 否 | 每页数量，默认 20 |
| offset | number | 否 | 偏移量，默认 0 |

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "clx9876543210",
        "name": "王五",
        "phone": "13800138000",
        "email": "wangwu@example.com",
        "company": "某某公司",
        "status": "active",
        "projectCount": 3,
        "createdAt": "2024-01-10T09:00:00.000Z",
        "updatedAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "total": 25,
    "limit": 20,
    "offset": 0
  }
}
```

---

### 4.2 获取单条客户

```
GET /api/clients/:id
```

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 客户 ID |

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "clx9876543210",
    "name": "王五",
    "phone": "13800138000",
    "email": "wangwu@example.com",
    "company": "某某公司",
    "address": "北京市朝阳区",
    "remark": "重要客户",
    "status": "active",
    "projects": [...],
    "createdAt": "2024-01-10T09:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### 4.3 创建客户

```
POST /api/clients
```

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 客户姓名 |
| phone | string | 否 | 联系电话 |
| email | string | 否 | 邮箱 |
| company | string | 否 | 公司名称 |
| address | string | 否 | 地址 |
| remark | string | 否 | 备注 |

**请求示例：**

```json
{
  "name": "王五",
  "phone": "13800138000",
  "email": "wangwu@example.com",
  "company": "某某公司",
  "address": "北京市朝阳区",
  "remark": "重要客户"
}
```

---

### 4.4 更新客户

```
PUT /api/clients/:id
```

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 否 | 客户姓名 |
| phone | string | 否 | 联系电话 |
| email | string | 否 | 邮箱 |
| company | string | 否 | 公司名称 |
| address | string | 否 | 地址 |
| remark | string | 否 | 备注 |
| status | string | 否 | 状态 |

**请求示例：**

```json
{
  "status": "inactive",
  "remark": "已终止合作"
}
```

---

### 4.5 删除客户

```
DELETE /api/clients/:id
```

**响应示例：**

```json
{
  "code": 0,
  "message": "删除成功"
}
```

---

## 5. 项目台账模块接口

### 5.1 获取项目列表

```
GET /api/projects
```

**查询参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| status | string | 否 | 状态：`ongoing`（进行中）/ `completed`（已完成）/ `cancelled`（已取消） |
| clientId | string | 否 | 关联客户 ID |
| limit | number | 否 | 每页数量，默认 20 |
| offset | number | 否 | 偏移量，默认 0 |

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "pjx1234567890",
        "name": "网站开发项目",
        "client": {
          "id": "clx9876543210",
          "name": "王五"
        },
        "amount": 50000.00,
        "status": "ongoing",
        "startDate": "2024-01-01",
        "endDate": "2024-03-31",
        "progress": 45,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-15T00:00:00.000Z"
      }
    ],
    "total": 10,
    "limit": 20,
    "offset": 0
  }
}
```

---

### 5.2 获取单条项目

```
GET /api/projects/:id
```

**路径参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| id | string | 是 | 项目 ID |

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "pjx1234567890",
    "name": "网站开发项目",
    "description": "企业官网开发",
    "client": {
      "id": "clx9876543210",
      "name": "王五",
      "phone": "13800138000"
    },
    "amount": 50000.00,
    "status": "ongoing",
    "startDate": "2024-01-01",
    "endDate": "2024-03-31",
    "progress": 45,
    "milestones": [
      { "id": "1", "title": "需求分析", "completed": true },
      { "id": "2", "title": "UI设计", "completed": true },
      { "id": "3", "title": "前端开发", "completed": false }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
}
```

---

### 5.3 创建项目

```
POST /api/projects
```

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 是 | 项目名称 |
| description | string | 否 | 项目描述 |
| clientId | string | 否 | 关联客户 ID |
| amount | number | 否 | 项目金额 |
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |

**请求示例：**

```json
{
  "name": "网站开发项目",
  "description": "企业官网开发",
  "clientId": "clx9876543210",
  "amount": 50000.00,
  "startDate": "2024-01-01",
  "endDate": "2024-03-31"
}
```

---

### 5.4 更新项目

```
PUT /api/projects/:id
```

**请求参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| name | string | 否 | 项目名称 |
| description | string | 否 | 项目描述 |
| clientId | string | 否 | 关联客户 ID |
| amount | number | 否 | 项目金额 |
| status | string | 否 | 项目状态 |
| progress | number | 否 | 项目进度（0-100） |
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |

**请求示例：**

```json
{
  "status": "completed",
  "progress": 100,
  "endDate": "2024-03-15"
}
```

---

### 5.5 删除项目

```
DELETE /api/projects/:id
```

---

### 5.6 获取项目统计

```
GET /api/projects/stats
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 15,
    "ongoing": 5,
    "completed": 8,
    "cancelled": 2,
    "totalAmount": 500000.00,
    "completedAmount": 350000.00,
    "pendingAmount": 150000.00
  }
}
```

---

## 6. 数据导出接口

### 6.1 导出账单

```
GET /api/bills/export
```

**查询参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| format | string | 否 | 导出格式：`csv` / `xlsx`，默认 `csv` |
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |

**响应：**

返回文件流，Content-Type 为 `application/octet-stream`

---

### 6.2 导出客户

```
GET /api/clients/export
```

**查询参数：**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| format | string | 否 | 导出格式：`csv` / `xlsx`，默认 `csv` |

**响应：**

返回文件流，Content-Type 为 `application/octet-stream`

---

### 6.3 导出项目

```
GET /api/projects/export
```

**响应：**

返回文件流，Content-Type 为 `application/octet-stream`

---

### 6.4 全量数据导出

```
GET /api/data/export
```

**响应示例：**

```json
{
  "code": 0,
  "message": "导出成功",
  "data": {
    "exportId": "exp1234567890",
    "downloadUrl": "/api/data/export/download?token=xxx",
    "expiresAt": "2024-01-15T13:00:00.000Z"
  }
}
```

---

## 7. 系统接口

### 7.1 健康检查

```
GET /api/health
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:00:00.000Z",
    "version": "1.0.0"
  }
}
```

---

## 8. 错误码对照表

| 错误码 | 业务含义 | HTTP 状态码 |
|--------|----------|-------------|
| 0 | 成功 | 200 |
| 40001 | 请求参数错误 | 400 |
| 40002 | 参数格式错误 | 400 |
| 40101 | 未登录 | 401 |
| 40102 | Token 无效 | 401 |
| 40103 | Token 已过期 | 401 |
| 40301 | 无权限访问 | 403 |
| 40401 | 资源不存在 | 404 |
| 40402 | 客户不存在 | 404 |
| 40403 | 项目不存在 | 404 |
| 40901 | 资源冲突 | 409 |
| 42201 | 业务校验失败 | 422 |
| 50001 | 服务器内部错误 | 500 |

---

## 附录：接口开发清单

```typescript
// server/api/bills/index.get.ts      - 获取账单列表
// server/api/bills/index.post.ts     - 创建账单
// server/api/bills/[id].get.ts       - 获取单条账单
// server/api/bills/[id].put.ts       - 更新账单
// server/api/bills/[id].delete.ts    - 删除账单
// server/api/bills/stats.get.ts      - 获取账单统计
// server/api/bills/export.get.ts     - 导出账单

// server/api/clients/index.get.ts    - 获取客户列表
// server/api/clients/index.post.ts   - 创建客户
// server/api/clients/[id].get.ts     - 获取单条客户
// server/api/clients/[id].put.ts     - 更新客户
// server/api/clients/[id].delete.ts  - 删除客户

// server/api/projects/index.get.ts    - 获取项目列表
// server/api/projects/index.post.ts   - 创建项目
// server/api/projects/[id].get.ts    - 获取单条项目
// server/api/projects/[id].put.ts    - 更新项目
// server/api/projects/[id].delete.ts - 删除项目
// server/api/projects/stats.get.ts    - 获取项目统计
```
