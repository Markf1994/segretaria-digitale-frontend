import React, { useEffect } from 'react';

const IntegrationBox: React.FC = () => {
  useEffect(() => {
    const token = import.meta.env.VITE_INTEGRATION_TOKEN;
    if (!token) {
      return;
    }

    const script = document.createElement('script');
    script.src = `https://third-party.example.com/widget.js?token=${token}`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="integration-box dashboard-section">
      <h2>Integration</h2>
      <div id="integration-widget" />
    </div>
  );
};

export default IntegrationBox;

