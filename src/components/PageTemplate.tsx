import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Greeting from './Greeting';

const PageTemplate: React.FC = () => (
  <>
    <Header />
    <Greeting />
    <main className="app-container">
      <Outlet />
    </main>
    <Footer />
  </>
);

export default PageTemplate;
