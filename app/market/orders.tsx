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
import { ArrowLeft, Package, Truck, CircleCheck as CheckCircle, Clock, RotateCcw, ShoppingBag } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export default function OrdersScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'completed'>('all');
  const [orders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'PET-2024-001',
      date: '2024-03-10',
      status: 'shipped',
      total: 707.96,
      trackingNumber: 'TRK123456789',
      estimatedDelivery: '2024-03-15',
      items: [
        {
          id: '1',
          productId: '1',
          name: 'Premium Köpek Maması',
          price: 299.99,
          image: 'https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&cs=tinysrgb&w=400',
          quantity: 2,
        },
        {
          id: '2',
          productId: '2',
          name: 'Kedi Oyuncağı Seti',
          price: 89.99,
          image: 'https://images.pexels.com/photos/1404819/pexels-photo-1404819.jpeg?auto=compress&cs=tinysrgb&w=400',
          quantity: 1,
        },
      ],
    },
    {
      id: '2',
      orderNumber: 'PET-2024-002',
      date: '2024-03-05',
      status: 'delivered',
      total: 149.99,
      items: [
        {
          id: '3',
          productId: '3',
          name: 'Köpek Tasması',
          price: 149.99,
          image: 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=400',
          quantity: 1,
        },
      ],
    },
    {
      id: '3',
      orderNumber: 'PET-2024-003',
      date: '2024-03-12',
      status: 'processing',
      total: 199.99,
      estimatedDelivery: '2024-03-18',
      items: [
        {
          id: '4',
          productId: '4',
          name: 'Vitamin Takviyesi',
          price: 199.99,
          image: 'https://images.pexels.com/photos/3683107/pexels-photo-3683107.jpeg?auto=compress&cs=tinysrgb&w=400',
          quantity: 1,
        },
      ],
    },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={20} color="#F59E0B" />;
      case 'processing':
        return <Package size={20} color="#6366F1" />;
      case 'shipped':
        return <Truck size={20} color="#8B5CF6" />;
      case 'delivered':
        return <CheckCircle size={20} color="#10B981" />;
      case 'cancelled':
        return <RotateCcw size={20} color="#EF4444" />;
      default:
        return <Package size={20} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'processing':
        return '#6366F1';
      case 'shipped':
        return '#8B5CF6';
      case 'delivered':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'processing':
        return 'Hazırlanıyor';
      case 'shipped':
        return 'Kargoda';
      case 'delivered':
        return 'Teslim Edildi';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
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

  const getFilteredOrders = () => {
    switch (selectedTab) {
      case 'active':
        return orders.filter(order => ['pending', 'processing', 'shipped'].includes(order.status));
      case 'completed':
        return orders.filter(order => ['delivered', 'cancelled'].includes(order.status));
      default:
        return orders;
    }
  };

  const renderOrderItem = ({ item }: { item: OrderItem }) => (
    <View style={styles.orderItemContainer}>
      <Image source={{ uri: item.image }} style={styles.orderItemImage} />
      <View style={styles.orderItemInfo}>
        <Text style={[styles.orderItemName, { color: theme.colors.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.orderItemDetails, { color: theme.colors.textSecondary }]}>
          {item.quantity} adet × ₺{item.price}
        </Text>
      </View>
      <Text style={[styles.orderItemTotal, { color: theme.colors.primary }]}>
        ₺{(item.price * item.quantity).toFixed(2)}
      </Text>
    </View>
  );

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity 
      style={[styles.orderCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => router.push(`/market/order-detail/${item.id}`)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={[styles.orderNumber, { color: theme.colors.text }]}>#{item.orderNumber}</Text>
          <Text style={[styles.orderDate, { color: theme.colors.textSecondary }]}>
            {formatDate(item.date)}
          </Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          {getStatusIcon(item.status)}
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <FlatList
        data={item.items}
        renderItem={renderOrderItem}
        keyExtractor={(orderItem) => orderItem.id}
        scrollEnabled={false}
        style={styles.orderItems}
      />

      <View style={styles.orderFooter}>
        <View style={styles.orderTotal}>
          <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>Toplam:</Text>
          <Text style={[styles.totalAmount, { color: theme.colors.primary }]}>₺{item.total.toFixed(2)}</Text>
        </View>
        
        {item.trackingNumber && (
          <Text style={[styles.trackingNumber, { color: theme.colors.textSecondary }]}>
            Takip: {item.trackingNumber}
          </Text>
        )}
        
        {item.estimatedDelivery && (
          <Text style={[styles.estimatedDelivery, { color: theme.colors.textSecondary }]}>
            Tahmini teslimat: {formatDate(item.estimatedDelivery)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const filteredOrders = getFilteredOrders();

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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Siparişlerim</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
            Tümü ({orders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'active' && styles.activeTab]}
          onPress={() => setSelectedTab('active')}
        >
          <Text style={[styles.tabText, selectedTab === 'active' && styles.activeTabText]}>
            Aktif ({orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'completed' && styles.activeTab]}
          onPress={() => setSelectedTab('completed')}
        >
          <Text style={[styles.tabText, selectedTab === 'completed' && styles.activeTabText]}>
            Tamamlanan ({orders.filter(o => ['delivered', 'cancelled'].includes(o.status)).length})
          </Text>
        </TouchableOpacity>
      </View>

      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Package size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Henüz sipariş yok</Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
            İlk siparişinizi vererek başlayın
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
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ordersList}
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  ordersList: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  orderCard: {
    borderRadius: 16,
    padding: 16,
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  orderItems: {
    marginBottom: 16,
  },
  orderItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderItemDetails: {
    fontSize: 12,
  },
  orderItemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  trackingNumber: {
    fontSize: 12,
    marginBottom: 4,
  },
  estimatedDelivery: {
    fontSize: 12,
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