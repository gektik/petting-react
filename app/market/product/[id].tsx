import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Star, ShoppingCart, Heart, Share, Plus, Minus } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  rating: number;
  reviewCount: number;
  category: string;
  description: string;
  features: string[];
  inStock: boolean;
  brand: string;
  weight?: string;
  ingredients?: string[];
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(3); // Mock cart count

  // Mock product data
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Premium Köpek Maması',
      price: 299.99,
      originalPrice: 349.99,
      images: [
        'https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/4498185/pexels-photo-4498185.jpeg?auto=compress&cs=tinysrgb&w=600',
      ],
      rating: 4.8,
      reviewCount: 124,
      category: 'Mama',
      description: 'Yetişkin köpekler için özel olarak formüle edilmiş premium kalite mama. Doğal malzemelerle hazırlanmış, hiçbir yapay koruyucu madde içermez.',
      features: [
        'Doğal malzemeler',
        'Yapay koruyucu yok',
        'Yüksek protein',
        'Omega 3 & 6',
        'Prebiyotik içerir'
      ],
      inStock: true,
      brand: 'PetNutrition',
      weight: '15 kg',
      ingredients: ['Tavuk eti', 'Pirinç', 'Sebzeler', 'Vitaminler', 'Mineraller'],
    },
    {
      id: '2',
      name: 'Kedi Oyuncağı Seti',
      price: 89.99,
      images: [
        'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg?auto=compress&cs=tinysrgb&w=600',
      ],
      rating: 4.6,
      reviewCount: 89,
      category: 'Oyuncak',
      description: 'Kediler için eğlenceli ve güvenli oyuncak seti. Mental stimülasyon sağlar.',
      features: [
        'Güvenli malzeme',
        'Dayanıklı',
        'Mental stimülasyon',
        '5 parça set'
      ],
      inStock: true,
      brand: 'CatPlay',
    },
  ];

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      const foundProduct = mockProducts.find(p => p.id === id);
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        Alert.alert('Hata', 'Ürün bulunamadı.');
        router.back();
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Hata', 'Ürün yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    Alert.alert(
      'Sepete Eklendi',
      `${product?.name} (${quantity} adet) sepetinize eklendi.`,
      [
        { text: 'Alışverişe Devam', style: 'cancel' },
        { text: 'Sepete Git', onPress: () => router.push('/market/cart') },
      ]
    );
  };

  const handleBuyNow = () => {
    Alert.alert(
      'Hemen Al',
      'Bu ürünü hemen satın almak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Satın Al', onPress: () => router.push('/market/checkout') },
      ]
    );
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    Alert.alert(
      isFavorite ? 'Favorilerden Çıkarıldı' : 'Favorilere Eklendi',
      `${product?.name} ${isFavorite ? 'favorilerden çıkarıldı' : 'favorilerinize eklendi'}.`
    );
  };

  if (loading || !product) {
    return (
      <LinearGradient colors={theme.colors.gradient} style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Ürün yükleniyor...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={theme.colors.gradient} style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.colors.surface }]}
            onPress={toggleFavorite}
          >
            <Heart 
              size={24} 
              color={isFavorite ? theme.colors.error : theme.colors.textSecondary}
              fill={isFavorite ? theme.colors.error : 'none'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.push('/market/cart')}
          >
            <ShoppingCart size={24} color={theme.colors.textSecondary} />
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => Alert.alert('Paylaş', 'Paylaşım özelliği yakında gelecek.')}
          >
            <Share size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        <View style={styles.imageContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setSelectedImageIndex(index);
            }}
          >
            {product.images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.productImage} />
            ))}
          </ScrollView>
          
          {product.images.length > 1 && (
            <View style={styles.imageIndicators}>
              {product.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    { backgroundColor: selectedImageIndex === index ? theme.colors.primary : theme.colors.border }
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={[styles.productInfo, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.brandContainer}>
            <Text style={[styles.brand, { color: theme.colors.primary }]}>{product.brand}</Text>
            {!product.inStock && (
              <View style={styles.stockBadge}>
                <Text style={styles.stockText}>Stokta Yok</Text>
              </View>
            )}
          </View>
          
          <Text style={[styles.productName, { color: theme.colors.text }]}>{product.name}</Text>
          
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  color="#F59E0B"
                  fill={star <= Math.floor(product.rating) ? "#F59E0B" : "none"}
                />
              ))}
            </View>
            <Text style={[styles.ratingText, { color: theme.colors.textSecondary }]}>
              {product.rating} ({product.reviewCount} değerlendirme)
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: theme.colors.primary }]}>₺{product.price}</Text>
            {product.originalPrice && (
              <Text style={[styles.originalPrice, { color: theme.colors.textSecondary }]}>
                ₺{product.originalPrice}
              </Text>
            )}
          </View>

          {product.weight && (
            <Text style={[styles.weight, { color: theme.colors.textSecondary }]}>
              Ağırlık: {product.weight}
            </Text>
          )}
        </View>

        {/* Description */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Ürün Açıklaması</Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {product.description}
          </Text>
        </View>

        {/* Features */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Özellikler</Text>
          {product.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={[styles.featureBullet, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Ingredients */}
        {product.ingredients && (
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>İçerik</Text>
            <Text style={[styles.ingredients, { color: theme.colors.textSecondary }]}>
              {product.ingredients.join(', ')}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomContainer, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: theme.colors.background }]}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
          >
            <Minus size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.quantityText, { color: theme.colors.text }]}>{quantity}</Text>
          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: theme.colors.background }]}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Plus size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.addToCartButton, { backgroundColor: `${theme.colors.primary}20` }]}
            onPress={handleAddToCart}
            disabled={!product.inStock}
          >
            <ShoppingCart size={20} color={theme.colors.primary} />
            <Text style={[styles.addToCartText, { color: theme.colors.primary }]}>Sepet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buyNowButton}
            onPress={handleBuyNow}
            disabled={!product.inStock}
          >
            <LinearGradient
              colors={product.inStock ? theme.colors.headerGradient : ['#9CA3AF', '#9CA3AF']}
              style={styles.buyNowGradient}
            >
              <Text style={styles.buyNowText}>
                {product.inStock ? 'Hemen Al' : 'Stokta Yok'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
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
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  productImage: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  productInfo: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  brandContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  brand: {
    fontSize: 16,
    fontWeight: '600',
  },
  stockBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    lineHeight: 32,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 18,
    textDecorationLine: 'line-through',
  },
  weight: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    lineHeight: 24,
  },
  ingredients: {
    fontSize: 16,
    lineHeight: 24,
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 12,
    minWidth: 25,
    textAlign: 'center',
  },
  actionButtons: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  addToCartButton: {
    flex: 0.8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  buyNowButton: {
    flex: 1.2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buyNowGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  buyNowText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});