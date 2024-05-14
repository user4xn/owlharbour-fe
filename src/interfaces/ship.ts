interface WebsocketShipInterface {
    is_update: boolean
    ship_id: number
    ship_name: string
    device_id: string
    geo: any[]
    on_ground: number
    deg_north: number
}

interface DockingLogsInterface {
    log_id: number
    long: string
    lat: string
    status: string
    created_at: string
}

interface ShipDataInterface {
    id: number
    ship_name: string
    responsible_name: string
    device_id: string
    status: string
    on_ground: number
    created_at: string
}

export type {WebsocketShipInterface, ShipDataInterface, DockingLogsInterface}