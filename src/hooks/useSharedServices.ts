
import { useState, useEffect } from 'react';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // em minutos
  image?: string;
  professionalIds: string[]; // IDs dos profissionais que podem realizar este serviço
}

const initialServices: Service[] = [
  {
    id: '1',
    name: 'Corte Especializado',
    description: 'Corte personalizado para crespos e cacheados',
    price: 80,
    duration: 60,
    image: '/lovable-uploads/62560d60-dd02-4d14-a219-49f2791caa7d.png',
    professionalIds: ['1', '2']
  },
  {
    id: '2',
    name: 'Hidratação Profunda',
    description: 'Tratamento intensivo de hidratação',
    price: 120,
    duration: 120,
    image: '/lovable-uploads/3db478af-14c5-4827-b74f-11c73955a529.png',
    professionalIds: ['1', '2']
  },
  {
    id: '3',
    name: 'Coloração Natural',
    description: 'Coloração respeitando a textura natural',
    price: 200,
    duration: 180,
    image: '/lovable-uploads/81d52047-99e1-4419-95b9-ed9915ea285c.png',
    professionalIds: ['1']
  },
  {
    id: '4',
    name: 'Finalização Premium',
    description: 'Finalização profissional dos cachos',
    price: 60,
    duration: 45,
    professionalIds: ['2']
  }
];

export const useSharedServices = () => {
  const [services, setServices] = useState<Service[]>(() => {
    const stored = localStorage.getItem('salon-services');
    return stored ? JSON.parse(stored) : initialServices;
  });

  useEffect(() => {
    localStorage.setItem('salon-services', JSON.stringify(services));
  }, [services]);

  const updateServices = (newServices: Service[]) => {
    setServices(newServices);
  };

  const addService = (service: Service) => {
    setServices(prev => [...prev, service]);
  };

  const updateService = (serviceId: string, updatedService: Service) => {
    setServices(prev => prev.map(s => s.id === serviceId ? updatedService : s));
  };

  const deleteService = (serviceId: string) => {
    setServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const getServicesByProfessional = (professionalId: string) => {
    return services.filter(service => service.professionalIds.includes(professionalId));
  };

  return {
    services,
    updateServices,
    addService,
    updateService,
    deleteService,
    getServicesByProfessional
  };
};
