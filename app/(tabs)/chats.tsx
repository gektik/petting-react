import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MessageCircle } from 'lucide-react-native';
import { Chat } from '@/types';
import { apiService } from '@/services/api';
import { useTheme } from '@/contexts/ThemeContext';

export default function ChatsScreen() {
  const { theme, isDark } = useTheme();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

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
      color: theme.colors.textSecondary,
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
      color: theme.colors.text,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    listContainer: {
      paddingHorizontal: 16,
    },
    chatCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
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
    avatarContainer: {
      position: 'relative',
      marginRight: 16,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
    },
    onlineIndicator: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: '#10B981',
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
    chatInfo: {
      flex: 1,
      marginRight: 12,
    },
    participantName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    lastMessage: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
    chatMeta: {
      alignItems: 'flex-end',
    },
    timeText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    unreadBadge: {
      backgroundColor: '#EF4444',
      borderRadius: 12,
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 8,
    },
    unreadCount: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#FFFFFF',
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
      color: theme.colors.text,
      marginTop: 16,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const chatData = await apiService.getChats();
      setChats(chatData);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (days === 1) {
      return 'Dün';
    } else if (days < 7) {
      return `${days} gün önce`;
    } else {
      return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
      });
    }
  };

  const renderChat = ({ item }: { item: Chat }) => {
    const otherParticipant = item.participants[1]; // Assume first is current user
    
    return (
      <TouchableOpacity 
        style={styles.chatCard}
        onPress={() => router.push(`/chat/${item.id}`)}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: otherParticipant.profilePhoto }}
            style={styles.avatar}
          />
          <View style={styles.onlineIndicator} />
        </View>
        
        <View style={styles.chatInfo}>
          <Text style={styles.participantName}>{otherParticipant.username}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage?.content || 'Henüz mesaj yok'}
          </Text>
        </View>
        
        <View style={styles.chatMeta}>
          <Text style={styles.timeText}>
            {item.lastMessage ? formatTime(item.lastMessage.createdAt) : ''}
          </Text>
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>2</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={theme.colors.gradient} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Sohbetler yükleniyor...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={theme.colors.gradient} style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sohbetler</Text>
        <Text style={styles.headerSubtitle}>
          {chats.length} aktif sohbet
        </Text>
      </View>

      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MessageCircle size={64} color={theme.colors.textSecondary} />
          <Text style={styles.emptyTitle}>Henüz sohbet yok</Text>
          <Text style={styles.emptySubtitle}>
            Eşleşmelerinizle sohbete başlayın!
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChat}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
}