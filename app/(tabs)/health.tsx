import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Activity, Calendar, Pill, Stethoscope, Plus, Heart, CircleAlert as AlertCircle, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

interface HealthRecord {
  id: string;
  petName: string;
  petImage: string;
  type: 'vaccination' | 'checkup' | 'medication' | 'emergency';
  title: string;
  date: string;
  veterinarian?: string;
  notes?: string;
  nextDate?: string;
}

export default function HealthScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [healthRecords] = useState<HealthRecord[]>([
    {
      id: '1',
      petName: 'Buddy',
      petImage: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=150',
      type: 'vaccination',
      title: 'Karma Aşı',
      date: '2024-01-15',
      veterinarian: 'Dr. Mehmet Yılmaz',
      nextDate: '2025-01-15',
    },
    {
      id: '2',
      petName: 'Luna',
      petImage: 'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=150',
      type: 'checkup',
      title: 'Genel Kontrol',
      date: '2024-02-10',
      veterinarian: 'Dr. Ayşe Kaya',
      notes: 'Sağlık durumu iyi, kilo normal',
    },
    {
      id: '3',
      petName: 'Buddy',
      petImage: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=150',
      type: 'medication',
      title: 'Parazit İlacı',
      date: '2024-02-20',
      nextDate: '2024-05-20',
    },
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vaccination':
        return <Pill size={20} color="#10B981" />;
      case 'checkup':
        return <Stethoscope size={20} color="#6366F1" />;
      case 'medication':
        return <Heart size={20} color="#F59E0B" />;
      case 'emergency':
        return <AlertCircle size={20} color="#EF4444" />;
      default:
        return <Activity size={20} color="#6B7280" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vaccination':
        return '#10B981';
      case 'checkup':
        return '#6366F1';
      case 'medication':
        return '#F59E0B';
      case 'emergency':
        return '#EF4444';
      default:
        return '#6B7280';
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

  const quickActions = [
    {
      icon: Plus,
      title: 'Kayıt Ekle',
      subtitle: 'Yeni sağlık kaydı',
      color: '#6366F1',
      onPress: () => router.push('/health/add-record'),
    },
    {
      icon: Calendar,
      title: 'Randevu Al',
      subtitle: 'Veteriner randevusu',
      color: '#10B981',
      onPress: () => router.push('/health/book-appointment'),
    },
    {
      icon: Clock,
      title: 'Hatırlatıcılar',
      subtitle: 'Aşı ve ilaç takibi',
      color: '#F59E0B',
      onPress: () => router.push('/health/reminders'),
    },
  ];

  return (
    <LinearGradient colors={theme.colors.gradient} style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Sağlık Takibi</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          Hayvanlarınızın sağlık kayıtları
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionCard}
                onPress={action.onPress}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                  <action.icon size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Health Records */}
        <View style={styles.recordsContainer}>
          <Text style={styles.sectionTitle}>Son Kayıtlar</Text>
          {healthRecords.map((record) => (
            <TouchableOpacity 
              key={record.id} 
              style={styles.recordCard}
              onPress={() => router.push(`/health/edit-record/${record.id}`)}
            >
              <Image source={{ uri: record.petImage }} style={styles.petImage} />
              
              <View style={styles.recordInfo}>
                <View style={styles.recordHeader}>
                  <Text style={styles.petName}>{record.petName}</Text>
                  <View style={[styles.typeIndicator, { backgroundColor: `${getTypeColor(record.type)}20` }]}>
                    {getTypeIcon(record.type)}
                  </View>
                </View>
                
                <Text style={styles.recordTitle}>{record.title}</Text>
                
                <View style={styles.recordDetails}>
                  <View style={styles.dateContainer}>
                    <Calendar size={14} color="#6B7280" />
                    <Text style={styles.dateText}>{formatDate(record.date)}</Text>
                  </View>
                  
                  {record.veterinarian && (
                    <Text style={styles.veterinarian}>Dr. {record.veterinarian}</Text>
                  )}
                </View>
                
                {record.nextDate && (
                  <View style={styles.nextDateContainer}>
                    <Clock size={12} color="#F59E0B" />
                    <Text style={styles.nextDateText}>
                      Sonraki: {formatDate(record.nextDate)}
                    </Text>
                  </View>
                )}
                
                {record.notes && (
                  <Text style={styles.notes} numberOfLines={2}>
                    {record.notes}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
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
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  recordsContainer: {
    paddingHorizontal: 16,
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  recordInfo: {
    flex: 1,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  typeIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  recordDetails: {
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  veterinarian: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  nextDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  nextDateText: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '500',
    marginLeft: 4,
  },
  notes: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});