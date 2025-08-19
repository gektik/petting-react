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

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [petsCount, setPetsCount] = React.useState<number>(0);
  const [loadingPets, setLoadingPets] = React.useState(true);

  React.useEffect(() => {
    loadPetsCount();
  }, []);

  const loadPetsCount = async () => {
    try {
      setLoadingPets(true);
      let pets: Pet[];
      
      if (Platform.OS === 'web') {
        // Web platformunda mock data kullan
        await new Promise(resolve => setTimeout(resolve, 500));
        pets = mockPets;
      } else {
        pets = await apiService.getUserPets();
      }
      
      setPetsCount(pets.length);
    } catch (error) {
      console.error('Error loading pets count:', error);
      setPetsCount(0);
    } finally {
      setLoadingPets(false);
    }
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
    console.log('Hayvanlarım butonuna tıklandı');
    router.push('/my-pets');
  };

  const handleAddPet = () => {
    console.log('Yeni hayvan ekleme sayfasına yönlendiriliyor...');
    router.push('/add-pet');
  };

  const menuItems = [
    {
      icon: Edit,
      title: 'Profili Düzenle',
      subtitle: 'Kişisel bilgilerinizi güncelleyin',
      onPress: () => Alert.alert('Bilgi', 'Profil düzenleme özelliği yakında gelecek.'),
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
                source={{ uri: user?.profilePhoto || 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.cameraButton}>
                <Camera size={16} color="#FFFFFF" />
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
              onPress={() => {
                console.log('Menu item pressed:', item.title);
                item.onPress();
              }}
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
            onPress={() => {
              console.log('Logout pressed');
              handleLogout();
            }}
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