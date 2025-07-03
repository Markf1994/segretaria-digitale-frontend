import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import api from '../api/axios';
import { useAuthStore } from '../store/auth';
import { User } from '../types/user';

const PageTemplate: React.FC = () => {
  const token = useAuthStore(s => s.token);
  const user = useAuthStore(s => s.user);
  const setUser = useAuthStore(s => s.setUser);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/users/me');
        setUser(res.data);
      } catch (err) {
        console.error(err);
        setUser({ id: '', email: '', nome: '' } as User);
      }
    };
    if (token && !user) fetchUser();
  }, [token, user, setUser]);

  return (
    <>
      <Header />
      <main className="app-container">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default PageTemplate;
