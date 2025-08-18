import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, CreditCard as Edit, Trash2, Plus } from 'lucide-react-native';
import { Pet } from '@/types';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function MyPetsScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        loadMyPets();
      } else {
        router.replace('/auth/login');
      }
    }
  }, [isAuthenticated, isLoading]);

  // Sayfa odaklandığında listeyi yenile (düzenleme sonrası için)
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated && !isLoading) {
        loadMyPets();
      }
    }, [isAuthenticated, isLoading])
  );

  const loadMyPets = async () => {
    try {
      console.log('Loading user pets...');
      const userPets = await apiService.getUserPets();
      console.log('API pets data:', userPets);
      
      // API verisini Pet tipine dönüştür
      const convertedPets: Pet[] = userPets.map((apiPet: any) => ({
        id: apiPet.petID.toString(),
        name: apiPet.name,
        species: apiPet.petTypeName.toLowerCase() === 'kedi' ? 'cat' : 'dog',
        breed: apiPet.breedName,
        age: apiPet.age || 0,
        gender: apiPet.gender === 0 ? 'female' : 'male',
        neutered: apiPet.isNeutered,
        photos: apiPet.profilePictureURL ? [apiPet.profilePictureURL] : ['https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400'],
        description: apiPet.description || '',
        color: apiPet.color || 'Bilinmiyor',
        ownerId: apiPet.userID,
        isActive: apiPet.isActiveForMatching,
        location: 'Türkiye',
        createdAt: apiPet.createdDate,
      }));
      
      setPets(convertedPets);
      console.log('Converted pets:', convertedPets);
    } catch (error) {
      console.error('Error loading pets:', error);
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPet = (pet: Pet) => {
    console.log('Editing pet:', pet.name, 'ID:', pet.id);
    router.push(`/edit-pet/${pet.id}`);
  };

  const handleDeletePet = (pet: Pet) => {
    Alert.alert(
      'Hayvanı Sil',
      `${pet.name} adlı hayvanı silmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting pet:', pet.name, 'ID:', pet.id);
              await apiService.deletePet(pet.id);
              setPets(prevPets => prevPets.filter(p => p.id !== pet.id));
              Alert.alert('Başarılı', `${pet.name} başarıyla silindi.`);
            } catch (error) {
              console.error('Delete pet error:', error);
              const errorMessage = error instanceof Error ? error.message : 'Hayvan silinirken bir hata oluştu.';
              Alert.alert(
                'Silme Hatası',
                errorMessage,
                [
                  { text: 'Tamam', style: 'default' },
                  { text: 'Tekrar Dene', onPress: () => handleDeletePet(pet), style: 'cancel' }
                ]
              );
            }
          },
        },
      ]
    );
  };

  const handleAddPet = () => {
    Alert.alert('Yeni Hayvan', 'Hayvan ekleme özelliği yakında gelecek.');
  };

  const renderPet = ({ item }: { item: Pet }) => (
    <TouchableOpacity 
      style={styles.petCard}
      onPress={() => handleEditPet(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.photos[0] }} style={styles.petImage} />
      
      <TouchableOpacity 
        style={styles.petInfo}
        onPress={() => handleEditPet(item)}
        activeOpacity={1}
      >
        <Text style={styles.petName}>{item.name}</Text>
        <Text style={styles.petBreed}>{item.breed}</Text>
        <Text style={styles.petDetails}>
          {item.age} yaşında • {item.gender === 'male' ? 'Erkek' : 'Dişi'}
        </Text>
        {item.description && (
          <Text style={styles.petDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.petActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEditPet(item)}
        >
          <Edit size={18} color="#6366F1" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeletePet(item)}
        >
          <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#F8FAFC', '#E2E8F0']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Hayvanlarınız yükleniyor...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#F8FAFC', '#E2E8F0']} style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hayvanlarım</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPet}
        >
          <Plus size={24} color="#6366F1" />
        </TouchableOpacity>
      </View>

      {pets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Henüz hayvanınız yok</Text>
          <Text style={styles.emptySubtitle}>
            İlk hayvanınızı ekleyerek başlayın!
          </Text>
          <TouchableOpacity
            style={styles.addPetButton}
            onPress={handleAddPet}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.addPetGradient}
            >
              <Plus size={24} color="#FFFFFF" />
              <Text style={styles.addPetText}>Hayvan Ekle</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={pets}
          renderItem={renderPet}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  petCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
    marginBottom: 4,
  },
  petDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  petDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  petActions: {
    flexDirection: 'column',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#F0F4FF',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  addPetButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  addPetGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  addPetText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});