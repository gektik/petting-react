import { User, Pet, Match, AdoptionListing, Chat, Message } from '@/types';

export const mockUser: User = {
  id: '1',
  email: 'user@example.com',
  username: 'petlover',
  profilePhoto: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
  location: 'İstanbul, Türkiye',
  createdAt: '2024-01-01T00:00:00.000Z',
};

export const mockPets: Pet[] = [
  {
    id: '1',
    name: 'Buddy',
    species: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'male',
    neutered: true,
    photos: [
      'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/58997/pexels-photo-58997.jpeg?auto=compress&cs=tinysrgb&w=400',
    ],
    description: 'Çok sevimli ve enerjik bir köpek. Çocuklarla çok iyi anlaşıyor.',
    color: 'Altın Sarısı',
    ownerId: '2',
    isActive: true,
    location: 'İstanbul',
    createdAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: '2',
    name: 'Luna',
    species: 'cat',
    breed: 'Tekir',
    age: 2,
    gender: 'female',
    neutered: true,
    photos: [
      'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/320014/pexels-photo-320014.jpeg?auto=compress&cs=tinysrgb&w=400',
    ],
    description: 'Çok sakin ve sevecen bir kedi. Kucakta uyumayı seviyor.',
    color: 'Gri-Beyaz',
    ownerId: '3',
    isActive: true,
    location: 'Ankara',
    createdAt: '2024-01-20T00:00:00.000Z',
  },
  {
    id: '3',
    name: 'Max',
    species: 'dog',
    breed: 'Husky',
    age: 4,
    gender: 'male',
    neutered: false,
    photos: [
      'https://images.pexels.com/photos/605296/pexels-photo-605296.jpeg?auto=compress&cs=tinysrgb&w=400',
    ],
    description: 'Çok aktif ve oyuncu. Günlük uzun yürüyüşlere ihtiyacı var.',
    color: 'Siyah-Beyaz',
    ownerId: '4',
    isActive: true,
    location: 'İzmir',
    createdAt: '2024-01-25T00:00:00.000Z',
  },
];

export const mockMatches: Match[] = [
  {
    id: '1',
    petId: '1',
    matchedPetId: '2',
    status: 'matched',
    createdAt: '2024-02-01T00:00:00.000Z',
  },
];

export const mockAdoptionListings: AdoptionListing[] = [
  {
    id: '1',
    title: 'Sevimli Yavru Kedi Sahiplendirme',
    description: 'İki aylık yavru kedi sahiplendirilecektir. Çok sevimli ve sağlıklı.',
    petId: '2',
    contactPreferences: ['phone', 'message'],
    location: 'Kadıköy, İstanbul',
    createdAt: '2024-02-05T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Golden Retriever Sahiplendirme',
    description: 'Çok tatlı ve eğitimli golden retriever sahiplendirilecektir.',
    petId: '1',
    contactPreferences: ['message'],
    location: 'Çankaya, Ankara',
    createdAt: '2024-02-10T00:00:00.000Z',
  },
];

export const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '1',
    receiverId: '2',
    content: 'Merhaba! Buddy çok sevimli görünüyor.',
    type: 'text',
    createdAt: '2024-02-15T10:00:00.000Z',
  },
  {
    id: '2',
    senderId: '2',
    receiverId: '1',
    content: 'Teşekkür ederim! Luna da çok tatlı.',
    type: 'text',
    createdAt: '2024-02-15T10:05:00.000Z',
  },
];

export const mockChats: Chat[] = [
  {
    id: '1',
    participants: [
      mockUser,
      {
        id: '2',
        email: 'owner2@example.com',
        username: 'dogowner',
        profilePhoto: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    ],
    messages: mockMessages,
    lastMessage: mockMessages[1],
    createdAt: '2024-02-15T10:00:00.000Z',
  },
];