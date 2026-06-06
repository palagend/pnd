export interface Project {
  id: string
  userId: string
  clientId?: string
  name: string
  description?: string
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  budget?: number
  startDate?: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateProjectRequest {
  clientId?: string
  name: string
  description?: string
  status?: 'draft' | 'active' | 'completed' | 'cancelled'
  budget?: number
  startDate?: Date
  endDate?: Date
}

export interface UpdateProjectRequest {
  clientId?: string
  name?: string
  description?: string
  status?: 'draft' | 'active' | 'completed' | 'cancelled'
  budget?: number
  startDate?: Date
  endDate?: Date
}
