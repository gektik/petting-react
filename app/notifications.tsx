import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Heart, MessageSquare, Users, Bell, Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface Notification {
  id: string;
  type: 'like' | 'match' | 'message' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  avatar?: string;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'like',
      title: 'Yeni Beğeni!',
      message: 'Luna sizi beğendi',
      time: '5 dakika önce',
      read: false,
      avatar: 'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    {
      id: '2',
      type: 'match',
      title: 'Eşleştiniz! 🎉',
      message: 'Buddy ile eşleştiniz! Artık mesajlaşabilirsiniz.',
      time: '1 saat önce',
      read: false,
      avatar: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    {
      id: '3',
      type: 'message',
      title: 'Yeni Mesaj',
      message: 'Max size bir mesaj gönderdi',
      time: '2 saat önce',
      read: true,
      avatar: 'https://images.pexels.com/photos/605296/pexels-photo-605296.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    {
      id: '4',
      type: 'system',
      title: 'Profil Güncellemesi',
      message: 'Profilinizi tamamlayarak daha fazla eşleşme elde edin!',
      time: '1 gün önce',
      read: true,
    },
    {
      id: '5',
      type: 'like',
      title: 'Yeni Beğeni!',
      message: 'Mia sizi beğendi',
      time: '2 gün önce',
      read: true,
      avatar: 'https://images.pexels.com/photos/320014/pexels-photo-320014.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart size={20} color="#EF4444" fill="#EF4444" />;
      case 'match':
        return <Users size={20} color="#10B981" />;
      case 'message':
        return <MessageSquare size={20} color="#6366F1" />;
      case 'system':
        return <Bell size={20} color="#F59E0B" />;
      default:
        return <Bell size={20} color="#6B7280" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'like':
        return '#FEF2F2';
      case 'match':
        return '#F0FDF4';
      case 'message':
        return '#F0F4FF';
      case 'system':
        return '#FFFBEB';
      default:
        return '#F8FAFC';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
        <Text style={styles.headerTitle}>Bildirimler</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Settings size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {unreadCount > 0 && (
          <View style={styles.unreadHeader}>
            <Text style={styles.unreadText}>{unreadCount} okunmamış bildirim</Text>
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={styles.markAllReadText}>Tümünü okundu işaretle</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.notificationsContainer}>
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                !notification.read && styles.unreadNotification,
              ]}
              onPress={() => markAsRead(notification.id)}
            >
              <View style={styles.notificationContent}>
                <View style={styles.notificationLeft}>
                  {notification.avatar ? (
                    <Image
                      source={{ uri: notification.avatar }}
                      style={styles.notificationAvatar}
                    />
                  ) : (
                    <View style={[
                      styles.notificationIconContainer,
                      { backgroundColor: getNotificationColor(notification.type) }
                    ]}>
                      {getNotificationIcon(notification.type)}
                    </View>
                  )}
                </View>
                
                <View style={styles.notificationTextContainer}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
                
                {!notification.read && <View style={styles.unreadDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {notifications.length === 0 && (
          <View style={styles.emptyContainer}>
            <Bell size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Henüz bildirim yok</Text>
            <Text style={styles.emptySubtitle}>
              Yeni beğeniler ve eşleşmeler burada görünecek
            </Text>
          </View>
        )}
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
  settingsButton: {
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
  unreadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#F0F4FF',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  unreadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  markAllReadText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  notificationsContainer: {
    paddingHorizontal: 16,
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  notificationLeft: {
    marginRight: 16,
  },
  notificationAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});