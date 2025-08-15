
import { useState, useEffect } from 'react';

export interface BannerSettings {
  id: string;
  image?: string;
  logo?: string;
  title: string;
  subtitle: string;
  description: string;
  isVisible: boolean;
}

const defaultBannerSettings: BannerSettings = {
  id: 'main-banner',
  logo: '/lovable-uploads/6c513fb2-7005-451a-bfba-cb471f2086a3.png',
  title: 'Marcos Mariano',
  subtitle: 'Expert em Crespos e Cacheados',
  description: 'Sua beleza natural merece ser celebrada. Aqui, cada cacho tem sua história e personalidade única.',
  isVisible: true
};

export const useBannerSettings = () => {
  const [bannerSettings, setBannerSettings] = useState<BannerSettings>(() => {
    const stored = localStorage.getItem('salon-banner-settings');
    return stored ? JSON.parse(stored) : defaultBannerSettings;
  });

  useEffect(() => {
    localStorage.setItem('salon-banner-settings', JSON.stringify(bannerSettings));
  }, [bannerSettings]);

  const updateBannerSettings = (newSettings: BannerSettings) => {
    setBannerSettings(newSettings);
  };

  return {
    bannerSettings,
    updateBannerSettings
  };
};
