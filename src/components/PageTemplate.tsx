import React from 'react';
import Header from './Header';
import Footer from './Footer';
import './PageTemplate.css';

interface PageTemplateProps {
  sidebar?: React.ReactNode;
  children: React.ReactNode;
}

const PageTemplate: React.FC<PageTemplateProps> = ({ sidebar, children }) => (
  <>
    <Header />
    <div className="page-template">
      {sidebar && <aside className="page-sidebar">{sidebar}</aside>}
      <main className="page-main">{children}</main>
    </div>
    <Footer />
  </>
);

export default PageTemplate;
