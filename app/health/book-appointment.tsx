import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Save, Calendar, Clock, MapPin, Stethoscope, Phone } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Pet } from '@/types';
import { apiService } from '@/services/api';
import { mockPets } from '@/services/mockData';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/contexts/ThemeContext';

interface AppointmentForm {
  petId: string;
  type: string;
  date: Date;
  time: Date;
  veterinarian: string;
  clinic: string;
  phone: string;
  notes: string;
}

export default function BookAppointmentScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [form, setForm] = useState<AppointmentForm>({
    petId: '',
    type: 'Genel Kontrol',
    date: new Date(),
    time: new Date(),
    veterinarian: '',
    clinic: '',
    phone: '',
    notes: '',
  });

  const appointmentTypes = [
    'Genel Kontrol',
    'Aşı',
    'Diş Temizliği',
    'Göz Muayenesi',
    'Kalp Kontrolü',
    'Kan Tahlili',
    'Röntgen',
    'Ultrason',
    'Cerrahi Operasyon',
    'Acil Müdahale',
  ];

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  useEffect(() => {
    loadUserPets();
  }, []);

  const loadUserPets = async () => {
    try {
      setLoading(true);
      let pets: Pet[];
      
      if (Platform.OS === 'web') {
        await new Promise(resolve => setTimeout(resolve, 500));
        pets = mockPets.slice(0, 3);
      } else {
        pets = await apiService.getUserPets();
      }
      
      setUserPets(pets);
      if (pets.length > 0) {
        setForm(prev => ({ ...prev, petId: pets[0].id }));
      }
    } catch (error) {
      console.error('Error loading user pets:', error);
      const mockUserPets = mockPets.slice(0, 2);
      setUserPets(mockUserPets);
      if (mockUserPets.length > 0) {
        setForm(prev => ({ ...prev, petId: mockUserPets[0].id }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.petId) {
      Alert.alert('Hata', 'Lütfen bir hayvan seçin.');
      return;
    }

    if (!form.veterinarian.trim()) {
      Alert.alert('Hata', 'Veteriner adı gereklidir.');
      return;
    }

    if (!form.clinic.trim()) {
      Alert.alert('Hata', 'Klinik adı gereklidir.');
      return;
    }

    try {
      setSaving(true);
      console.log('Booking appointment...');
      
      const appointmentData = {
        petId: form.petId,
        type: form.type,
        date: form.date.toISOString().split('T')[0],
        time: form.time.toTimeString().split(' ')[0].slice(0, 5),
        veterinarian: form.veterinarian.trim(),
        clinic: form.clinic.trim(),
        phone: form.phone.trim(),
        notes: form.notes.trim(),
      };
      
      console.log('Appointment data:', appointmentData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert('Başarılı', 'Randevu başarıyla oluşturuldu.', [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      Alert.alert('Hata', 'Randevu oluşturulurken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (time: Date): string => {
    return time.toTimeString().split(' ')[0].slice(0, 5);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setForm({ ...form, date: selectedDate });
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setForm({ ...form, time: selectedTime });
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={theme.colors.gradient} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Hayvanlarınız yükleniyor...</Text>
      </LinearGradient>
    );
  }

  if (userPets.length === 0) {
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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Randevu Al</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Henüz hayvanınız yok</Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
            Randevu almak için önce bir hayvan eklemelisiniz.
          </Text>
          <TouchableOpacity
            style={styles.addPetButton}
            onPress={() => router.push('/add-pet')}
          >
            <LinearGradient
              colors={theme.colors.headerGradient}
              style={styles.addPetGradient}
            >
              <Text style={styles.addPetText}>Hayvan Ekle</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={theme.colors.gradient} style={styles.container}>
        <StatusBar style={isDark ? "light" : "dark"} />
        
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Randevu Al</Text>
          <TouchableOpacity
            style={[styles.saveButton, (saving || !form.veterinarian.trim()) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving || !form.veterinarian.trim()}
          >
            {saving ? (
              <ActivityIndicator size={20} color="#FFFFFF" />
            ) : (
              <Save size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
            {/* Hayvan Seçimi */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Hayvan *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.petSelector}>
                  {userPets.map((pet) => (
                    <TouchableOpacity
                      key={pet.id}
                      style={[
                        styles.petCard,
                        { backgroundColor: theme.colors.background },
                        form.petId === pet.id && { backgroundColor: theme.colors.primary },
                      ]}
                      onPress={() => setForm({ ...form, petId: pet.id })}
                    >
                      <Image source={{ uri: pet.photos[0] }} style={styles.petImage} />
                      <Text style={[
                        styles.petName,
                        { color: theme.colors.text },
                        form.petId === pet.id && { color: '#FFFFFF' },
                      ]}>
                        {pet.name}
                      </Text>
                      <Text style={[
                        styles.petBreed,
                        { color: theme.colors.textSecondary },
                        form.petId === pet.id && { color: 'rgba(255, 255, 255, 0.8)' },
                      ]}>
                        {pet.breed}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Randevu Türü */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Randevu Türü *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.typeSelector}>
                  {appointmentTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeChip,
                        { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
                        form.type === type && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                      ]}
                      onPress={() => setForm({ ...form, type })}
                    >
                      <Text style={[
                        styles.typeChipText,
                        { color: theme.colors.text },
                        form.type === type && { color: '#FFFFFF' },
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Tarih */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Tarih *</Text>
              <TouchableOpacity
                style={[styles.datePickerButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={20} color={theme.colors.primary} />
                <Text style={[styles.datePickerText, { color: theme.colors.text }]}>
                  {formatDate(form.date)}
                </Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={form.date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            {/* Saat */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Saat *</Text>
              <TouchableOpacity
                style={[styles.datePickerButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                onPress={() => setShowTimePicker(true)}
              >
                <Clock size={20} color={theme.colors.primary} />
                <Text style={[styles.datePickerText, { color: theme.colors.text }]}>
                  {formatTime(form.time)}
                </Text>
              </TouchableOpacity>
              
              {showTimePicker && (
                <DateTimePicker
                  value={form.time}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onTimeChange}
                />
              )}
            </View>

            {/* Önerilen Saatler */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Önerilen Saatler</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.timeSlots}>
                  {timeSlots.map((timeSlot) => (
                    <TouchableOpacity
                      key={timeSlot}
                      style={[
                        styles.timeSlot,
                        { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
                        formatTime(form.time) === timeSlot && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                      ]}
                      onPress={() => {
                        const [hours, minutes] = timeSlot.split(':');
                        const newTime = new Date();
                        newTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                        setForm({ ...form, time: newTime });
                      }}
                    >
                      <Text style={[
                        styles.timeSlotText,
                        { color: theme.colors.text },
                        formatTime(form.time) === timeSlot && { color: '#FFFFFF' },
                      ]}>
                        {timeSlot}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Veteriner */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Veteriner *</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                <Stethoscope size={20} color={theme.colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  value={form.veterinarian}
                  onChangeText={(text) => setForm({ ...form, veterinarian: text })}
                  placeholder="Dr. Adı Soyadı"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            </View>

            {/* Klinik */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Klinik *</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                <MapPin size={20} color={theme.colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  value={form.clinic}
                  onChangeText={(text) => setForm({ ...form, clinic: text })}
                  placeholder="Veteriner kliniği adı"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            </View>

            {/* Telefon */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Telefon</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                <Phone size={20} color={theme.colors.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.colors.text }]}
                  value={form.phone}
                  onChangeText={(text) => setForm({ ...form, phone: text })}
                  placeholder="+90 312 123 45 67"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Notlar */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Notlar</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={form.notes}
                onChangeText={(text) => setForm({ ...form, notes: text })}
                placeholder="Randevu ile ilgili özel notlar..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={300}
              />
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
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
    marginTop: 16,
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
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#6366F1',
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
  saveButtonDisabled: {
    opacity: 0.6,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  formContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  petSelector: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  petCard: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  petName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  petBreed: {
    fontSize: 12,
    textAlign: 'center',
  },
  typeSelector: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    height: 100,
    paddingTop: 12,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  datePickerText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  timeSlots: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  addPetButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  addPetGradient: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  addPetText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});