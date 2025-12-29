import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/home/Header';

const Layout = ({ fullWidth = false }) => {
  return (
    <div className="bg-gray-50 min-h-screen transition-colors duration-200">
      <Header />
      <main className="pt-20">
        <div className={fullWidth ? "" : "w-full max-w-[1920px] mx-auto px-4 md:px-8 py-8"}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
