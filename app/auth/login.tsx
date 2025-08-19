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
import { Heart, Mail, Lock, Eye, EyeOff, Chrome } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { LoginRequest } from '@/services/api';
import { apiService } from '@/services/api';
import { socialAuthService } from '@/services/socialAuth';
import { useTheme } from '@/contexts/ThemeContext';

export default function LoginScreen() {
  const { theme, isDark } = useTheme();
  const [login, setLogin] = useState('test1');
  const [password, setPassword] = useState('Bp@@--12345');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const { updateUser } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!login || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setIsLoading(true);
    console.log('Login Screen: Giriş işlemi başlatılıyor...');
    try {
      const loginData: LoginRequest = {
        login,
        password,
      };
      console.log('Login Screen: AuthLogin çağrılıyor...');
      await authLogin(loginData);
      console.log('Login Screen: AuthLogin tamamlandı, yönlendirme yapılıyor...');
      router.replace('/(tabs)');
      console.log('Login Screen: Yönlendirme tamamlandı');
    } catch (error) {
      console.error('Login error:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      const errorMessage = error instanceof Error ? error.message : 'Giriş sırasında bir hata oluştu.';
      Alert.alert(
        'Giriş Hatası', 
        errorMessage,
        [
          { text: 'Tamam', style: 'default' },
          { text: 'Tekrar Dene', onPress: handleLogin, style: 'cancel' }
        ]
      );
    } finally {
      console.log('Login Screen: Loading false yapılıyor...');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      console.log('Google Login başlatılıyor...');
      const result = await socialAuthService.signInWithGoogle();
      console.log('Google OAuth başarılı, API\'ye gönderiliyor...');
      
      // Google token'ı API'ye gönder
      const response = await apiService.googleLogin(result.token);
      
      if (response.isSuccess && response.token) {
        // API service'e token'ı set et
        apiService.setAuthToken(response.token);
        
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
      console.log('Google Login tamamlandı');
    } catch (error) {
      console.error('Google login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Google giriş işlemi başarısız oldu.';
      Alert.alert('Google Giriş Hatası', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setIsLoading(true);
      console.log('Facebook Login başlatılıyor...');
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
      console.log('Facebook Login tamamlandı');
    } catch (error) {
      console.error('Facebook login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Facebook giriş işlemi başarısız oldu.';
      Alert.alert('Facebook Giriş Hatası', errorMessage);
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
            <Text style={styles.subtitle}>Sevimli dostlarla tanışın</Text>
          </View>

          <View style={styles.formContainer}>
          <View style={[styles.formContainer, { backgroundColor: isDark ? theme.colors.surface : 'rgba(255, 255, 255, 0.95)' }]}>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#6366F1" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="E-posta veya Kullanıcı Adı"
                placeholderTextColor="#9CA3AF"
                value={login}
                onChangeText={setLogin}
                keyboardType="email-address"
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

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => Alert.alert('Bilgi', 'Şifre sıfırlama özelliği yakında gelecek.')}
            >
              <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient
                colors={['#6366F1', '#8B5CF6']}
                style={styles.buttonGradient}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
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
                onPress={handleGoogleLogin}
                disabled={isLoading}
              >
                <Chrome size={20} color="#DB4437" />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleFacebookLogin}
                disabled={isLoading}
              >
                <View style={styles.facebookIcon}>
                  <Text style={styles.facebookIconText}>f</Text>
                </View>
                <Text style={styles.socialButtonText}>Facebook</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Hesabın yok mu? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text style={styles.registerLink}>Kayıt Ol</Text>
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
  },
  formContainer: {
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  registerLink: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: 'bold',
  },
});