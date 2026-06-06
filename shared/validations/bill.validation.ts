import { z } from 'zod'

export const createBillSchema = z.object({
  type: z.enum(['income', 'expense'], {
    required_error: '请选择收支类型'
  }),
  category: z.string().min(1, '请选择分类'),
  amount: z.number().positive('金额必须大于0'),
  description: z.string().optional(),
  date: z.date().optional()
})

export const updateBillSchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  description: z.string().optional(),
  date: z.date().optional()
})

export type CreateBillRequest = z.infer<typeof createBillSchema>
export type UpdateBillRequest = z.infer<typeof updateBillSchema>
