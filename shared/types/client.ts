export interface Client {
  id: string
  userId: string
  name: string
  company?: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateClientRequest {
  name: string
  company?: string
  email?: string
  phone?: string
  address?: string
  notes?: string
}

export interface UpdateClientRequest {
  name?: string
  company?: string
  email?: string
  phone?: string
  address?: string
  notes?: string
}
