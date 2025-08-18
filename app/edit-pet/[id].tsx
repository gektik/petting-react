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
  ActivityIndicator,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Camera, Save } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Pet } from '@/types';
import { apiService } from '@/services/api';

interface EditPetForm {
  name: string;
  breedName: string;
  age: number;
  gender: 0 | 1; // 0: female, 1: male
  isNeutered: boolean;
  description: string;
  color: string;
  isActiveForMatching: boolean;
}

export default function EditPetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pet, setPet] = useState<Pet | null>(null);
  const [form, setForm] = useState<EditPetForm>({
    name: '',
    breedName: '',
    age: 0,
    gender: 1,
    isNeutered: false,
    description: '',
    color: '',
    isActiveForMatching: true,
  });

  const breeds = [
    'Scottish Fold',
    'British Shorthair',
    'Tekir',
    'Van Kedisi',
    'Ankara Kedisi',
    'Persian',
    'Maine Coon',
    'Siamese',
    'Ragdoll',
    'Bengal',
  ];

  const colors = [
    'Beyaz',
    'Siyah',
    'Gri',
    'Kahverengi',
    'Sarı',
    'Turuncu',
    'Siyah-Beyaz',
    'Gri-Beyaz',
    'Kahverengi-Beyaz',
    'Üç Renkli',
  ];

  useEffect(() => {
    if (id) {
      loadPetData();
    }
  }, [id]);

  const loadPetData = async () => {
    try {
      setLoading(true);
      const pets = await apiService.getUserPets();
      const foundPet = pets.find(p => p.petID.toString() === id);
      
      if (foundPet) {
        const convertedPet: Pet = {
          id: foundPet.petID.toString(),
          name: foundPet.name,
          species: 'cat',
          breed: foundPet.breedName,
          age: foundPet.age || 0,
          gender: foundPet.gender === 0 ? 'female' : 'male',
          neutered: foundPet.isNeutered,
          photos: foundPet.profilePictureURL ? [foundPet.profilePictureURL] : ['https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=400'],
          description: foundPet.description || '',
          color: foundPet.color || '',
          ownerId: foundPet.userID,
          isActive: foundPet.isActiveForMatching,
          location: 'Türkiye',
          createdAt: foundPet.createdDate,
        };
        
        setPet(convertedPet);
        setForm({
          name: convertedPet.name,
          breedName: convertedPet.breed,
          age: convertedPet.age,
          gender: convertedPet.gender === 'male' ? 1 : 0,
          isNeutered: convertedPet.neutered,
          description: convertedPet.description,
          color: convertedPet.color,
          isActiveForMatching: convertedPet.isActive,
        });
      } else {
        Alert.alert('Hata', 'Hayvan bulunamadı.');
        router.back();
      }
    } catch (error) {
      console.error('Error loading pet:', error);
      Alert.alert('Hata', 'Hayvan bilgileri yüklenirken hata oluştu.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Hata', 'Hayvan adı boş olamaz.');
      return;
    }

    if (!form.breedName.trim()) {
      Alert.alert('Hata', 'Cins seçimi yapmalısınız.');
      return;
    }

    try {
      setSaving(true);
      
      // API'ye güncelleme isteği gönder
      const updateData = {
        petID: parseInt(id!),
        name: form.name.trim(),
        breedName: form.breedName,
        age: form.age,
        gender: form.gender,
        isNeutered: form.isNeutered,
        description: form.description.trim(),
        color: form.color,
        isActiveForMatching: form.isActiveForMatching,
      };

      console.log('Updating pet with data:', updateData);
      
      // Şimdilik mock update - gerçek API endpoint'i eklendiğinde değiştirilecek
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Başarılı',
        'Hayvan bilgileri güncellendi.',
        [
          {
            text: 'Tamam',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error updating pet:', error);
      Alert.alert('Hata', 'Güncelleme sırasında hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const renderBreedSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>Cins</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {breeds.map((breed) => (
          <TouchableOpacity
            key={breed}
            style={[
              styles.selectorItem,
              form.breedName === breed && styles.selectedItem,
            ]}
            onPress={() => setForm({ ...form, breedName: breed })}
          >
            <Text style={[
              styles.selectorText,
              form.breedName === breed && styles.selectedText,
            ]}>
              {breed}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderColorSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>Renk</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {colors.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.selectorItem,
              form.color === color && styles.selectedItem,
            ]}
            onPress={() => setForm({ ...form, color })}
          >
            <Text style={[
              styles.selectorText,
              form.color === color && styles.selectedText,
            ]}>
              {color}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#F8FAFC', '#E2E8F0']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Hayvan bilgileri yükleniyor...</Text>
      </LinearGradient>
    );
  }

  if (!pet) {
    return (
      <LinearGradient colors={['#F8FAFC', '#E2E8F0']} style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Hayvan bulunamadı</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#F8FAFC', '#E2E8F0']} style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hayvanı Düzenle</Text>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size={20} color="#FFFFFF" />
          ) : (
            <Save size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profil Fotoğrafı */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            <Image source={{ uri: pet.photos[0] }} style={styles.photo} />
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.photoText}>Fotoğrafı değiştir</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* İsim */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>İsim</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
              placeholder="Hayvan adı"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Cins */}
          {renderBreedSelector()}

          {/* Yaş */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Yaş</Text>
            <TextInput
              style={styles.input}
              value={form.age.toString()}
              onChangeText={(text) => setForm({ ...form, age: parseInt(text) || 0 })}
              placeholder="Yaş"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>

          {/* Cinsiyet */}
          <View style={styles.genderContainer}>
            <Text style={styles.label}>Cinsiyet</Text>
            <View style={styles.genderButtons}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  form.gender === 1 && styles.selectedGenderButton,
                ]}
                onPress={() => setForm({ ...form, gender: 1 })}
              >
                <Text style={[
                  styles.genderButtonText,
                  form.gender === 1 && styles.selectedGenderButtonText,
                ]}>
                  Erkek
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  form.gender === 0 && styles.selectedGenderButton,
                ]}
                onPress={() => setForm({ ...form, gender: 0 })}
              >
                <Text style={[
                  styles.genderButtonText,
                  form.gender === 0 && styles.selectedGenderButtonText,
                ]}>
                  Dişi
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Renk */}
          {renderColorSelector()}

          {/* Açıklama */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
              placeholder="Hayvanınız hakkında bilgi verin..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Kısırlaştırma */}
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Kısırlaştırıldı mı?</Text>
            <Switch
              value={form.isNeutered}
              onValueChange={(value) => setForm({ ...form, isNeutered: value })}
              trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
              thumbColor={form.isNeutered ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>

          {/* Eşleşme için aktif */}
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Eşleşme için aktif</Text>
            <Switch
              value={form.isActiveForMatching}
              onValueChange={(value) => setForm({ ...form, isActiveForMatching: value })}
              trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
              thumbColor={form.isActiveForMatching ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>
        </View>
      </ScrollView>
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
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
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
    backgroundColor: '#FFFFFF',
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
    color: '#1F2937',
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
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  photoText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  selectorContainer: {
    marginBottom: 20,
  },
  horizontalScroll: {
    marginTop: 8,
  },
  selectorItem: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedItem: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  selectorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  genderContainer: {
    marginBottom: 20,
  },
  genderButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedGenderButton: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  genderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedGenderButtonText: {
    color: '#FFFFFF',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
});