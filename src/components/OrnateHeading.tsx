import React from 'react';
import { useBannerSettings } from '@/hooks/useBannerSettings';
interface OrnateHeadingProps {
  title: string;
  subtitle?: string;
  showLogo?: boolean;
  className?: string;
  titleImageSrc?: string;
  ornamentImageSrc?: string;
  hideTitle?: boolean;
}
const OrnateHeading = ({
  title,
  subtitle,
  showLogo = false,
  className = "",
  titleImageSrc,
  ornamentImageSrc,
  hideTitle = false
}: OrnateHeadingProps) => {
  const {
    bannerSettings
  } = useBannerSettings();
  return <div className={`text-center mb-8 relative ${className}`}>
      {/* Ornament section - either custom image or decorative SVG */}
      
      
      {/* Additional image below ornament */}
      <div className="mb-4 px-4">
        <img src="/lovable-uploads/4afb5baa-9690-4e7c-a823-6f65ee25d213.png" alt="Produtos Especializados" className="w-full h-auto object-contain max-w-sm md:max-w-md lg:max-w-lg mx-auto" />
      </div>
      
      {/* Title - either image, hidden, or text */}
      {titleImageSrc ? <>
          <img src={titleImageSrc} alt={title} className="mx-auto block h-12 md:h-16 w-auto mb-2" />
          <h1 className="sr-only">{title}</h1>
        </> : hideTitle ? <h1 className="sr-only">{title}</h1> : <h1 className="text-2xl md:text-3xl font-bold text-gradient-gold mb-2 font-playfair relative z-10">
          {title}
        </h1>}
      
      {/* Subtitle */}
      {subtitle}
    </div>;
};
export default OrnateHeading;