import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { MapPin, Calendar, Plus } from 'lucide-react-native';
import { AdoptionListing, Pet } from '@/types';
import { apiService } from '@/services/api';
import { mockPets } from '@/services/mockData';
import { useTheme } from '@/contexts/ThemeContext';

interface AdoptionListingWithPet extends AdoptionListing {
  pet: Pet;
}

export default function ListingsScreen() {
  const { theme, isDark } = useTheme();
  const [listings, setListings] = useState<AdoptionListingWithPet[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const listingTypes = [
    { id: 'all', name: 'Tümü', color: '#6366F1' },
    { id: 'adoption', name: 'Sahiplendirme', color: '#10B981' },
    { id: 'boarding', name: 'Pansiyon', color: '#8B5CF6' },
    { id: 'walking', name: 'Gezdirme', color: '#EF4444' },
    { id: 'training', name: 'Eğitim', color: '#06B6D4' },
  ];

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const listingData = await apiService.getAdoptionListings();
      const listingsWithPets = listingData.map(listing => ({
        ...listing,
        pet: mockPets.find(pet => pet.id === listing.petId)!,
      }));
      setListings(listingsWithPets);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderListing = ({ item }: { item: AdoptionListingWithPet }) => (
    <TouchableOpacity style={styles.listingCard}>
      <Image source={{ uri: item.pet.photos[0] }} style={styles.petImage} />
      
      <View style={styles.listingInfo}>
        <Text style={styles.listingTitle}>{item.title}</Text>
        <Text style={styles.petName}>{item.pet.name} - {item.pet.breed}</Text>
        
        <View style={styles.petDetails}>
          <Text style={styles.petAge}>{item.pet.age} yaşında</Text>
          <Text style={styles.petGender}>
            {item.pet.gender === 'male' ? 'Erkek' : 'Dişi'}
          </Text>
        </View>
        
        <View style={styles.locationContainer}>
          <MapPin size={14} color="#6B7280" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        
        <View style={styles.dateContainer}>
          <Calendar size={14} color="#6B7280" />
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient colors={theme.colors.gradient} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>İlanlar yükleniyor...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={theme.colors.gradient} style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>İlanlar</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Sahiplendirme ve hizmet ilanları
        </Text>
        
          onPress={() => router.push('/add-listing')}
        <TouchableOpacity style={styles.addButton}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.addButtonGradient}
            onPress={() => router.push('/add-listing')}
          >
            <Plus size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Listing Types */}
        <View style={styles.typesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.typesList}>
              {listingTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeCard,
                    selectedType === type.id && { backgroundColor: type.color },
                  ]}
                  onPress={() => setSelectedType(type.id)}
                >
                  <Text style={[
                    styles.typeText,
                    selectedType === type.id && styles.selectedTypeText,
                  ]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {listings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Henüz ilan yok</Text>
            <Text style={styles.emptySubtitle}>
              İlk sahiplendirme ilanını sen oluştur!
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {listings.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.listingCard}
                onPress={() => router.push(`/edit-listing/${item.id}`)}
              >
                <Image source={{ uri: item.pet.photos[0] }} style={styles.petImage} />
                
                <View style={styles.listingInfo}>
                  <Text style={styles.listingTitle}>{item.title}</Text>
                  <Text style={styles.petName}>{item.pet.name} - {item.pet.breed}</Text>
                  
                  <View style={styles.petDetails}>
                    <Text style={styles.petAge}>{item.pet.age} yaşında</Text>
                    <Text style={styles.petGender}>
                      {item.pet.gender === 'male' ? 'Erkek' : 'Dişi'}
                    </Text>
                  </View>
                  
                  <View style={styles.locationContainer}>
                    <MapPin size={14} color="#6B7280" />
                    <Text style={styles.locationText}>{item.location}</Text>
                  </View>
                  
                  <View style={styles.dateContainer}>
                    <Calendar size={14} color="#6B7280" />
                    <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                  </View>
                  
                  <Text style={styles.description} numberOfLines={2}>
                    {item.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  addButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButtonGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  typesList: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  typeCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedTypeText: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  listingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  petName: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
    marginBottom: 8,
  },
  petDetails: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  petAge: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 12,
  },
  petGender: {
    fontSize: 14,
    color: '#6B7280',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 18,
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
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});