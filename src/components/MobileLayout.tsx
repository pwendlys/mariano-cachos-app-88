
import React from 'react';
import { useLocation } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import { Header } from './Header';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout = ({ children }: MobileLayoutProps) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gradient-to-br from-salon-dark via-salon-dark/95 to-salon-copper/20">
      {!isAdminRoute && <Header />}
      <main className={`${!isAdminRoute ? 'pt-24 pb-32' : ''} min-h-screen`}>
        {children}
      </main>
      {!isAdminRoute && <BottomNavigation />}
    </div>
  );
};

export default MobileLayout;
