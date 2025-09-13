import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save, Calendar, Bell, Pill, Stethoscope, Clock, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { usePet } from '@/contexts/PetContext';

interface ReminderForm {
  petId: string;
  type: 'vaccination' | 'medication' | 'checkup' | 'grooming';
  title: string;
  dueDate: string;
  frequency: string;
  priority: 'low' | 'medium' | 'high';
  notes: string;
}

export default function AddReminderScreen() {
  const { theme, isDark } = useTheme();
  const { userPets } = usePet();
  const router = useRouter();
  
  const [formData, setFormData] = useState<ReminderForm>({
    petId: '',
    type: 'vaccination',
    title: '',
    dueDate: '',
    frequency: '',
    priority: 'medium',
    notes: '',
  });

  const [loading, setLoading] = useState(false);

  const reminderTypes = [
    { id: 'vaccination', label: 'Aşı', icon: Pill, color: '#10B981' },
    { id: 'medication', label: 'İlaç', icon: Pill, color: '#F59E0B' },
    { id: 'checkup', label: 'Kontrol', icon: Stethoscope, color: '#6366F1' },
    { id: 'grooming', label: 'Bakım', icon: Clock, color: '#8B5CF6' },
  ];

  const priorityOptions = [
    { id: 'low', label: 'Düşük', color: '#10B981' },
    { id: 'medium', label: 'Orta', color: '#F59E0B' },
    { id: 'high', label: 'Yüksek', color: '#EF4444' },
  ];

  const frequencyOptions = [
    'Tek seferlik',
    'Günlük',
    'Haftalık',
    'Aylık',
    '3 Ayda Bir',
    '6 Ayda Bir',
    'Yıllık',
  ];

  const handleSave = async () => {
    if (!formData.petId || !formData.title || !formData.dueDate) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun.');
      return;
    }

    try {
      setLoading(true);
      
      // Mock save - gerçek implementasyon için API çağrısı yapılabilir
      console.log('Saving reminder:', formData);
      
      Alert.alert('Başarılı', 'Hatırlatıcı başarıyla oluşturuldu!', [
        {
          text: 'Tamam',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Save reminder error:', error);
      Alert.alert('Hata', 'Hatırlatıcı oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const typeInfo = reminderTypes.find(t => t.id === type);
    const Icon = typeInfo?.icon || Bell;
    return <Icon size={20} color={typeInfo?.color || '#6B7280'} />;
  };

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
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Hatırlatıcı Ekle</Text>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSave}
          disabled={loading}
        >
          <Save size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
            {/* Hayvan Seçimi */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Hayvan *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petSelector}>
                {userPets.map((pet) => (
                  <TouchableOpacity
                    key={pet.id}
                    style={[
                      styles.petOption,
                      formData.petId === pet.id && styles.petOptionSelected,
                      { borderColor: theme.colors.border }
                    ]}
                    onPress={() => setFormData({ ...formData, petId: pet.id })}
                  >
                    <Text style={[
                      styles.petOptionText,
                      formData.petId === pet.id && styles.petOptionTextSelected,
                      { color: formData.petId === pet.id ? '#FFFFFF' : theme.colors.text }
                    ]}>
                      {pet.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Hatırlatıcı Türü */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Tür</Text>
              <View style={styles.typeSelector}>
                {reminderTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeOption,
                        formData.type === type.id && styles.typeOptionSelected,
                        { borderColor: theme.colors.border }
                      ]}
                      onPress={() => setFormData({ ...formData, type: type.id as any })}
                    >
                      <Icon size={20} color={formData.type === type.id ? '#FFFFFF' : type.color} />
                      <Text style={[
                        styles.typeOptionText,
                        formData.type === type.id && styles.typeOptionTextSelected,
                        { color: formData.type === type.id ? '#FFFFFF' : theme.colors.text }
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Başlık */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Başlık *</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border 
                }]}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Örn: Karma Aşı Hatırlatıcısı"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            {/* Tarih */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Tarih *</Text>
              <TouchableOpacity
                style={[styles.dateButton, { 
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border 
                }]}
                onPress={() => {
                  // Date picker implementasyonu
                  Alert.alert('Tarih Seçici', 'Tarih seçici yakında eklenecek.');
                }}
              >
                <Calendar size={20} color={theme.colors.textSecondary} />
                <Text style={[
                  styles.dateButtonText,
                  { color: formData.dueDate ? theme.colors.text : theme.colors.textSecondary }
                ]}>
                  {formData.dueDate || 'Tarih seçin'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sıklık */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Sıklık</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.frequencySelector}>
                {frequencyOptions.map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.frequencyOption,
                      formData.frequency === freq && styles.frequencyOptionSelected,
                      { borderColor: theme.colors.border }
                    ]}
                    onPress={() => setFormData({ ...formData, frequency: freq })}
                  >
                    <Text style={[
                      styles.frequencyOptionText,
                      formData.frequency === freq && styles.frequencyOptionTextSelected,
                      { color: formData.frequency === freq ? '#FFFFFF' : theme.colors.text }
                    ]}>
                      {freq}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Öncelik */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Öncelik</Text>
              <View style={styles.prioritySelector}>
                {priorityOptions.map((priority) => (
                  <TouchableOpacity
                    key={priority.id}
                    style={[
                      styles.priorityOption,
                      formData.priority === priority.id && styles.priorityOptionSelected,
                      { borderColor: theme.colors.border }
                    ]}
                    onPress={() => setFormData({ ...formData, priority: priority.id as any })}
                  >
                    <AlertCircle size={16} color={formData.priority === priority.id ? '#FFFFFF' : priority.color} />
                    <Text style={[
                      styles.priorityOptionText,
                      formData.priority === priority.id && styles.priorityOptionTextSelected,
                      { color: formData.priority === priority.id ? '#FFFFFF' : theme.colors.text }
                    ]}>
                      {priority.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notlar */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Notlar</Text>
              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border 
                }]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Ek notlar..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  formContainer: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  petSelector: {
    flexDirection: 'row',
  },
  petOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  petOptionSelected: {
    backgroundColor: '#6366F1',
  },
  petOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  petOptionTextSelected: {
    color: '#FFFFFF',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 100,
  },
  typeOptionSelected: {
    backgroundColor: '#6366F1',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  typeOptionTextSelected: {
    color: '#FFFFFF',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateButtonText: {
    fontSize: 16,
    marginLeft: 8,
  },
  frequencySelector: {
    flexDirection: 'row',
  },
  frequencyOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  frequencyOptionSelected: {
    backgroundColor: '#6366F1',
  },
  frequencyOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  frequencyOptionTextSelected: {
    color: '#FFFFFF',
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
  },
  priorityOptionSelected: {
    backgroundColor: '#6366F1',
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  priorityOptionTextSelected: {
    color: '#FFFFFF',
  },
});
