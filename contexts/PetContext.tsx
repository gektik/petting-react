import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/services/api';
import { useAuth } from './AuthContext'; // AuthContext'i import et

export interface Pet {
  id: string;
  name: string;
  species: 'cat' | 'dog' | 'other';
  breed: string;
  age: number;
  gender: 'male' | 'female';
  neutered: boolean;
  photos: string[];
  description: string;
  color: string;
  ownerId: string;
  isActive: boolean;
  location: string;
  createdAt: string;
  birthDate?: string;
}

interface PetContextType {
  userPets: Pet[];
  selectedPetId: string | null;
  loading: boolean;
  error: string | null;
  loadUserPets: () => Promise<void>;
  selectPet: (petId: string, callback?: () => void) => void;
  addPet: (petData: FormData) => Promise<Pet | undefined>;
  updatePet: (id: string, petData: Partial<Pet>) => Promise<void>;
  deletePet: (id: string) => Promise<void>;
  refreshPets: () => Promise<void>;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

interface PetProviderProps {
  children: ReactNode;
}

export function PetProvider({ children }: PetProviderProps) {
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Başlangıçta false yap
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth(); // isAuthenticated durumunu al

  useEffect(() => {
    if (isAuthenticated) {
      loadUserPets();
    } else {
      // Kullanıcı giriş yapmamışsa veya çıkış yapmışsa pet verilerini temizle
      setUserPets([]);
      setSelectedPetId(null);
      setLoading(false);
    }
  }, [isAuthenticated]); // Sadece isAuthenticated değiştiğinde çalışsın

  const loadUserPets = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('PetContext: Kullanıcının hayvanları yükleniyor...');
      const pets = await apiService.getUserPets();
      console.log('PetContext: Yüklenen hayvanlar:', pets);
      setUserPets(pets);

      // Eğer petler yüklendiyse ve henüz bir pet seçilmediyse, ilkini seç
      if (pets.length > 0) {
        // Eğer seçili pet hala listede varsa onu koru, yoksa ilkini seç
        const currentSelectedPetIsValid = pets.some(p => p.id === selectedPetId);
        if (!currentSelectedPetIsValid) {
          console.log(`PetContext: İlk hayvan seçildi: ${pets[0].name}`);
          setSelectedPetId(pets[0].id);
        }
      } else {
        // Hiç pet yoksa seçimi temizle
        setSelectedPetId(null);
      }
    } catch (err) {
      console.error('PetContext: Hayvanlar yüklenirken hata oluştu:', err);
      setError('Hayvanlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const selectPet = (petId: string, callback?: () => void) => {
    console.log(`PetContext: Hayvan seçildi: ${petId}`);
    setSelectedPetId(petId);
    // State güncellemesi sonrası callback'i çalıştır
    if (callback) {
      setTimeout(callback, 0);
    }
  };
  
  const addPet = async (petData: FormData) => {
    try {
      setLoading(true);
      setError(null);
      const newPet = await apiService.createPet(petData);
      setUserPets(prev => [...prev, newPet]);
      return newPet;
    } catch (err) {
      console.error('PetContext: Hayvan eklenirken hata oluştu:', err);
      setError('Hayvan eklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  const updatePet = async (id: string, petData: Partial<Pet>) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.updatePet(id, petData);
      setUserPets(prev => 
        prev.map(pet => 
          pet.id === id ? { ...pet, ...petData } : pet
        )
      );
    } catch (err) {
      console.error('PetContext: Hayvan güncellenirken hata oluştu:', err);
      setError('Hayvan güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const deletePet = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await apiService.deletePet(id);
      setUserPets(prev => prev.filter(pet => pet.id !== id));
      // Eğer silinen pet seçili olan ise, seçimi temizle veya başka bir pet seç
      if (selectedPetId === id) {
        const remainingPets = userPets.filter(p => p.id !== id);
        if (remainingPets.length > 0) {
          setSelectedPetId(remainingPets[0].id);
        } else {
          setSelectedPetId(null);
        }
      }
    } catch (err) {
      console.error('PetContext: Hayvan silinirken hata oluştu:', err);
      setError('Hayvan silinirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const refreshPets = async () => {
    await loadUserPets();
  };

  const value = {
    userPets,
    selectedPetId,
    loading,
    error,
    loadUserPets,
    selectPet,
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
