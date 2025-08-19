import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Settings, Heart, MessageSquare, CirclePlus as PlusCircle, LogOut, CreditCard as Edit, Camera, Bell, Shield, CircleHelp as HelpCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { apiService } from '@/services/api';
import { Pet } from '@/types';
import { Platform } from 'react-native';
import { mockPets } from '@/services/mockData';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const { user, logout, updateUser, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [petsCount, setPetsCount] = React.useState<number>(0);
  const [loadingPets, setLoadingPets] = React.useState(true);
  const [imageLoading, setImageLoading] = React.useState(false);
  const [currentProfileImage, setCurrentProfileImage] = React.useState<string>(
    user?.profilePhoto || 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  );

  React.useEffect(() => {
    // Only load pets count when authentication is confirmed
    if (!isLoading && isAuthenticated && user) {
      loadPetsCount();
    }
  }, [isLoading, isAuthenticated, user]);

  React.useEffect(() => {
    if (user?.profilePhoto) {
      console.log('Profile Screen: Kullanıcı profil resmi güncelleniyor:', user.profilePhoto);
      setCurrentProfileImage(user.profilePhoto);
    } else {
      console.log('Profile Screen: Kullanıcı profil resmi yok, default kullanılıyor');
    }
  }, [user?.profilePhoto]);

  const loadPetsCount = async () => {
    try {
      setLoadingPets(true);
      let pets: Pet[];
      
      if (Platform.OS === 'web') {
        await new Promise(resolve => setTimeout(resolve, 500));
        pets = mockPets;
      } else {
        pets = await apiService.getUserPets();
      }
      
      setPetsCount(pets.length);
    } catch (error) {
      if (error?.response?.status !== 401) {
        console.error('Error loading pets count:', error);
      }
      setPetsCount(0);
    } finally {
      setLoadingPets(false);
    }
  };

  const pickProfileImage = async () => {
    try {
      setImageLoading(true);
      console.log('🖼️ Profil resmi seçme başlatılıyor...');
      
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişim izni gerekli.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedImage = result.assets[0];
        console.log('🖼️ Resim seçildi, yükleme başlatılıyor...');
        
        try {
          const uploadResult = await apiService.uploadProfileImage(selectedImage.uri);
          const newImageUrl = uploadResult.imageUrl;
         
          if (!newImageUrl) {
            throw new Error('Upload başarılı ama profil resmi URL\'si alınamadı');
          }
         
          console.log('🖼️ Resim başarıyla yüklendi:', newImageUrl);
          setCurrentProfileImage(newImageUrl);
          
          // Kullanıcı bilgilerini güncelle
          console.log('🖼️ Kullanıcı bilgileri güncelleniyor...');
          const updatedUser = { ...user, profilePhoto: newImageUrl };
          updateUser(updatedUser);
          
          // API'ye de profil resmi güncellemesini gönder
          console.log('🖼️ API\'ye profil resmi güncelleme gönderiliyor...');
          try {
            await apiService.updateUserProfile({ profilePictureURL: newImageUrl });
            console.log('🖼️ API profil güncelleme başarılı');
          } catch (apiError) {
            console.warn('🖼️ API profil güncelleme hatası:', apiError);
          }
          
          Alert.alert('Başarılı', 'Profil resmi başarıyla güncellendi!');
        } catch (uploadError) {
          console.error('Profil resmi yükleme hatası:', uploadError);
          Alert.alert(
            'Yükleme Hatası', 
            'Profil resmi yüklenirken hata oluştu. Lütfen tekrar deneyin.',
            [
              { text: 'Tamam' },
              { text: 'Tekrar Dene', onPress: pickProfileImage }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Profil resmi seçme hatası:', error);
      Alert.alert('Hata', 'Profil resmi seçilirken bir hata oluştu.');
    } finally {
      setImageLoading(false);
    }
  };

  const takeProfilePhoto = async () => {
    try {
      setImageLoading(true);
      console.log('📷 Profil fotoğrafı çekme başlatılıyor...');
      
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('İzin Gerekli', 'Fotoğraf çekmek için kamera erişim izni gerekli.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const takenPhoto = result.assets[0];
        console.log('📷 Fotoğraf çekildi, yükleme başlatılıyor...');
        
        try {
          const uploadResult = await apiService.uploadProfileImage(takenPhoto.uri);
          const newImageUrl = uploadResult.imageUrl;
         
          if (!newImageUrl) {
            throw new Error('Upload başarılı ama profil fotoğrafı URL\'si alınamadı');
          }
         
          console.log('📷 Fotoğraf başarıyla yüklendi:', newImageUrl);
          setCurrentProfileImage(newImageUrl);
          
          // Kullanıcı bilgilerini güncelle
          console.log('📷 Kullanıcı bilgileri güncelleniyor...');
          const updatedUser = { ...user, profilePhoto: newImageUrl };
          updateUser(updatedUser);
          
          // API'ye de profil resmi güncellemesini gönder
          console.log('📷 API\'ye profil resmi güncelleme gönderiliyor...');
          try {
            await apiService.updateUserProfile({ profilePictureURL: newImageUrl });
            console.log('📷 API profil güncelleme başarılı');
          } catch (apiError) {
            console.warn('📷 API profil güncelleme hatası:', apiError);
          }
          
          Alert.alert('Başarılı', 'Profil fotoğrafı başarıyla güncellendi!');
        } catch (uploadError) {
          console.error('Profil fotoğrafı yükleme hatası:', uploadError);
          Alert.alert(
            'Yükleme Hatası', 
            'Profil fotoğrafı yüklenirken hata oluştu. Lütfen tekrar deneyin.',
            [
              { text: 'Tamam' },
              { text: 'Tekrar Dene', onPress: takeProfilePhoto }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Profil fotoğrafı çekme hatası:', error);
      Alert.alert('Hata', 'Profil fotoğrafı çekilirken bir hata oluştu.');
    } finally {
      setImageLoading(false);
    }
  };

  const showProfileImageOptions = () => {
    Alert.alert(
      'Profil Fotoğrafı',
      'Profil fotoğrafınızı nereden seçmek istiyorsunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Galeriden Seç', onPress: pickProfileImage },
        { text: 'Fotoğraf Çek', onPress: takeProfilePhoto },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => {
            logout().then(() => {
              router.replace('/welcome');
            }).catch((error) => {
              console.error('Logout error:', error);
              router.replace('/welcome');
            });
          },
        },
      ]
    );
  };

  const handleMyPets = () => {
    router.push('/my-pets');
  };

  const menuItems = [
    {
      icon: Edit,
      title: 'Profili Düzenle',
      subtitle: 'Kişisel bilgilerinizi güncelleyin',
      onPress: () => router.push('/edit-profile'),
    },
    {
      icon: PlusCircle,
      title: 'Hayvanlarım',
      subtitle: 'Hayvan profillerinizi yönetin',
      onPress: handleMyPets,
    },
    {
      icon: Bell,
      title: 'Bildirimler',
      subtitle: 'Bildirim ayarlarınızı düzenleyin',
      onPress: () => router.push('/notifications'),
    },
    {
      icon: Shield,
      title: 'Gizlilik',
      subtitle: 'Gizlilik ve güvenlik ayarları',
      onPress: () => router.push('/privacy-settings'),
    },
    {
      icon: HelpCircle,
      title: 'Yardım',
      subtitle: 'SSS ve destek',
      onPress: () => router.push('/help-center'),
    },
    {
      icon: Settings,
      title: 'Ayarlar',
      subtitle: 'Uygulama ayarları',
      onPress: () => router.push('/settings'),
    },
  ];

  const stats = [
    { icon: Heart, label: 'Beğeniler', value: '24' },
    { icon: MessageSquare, label: 'Eşleşmeler', value: '8' },
    { icon: PlusCircle, label: 'Hayvanlarım', value: loadingPets ? '...' : petsCount.toString() },
  ];

  return (
    <LinearGradient colors={['#F8FAFC', '#E2E8F0']} style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={styles.headerGradient}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: currentProfileImage }}
                style={styles.avatar}
              />
              <TouchableOpacity 
                style={styles.cameraButton}
                onPress={showProfileImageOptions}
                disabled={imageLoading}
              >
                {imageLoading ? (
                  <ActivityIndicator size={16} color="#FFFFFF" />
                ) : (
                  <Camera size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
            
            <Text style={styles.username}>{user?.username}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </LinearGradient>

        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <stat.icon size={24} color="#6366F1" />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.8}
            >
              <View style={styles.menuIconContainer}>
                <item.icon size={24} color="#6366F1" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <View style={[styles.menuIconContainer, styles.logoutIconContainer]}>
              <LogOut size={24} color="#EF4444" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={[styles.menuTitle, styles.logoutText]}>Çıkış Yap</Text>
              <Text style={styles.menuSubtitle}>Hesabınızdan güvenle çıkış yapın</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  menuContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoutIconContainer: {
    backgroundColor: '#FEF2F2',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  logoutItem: {
    marginTop: 16,
    marginBottom: 32,
  },
  logoutText: {
    color: '#EF4444',
  },
});