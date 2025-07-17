import api from './axios'

export interface Device {
  id: string
  nome: string
  descrizione?: string
  anno?: number
  note?: string
}

export const listDevices = (): Promise<Device[]> =>
  api.get<Device[]>('/inventario/devices').then(r => r.data)

export const createDevice = (data: Omit<Device, 'id'>): Promise<Device> =>
  api.post<Device>('/inventario/devices', data).then(r => r.data)

export const updateDevice = (
  id: string,
  data: Partial<Omit<Device, 'id'>>,
): Promise<Device> =>
  api.put<Device>(`/inventario/devices/${id}`, data).then(r => r.data)

export const deleteDevice = (id: string): Promise<void> =>
  api.delete(`/inventario/devices/${id}`).then(() => undefined)
