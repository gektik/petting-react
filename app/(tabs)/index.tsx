import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { ChevronDown, User, Filter, Menu, Plus, Heart, X } from 'lucide-react-native';
import { PetCard } from '@/components/PetCard';
import { Pet } from '@/types';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { usePet } from '@/contexts/PetContext';
import { useTheme } from '@/contexts/ThemeContext';
// import { NotificationService } from '@/services/notificationService'; // Removed for SDK 54 compatibility

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Filters {
  distance: number;
  // Gelecekte eklenebilecek diğer filtreler
  // species: 'cat' | 'dog' | null;
  // gender: 'male' | 'female' | null;
}

export default function ExploreScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { userPets, selectedPetId, selectPet } = usePet();
  const { theme, isDark } = useTheme();
  
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPetSelector, setShowPetSelector] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [filters, setFilters] = useState<Filters>({ distance: 50 });
  
  const position = useRef(new Animated.ValueXY()).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const drawerAnimation = useRef(new Animated.Value(-300)).current;
  const tutorialLikeAnim = useRef(new Animated.Value(0)).current;
  const tutorialPassAnim = useRef(new Animated.Value(0)).current;

  // Aktif pet'i context'ten al
  const selectedPet = userPets.find(p => p.id === selectedPetId);

  const drawerMenu = [
    {
      title: 'Hayvanlarım',
      onPress: () => { toggleDrawer(); router.push('/my-pets'); },
    },
    {
      title: 'Eşleşmelerim',
      onPress: () => { toggleDrawer(); router.push('/(tabs)/matches'); },
    },
    {
      title: 'Sohbetlerim',
      onPress: () => { toggleDrawer(); router.push('/(tabs)/chats'); },
    },
    {
      title: 'Profil',
      onPress: () => { toggleDrawer(); router.push('/profile'); },
    },
    {
      title: 'Ayarlar',
      onPress: () => { toggleDrawer(); router.push('/settings'); },
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Güvenli Çıkış',
      'Hesabınızdan güvenle çıkmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            try {
              // await logout(); // Removed as per new_code
              router.replace('/welcome');
            } catch (error) {
              console.error('Logout error:', error);
              router.replace('/welcome');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    if (selectedPetId) {
      loadPetsForMatching();
    }
  }, [selectedPetId, filters]); // Filtreler değiştiğinde de yeniden yükle

  useEffect(() => {
    // Bu useEffect sadece animasyon için kalabilir veya kaldırılabilir
    startTutorialAnimation();
  }, []);

  // Removed notification permissions for SDK 54 compatibility

  const startTutorialAnimation = () => {
    const animateSequence = () => {
      Animated.sequence([
        Animated.timing(tutorialLikeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(tutorialLikeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(tutorialPassAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(tutorialPassAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (showTutorial) {
          setTimeout(animateSequence, 1000);
        }
      });
    };
    
    setTimeout(animateSequence, 2000);
  };

  const toggleDrawer = () => {
    const toValue = showDrawer ? -300 : 0;
    Animated.timing(drawerAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setShowDrawer(!showDrawer);
  };

  const loadPetsForMatching = async () => {
    if (!selectedPetId) {
      setPets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // API'ye kullanıcının konumunu ve filtreleri gönder
      const petData = await apiService.getPetsForMatching(selectedPetId, { 
        radiusInKm: filters.distance,
        // Konum servisinden alınacak gerçek user location
        // latitude: user.latitude, 
        // longitude: user.longitude 
      });
      setPets(petData);
    } catch (error) {
      console.error('Error loading pets for matching:', error);
      setPets([]);
    } finally {
      setLoading(false);
      setCurrentIndex(0);
      position.setValue({ x: 0, y: 0 });
      rotation.setValue(0);
    }
  };
  
  const handleSwipeAction = (action: 'like' | 'pass') => {
    const petToInteract = pets[currentIndex];
    if (!petToInteract || !selectedPetId) return;

    // Önce kartı animasyonla gönder
    const xValue = action === 'like' ? screenWidth * 1.5 : -screenWidth * 1.5;
    const rotateValue = action === 'like' ? 1 : -1;

    Animated.timing(position, {
      toValue: { x: xValue, y: 0 },
      duration: 400,
      useNativeDriver: false,
    }).start(async () => {
      // Animasyon bittikten sonra API çağrısını yap
      try {
        if (action === 'like') {
          const result = await apiService.likePet(selectedPetId, petToInteract.id);
          if (result.isMatch) {
            setMatchFound(true);
            setTimeout(() => setMatchFound(false), 2000);
            Alert.alert('🎉 Eşleştiniz!', `${petToInteract.name} ile eşleştiniz!`);
          }
        } else {
          await apiService.passPet(selectedPetId, petToInteract.id);
        }
      } catch (error) {
        console.error(`Error on ${action}:`, error);
        Alert.alert('Hata', `İşlem sırasında bir hata oluştu.`);
      }

      // State'i güncelle ve kart pozisyonunu sıfırla
      setCurrentIndex(prev => prev + 1);
      position.setValue({ x: 0, y: 0 });
      rotation.setValue(0);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: 0 });
        rotation.setValue(gesture.dx / screenWidth);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 120) {
          handleSwipeAction('like');
        } else if (gesture.dx < -120) {
          handleSwipeAction('pass');
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 4,
            useNativeDriver: false,
          }).start();
          Animated.spring(rotation, {
            toValue: 0,
            friction: 4,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const rotateCard = rotation.interpolate({
    inputRange: [-1.5, 0, 1.5],
    outputRange: ['-20deg', '0deg', '20deg'],
  });

  const cardOpacity = position.x.interpolate({
    inputRange: [-screenWidth * 0.5, 0, screenWidth * 0.5],
    outputRange: [0.5, 1, 0.5],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, screenWidth * 0.3],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const passOpacity = position.x.interpolate({
    inputRange: [-screenWidth * 0.3, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const swipeDirection = position.x._value > 50 ? 'right' : position.x._value < -50 ? 'left' : null;
  const swipeOpacity = position.x.interpolate({
    inputRange: [-150, -50, 50, 150],
    outputRange: [1, 0, 0, 1],
    extrapolate: 'clamp',
  });

  const renderPetSelector = ({ item }: { item: Pet }) => (
    <TouchableOpacity
      style={[
        styles.petSelectorItem,
        selectedPetId === item.id && styles.selectedPetItem,
      ]}
      onPress={() => {
        selectPet(item.id); // Context'teki aktif pet'i güncelle
        setShowPetSelector(false);
      }}
    >
      <Image 
        source={{ uri: item.photos?.[0] || '' }}
        style={styles.petSelectorImage}
      />
      <View style={styles.petSelectorInfo}>
        <Text style={styles.petSelectorName}>{item.name}</Text>
        <Text style={styles.petSelectorBreed}>{item.breed}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={[styles.menuButton, { backgroundColor: theme.colors.surface }]}
          onPress={toggleDrawer}
        >
          <Menu size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.welcomeContainer}>
          <Text style={[styles.welcomeText, { color: theme.colors.textSecondary }]}>Hoşgeldiniz 👋</Text>
          <Text style={[styles.userName, { color: theme.colors.text }]}>{user?.firstName || 'Kaşif'}</Text>
        </View>

        <TouchableOpacity
          style={[styles.petSelector, { backgroundColor: theme.colors.surface }]}
          onPress={() => setShowPetSelector(true)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            {selectedPet ? (
              <>
                <Image
                  source={{ uri: selectedPet.photos?.[0] || '' }}
                  style={styles.selectedPetImage}
                />
                <Text
                  style={[styles.selectedPetName, { color: theme.colors.text }]}
                  numberOfLines={1}
                >
                  {selectedPet.name}
                </Text>
              </>
            ) : (
              <Text style={[styles.selectedPetName, { color: theme.colors.text }]}>Hayvan Seç</Text>
            )}
          </View>
          <ChevronDown size={16} color={theme.colors.textSecondary} style={styles.chevronIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Şimdilik hepsi bu kadar!</Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        {selectedPet?.name || "Dostun"} için çevredeki tüm sevimli patileri gördün.
        Daha sonra tekrar kontrol et veya filtrelerini genişletmeyi dene!
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={loadPetsForMatching}>
        <Text style={styles.refreshButtonText}>Yeniden Dene</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={theme.colors.gradient} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Sevimli dostlar yükleniyor...</Text>
      </LinearGradient>
    );
  }

  const currentPet = pets[currentIndex];

  return (
    <LinearGradient colors={theme.colors.gradient} style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      {renderHeader()}

      {pets.length > 0 && currentPet ? (
        <View style={styles.cardContainer}>
          {pets.map((pet, index) => {
            if (index < currentIndex) {
              return null;
            }
            if (index === currentIndex) {
              const rotate = rotation.interpolate({
                inputRange: [-1, 1],
                outputRange: ['-15deg', '15deg'],
              });

              const likeOpacity = position.x.interpolate({
                inputRange: [0, screenWidth / 2],
                outputRange: [0, 1],
                extrapolate: 'clamp',
              });

              const passOpacity = position.x.interpolate({
                inputRange: [-screenWidth / 2, 0],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={pet.id}
                  style={[
                    styles.animatedCard,
                    {
                      transform: [
                        { translateX: position.x },
                        { rotate: rotate },
                      ],
                    },
                  ]}
                  {...panResponder.panHandlers}
                >
                  <PetCard
                    pet={pet}
                    onLike={() => handleSwipeAction('like')}
                    onPass={() => handleSwipeAction('pass')}
                    likeOpacity={likeOpacity}
                    passOpacity={passOpacity}
                    distanceKm={pet.distanceKm}
                  />
                </Animated.View>
              );
            }
            // Render the next card behind
            if (index === currentIndex + 1) {
              return (
                <Animated.View key={pet.id} style={[styles.animatedCard, { transform: [{ scale: 0.95 }] }]}>
                  <PetCard pet={pet} showActions={false} />
                </Animated.View>
              );
            }
            return null;
          }).reverse()}
        </View>
      ) : (
        renderEmptyState()
      )}

      {/* Action Buttons */}
      {!loading && pets.length > 0 && currentPet && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.passButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => handleSwipeAction('pass')}
          >
            <X size={32} color={theme.colors.error} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => handleSwipeAction('like')}
          >
            <Heart size={32} color={theme.colors.success} fill={theme.colors.success} />
          </TouchableOpacity>
        </View>
      )}

      {/* Modals and Drawer */}
      <Modal
        visible={showPetSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPetSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Hayvanınızı Seçin</Text>
              <TouchableOpacity
                style={[styles.modalCloseButton, { backgroundColor: theme.colors.background }]}
                onPress={() => setShowPetSelector(false)}
              >
                <Text style={[styles.modalCloseText, { color: theme.colors.textSecondary }]}>Kapat</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={userPets}
              renderItem={renderPetSelector}
              keyExtractor={(item) => item.id}
              style={styles.petSelectorList}
            />
            
            <TouchableOpacity style={styles.addPetButton}>
              <View style={styles.addPetIcon}>
                <Plus size={20} color="#6366F1" />
              </View>
              <Text style={styles.addPetText}>Yeni Hayvan Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.filterModalContent, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Filtreleme Seçenekleri</Text>
              <TouchableOpacity
                style={[styles.modalCloseButton, { backgroundColor: theme.colors.background }]}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={[styles.modalCloseText, { color: theme.colors.textSecondary }]}>Kapat</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.filterContent}>
              <Text style={styles.filterLabel}>Mesafe</Text>
              <View style={styles.distanceOptions}>
                {[10, 25, 50, 100, 200].map((distance) => (
                  <TouchableOpacity
                    key={distance}
                    style={[
                      styles.distanceOption,
                      distance === 50 && styles.selectedDistanceOption,
                    ]}
                  >
                    <Text style={[
                      styles.distanceOptionText,
                      distance === 50 && styles.selectedDistanceOptionText,
                    ]}>
                      {distance} km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.filterLabel}>Şehir</Text>
              <TouchableOpacity style={styles.citySelector}>
                <Text style={styles.citySelectorText}>Ankara</Text>
                <ChevronDown size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {matchFound && (
        <View style={styles.matchOverlay}>
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.9)', 'rgba(5, 150, 105, 0.9)']}
            style={styles.matchBanner}
          >
            <Text style={styles.matchText}>🎉 EŞLEŞME! 🎉</Text>
          </LinearGradient>
        </View>
      )}

      {/* Side Drawer */}
      {showDrawer && (
        <TouchableOpacity 
          style={styles.drawerOverlay} 
          activeOpacity={1} 
          onPress={toggleDrawer}
        />
      )}
      <Animated.View style={[styles.drawer, { left: drawerAnimation, backgroundColor: theme.colors.surface }]}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={styles.drawerHeader}
        >
          <Image 
            source={{ uri: user?.profilePhoto || 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=150' }} 
            style={styles.drawerAvatar} 
          />
          <Text style={styles.drawerUsername}>{user?.username}</Text>
          <Text style={styles.drawerEmail}>{user?.email}</Text>
        </LinearGradient>
        
        <View style={styles.drawerMenu}>
          {drawerMenu.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.drawerMenuItem, { backgroundColor: theme.colors.surface }]} 
              onPress={item.onPress}
            >
              <Text style={[styles.drawerMenuText, { color: theme.colors.text }]}>{item.title}</Text>
            </TouchableOpacity>
          ))}
          
          {/* Güvenli Çıkış Butonu */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity 
              style={styles.logoutButton} 
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Güvenli Çıkış</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
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
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    marginBottom: 4,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  locationAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 0,
  },
  locationAlertText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    lineHeight: 16,
    color: '#6366F1',
  },
  filterIcon: {
    marginLeft: 8,
  },
  petSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  selectedPetImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedPetName: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
    flex: 1,
  },
  defaultPetIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  chevronIcon: {
    marginLeft: 'auto',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 120,
    marginTop: 0,
  },
  animatedCard: {
    position: 'absolute',
  },
  backgroundCard: {
    transform: [{ scale: 0.92 }],
    opacity: 0.3,
    zIndex: -1,
  },
  swipeIndicator: {
    position: 'absolute',
    top: 100,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 3,
  },
  likeIndicator: {
    right: 20,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    transform: [{ rotate: '-20deg' }],
  },
  passIndicator: {
    left: 20,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    transform: [{ rotate: '20deg' }],
  },
  likeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  passText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '600',
  },
  petSelectorList: {
    paddingHorizontal: 24,
  },
  petSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedPetItem: {
    backgroundColor: '#F0F4FF',
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  petSelectorImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  petSelectorInfo: {
    flex: 1,
  },
  petSelectorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  petSelectorBreed: {
    fontSize: 14,
    color: '#6B7280',
  },
  addPetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 8,
  },
  addPetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  addPetText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  filterModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '50%',
  },
  filterContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    marginTop: 16,
  },
  distanceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  distanceOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedDistanceOption: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  distanceOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedDistanceOptionText: {
    color: '#FFFFFF',
  },
  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  citySelectorText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
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
  },
  refreshButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  matchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  matchBanner: {
    paddingHorizontal: 48,
    paddingVertical: 24,
    borderRadius: 16,
  },
  matchText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 280,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  drawerHeader: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  drawerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  drawerUsername: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  drawerEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  drawerMenu: {
    flex: 1,
    paddingTop: 20,
  },
  drawerMenuItem: {
    marginHorizontal: 16,
    marginVertical: 4,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  drawerMenuText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tutorialOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  tutorialIndicator: {
    position: 'absolute',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tutorialLike: {
    right: '25%',
  },
  tutorialPass: {
    left: '25%',
  },
  tutorialText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  tutorialSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  tutorialCloseButton: {
    position: 'absolute',
    bottom: 100,
    backgroundColor: '#6366F1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  tutorialCloseText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tutorialOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  tutorialIndicator: {
    position: 'absolute',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tutorialLike: {
    right: '25%',
  },
  tutorialPass: {
    left: '25%',
  },
  tutorialText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  tutorialSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  tutorialCloseButton: {
    position: 'absolute',
    bottom: 100,
    backgroundColor: '#6366F1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  tutorialCloseText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoutContainer: {
    marginTop: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  actions: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  likeButton: {
    backgroundColor: '#10B981',
  },
  passButton: {
    backgroundColor: '#EF4444',
  },
});