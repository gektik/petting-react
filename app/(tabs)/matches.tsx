import React, { useState, useEffect } from 'react';
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
  Dimensions, // Eksik import'u ekle
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

// SwipeableItem component for swipe-to-delete functionality
const SwipeableItem = ({ children, onDelete, theme }: { 
  children: React.ReactNode; 
  onDelete: () => void; 
  theme: any;
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -screenWidth * 0.3) {
          // Swipe threshold reached, delete item
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: -screenWidth,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onDelete();
          });
        } else {
          // Return to original position
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.swipeableContainer,
        {
          transform: [{ translateX }],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      {children}
      <View style={[styles.deleteBackground, { backgroundColor: theme.colors.error }]}>
        <X size={24} color="#FFFFFF" />
      </View>
    </Animated.View>
  );
};

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
            <Image source={{ uri: pet.photos[0] }} style={styles.modalImage} />
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
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>Yaş: {pet.age} yaşında</Text>
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
    const fetchData = async () => {
      if (!selectedPetId) {
        console.log('Aktif pet seçilmedi, veri çekilemiyor.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        switch (activeTab) {
          case 'matches':
            const matchData = await apiService.getMatches(selectedPetId);
            console.log('Matches data:', matchData);
            const matchesWithPets = matchData
              .filter(match => match.matchedPet && match.status === 'matched')
              .map(match => ({
                ...match,
                matchedPet: match.matchedPet
              }));
            console.log('Processed matches:', matchesWithPets);
            setMatches(matchesWithPets);
            break;
          
          case 'likes':
            const likedPets = await apiService.getLikedPets(selectedPetId);
            console.log('Liked pets:', likedPets);
            setLikes(likedPets);
            break;
          
          case 'passes':
            const passedPets = await apiService.getPassedPets(selectedPetId);
            console.log('Passed pets:', passedPets);
            setPasses(passedPets);
            break;
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, selectedPetId]); // activeTab veya selectedPetId değiştiğinde verileri yeniden yükle

  const loadData = () => {
    // Artık useEffect içindeki fetchData fonksiyonu kullanılıyor
  };

  const handleRemoveFromList = async (petIdToRemove: string, listType: 'likes' | 'passes') => {
    if (!selectedPetId) {
      console.error('Aktif pet ID bulunamadı, işlem iptal edildi.');
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
    console.log('Chat açılıyor:', match.matchedPet.name);
    router.push('/(tabs)/chats');
  };

  const handleDetailsPress = (pet: Pet) => {
    setSelectedPetForDetails(pet);
    setModalVisible(true);
  };

  const renderMatch = ({ item }: { item: MatchWithPet }) => (
    <View style={styles.itemCard}>
      <Image source={{ uri: item.matchedPet.photos[0] }} style={styles.petImage} />
      
      <View style={styles.itemInfo}>
        <Text style={styles.petName}>{item.matchedPet.name}</Text>
        <Text style={styles.petBreed}>{item.matchedPet.breed}</Text>
        
        <View style={styles.petDetails}>
          <Text style={styles.petAge}>{item.matchedPet.age} yaşında</Text>
          <Text style={styles.petGender}>
            {item.matchedPet.gender === 'male' ? 'Erkek' : 'Dişi'}
          </Text>
        </View>
        
        {item.matchedPet.location && (
          <View style={styles.locationContainer}>
            <MapPin size={14} color="#6B7280" />
            <Text style={styles.locationText}>{item.matchedPet.location}</Text>
          </View>
        )}
      </View>
      
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
  );

  const renderInteractiveItem = ({ item, type }: { item: Pet, type: 'likes' | 'passes' }) => {
    return (
      <TouchableOpacity onPress={() => handleDetailsPress(item)} activeOpacity={0.8} style={styles.itemCard}>
        <Image source={{ uri: item.photos[0] }} style={styles.petImage} />
        
        <View style={styles.itemInfo}>
          <Text style={styles.petName}>{item.name}</Text>
          <Text style={styles.petBreed}>{item.breed}</Text>
          
          <View style={styles.petDetails}>
            <Text style={styles.petAge}>{item.age} yaşında</Text>
            <Text style={styles.petGender}>
              {item.gender === 'male' ? 'Erkek' : 'Dişi'}
            </Text>
          </View>
          
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
            <Info size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation(); // Kartın tıklama olayını tetiklemesini engelle
              handleRemoveFromList(item.id, type);
            }}
            style={[styles.smallActionButton, styles.deleteButton]}
          >
            <X size={20} color="#FFFFFF" />
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
          onPress={() => setActiveTab('matches')}
        >
          <Users size={16} color={activeTab === 'matches' ? '#FFFFFF' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'matches' && styles.activeTabText]}>
            Eşleşmelerim
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'likes' && styles.activeTab]}
          onPress={() => setActiveTab('likes')}
        >
          <Heart size={16} color={activeTab === 'likes' ? '#FFFFFF' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'likes' && styles.activeTabText]}>
            Beğendiklerim
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'passes' && styles.activeTab]}
          onPress={() => setActiveTab('passes')}
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
    marginBottom: 6,
  },
  petDetails: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  petAge: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 12,
  },
  petGender: {
    fontSize: 12,
    color: '#6B7280',
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
    flexDirection: 'row', // Butonları yan yana getir
    alignItems: 'center',
  },
  smallActionButton: {
    width: 44, // Butonları büyüt
    height: 44, // Butonları büyüt
    borderRadius: 22, // Tam daire yap
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5, // Aralarına boşluk koy
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  infoButton: {
    backgroundColor: '#3B82F6', // Mavi
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
});