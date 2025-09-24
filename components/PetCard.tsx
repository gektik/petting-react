import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, X, Info } from 'lucide-react-native';
import { Pet } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';

interface PetCardProps {
  pet: Pet;
  likeOpacity?: Animated.AnimatedInterpolation<number>;
  passOpacity?: Animated.AnimatedInterpolation<number>;
  distanceKm?: number;
  onInfoPress?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth - 32;

export function PetCard({ 
  pet, 
  likeOpacity,
  passOpacity,
  distanceKm,
  onInfoPress,
}: PetCardProps) {
  const { theme } = useTheme();

  // Güvenli değerler oluştur
  const petName = pet.name || 'İsimsiz';
  const petAge = pet.age || 0;
  const petBreed = pet.breed || 'Bilinmiyor';
  const petGender = pet.gender === 'male' ? 'Erkek' : 'Dişi';
  const petLocation = pet.location || '';
  const petDescription = pet.description || '';

  // İnfo metni oluştur
  let infoText = petGender;
  if (distanceKm !== undefined && distanceKm !== null) {
    const distanceStr = typeof distanceKm === 'number' ? 
      distanceKm.toFixed(1) : 
      String(distanceKm);
    infoText = infoText + " • " + distanceStr + " km uzakta";
  } else {
    infoText = infoText + " • Konum yok";
  }
  if (petLocation) {
    infoText = infoText + " • " + petLocation;
  }

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
      {likeOpacity ? (
        <Animated.View style={[styles.swipeIndicator, styles.likeIndicator, { opacity: likeOpacity, backgroundColor: theme.colors.success + '20' }]}>
          <Heart size={40} color={theme.colors.success} fill={theme.colors.success} />
          <Text style={[styles.swipeText, { color: theme.colors.success }]}>BEĞENDİM</Text>
        </Animated.View>
      ) : null}
      
      {passOpacity ? (
        <Animated.View style={[styles.swipeIndicator, styles.passIndicator, { opacity: passOpacity, backgroundColor: theme.colors.error + '20' }]}>
          <X size={40} color={theme.colors.error} />
          <Text style={[styles.swipeText, { color: theme.colors.error }]}>GEÇ</Text>
        </Animated.View>
      ) : null}
      
      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{petName}</Text>
          {onInfoPress && (
            <TouchableOpacity style={styles.infoButton} onPress={onInfoPress}>
              <Info size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.breed}>{petBreed} • {petAge} yaşında</Text>
        <Text style={styles.infoText}>{infoText}</Text>
      </View>
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  infoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    padding: 10,
    marginLeft: 10,
    borderWidth: 2,
    borderColor: '#3B82F6', // Mavi çerçeve
  },
  breed: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
});