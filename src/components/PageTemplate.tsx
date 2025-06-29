import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const PageTemplate: React.FC = () => (
  <>
    <Header />
    <main className="app-container">
      <Outlet />
    </main>
    <Footer />
  </>
);

export default PageTemplate;
