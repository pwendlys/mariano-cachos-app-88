
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Scissors, Star, Users, Award, Calendar, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useReviews } from '@/hooks/useReviews';

interface PublicReview {
  id: string;
  nota: number;
  comentario?: string;
  created_at: string;
  cliente: {
    nome: string;
  };
}

export default function Index() {
  const [publicReviews, setPublicReviews] = useState<PublicReview[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const { getPublicReviews, getAverageRating, getTotalClients } = useReviews();

  useEffect(() => {
    const loadProfileData = async () => {
      const [reviews, average, total] = await Promise.all([
        getPublicReviews(),
        getAverageRating(),
        getTotalClients()
      ]);
      
      setPublicReviews(reviews);
      setAverageRating(Math.round(average * 10) / 10);
      setTotalClients(total);
    };

    loadProfileData();
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white rounded-full shadow-lg">
              <Scissors className="h-12 w-12 text-pink-500" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Beleza & Bem-estar
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transforme seu visual com nossos serviços especializados. 
            Agende seu horário e descubra uma nova versão de você!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/supabase-scheduling">
              <Button size="lg" className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3">
                <Calendar className="mr-2 h-5 w-5" />
                Agendar Horário
              </Button>
            </Link>
            
            <Link to="/supabase-store">
              <Button variant="outline" size="lg" className="px-8 py-3">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Ver Produtos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Users className="h-12 w-12 text-pink-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">{totalClients}</div>
                <div className="text-gray-600">Clientes Felizes</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <Award className="h-12 w-12 text-pink-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">5+</div>
                <div className="text-gray-600">Anos de Experiência</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <Star className="h-12 w-12 text-pink-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">{averageRating.toFixed(1)}</div>
                <div className="text-gray-600">Avaliação Média</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      {publicReviews.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                O que nossos clientes dizem
              </h2>
              <p className="text-gray-600">
                Depoimentos reais de quem confia no nosso trabalho
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {publicReviews.map((review) => (
                <Card key={review.id} className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      {renderStars(review.nota)}
                      <Badge variant="outline">Verificado</Badge>
                    </div>
                    
                    {review.comentario && (
                      <p className="text-gray-600 mb-4 italic">
                        "{review.comentario}"
                      </p>
                    )}
                    
                    <div className="text-sm text-gray-500">
                      — {review.cliente.nome}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services Preview */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nossos Serviços
            </h2>
            <p className="text-gray-600">
              Oferecemos uma gama completa de serviços de beleza
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { name: 'Corte', icon: '✂️', description: 'Cortes modernos e clássicos' },
              { name: 'Coloração', icon: '🎨', description: 'Cores vibrantes e naturais' },
              { name: 'Tratamentos', icon: '💆‍♀️', description: 'Cuidados especiais' },
              { name: 'Styling', icon: '💇‍♀️', description: 'Penteados para ocasiões especiais' }
            ].map((service) => (
              <Card key={service.name} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Link to="/supabase-scheduling">
              <Button size="lg" className="bg-pink-500 hover:bg-pink-600 text-white">
                Ver Todos os Serviços
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <BottomNavigation />
    </div>
  );
}
