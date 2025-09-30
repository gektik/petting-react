import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { usePet } from '@/contexts/PetContext';
import { apiService } from '@/services/api';
// import { useTheme } from '@/contexts/ThemeContext';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderPetId: string;
  senderPetName: string;
  timestamp: string;
  isOwn: boolean;
}

interface ChatData {
  id: string;
  matchId: string;
  otherPet: {
    id: string;
    name: string;
    photos: string[];
    breed: string;
    age: number;
    gender: string;
  };
  messages: Message[];
}

export default function ChatScreen() {
  const { id: chatId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { selectedPet } = usePet();
  const insets = useSafeAreaInsets();
  // Sabit renkler - theme hatası için
  const colors = {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E2E8F0'
  };
  
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 Chat useEffect çağrıldı:', { chatId, selectedPet: !!selectedPet });
    if (!chatId || !selectedPet) {
      console.log('🔍 Chat useEffect: chatId veya selectedPet yok, çıkılıyor');
      return;
    }

    console.log('🔍 Chat useEffect: loadChatData çağrılıyor');
    loadChatData();
  }, [chatId, selectedPet]);

  const loadChatData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('💬 Sohbet verisi yükleniyor:', chatId);
      
      if (!chatId) {
        throw new Error('Sohbet ID bulunamadı');
      }
      
      // API'den sohbet verilerini al
      const [chatInfo, chatMessages] = await Promise.all([
        apiService.getChatInfo(chatId),
        apiService.getChatMessages(chatId)
      ]);
      
      console.log('✅ Sohbet bilgileri:', chatInfo);
      console.log('✅ Sohbet mesajları:', chatMessages);

      // ChatData'yı oluştur
      const chatData: ChatData = {
        id: chatId,
        matchId: chatInfo.matchId || '',
        otherPet: {
          id: chatInfo.otherPet?.id || '',
          name: chatInfo.otherPet?.name || 'Bilinmeyen Hayvan',
          photos: chatInfo.otherPet?.photos || [],
          breed: chatInfo.otherPet?.breed || '',
          age: chatInfo.otherPet?.age || 0,
          gender: chatInfo.otherPet?.gender || 'male'
        },
        messages: (chatMessages || []).map((msg: any) => ({
          id: msg.id || Date.now().toString(),
          content: msg.content || '',
          senderId: msg.senderId || '',
          senderPetId: msg.senderPetId || '',
          senderPetName: msg.senderPetName || 'Pet',
          timestamp: msg.timestamp || new Date().toISOString(),
          isOwn: msg.isOwn || false
        }))
      };

      setChatData(chatData);
      setMessages(chatData.messages);
      console.log('✅ Sohbet verisi başarıyla yüklendi');
    } catch (error: any) {
      console.error('❌ Sohbet verisi yüklenirken hata:', error);
      
      // Hata durumunda boş veri set et
      setChatData({
        id: chatId || '',
        matchId: '',
        otherPet: {
          id: '',
          name: 'Bilinmeyen Hayvan',
          photos: [],
          breed: '',
          age: 0,
          gender: 'male'
        },
        messages: []
      });
      setMessages([]);
      
      // Hata mesajını ayarla
      const errorMessage = error.message || 'Sohbet yüklenemedi';
      setError(errorMessage);
      
      Alert.alert('Hata', `Sohbet yüklenemedi: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedPet) {
      Alert.alert('Hata', 'Mesaj boş olamaz veya pet seçilmemiş');
      return;
    }

    if (!chatId) {
      Alert.alert('Hata', 'Sohbet ID bulunamadı');
      return;
    }

    const messageText = newMessage.trim();
    setNewMessage('');

    // Optimistic update
    const tempMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      senderId: user?.id || '',
      senderPetId: selectedPet.id,
      senderPetName: selectedPet.name,
      timestamp: new Date().toISOString(),
      isOwn: true
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      console.log('💬 Mesaj gönderiliyor:', { 
        chatId, 
        messageText, 
        senderPetId: selectedPet.id,
        selectedPetName: selectedPet.name,
        userId: user?.id 
      });
      
      // HTTP API ile mesaj gönder
      const result = await apiService.sendChatMessage(chatId, {
        content: messageText,
        senderPetId: selectedPet.id
      });
      
      console.log('✅ Mesaj başarıyla gönderildi:', result);
      
      // Başarılı gönderim sonrası mesajı güncelle
      setMessages(prev => prev.map(msg => 
        msg.id === tempMessage.id 
          ? { ...msg, id: result.id || tempMessage.id }
          : msg
      ));
      
    } catch (error: any) {
      console.error('❌ Mesaj gönderilirken hata:', error);
      
      // Hata durumunda optimistic update'i geri al
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      
      // Detaylı hata mesajı
      let errorMessage = 'Bilinmeyen hata';
      
      if (error.response) {
        // Sunucu hatası
        errorMessage = `Sunucu hatası: ${error.response.status} - ${error.response.data || error.message}`;
      } else if (error.request) {
        // Ağ hatası
        errorMessage = 'Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.';
      } else {
        // Diğer hatalar
        errorMessage = error.message || 'Bilinmeyen hata';
      }
      
      Alert.alert('Mesaj Gönderilemedi', `${errorMessage}\n\nLütfen tekrar deneyin.`);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.isOwn ? styles.ownMessage : styles.otherMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.isOwn ? styles.ownBubble : styles.otherBubble
      ]}>
        <Text style={[
          styles.messageText,
          { color: item.isOwn ? '#FFFFFF' : colors.text }
        ]}>
          {item.content}
        </Text>
        <Text style={[
          styles.messageTime,
          { color: item.isOwn ? '#E5E7EB' : colors.textSecondary }
        ]}>
          {new Date(item.timestamp).toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Sohbet yükleniyor...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, { paddingTop: insets.top }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>❌ {error}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!chatData) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Sohbet yüklenemedi
        </Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Image
              source={{ uri: chatData.otherPet.photos[0] || 'https://via.placeholder.com/40' }}
              style={styles.headerAvatar}
            />
            <View style={styles.headerText}>
              <Text style={[styles.headerName, { color: colors.text }]}>
                {chatData.otherPet.name}
              </Text>
              <Text style={[styles.headerBreed, { color: colors.textSecondary }]}>
                {chatData.otherPet.breed} • {chatData.otherPet.age} yaşında
              </Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        />

        {/* Input */}
        <View style={[styles.inputContainer, { backgroundColor: colors.surface, paddingBottom: insets.bottom + 16 }]}>
          <TextInput
            style={[
              styles.textInput,
              { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border
              }
            ]}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Mesajınızı yazın..."
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: newMessage.trim() ? '#6366F1' : '#9CA3AF' }
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    color: '#6366F1',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: 60,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerBreed: {
    fontSize: 14,
    marginTop: 2,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 12,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  ownBubble: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    minHeight: 70,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    minHeight: 44,
    textAlignVertical: 'top',
    fontSize: 16,
    lineHeight: 20,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});