export interface Tenant {
  id?: number
  tenantId?: number
  name: string
  phone?: string
  email?: string
  roomId?: number
  room?: Room
  moveInDate?: string
  monthlyRent?: number
  active?: boolean
}

export interface Room {
  id?: number
  roomId?: number
  roomNumber: string
  type?: string
  monthlyRent: number
  occupied?: boolean
  tenantId?: number
}

export interface RentPayment {
  id?: number
  paymentId?: number
  tenantId: number
  tenantName?: string
  month: string
  amount: number
  paymentDate: string
  status?: string
  notes?: string
}