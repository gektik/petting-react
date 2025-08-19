import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Bell, Calendar, Pill, Stethoscope, Plus, Clock, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

interface Reminder {
  id: string;
  petId: string;
  petName: string;
  petImage: string;
  type: 'vaccination' | 'medication' | 'checkup' | 'grooming';
  title: string;
  dueDate: string;
  isActive: boolean;
  frequency?: string;
  lastCompleted?: string;
  priority: 'low' | 'medium' | 'high';
}

export default function RemindersScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      petId: '1',
      petName: 'Buddy',
      petImage: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=150',
      type: 'vaccination',
      title: 'Karma Aşı Hatırlatıcısı',
      dueDate: '2024-03-20',
      isActive: true,
      frequency: 'Yıllık',
      lastCompleted: '2024-03-20',
      priority: 'high',
    },
    {
      id: '2',
      petId: '2',
      petName: 'Luna',
      petImage: 'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=150',
      type: 'medication',
      title: 'Parazit İlacı',
      dueDate: '2024-03-25',
      isActive: true,
      frequency: '3 Ayda Bir',
      priority: 'medium',
    },
    {
      id: '3',
      petId: '1',
      petName: 'Buddy',
      petImage: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=150',
      type: 'checkup',
      title: 'Genel Kontrol',
      dueDate: '2024-04-01',
      isActive: true,
      frequency: '6 Ayda Bir',
      priority: 'low',
    },
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vaccination':
        return <Pill size={20} color="#10B981" />;
      case 'medication':
        return <Pill size={20} color="#F59E0B" />;
      case 'checkup':
        return <Stethoscope size={20} color="#6366F1" />;
      case 'grooming':
        return <Clock size={20} color="#8B5CF6" />;
      default:
        return <Bell size={20} color="#6B7280" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vaccination':
        return '#10B981';
      case 'medication':
        return '#F59E0B';
      case 'checkup':
        return '#6366F1';
      case 'grooming':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Yüksek';
      case 'medium':
        return 'Orta';
      case 'low':
        return 'Düşük';
      default:
        return priority;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Bugün';
    } else if (diffDays === 1) {
      return 'Yarın';
    } else if (diffDays > 0) {
      return `${diffDays} gün sonra`;
    } else {
      return `${Math.abs(diffDays)} gün geçti`;
    }
  };

  const toggleReminder = (id: string) => {
    setReminders(prev =>
      prev.map(reminder =>
        reminder.id === id
          ? { ...reminder, isActive: !reminder.isActive }
          : reminder
      )
    );
  };

  const markAsCompleted = (reminder: Reminder) => {
    Alert.alert(
      'Hatırlatıcıyı Tamamla',
      `"${reminder.title}" hatırlatıcısını tamamlandı olarak işaretlemek istediğinize emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Tamamla',
          onPress: () => {
            console.log('Marking reminder as completed:', reminder.id);
            Alert.alert('Başarılı', 'Hatırlatıcı tamamlandı olarak işaretlendi.');
          },
        },
      ]
    );
  };

  const activeReminders = reminders.filter(r => r.isActive);
  const overdueReminders = reminders.filter(r => {
    const dueDate = new Date(r.dueDate);
    const today = new Date();
    return dueDate < today && r.isActive;
  });

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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Hatırlatıcılar</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.push('/health/add-reminder')}
        >
          <Plus size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Özet Kartları */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.summaryIcon, { backgroundColor: `${theme.colors.error}20` }]}>
              <AlertCircle size={24} color={theme.colors.error} />
            </View>
            <Text style={[styles.summaryNumber, { color: theme.colors.error }]}>{overdueReminders.length}</Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Geciken</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.summaryIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
              <Bell size={24} color={theme.colors.primary} />
            </View>
            <Text style={[styles.summaryNumber, { color: theme.colors.primary }]}>{activeReminders.length}</Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Aktif</Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.summaryIcon, { backgroundColor: `${theme.colors.success}20` }]}>
              <Calendar size={24} color={theme.colors.success} />
            </View>
            <Text style={[styles.summaryNumber, { color: theme.colors.success }]}>
              {reminders.filter(r => r.lastCompleted).length}
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Tamamlanan</Text>
          </View>
        </View>

        {/* Geciken Hatırlatıcılar */}
        {overdueReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.error }]}>⚠️ Geciken Hatırlatıcılar</Text>
            {overdueReminders.map((reminder) => (
              <TouchableOpacity
                key={reminder.id}
                style={[styles.reminderCard, styles.overdueCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => markAsCompleted(reminder)}
              >
                <View style={styles.reminderHeader}>
                  <Image source={{ uri: reminder.petImage }} style={styles.petImage} />
                  <View style={styles.reminderInfo}>
                    <Text style={[styles.petName, { color: theme.colors.text }]}>{reminder.petName}</Text>
                    <Text style={[styles.reminderTitle, { color: theme.colors.error }]}>{reminder.title}</Text>
                    <Text style={[styles.reminderDate, { color: theme.colors.error }]}>
                      {formatDate(reminder.dueDate)}
                    </Text>
                  </View>
                  <View style={styles.reminderActions}>
                    <View style={[styles.typeIndicator, { backgroundColor: `${getTypeColor(reminder.type)}20` }]}>
                      {getTypeIcon(reminder.type)}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Aktif Hatırlatıcılar */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Aktif Hatırlatıcılar</Text>
          {activeReminders.filter(r => !overdueReminders.includes(r)).map((reminder) => (
            <TouchableOpacity
              key={reminder.id}
              style={[styles.reminderCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => markAsCompleted(reminder)}
            >
              <View style={styles.reminderHeader}>
                <Image source={{ uri: reminder.petImage }} style={styles.petImage} />
                <View style={styles.reminderInfo}>
                  <Text style={[styles.petName, { color: theme.colors.text }]}>{reminder.petName}</Text>
                  <Text style={[styles.reminderTitle, { color: theme.colors.text }]}>{reminder.title}</Text>
                  <Text style={[styles.reminderDate, { color: theme.colors.textSecondary }]}>
                    {formatDate(reminder.dueDate)}
                  </Text>
                  {reminder.frequency && (
                    <Text style={[styles.frequency, { color: theme.colors.textSecondary }]}>
                      {reminder.frequency}
                    </Text>
                  )}
                </View>
                <View style={styles.reminderActions}>
                  <View style={[styles.typeIndicator, { backgroundColor: `${getTypeColor(reminder.type)}20` }]}>
                    {getTypeIcon(reminder.type)}
                  </View>
                  <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(reminder.priority)}20` }]}>
                    <Text style={[styles.priorityText, { color: getPriorityColor(reminder.priority) }]}>
                      {getPriorityText(reminder.priority)}
                    </Text>
                  </View>
                  <Switch
                    value={reminder.isActive}
                    onValueChange={() => toggleReminder(reminder.id)}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                    thumbColor={reminder.isActive ? '#FFFFFF' : '#F3F4F6'}
                    style={styles.reminderSwitch}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {reminders.length === 0 && (
          <View style={styles.emptyContainer}>
            <Bell size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Henüz hatırlatıcı yok</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
              İlk hatırlatıcınızı oluşturun
            </Text>
            <TouchableOpacity
              style={styles.createReminderButton}
              onPress={() => router.push('/health/add-reminder')}
            >
              <LinearGradient
                colors={theme.colors.headerGradient}
                style={styles.createReminderGradient}
              >
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.createReminderText}>Hatırlatıcı Ekle</Text>
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
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    textAlign: 'center',
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
  reminderCard: {
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
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  reminderInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reminderDate: {
    fontSize: 14,
    marginBottom: 2,
  },
  frequency: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  reminderActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  typeIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  reminderSwitch: {
    transform: [{ scale: 0.8 }],
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
  createReminderButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  createReminderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  createReminderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});