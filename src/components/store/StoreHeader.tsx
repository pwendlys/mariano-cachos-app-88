
import React from 'react';

interface StoreHeaderProps {
  title: string;
  description: string;
}

const StoreHeader = ({ title, description }: StoreHeaderProps) => {
  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl font-bold text-gradient-gold mb-2 font-playfair">
        {title}
      </h1>
      <p className="text-muted-foreground">
        {description}
      </p>
    </div>
  );
};

export default StoreHeader;
