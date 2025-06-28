import api from './axios'

export interface Todo {
  id: string
  text: string
  due: string
}

export const listTodos = (): Promise<Todo[]> =>
  api.get<Todo[]>('/todo').then(r => r.data)

export const createTodo = (data: Omit<Todo, 'id'>): Promise<Todo> =>
  api.post<Todo>('/todo', data).then(r => r.data)

export const updateTodo = (
  id: string,
  data: Partial<Omit<Todo, 'id'>>
): Promise<Todo> =>
  api.put<Todo>(`/todo/${id}`, data).then(r => r.data)

export const deleteTodo = (id: string): Promise<void> =>
  api.delete(`/todo/${id}`).then(() => undefined)
