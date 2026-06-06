import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少需要6个字符')
})

export const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少需要6个字符'),
  name: z.string().min(2, '姓名至少需要2个字符').max(50, '姓名最多50个字符')
})

export type LoginRequest = z.infer<typeof loginSchema>
export type RegisterRequest = z.infer<typeof registerSchema>
