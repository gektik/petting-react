import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Calendar, Heart, X } from 'lucide-react-native';
import { Pet } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

interface PetCardProps {
  pet: Pet;
  onLike?: () => void;
  onPass?: () => void;
  showActions?: boolean;
  swipeDirection?: 'left' | 'right' | null;
  swipeOpacity?: Animated.AnimatedAddition;
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth - 32;

export function PetCard({ 
  pet, 
  onLike, 
  onPass, 
  showActions = true, 
  swipeDirection,
  swipeOpacity 
}: PetCardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Image
        source={{ uri: pet.photos?.[0] || '' }}
        style={styles.image}
        resizeMode="cover"
      />
      
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.gradient}
      />
      
      {/* Swipe Indicators */}
      {swipeDirection === 'right' && swipeOpacity && (
        <Animated.View style={[styles.swipeIndicator, styles.likeIndicator, { opacity: swipeOpacity, backgroundColor: `${theme.colors.success}20` }]}>
          <Heart size={40} color={theme.colors.success} fill={theme.colors.success} />
          <Text style={styles.swipeText}>BEĞENDİM</Text>
        </Animated.View>
      )}
      
      {swipeDirection === 'left' && swipeOpacity && (
        <Animated.View style={[styles.swipeIndicator, styles.passIndicator, { opacity: swipeOpacity, backgroundColor: `${theme.colors.error}20` }]}>
          <X size={40} color={theme.colors.error} />
          <Text style={styles.swipeText}>GEÇ</Text>
        </Animated.View>
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{pet.name}</Text>
          <Text style={styles.age}>{pet.age} yaşında</Text>
        </View>
        
        <Text style={styles.breed}>{pet.breed}</Text>
        
        <View style={styles.info}>
          <View style={styles.infoItem}>
            <Calendar size={14} color="#FFFFFF" />
            <Text style={styles.infoText}>
              {pet.gender === 'male' ? 'Erkek' : 'Dişi'}
            </Text>
          </View>
          {pet.location && (
            <View style={styles.infoItem}>
              <MapPin size={14} color="#FFFFFF" />
              <Text style={styles.infoText}>{pet.location}</Text>
            </View>
          )}
        </View>
        
        {pet.description && (
          <Text style={styles.description} numberOfLines={2}>
            {pet.description}
          </Text>
        )}
      </View>

      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.passButton, { backgroundColor: `${theme.colors.error}20` }]}
            onPress={onPass}
          >
            <X size={24} color={theme.colors.error} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.likeButton, { backgroundColor: `${theme.colors.success}20` }]}
            onPress={onLike}
          >
            <Heart size={24} color={theme.colors.success} fill={theme.colors.success} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    height: 600,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  swipeIndicator: {
    position: 'absolute',
    top: '40%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    borderWidth: 3,
    zIndex: 10,
  },
  likeIndicator: {
    right: 30,
    transform: [{ rotate: '-15deg' }],
  },
  passIndicator: {
    left: 30,
    transform: [{ rotate: '15deg' }],
  },
  swipeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  content: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  age: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  breed: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  info: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  actions: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  passButton: {
  },
  likeButton: {
  },
});