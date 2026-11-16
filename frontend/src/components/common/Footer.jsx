import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="tf-footer">
      <div className="container">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <div className="d-flex align-items-center gap-2">
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--success)',
                display: 'inline-block',
              }}
            />
            <span className="small">System Status: Operational</span>
          </div>

          <div className="small text-muted text-center">
            TaskFlow &copy; {currentYear} &bull; Full-Stack React & Node.js Application
          </div>

          <div className="d-flex gap-3 small">
            <span className="text-muted">RESTful API</span>
            <span className="text-muted">&bull;</span>
            <span className="text-muted">MongoDB ODM</span>
            <span className="text-muted">&bull;</span>
            <span className="text-muted">JWT Auth</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
