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
import { ArrowLeft, Calendar, Clock, MapPin, Phone, Plus, Stethoscope } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

interface Appointment {
  id: string;
  petId: string;
  petName: string;
  petImage: string;
  veterinarian: string;
  clinic: string;
  date: string;
  time: string;
  type: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
  phone?: string;
}

export default function AppointmentsScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [appointments] = useState<Appointment[]>([
    {
      id: '1',
      petId: '1',
      petName: 'Buddy',
      petImage: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=150',
      veterinarian: 'Dr. Mehmet Yılmaz',
      clinic: 'Ankara Veteriner Kliniği',
      date: '2024-03-15',
      time: '14:30',
      type: 'Genel Kontrol',
      status: 'upcoming',
      phone: '+90 312 123 45 67',
    },
    {
      id: '2',
      petId: '2',
      petName: 'Luna',
      petImage: 'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=150',
      veterinarian: 'Dr. Ayşe Kaya',
      clinic: 'İstanbul Pet Kliniği',
      date: '2024-03-20',
      time: '10:00',
      type: 'Aşı',
      status: 'upcoming',
      phone: '+90 212 987 65 43',
    },
    {
      id: '3',
      petId: '1',
      petName: 'Buddy',
      petImage: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=150',
      veterinarian: 'Dr. Mehmet Yılmaz',
      clinic: 'Ankara Veteriner Kliniği',
      date: '2024-02-10',
      time: '15:00',
      type: 'Diş Temizliği',
      status: 'completed',
      notes: 'Diş temizliği başarıyla tamamlandı',
    },
  ]);

  const upcomingAppointments = appointments.filter(apt => apt.status === 'upcoming');
  const pastAppointments = appointments.filter(apt => apt.status === 'completed');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return theme.colors.primary;
      case 'completed':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Yaklaşan';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const handleCallClinic = (phone: string) => {
    Alert.alert(
      'Klinik Ara',
      `${phone} numarasını aramak istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Ara', onPress: () => console.log('Calling:', phone) },
      ]
    );
  };

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <TouchableOpacity style={[styles.appointmentCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.appointmentHeader}>
        <Image source={{ uri: item.petImage }} style={styles.petImage} />
        <View style={styles.appointmentInfo}>
          <Text style={[styles.petName, { color: theme.colors.text }]}>{item.petName}</Text>
          <Text style={[styles.appointmentType, { color: theme.colors.primary }]}>{item.type}</Text>
          <Text style={[styles.veterinarian, { color: theme.colors.textSecondary }]}>{item.veterinarian}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.appointmentDetails}>
        <View style={styles.detailRow}>
          <Calendar size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
            {formatDate(item.date)} - {item.time}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <MapPin size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
            {item.clinic}
          </Text>
        </View>

        {item.phone && (
          <TouchableOpacity 
            style={styles.detailRow}
            onPress={() => handleCallClinic(item.phone!)}
          >
            <Phone size={16} color={theme.colors.primary} />
            <Text style={[styles.detailText, styles.phoneText, { color: theme.colors.primary }]}>
              {item.phone}
            </Text>
          </TouchableOpacity>
        )}

        {item.notes && (
          <Text style={[styles.appointmentNotes, { color: theme.colors.textSecondary }]}>
            {item.notes}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={theme.colors.gradient} style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Randevularım</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.push('/health/book-appointment')}
        >
          <Plus size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Yaklaşan Randevular */}
        {upcomingAppointments.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Yaklaşan Randevular</Text>
            {upcomingAppointments.map((appointment) => (
              <View key={appointment.id}>
                {renderAppointment({ item: appointment })}
              </View>
            ))}
          </View>
        )}

        {/* Geçmiş Randevular */}
        {pastAppointments.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Geçmiş Randevular</Text>
            {pastAppointments.map((appointment) => (
              <View key={appointment.id}>
                {renderAppointment({ item: appointment })}
              </View>
            ))}
          </View>
        )}

        {appointments.length === 0 && (
          <View style={styles.emptyContainer}>
            <Stethoscope size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Henüz randevu yok</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              İlk veteriner randevunuzu oluşturun
            </Text>
            <TouchableOpacity
              style={styles.createAppointmentButton}
              onPress={() => router.push('/health/book-appointment')}
            >
              <LinearGradient
                colors={theme.colors.headerGradient}
                style={styles.createAppointmentGradient}
              >
                <Calendar size={20} color="#FFFFFF" />
                <Text style={styles.createAppointmentText}>Randevu Al</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  backButton: {
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
  addButton: {
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
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  appointmentCard: {
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
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  petImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  appointmentInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  appointmentType: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  veterinarian: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentDetails: {
    paddingLeft: 62,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  phoneText: {
    textDecorationLine: 'underline',
  },
  appointmentNotes: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 64,
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
  createAppointmentButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  createAppointmentGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  createAppointmentText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});