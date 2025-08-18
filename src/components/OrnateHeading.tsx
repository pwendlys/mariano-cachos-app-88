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
  const { bannerSettings } = useBannerSettings();

  return (
    <div className={`text-center mb-8 relative ${className}`}>
      {/* Ornament section - either custom image or decorative SVG */}
      <div className="relative flex items-center justify-center mb-4">
        {ornamentImageSrc ? (
          <img 
            src={ornamentImageSrc} 
            alt="Ornamental banner"
            className="w-full max-w-md h-20 object-contain"
          />
        ) : (
          <>
            <svg 
              viewBox="0 0 400 120" 
              className="w-full max-w-md h-20 absolute inset-0"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="ornateGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="50%" stopColor="#F7DC6F" />
                  <stop offset="100%" stopColor="#B7950B" />
                </linearGradient>
              </defs>
              
              {/* Left ornament */}
              <path
                d="M20 60 Q40 40, 80 50 Q100 45, 120 55 Q140 50, 160 60"
                stroke="url(#ornateGradient)"
                strokeWidth="4"
                fill="none"
                opacity="0.8"
              />
              <path
                d="M30 65 Q50 55, 70 60 Q90 58, 110 65"
                stroke="url(#ornateGradient)"
                strokeWidth="3"
                fill="none"
                opacity="0.6"
              />
              
              {/* Right ornament */}
              <path
                d="M240 60 Q260 50, 280 55 Q300 45, 320 50 Q360 40, 380 60"
                stroke="url(#ornateGradient)"
                strokeWidth="4"
                fill="none"
                opacity="0.8"
              />
              <path
                d="M290 65 Q310 58, 330 60 Q350 55, 370 65"
                stroke="url(#ornateGradient)"
                strokeWidth="3"
                fill="none"
                opacity="0.6"
              />
              
              {/* Central crown elements */}
              <circle cx="180" cy="45" r="4" fill="url(#ornateGradient)" opacity="0.9" />
              <circle cx="200" cy="40" r="5" fill="url(#ornateGradient)" />
              <circle cx="220" cy="45" r="4" fill="url(#ornateGradient)" opacity="0.9" />
              
              {/* Decorative flourishes */}
              <path
                d="M170 55 Q180 50, 190 55 Q200 50, 210 55 Q220 50, 230 55"
                stroke="url(#ornateGradient)"
                strokeWidth="2"
                fill="none"
                opacity="0.7"
              />
            </svg>
            
            {/* Logo in center if available and requested */}
            {showLogo && bannerSettings.logo && (
              <div className="relative z-10 w-12 h-12 rounded-full bg-salon-dark/80 border-2 border-salon-gold/50 flex items-center justify-center">
                <img 
                  src={bannerSettings.logo} 
                  alt="Logo" 
                  className="w-8 h-8 object-contain rounded-full"
                />
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Title - either image, hidden, or text */}
      {titleImageSrc ? (
        <>
          <img 
            src={titleImageSrc} 
            alt={title}
            className="mx-auto block h-12 md:h-16 w-auto mb-2"
          />
          <h1 className="sr-only">{title}</h1>
        </>
      ) : hideTitle ? (
        <h1 className="sr-only">{title}</h1>
      ) : (
        <h1 className="text-2xl md:text-3xl font-bold text-gradient-gold mb-2 font-playfair relative z-10">
          {title}
        </h1>
      )}
      
      {/* Subtitle */}
      {subtitle && (
        <p className="text-muted-foreground text-sm md:text-base relative z-10">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default OrnateHeading;
