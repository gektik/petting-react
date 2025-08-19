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
import { ArrowLeft, Bell, Shield, Globe, Moon, Smartphone, CircleHelp as HelpCircle, LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

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
      backgroundColor: theme.colors.surface,
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
    placeholder: {
      width: 44,
    },
    settingsGroup: {
      marginBottom: 24,
      paddingHorizontal: 16,
    },
    groupTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
      paddingHorizontal: 8,
    },
    groupContainer: {
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#374151' : '#F3F4F6',
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
    logoutIconContainer: {
      backgroundColor: '#FEF2F2',
    },
    settingTextContainer: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 4,
      color: theme.colors.text,
    },
    settingSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    logoutItem: {
      borderRadius: 16,
      marginHorizontal: 16,
      marginBottom: 32,
      borderBottomWidth: 0,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    logoutText: {
      color: '#EF4444',
    },
  });

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
            });
          },
        },
      ]
    );
  };

  const settingsGroups = [
    {
      title: 'Bildirimler',
      items: [
        {
          icon: Bell,
          title: 'Bildirimler',
          subtitle: 'Uygulama bildirimleri',
          type: 'switch',
          value: notifications,
          onToggle: setNotifications,
        },
        {
          icon: Smartphone,
          title: 'Push Bildirimleri',
          subtitle: 'Anlık bildirimler',
          type: 'switch',
          value: pushNotifications,
          onToggle: setPushNotifications,
        },
      ],
    },
    {
      title: 'Gizlilik',
      items: [
        {
          icon: Shield,
          title: 'Gizlilik Ayarları',
          subtitle: 'Hesap gizliliği',
          type: 'navigation',
          onPress: () => router.push('/privacy-settings'),
        },
        {
          icon: Globe,
          title: 'Konum Paylaşımı',
          subtitle: 'Konumunuzu paylaşın',
          type: 'switch',
          value: locationSharing,
          onToggle: setLocationSharing,
        },
      ],
    },
    {
      title: 'Görünüm',
      items: [
        {
          icon: Moon,
          title: 'Karanlık Mod',
          subtitle: 'Koyu tema kullan',
          type: 'switch',
          value: isDark,
          onToggle: toggleTheme,
        },
      ],
    },
    {
      title: 'Destek',
      items: [
        {
          icon: HelpCircle,
          title: 'Yardım Merkezi',
          subtitle: 'SSS ve destek',
          type: 'navigation',
          onPress: () => router.push('/help-center'),
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => (
    <TouchableOpacity
      key={item.title}
      style={styles.settingItem}
      onPress={item.onPress}
      disabled={item.type === 'switch'}
    >
      <View style={styles.settingIconContainer}>
        <item.icon size={24} color="#6366F1" />
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{item.title}</Text>
        <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
      </View>
      {item.type === 'switch' && (
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
          thumbColor={item.value ? '#FFFFFF' : '#F3F4F6'}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={theme.colors.gradient} style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Ayarlar</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.settingsGroup}>
            <Text style={[styles.groupTitle, { color: theme.colors.text }]}>{group.title}</Text>
            <View style={[styles.groupContainer, { backgroundColor: theme.colors.surface }]}>
              {group.items.map(renderSettingItem)}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.settingItem, styles.logoutItem, { backgroundColor: theme.colors.surface }]}
          onPress={handleLogout}
        >
          <View style={[styles.settingIconContainer, styles.logoutIconContainer]}>
            <LogOut size={24} color="#EF4444" />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingTitle, styles.logoutText]}>Çıkış Yap</Text>
            <Text style={styles.settingSubtitle}>Hesabınızdan güvenle çıkış yapın</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}