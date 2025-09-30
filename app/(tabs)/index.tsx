import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { ChevronDown, User, Filter, Menu, Plus, Heart, X, Info } from 'lucide-react-native';
import { PetCard } from '@/components/PetCard';
import { PetDetailModal } from '@/components/PetDetailModal';
import { Pet } from '@/types';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { usePet } from '@/contexts/PetContext';
import { useTheme } from '@/contexts/ThemeContext';
// import { NotificationService } from '@/services/notificationService'; // Removed for SDK 54 compatibility

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface Filters {
  distance: number | null; // null = mesafe sınırı yok
  neutered: 'all' | 'yes' | 'no';
  color: 'all' | string;
  breed: 'all' | string;
}

export default function ExploreScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { userPets, selectedPetId, selectPet } = usePet();
  const { theme, isDark } = useTheme();
  
  const [pets, setPets] = useState<Pet[]>([]);
  const petsRef = useRef<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPetSelector, setShowPetSelector] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [filters, setFilters] = useState<Filters>({ 
    distance: null, // Mesafe sınırı yok
    neutered: 'all', 
    color: 'all',
    breed: 'all'
  });
  
  // Filters object'ini memoize et - artık kullanmıyoruz, doğrudan filters kullanıyoruz
  const [isSwiping, setIsSwiping] = useState(false); // Swipe durumunu takip et
  const [notification, setNotification] = useState<{ message: string; type: 'like' | 'pass' } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPetForDetails, setSelectedPetForDetails] = useState<Pet | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const position = useRef(new Animated.ValueXY()).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const drawerAnimation = useRef(new Animated.Value(-300)).current;
  const notificationAnim = useRef(new Animated.Value(-100)).current; // Bildirim animasyonu
  
  // Global selectedPetId - sadece pet selector'dan değiştirilebilir
  const globalSelectedPetId = useRef<string | null>(selectedPetId);

  // selectedPetId değiştiğinde global değeri güncelle
  useEffect(() => {
    globalSelectedPetId.current = selectedPetId;
    console.log('🔍 DEBUG: Global selectedPetId güncellendi:', selectedPetId);
  }, [selectedPetId]);

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

  const loadPetsForMatching = useCallback(async (retryCount = 0) => {
    const maxRetries = 2;
    const retryDelay = 2000; // 2 saniye
    console.log(`loadPetsForMatching çağrıldı - selectedPetId: ${selectedPetId}, pets.length: ${pets.length} (Deneme ${retryCount + 1}/${maxRetries + 1})`);
    console.log('🔍 DEBUG: Mevcut filtreler:', filters);
    console.log('🔍 DEBUG: Filtre değerleri - breed:', filters.breed, 'color:', filters.color, 'neutered:', filters.neutered, 'distance:', filters.distance);
    console.log('🔍 DEBUG: API Token kontrolü:', apiService.getToken() ? 'VAR' : 'YOK');
    console.log('🔍 DEBUG: User kontrolü:', user ? 'VAR' : 'YOK');

    if (!selectedPetId) {
      console.log('loadPetsForMatching: selectedPetId yok');
      setPets([]);
      setLoading(false);
      return;
    }

    // Token kontrolü
    if (!apiService.getToken()) {
      console.log('loadPetsForMatching: Token yok, login gerekli');
      setApiError('Giriş yapmanız gerekiyor. Lütfen tekrar giriş yapın.');
      setLoading(false);
      return;
    }

    // Seçili pet eşleşme için aktif değilse boş liste döndür
    if (selectedPet && !selectedPet.isActive) {
      console.log('loadPetsForMatching: Seçili pet eşleşme için aktif değil');
      setPets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('loadPetsForMatching: API çağrısı yapılıyor...');
      // API'ye kullanıcının konumunu ve filtreleri gönder
      const apiFilters = {
        radiusInKm: filters.distance,
        neutered: filters.neutered !== 'all' ? filters.neutered === 'yes' : undefined,
        color: filters.color !== 'all' ? filters.color : undefined,
        breed: filters.breed !== 'all' ? parseInt(filters.breed) : undefined,
      };
      
      console.log('🔍 DEBUG: API filtreleri hazırlandı:', apiFilters);
      
      const petData = await apiService.getPetsForMatching(selectedPetId, apiFilters);
      // Konum servisinden alınacak gerçek user location
      // location: {
      //   latitude: user.latitude,
      //   longitude: user.longitude
      // }
      console.log('loadPetsForMatching: API yanıtı alındı, petData.length:', petData.length);
      console.log('loadPetsForMatching: İlk kart:', petData.length > 0 ? petData[0].name : 'Yok');
      setPets(petData);
      petsRef.current = petData; // Ref'i de güncelle
      setApiError(null); // Başarılı durumda hata state'ini temizle
      console.log('loadPetsForMatching: pets state ve ref güncellendi');
    } catch (error) {
      console.error('loadPetsForMatching: Error loading pets for matching:', error);
      console.error('loadPetsForMatching: Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        selectedPetId,
        user: user?.id,
        retryCount
      });
      
      // Retry mekanizması - sadece 500 ve network hatalarında retry yap
      if (retryCount < maxRetries && (error.response?.status >= 500 || !error.response)) {
        console.log(`loadPetsForMatching: ${retryDelay}ms sonra tekrar denenecek... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          loadPetsForMatching(retryCount + 1);
        }, retryDelay);
        return;
      }
      
      // Hata durumunda pets state'ini temizle ama loading'i false yap
      setPets([]);
      petsRef.current = [];
      
      // Eğer kullanıcı değişmişse veya selectedPetId geçersizse, hata gösterme
      if (!user || !selectedPetId) {
        console.log('loadPetsForMatching: Kullanıcı veya selectedPetId yok, hata gösterilmiyor');
        return;
      }
      
      // API hata mesajını belirle
      let errorMessage = 'Hayvanlar yüklenirken bir hata oluştu.';
      if (error.response?.status === 500) {
        errorMessage = 'Sunucuya ulaşılamıyor. Lütfen tekrar deneyin.';
      } else if (!error.response) {
        errorMessage = 'İnternet bağlantınızı kontrol edin.';
      }
      
      setApiError(errorMessage);
    } finally {
      setLoading(false);
      position.setValue({ x: 0, y: 0 });
      rotation.setValue(0);
    }
  }, [selectedPetId, filters.distance, filters.neutered, filters.color, filters.breed]);

  useEffect(() => {
    // Sadece login olmuş kullanıcılar için API çağrısı yap
    if (selectedPetId && user && apiService.getToken()) {
      loadPetsForMatching();
    }
  }, [selectedPetId, user, filters.distance, filters.neutered, filters.color, filters.breed, loadPetsForMatching]); // Filtreler değiştiğinde de yeniden yükle

  // Debug için pets state'ini takip et
  useEffect(() => {
    console.log('🐛 pets state güncellendi:', pets.length, 'kart');
    petsRef.current = pets; // Ref'i güncelle
    if (pets.length > 0) {
      console.log('🐛 İlk kart:', pets[0].name);
    }
  }, [pets]);

  // Kullanıcı değiştiğinde pets state'ini temizle
  useEffect(() => {
    console.log('🔍 Kullanıcı değişti, pets state temizleniyor...', user?.id);
    setPets([]);
    petsRef.current = [];
    position.setValue({ x: 0, y: 0 });
    rotation.setValue(0);
  }, [user?.id]);

  // Eşleşmeler sekmesinden dönünce listeyi yenile
  useFocusEffect(
    useCallback(() => {
      if (selectedPetId) {
        console.log('🔍 DEBUG: Eşleşmelerden dönüldü, liste yenileniyor...');
        loadPetsForMatching();
      }
    }, [selectedPetId, loadPetsForMatching])
  );

  const toggleDrawer = () => {
    const toValue = showDrawer ? -300 : 0;
    Animated.timing(drawerAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setShowDrawer(!showDrawer);
  };

  const handleInfoPress = (pet: Pet) => {
    console.log('🔍 DEBUG: Info butonu tıklandı:', pet.name);
    setSelectedPetForDetails(pet);
    setModalVisible(true);
    console.log('🔍 DEBUG: Modal state güncellendi - visible: true');
  };
  
  const showNotification = (message: string, type: 'like' | 'pass') => {
    setNotification({ message, type });
    const isMatch = message.includes('EŞLEŞTİNİZ');
    const delay = isMatch ? 4000 : 2000; // Eşleşme bildirimi daha uzun kalsın
    
    Animated.sequence([
      Animated.timing(notificationAnim, {
        toValue: 0, // Filtre üstüne getir
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(delay),
      Animated.timing(notificationAnim, {
        toValue: -100, // Ekranın dışına çıkar
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setNotification(null);
    });
  };

  const handleSwipeAction = async (action: 'like' | 'pass') => {
    // Global selectedPetId'yi kullan - değişmez
    const currentSelectedPetId = globalSelectedPetId.current;
    console.log('handleSwipeAction çağrıldı:', action, 'pets.length:', pets.length, 'petsRef.length:', petsRef.current.length, 'isSwiping:', isSwiping);
    console.log('🔍 DEBUG: handleSwipeAction - globalSelectedPetId:', currentSelectedPetId);

    if (isSwiping) {
      console.log('Swipe engellendi: Şu anda başka bir swipe işlemi devam ediyor');
      return;
    }

    setIsSwiping(true);
    const petToInteract = petsRef.current[0]; // Ref'ten al, her zaman güncel

    if (!petToInteract) {
      console.log('Etkileşim için pet bulunamadı - pets.length:', pets.length, 'petsRef.length:', petsRef.current.length);
      setIsSwiping(false);

      // Kartlar bittiyse yeni kartlar yükle
      if (currentSelectedPetId) {
        console.log('Kartlar bitti, loadPetsForMatching çağrılıyor');
        loadPetsForMatching();
      }
      return;
    }

    if (!currentSelectedPetId) {
      console.log('Seçili pet bulunamadı, işlem iptal edildi');
      setIsSwiping(false);
      return;
    }

    const xValue = action === 'like' ? screenWidth * 1.5 : -screenWidth * 1.5;

    try {
      console.log(`${action.toUpperCase()} API isteği gönderiliyor:`, currentSelectedPetId, petToInteract.id);
      console.log('🔍 DEBUG: selectedPetId değeri:', currentSelectedPetId, 'tip:', typeof currentSelectedPetId);
      console.log('🔍 DEBUG: petToInteract.id değeri:', petToInteract.id, 'tip:', typeof petToInteract.id);
      
      if (action === 'like') {
        const result = await apiService.likePet(currentSelectedPetId, petToInteract.id);
        console.log('API yanıtı:', result);
        showNotification(`💖 ${petToInteract.name} beğenildi!`, 'like');
        if (result.isMatch) {
          console.log('🎉 EŞLEŞME BULUNDU!', result);
          setMatchFound(true);
          showNotification(`🎉 EŞLEŞTİNİZ! ${petToInteract.name} ile eşleştiniz! 🎉`, 'like');
          
          // 3 saniye sonra eşleşme uyarısını kapat
          setTimeout(() => {
            console.log('Eşleşme uyarısı kapatılıyor');
            setMatchFound(false);
          }, 3000);
        }
      } else {
        const result = await apiService.passPet(currentSelectedPetId, petToInteract.id);
        console.log('API yanıtı:', result);
        showNotification(`👋 ${petToInteract.name} geçildi`, 'pass');
      }
      
      // API çağrısı başarılı oldu, şimdi animasyonu başlat
      Animated.timing(position, {
        toValue: { x: xValue, y: 0 },
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        console.log('Animasyon tamamlandı, kart kaldırılıyor');
        // Animasyon tamamlandığında, mevcut kartı kaldır ve yeni kartı göster
        setPets(currentPets => {
          const newPets = currentPets.slice(1); // İlk kartı kaldır
          petsRef.current = newPets; // Ref'i de güncelle

          console.log('Yeni pets.length:', newPets.length);
          // Eğer kartlar bittiyse ve seçili bir pet varsa yeni kartlar yükle
          if (newPets.length === 0 && selectedPetId) {
            console.log('Kartlar bitti, yenilerini yüklüyorum...');
            loadPetsForMatching();
          }

          return newPets;
        });

        position.setValue({ x: 0, y: 0 });
        rotation.setValue(0);
        setIsSwiping(false);
      });
      
    } catch (error) {
      console.error(`Swipe işlemi sırasında hata oluştu (${action}):`, error);
      Alert.alert('Hata', 'İşlem sırasında bir hata oluştu.');
      setIsSwiping(false); // Hata durumunda kilidi kaldır
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        // Info butonunun alanını kontrol et
        const { locationX, locationY } = evt.nativeEvent;
        
        // PetCard'daki gerçek boyutlar (screenWidth - 32)
        const cardWidth = screenWidth - 32;
        
        // Info butonu sağ üst köşede, PetCard'daki gerçek konuma göre hesapla
        const infoButtonArea = {
          x: cardWidth - 70, // Sağdan 70px içeride
          y: 10, // Üstten 10px
          width: 60, // Buton genişliği
          height: 60 // Buton yüksekliği
        };
        
        console.log('🔍 DEBUG: Dokunma koordinatları:', { locationX, locationY });
        console.log('🔍 DEBUG: Info buton alanı:', infoButtonArea);
        
        // Eğer dokunma info butonunun alanındaysa, PanResponder'ı devre dışı bırak
        if (locationX >= infoButtonArea.x && 
            locationX <= infoButtonArea.x + infoButtonArea.width &&
            locationY >= infoButtonArea.y && 
            locationY <= infoButtonArea.y + infoButtonArea.height) {
          console.log('🔍 DEBUG: Dokunma info butonunun alanında, PanResponder devre dışı');
          return false;
        }
        
        return !isSwiping; // Swipe işlemi yoksa başlat
      },
      onMoveShouldSetPanResponder: () => !isSwiping, // Swipe işlemi yoksa hareket et
      onPanResponderGrant: () => {
        // Kullanıcı dokunduğunda çağrılır
        console.log('Swipe başladı');
      },
      onPanResponderMove: (_, gesture) => {
        // Sürükleme sırasında sürekli çağrılır
        position.setValue({ x: gesture.dx, y: 0 });
        rotation.setValue(gesture.dx / screenWidth);
      },
      onPanResponderRelease: (_, gesture) => {
        console.log('onPanResponderRelease çağrıldı - dx:', gesture.dx, 'isSwiping:', isSwiping);

        if (isSwiping) {
          console.log('onPanResponderRelease: isSwiping true, işlem durduruldu');
          return;
        }

        // Kullanıcı parmağını kaldırdığında çağrılır
        console.log('Swipe bitti, dx:', gesture.dx);

        // Sağa doğru yeterince sürüklendiyse beğen
        if (gesture.dx > 50) {
          console.log('Sağa swipe tetiklendi - beğen, handleSwipeAction çağrılıyor');
          handleSwipeAction('like');
        }
        else if (gesture.dx < -50) {
          console.log('Sola swipe tetiklendi - geç, handleSwipeAction çağrılıyor');
          handleSwipeAction('pass');
        }
        else {
          console.log('Yetersiz swipe - geri dön (dx:', gesture.dx, ')');
          Animated.parallel([
            Animated.spring(position, {
              toValue: { x: 0, y: 0 },
              friction: 4,
              useNativeDriver: true,
            }),
            Animated.spring(rotation, {
              toValue: 0,
              friction: 4,
              useNativeDriver: true,
            })
          ]).start();
        }
      },
      onPanResponderTerminate: () => {
        // Başka bir bileşen hareketi ele geçirirse
        console.log('Swipe iptal edildi');
        Animated.parallel([
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 4,
            useNativeDriver: true,
          }),
          Animated.spring(rotation, {
            toValue: 0,
            friction: 4,
            useNativeDriver: true,
          })
        ]).start();
      }
    })
  ).current;

  const renderPetSelector = ({ item }: { item: Pet }) => (
    <TouchableOpacity
      style={[
        styles.petSelectorItem,
        selectedPetId === item.id && styles.selectedPetItem,
      ]}
      onPress={() => {
        console.log('Pet seçildi:', item.id, 'Önceki selectedPetId:', selectedPetId);
        // Global değeri hemen güncelle
        globalSelectedPetId.current = item.id;
        console.log('🔍 DEBUG: Global selectedPetId manuel güncellendi:', item.id);
        selectPet(item.id, () => {
          console.log('Pet seçimi tamamlandı, yeni selectedPetId:', item.id);
          setShowPetSelector(false);
        });
      }}
    >
      {item.photos && item.photos.length > 0 && item.photos[0] && item.photos[0].trim() !== '' ? (
        <Image 
          source={{ uri: item.photos[0] }}
          style={styles.petSelectorImage}
        />
      ) : (
        <View style={[styles.petSelectorImage, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>🐾</Text>
        </View>
      )}
      <View style={styles.petSelectorInfo}>
        <Text style={styles.petSelectorName}>{`${item.name}`}</Text>
        <Text style={styles.petSelectorBreed}>{`${item.breed}`}</Text>
      </View>
      
      {/* Seçili hayvan işareti */}
      {selectedPetId === item.id && (
        <View style={styles.selectedIndicator}>
          <Text style={styles.selectedIndicatorText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <View style={styles.leftSection}>
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: theme.colors.surface }]}
            onPress={toggleDrawer}
          >
            <Menu size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.welcomeContainer}>
            <Text style={[styles.welcomeText, { color: theme.colors.textSecondary }]}>Hoşgeldiniz 👋</Text>
                  <Text 
                    style={[styles.userName, { color: theme.colors.text }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {`${user?.firstName || 'Kaşif'}`}
                  </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.petSelector, { backgroundColor: theme.colors.surface }]}
          onPress={() => setShowPetSelector(true)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            {selectedPet ? (
              <>
                {selectedPet.photos && selectedPet.photos.length > 0 && selectedPet.photos[0] && selectedPet.photos[0].trim() !== '' ? (
                  <Image
                    source={{ uri: selectedPet.photos[0] }}
                    style={styles.selectedPetImage}
                  />
                ) : (
                  <View style={[styles.selectedPetImage, styles.placeholderImage]}>
                    <Text style={[styles.placeholderText, { fontSize: 10 }]}>🐾</Text>
                  </View>
                )}
                <Text
                  style={[styles.selectedPetName, { color: theme.colors.text }]}
                  numberOfLines={1}
                >
                  {`${selectedPet.name}`}
                </Text>
              </>
            ) : (
              <Text style={[styles.selectedPetName, { color: theme.colors.text }]}>Hayvan Seç</Text>
            )}
          </View>
          <ChevronDown size={16} color={theme.colors.textSecondary} style={styles.chevronIcon} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.locationAlert}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.locationAlertGradient}
        >
          <Text style={styles.locationAlertText} numberOfLines={1} ellipsizeMode='tail'>
            Size en yakın sevimli dostlar görüntüleniyor
          </Text>
          <Filter size={16} color="#FFFFFF" style={styles.filterIcon} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => {
    // Seçili pet eşleşme için aktif değilse özel mesaj göster
    if (selectedPet && !selectedPet.isActive) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Eşleşme Kapalı</Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
            {`${selectedPet.name} için eşleşme özelliği kapalı. Hayvanınızı düzenleyerek eşleşme özelliğini açabilirsiniz.`}
          </Text>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={() => router.push(`/edit-pet/${selectedPet.id}`)}
          >
            <Text style={styles.refreshButtonText}>Hayvanı Düzenle</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Normal boş durum mesajı
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Şimdilik hepsi bu kadar!</Text>
        <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
          {`${selectedPet?.name || "Dostun"} için çevredeki tüm sevimli patileri gördün. Daha sonra tekrar kontrol et veya filtrelerini genişletmeyi dene!`}
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadPetsForMatching}>
          <Text style={styles.refreshButtonText}>Yeniden Dene</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const currentPet = pets.length > 0 ? pets[0] : null;

  if (loading) {
    return (
      <LinearGradient colors={theme.colors.gradient as [string, string, ...string[]]} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Sevimli dostlar yükleniyor...</Text>
      </LinearGradient>
    );
  }

  // API hatası durumu
  if (apiError) {
    return (
      <LinearGradient colors={theme.colors.gradient as [string, string, ...string[]]} style={styles.container}>
        <StatusBar style={isDark ? "light" : "dark"} />
        
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>⚠️</Text>
          </View>
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>Bağlantı Hatası</Text>
          <Text style={[styles.errorMessage, { color: theme.colors.textSecondary }]}>
            {apiError}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              setApiError(null);
              loadPetsForMatching();
            }}
          >
            <Text style={styles.retryButtonText}>Yeniden Dene</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={theme.colors.gradient as [string, string, ...string[]]} style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <PetDetailModal 
        pet={selectedPetForDetails}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        theme={theme}
      />
      
      {renderHeader()}

      {/* Swipe Bildirimi */}
      {notification && (
        <Animated.View 
          style={[
            styles.notification,
            { transform: [{ translateY: notificationAnim }] }
          ]}
        >
          <LinearGradient
            colors={notification.message.includes('EŞLEŞTİNİZ') 
              ? ['#10B981', '#059669', '#047857'] // Yeşil tonları eşleşme için
              : notification.type === 'like' 
                ? ['#EC4899', '#F97316'] 
                : ['#F59E0B', '#D97706']
            }
            style={styles.notificationGradient}
          >
            <Text style={[
              styles.notificationText,
              notification.message.includes('EŞLEŞTİNİZ') && styles.matchNotificationText
            ]}>
              {notification.message}
            </Text>
          </LinearGradient>
        </Animated.View>
      )}

      {pets.length > 0 && currentPet ? (
        <View style={styles.cardContainer}>
          {pets.slice(0, 4).map((pet, index) => {

            const isFirstCard = index === 0;
            const isSecondCard = index === 1;
            const isThirdCard = index === 2;
            const isFourthCard = index === 3;

            const rotate = position.x.interpolate({
              inputRange: [-screenWidth / 2, 0, screenWidth / 2],
              outputRange: ['-10deg', '0deg', '10deg'],
              extrapolate: 'clamp',
            });

            const cardStyle = isFirstCard
              ? {
                  transform: [{ translateX: position.x }, { rotate }],
                  zIndex: 4,
                }
              : isSecondCard
              ? {
                  transform: [{ scale: 0.95 }, { translateY: -10 }],
                  zIndex: 3,
                  opacity: 0.8
                }
              : isThirdCard
              ? {
                  transform: [{ scale: 0.9 }, { translateY: -20 }],
                  zIndex: 2,
                  opacity: 0.6
                }
              : isFourthCard
              ? {
                  transform: [{ scale: 0.85 }, { translateY: -30 }],
                  zIndex: 1,
                  opacity: 0.4
                }
              : { display: 'none' as const };

            const likeOpacity = position.x.interpolate({
              inputRange: [20, screenWidth / 2],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            });

            const passOpacity = position.x.interpolate({
              inputRange: [-screenWidth / 2, -20],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={`pet-${pet.id}-${index}`}
                style={[styles.animatedCard, cardStyle]}
                {...(isFirstCard ? panResponder.panHandlers : {})}
              >
                {pet.photos && pet.photos.length > 0 && pet.photos[0] ? (
                  <>
                    <PetCard
                      pet={pet}
                      likeOpacity={isFirstCard ? likeOpacity : undefined}
                      passOpacity={isFirstCard ? passOpacity : undefined}
                      distanceKm={pet.distanceKm ? Number(pet.distanceKm) : undefined}
                      onInfoPress={() => handleInfoPress(pet)}
                    />
                  </>
                ) : (
                  <View style={styles.emptyCard}>
                    <Text>Resim Yüklenemedi</Text>
                  </View>
                )}
              </Animated.View>
            );
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
            
            <TouchableOpacity 
              style={styles.addPetButton}
              onPress={() => {
                setShowPetSelector(false);
                router.push('/add-pet');
              }}
            >
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
            
            <ScrollView style={styles.filterContent}>
              {/* Mesafe Filtresi */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: theme.colors.text }]}>Mesafe</Text>
                <View style={styles.optionRow}>
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      { backgroundColor: theme.colors.background },
                      filters.distance === null && styles.selectedOption,
                    ]}
                    onPress={() => setFilters(prev => ({ ...prev, distance: null }))}
                  >
                    <Text style={[
                      styles.optionText,
                      { color: theme.colors.text },
                      filters.distance === null && styles.selectedOptionText,
                    ]}>
                      Sınırsız
                    </Text>
                  </TouchableOpacity>
                  {[10, 25, 50, 100, 200].map((distance) => (
                    <TouchableOpacity
                      key={distance}
                      style={[
                        styles.optionButton,
                        { backgroundColor: theme.colors.background },
                        filters.distance === distance && styles.selectedOption,
                      ]}
                      onPress={() => setFilters(prev => ({ ...prev, distance }))}
                    >
                      <Text style={[
                        styles.optionText,
                        { color: theme.colors.text },
                        filters.distance === distance && styles.selectedOptionText,
                      ]}>
                        {distance} km
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>


              {/* Cins Filtresi */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: theme.colors.text }]}>Cins</Text>
                <View style={styles.optionRow}>
                  {(() => {
                    const selectedPet = userPets.find(pet => pet.id === selectedPetId);
                    const petType = selectedPet?.species || 'cat';
                    
                    const breeds = petType === 'cat' ? [
                      { value: 'all', label: 'Tümü' },
                      { value: '1', label: 'Scottish Fold' },
                      { value: '2', label: 'British Shorthair' },
                      { value: '4', label: 'Tekir' },
                      { value: '5', label: 'Van Kedisi' },
                      { value: '6', label: 'Persian' }
                    ] : [
                      { value: 'all', label: 'Tümü' },
                      { value: '7', label: 'Golden Retriever' },
                      { value: '9', label: 'Labrador' },
                      { value: '10', label: 'Alman Kurdu' },
                      { value: '11', label: 'Poodle' },
                      { value: '12', label: 'Beagle' }
                    ];
                    
                    return breeds.map((option, index) => (
                      <TouchableOpacity
                        key={`breed-${petType}-${option.value}-${index}`}
                        style={[
                          styles.optionButton,
                          { backgroundColor: theme.colors.background },
                          filters.breed === option.value && styles.selectedOption,
                        ]}
                        onPress={() => {
                          console.log('🔍 DEBUG: Breed seçildi:', option.value);
                          setFilters(prev => {
                            const newFilters = { ...prev, breed: option.value };
                            console.log('🔍 DEBUG: Yeni filtreler:', newFilters);
                            return newFilters;
                          });
                        }}
                      >
                        <Text style={[
                          styles.optionText,
                          { color: theme.colors.text },
                          filters.breed === option.value && styles.selectedOptionText,
                        ]}>
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    ));
                  })()}
                </View>
              </View>

              {/* Kısırlaştırma Filtresi */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: theme.colors.text }]}>Kısırlaştırma</Text>
                <View style={styles.optionRow}>
                  {[
                    { value: 'all', label: 'Tümü' },
                    { value: 'yes', label: 'Kısırlaştırılmış' },
                    { value: 'no', label: 'Kısırlaştırılmamış' }
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionButton,
                        { backgroundColor: theme.colors.background },
                        filters.neutered === option.value && styles.selectedOption,
                      ]}
                      onPress={() => {
                        console.log('🔍 DEBUG: Neutered seçildi:', option.value);
                        setFilters(prev => ({ ...prev, neutered: option.value as any }));
                      }}
                    >
                      <Text style={[
                        styles.optionText,
                        { color: theme.colors.text },
                        filters.neutered === option.value && styles.selectedOptionText,
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Renk Filtresi */}
              <View style={styles.filterSection}>
                <Text style={[styles.filterLabel, { color: theme.colors.text }]}>Renk</Text>
                <View style={styles.optionRow}>
                  {[
                    { value: 'all', label: 'Tümü' },
                    { value: 'Siyah', label: 'Siyah' },
                    { value: 'Beyaz', label: 'Beyaz' },
                    { value: 'Gri', label: 'Gri' },
                    { value: 'Sarı', label: 'Sarı' },
                    { value: 'Kahverengi', label: 'Kahverengi' }
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionButton,
                        { backgroundColor: theme.colors.background },
                        filters.color === option.value && styles.selectedOption,
                      ]}
                      onPress={() => {
                        console.log('🔍 DEBUG: Renk seçildi:', option.value);
                        setFilters(prev => ({ ...prev, color: option.value }));
                      }}
                    >
                      <Text style={[
                        styles.optionText,
                        { color: theme.colors.text },
                        filters.color === option.value && styles.selectedOptionText,
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Filtre Uygula Butonu */}
            <View style={styles.filterFooter}>
              <TouchableOpacity
                style={[styles.applyFilterButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => {
                  console.log('🔍 Filtreler uygulanıyor:', filters);
                  console.log('🔍 Seçili pet ID:', selectedPetId);
                  setShowFilterModal(false);
                  loadPetsForMatching(); // Manuel olarak yükle
                }}
              >
                <Text style={styles.applyFilterText}>Filtreleri Uygula</Text>
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
          <Text style={styles.drawerUsername}>{`${user?.username || ''}`}</Text>
          <Text style={styles.drawerEmail}>{`${user?.email || ''}`}</Text>
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
  notification: {
    position: 'absolute',
    top: 50, // Filtre ekranının üstünde, header'ın hemen altında
    left: 20,
    right: 20,
    borderRadius: 12,
    zIndex: 1002, // Filtre modal'ından da yüksek
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  notificationGradient: {
    padding: 10, // 8'den 10'a çıkarıldı
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 32,
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  matchNotificationText: {
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    alignItems: 'flex-start',
    marginLeft: 4, // Hamburger menüye çok yakın
    maxWidth: 150, // Uzun isimler için sınır
    flex: 1, // Kalan alanı kapla
  },
  welcomeText: {
    fontSize: 16,
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
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
    marginTop: -20,
    paddingHorizontal: 20,
  },
  animatedCard: {
    position: 'absolute',
  },
  externalInfoButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 25,
    padding: 12,
    zIndex: 10000, // En üstte
    elevation: 15, // Android için
  },
  emptyCard: {
    width: screenWidth * 0.9, // Use screenWidth for full width
    height: 600,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
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
  placeholderImage: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedIndicatorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
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
    height: '80%',
  },
  filterContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  filterSection: {
    marginBottom: 24,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedOption: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  filterFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  applyFilterButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyFilterText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  locationAlert: {
    marginHorizontal: 24,
    marginTop: 0,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignSelf: 'center',
    width: '100%',
  },
  locationAlertGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  locationAlertText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    color: '#FFFFFF',
  },
  filterIcon: {
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorIconText: {
    fontSize: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});