interface PairingListInterface{
  id: number
  ship_name: string 
  phone: string
  username: string
  password: string
  responsible_name: string 
  device_id: string
  firebase_token: string
  status: string
  created_at: string
}

export type { PairingListInterface }