import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div className="main-layout">
      {/* TODO: Add Header */}
      <header className="main-header">
        <nav>
          {/* TODO: Add Navigation */}
        </nav>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      {/* TODO: Add Footer */}
      <footer className="main-footer">
        {/* Footer content */}
      </footer>
    </div>
  );
};

export default MainLayout; 