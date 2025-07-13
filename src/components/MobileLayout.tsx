
import React from 'react';
import { useLocation } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import Header from './Header';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout = ({ children }: MobileLayoutProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gradient-to-br from-salon-dark via-salon-dark/95 to-salon-copper/20">
      {!isAdminRoute && <Header />}
      <main className={`
        ${!isAdminRoute ? 'pt-16 sm:pt-20 md:pt-24 pb-24 sm:pb-28 md:pb-32' : 'pt-2 pb-4'} 
        min-h-screen
        px-2 sm:px-4
        ${isMobile ? 'overflow-x-hidden' : ''}
      `}>
        <div className="w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      {!isAdminRoute && <BottomNavigation />}
    </div>
  );
};

export default MobileLayout;
