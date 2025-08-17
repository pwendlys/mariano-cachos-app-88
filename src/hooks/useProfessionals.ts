
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

// Helper function to filter out empty strings from specialties
const filterValidSpecialties = (specialties: string[]): string[] => {
  return specialties.filter(specialty => specialty && specialty.trim() !== '');
};

// Helper function to clean professional data
const cleanProfessionalData = (professional: Professional): Professional => {
  return {
    ...professional,
    specialties: filterValidSpecialties(professional.specialties)
  };
};

export const useProfessionals = () => {
  const [professionals, setProfessionals] = useState<Professional[]>(() => {
    const stored = localStorage.getItem('salon-professionals');
    const parsedProfessionals = stored ? JSON.parse(stored) : initialProfessionals;
    
    // Filter out any professionals with empty IDs and clean specialties
    const validProfessionals = parsedProfessionals
      .filter((prof: Professional) => prof.id && prof.id.trim() !== '')
      .map((prof: Professional) => cleanProfessionalData(prof));
    
    console.log('Loaded professionals, filtered out empty IDs and specialties:', validProfessionals);
    
    return validProfessionals;
  });

  useEffect(() => {
    // Filter out any professionals with empty IDs and clean specialties before saving
    const validProfessionals = professionals
      .filter(prof => prof.id && prof.id.trim() !== '')
      .map(prof => cleanProfessionalData(prof));
    localStorage.setItem('salon-professionals', JSON.stringify(validProfessionals));
  }, [professionals]);

  const addProfessional = (professional: Professional) => {
    console.log('Adding professional:', professional);
    if (!professional.id || professional.id.trim() === '') {
      console.error('Professional ID cannot be empty');
      return;
    }
    const cleanedProfessional = cleanProfessionalData(professional);
    setProfessionals(prev => [...prev, cleanedProfessional]);
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
    const cleanedProfessional = cleanProfessionalData(updatedProfessional);
    setProfessionals(prev => prev.map(prof => prof.id === professionalId ? cleanedProfessional : prof));
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
    return professionals
      .filter(prof => prof.isActive && prof.id && prof.id.trim() !== '')
      .map(prof => cleanProfessionalData(prof));
  };

  const getProfessionalById = (professionalId: string) => {
    if (!professionalId || professionalId.trim() === '') {
      console.warn('getProfessionalById called with empty ID');
      return undefined;
    }
    const professional = professionals.find(prof => prof.id === professionalId);
    return professional ? cleanProfessionalData(professional) : undefined;
  };

  return {
    professionals: professionals
      .filter(prof => prof.id && prof.id.trim() !== '') // Always filter out empty IDs
      .map(prof => cleanProfessionalData(prof)), // Always clean specialties
    addProfessional,
    updateProfessional,
    deleteProfessional,
    getActiveProfessionals,
    getProfessionalById
  };
};
