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
import { Heart, Mail, ArrowLeft, Send } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function ForgotPasswordScreen() {
  const { theme, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const handleSendResetEmail = async () => {
    if (!email) {
      Alert.alert('Hata', 'Lütfen e-posta adresinizi girin.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi girin.');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setEmailSent(true);
      Alert.alert(
        'E-posta Gönderildi',
        'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.',
        [
          { text: 'Tamam', onPress: () => router.back() }
        ]
      );
    } catch (error) {
      Alert.alert('Hata', 'E-posta gönderilirken bir hata oluştu.');
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Heart size={48} color="#FFFFFF" fill="#FFFFFF" />
            </View>
            <Text style={styles.title}>Şifremi Unuttum</Text>
            <Text style={styles.subtitle}>
              E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
            </Text>

            <View style={[styles.formContainer, { backgroundColor: isDark ? theme.colors.surface : 'rgba(255, 255, 255, 0.95)' }]}>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#6366F1" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="E-posta adresiniz"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!emailSent}
                />
              </View>

              <TouchableOpacity
                style={[styles.sendButton, (isLoading || emailSent) && styles.sendButtonDisabled]}
                onPress={handleSendResetEmail}
                disabled={isLoading || emailSent}
              >
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  style={styles.buttonGradient}
                >
                  {isLoading ? (
                    <Text style={styles.sendButtonText}>Gönderiliyor...</Text>
                  ) : emailSent ? (
                    <Text style={styles.sendButtonText}>E-posta Gönderildi ✓</Text>
                  ) : (
                    <>
                      <Send size={20} color="#FFFFFF" />
                      <Text style={styles.sendButtonText}>Sıfırlama Bağlantısı Gönder</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.backToLoginContainer}>
                <Text style={[styles.backToLoginText, { color: theme.colors.textSecondary }]}>Şifrenizi hatırladınız mı? </Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.backToLoginLink}>Giriş Yap</Text>
                </TouchableOpacity>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    marginBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
    lineHeight: 24,
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
    marginBottom: 24,
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
  sendButton: {
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: 14,
  },
  backToLoginLink: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: 'bold',
  },
});