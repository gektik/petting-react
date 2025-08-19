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
import { ArrowLeft, Save, Calendar, Stethoscope, Pill, Heart, AlertCircle, Trash2 } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/contexts/ThemeContext';

interface HealthRecord {
  id: string;
  petId: string;
  petName: string;
  petImage: string;
  type: 'vaccination' | 'checkup' | 'medication' | 'emergency';
  title: string;
  date: string;
  veterinarian?: string;
  notes?: string;
  nextDate?: string;
  cost?: number;
  location?: string;
}

interface EditRecordForm {
  type: 'vaccination' | 'checkup' | 'medication' | 'emergency';
  title: string;
  date: Date;
  veterinarian: string;
  notes: string;
  nextDate?: Date;
  cost?: number;
  location: string;
}

export default function EditHealthRecordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<HealthRecord | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNextDatePicker, setShowNextDatePicker] = useState(false);
  const [form, setForm] = useState<EditRecordForm>({
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
    },
    { 
      id: 'checkup', 
      name: 'Kontrol', 
      icon: Stethoscope, 
      color: '#6366F1',
    },
    { 
      id: 'medication', 
      name: 'İlaç', 
      icon: Heart, 
      color: '#F59E0B',
    },
    { 
      id: 'emergency', 
      name: 'Acil', 
      icon: AlertCircle, 
      color: '#EF4444',
    },
  ];

  // Mock data
  const mockRecords: HealthRecord[] = [
    {
      id: '1',
      petId: '1',
      petName: 'Buddy',
      petImage: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=150',
      type: 'vaccination',
      title: 'Karma Aşı',
      date: '2024-01-15',
      veterinarian: 'Dr. Mehmet Yılmaz',
      nextDate: '2025-01-15',
      cost: 150,
      location: 'Ankara Veteriner Kliniği',
    },
    {
      id: '2',
      petId: '2',
      petName: 'Luna',
      petImage: 'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=150',
      type: 'checkup',
      title: 'Genel Kontrol',
      date: '2024-02-10',
      veterinarian: 'Dr. Ayşe Kaya',
      notes: 'Sağlık durumu iyi, kilo normal',
      cost: 200,
      location: 'İstanbul Pet Kliniği',
    },
  ];

  useEffect(() => {
    if (id) {
      loadRecordData();
    }
  }, [id]);

  const loadRecordData = async () => {
    try {
      setLoading(true);
      
      // Mock data kullan
      await new Promise(resolve => setTimeout(resolve, 500));
      const foundRecord = mockRecords.find(r => r.id === id);
      
      if (foundRecord) {
        setRecord(foundRecord);
        setForm({
          type: foundRecord.type,
          title: foundRecord.title,
          date: new Date(foundRecord.date),
          veterinarian: foundRecord.veterinarian || '',
          notes: foundRecord.notes || '',
          nextDate: foundRecord.nextDate ? new Date(foundRecord.nextDate) : undefined,
          cost: foundRecord.cost,
          location: foundRecord.location || '',
        });
      } else {
        Alert.alert('Hata', 'Sağlık kaydı bulunamadı.');
        router.back();
      }
    } catch (error) {
      console.error('Error loading health record:', error);
      Alert.alert('Hata', 'Sağlık kaydı yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      Alert.alert('Hata', 'Kayıt başlığı gereklidir.');
      return;
    }

    try {
      setSaving(true);
      console.log('Updating health record...');
      
      const recordData = {
        type: form.type,
        title: form.title.trim(),
        date: form.date.toISOString(),
        veterinarian: form.veterinarian.trim(),
        notes: form.notes.trim(),
        nextDate: form.nextDate?.toISOString(),
        cost: form.cost,
        location: form.location.trim(),
      };
      
      console.log('Health record update data:', recordData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert('Başarılı', 'Sağlık kaydı başarıyla güncellendi.', [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error updating health record:', error);
      Alert.alert('Hata', 'Sağlık kaydı güncellenirken hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Kaydı Sil',
      'Bu sağlık kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              console.log('Deleting health record:', id);
              
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              Alert.alert('Başarılı', 'Sağlık kaydı başarıyla silindi.', [
                { text: 'Tamam', onPress: () => router.back() }
              ]);
            } catch (error) {
              console.error('Error deleting health record:', error);
              Alert.alert('Hata', 'Sağlık kaydı silinirken hata oluştu.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
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

  if (loading) {
    return (
      <LinearGradient colors={theme.colors.gradient} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Sağlık kaydı yükleniyor...</Text>
      </LinearGradient>
    );
  }

  if (!record) {
    return (
      <LinearGradient colors={theme.colors.gradient} style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>Sağlık kaydı bulunamadı</Text>
        </View>
      </LinearGradient>
    );
  }

  const selectedType = recordTypes.find(type => type.id === form.type);

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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Kaydı Düzenle</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
              onPress={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator size={20} color="#FFFFFF" />
              ) : (
                <Trash2 size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
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
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Pet Info */}
          <View style={[styles.petInfoCard, { backgroundColor: theme.colors.surface }]}>
            <Image source={{ uri: record.petImage }} style={styles.petImage} />
            <View style={styles.petInfo}>
              <Text style={[styles.petName, { color: theme.colors.text }]}>{record.petName}</Text>
              <Text style={[styles.recordType, { color: selectedType?.color }]}>
                {selectedType?.name} Kaydı
              </Text>
            </View>
            <View style={[styles.typeIcon, { backgroundColor: `${selectedType?.color}20` }]}>
              {selectedType && <selectedType.icon size={24} color={selectedType.color} />}
            </View>
          </View>

          <View style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
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
                      <type.icon size={20} color={form.type === type.id ? '#FFFFFF' : type.color} />
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
                placeholder="Kayıt başlığı"
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

            {/* Sonraki Tarih */}
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
                style={[styles.textArea, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EF4444',
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
  deleteButtonDisabled: {
    opacity: 0.6,
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  petInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recordType: {
    fontSize: 16,
    fontWeight: '600',
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeTitle: {
    fontSize: 14,
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
});