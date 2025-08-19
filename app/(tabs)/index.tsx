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
import { ChevronDown, User, Filter, Menu } from 'lucide-react-native';
import { Plus } from 'lucide-react-native';
import { PetCard } from '@/components/PetCard';
import { Pet, User as UserType } from '@/types';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { mockPets } from '@/services/mockData';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ExploreScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [pets, setPets] = useState<Pet[]>([]);
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showPetSelector, setShowPetSelector] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchFound, setMatchFound] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  
  const position = useRef(new Animated.ValueXY()).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const drawerAnimation = useRef(new Animated.Value(-300)).current;

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

  useEffect(() => {
    loadPets();
    loadUserPets();
  }, []);

  const toggleDrawer = () => {
    const toValue = showDrawer ? -300 : 0;
    Animated.timing(drawerAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setShowDrawer(!showDrawer);
  };

  const loadPets = async () => {
    try {
      const petData = await apiService.getPetsForMatching();
      setPets(petData);
    } catch (error) {
      Alert.alert('Hata', 'Hayvanlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPets = async () => {
    try {
      console.log('Loading user pets from API...');
      
      // Web preview'da CORS hatası olduğu için mock data kullan
      const mockUserPets = mockPets.slice(0, 3);
      console.log('Using mock user pets for web preview:', mockUserPets);
      setUserPets(mockUserPets);
      if (mockUserPets.length > 0) {
        setSelectedPet(mockUserPets[0]);
        console.log('İlk hayvan seçildi:', mockUserPets[0].name);
      }
    } catch (error) {
      console.error('Error loading user pets:', error);
      const mockUserPets = mockPets.slice(0, 2);
      setUserPets(mockUserPets);
      if (mockUserPets.length > 0) {
        setSelectedPet(mockUserPets[0]);
      }
    }
  };

  const handleLike = async () => {
    const currentPet = pets[currentIndex];
    if (!currentPet) return;

    try {
      const result = await apiService.likePet(currentPet.id);
      if (result.matched) {
        setMatchFound(true);
        setTimeout(() => {
          setMatchFound(false);
          Alert.alert('🎉 Eşleştiniz!', `${currentPet.name} ile eşleştiniz! Artık mesajlaşabilirsiniz.`);
        }, 2000);
      }
    } catch (error) {
      Alert.alert('Hata', 'Beğeni işlemi sırasında bir hata oluştu.');
    }

    animateCardOut(screenWidth * 1.5);
  };

  const handlePass = () => {
    animateCardOut(-screenWidth * 1.5);
  };

  const animateCardOut = (toValue: number) => {
    Animated.parallel([
      Animated.timing(position, {
        toValue: { x: toValue, y: 0 },
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(rotation, {
        toValue: toValue > 0 ? 1 : -1,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setCurrentIndex(prevIndex => prevIndex + 1);
      position.setValue({ x: 0, y: 0 });
      rotation.setValue(0);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        position.setValue({ x: gestureState.dx, y: 0 });
        rotation.setValue(gestureState.dx / (screenWidth * 0.8));
      },
      onPanResponderRelease: (_, gestureState) => {
        const dx = gestureState?.dx || 0;
        
        if (Math.abs(dx) > screenWidth * 0.25) {
          if (dx > 0) {
            handleLike();
          } else {
            handlePass();
          }
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
          Animated.spring(rotation, {
            toValue: 0,
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
        selectedPet?.id === item.id && styles.selectedPetItem,
      ]}
      onPress={() => {
        setSelectedPet(item);
        setShowPetSelector(false);
      }}
    >
      <Image source={{ uri: item.photos[0] }} style={styles.petSelectorImage} />
      <View style={styles.petSelectorInfo}>
        <Text style={styles.petSelectorName}>{item.name}</Text>
        <Text style={styles.petSelectorBreed}>{item.breed}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient colors={theme.colors.gradient} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Sevimli dostlar yükleniyor...</Text>
      </LinearGradient>
    );
  }

  if (currentIndex >= pets.length) {
    return (
      <LinearGradient colors={theme.colors.gradient} style={styles.container}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View style={styles.header}>
          <View style={styles.welcomeContainer}>
            <Text style={[styles.welcomeText, { color: theme.colors.textSecondary }]}>Hoşgeldiniz</Text>
            <Text style={[styles.usernameText, { color: theme.colors.text }]}>
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.username}
            </Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Tüm hayvanları gördünüz!</Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>Yeni hayvanlar için daha sonra tekrar kontrol edin.</Text>
        </View>
      </LinearGradient>
    );
  }

  const currentPet = pets[currentIndex];

  return (
    <LinearGradient colors={theme.colors.gradient} style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: theme.colors.surface }]}
            onPress={toggleDrawer}
          >
            <Menu size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <View style={styles.welcomeContainer}>
            <Text style={[styles.welcomeText, { color: theme.colors.textSecondary }]}>Hoşgeldiniz</Text>
            <Text style={[styles.usernameText, { color: theme.colors.text }]}>
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.username}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.petSelector, { backgroundColor: theme.colors.surface }]}
            onPress={() => setShowPetSelector(true)}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              {selectedPet ? (
                <>
                  <Image source={{ uri: selectedPet.photos[0] }} style={styles.selectedPetImage} />
                  <Text style={[styles.selectedPetName, { color: theme.colors.text }]}>{selectedPet.name}</Text>
                </>
              ) : (
                <>
                  <View style={[styles.defaultPetIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
                    <User size={20} color={theme.colors.primary} />
                  </View>
                  <Text style={[styles.selectedPetName, { color: theme.colors.text }]}>Hayvan Seç</Text>
                </>
              )}
            </View>
            <ChevronDown size={16} color={theme.colors.textSecondary} style={styles.chevronIcon} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.locationAlert, { backgroundColor: `${theme.colors.primary}20` }]}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={[styles.locationAlertText, { color: theme.colors.primary }]}>
            Ankara'da 50 km yakınındaki sevimli dostlar ✨
          </Text>
          <Filter size={16} color={theme.colors.secondary} style={styles.filterIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        {pets.slice(currentIndex, currentIndex + 2).map((pet, index) => {
          if (index === 0) {
            return (
              <Animated.View
                key={pet.id}
                style={[
                  styles.animatedCard,
                  {
                    transform: [
                      ...position.getTranslateTransform(),
                      { rotate: rotateCard },
                    ],
                    opacity: cardOpacity,
                  },
                ]}
                {...panResponder.panHandlers}
              >
                <PetCard
                  pet={pet}
                  onLike={handleLike}
                  onPass={handlePass}
                  swipeDirection={swipeDirection}
                  swipeOpacity={swipeOpacity}
                />
                
                <Animated.View
                  style={[styles.swipeIndicator, styles.likeIndicator, { opacity: likeOpacity }]}
                >
                  <Text style={styles.likeText}>BEĞENDİM</Text>
                </Animated.View>
                
                <Animated.View
                  style={[styles.swipeIndicator, styles.passIndicator, { opacity: passOpacity }]}
                >
                  <Text style={styles.passText}>GEÇ</Text>
                </Animated.View>
              </Animated.View>
            );
          } else {
            return (
              <View key={pet.id} style={[styles.animatedCard, styles.backgroundCard]}>
                <PetCard pet={pet} showActions={false} />
              </View>
            );
          }
        })}
      </View>

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
              style={styles.drawerMenuItem} 
              onPress={item.onPress}
            >
              <Text style={[styles.drawerMenuText, { color: theme.colors.text }]}>{item.title}</Text>
            </TouchableOpacity>
          ))}
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
  usernameText: {
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
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationAlertText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    lineHeight: 16,
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
    paddingBottom: 100,
    marginTop: -100,
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
    paddingTop: 20,
  },
  drawerMenuItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  drawerMenuText: {
    fontSize: 16,
    fontWeight: '500',
  },
});