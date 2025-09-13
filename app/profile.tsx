import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Settings, Heart, MessageSquare, CirclePlus as PlusCircle, LogOut, CreditCard as Edit, Camera, Bell, Shield, CircleHelp as HelpCircle, ArrowLeft, Trash2 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { apiService } from '@/services/api';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({
    likesCount: 0,
    matchesCount: 0,
    petsCount: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    // User state'i değiştiğinde sayfayı yenile
    console.log('Profile Screen - User changed:', user);
    setRefreshKey(prev => prev + 1);
  }, [user?.profilePhoto, user?.firstName, user?.lastName]);

  useEffect(() => {
    // İstatistikleri yükle
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      console.log('📊 Profil istatistikleri yükleniyor...');
      
      // Paralel olarak tüm istatistikleri çek
      const [likesCount, matchesCount, userPets] = await Promise.all([
        apiService.getUserLikesCount(),
        apiService.getUserMatchesCount(),
        apiService.getUserPets()
      ]);

      setStats({
        likesCount,
        matchesCount,
        petsCount: userPets.length
      });

      console.log('📊 İstatistikler yüklendi:', {
        likesCount,
        matchesCount,
        petsCount: userPets.length
      });
    } catch (error) {
      console.error('📊 İstatistik yükleme hatası:', error);
      // Hata durumunda varsayılan değerler
      setStats({
        likesCount: 0,
        matchesCount: 0,
        petsCount: 0
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const handleDeleteProfilePhoto = () => {
    Alert.alert(
      'Profil Fotoğrafını Sil',
      'Profil fotoğrafınızı silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting profile photo...');
              // API'ye profil fotoğrafı silme isteği gönder
              await apiService.deleteProfilePhoto();
              
              // Local state'i güncelle - profil fotoğrafını kaldır
              await updateUser({
                profilePhoto: undefined
              });
              
              Alert.alert('Başarılı', 'Profil fotoğrafınız silindi.');
            } catch (error) {
              console.error('Delete profile photo error:', error);
              const errorMessage = error instanceof Error ? error.message : 'Profil fotoğrafı silinirken bir hata oluştu.';
              Alert.alert('Silme Hatası', errorMessage);
            }
          },
        },
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
      onPress: () => Alert.alert('Bilgi', 'Hayvan yönetimi özelliği yakında gelecek.'),
    },
    {
      icon: MessageSquare,
      title: 'Sohbetlerim',
      subtitle: 'Eşleşmelerinizle mesajlaşın',
      onPress: () => Alert.alert('Bilgi', 'Sohbet özelliği yakında gelecek.'),
    },
    {
      icon: Bell,
      title: 'Bildirimler',
      subtitle: 'Bildirim ayarlarınızı düzenleyin',
      onPress: () => Alert.alert('Bilgi', 'Bildirim ayarları özelliği yakında gelecek.'),
    },
    {
      icon: Shield,
      title: 'Gizlilik',
      subtitle: 'Gizlilik ve güvenlik ayarları',
      onPress: () => Alert.alert('Bilgi', 'Gizlilik ayarları özelliği yakında gelecek.'),
    },
    {
      icon: HelpCircle,
      title: 'Yardım',
      subtitle: 'SSS ve destek',
      onPress: () => Alert.alert('Bilgi', 'Yardım merkezi özelliği yakında gelecek.'),
    },
  ];

  const statsData = [
    { icon: Heart, label: 'Beğendiklerim', value: loadingStats ? '...' : stats.likesCount.toString() },
    { icon: MessageSquare, label: 'Eşleşmeler', value: loadingStats ? '...' : stats.matchesCount.toString() },
    { icon: PlusCircle, label: 'Hayvanlarım', value: loadingStats ? '...' : stats.petsCount.toString() },
  ];

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
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={styles.headerGradient}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                key={refreshKey}
                source={user?.profilePhoto 
                  ? { uri: user.profilePhoto } 
                  : require('@/assets/images/icon.svg')
                }
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.cameraButton}>
                <Camera size={16} color="#FFFFFF" />
              </TouchableOpacity>
              {user?.profilePhoto && (
                <TouchableOpacity 
                  style={styles.deletePhotoButton}
                  onPress={handleDeleteProfilePhoto}
                >
                  <Trash2 size={14} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
            
            <Text style={styles.username}>
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.username || 'Kullanıcı'}
            </Text>
            <Text style={styles.email}>{user?.email}</Text>
            <Text style={styles.credentials}>
              Kullanıcı Adı: {user?.username}
            </Text>
            <Text style={styles.credentials}>
              Şifre: ••••••••
            </Text>
            {user?.location && (
              <Text style={styles.location}>{user.location}</Text>
            )}
          </View>
        </LinearGradient>

        <View style={styles.statsContainer}>
          {statsData.map((stat, index) => (
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 16,
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
  placeholder: {
    width: 44,
  },
  headerGradient: {
    paddingTop: 20,
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
  deletePhotoButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
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
  location: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  credentials: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
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