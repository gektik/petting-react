import { io, Socket } from 'socket.io-client';
import { apiService } from './api';

interface SocketMessage {
  id: string;
  chatId: string;
  content: string;
  senderId: string;
  senderPetId: string;
  senderPetName: string;
  timestamp: string;
  type?: 'text' | 'image' | 'location';
}

interface TypingData {
  chatId: string;
  petId: string;
  isTyping: boolean;
  petName?: string;
}

interface UserStatusData {
  userId: string;
  petId: string;
  isOnline: boolean;
  lastSeen?: string;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private currentUserId: string | null = null;
  private currentPetId: string | null = null;
  private connectionCheckInterval: NodeJS.Timeout | null = null;

  // Socket bağlantısını başlat
  connect(userId: string, petId: string) {
    // Eğer aynı kullanıcı ve pet ile zaten bağlıysa, bağlantıyı yenile
    if (this.socket?.connected && this.currentUserId === userId && this.currentPetId === petId) {
      console.log('Socket zaten aynı kullanıcı ve pet ile bağlı');
      return;
    }

    // Eğer farklı kullanıcı/pet ile bağlıysa, önce bağlantıyı kes
    if (this.socket?.connected) {
      console.log('Farklı kullanıcı/pet ile bağlantı, önceki bağlantı kesiliyor...');
      this.disconnect();
    }

    const token = apiService.getToken();
    if (!token) {
      console.error('Socket bağlantısı için token bulunamadı');
      return;
    }

    console.log('Socket bağlantısı başlatılıyor...', { userId, petId });

    this.currentUserId = userId;
    this.currentPetId = petId;

    this.socket = io('https://pet.kervanbey.com', {
      auth: {
        token,
        userId,
        petId
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      withCredentials: true, // CORS için gerekli
      query: {
        petId: petId // Query string olarak da gönder
      }
    });

    this.setupEventListeners();
    this.startConnectionCheck();
  }

  // Event listener'ları ayarla
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket bağlandı:', this.socket?.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.onConnectionChange?.(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket bağlantısı kesildi:', reason);
      this.isConnected = false;
      this.onConnectionChange?.(false);
      
