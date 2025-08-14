
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ClientAvatarProps {
  avatar_url?: string;
  nome: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ClientAvatar: React.FC<ClientAvatarProps> = ({ 
  avatar_url, 
  nome, 
  size = 'md',
  className = '' 
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-lg'
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={avatar_url} alt={`Avatar de ${nome}`} />
      <AvatarFallback className="bg-salon-gold/20 text-salon-gold font-medium">
        {getInitials(nome)}
      </AvatarFallback>
    </Avatar>
  );
};

export default ClientAvatar;
