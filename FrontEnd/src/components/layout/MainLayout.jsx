import React from 'react';
import Header from './Header';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-1 w-full overflow-hidden bg-[#f8f9fa]">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
