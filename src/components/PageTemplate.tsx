import React from 'react';
import './PageTemplate.css';

interface Props {
  children: React.ReactNode;
}

const PageTemplate: React.FC<Props> = ({ children }) => (
  <div className="page-template">{children}</div>
);

export default PageTemplate;
