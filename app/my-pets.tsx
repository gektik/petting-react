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
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, Pencil, Trash2, Plus } from 'lucide-react-native';
import { Pet } from '@/types';
import { apiService } from '@/services/api';
import { mockPets } from '@/services/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function MyPetsScreen() {
  const { theme, isDark } = useTheme();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        loadMyPets();
      } else {
        router.replace('/auth/login');
      }
    }
  }, [isAuthenticated, isLoading, user]);

  // Sayfa odaklandığında listeyi yenile (düzenleme sonrası için)
  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated && !isLoading && user) {
        console.log('My Pets: Sayfa odaklandı, pet listesi yenileniyor...');
        loadMyPets();
      }
    }, [isAuthenticated, isLoading, user])
  );

  const loadMyPets = async () => {
    try {
      console.log('Loading user pets...');
      
      // Check if token exists before making API call
      const hasToken = await apiService.getToken();
      if (!hasToken) {
        console.log('No token found, skipping pet loading');
        setPets([]);
        setLoading(false);
        return;
      }
      
      let petsToDisplay: Pet[];
      
      if (Platform.OS === 'web') {
        // Web platformunda mock data kullan
        await new Promise(resolve => setTimeout(resolve, 1000)); // Network delay simülasyonu
        petsToDisplay = mockPets;
        console.log('Using mock pets for web platform:', petsToDisplay);
      } else {
        // Native platformlarda API çağrısı yap
        petsToDisplay = await apiService.getUserPets();
        console.log('API pets data:', petsToDisplay);
        console.log('Pet photos URLs:', petsToDisplay.map(p => ({ name: p.name, photo: p.photos[0] })));
      }
      
      setPets(petsToDisplay);
      console.log('Final pets data:', petsToDisplay);
    } catch (error) {
      // Suppress 401 errors as they are handled by AuthContext
      if (!(error?.response && error.response.status === 401)) {
        console.error('Error loading pets:', error);
      }
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
    console.log('Yeni hayvan ekleme sayfasına yönlendiriliyor...');
    router.push('/add-pet');
  };

  const handleDeletePhoto = async (pet: Pet) => {
    Alert.alert(
      'Fotoğrafı Sil',
      `${pet.name} adlı hayvanın fotoğrafını silmek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting photo for pet:', pet.name, 'ID:', pet.id);
              // API'ye fotoğraf silme isteği gönder
              await apiService.deletePetPhoto(pet.id);
              
              // Local state'i güncelle - fotoğrafı kaldır
              setPets(prevPets => 
                prevPets.map(p => 
                  p.id === pet.id 
                    ? { ...p, photos: [] }
                    : p
                )
              );
              
              Alert.alert('Başarılı', `${pet.name} adlı hayvanın fotoğrafı silindi.`);
            } catch (error) {
              console.error('Delete photo error:', error);
              const errorMessage = error instanceof Error ? error.message : 'Fotoğraf silinirken bir hata oluştu.';
              Alert.alert('Silme Hatası', errorMessage);
            }
          },
        },
      ]
    );
  };

  const renderPet = ({ item }: { item: Pet }) => (
    <TouchableOpacity 
      style={styles.petCard}
      onPress={() => handleEditPet(item)}
      activeOpacity={0.7}
    >
      <Image 
        source={
          item.photos && item.photos.length > 0 && item.photos[0] 
            ? { uri: item.photos[0] } 
            : item.species === 'cat' 
              ? require('@/assets/images/kedi2.png')
              : require('@/assets/images/kopek2.png')
        }
        style={styles.petImage}
        onError={(error) => {
          console.log('My Pets: Resim yükleme hatası:', error.nativeEvent.error);
          console.log('My Pets: Hatalı URL:', item.photos[0]);
        }}
        onLoad={() => {
          console.log('My Pets: Resim başarıyla yüklendi:', item.photos[0]);
        }}
      />
      
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
          <Pencil size={18} color="#6366F1" />
        </TouchableOpacity>
        
        {item.photos && item.photos.length > 0 && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deletePhotoButton]}
            onPress={() => handleDeletePhoto(item)}
          >
            <Trash2 size={18} color="#F59E0B" />
          </TouchableOpacity>
        )}
        
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
      <LinearGradient colors={theme.colors.gradient} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Hayvanlarınız yükleniyor...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={theme.colors.gradient} style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Hayvanlarım</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.surface }]}
          onPress={handleAddPet}
        >
          <Plus size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {pets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Henüz hayvanınız yok</Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
            İlk hayvanınızı ekleyerek başlayın!
          </Text>
          <TouchableOpacity
            style={styles.addPetButton}
            onPress={handleAddPet}
          >
            <LinearGradient
              colors={theme.colors.headerGradient}
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
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
  deletePhotoButton: {
    backgroundColor: '#FFFBEB',
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
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
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