import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Eye, EyeOff, Users, MapPin, MessageSquare, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showLikes, setShowLikes] = useState(true);

  const privacySettings = [
    {
      icon: profileVisibility ? Eye : EyeOff,
      title: 'Profil Görünürlüğü',
      subtitle: 'Profilinizi herkes görebilir',
      value: profileVisibility,
      onToggle: setProfileVisibility,
    },
    {
      icon: MapPin,
      title: 'Konum Bilgisi',
      subtitle: 'Konumunuzu diğer kullanıcılara göster',
      value: showLocation,
      onToggle: setShowLocation,
    },
    {
      icon: MessageSquare,
      title: 'Mesaj İzinleri',
      subtitle: 'Eşleşmediğiniz kişilerden mesaj alın',
      value: allowMessages,
      onToggle: setAllowMessages,
    },
    {
      icon: Users,
      title: 'Çevrimiçi Durumu',
      subtitle: 'Çevrimiçi olduğunuzda gösterilsin',
      value: showOnlineStatus,
      onToggle: setShowOnlineStatus,
    },
    {
      icon: Heart,
      title: 'Beğeni Bildirimleri',
      subtitle: 'Beğenilerinizi diğerleri görebilir',
      value: showLikes,
      onToggle: setShowLikes,
    },
  ];

  const handleBlockedUsers = () => {
    Alert.alert('Bilgi', 'Engellenen kullanıcılar özelliği yakında gelecek.');
  };

  const handleDataDownload = () => {
    Alert.alert('Bilgi', 'Veri indirme özelliği yakında gelecek.');
  };

  const handleAccountDeletion = () => {
    Alert.alert(
      'Hesabı Sil',
      'Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecek.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => Alert.alert('Bilgi', 'Hesap silme özelliği yakında gelecek.'),
        },
      ]
    );
  };

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
        <Text style={styles.headerTitle}>Gizlilik Ayarları</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Gizlilik Kontrolü</Text>
          {privacySettings.map((setting, index) => (
            <View key={index} style={styles.settingItem}>
              <View style={styles.settingIconContainer}>
                <setting.icon size={24} color="#6366F1" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{setting.title}</Text>
                <Text style={styles.settingSubtitle}>{setting.subtitle}</Text>
              </View>
              <Switch
                value={setting.value}
                onValueChange={setting.onToggle}
                trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
                thumbColor={setting.value ? '#FFFFFF' : '#F3F4F6'}
              />
            </View>
          ))}
        </View>

        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Hesap İşlemleri</Text>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleBlockedUsers}>
            <Text style={styles.actionTitle}>Engellenen Kullanıcılar</Text>
            <Text style={styles.actionSubtitle}>Engellediğiniz kullanıcıları yönetin</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleDataDownload}>
            <Text style={styles.actionTitle}>Verilerimi İndir</Text>
            <Text style={styles.actionSubtitle}>Hesap verilerinizi indirin</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionItem, styles.dangerAction]} 
            onPress={handleAccountDeletion}
          >
            <Text style={[styles.actionTitle, styles.dangerText]}>Hesabımı Sil</Text>
            <Text style={styles.actionSubtitle}>Hesabınızı kalıcı olarak silin</Text>
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
  placeholder: {
    width: 44,
  },
  settingsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  dangerAction: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#EF4444',
  },
});