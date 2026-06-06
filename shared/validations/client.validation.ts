import { z } from 'zod'

export const createClientSchema = z.object({
  name: z.string().min(2, '姓名至少需要2个字符').max(50, '姓名最多50个字符'),
  company: z.string().max(100, '公司名最多100个字符').optional(),
  email: z.string().email('请输入有效的邮箱地址').optional(),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号码').optional(),
  address: z.string().max(200, '地址最多200个字符').optional(),
  notes: z.string().max(500, '备注最多500个字符').optional()
})

export const updateClientSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  company: z.string().max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^1[3-9]\d{9}$/).optional(),
  address: z.string().max(200).optional(),
  notes: z.string().max(500).optional()
})

export type CreateClientRequest = z.infer<typeof createClientSchema>
export type UpdateClientRequest = z.infer<typeof updateClientSchema>
