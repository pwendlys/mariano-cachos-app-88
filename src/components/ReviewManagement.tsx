
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Check, X, Eye, EyeOff } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const ReviewManagement: React.FC = () => {
  const { reviews, loading, updateReviewStatus, toggleDisplayOnProfile } = useReviews();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleStatusChange = async (reviewId: string, status: 'aprovada' | 'rejeitada') => {
    setProcessingId(reviewId);
    try {
      await updateReviewStatus(reviewId, status);
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleDisplay = async (reviewId: string, currentDisplay: boolean) => {
    setProcessingId(reviewId);
    try {
      await toggleDisplayOnProfile(reviewId, !currentDisplay);
    } finally {
      setProcessingId(null);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { variant: 'secondary' as const, label: 'Pendente' },
      aprovada: { variant: 'default' as const, label: 'Aprovada' },
      rejeitada: { variant: 'destructive' as const, label: 'Rejeitada' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Avaliações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando avaliações...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Avaliações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            Nenhuma avaliação encontrada
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{review.cliente?.nome}</span>
                    {renderStars(review.nota)}
                    {getStatusBadge(review.status)}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {review.agendamento?.servico?.nome} • {' '}
                    {format(new Date(review.agendamento?.data || ''), 'dd/MM/yyyy', { locale: ptBR })} às {review.agendamento?.horario}
                  </div>
                  
                  {review.comentario && (
                    <div className="text-sm bg-muted p-2 rounded">
                      "{review.comentario}"
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Enviada em {format(new Date(review.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  {review.status === 'pendente' && (
                    <div className="flex gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="default"
                            disabled={processingId === review.id}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Aprovar Avaliação</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja aprovar esta avaliação? 
                              Ela ficará disponível para exibição no perfil.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleStatusChange(review.id, 'aprovada')}
                            >
                              Aprovar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            disabled={processingId === review.id}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Rejeitar Avaliação</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja rejeitar esta avaliação? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleStatusChange(review.id, 'rejeitada')}
                            >
                              Rejeitar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                  
                  {review.status === 'aprovada' && (
                    <Button
                      size="sm"
                      variant={review.exibir_no_perfil ? "default" : "outline"}
                      onClick={() => handleToggleDisplay(review.id, review.exibir_no_perfil)}
                      disabled={processingId === review.id}
                      className="gap-2"
                    >
                      {review.exibir_no_perfil ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      {review.exibir_no_perfil ? 'Exibindo' : 'Oculto'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
