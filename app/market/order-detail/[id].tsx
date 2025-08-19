import React, { useState, useEffect } from 'react';
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
import { ArrowLeft, Package, Truck, CircleCheck as CheckCircle, Clock, RotateCcw, MapPin, Phone, Mail, Copy } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
  subtotal: number;
  shipping: number;
  tax: number;
  items: OrderItem[];
  trackingNumber?: string;
  estimatedDelivery?: string;
  deliveryAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  timeline: {
    status: string;
    date: string;
    description: string;
  }[];
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock order data
  const mockOrders: Order[] = [
    {
      id: '1',
      orderNumber: 'PET-2024-001',
      date: '2024-03-10',
      status: 'shipped',
      total: 707.96,
      subtotal: 599.97,
      shipping: 0,
      tax: 107.99,
      trackingNumber: 'TRK123456789',
      estimatedDelivery: '2024-03-15',
      deliveryAddress: {
        name: 'Ahmet Yılmaz',
        address: 'Kızılay Mah. Atatürk Blv. No:123 Daire:5',
        city: 'Ankara',
        postalCode: '06420',
        phone: '+90 532 123 45 67',
      },
      items: [
        {
          id: '1',
          productId: '1',
          name: 'Premium Köpek Maması',
          price: 299.99,
          image: 'https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&cs=tinysrgb&w=400',
          quantity: 2,
        },
      ],
      timeline: [
        {
          status: 'ordered',
          date: '2024-03-10T10:00:00Z',
          description: 'Sipariş alındı',
        },
        {
          status: 'processing',
          date: '2024-03-10T14:00:00Z',
          description: 'Sipariş hazırlanıyor',
        },
        {
          status: 'shipped',
          date: '2024-03-11T09:00:00Z',
          description: 'Kargoya verildi',
        },
      ],
    },
  ];

  useEffect(() => {
    if (id) {
      loadOrderDetail();
    }
  }, [id]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      const foundOrder = mockOrders.find(o => o.id === id);
      if (foundOrder) {
        setOrder(foundOrder);
      } else {
        Alert.alert('Hata', 'Sipariş bulunamadı.');
        router.back();
      }
    } catch (error) {
      console.error('Error loading order:', error);
      Alert.alert('Hata', 'Sipariş yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const copyTrackingNumber = () => {
    if (order?.trackingNumber) {
      Alert.alert('Kopyalandı', `Takip numarası (${order.trackingNumber}) panoya kopyalandı.`);
    }
  };

  const renderOrderItem = ({ item }: { item: OrderItem }) => (
    <TouchableOpacity 
      style={styles.orderItemContainer}
      onPress={() => router.push(`/market/product/${item.productId}`)}
    >
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
    </TouchableOpacity>
  );

  if (loading || !order) {
    return (
      <LinearGradient colors={theme.colors.gradient} style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Sipariş yükleniyor...</Text>
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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Sipariş Detayı</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Order Status */}
        <View style={[styles.statusCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.statusHeader}>
            <View style={styles.statusInfo}>
              <Text style={[styles.orderNumber, { color: theme.colors.text }]}>#{order.orderNumber}</Text>
              <Text style={[styles.orderDate, { color: theme.colors.textSecondary }]}>
                {formatDate(order.date)}
              </Text>
            </View>
            
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
              {getStatusIcon(order.status)}
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {getStatusText(order.status)}
              </Text>
            </View>
          </View>

          {order.trackingNumber && (
            <TouchableOpacity 
              style={[styles.trackingContainer, { backgroundColor: theme.colors.background }]}
              onPress={copyTrackingNumber}
            >
              <View style={styles.trackingInfo}>
                <Text style={[styles.trackingLabel, { color: theme.colors.textSecondary }]}>Takip Numarası</Text>
                <Text style={[styles.trackingNumber, { color: theme.colors.text }]}>{order.trackingNumber}</Text>
              </View>
              <Copy size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          )}

          {order.estimatedDelivery && (
            <View style={styles.deliveryInfo}>
              <Text style={[styles.deliveryLabel, { color: theme.colors.textSecondary }]}>Tahmini Teslimat</Text>
              <Text style={[styles.deliveryDate, { color: theme.colors.text }]}>
                {formatDate(order.estimatedDelivery)}
              </Text>
            </View>
          )}
        </View>

        {/* Order Timeline */}
        <View style={[styles.timelineCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sipariş Takibi</Text>
          {order.timeline.map((event, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: theme.colors.primary }]} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineDescription, { color: theme.colors.text }]}>
                  {event.description}
                </Text>
                <Text style={[styles.timelineDate, { color: theme.colors.textSecondary }]}>
                  {formatDateTime(event.date)}
                </Text>
              </View>
              {index < order.timeline.length - 1 && (
                <View style={[styles.timelineLine, { backgroundColor: theme.colors.border }]} />
              )}
            </View>
          ))}
        </View>

        {/* Order Items */}
        <View style={[styles.itemsCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sipariş İçeriği</Text>
          <FlatList
            data={order.items}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Delivery Address */}
        <View style={[styles.addressCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Teslimat Adresi</Text>
          <View style={styles.addressInfo}>
            <MapPin size={20} color={theme.colors.primary} />
            <View style={styles.addressText}>
              <Text style={[styles.addressName, { color: theme.colors.text }]}>
                {order.deliveryAddress.name}
              </Text>
              <Text style={[styles.addressLine, { color: theme.colors.textSecondary }]}>
                {order.deliveryAddress.address}
              </Text>
              <Text style={[styles.addressLine, { color: theme.colors.textSecondary }]}>
                {order.deliveryAddress.city} {order.deliveryAddress.postalCode}
              </Text>
              <Text style={[styles.addressPhone, { color: theme.colors.textSecondary }]}>
                {order.deliveryAddress.phone}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Ödeme Özeti</Text>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Ara Toplam</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>₺{order.subtotal.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Kargo</Text>
            <Text style={[styles.summaryValue, { color: order.shipping === 0 ? theme.colors.success : theme.colors.text }]}>
              {order.shipping === 0 ? 'Ücretsiz' : `₺${order.shipping.toFixed(2)}`}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>KDV</Text>
            <Text style={[styles.summaryValue, { color: theme.colors.text }]}>₺{order.tax.toFixed(2)}</Text>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: theme.colors.text }]}>Toplam</Text>
            <Text style={[styles.totalValue, { color: theme.colors.primary }]}>₺{order.total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      {order.status === 'shipped' && (
        <View style={[styles.bottomContainer, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={styles.trackButton}
            onPress={() => Alert.alert('Kargo Takibi', 'Kargo takip sayfası yakında gelecek.')}
          >
            <LinearGradient
              colors={theme.colors.headerGradient}
              style={styles.trackGradient}
            >
              <Truck size={20} color="#FFFFFF" />
              <Text style={styles.trackText}>Kargoyu Takip Et</Text>
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
  statusCard: {
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
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 20,
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
    paddingVertical: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  trackingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  trackingInfo: {
    flex: 1,
  },
  trackingLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deliveryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryLabel: {
    fontSize: 14,
  },
  deliveryDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  timelineCard: {
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
    marginBottom: 16,
  },
  timelineItem: {
    position: 'relative',
    paddingLeft: 24,
    marginBottom: 16,
  },
  timelineDot: {
    position: 'absolute',
    left: 0,
    top: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineContent: {
    flex: 1,
  },
  timelineDescription: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 14,
  },
  timelineLine: {
    position: 'absolute',
    left: 5,
    top: 20,
    width: 2,
    height: 20,
  },
  itemsCard: {
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
  orderItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderItemDetails: {
    fontSize: 14,
  },
  orderItemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addressCard: {
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
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressText: {
    flex: 1,
    marginLeft: 12,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addressLine: {
    fontSize: 14,
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: 14,
    marginTop: 4,
  },
  summaryCard: {
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
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
  bottomContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  trackButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  trackGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  trackText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});