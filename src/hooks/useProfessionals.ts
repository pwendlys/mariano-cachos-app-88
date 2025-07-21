
import { useState, useEffect } from 'react';

export interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  avatar?: string;
  isActive: boolean;
  commissionPercentage: number; // Percentual de comissão (0-100)
}

const initialProfessionals: Professional[] = [
  {
    id: '1',
    name: 'Marcos Mariano',
    email: 'marcos@salon.com',
    phone: '(11) 99999-9999',
    specialties: ['Cortes', 'Coloração', 'Hidratação'],
    isActive: true,
    commissionPercentage: 40
  },
  {
    id: '2',
    name: 'Ana Silva',
    email: 'ana@salon.com',
    phone: '(11) 88888-8888',
    specialties: ['Finalização', 'Hidratação'],
    isActive: true,
    commissionPercentage: 35
  }
];

export const useProfessionals = () => {
  const [professionals, setProfessionals] = useState<Professional[]>(() => {
    const stored = localStorage.getItem('salon-professionals');
    const parsedProfessionals = stored ? JSON.parse(stored) : initialProfessionals;
    
    // Filter out any professionals with empty IDs
    const validProfessionals = parsedProfessionals.filter((prof: Professional) => prof.id && prof.id.trim() !== '');
    console.log('Loaded professionals, filtered out empty IDs:', validProfessionals);
    
    return validProfessionals;
  });

  useEffect(() => {
    // Filter out any professionals with empty IDs before saving
    const validProfessionals = professionals.filter(prof => prof.id && prof.id.trim() !== '');
    localStorage.setItem('salon-professionals', JSON.stringify(validProfessionals));
  }, [professionals]);

  const addProfessional = (professional: Professional) => {
    console.log('Adding professional:', professional);
    if (!professional.id || professional.id.trim() === '') {
      console.error('Professional ID cannot be empty');
      return;
    }
    setProfessionals(prev => [...prev, professional]);
  };

  const updateProfessional = (professionalId: string, updatedProfessional: Professional) => {
    console.log('Updating professional:', professionalId, updatedProfessional);
    if (!professionalId || professionalId.trim() === '') {
      console.error('Professional ID cannot be empty');
      return;
    }
    if (!updatedProfessional.id || updatedProfessional.id.trim() === '') {
      console.error('Updated professional ID cannot be empty');
      return;
    }
    setProfessionals(prev => prev.map(prof => prof.id === professionalId ? updatedProfessional : prof));
  };

  const deleteProfessional = (professionalId: string) => {
    console.log('Deleting professional:', professionalId);
    if (!professionalId || professionalId.trim() === '') {
      console.error('Professional ID cannot be empty');
      return;
    }
    setProfessionals(prev => prev.filter(prof => prof.id !== professionalId));
  };

  const getActiveProfessionals = () => {
    return professionals.filter(prof => prof.isActive && prof.id && prof.id.trim() !== '');
  };

  const getProfessionalById = (professionalId: string) => {
    if (!professionalId || professionalId.trim() === '') {
      console.warn('getProfessionalById called with empty ID');
      return undefined;
    }
    return professionals.find(prof => prof.id === professionalId);
  };

  return {
    professionals: professionals.filter(prof => prof.id && prof.id.trim() !== ''), // Always filter out empty IDs
    addProfessional,
    updateProfessional,
    deleteProfessional,
    getActiveProfessionals,
    getProfessionalById
  };
};
