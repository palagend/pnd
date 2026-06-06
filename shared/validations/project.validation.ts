import { z } from 'zod'

export const createProjectSchema = z.object({
  clientId: z.string().optional(),
  name: z.string().min(2, '项目名称至少需要2个字符').max(100, '项目名称最多100个字符'),
  description: z.string().max(500, '项目描述最多500个字符').optional(),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']).optional(),
  budget: z.number().positive('预算必须大于0').optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional()
}).refine(data => !data.startDate || !data.endDate || data.startDate < data.endDate, {
  message: '开始日期必须早于结束日期',
  path: ['endDate']
})

export const updateProjectSchema = z.object({
  clientId: z.string().optional(),
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']).optional(),
  budget: z.number().positive().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional()
}).refine(data => !data.startDate || !data.endDate || data.startDate < data.endDate, {
  message: '开始日期必须早于结束日期',
  path: ['endDate']
})

export type CreateProjectRequest = z.infer<typeof createProjectSchema>
export type UpdateProjectRequest = z.infer<typeof updateProjectSchema>
