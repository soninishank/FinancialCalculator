import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/home/Header';
import Footer from '../components/common/Footer';

const Layout = ({ fullWidth = false }) => {
  return (
    <div className="bg-gray-50 min-h-screen transition-colors duration-200 flex flex-col">
      <Header />
      <main className="pt-20 flex-grow">
        <div className={fullWidth ? "" : "w-full max-w-[1920px] mx-auto px-3 sm:px-4 md:px-8 py-8"}>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
