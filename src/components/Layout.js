import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/home/Header';

const Layout = () => {
  return (
    <div className="bg-gray-100 min-h-screen transition-colors duration-200">
      <Header />
      <main className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 transition-colors duration-200">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
