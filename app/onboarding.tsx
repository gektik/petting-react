import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { ChevronRight, Heart, PlusCircle, Users, Activity, ArrowRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  color: string;
  image: string;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<any>(null);

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: 'Hoş Geldiniz!',
      subtitle: 'Petting\'e Katılın',
      description: 'Sevimli dostlarınızla tanışın ve hayvan severlerin büyük ailesine katılın.',
      icon: Heart,
      color: '#6366F1',
      image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      id: 2,
      title: 'Giriş Yapın',
      subtitle: 'Hesabınızı Oluşturun',
      description: 'Hızlı kayıt ile hesabınızı oluşturun veya mevcut hesabınızla giriş yapın.',
      icon: Users,
      color: '#10B981',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      id: 3,
      title: 'Hayvanınızı Ekleyin',
      subtitle: 'Profil Oluşturun',
      description: 'Sevimli dostunuzun profilini oluşturun ve en güzel fotoğraflarını paylaşın.',
      icon: PlusCircle,
      color: '#F59E0B',
      image: 'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      id: 4,
      title: 'Eşleşmeleri Keşfedin',
      subtitle: 'Yeni Dostluklar',
      description: 'Yakınınızdaki sevimli hayvanları keşfedin ve yeni dostluklar kurun.',
      icon: Heart,
      color: '#EF4444',
      image: 'https://images.pexels.com/photos/605296/pexels-photo-605296.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      id: 5,
      title: 'Sağlık Takibi',
      subtitle: 'Sağlıklı Yaşam',
      description: 'Hayvanınızın sağlık kayıtlarını tutun, randevularını takip edin.',
      icon: Activity,
      color: '#8B5CF6',
      image: 'https://images.pexels.com/photos/4498185/pexels-photo-4498185.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextIndex = currentStep + 1;
      setCurrentStep(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      router.replace('/welcome');
    }
  };

  const skipOnboarding = () => {
    router.replace('/welcome');
  };

  const renderStep = ({ item, index }: { item: OnboardingStep; index: number }) => (
    <View style={styles.stepContainer}>
      <LinearGradient
        colors={[`${item.color}20`, `${item.color}10`]}
        style={styles.imageContainer}
      >
        <Image source={{ uri: item.image }} style={styles.stepImage} />
        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          <item.icon size={32} color="#FFFFFF" />
        </View>
      </LinearGradient>
      
      <View style={styles.textContainer}>
        <Text style={styles.stepTitle}>{item.title}</Text>
        <Text style={styles.stepSubtitle}>{item.subtitle}</Text>
        <Text style={styles.stepDescription}>{item.description}</Text>
      </View>
    </View>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {steps.map((_, index) => {
        const opacity = scrollX.interpolate({
          inputRange: [(index - 1) * width, index * width, (index + 1) * width],
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        const scale = scrollX.interpolate({
          inputRange: [(index - 1) * width, index * width, (index + 1) * width],
          outputRange: [0.8, 1.2, 0.8],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                opacity,
                transform: [{ scale }],
                backgroundColor: steps[index].color,
              },
            ]}
          />
        );
      })}
    </View>
  );

  return (
    <LinearGradient colors={['#667EEA', '#764BA2', '#F093FB']} style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
          <Text style={styles.skipText}>Geç</Text>
        </TouchableOpacity>
      </View>

      <Animated.FlatList
        ref={flatListRef}
        data={steps}
        renderItem={renderStep}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentStep(index);
        }}
        scrollEventThrottle={16}
      />

      {renderDots()}

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === steps.length - 1 ? 'Başlayalım' : 'Devam'}
            </Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: 'flex-end',
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stepContainer: {
    width: width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  imageContainer: {
    width: 280,
    height: 280,
    borderRadius: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
    position: 'relative',
  },
  stepImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.8,
  },
  iconContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  stepTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  bottomContainer: {
    paddingHorizontal: 32,
    paddingBottom: 50,
  },
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
});