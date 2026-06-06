export const PROJECT_STATUSES = [
  { value: 'draft', label: '草稿', color: 'gray' },
  { value: 'active', label: '进行中', color: 'blue' },
  { value: 'completed', label: '已完成', color: 'green' },
  { value: 'cancelled', label: '已取消', color: 'red' }
] as const

export type ProjectStatus = typeof PROJECT_STATUSES[number]['value']
