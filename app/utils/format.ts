export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount)
}

export const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN')
}

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleString('zh-CN')
}
