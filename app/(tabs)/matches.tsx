import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { MessageCircle, MapPin, X, Heart, Users, ThumbsUp, SkipForward } from 'lucide-react-native';
import { Match, Pet } from '@/types';
import { apiService } from '@/services/api';
import { mockPets } from '@/services/mockData';
import { useTheme } from '@/contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

interface MatchWithPet extends Match {
  matchedPet: Pet;
}

type TabType = 'matches' | 'likes' | 'passes';

// SwipeableItem component for swipe-to-delete functionality
const SwipeableItem = ({ children, onDelete, theme }: { 
  children: React.ReactNode; 
  onDelete: () => void; 
  theme: any;
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -screenWidth * 0.3) {
          // Swipe threshold reached, delete item
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: -screenWidth,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onDelete();
          });
        } else {
          // Return to original position
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.swipeableContainer,
        {
          transform: [{ translateX }],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      {children}
      <View style={[styles.deleteBackground, { backgroundColor: theme.colors.error }]}>
        <X size={24} color="#FFFFFF" />
      </View>
    </Animated.View>
  );
};

export default function MatchesScreen() {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const [matches, setMatches] = useState<MatchWithPet[]>([]);
  const [likes, setLikes] = useState<Pet[]>([]);
  const [passes, setPasses] = useState<Pet[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('matches');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const matchData = await apiService.getMatches();
      const matchesWithPets = matchData.map(match => ({
        ...match,
        matchedPet: mockPets.find(pet => pet.id === match.matchedPetId)!,
      }));
      setMatches(matchesWithPets);
      
      // Mock data for likes and passes
      setLikes(mockPets.slice(0, 3));
      setPasses(mockPets.slice(3, 5));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromList = (petId: string, listType: 'likes' | 'passes') => {
    if (listType === 'likes') {
      setLikes(prev => prev.filter(pet => pet.id !== petId));
    } else {
      setPasses(prev => prev.filter(pet => pet.id !== petId));
    }
  };

  const handleChatPress = (match: MatchWithPet) => {
    console.log('Chat açılıyor:', match.matchedPet.name);
    router.push('/(tabs)/chats');
  };

  const renderMatch = ({ item }: { item: MatchWithPet }) => (
    <TouchableOpacity style={styles.itemCard}>
      <Image source={{ uri: item.matchedPet.photos[0] }} style={styles.petImage} />
      
      <View style={styles.itemInfo}>
        <Text style={styles.petName}>{item.matchedPet.name}</Text>
        <Text style={styles.petBreed}>{item.matchedPet.breed}</Text>
        
        <View style={styles.petDetails}>
          <Text style={styles.petAge}>{item.matchedPet.age} yaşında</Text>
          <Text style={styles.petGender}>
            {item.matchedPet.gender === 'male' ? 'Erkek' : 'Dişi'}
          </Text>
        </View>
        
        {item.matchedPet.location && (
          <View style={styles.locationContainer}>
            <MapPin size={14} color="#6B7280" />
            <Text style={styles.locationText}>{item.matchedPet.location}</Text>
          </View>
        )}
      </View>
      
      <TouchableOpacity style={styles.actionButton}>
        <LinearGradient
        onPress={() => handleChatPress(item)}
          colors={['#6366F1', '#8B5CF6']}
          style={styles.actionButtonGradient}
        >
          <MessageCircle size={20} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderLike = ({ item }: { item: Pet }) => (
    <SwipeableItem 
      onDelete={() => handleRemoveFromList(item.id, 'likes')}
      theme={theme}
    >
      <TouchableOpacity style={styles.itemCard}>
        <Image source={{ uri: item.photos[0] }} style={styles.petImage} />
        
        <View style={styles.itemInfo}>
          <Text style={styles.petName}>{item.name}</Text>
          <Text style={styles.petBreed}>{item.breed}</Text>
          
          <View style={styles.petDetails}>
            <Text style={styles.petAge}>{item.age} yaşında</Text>
            <Text style={styles.petGender}>
              {item.gender === 'male' ? 'Erkek' : 'Dişi'}
            </Text>
          </View>
          
          {item.location && (
            <View style={styles.locationContainer}>
              <MapPin size={14} color="#6B7280" />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </SwipeableItem>
  );

  const renderPass = ({ item }: { item: Pet }) => (
    <SwipeableItem 
      onDelete={() => handleRemoveFromList(item.id, 'passes')}
      theme={theme}
    >
      <TouchableOpacity style={styles.itemCard}>
        <Image source={{ uri: item.photos[0] }} style={styles.petImage} />
        
        <View style={styles.itemInfo}>
          <Text style={styles.petName}>{item.name}</Text>
          <Text style={styles.petBreed}>{item.breed}</Text>
          
          <View style={styles.petDetails}>
            <Text style={styles.petAge}>{item.age} yaşında</Text>
            <Text style={styles.petGender}>
              {item.gender === 'male' ? 'Erkek' : 'Dişi'}
            </Text>
          </View>
          
          {item.location && (
            <View style={styles.locationContainer}>
              <MapPin size={14} color="#6B7280" />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </SwipeableItem>
  );

  const getTabData = () => {
    switch (activeTab) {
      case 'matches':
        return { data: matches, renderItem: renderMatch, emptyText: 'Henüz eşleşme yok' };
      case 'likes':
        return { data: likes, renderItem: renderLike, emptyText: 'Henüz beğeni yok' };
      case 'passes':
        return { data: passes, renderItem: renderPass, emptyText: 'Henüz geçilen yok' };
    }
  };

  const getTabCount = (tab: TabType) => {
    switch (tab) {
      case 'matches':
        return matches.length;
      case 'likes':
        return likes.length;
      case 'passes':
        return passes.length;
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={theme.colors.gradient} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Yükleniyor...</Text>
      </LinearGradient>
    );
  }

  const { data, renderItem, emptyText } = getTabData();

  return (
    <LinearGradient colors={theme.colors.gradient} style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Etkileşimlerim</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'matches' && styles.activeTab]}
          onPress={() => setActiveTab('matches')}
        >
          <Users size={16} color={activeTab === 'matches' ? '#FFFFFF' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'matches' && styles.activeTabText]}>
            Eşleşmelerim
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'likes' && styles.activeTab]}
          onPress={() => setActiveTab('likes')}
        >
          <Heart size={16} color={activeTab === 'likes' ? '#FFFFFF' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'likes' && styles.activeTabText]}>
            Beğendiklerim
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'passes' && styles.activeTab]}
          onPress={() => setActiveTab('passes')}
        >
          <SkipForward size={16} color={activeTab === 'passes' ? '#FFFFFF' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'passes' && styles.activeTabText]}>
            Geçtiklerim
          </Text>
        </TouchableOpacity>
      </View>

      {data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>{emptyText}</Text>
          <Text style={styles.emptySubtitle}>
            Keşfet sekmesinden hayvanları beğenmeye başlayın!
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => 'matchedPet' in item ? item.id : item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginHorizontal: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeTab: {
    backgroundColor: '#6366F1',
  },
  tabText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
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
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 16,
    color: '#6B7280',
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
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    width: 48,
    height: 48,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  swipeableContainer: {
    position: 'relative',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
});