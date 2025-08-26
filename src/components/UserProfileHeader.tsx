
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import AvatarUpload from '@/components/AvatarUpload';

const UserProfileHeader = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'admin': return 'Administrador';
      case 'convidado': return 'Convidado';
      case 'cliente': return 'Cliente';
      default: return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'admin': return 'bg-salon-gold/20 text-salon-gold';
      case 'convidado': return 'bg-blue-500/20 text-blue-400';
      case 'cliente': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <Card className="glass-card border-salon-gold/20 mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <AvatarUpload />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
              <h1 className="text-2xl font-bold text-salon-gold font-playfair">
                {user.nome}
              </h1>
              <Badge className={getTypeBadgeColor(user.tipo)}>
                {getTypeLabel(user.tipo)}
              </Badge>
            </div>
            
            <div className="space-y-2 text-muted-foreground">
              <p>
                <span className="font-medium">Email:</span> {user.email}
              </p>
              {user.whatsapp && (
                <p>
                  <span className="font-medium">WhatsApp:</span> {user.whatsapp}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfileHeader;
