import api from './axios';
export const login = async (email: string, password: string) => {
  const form = new URLSearchParams();
  form.append('username', email);
  form.append('password', password);
  const res = await api.post('/login', form);
  return res.data.access_token;
};