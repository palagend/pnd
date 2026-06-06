# 认证授权方案设计

本文档详细描述 Palgend 项目的用户认证和授权方案，包括 JWT Token 机制、密码加密、权限管理等。

## 1. 认证方案概述

### 1.1 技术选型

| 项目 | 选型 | 说明 |
|------|------|------|
| 认证方式 | JWT | 无状态认证，适合边缘部署 |
| 密码加密 | bcrypt | 慢哈希，防暴力破解 |
| Token 存储 | HTTP Only Cookie / LocalStorage | 双存储策略 |
| Token 时效 | Access Token (1天) + Refresh Token (7天) | 安全与便捷平衡 |
| 刷新机制 | Silent Refresh | 自动续期 |

### 1.2 认证流程图

```mermaid
flowchart TD
    A[用户登录] --> B[验证密码]
    B --> C[生成Token]
    C --> D[存储RefreshToken]
    D --> E[返回Token]
    E --> F[客户端存储]
```

---

## 2. Token 设计

### 2.1 Access Token

短期令牌，用于 API 访问验证。

```typescript
// Token Payload 结构
interface AccessTokenPayload {
  sub: string        // 用户ID
  email: string      // 用户邮箱
  name: string        // 用户名称
  type: 'access'      // Token 类型
  iat: number         // 签发时间
  exp: number         // 过期时间
}

// Token 示例
{
  "sub": "clx1234567890",
  "email": "user@example.com",
  "name": "张三",
  "type": "access",
  "iat": 1705312800,
  "exp": 1705917600
}
```

### 2.2 Refresh Token

长期令牌，用于获取新的 Access Token。

```typescript
// Refresh Token Payload 结构
interface RefreshTokenPayload {
  sub: string        // 用户ID
  type: 'refresh'     // Token 类型
  jti: string         // Token 唯一ID（用于撤销）
  iat: number         // 签发时间
  exp: number         // 过期时间
}
```

---

## 3. 服务端实现

### 3.1 JWT 工具函数

```typescript
// server/utils/jwt.ts
import { SignJWT, jwtVerify } from 'jose'
import type { AccessTokenPayload, RefreshTokenPayload } from '~/shared/types'

// 获取密钥
const getSecretKey = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set')
  }
  return new TextEncoder().encode(secret)
}

// 生成 Access Token
export const generateAccessToken = async (payload: Omit<AccessTokenPayload, 'iat' | 'exp'>) => {
  const secret = getSecretKey()
  const expiresIn = '7d' // 7天

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret)
}

// 生成 Refresh Token
export const generateRefreshToken = async (payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>) => {
  const secret = getSecretKey()
  const expiresIn = '30d' // 30天

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret)
}

// 验证 Token
export const verifyToken = async <T>(token: string): Promise<T | null> => {
  try {
    const secret = getSecretKey()
    const { payload } = await jwtVerify(token, secret)
    return payload as T
  } catch (error) {
    return null
  }
}
```

### 3.2 密码工具函数

```typescript
// server/utils/password.ts
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 12

// 加密密码
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

// 验证密码
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash)
}
```

### 3.3 认证中间件

```typescript
// server/middleware/01.auth.ts
export default defineEventHandler(async (event) => {
  // 公开路径（无需认证）
  const publicPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/health',
  ]

  const path = getRequestURL(event).pathname

  // 公开路径直接通过
  if (publicPaths.some(p => path.startsWith(p))) {
    return
  }

  // API 路径需要认证
  if (!path.startsWith('/api')) {
    return
  }

  // 获取 Token
  const authHeader = getHeader(event, 'Authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: '未登录，请先登录',
    })
  }

  // 验证 Token
  const payload = await verifyToken<AccessTokenPayload>(token)

  if (!payload) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Token 无效或已过期',
    })
  }

  // 验证 Token 类型
  if (payload.type !== 'access') {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Token 类型错误',
    })
  }

  // 将用户信息挂载到 event.context
  event.context.user = {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
  }
})
```

### 3.4 登录接口

