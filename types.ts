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
  isActive: boolean;
  location: string;
  distanceKm?: number; // Mesafe alanı eklendi
  createdAt: string;
  birthDate?: string;
}
