import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ShoppingBag, Star, Plus, Search, Filter } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  category: string;
  description: string;
}

interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
}

export default function MarketScreen() {
  const { theme, isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories: Category[] = [
    { id: 'all', name: 'Tümü', icon: ShoppingBag, color: '#6366F1' },
    { id: 'food', name: 'Mama', icon: ShoppingBag, color: '#10B981' },
    { id: 'toys', name: 'Oyuncak', icon: ShoppingBag, color: '#F59E0B' },
    { id: 'accessories', name: 'Aksesuar', icon: ShoppingBag, color: '#EF4444' },
    { id: 'health', name: 'Sağlık', icon: ShoppingBag, color: '#8B5CF6' },
  ];

  const products: Product[] = [
    {
      id: '1',
      name: 'Premium Köpek Maması',
      price: 299.99,
      image: 'https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.8,
      category: 'food',
      description: 'Yetişkin köpekler için premium kalite mama',
    },
    {
      id: '2',
      name: 'Kedi Oyuncağı Seti',
      price: 89.99,
      image: 'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.6,
      category: 'toys',
      description: 'Kediler için eğlenceli oyuncak seti',
    },
    {
      id: '3',
      name: 'Köpek Tasması',
      price: 149.99,
      image: 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.7,
      category: 'accessories',
      description: 'Dayanıklı ve şık köpek tasması',
    },
    {
      id: '4',
      name: 'Vitamin Takviyesi',
      price: 199.99,
      image: 'https://images.pexels.com/photos/3683107/pexels-photo-3683107.jpeg?auto=compress&cs=tinysrgb&w=400',
      rating: 4.9,
      category: 'health',
      description: 'Hayvanlar için vitamin ve mineral takviyesi',
    },
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingTop: 60,
      paddingHorizontal: 24,
      paddingBottom: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 16,
    },
    headerActions: {
      flexDirection: 'row',
    },
    headerButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: theme.colors.card,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    categoriesContainer: {
      marginBottom: 24,
    },
    categoriesList: {
      paddingHorizontal: 16,
    },
    categoryCard: {
      alignItems: 'center',
      marginRight: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      minWidth: 80,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    selectedCategory: {
      backgroundColor: '#6366F1',
    },
    categoryIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    categoryText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text,
    },
    selectedCategoryText: {
      color: '#FFFFFF',
    },
    productsContainer: {
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
      paddingHorizontal: 8,
    },
    productRow: {
      justifyContent: 'space-between',
    },
    productCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 16,
      padding: 12,
      marginBottom: 16,
      width: '48%',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    productImage: {
      width: '100%',
      height: 120,
      borderRadius: 12,
      marginBottom: 12,
    },
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    productDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 8,
      lineHeight: 16,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    ratingText: {
      fontSize: 14,
      color: theme.colors.text,
      marginLeft: 4,
      fontWeight: '600',
    },
    priceContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    price: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#6366F1',
    },
    addToCartButton: {
      borderRadius: 8,
      overflow: 'hidden',
    },
    addToCartGradient: {
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        selectedCategory === item.id && styles.selectedCategory,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <View style={[styles.categoryIcon, { backgroundColor: `${item.color}20` }]}>
        <item.icon size={24} color={item.color} />
      </View>
      <Text style={[
        styles.categoryText,
        selectedCategory === item.id && styles.selectedCategoryText,
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.ratingContainer}>
          <Star size={16} color="#F59E0B" fill="#F59E0B" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₺{item.price}</Text>
          <TouchableOpacity style={styles.addToCartButton}>
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              style={styles.addToCartGradient}
            >
              <Plus size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={theme.colors.gradient} style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Market</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Evcil hayvan ürünleri
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Search size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Filter size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Products */}
        <View style={styles.productsContainer}>
          <Text style={styles.sectionTitle}>Ürünler</Text>
          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}