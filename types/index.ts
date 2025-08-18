export interface User {
  id: string;
  email: string;
  username: string;
  profilePhoto?: string;
  location?: string;
  createdAt: string;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
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
  location?: string;
  createdAt: string;
  birthDate?: string;
}

export interface Match {
  id: string;
  petId: string;
  matchedPetId: string;
  pet?: Pet;
  matchedPet?: Pet;
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
  receiverId: string;
  content: string;
  type: 'text' | 'photo' | 'location';
  createdAt: string;
}

export interface Chat {
  id: string;
  participants: User[];
  lastMessage?: Message;
  messages: Message[];
  createdAt: string;
}

export type Species = 'dog' | 'cat' | 'bird' | 'rabbit' | 'fish' | 'other';
export type Gender = 'male' | 'female';