      if (reason === 'io server disconnect') {
        // Sunucu tarafından kesildi, yeniden bağlanma
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket bağlantı hatası:', error);
      this.isConnected = false;
      this.onConnectionChange?.(false);
      this.handleReconnect();
    });

    this.socket.on('error', (error) => {
      console.error('Socket hatası:', error);
    });

    // Mesaj event'leri
    this.socket.on('message', (data: SocketMessage) => {
      console.log('Yeni mesaj alındı:', data);
      this.onMessage?.(data);
    });

    this.socket.on('message_sent', (data: SocketMessage) => {
      console.log('Mesaj gönderildi:', data);
      this.onMessageSent?.(data);
    });

    this.socket.on('typing', (data: TypingData) => {
      console.log('Yazıyor durumu:', data);
      this.onTyping?.(data);
    });

    this.socket.on('typing_stop', (data: TypingData) => {
      console.log('Yazıyor durumu durdu:', data);
      this.onTypingStop?.(data);
    });

    this.socket.on('user_online', (data: UserStatusData) => {
      console.log('Kullanıcı çevrimiçi:', data);
      this.onUserOnline?.(data);
    });

    this.socket.on('user_offline', (data: UserStatusData) => {
      console.log('Kullanıcı çevrimdışı:', data);
      this.onUserOffline?.(data);
    });

    // Chat room event'leri
    this.socket.on('joined_chat', (data: { chatId: string; petId: string }) => {
      console.log('Sohbete katıldı:', data);
      this.onJoinedChat?.(data);
    });

    this.socket.on('left_chat', (data: { chatId: string; petId: string }) => {
      console.log('Sohbetten ayrıldı:', data);
      this.onLeftChat?.(data);
    });

    // Hata event'leri
    this.socket.on('chat_error', (error: { message: string; chatId?: string }) => {
      console.error('Chat hatası:', error);
      this.onChatError?.(error);
    });
  }

  // Yeniden bağlanma mantığı
  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Maksimum yeniden bağlanma denemesi aşıldı');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`${delay}ms sonra yeniden bağlanma denemesi ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
    
    setTimeout(() => {
      if (this.socket && !this.socket.connected) {
        this.socket.connect();
      }
    }, delay);
  }


  // Yazıyor durumu gönder
  sendTyping(chatId: string, petId: string, isTyping: boolean) {
    if (!this.socket?.connected) return;

    this.socket.emit('typing', {
      chatId,
      petId,
      isTyping
    });
  }

  // Sohbete katıl
  joinChat(chatId: string, petId: string) {
    if (!this.socket?.connected) return;

    console.log('Sohbete katılıyor:', { chatId, petId });
    this.socket.emit('join_chat', { chatId, petId });
  }

  // Sohbetten ayrıl
  leaveChat(chatId: string, petId: string) {
    if (!this.socket?.connected) return;

    console.log('Sohbetten ayrılıyor:', { chatId, petId });
    this.socket.emit('leave_chat', { chatId, petId });
  }

  // Bağlantı kontrolü başlat
  private startConnectionCheck() {
    this.stopConnectionCheck();
    this.connectionCheckInterval = setInterval(() => {
      if (this.socket && !this.socket.connected && this.currentUserId && this.currentPetId) {
        console.log('Socket bağlantısı kontrol ediliyor, yeniden bağlanılıyor...');
        this.handleReconnect();
      }
    }, 30000); // 30 saniyede bir kontrol et
  }

  // Bağlantı kontrolünü durdur
  private stopConnectionCheck() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }
  }

  // Bağlantıyı kes
  disconnect() {
    if (this.socket) {
      console.log('Socket bağlantısı kesiliyor...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentUserId = null;
      this.currentPetId = null;
      this.stopConnectionCheck();
      this.onConnectionChange?.(false);
    }
  }

  // Bağlantı durumunu kontrol et
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Mesaj gönderme (gelişmiş)
  sendMessage(chatId: string, message: string, petId: string, type: 'text' | 'image' | 'location' = 'text') {
    if (!this.socket?.connected) {
      console.error('Socket bağlı değil, mesaj gönderilemiyor');
      return false;
    }

    const messageData: SocketMessage = {
      id: Date.now().toString(),
      chatId,
      content: message,
      senderId: this.currentUserId || '',
      senderPetId: petId,
      senderPetName: '', // Bu bilgi backend'den gelecek
      timestamp: new Date().toISOString(),
      type
    };

    console.log('Mesaj gönderiliyor:', messageData);
    this.socket.emit('send_message', messageData);
    return true;
  }

  // Resim mesajı gönder
  sendImageMessage(chatId: string, imageUrl: string, petId: string, caption?: string) {
    const message = caption || 'Resim gönderildi';
    return this.sendMessage(chatId, imageUrl, petId, 'image');
  }

  // Konum mesajı gönder
  sendLocationMessage(chatId: string, latitude: number, longitude: number, petId: string, address?: string) {
    const locationData = {
      latitude,
      longitude,
      address: address || 'Konum paylaşıldı'
    };
    return this.sendMessage(chatId, JSON.stringify(locationData), petId, 'location');
  }

  // Mesaj durumu güncelle
  markMessageAsRead(chatId: string, messageId: string, petId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit('mark_message_read', {
      chatId,
      messageId,
      petId
    });
  }

  // Tüm mesajları okundu olarak işaretle
  markAllMessagesAsRead(chatId: string, petId: string) {
    if (!this.socket?.connected) return;

    this.socket.emit('mark_all_read', {
      chatId,
      petId
    });
  }

  // Event callback'leri
  onMessage?: (data: SocketMessage) => void;
  onMessageSent?: (data: SocketMessage) => void;
  onTyping?: (data: TypingData) => void;
  onTypingStop?: (data: TypingData) => void;
  onUserOnline?: (data: UserStatusData) => void;
  onUserOffline?: (data: UserStatusData) => void;
  onConnectionChange?: (isConnected: boolean) => void;
  onJoinedChat?: (data: { chatId: string; petId: string }) => void;
  onLeftChat?: (data: { chatId: string; petId: string }) => void;
  onChatError?: (error: { message: string; chatId?: string }) => void;
}

export const socketService = new SocketService();
