import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { MessageCircle, MapPin, X, Heart, Users, SkipForward, Info, Calendar, PawPrint, Tag } from 'lucide-react-native';
import { Match, Pet } from '@/types';
import { apiService } from '@/services/api';
import { usePet } from '@/contexts/PetContext'; // Pet context'i import et
import { useTheme } from '@/contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

interface MatchWithPet extends Match {
  matchedPet: Pet;
}

type TabType = 'matches' | 'likes' | 'passes';

const PetDetailModal = ({ pet, visible, onClose, theme }: { pet: Pet | null, visible: boolean, onClose: () => void, theme: any }) => {
  if (!pet) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
          <ScrollView>
            <Image 
            source={{ uri: pet.photos[0] || '' }} 
            style={styles.modalImage}
          />
            <Text style={[styles.modalPetName, { color: theme.colors.text }]}>{pet.name}</Text>
            <Text style={[styles.modalPetBreed, { color: theme.colors.textSecondary }]}>{pet.breed}</Text>
            
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>Detaylar</Text>
              <View style={styles.detailRow}>
                <PawPrint size={18} color={theme.colors.primary} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>Tür: {pet.species === 'cat' ? 'Kedi' : 'Köpek'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Tag size={18} color={theme.colors.primary} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>Cins: {pet.breed}</Text>
              </View>
              <View style={styles.detailRow}>
                <Calendar size={18} color={theme.colors.primary} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>Yaş: {pet.birthDate ? Math.floor((new Date().getTime() - new Date(pet.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : '?'} yaşında</Text>
              </View>
              <View style={styles.detailRow}>
                <Heart size={18} color={theme.colors.primary} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>Cinsiyet: {pet.gender === 'male' ? 'Erkek' : 'Dişi'}</Text>
              </View>
            </View>

            {pet.description && (
              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>Açıklama</Text>
                <Text style={[styles.modalDescription, { color: theme.colors.textSecondary }]}>{pet.description}</Text>
              </View>
            )}
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function MatchesScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const { userPets, selectedPetId } = usePet();
  const [matches, setMatches] = useState<MatchWithPet[]>([]);
  const [likes, setLikes] = useState<Pet[]>([]);
  const [passes, setPasses] = useState<Pet[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('matches');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPetForDetails, setSelectedPetForDetails] = useState<Pet | null>(null);

  useEffect(() => {
    // Eşleşmeler sekmesine gelince ilk sekme (matches) seçilsin
    setActiveTab('matches');
  }, []);

  // Sekme değişiminde verileri yenile
  useEffect(() => {
    console.log('Matches: useEffect çağrıldı - selectedPetId:', selectedPetId, 'activeTab:', activeTab);
    if (selectedPetId) {
      const fetchData = async () => {
        setLoading(true);
        try {
          switch (activeTab) {
            case 'matches':
              console.log('Matches: getMatches çağrılıyor - selectedPetId:', selectedPetId);
              const matchData = await apiService.getMatches(selectedPetId);
              console.log('Matches: getMatches yanıtı:', matchData);
              const matchesWithPets = matchData
                .filter(match => match.otherPet && match.chatId > 0)
                .map(match => ({
                  ...match,
                  matchedPet: match.otherPet || {
                    id: 'unknown',
                    name: 'Bilinmeyen Hayvan',
                    breed: 'Bilinmiyor',
                    age: 0,
                    gender: 'male',
                    photos: [],
                    location: '',
                    description: ''
                  }
                }));
              console.log('Matches: Filtrelenmiş eşleşmeler:', matchesWithPets);
              setMatches(matchesWithPets);
              break;
            
            case 'likes':
              const likedPets = await apiService.getLikedPets(selectedPetId);
              setLikes(likedPets);
              break;
            
            case 'passes':
              const passedPets = await apiService.getPassedPets(selectedPetId);
              setPasses(passedPets);
              break;
            
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          // Hata durumunda boş array set et
          switch (activeTab) {
            case 'matches':
              setMatches([]);
              break;
            case 'likes':
              setLikes([]);
              break;
            case 'passes':
              setPasses([]);
              break;
          }
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [activeTab, selectedPetId]);


  const loadData = () => {
    // Artık useEffect içindeki fetchData fonksiyonu kullanılıyor
  };

  const handleRemoveFromList = async (petIdToRemove: string, listType: 'likes' | 'passes') => {
    if (!selectedPetId) {
      console.error('Aktif pet ID bulunamadı, işlem iptal edildi.');
      return;
    }
    
    // Eşleşme varsa uyarı ver
    const existingMatch = matches.find(match => match.matchedPetId === petIdToRemove);
    if (existingMatch) {
      Alert.alert(
        'Eşleşme Silinecek',
        'Bu hayvanla eşleşmeniz var. Beğeniyi kaldırırsanız eşleşme ve sohbet de silinecek. Devam etmek istiyor musunuz?',
        [
          {
            text: 'İptal',
            style: 'cancel'
          },
          {
            text: 'Sil',
            style: 'destructive',
            onPress: async () => {
              try {
                // Önce eşleşmeyi sil
                await apiService.deleteMatch(existingMatch.id);
                // Sonra beğeniyi kaldır
                await apiService.unlikePet(selectedPetId, petIdToRemove);
                
                // State'leri güncelle
                setMatches(prev => prev.filter(match => match.id !== existingMatch.id));
                setLikes(prev => prev.filter(pet => pet.id !== petIdToRemove));
              } catch (error) {
                console.error('Error removing match and like:', error);
                Alert.alert('Hata', 'İşlem sırasında bir hata oluştu');
              }
            }
          }
        ]
      );
      return;
    }
    
    try {
      if (listType === 'likes') {
        await apiService.unlikePet(selectedPetId, petIdToRemove);
        setLikes(prev => prev.filter(pet => pet.id !== petIdToRemove));
      } else {
        await apiService.unpassPet(selectedPetId, petIdToRemove);
        setPasses(prev => prev.filter(pet => pet.id !== petIdToRemove));
      }
    } catch (error) {
      console.error(`Error removing from ${listType} list:`, error);
    }
  };

  const handleChatPress = (match: MatchWithPet) => {
    console.log('Chat açılıyor:', match.matchedPet.name, 'Chat ID:', match.chatId);
    if (match.chatId) {
      router.push(`/chat/${match.chatId}`);
    } else {
      Alert.alert('Hata', 'Sohbet ID bulunamadı');
    }
  };

  const handleDetailsPress = (pet: Pet) => {
    setSelectedPetForDetails(pet);
    setModalVisible(true);
  };

  const renderMatch = ({ item }: { item: MatchWithPet }) => (
    <View style={styles.itemCard}>
      <Image 
        source={{ uri: item.matchedPet.photos[0] || '' }} 
        style={styles.petImage}
      />
      
      <View style={styles.itemInfo}>
        <Text>
          <Text style={styles.petName}>{item.matchedPet.name}</Text>{'\n'}
          <Text style={styles.petBreed}>{item.matchedPet.breed}</Text>{'\n'}
          <Text style={styles.petDetails}>
            {item.matchedPet.age} yaşında • {item.matchedPet.gender === 'male' ? 'Erkek' : 'Dişi'}
          </Text>
        </Text>
        
        {item.matchedPet.location && (
          <View style={styles.locationContainer}>
            <MapPin size={14} color="#6B7280" />
            <Text style={styles.locationText}>{item.matchedPet.location}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => handleDetailsPress(item.matchedPet)}
          style={[styles.smallActionButton, styles.infoButton]}
        >
          <LinearGradient
            colors={['#10B981', '#059669']}
            style={styles.smallActionButtonGradient}
          >
            <Info size={16} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => handleChatPress(item)}
          style={styles.actionButton}
        >
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.actionButtonGradient}
          >
            <MessageCircle size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderInteractiveItem = ({ item, type }: { item: Pet, type: 'likes' | 'passes' }) => {
    return (
      <TouchableOpacity onPress={() => handleDetailsPress(item)} activeOpacity={0.8} style={styles.itemCard}>
        <Image 
          source={{ uri: item.photos[0] || '' }} 
          style={styles.petImage}
        />
        
        <View style={styles.itemInfo}>
          <Text>
            <Text style={styles.petName}>{item.name}</Text>{'\n'}
            <Text style={styles.petBreed}>{item.breed}</Text>{'\n'}
            <Text style={styles.petDetails}>
              {item.birthDate ? Math.floor((new Date().getTime() - new Date(item.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : '?'} yaşında • {item.gender === 'male' ? 'Erkek' : 'Dişi'}
            </Text>
          </Text>
          
          {item.location && (
            <View style={styles.locationContainer}>
              <MapPin size={14} color="#6B7280" />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => handleDetailsPress(item)}
            style={[styles.smallActionButton, styles.infoButton]}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.smallActionButtonGradient}
            >
              <Info size={16} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation(); // Kartın tıklama olayını tetiklemesini engelle
              handleRemoveFromList(item.id, type);
            }}
            style={[styles.smallActionButton, styles.deleteButton]}
          >
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={styles.smallActionButtonGradient}
            >
              <X size={16} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };


  const getTabData = () => {
    const selectedPet = userPets.find(p => p.id === selectedPetId);
    const petName = selectedPet?.name || 'Seçili hayvan';

    switch (activeTab) {
      case 'matches':
        return { 
          data: matches, 
          renderItem: renderMatch, 
          emptyTitle: `${petName} için henüz eşleşme yok`,
          emptySubtitle: 'Keşfet sekmesinde yeni dostluklara yelken aç!'
        };
      case 'likes':
        return { 
          data: likes, 
          renderItem: ({ item }: { item: Pet }) => renderInteractiveItem({ item, type: 'likes' }),
          emptyTitle: `${petName} için henüz beğeni yok`,
          emptySubtitle: 'Keşfet sekmesine gidip hemen bir göz atın.'
        };
      case 'passes':
        return { 
          data: passes, 
          renderItem: ({ item }: { item: Pet }) => renderInteractiveItem({ item, type: 'passes' }),
          emptyTitle: `${petName} için henüz geçilen yok`,
          emptySubtitle: 'Unutma, her zaman geri dönebilirsin!'
        };
    }
  };

  const getTabCount = (tab: TabType) => {
    switch (tab) {
      case 'matches':
        return matches.length;
      case 'likes':
        return likes.length;
      case 'passes':
        return passes.length;
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={theme.colors.gradient} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Yükleniyor...</Text>
      </LinearGradient>
    );
  }

  const { data, renderItem, emptyTitle, emptySubtitle } = getTabData();

  return (
    <LinearGradient colors={theme.colors.gradient} style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <PetDetailModal 
        pet={selectedPetForDetails}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        theme={theme}
      />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Etkileşimlerim</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'matches' && styles.activeTab]}
          onPress={() => {
            setActiveTab('matches');
            console.log('🔍 DEBUG: Matches sekmesi seçildi, veriler yenileniyor...');
          }}
        >
          <Users size={16} color={activeTab === 'matches' ? '#FFFFFF' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'matches' && styles.activeTabText]}>
            Eşleşmelerim
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'likes' && styles.activeTab]}
          onPress={() => {
            setActiveTab('likes');
            console.log('🔍 DEBUG: Likes sekmesi seçildi, veriler yenileniyor...');
          }}
        >
          <Heart size={16} color={activeTab === 'likes' ? '#FFFFFF' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'likes' && styles.activeTabText]}>
            Beğendiklerim
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'passes' && styles.activeTab]}
          onPress={() => {
            setActiveTab('passes');
            console.log('🔍 DEBUG: Passes sekmesi seçildi, veriler yenileniyor...');
          }}
        >
          <SkipForward size={16} color={activeTab === 'passes' ? '#FFFFFF' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'passes' && styles.activeTabText]}>
            Geçtiklerim
          </Text>
        </TouchableOpacity>

      </View>

      {data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>{emptyTitle}</Text>
          <Text style={styles.emptySubtitle}>
            {emptySubtitle}
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, index) => 'matchedPet' in item ? item.id : `${item.id}-${index}`}
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
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeTab: {
    backgroundColor: '#6366F1',
  },
  tabText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  itemCard: {
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
    minHeight: 100,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  placeholderImage: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 14, // Slightly smaller
    color: '#6B7280',
    lineHeight: 20, // Add line height for spacing
  },
  petDetails: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  actionButton: {
    borderRadius: 999, // Make it a circle
    overflow: 'hidden',
    width: 40, // Smaller size
    height: 40, // Smaller size
  },
  actionButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 12,
    paddingVertical: 8,
  },
  smallActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  smallActionButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButton: {
    // Info butonu için özel stil
  },
  deleteButton: {
    backgroundColor: '#EF4444', // Kırmızı
  },
  removeButton: {
    width: 48,
    height: 48,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#1F2937',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
  },
  swipeableContainer: {
    position: 'relative',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '75%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
  },
  modalImage: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    marginBottom: 16,
  },
  modalPetName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalPetBreed: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    marginLeft: 12,
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  // Chat Styles
  chatCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
  chatImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  chatTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  chatLastMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});