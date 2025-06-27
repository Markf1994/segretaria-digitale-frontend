import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface PageTemplateProps {
  children: React.ReactNode;
}

const PageTemplate: React.FC<PageTemplateProps> = ({ children }) => (
  <>
    <Header />
    <div className="main-content">{children}</div>
    <Footer />
  </>
);

export default PageTemplate;