```typescript
// server/api/auth/login.post.ts
import { z } from 'zod'
import { verifyPassword } from '~/server/utils/password'
import { generateAccessToken, generateRefreshToken } from '~/server/utils/jwt'
import { db } from '~/server/db'
import { users, sessions } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

const loginSchema = z.object({
  email: z.string().email('请输入正确的邮箱格式'),
  password: z.string().min(8, '密码至少8位'),
})

export default defineEventHandler(async (event) => {
  // 解析请求体
  const body = await readBody(event)
  const validation = loginSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.errors[0].message,
    })
  }

  const { email, password } = validation.data

  // 查询用户
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      message: '邮箱或密码错误',
    })
  }

  // 验证密码
  const isValid = await verifyPassword(password, user.password)

  if (!isValid) {
    throw createError({
      statusCode: 401,
      message: '邮箱或密码错误',
    })
  }

  // 生成 Token
  const tokenPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    type: 'access' as const,
  }

  const accessToken = await generateAccessToken(tokenPayload)
  const refreshToken = await generateRefreshToken({
    sub: user.id,
    type: 'refresh',
    jti: crypto.randomUUID(),
  })

  // 存储 Refresh Token
  await db.insert(sessions).values({
    id: crypto.randomUUID(),
    userId: user.id,
    token: await hash(refreshToken), // 存储哈希
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后过期
  })

  // 返回用户信息和 Token
  return {
    code: 0,
    message: '登录成功',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token: accessToken,
      refreshToken,
      expiresIn: 604800, // 7天
    },
  }
})
```

### 3.5 注册接口

```typescript
// server/api/auth/register.post.ts
import { z } from 'zod'
import { hashPassword } from '~/server/utils/password'
import { generateAccessToken, generateRefreshToken } from '~/server/utils/jwt'
import { db } from '~/server/db'
import { users, sessions } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

const registerSchema = z.object({
  email: z.string().email('请输入正确的邮箱格式'),
  password: z.string().min(8, '密码至少8位').max(32, '密码最多32位'),
  name: z.string().min(1, '请输入昵称').max(50, '昵称最多50字'),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validation = registerSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: validation.error.errors[0].message,
    })
  }

  const { email, password, name } = validation.data

  // 检查邮箱是否已存在
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      message: '该邮箱已被注册',
    })
  }

  // 加密密码
  const hashedPassword = await hashPassword(password)

  // 创建用户
  const [user] = await db.insert(users).values({
    email,
    password: hashedPassword,
    name,
  }).returning()

  // 生成 Token
  const tokenPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    type: 'access' as const,
  }

  const accessToken = await generateAccessToken(tokenPayload)
  const refreshToken = await generateRefreshToken({
    sub: user.id,
    type: 'refresh',
    jti: crypto.randomUUID(),
  })

  // 存储 Refresh Token
  await db.insert(sessions).values({
    id: crypto.randomUUID(),
    userId: user.id,
    token: await hash(refreshToken),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  })

  return {
    code: 0,
    message: '注册成功',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token: accessToken,
      refreshToken,
      expiresIn: 604800,
    },
  }
})
```

### 3.6 Token 刷新接口

```typescript
// server/api/auth/refresh.post.ts
import { z } from 'zod'
import { verifyToken, generateAccessToken, generateRefreshToken } from '~/server/utils/jwt'
import { db } from '~/server/db'
import { users, sessions } from '~/server/db/schema'
import { eq, and, gt } from 'drizzle-orm'

const refreshSchema = z.object({
  refreshToken: z.string(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validation = refreshSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: '缺少 refreshToken',
    })
  }

  const { refreshToken } = validation.data

  // 验证 Refresh Token
  const payload = await verifyToken<RefreshTokenPayload>(refreshToken)

  if (!payload || payload.type !== 'refresh') {
    throw createError({
      statusCode: 401,
      message: 'Refresh Token 无效',
    })
  }

  // 验证 Refresh Token 是否在数据库中
  const session = await db.query.sessions.findFirst({
    where: and(
      eq(sessions.userId, payload.sub),
      gt(sessions.expiresAt, new Date())
    ),
  })

  if (!session) {
    throw createError({
      statusCode: 401,
      message: 'Refresh Token 已失效，请重新登录',
    })
  }

  // 获取用户信息
  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.sub),
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      message: '用户不存在',
    })
  }

  // 生成新的 Access Token
  const newAccessToken = await generateAccessToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    type: 'access',
  })

  return {
    code: 0,
    message: '刷新成功',
    data: {
      token: newAccessToken,
      expiresIn: 604800,
    },
  }
})
```

### 3.7 登出接口

```typescript
// server/api/auth/logout.post.ts
import { db } from '~/server/db'
import { sessions } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = event.context.user?.id

  if (userId) {
    // 删除用户的所有会话
    await db.delete(sessions).where(eq(sessions.userId, userId))
  }

  return {
    code: 0,
    message: '退出成功',
  }
})
```

---

## 4. 客户端实现

### 4.1 认证 Composable

