import React, { useState, useEffect, useRef } from 'react';
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
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Camera, Save, Calendar, Trash2 } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Pet } from '@/types';
import { apiService } from '@/services/api';
import { usePet } from '@/contexts/PetContext'; // PetContext'i import et
import { mockPets } from '@/services/mockData';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

interface EditPetForm {
  name: string;
  petTypeID: number;
  breedID: number | null;
  breedName: string;
  birthDate: Date;
  gender: 0 | 1; // 0: female, 1: male
  isNeutered: boolean;
  description: string;
  color: string;
  isActiveForMatching: boolean;
}

export default function EditPetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { userPets, updatePet, refreshPets } = usePet(); // updatePet ve refreshPets'i context'ten al
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pet, setPet] = useState<Pet | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [currentImageUri, setCurrentImageUri] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const notificationAnim = useRef(new Animated.Value(-100)).current;
  const [form, setForm] = useState<EditPetForm>({
    name: '',
    petTypeID: 1,
    breedID: null,
    breedName: '',
    birthDate: new Date(),
    gender: 1,
    isNeutered: false,
    description: '',
    color: '',
    isActiveForMatching: true,
  });

  const petTypes = [
    { id: 1, name: 'Kedi' },
    { id: 2, name: 'Köpek' },
  ];

  const catBreeds = [
    { id: 1, name: 'Scottish Fold' },
    { id: 2, name: 'British Shorthair' },
    { id: 4, name: 'Tekir' },
    { id: 5, name: 'Van Kedisi' },
    { id: 6, name: 'Persian' },
  ];

  const dogBreeds = [
    { id: 7, name: 'Golden Retriever' },
    { id: 8, name: 'Labrador' },
    { id: 9, name: 'Alman Kurdu' },
    { id: 10, name: 'Poodle' },
    { id: 11, name: 'Beagle' },
  ];

  const getCurrentBreeds = () => {
    return form.petTypeID === 1 ? catBreeds : dogBreeds;
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    
    Animated.sequence([
      Animated.timing(notificationAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(notificationAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setNotification(null);
    });
  };

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
  }, [id, userPets]); // userPets değiştiğinde de tetikle

  const loadPetData = async () => {
    setLoading(true);
    // Veriyi context'ten al, API çağrısını tekrar yapma
    const foundPet = userPets.find(p => p.id === id);
    
    if (foundPet) {
      setPet(foundPet);
      setCurrentImageUri(foundPet.photos?.[0] || '');
      
      // Parse birth date
      let birthDate = new Date();
      if (foundPet.birthDate) {
        console.log('API birthDate:', foundPet.birthDate);
        const parsedDate = new Date(foundPet.birthDate);
        if (!isNaN(parsedDate.getTime())) {
          birthDate = parsedDate;
        }
        console.log('Parsed birthDate:', birthDate);
      } else {
        console.log('No birthDate from API, using current date');
      }
      
      // API'den gelen cins ismini hardcoded listede bul
      const petTypeID = foundPet.species === 'cat' ? 1 : 2;
      const availableBreeds = petTypeID === 1 ? catBreeds : dogBreeds;
      const matchingBreed = availableBreeds.find(breed => 
        breed.name.toLowerCase() === foundPet.breed.toLowerCase()
      );
      
      console.log('API breed name:', foundPet.breed);
      console.log('Available breeds:', availableBreeds.map(b => b.name));
      console.log('Matching breed found:', matchingBreed);
      
      console.log('Setting form data:', {
        name: foundPet.name,
        petTypeID: petTypeID,
        breedID: matchingBreed ? matchingBreed.id : null,
        breedName: foundPet.breed,
        birthDate: birthDate,
        gender: foundPet.gender === 'male' ? 1 : 0,
        isNeutered: foundPet.neutered,
        description: foundPet.description,
        color: foundPet.color,
        isActiveForMatching: foundPet.isActive,
      });

      setForm({
        name: foundPet.name,
        petTypeID: petTypeID,
        breedID: matchingBreed ? matchingBreed.id : null,
        breedName: foundPet.breed,
        birthDate: birthDate,
        gender: foundPet.gender === 'male' ? 1 : 0,
        isNeutered: foundPet.neutered,
        description: foundPet.description,
        color: foundPet.color || colors[0], // İlk rengi default yap
        isActiveForMatching: foundPet.isActive,
      });
      
      console.log('Final form data set:', {
        breedID: matchingBreed ? matchingBreed.id : null,
        breedName: foundPet.breed,
        color: foundPet.color || colors[0]
      });
    } else if (userPets.length > 0) { // Petler yüklendi ama bu ID bulunamadı
        showNotification('Hayvan bulunamadı. Liste güncel olmayabilir.', 'error');
        setTimeout(() => router.back(), 2000);
    }
    setLoading(false);
  };

  const calculateAge = (birthDate: Date): number => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
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
      setForm({ ...form, birthDate: selectedDate });
      console.log('Date selected:', selectedDate);
    }
  };

  const pickImage = async () => {
    try {
      setImageLoading(true);
      
      // İzin iste
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        showNotification('Fotoğraf seçmek için galeri erişim izni gerekli.', 'error');
        return;
      }

      // Resim seç
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedImage = result.assets[0];
        console.log('Seçilen resim:', selectedImage);
        
        try {
          // Fotoğrafı hemen API'ye yükle
          console.log('Fotoğraf API\'ye yükleniyor...');
          const uploadResult = await apiService.uploadImage(selectedImage.uri, id);
          console.log('Fotoğraf yükleme sonucu:', uploadResult);
          
          // State'i güncelle
          setCurrentImageUri(uploadResult.imageUrl);
          setForm({ ...form, profilePictureURL: uploadResult.imageUrl });
          
          showNotification('📸 Fotoğraf seçildi ve kaydedildi! 🎉', 'success');
        } catch (uploadError) {
          console.error('Fotoğraf yükleme hatası:', uploadError);
          showNotification('Fotoğraf seçildi ama yüklenirken hata oluştu.', 'error');
          // Yine de state'i güncelle
          setCurrentImageUri(selectedImage.uri);
        }
      }
    } catch (error) {
      console.error('Resim seçme hatası:', error);
      showNotification('Resim seçilirken bir hata oluştu.', 'error');
    } finally {
      setImageLoading(false);
    }
  };

  const deletePhoto = async () => {
    try {
      if (id) {
        // API'den fotoğrafı sil
        await apiService.deletePetPhoto(id);
        console.log('Fotoğraf API\'den silindi');
      }
      
      // State'i güncelle
      setCurrentImageUri('');
      setForm({ ...form, profilePictureURL: '' });
      
      showNotification('🗑️ Fotoğraf silindi! 🎉', 'success');
    } catch (error) {
      console.error('Fotoğraf silme hatası:', error);
      showNotification('Fotoğraf silinirken hata oluştu.', 'error');
    }
  };

  const takePhoto = async () => {
    try {
      setImageLoading(true);
      
      // Kamera izni iste
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        showNotification('Fotoğraf çekmek için kamera erişim izni gerekli.', 'error');
        return;
      }

      // Fotoğraf çek
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const takenPhoto = result.assets[0];
        console.log('Çekilen fotoğraf:', takenPhoto);
        
        try {
          // Fotoğrafı hemen API'ye yükle
          console.log('Fotoğraf API\'ye yükleniyor...');
          const uploadResult = await apiService.uploadImage(takenPhoto.uri, id);
          console.log('Fotoğraf yükleme sonucu:', uploadResult);
          
          // State'i güncelle
          setCurrentImageUri(uploadResult.imageUrl);
          setForm({ ...form, profilePictureURL: uploadResult.imageUrl });
          
          showNotification('📸 Fotoğraf çekildi ve kaydedildi! 🎉', 'success');
        } catch (uploadError) {
          console.error('Fotoğraf yükleme hatası:', uploadError);
          showNotification('Fotoğraf çekildi ama yüklenirken hata oluştu.', 'error');
          // Yine de state'i güncelle
          setCurrentImageUri(takenPhoto.uri);
        }
      }
    } catch (error) {
      console.error('Fotoğraf çekme hatası:', error);
      showNotification('Fotoğraf çekilirken bir hata oluştu.', 'error');
    } finally {
      setImageLoading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Fotoğraf Seç',
      'Fotoğrafı nereden seçmek istiyorsunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Galeriden Seç', onPress: pickImage },
        { text: 'Fotoğraf Çek', onPress: takePhoto },
      ]
    );
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      // API'ye uygun veri formatı oluştur
      const updatedPetData = {
        name: form.name.trim(),
        petTypeID: form.petTypeID,
        breedID: form.breedID,
        breedName: form.breedName.trim(),
        gender: form.gender, // 0 veya 1 (API formatı)
        birthDate: form.birthDate.toISOString().split('T')[0], // YYYY-MM-DD formatı
        isNeutered: form.isNeutered,
        description: form.description.trim(),
        color: form.color,
        isActiveForMatching: form.isActiveForMatching,
        // Fotoğraf değiştiyse yeni URL'i ekle, değişmediyse eskisini koru
        profilePictureURL: currentImageUri || currentPet?.photos?.[0] || '', 
      };

      await updatePet(id, updatedPetData);
      
      // Context'i yenile
      await refreshPets();
      
      showNotification('Hayvan bilgileri başarıyla güncellendi! 🎉', 'success');
      setTimeout(() => router.back(), 2000);
      
    } catch (error: any) {
      console.error('Error updating pet:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Güncelleme sırasında bir hata oluştu.';
      showNotification(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePetTypeChange = (petTypeID: number) => {
    const newBreeds = petTypeID === 1 ? catBreeds : dogBreeds;
    setForm({
      ...form,
      petTypeID,
      breedID: newBreeds[0].id,
      breedName: newBreeds[0].name,
    });
  };

  const renderPetTypeSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>Hayvan Türü</Text>
      <View style={styles.petTypeButtons}>
        {petTypes.map((petType) => (
          <TouchableOpacity
            key={petType.id}
            style={[
              styles.petTypeButton,
              form.petTypeID === petType.id && styles.selectedPetTypeButton,
            ]}
            onPress={() => handlePetTypeChange(petType.id)}
          >
            <Text style={[
              styles.petTypeButtonText,
              form.petTypeID === petType.id && styles.selectedPetTypeButtonText,
            ]}>
              {petType.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderBreedSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>Cins</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {getCurrentBreeds().map((breed) => (
          <TouchableOpacity
            key={breed.id}
            style={[
              styles.selectorItem,
              form.breedID === breed.id && styles.selectedItem,
            ]}
            onPress={() => setForm({ ...form, breedID: breed.id, breedName: breed.name })}
          >
            <Text style={[
              styles.selectorText,
              form.breedID === breed.id && styles.selectedText,
            ]}>
              {breed.name}
            </Text>
          </TouchableOpacity>
        ))}
        {form.breedID === null && (
          <TouchableOpacity
            style={[styles.selectorItem, styles.selectedItem]}
          >
            <Text style={[styles.selectorText, styles.selectedText]}>
              {form.breedName} (Özel)
            </Text>
          </TouchableOpacity>
        )}
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
      <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
        Seçili: {form.color || 'Hiçbiri'}
      </Text>
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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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

        {/* Notification */}
        {notification && (
          <Animated.View 
            style={[
              styles.notification,
              { transform: [{ translateY: notificationAnim }] }
            ]}
          >
            <LinearGradient
              colors={notification.type === 'success' 
                ? ['#10B981', '#059669'] 
                : ['#EF4444', '#DC2626']
              }
              style={styles.notificationGradient}
            >
              <Text style={styles.notificationText}>
                {notification.message}
              </Text>
            </LinearGradient>
          </Animated.View>
        )}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profil Fotoğrafı */}
          <View style={styles.photoSection}>
            <View style={styles.photoContainer}>
              <Image 
                source={{ uri: currentImageUri || (pet.photos && pet.photos.length > 0 ? pet.photos[0] : '') }}
                style={styles.photo} 
              />
              <TouchableOpacity 
                style={styles.cameraButton}
                onPress={showImageOptions}
                disabled={imageLoading}
              >
                {imageLoading ? (
                  <ActivityIndicator size={16} color="#FFFFFF" />
                ) : (
                  <Camera size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
              {(currentImageUri || (pet.photos && pet.photos.length > 0 && pet.photos[0])) && (
                <TouchableOpacity 
                  style={styles.deletePhotoButton}
                  onPress={deletePhoto}
                >
                  <Trash2 size={16} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={showImageOptions} disabled={imageLoading}>
              <Text style={styles.photoText}>
                {imageLoading ? 'Yükleniyor...' : 'Fotoğrafı değiştir'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Hayvan Türü */}
            {renderPetTypeSelector()}

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

            {/* Doğum Tarihi */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Doğum Tarihi</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={20} color="#6366F1" />
                <Text style={styles.datePickerText}>
                  {formatDate(form.birthDate)} ({calculateAge(form.birthDate)} yaşında)
                </Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={form.birthDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(2000, 0, 1)}
                />
              )}
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
                onValueChange={(value) => {
                  try {
                    console.log('Kısırlaştırma değiştiriliyor:', value);
                    setForm(prevForm => ({ ...prevForm, isNeutered: value }));
                    console.log('Kısırlaştırma güncellendi');
                  } catch (error) {
                    console.error('Kısırlaştırma güncelleme hatası:', error);
                  }
                }}
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
  deletePhotoButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
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
  datePickerButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
    flex: 1,
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
  petTypeButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  petTypeButton: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedPetTypeButton: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  petTypeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  selectedPetTypeButtonText: {
    color: '#FFFFFF',
  },
  notification: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    borderRadius: 12,
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  notificationGradient: {
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});