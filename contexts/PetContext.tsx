import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/services/api';
import { mockPets } from '@/services/mockData';

export interface Pet {
  id: string;
  name: string;
  species: 'cat' | 'dog' | 'bird' | 'fish' | 'other';
  breed: string;
  age: number;
  gender: 'male' | 'female';
  color: string;
  description: string;
  photos: string[];
  location: string;
  isActive: boolean;
  neutered: boolean;
  ownerId: string;
  createdAt: string;
}

interface PetContextType {
  userPets: Pet[];
  loading: boolean;
  error: string | null;
  loadUserPets: () => Promise<void>;
  addPet: (pet: Omit<Pet, 'id' | 'createdAt'>) => Promise<void>;
  updatePet: (id: string, pet: Partial<Pet>) => Promise<void>;
  deletePet: (id: string) => Promise<void>;
  refreshPets: () => Promise<void>;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

interface PetProviderProps {
  children: ReactNode;
}

export function PetProvider({ children }: PetProviderProps) {
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUserPets = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('PetContext: Uygulama başlangıcında pet yükleme atlanıyor...');
      
      // Don't load pets on app start
      setUserPets([]);
    } catch (err) {
      console.error('Error loading user pets:', err);
      setError('Hayvanlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const addPet = async (petData: Omit<Pet, 'id' | 'createdAt'>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock implementation - replace with actual API call
      const newPet: Pet = {
        ...petData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      setUserPets(prev => [...prev, newPet]);
      console.log('Pet added:', newPet);
    } catch (err) {
      console.error('Error adding pet:', err);
      setError('Hayvan eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const updatePet = async (id: string, petData: Partial<Pet>) => {
    try {
      setLoading(true);
      setError(null);
      
      setUserPets(prev => 
        prev.map(pet => 
          pet.id === id ? { ...pet, ...petData } : pet
        )
      );
      
      console.log('Pet updated:', id, petData);
    } catch (err) {
      console.error('Error updating pet:', err);
      setError('Hayvan güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const deletePet = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      setUserPets(prev => prev.filter(pet => pet.id !== id));
      console.log('Pet deleted:', id);
    } catch (err) {
      console.error('Error deleting pet:', err);
      setError('Hayvan silinirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const refreshPets = async () => {
    await loadUserPets();
  };

  useEffect(() => {
    loadUserPets();
  }, []);

  const value: PetContextType = {
    userPets,
    loading,
    error,
    loadUserPets,
    addPet,
    updatePet,
    deletePet,
    refreshPets,
  };

  return (
    <PetContext.Provider value={value}>
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  const context = useContext(PetContext);
  if (context === undefined) {
    throw new Error('usePet must be used within a PetProvider');
  }
  return context;
}