```typescript
// app/composables/useAuth.ts
export const useAuth = () => {
  const userStore = useUserStore()
  const router = useRouter()

  // 登录
  const login = async (email: string, password: string) => {
    try {
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })

      if (response.code === 0) {
        // 存储 Token
        userStore.setToken(response.data.token)
        userStore.setUser(response.data.user)

        // 设置全局 Authorization
        useRequest headers().Authorization = `Bearer ${response.data.token}`

        // 跳转到首页
        router.push('/')
        return true
      }

      return false
    } catch (error: any) {
      console.error('登录失败:', error)
      throw error
    }
  }

  // 注册
  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await $fetch('/api/auth/register', {
        method: 'POST',
        body: { email, password, name },
      })

      if (response.code === 0) {
        // 存储 Token
        userStore.setToken(response.data.token)
        userStore.setUser(response.data.user)

        router.push('/')
        return true
      }

      return false
    } catch (error: any) {
      console.error('注册失败:', error)
      throw error
    }
  }

  // 登出
  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      // 清除本地状态
      userStore.clearAuth()
      router.push('/login')
    }
  }

  // 检查登录状态
  const checkAuth = async () => {
    const token = userStore.token

    if (!token) {
      return false
    }

    try {
      const response = await $fetch('/api/auth/me')
      if (response.code === 0) {
        userStore.setUser(response.data)
        return true
      }
      return false
    } catch (error) {
      // Token 失效，清除登录状态
      userStore.clearAuth()
      return false
    }
  }

  return {
    user: computed(() => userStore.userInfo),
    isAuthenticated: computed(() => userStore.isAuthenticated),
    login,
    register,
    logout,
    checkAuth,
  }
}
```

### 4.2 Token 自动刷新

```typescript
// app/plugins/auth.client.ts
export default defineNuxtPlugin(() => {
  const userStore = useUserStore()

  // 添加请求拦截器
  const { $fetch } = useNuxtApp()

  // 监听 Token 变化，自动刷新
  watch(() => userStore.token, async (newToken, oldToken) => {
    if (newToken && !oldToken) {
      // 新登录，设置刷新定时器
      scheduleTokenRefresh()
    }
  })

  // 定时刷新 Token
  const scheduleTokenRefresh = () => {
    // 6小时后刷新（Token 7天有效期，提前1小时刷新）
    const refreshInterval = 6 * 60 * 60 * 1000

    setInterval(async () => {
      try {
        const response = await $fetch('/api/auth/refresh', {
          method: 'POST',
          body: { refreshToken: userStore.refreshToken },
        })

        if (response.code === 0) {
          userStore.setToken(response.data.token)
        }
      } catch (error) {
        // 刷新失败，退出登录
        userStore.clearAuth()
        navigateTo('/login')
      }
    }, refreshInterval)
  }
})
```

---

## 5. 安全策略

### 5.1 密码安全

- **密码强度**：至少 8 位，建议 12 位以上
- **bcrypt 加密**：SALT_ROUNDS = 12
- **错误次数限制**：同一 IP 5分钟内最多 5 次
- **密码历史**：不能重复使用最近 5 次密码

### 5.2 Token 安全

- **HTTPS 传输**：生产环境强制 HTTPS
- **Token 有效期**：Access Token 7 天，Refresh Token 30 天
- **Token 刷新机制**：自动续期
- **Token 撤销**：支持主动登出

### 5.3 会话安全

```typescript
// server/middleware/rate-limit.ts
const rateLimiter = new Map<string, { count: number; resetTime: number }>()

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event) || 'unknown'

  // 5分钟内最多 100 次请求
  const limit = 100
  const windowMs = 5 * 60 * 1000

  const record = rateLimiter.get(ip)

  if (record) {
    if (Date.now() > record.resetTime) {
      // 重置窗口
      rateLimiter.set(ip, { count: 1, resetTime: Date.now() + windowMs })
    } else {
      record.count++
      if (record.count > limit) {
        throw createError({
          statusCode: 429,
          message: '请求过于频繁，请稍后再试',
        })
      }
    }
  } else {
    rateLimiter.set(ip, { count: 1, resetTime: Date.now() + windowMs })
  }
})
```

---

## 6. 环境变量

```bash
# .env.example

# JWT 密钥（至少 32 位随机字符串）
JWT_SECRET=your-super-secret-key-at-least-32-characters

# 数据库
DATABASE_URL=postgresql://user:password@host/database

# CORS
CORS_ORIGIN=https://your-domain.com
```

---

## 附录：类型定义

```typescript
// shared/types/auth.ts

export interface UserInfo {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
}

export interface AccessTokenPayload {
  sub: string
  email: string
  name: string
  type: 'access'
  iat: number
  exp: number
}

export interface RefreshTokenPayload {
  sub: string
  type: 'refresh'
  jti: string
  iat: number
  exp: number
}

export interface LoginDTO {
  email: string
  password: string
}

export interface RegisterDTO {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  user: UserInfo
  token: string
  refreshToken: string
  expiresIn: number
}
```
