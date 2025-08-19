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
import { ArrowLeft, Save, Calendar, Stethoscope, Pill, Heart, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Pet } from '@/types';
import { apiService } from '@/services/api';
import { mockPets } from '@/services/mockData';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/contexts/ThemeContext';

interface HealthRecordForm {
  petId: string;
  type: 'vaccination' | 'checkup' | 'medication' | 'emergency';
  title: string;
  date: Date;
  veterinarian: string;
  notes: string;
  nextDate?: Date;
  cost?: number;
  location: string;
}

export default function AddHealthRecordScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNextDatePicker, setShowNextDatePicker] = useState(false);
  const [form, setForm] = useState<HealthRecordForm>({
    petId: '',
    type: 'vaccination',
    title: '',
    date: new Date(),
    veterinarian: '',
    notes: '',
    nextDate: undefined,
    cost: undefined,
    location: '',
  });

  const recordTypes = [
    { 
      id: 'vaccination', 
      name: 'Aşı', 
      icon: Pill, 
      color: '#10B981',
      examples: ['Karma Aşı', 'Kuduz Aşısı', 'Bordetella', 'Lyme Hastalığı']
    },
    { 
      id: 'checkup', 
      name: 'Kontrol', 
      icon: Stethoscope, 
      color: '#6366F1',
      examples: ['Genel Kontrol', 'Diş Kontrolü', 'Göz Muayenesi', 'Kalp Kontrolü']
    },
    { 
      id: 'medication', 
      name: 'İlaç', 
      icon: Heart, 
      color: '#F59E0B',
      examples: ['Parazit İlacı', 'Antibiyotik', 'Ağrı Kesici', 'Vitamin']
    },
    { 
      id: 'emergency', 
      name: 'Acil', 
      icon: AlertCircle, 
      color: '#EF4444',
      examples: ['Yaralanma', 'Zehirlenme', 'Kırık', 'Acil Müdahale']
    },
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

    if (!form.title.trim()) {
      Alert.alert('Hata', 'Kayıt başlığı gereklidir.');
      return;
    }

    try {
      setSaving(true);
      console.log('Creating health record...');
      
      const recordData = {
        petId: form.petId,
        type: form.type,
        title: form.title.trim(),
        date: form.date.toISOString(),
        veterinarian: form.veterinarian.trim(),
        notes: form.notes.trim(),
        nextDate: form.nextDate?.toISOString(),
        cost: form.cost,
        location: form.location.trim(),
      };
      
      console.log('Health record data:', recordData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert('Başarılı', 'Sağlık kaydı başarıyla oluşturuldu.', [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error creating health record:', error);
      Alert.alert('Hata', 'Sağlık kaydı oluşturulurken hata oluştu.');
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

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setForm({ ...form, date: selectedDate });
    }
  };

  const onNextDateChange = (event: any, selectedDate?: Date) => {
    setShowNextDatePicker(false);
    if (selectedDate) {
      setForm({ ...form, nextDate: selectedDate });
    }
  };

  const selectedType = recordTypes.find(type => type.id === form.type);
  const selectedPet = userPets.find(pet => pet.id === form.petId);

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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Sağlık Kaydı Ekle</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Henüz hayvanınız yok</Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
            Sağlık kaydı oluşturmak için önce bir hayvan eklemelisiniz.
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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Sağlık Kaydı Ekle</Text>
          <TouchableOpacity
            style={[styles.saveButton, (saving || !form.title.trim()) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving || !form.title.trim()}
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

            {/* Kayıt Türü */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Kayıt Türü *</Text>
              <View style={styles.typeGrid}>
                {recordTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeCard,
                      { backgroundColor: theme.colors.background },
                      form.type === type.id && { backgroundColor: type.color },
                    ]}
                    onPress={() => setForm({ ...form, type: type.id as any })}
                  >
                    <View style={[
                      styles.typeIconContainer,
                      { backgroundColor: form.type === type.id ? 'rgba(255, 255, 255, 0.2)' : `${type.color}20` }
                    ]}>
                      <type.icon size={24} color={form.type === type.id ? '#FFFFFF' : type.color} />
                    </View>
                    <Text style={[
                      styles.typeTitle,
                      { color: theme.colors.text },
                      form.type === type.id && { color: '#FFFFFF' },
                    ]}>
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Başlık */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Başlık *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={form.title}
                onChangeText={(text) => setForm({ ...form, title: text })}
                placeholder={selectedType ? `Örn: ${selectedType.examples[0]}` : 'Kayıt başlığı'}
                placeholderTextColor={theme.colors.textSecondary}
                maxLength={100}
              />
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
                  maximumDate={new Date()}
                />
              )}
            </View>

            {/* Veteriner */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Veteriner</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={form.veterinarian}
                onChangeText={(text) => setForm({ ...form, veterinarian: text })}
                placeholder="Dr. Adı Soyadı"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            {/* Klinik/Konum */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Klinik/Konum</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={form.location}
                onChangeText={(text) => setForm({ ...form, location: text })}
                placeholder="Veteriner kliniği adı"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            {/* Maliyet */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Maliyet (₺)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={form.cost?.toString() || ''}
                onChangeText={(text) => {
                  const numericValue = text.replace(/[^0-9]/g, '');
                  setForm({ ...form, cost: numericValue ? parseInt(numericValue) : undefined });
                }}
                placeholder="Ücret"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            {/* Sonraki Tarih (Aşı ve İlaç için) */}
            {(form.type === 'vaccination' || form.type === 'medication') && (
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Sonraki Tarih</Text>
                <TouchableOpacity
                  style={[styles.datePickerButton, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}
                  onPress={() => setShowNextDatePicker(true)}
                >
                  <Calendar size={20} color={theme.colors.primary} />
                  <Text style={[styles.datePickerText, { color: theme.colors.text }]}>
                    {form.nextDate ? formatDate(form.nextDate) : 'Sonraki tarih seçin'}
                  </Text>
                </TouchableOpacity>
                
                {showNextDatePicker && (
                  <DateTimePicker
                    value={form.nextDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onNextDateChange}
                    minimumDate={new Date()}
                  />
                )}
              </View>
            )}

            {/* Notlar */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Notlar</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={form.notes}
                onChangeText={(text) => setForm({ ...form, notes: text })}
                placeholder="Detaylar, gözlemler, öneriler..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
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