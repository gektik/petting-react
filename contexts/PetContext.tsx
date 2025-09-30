import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { apiService } from '@/services/api';
import { useAuth } from './AuthContext'; // AuthContext'i import et
import { Pet } from '@/types'; // Pet interface'ini types'dan import et

interface PetContextType {
  userPets: Pet[];
  selectedPetId: string | null;
  selectedPet: Pet | null;
  loading: boolean;
  error: string | null;
  loadUserPets: () => Promise<void>;
  selectPet: (petId: string, callback?: () => void) => void;
  addPet: (petData: any) => Promise<Pet | undefined>;
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
  const { isAuthenticated, user } = useAuth(); // isAuthenticated ve user durumunu al

  // selectedPet'i hesapla
  const selectedPet = useMemo(() => {
    if (!selectedPetId || userPets.length === 0) return null;
    return userPets.find(pet => pet.id === selectedPetId) || null;
  }, [selectedPetId, userPets]);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('PetContext: Kullanıcı değişti, pet verileri yükleniyor...', user.id);
      loadUserPets();
    } else {
      // Kullanıcı giriş yapmamışsa veya çıkış yapmışsa pet verilerini temizle
      console.log('PetContext: Kullanıcı çıkış yaptı, pet verileri temizleniyor...');
      setUserPets([]);
      setSelectedPetId(null);
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]); // isAuthenticated VE user.id değiştiğinde çalışsın

  const loadUserPets = async (retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 saniye
    
    try {
      setLoading(true);
      setError(null);
      console.log(`PetContext: Kullanıcının hayvanları yükleniyor... (Deneme ${retryCount + 1}/${maxRetries + 1})`, user?.id);
      
      // Önce mevcut verileri temizle (sadece userPets, selectedPetId'yi koru)
      setUserPets([]);
      // setSelectedPetId(null); // KALDIRILDI - seçili pet korunacak
      
      const pets = await apiService.getUserPets();
      console.log('PetContext: Yüklenen hayvanlar:', pets);
      
      // Duplicate ID'leri temizle
      const uniquePets = pets.filter((pet, index, self) => 
        index === self.findIndex(p => p.id === pet.id)
      );
      console.log('PetContext: Duplicate temizlendi, benzersiz hayvanlar:', uniquePets.length);
      
      setUserPets(uniquePets);

      // Eğer petler yüklendiyse ve henüz bir pet seçilmediyse, ilkini seç
      if (uniquePets.length > 0) {
        // Eğer seçili pet hala listede varsa onu koru, yoksa ilkini seç
        const currentSelectedPetIsValid = uniquePets.some(p => p.id === selectedPetId);
        if (!currentSelectedPetIsValid) {
          console.log(`PetContext: İlk hayvan seçildi: ${uniquePets[0].name}`);
          setSelectedPetId(uniquePets[0].id);
        } else {
          console.log(`PetContext: Mevcut seçim korunuyor: ${selectedPetId}`);
        }
      } else {
        // Hiç pet yoksa seçimi temizle
        console.log('PetContext: Hiç pet yok, seçim temizleniyor');
        setSelectedPetId(null);
      }
    } catch (err) {
      console.error('PetContext: Hayvanlar yüklenirken hata oluştu:', err);
      console.error('PetContext: Hata detayları:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url,
        isNetworkError: !err.response,
        fullError: err
      });
      
      // Hata türüne göre farklı mesajlar
      let errorMessage = 'Hayvanlar yüklenirken bir hata oluştu.';
      if (err.response?.status === 401) {
        errorMessage = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
      } else if (!err.response) {
        errorMessage = 'İnternet bağlantınızı kontrol edin.';
      }
      
      setError(errorMessage);
      
      // Retry mekanizması - sadece 500 ve network hatalarında retry yap
      if (retryCount < maxRetries && (err.response?.status >= 500 || !err.response)) {
        console.log(`PetContext: ${retryDelay}ms sonra tekrar denenecek... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          loadUserPets(retryCount + 1);
        }, retryDelay);
        return;
      }
      
      // Hata durumunda mevcut petleri ve seçimi koru
      // Sadece hiç pet yoksa seçimi temizle
      if (userPets.length === 0) {
        console.log('PetContext: Hata durumunda seçim temizleniyor (hiç pet yok)');
        setSelectedPetId(null);
      } else {
        console.log('PetContext: Hata durumunda mevcut seçim korunuyor:', selectedPetId);
      }
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
  
  const addPet = async (petData: any) => {
    try {
      setLoading(true);
      setError(null);
      const newPet = await apiService.createPet(petData);
      console.log('PetContext: Yeni hayvan eklendi:', newPet);
      
      // Yeni pet'i listeye ekle (duplicate kontrolü ile)
      setUserPets(prev => {
        // Önce duplicate kontrolü yap
        const existingPet = prev.find(p => p.id === newPet.id);
        if (existingPet) {
          console.log('PetContext: Pet zaten mevcut, güncelleniyor:', newPet.id);
          return prev.map(p => p.id === newPet.id ? newPet : p);
        }
        
        const updatedPets = [...prev, newPet];
        // Son bir kez duplicate temizleme yap
        const uniquePets = updatedPets.filter((pet, index, self) => 
          index === self.findIndex(p => p.id === pet.id)
        );
        console.log('PetContext: Güncellenmiş pet listesi:', uniquePets.length, 'hayvan (duplicate temizlendi)');
        return uniquePets;
      });
      
      // Yeni eklenen pet'i seç (eğer hiç pet yoksa veya seçili pet yoksa)
      if (!selectedPetId || userPets.length === 0) {
        console.log('PetContext: Yeni eklenen pet seçiliyor:', newPet.id);
        setSelectedPetId(newPet.id);
      }
      
      return newPet;
    } catch (err) {
      console.error('PetContext: Hayvan eklenirken hata oluştu:', err);
      setError('Hayvan eklenirken bir hata oluştu.');
      throw err; // Hata fırlat ki add-pet.tsx'te yakalansın
    } finally {
      setLoading(false);
    }
  };
  
  const updatePet = async (id: string, petData: Partial<Pet>) => {
    try {
      setLoading(true);
      setError(null);
      console.log('PetContext: Pet güncelleniyor:', id, 'Mevcut selectedPetId:', selectedPetId);
      
      await apiService.updatePet(id, petData);
      setUserPets(prev => 
        prev.map(pet => 
          pet.id === id ? { ...pet, ...petData } : pet
        )
      );
      
      // Seçili pet güncellendiyse, seçimi koru
      if (selectedPetId === id) {
        console.log('PetContext: Seçili pet güncellendi, seçim korunuyor:', id);
        // selectedPetId zaten aynı kalacak, sadece log
      } else {
        console.log('PetContext: Farklı pet güncellendi, seçim değişmedi:', selectedPetId);
      }
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

  // Offline durumunda boş array döndür
  const getOfflinePets = (): Pet[] => {
    console.log('PetContext: Offline modda boş pet listesi döndürülüyor');
    return [];
  };

  const value = {
    userPets,
    selectedPetId,
    selectedPet,
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
