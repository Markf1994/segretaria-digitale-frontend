import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  return <footer className="site-footer">© M.Fenaroli {year}</footer>;
};

export default Footer;
