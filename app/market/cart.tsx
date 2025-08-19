import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, CreditCard } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  inStock: boolean;
}

export default function CartScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      productId: '1',
      name: 'Premium Köpek Maması',
      price: 299.99,
      image: 'https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&cs=tinysrgb&w=400',
      quantity: 2,
      inStock: true,
    },
    {
      id: '2',
      productId: '2',
      name: 'Kedi Oyuncağı Seti',
      price: 89.99,
      image: 'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg?auto=compress&cs=tinysrgb&w=400',
      quantity: 1,
      inStock: true,
    },
    {
      id: '3',
      productId: '3',
      name: 'Köpek Tasması',
      price: 149.99,
      image: 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=400',
      quantity: 1,
      inStock: false,
    },
  ]);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    const item = cartItems.find(item => item.id === id);
    Alert.alert(
      'Ürünü Kaldır',
      `${item?.name} sepetinizden kaldırılsın mı?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: () => {
            setCartItems(prev => prev.filter(item => item.id !== id));
          },
        },
      ]
    );
  };

  const clearCart = () => {
    Alert.alert(
      'Sepeti Temizle',
      'Sepetinizdeki tüm ürünler kaldırılacak. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: () => setCartItems([]),
        },
      ]
    );
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 500 ? 0 : 29.99;
  const total = subtotal + shipping;
  const inStockItems = cartItems.filter(item => item.inStock);
  const outOfStockItems = cartItems.filter(item => !item.inStock);

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={[styles.cartItem, { backgroundColor: theme.colors.surface }, !item.inStock && styles.outOfStockItem]}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: theme.colors.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.itemPrice, { color: theme.colors.primary }]}>₺{item.price}</Text>
        {!item.inStock && (
          <Text style={[styles.outOfStockText, { color: theme.colors.error }]}>Stokta yok</Text>
        )}
      </View>

      <View style={styles.itemActions}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: theme.colors.background }]}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Minus size={16} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.quantityText, { color: theme.colors.text }]}>{item.quantity}</Text>
          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: theme.colors.background }]}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
            disabled={!item.inStock}
          >
            <Plus size={16} color={item.inStock ? theme.colors.text : theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: `${theme.colors.error}20` }]}
          onPress={() => removeItem(item.id)}
        >
          <Trash2 size={16} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (cartItems.length === 0) {
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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Sepetim</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.emptyContainer}>
          <ShoppingBag size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Sepetiniz boş</Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
            Market'ten ürün ekleyerek alışverişe başlayın
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/(tabs)/market')}
          >
            <LinearGradient
              colors={theme.colors.headerGradient}
              style={styles.shopGradient}
            >
              <ShoppingBag size={20} color="#FFFFFF" />
              <Text style={styles.shopText}>Alışverişe Başla</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Sepetim ({cartItems.length})</Text>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: theme.colors.surface }]}
          onPress={clearCart}
        >
          <Trash2 size={24} color={theme.colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Out of Stock Items */}
        {outOfStockItems.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.error }]}>Stokta Olmayan Ürünler</Text>
            <FlatList
              data={outOfStockItems}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* In Stock Items */}
        {inStockItems.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sepetinizdeki Ürünler</Text>
            <FlatList
              data={inStockItems}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Price Summary */}
        {inStockItems.length > 0 && (
          <View style={[styles.summaryContainer, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Sipariş Özeti</Text>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Ara Toplam</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>₺{subtotal.toFixed(2)}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Kargo</Text>
              <Text style={[styles.summaryValue, { color: shipping === 0 ? theme.colors.success : theme.colors.text }]}>
                {shipping === 0 ? 'Ücretsiz' : `₺${shipping.toFixed(2)}`}
              </Text>
            </View>
            
            {shipping === 0 && (
              <Text style={[styles.freeShippingText, { color: theme.colors.success }]}>
                🎉 500₺ üzeri kargo bedava!
              </Text>
            )}
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.totalLabel, { color: theme.colors.text }]}>Toplam</Text>
              <Text style={[styles.totalValue, { color: theme.colors.primary }]}>₺{total.toFixed(2)}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Checkout Button */}
      {inStockItems.length > 0 && (
        <View style={[styles.checkoutContainer, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => router.push('/market/checkout')}
          >
            <LinearGradient
              colors={theme.colors.headerGradient}
              style={styles.checkoutGradient}
            >
              <CreditCard size={20} color="#FFFFFF" />
              <Text style={styles.checkoutText}>Ödemeye Geç (₺{total.toFixed(2)})</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 20,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 44,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  cartItem: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  outOfStockItem: {
    opacity: 0.6,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 22,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  outOfStockText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemActions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
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
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  freeShippingText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  checkoutContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  checkoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  checkoutText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
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
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  shopButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  shopGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  shopText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});