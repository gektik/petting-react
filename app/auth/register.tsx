import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Mail, Lock, User, Eye, EyeOff, Chrome } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { RegisterRequest } from '@/services/api';
import { socialAuthService } from '@/services/socialAuth';
import { useTheme } from '@/contexts/ThemeContext';

export default function RegisterScreen() {
  const { theme, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { updateUser } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !username || !password || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setIsLoading(true);
    try {
      const registerData: RegisterRequest = {
        username,
        email,
        password,
      };
      console.log('Register Screen: Kayıt işlemi başlatılıyor...');
      await register(registerData);
      console.log('Register Screen: Kayıt başarılı, yönlendirme yapılıyor...');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Register screen error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Kayıt sırasında bir hata oluştu.';
      Alert.alert(
        'Kayıt Hatası', 
        errorMessage,
        [
          { text: 'Tamam', style: 'default' },
          { text: 'Tekrar Dene', onPress: handleRegister, style: 'cancel' }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setIsLoading(true);
      console.log('Google Register başlatılıyor...');
      const result = await socialAuthService.signInWithGoogle();
      console.log('Google OAuth başarılı, API\'ye gönderiliyor...');
      
      // Google token'ı API'ye gönder
      const response = await apiService.googleLogin(result.token);
      
      if (response.isSuccess && response.token) {
        const userData = {
          id: response.user?.id || response.userId || 'google_user',
          username: response.user?.firstName || response.username || 'Google User',
          email: response.user?.email || response.email || 'google@example.com',
        };
        
        if (Platform.OS === 'web') {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user_data', JSON.stringify(userData));
        } else {
          const AsyncStorage = await import('@react-native-async-storage/async-storage');
          await AsyncStorage.setItem('auth_token', response.token);
          await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        }
        
        // Context'i güncelle
        updateUser(userData);
      }
      
      router.replace('/(tabs)');
      console.log('Google Register tamamlandı');
    } catch (error) {
      console.error('Google register error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Google kayıt işlemi başarısız oldu.';
      Alert.alert('Google Kayıt Hatası', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookRegister = async () => {
    try {
      setIsLoading(true);
      console.log('Facebook Register başlatılıyor...');
      const result = await socialAuthService.signInWithFacebook();
      console.log('Facebook OAuth başarılı, API\'ye gönderiliyor...');
      
      // Facebook token'ı API'ye gönder
      const response = await apiService.facebookLogin(result.token);
      
      if (response.isSuccess && response.token) {
        // API service'e token'ı set et
        apiService.setAuthToken(response.token);
        
        const userData = {
          id: response.user?.id || response.userId || 'facebook_user',
          username: response.user?.firstName || response.username || 'Facebook User',
          email: response.user?.email || response.email || 'facebook@example.com',
        };
        
        if (Platform.OS === 'web') {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user_data', JSON.stringify(userData));
        } else {
          const AsyncStorage = await import('@react-native-async-storage/async-storage');
          await AsyncStorage.setItem('auth_token', response.token);
          await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        }
        
        // Context'i güncelle
        updateUser(userData);
      }
      
      router.replace('/(tabs)');
      console.log('Facebook Register tamamlandı');
    } catch (error) {
      console.error('Facebook register error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Facebook kayıt işlemi başarısız oldu.';
      Alert.alert('Facebook Kayıt Hatası', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={isDark ? theme.colors.headerGradient : ['#667EEA', '#764BA2']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Heart size={48} color="#FFFFFF" fill="#FFFFFF" />
            </View>
            <Text style={styles.appName}>Petting</Text>
            <Text style={styles.subtitle}>Hesap oluşturun ve keşfetmeye başlayın</Text>
          </View>

          <View style={styles.formContainer}>
          <View style={[styles.formContainer, { backgroundColor: isDark ? theme.colors.surface : 'rgba(255, 255, 255, 0.95)' }]}>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#6366F1" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="E-posta"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <User size={20} color="#6366F1" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Kullanıcı adı"
                placeholderTextColor="#9CA3AF"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#6366F1" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Şifre"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#6366F1" />
                ) : (
                  <Eye size={20} color="#6366F1" />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#6366F1" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Şifre tekrarı"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#6366F1" />
                ) : (
                  <Eye size={20} color="#6366F1" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                style={styles.buttonGradient}
              >
                <Text style={styles.registerButtonText}>
                  {isLoading ? 'Kayıt Oluşturuluyor...' : 'Kayıt Ol'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>veya</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleGoogleRegister}
                disabled={isLoading}
              >
                <Chrome size={20} color="#DB4437" />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleFacebookRegister}
                disabled={isLoading}
              >
                <View style={styles.facebookIcon}>
                  <Text style={styles.facebookIconText}>f</Text>
                </View>
                <Text style={styles.socialButtonText}>Facebook</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Zaten hesabın var mı? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text style={styles.loginLink}>Giriş Yap</Text>
              </TouchableOpacity>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  passwordInput: {
    paddingRight: 12,
  },
  eyeButton: {
    padding: 4,
  },
  registerButton: {
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
    overflow: 'hidden',
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    fontSize: 14,
    color: '#6B7280',
    marginHorizontal: 16,
    fontWeight: '500',
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  facebookIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1877F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  facebookIconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: 'bold',
  },
});