import api from './axios'

export interface Device {
  id: string
  nome: string
  descrizione?: string
  anno?: number
  note?: string
}

export const listDevices = (): Promise<Device[]> =>
  api.get<Device[]>('/dispositivi').then(r => r.data)

export const createDevice = (data: Omit<Device, 'id'>): Promise<Device> =>
  api.post<Device>('/dispositivi', data).then(r => r.data)

export const updateDevice = (
  id: string,
  data: Partial<Omit<Device, 'id'>>,
): Promise<Device> =>
  api.put<Device>(`/dispositivi/${id}`, data).then(r => r.data)

export const deleteDevice = (id: string): Promise<void> =>
  api.delete(`/dispositivi/${id}`).then(() => undefined)
