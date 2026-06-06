export interface Bill {
  id: string
  userId: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description?: string
  date: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateBillRequest {
  type: 'income' | 'expense'
  category: string
  amount: number
  description?: string
  date?: Date
}

export interface UpdateBillRequest {
  type?: 'income' | 'expense'
  category?: string
  amount?: number
  description?: string
  date?: Date
}
