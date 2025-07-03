import api from './axios'
import { User } from '../types/user'

export const listUsers = () => api.get<User[]>('/users/')

export const getUtente = (id: string) =>
  api.get<User>('/users', { params: { email: id } })
