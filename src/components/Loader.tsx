import React from 'react';
import './Loader.css';

export default function Loader() {
  return (
    <div className="loader-wrapper" data-testid="loader">
      <div className="loader" />
    </div>
  );
}
