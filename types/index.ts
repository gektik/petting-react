export interface User {
  id: string;
  email: string;
  username: string;
  profilePhoto?: string;
  firstName?: string;
  lastName?: string;
  location?: string;
  bio?: string;
  createdAt?: string;
}

export interface Pet {
  id: string;
  name: string;
  species: 'cat' | 'dog' | 'other';
  breed: string;
  age: number;
  gender: 'male' | 'female';
  neutered: boolean;
  photos: string[];
  description: string;
  color: string;
  ownerId: string;
  owner?: User;
  isActive: boolean;
  location: string;
  distanceKm?: number; // Mesafe alanı eklendi
  createdAt: string;
  birthDate?: string;
}

export interface Match {
  id: string;
  petId: string;
  matchedPetId: string;
  pet?: Pet;
  matchedPet?: Pet;
  otherPet?: Pet; // API'den gelen otherPet
  chatId?: number; // API'den gelen chatId
  status: 'pending' | 'matched' | 'rejected';
  createdAt: string;
}

export interface AdoptionListing {
  id: string;
  title: string;
  description: string;
  petId: string;
  pet?: Pet;
  contactPreferences: string[];
  location: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderPetId: string;
  senderPetName: string;
  receiverId?: string;
  content: string;
  type: 'text' | 'image' | 'location';
  timestamp: string;
  createdAt?: string;
  isRead?: boolean;
  isOwn?: boolean;
  chatId?: string;
}

export interface Chat {
  id: string;
  matchId: string;
  participants: User[];
  otherPet?: Pet;
  lastMessage?: Message;
  messages: Message[];
  createdAt: string;
  unreadCount?: number;
  isActive?: boolean;
}

export interface ChatListItem {
  id: string;
  matchId: string;
  otherPet: Pet;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
  isActive: boolean;
}

// Socket.io tipleri
export interface SocketMessage {
  id: string;
  chatId: string;
  content: string;
  senderId: string;
  senderPetId: string;
  senderPetName: string;
  timestamp: string;
  type?: 'text' | 'image' | 'location';
}

export interface TypingData {
  chatId: string;
  petId: string;
  isTyping: boolean;
  petName?: string;
}

export interface UserStatusData {
  userId: string;
  petId: string;
  isOnline: boolean;
  lastSeen?: string;
}

// API Response tipleri
export interface ApiResponse<T> {
  isSuccess: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// Filter tipleri
export interface PetFilter {
  species?: Species;
  gender?: Gender;
  ageMin?: number;
  ageMax?: number;
  neutered?: boolean;
  breed?: string;
  color?: string;
  location?: {
    latitude: number;
    longitude: number;
    radiusKm?: number;
  };
}

// Notification tipleri
export interface Notification {
  id: string;
  type: 'match' | 'message' | 'like' | 'system';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export type Species = 'dog' | 'cat' | 'bird' | 'rabbit' | 'fish' | 'other';
export type Gender = 'male' | 'female';