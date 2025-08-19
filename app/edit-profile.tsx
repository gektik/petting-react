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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Camera, Save, User, Mail, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import * as ImagePicker from 'expo-image-picker';

interface EditProfileForm {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  location: string;
  bio: string;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [currentProfileImage, setCurrentProfileImage] = useState<string>(
    user?.profilePhoto || 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  );
  const [form, setForm] = useState<EditProfileForm>({
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    location: user?.location || '',
    bio: user?.bio || '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        location: user.location || '',
        bio: user.bio || '',
      });
      setCurrentProfileImage(user.profilePhoto || 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop');
    }
  }, [user]);

  const pickProfileImage = async () => {
    try {
      setImageLoading(true);
      console.log('📝 Profil düzenleme: Resim seçme başlatılıyor...');
      
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişim izni gerekli.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedImage = result.assets[0];
        console.log('📝 Resim seçildi, yükleme başlatılıyor...');
        
        try {
          const uploadResult = await apiService.uploadProfileImage(selectedImage.uri);
          const newImageUrl = uploadResult.imageUrl;
         
          if (!newImageUrl) {
            throw new Error('Upload başarılı ama profil resmi URL\'si alınamadı');
          }
         
          console.log('📝 Resim başarıyla yüklendi:', newImageUrl);
          setCurrentProfileImage(newImageUrl);
          
          Alert.alert('Başarılı', 'Profil resmi başarıyla güncellendi!');
        } catch (uploadError) {
          console.error('Profil resmi yükleme hatası:', uploadError);
          Alert.alert(
            'Yükleme Hatası', 
            'Profil resmi yüklenirken hata oluştu. Lütfen tekrar deneyin.',
            [
              { text: 'Tamam' },
              { text: 'Tekrar Dene', onPress: pickProfileImage }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Profil resmi seçme hatası:', error);
      Alert.alert('Hata', 'Profil resmi seçilirken bir hata oluştu.');
    } finally {
      setImageLoading(false);
    }
  };

  const takeProfilePhoto = async () => {
    try {
      setImageLoading(true);
      console.log('📝 Profil düzenleme: Fotoğraf çekme başlatılıyor...');
      
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('İzin Gerekli', 'Fotoğraf çekmek için kamera erişim izni gerekli.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const takenPhoto = result.assets[0];
        console.log('📝 Fotoğraf çekildi, yükleme başlatılıyor...');
        
        try {
          const uploadResult = await apiService.uploadProfileImage(takenPhoto.uri);
          const newImageUrl = uploadResult.imageUrl;
         
          if (!newImageUrl) {
            throw new Error('Upload başarılı ama profil fotoğrafı URL\'si alınamadı');
          }
         
          console.log('📝 Fotoğraf başarıyla yüklendi:', newImageUrl);
          setCurrentProfileImage(newImageUrl);
          
          Alert.alert('Başarılı', 'Profil fotoğrafı başarıyla güncellendi!');
        } catch (uploadError) {
          console.error('Profil fotoğrafı yükleme hatası:', uploadError);
          Alert.alert(
            'Yükleme Hatası', 
            'Profil fotoğrafı yüklenirken hata oluştu. Lütfen tekrar deneyin.',
            [
              { text: 'Tamam' },
              { text: 'Tekrar Dene', onPress: takeProfilePhoto }
            ]
          );
        }
      }
    } catch (error) {
      console.error('Profil fotoğrafı çekme hatası:', error);
      Alert.alert('Hata', 'Profil fotoğrafı çekilirken bir hata oluştu.');
    } finally {
      setImageLoading(false);
    }
  };

  const showProfileImageOptions = () => {
    Alert.alert(
      'Profil Fotoğrafı',
      'Profil fotoğrafınızı nereden seçmek istiyorsunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Galeriden Seç', onPress: pickProfileImage },
        { text: 'Fotoğraf Çek', onPress: takeProfilePhoto },
      ]
    );
  };

  const handleSave = async () => {
    if (!form.username.trim()) {
      Alert.alert('Hata', 'Kullanıcı adı gereklidir.');
      return;
    }

    if (!form.email.trim()) {
      Alert.alert('Hata', 'E-posta adresi gereklidir.');
      return;
    }

    try {
      setSaving(true);
      console.log('📝 Profil güncelleme başlatılıyor...');
      
      const updateData = {
        username: form.username.trim(),
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        location: form.location.trim(),
        bio: form.bio.trim(),
        profilePictureURL: currentProfileImage,
      };
      
      console.log('📝 Güncelleme verisi:', updateData);
      const result = await apiService.updateUserProfile(updateData);
      console.log('📝 API yanıtı:', result);
      
      // Context'i güncelle
      const updatedUser = {
        ...user,
        username: form.username.trim(),
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        location: form.location.trim(),
        bio: form.bio.trim(),
        profilePhoto: currentProfileImage,
      };
      
      updateUser(updatedUser);
      
      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.', [
        { text: 'Tamam', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Profil güncelleme hatası:', error);
      const errorMessage = error instanceof Error ? error.message : 'Profil güncellenirken bir hata oluştu.';
      Alert.alert(
        'Güncelleme Hatası',
        errorMessage,
        [
          { text: 'Tamam' },
          { text: 'Tekrar Dene', onPress: handleSave }
        ]
      );
    } finally {
      setSaving(false);
    }
  };

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
          <Text style={styles.headerTitle}>Profili Düzenle</Text>
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
              <Image source={{ uri: currentProfileImage }} style={styles.photo} />
              <TouchableOpacity 
                style={styles.cameraButton}
                onPress={showProfileImageOptions}
                disabled={imageLoading}
              >
                {imageLoading ? (
                  <ActivityIndicator size={16} color="#FFFFFF" />
                ) : (
                  <Camera size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={showProfileImageOptions} disabled={imageLoading}>
              <Text style={styles.photoText}>
                {imageLoading ? 'Yükleniyor...' : 'Fotoğrafı değiştir'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Kullanıcı Adı */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Kullanıcı Adı *</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color="#6366F1" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={form.username}
                  onChangeText={(text) => setForm({ ...form, username: text })}
                  placeholder="Kullanıcı adınız"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* E-posta */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-posta *</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#6366F1" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={form.email}
                  onChangeText={(text) => setForm({ ...form, email: text })}
                  placeholder="E-posta adresiniz"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Ad */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ad</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color="#6366F1" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={form.firstName}
                  onChangeText={(text) => setForm({ ...form, firstName: text })}
                  placeholder="Adınız"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Soyad */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Soyad</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color="#6366F1" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={form.lastName}
                  onChangeText={(text) => setForm({ ...form, lastName: text })}
                  placeholder="Soyadınız"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Konum */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Konum</Text>
              <View style={styles.inputWrapper}>
                <MapPin size={20} color="#6366F1" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={form.location}
                  onChangeText={(text) => setForm({ ...form, location: text })}
                  placeholder="Şehir, Ülke"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Biyografi */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Hakkımda</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.bio}
                onChangeText={(text) => setForm({ ...form, bio: text })}
                placeholder="Kendiniz hakkında kısa bir açıklama yazın..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 100,
    paddingTop: 12,
  },
});