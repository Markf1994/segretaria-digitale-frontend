import React from 'react';
import Header from './Header';
import Footer from './Footer';

const PageTemplate: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Header />
    <main className="app-container">{children}</main>
    <Footer />
  </>
);

export default PageTemplate;
