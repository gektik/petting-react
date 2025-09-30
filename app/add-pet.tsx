import React, { useState, useRef } from 'react';
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
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Camera, Save, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { apiService } from '@/services/api';
import { usePet } from '@/contexts/PetContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

interface AddPetForm {
  name: string;
  petTypeID: number;
  breedID: number;
  breedName: string;
  birthDate: Date;
  gender: 0 | 1; // 0: female, 1: male
  isNeutered: boolean;
  description: string;
  color: string;
  isActiveForMatching: boolean;
  profilePictureURL: string;
}

export default function AddPetScreen() {
  const router = useRouter();
  const { addPet } = usePet();
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const notificationAnim = useRef(new Animated.Value(-100)).current;
  const [form, setForm] = useState<AddPetForm>({
    name: '',
    petTypeID: 1, // 1: Kedi, 2: Köpek
    breedID: 1,
    breedName: 'Tekir',
    birthDate: new Date(),
    gender: 1,
    isNeutered: false,
    description: '',
    color: 'Beyaz',
    isActiveForMatching: true,
    profilePictureURL: null,
  });

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

  const handlePetTypeChange = (petTypeID: number) => {
    const newBreeds = petTypeID === 1 ? catBreeds : dogBreeds;
    
    setForm({
      ...form,
      petTypeID,
      breedID: newBreeds[0].id,
      breedName: newBreeds[0].name,
      // profilePictureURL'yi değiştirme, kullanıcı kendi fotoğrafını eklesin
    });
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
    }
  };

  const pickImage = async () => {
    try {
      setImageLoading(true);
      
      // İzin iste
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişim izni gerekli.');
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
          // Resmi API'ye yükle (yeni pet için petId yok)
          console.log('Resim API\'ye yükleniyor...');
          const uploadResult = await apiService.uploadImage(selectedImage.uri);
          console.log('Resim yükleme sonucu:', uploadResult);
          
          // Form'u güncelle
         const newImageUrl = uploadResult.imageUrl;
          console.log('Yeni resim URL\'si:', newImageUrl);
         
         if (!newImageUrl) {
           throw new Error('Upload başarılı ama resim URL\'si alınamadı');
         }
         
          setForm({ 
            ...form, 
            profilePictureURL: newImageUrl 
          });
          
          Alert.alert('Başarılı', 'Resim başarıyla yüklendi!');
        } catch (uploadError) {
          console.error('Resim yükleme hatası:', uploadError);
          Alert.alert(
            'Yükleme Hatası', 
            'Resim yüklenirken hata oluştu. Lütfen tekrar deneyin.',
            [
              { text: 'Tamam' },
              { text: 'Tekrar Dene', onPress: pickImage }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Resim seçme hatası:', error);
      Alert.alert('Hata', 'Resim seçilirken bir hata oluştu.');
    } finally {
      setImageLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      setImageLoading(true);
      
      // Kamera izni iste
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('İzin Gerekli', 'Fotoğraf çekmek için kamera erişim izni gerekli.');
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
          // Resmi API'ye yükle
          console.log('Fotoğraf API\'ye yükleniyor...');
          const uploadResult = await apiService.uploadImage(takenPhoto.uri);
          console.log('Fotoğraf yükleme sonucu:', uploadResult);
          
          // Form'u güncelle
         const newImageUrl = uploadResult.imageUrl;
          console.log('Yeni fotoğraf URL\'si:', newImageUrl);
         
         if (!newImageUrl) {
           throw new Error('Upload başarılı ama fotoğraf URL\'si alınamadı');
         }
         
          setForm({ 
            ...form, 
            profilePictureURL: newImageUrl 
          });
          
          Alert.alert('Başarılı', 'Fotoğraf başarıyla yüklendi!');
        } catch (uploadError) {
          console.error('Fotoğraf yükleme hatası:', uploadError);
          Alert.alert(
            'Yükleme Hatası', 
            'Fotoğraf yüklenirken hata oluştu. Lütfen tekrar deneyin.',
            [
              { text: 'Tamam' },
              { text: 'Tekrar Dene', onPress: takePhoto }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Fotoğraf çekme hatası:', error);
      Alert.alert('Hata', 'Fotoğraf çekilirken bir hata oluştu.');
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
    if (!form.name.trim()) {
      Alert.alert('Hata', 'Hayvan adı gereklidir.');
      return;
    }

    try {
      setSaving(true);
      console.log('Adding new pet...');
      
      // Format birthDate to YYYY-MM-DD format for API
      const formattedBirthDate = form.birthDate.toISOString().split('T')[0];
      
      // Ensure Turkish characters are properly encoded
      const petData = {
        name: form.name.trim(), // UTF-8 encoding will be handled by axios
        petTypeID: form.petTypeID,
        breedID: form.breedID,
        breedName: form.breedName, // Cins adını da gönder
        gender: form.gender,
        birthDate: formattedBirthDate,
        isNeutered: form.isNeutered,
        description: form.description.trim(), // UTF-8 encoding will be handled by axios
        color: form.color,
        profilePictureURL: form.profilePictureURL || null,
        isActiveForMatching: form.isActiveForMatching,
      };
      
      console.log('Pet data being sent to API:', petData);
      console.log('Color value being sent:', form.color);
      console.log('Adding pet with data:', petData);
      const result = await addPet(petData);
      console.log('Add result:', result);
      
      if (result) {
        showNotification('🎉 Hayvan başarıyla eklendi! Artık eşleşme yapabilirsiniz! 🎉', 'success');
        setTimeout(() => {
          router.push('/my-pets');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error adding pet:', error);
      showNotification('❌ Hayvan eklenirken hata oluştu. Lütfen tekrar deneyin.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const selectBreed = (breed: { id: number; name: string }) => {
    setForm({ 
      ...form, 
      breedID: breed.id, 
      breedName: breed.name 
    });
  };

  const renderPetTypeSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>Hayvan Türü *</Text>
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
            onPress={() => selectBreed(breed)}
          >
            <Text style={[
              styles.selectorText,
              form.breedID === breed.id && styles.selectedText,
            ]}>
              {breed.name}
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

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#F8FAFC', '#E2E8F0']} style={styles.container}>
        <StatusBar style="dark" />
        
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
        
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yeni Hayvan Ekle</Text>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Save size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profil Fotoğrafı */}
          <View style={styles.photoSection}>
            <View style={styles.photoContainer}>
              {form.profilePictureURL ? (
                <Image 
                  source={{ uri: form.profilePictureURL }} 
                  style={styles.photo} 
                />
              ) : (
                <View style={[styles.photo, styles.placeholderPhoto]}>
                  <Text style={styles.placeholderPhotoText}>Fotoğraf Yok</Text>
                </View>
              )}
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
            </View>
            <TouchableOpacity onPress={showImageOptions} disabled={imageLoading}>
              <Text style={styles.photoText}>
                {imageLoading ? 'Yükleniyor...' : 'Fotoğraf ekle'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Hayvan Türü */}
            {renderPetTypeSelector()}

            {/* İsim */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>İsim *</Text>
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notification: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    borderRadius: 12,
    zIndex: 1000,
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
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderPhoto: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderPhotoText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});