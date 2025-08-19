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
  Switch,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Save, MapPin, Trash2 } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Pet, AdoptionListing } from '@/types';
import { apiService } from '@/services/api';
import { mockPets, mockAdoptionListings } from '@/services/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface EditListingForm {
  title: string;
  description: string;
  petId: string;
  listingType: 'adoption' | 'boarding' | 'walking' | 'training';
  location: string;
  contactPreferences: string[];
  price?: number;
  isActive: boolean;
}

export default function EditListingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [listing, setListing] = useState<AdoptionListing | null>(null);
  const [form, setForm] = useState<EditListingForm>({
    title: '',
    description: '',
    petId: '',
    listingType: 'adoption',
    location: '',
    contactPreferences: [],
    price: undefined,
    isActive: true,
  });

  const listingTypes = [
    { id: 'adoption', name: 'Sahiplendirme', description: 'Hayvanınızı sahiplendirin' },
    { id: 'boarding', name: 'Pansiyon', description: 'Geçici bakım hizmeti' },
    { id: 'walking', name: 'Gezdirme', description: 'Hayvan gezdirme hizmeti' },
    { id: 'training', name: 'Eğitim', description: 'Hayvan eğitimi hizmeti' },
  ];

  const contactOptions = [
    { id: 'message', name: 'Mesaj' },
    { id: 'phone', name: 'Telefon' },
    { id: 'email', name: 'E-posta' },
  ];

  useEffect(() => {
    if (id) {
      loadListingData();
      loadUserPets();
    }
  }, [id]);

  const loadListingData = async () => {
    try {
      setLoading(true);
      
      // Mock data kullan
      await new Promise(resolve => setTimeout(resolve, 500));
      const foundListing = mockAdoptionListings.find(l => l.id === id);
      
      if (foundListing) {
        setListing(foundListing);
        setForm({
          title: foundListing.title,
          description: foundListing.description,
          petId: foundListing.petId,
          listingType: 'adoption',
          location: foundListing.location,
          contactPreferences: foundListing.contactPreferences,
          price: undefined,
          isActive: true,
        });
      } else {
        Alert.alert('Hata', 'İlan bulunamadı.');
        router.back();
      }
    } catch (error) {
      console.error('Error loading listing:', error);
      Alert.alert('Hata', 'İlan yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPets = async () => {
    try {
      let pets: Pet[];
      
      if (Platform.OS === 'web') {
        await new Promise(resolve => setTimeout(resolve, 300));
        pets = mockPets.slice(0, 3);
      } else {
        pets = await apiService.getUserPets();
      }
      
      setUserPets(pets);
    } catch (error) {
      console.error('Error loading user pets:', error);
      setUserPets(mockPets.slice(0, 2));
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      Alert.alert('Hata', 'İlan başlığı gereklidir.');
      return;
    }

    if (!form.description.trim()) {
      Alert.alert('Hata', 'İlan açıklaması gereklidir.');
      return;
    }

    if (!form.petId) {
      Alert.alert('Hata', 'Lütfen bir hayvan seçin.');
      return;
    }

    if (form.contactPreferences.length === 0) {
      Alert.alert('Hata', 'En az bir iletişim tercihi seçin.');
      return;
    }

    try {
      setSaving(true);
      console.log('Updating listing...');
      
      const listingData = {
        title: form.title.trim(),
        description: form.description.trim(),
        petId: form.petId,
        listingType: form.listingType,
        location: form.location.trim(),
        contactPreferences: form.contactPreferences,
        price: form.price,
        isActive: form.isActive,
      };
      
      console.log('Listing data being updated:', listingData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert('Başarılı', 'İlan başarıyla güncellendi.', [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error updating listing:', error);
      Alert.alert(
        'Hata', 
        'İlan güncellenirken hata oluştu. Lütfen tekrar deneyin.',
        [
          { text: 'Tamam' },
          { text: 'Tekrar Dene', onPress: handleSave }
        ]
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'İlanı Sil',
      'Bu ilanı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              console.log('Deleting listing:', id);
              
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              Alert.alert('Başarılı', 'İlan başarıyla silindi.', [
                { text: 'Tamam', onPress: () => router.back() }
              ]);
            } catch (error) {
              console.error('Error deleting listing:', error);
              Alert.alert('Hata', 'İlan silinirken hata oluştu.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const toggleContactPreference = (preference: string) => {
    setForm(prev => ({
      ...prev,
      contactPreferences: prev.contactPreferences.includes(preference)
        ? prev.contactPreferences.filter(p => p !== preference)
        : [...prev.contactPreferences, preference]
    }));
  };

  if (loading) {
    return (
      <LinearGradient colors={theme.colors.gradient} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>İlan yükleniyor...</Text>
      </LinearGradient>
    );
  }

  if (!listing) {
    return (
      <LinearGradient colors={theme.colors.gradient} style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>İlan bulunamadı</Text>
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
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>İlanı Düzenle</Text>
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
          <View style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
            {/* İlan Türü */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>İlan Türü *</Text>
              <View style={styles.typeGrid}>
                {listingTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeCard,
                      { backgroundColor: theme.colors.background },
                      form.listingType === type.id && { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={() => setForm({ ...form, listingType: type.id as any })}
                  >
                    <Text style={[
                      styles.typeTitle,
                      { color: theme.colors.text },
                      form.listingType === type.id && { color: '#FFFFFF' },
                    ]}>
                      {type.name}
                    </Text>
                    <Text style={[
                      styles.typeDescription,
                      { color: theme.colors.textSecondary },
                      form.listingType === type.id && { color: 'rgba(255, 255, 255, 0.8)' },
                    ]}>
                      {type.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

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

            {/* Başlık */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>İlan Başlığı *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={form.title}
                onChangeText={(text) => setForm({ ...form, title: text })}
                placeholder="İlanınız için çekici bir başlık yazın"
                placeholderTextColor={theme.colors.textSecondary}
                maxLength={100}
              />
            </View>

            {/* Açıklama */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Açıklama *</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={form.description}
                onChangeText={(text) => setForm({ ...form, description: text })}
                placeholder="İlanınız hakkında detaylı bilgi verin..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={500}
              />
            </View>

            {/* Konum */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Konum</Text>
              <View style={[styles.locationInputContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                <MapPin size={20} color={theme.colors.primary} style={styles.locationIcon} />
                <TextInput
                  style={[styles.locationInput, { color: theme.colors.text }]}
                  value={form.location}
                  onChangeText={(text) => setForm({ ...form, location: text })}
                  placeholder="Şehir, İlçe"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
            </View>

            {/* Fiyat (Hizmet ilanları için) */}
            {form.listingType !== 'adoption' && (
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.colors.text }]}>Fiyat (₺)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={form.price?.toString() || ''}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9]/g, '');
                    setForm({ ...form, price: numericValue ? parseInt(numericValue) : undefined });
                  }}
                  placeholder="Hizmet ücreti"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            )}

            {/* İletişim Tercihleri */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>İletişim Tercihleri *</Text>
              <View style={styles.contactGrid}>
                {contactOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.contactOption,
                      { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
                      form.contactPreferences.includes(option.id) && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                    ]}
                    onPress={() => toggleContactPreference(option.id)}
                  >
                    <Text style={[
                      styles.contactOptionText,
                      { color: theme.colors.text },
                      form.contactPreferences.includes(option.id) && { color: '#FFFFFF' },
                    ]}>
                      {option.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* İlan Aktif */}
            <View style={styles.switchContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>İlan Aktif</Text>
              <Switch
                value={form.isActive}
                onValueChange={(value) => setForm({ ...form, isActive: value })}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={form.isActive ? '#FFFFFF' : '#F3F4F6'}
              />
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );

  const toggleContactPreference = (preference: string) => {
    setForm(prev => ({
      ...prev,
      contactPreferences: prev.contactPreferences.includes(preference)
        ? prev.contactPreferences.filter(p => p !== preference)
        : [...prev.contactPreferences, preference]
    }));
  };
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
    gap: 8,
  },
  typeCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  typeDescription: {
    fontSize: 12,
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
    height: 120,
    paddingTop: 12,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  locationIcon: {
    marginRight: 12,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  contactOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  contactOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
});