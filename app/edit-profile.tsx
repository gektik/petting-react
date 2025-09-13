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
import { ArrowLeft, Camera, Save, User, Mail, MapPin, Edit3 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { apiService } from '@/services/api';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || 'Gökhan',
    lastName: user?.lastName || 'Ektik',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    profilePhoto: user?.profilePhoto || '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || 'Gökhan',
        lastName: user.lastName || 'Ektik',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        profilePhoto: user.profilePhoto || '',
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ad alanı zorunludur';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyad alanı zorunludur';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-posta alanı zorunludur';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Hata', 'Fotoğraf seçmek için izin gerekli');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingImage(true);
        try {
          const uploadResult = await apiService.uploadProfileImage(result.assets[0].uri);
          setFormData(prev => ({
            ...prev,
            profilePhoto: uploadResult.imageUrl
          }));
          
          // AuthContext'teki user state'ini de güncelle
          await updateUser({
            profilePhoto: uploadResult.imageUrl
          });
          
          Alert.alert('Başarılı', 'Profil fotoğrafı güncellendi');
        } catch (error) {
          console.error('Image upload error:', error);
          Alert.alert('Hata', 'Fotoğraf yüklenirken hata oluştu');
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Hata', 'Fotoğraf seçerken hata oluştu');
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      console.log('Profil güncelleniyor:', formData);
      
      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        bio: formData.bio.trim(),
        location: formData.location.trim(),
        profilePictureURL: formData.profilePhoto,
      };

      const result = await apiService.updateUserProfile(updateData);
      console.log('Profil güncelleme sonucu:', result);

      // AuthContext'teki kullanıcı verisini güncelle
      await updateUser({
        ...user,
        ...updateData,
        profilePhoto: formData.profilePhoto,
      });

      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi', [
        {
          text: 'Tamam',
          onPress: () => router.back()
        }
      ]);
    } catch (error: any) {
      console.error('Profil güncelleme hatası:', error);
      Alert.alert('Hata', error.message || 'Profil güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

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
        <Text style={styles.headerTitle}>Profili Düzenle</Text>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Save size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          <View style={styles.content}>
            {/* Profile Photo Section */}
            <View style={styles.photoSection}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ 
                    uri: formData.profilePhoto || 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' 
                  }}
                  style={styles.avatar}
                />
                <TouchableOpacity
                  style={[styles.cameraButton, uploadingImage && styles.cameraButtonDisabled]}
                  onPress={handleImagePicker}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Camera size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              </View>
              <Text style={styles.photoText}>Profil Fotoğrafı</Text>
            </View>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              {/* First Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ad *</Text>
                <View style={styles.inputContainer}>
                  <User size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, errors.firstName && styles.inputError]}
                    value={formData.firstName}
                    onChangeText={(value) => handleInputChange('firstName', value)}
                    placeholder="Adınızı girin"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
              </View>

              {/* Last Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Soyad *</Text>
                <View style={styles.inputContainer}>
                  <User size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, errors.lastName && styles.inputError]}
                    value={formData.lastName}
                    onChangeText={(value) => handleInputChange('lastName', value)}
                    placeholder="Soyadınızı girin"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-posta *</Text>
                <View style={styles.inputContainer}>
                  <Mail size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    placeholder="E-posta adresinizi girin"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              {/* Location */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Konum</Text>
                <View style={styles.inputContainer}>
                  <MapPin size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={formData.location}
                    onChangeText={(value) => handleInputChange('location', value)}
                    placeholder="Şehir, Ülke"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Bio */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Hakkımda</Text>
                <View style={styles.inputContainer}>
                  <Edit3 size={20} color="#6B7280" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.bio}
                    onChangeText={(value) => handleInputChange('bio', value)}
                    placeholder="Kendiniz hakkında kısa bir açıklama yazın"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>
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
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 16,
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
    backgroundColor: '#9CA3AF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#E5E7EB',
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
  cameraButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  photoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
  },
});