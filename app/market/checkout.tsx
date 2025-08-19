import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, CreditCard, MapPin, User, Phone, Mail, Lock, CheckCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
  saveCard: boolean;
  sameAsProfile: boolean;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState<CheckoutForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    saveCard: false,
    sameAsProfile: true,
  });

  const steps = [
    { id: 1, title: 'Teslimat', icon: MapPin },
    { id: 2, title: 'Ödeme', icon: CreditCard },
    { id: 3, title: 'Onay', icon: CheckCircle },
  ];

  const orderSummary = {
    subtotal: 599.97,
    shipping: 0,
    tax: 107.99,
    total: 707.96,
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!form.firstName || !form.lastName || !form.address || !form.city) {
        Alert.alert('Hata', 'Lütfen tüm teslimat bilgilerini doldurun.');
        return;
      }
    } else if (currentStep === 2) {
      if (!form.cardNumber || !form.expiryDate || !form.cvv || !form.cardName) {
        Alert.alert('Hata', 'Lütfen tüm ödeme bilgilerini doldurun.');
        return;
      }
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handlePlaceOrder();
    }
  };

  const handlePlaceOrder = async () => {
    try {
      setProcessing(true);
      console.log('Processing order...');
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      Alert.alert(
        'Sipariş Tamamlandı! 🎉',
        'Siparişiniz başarıyla oluşturuldu. Kargo takip bilgileri e-posta adresinize gönderilecek.',
        [
          { text: 'Siparişlerimi Gör', onPress: () => router.push('/market/orders') },
          { text: 'Ana Sayfa', onPress: () => router.push('/(tabs)') },
        ]
      );
    } catch (error) {
      Alert.alert('Hata', 'Ödeme işlemi sırasında bir hata oluştu.');
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <View key={step.id} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            { backgroundColor: currentStep >= step.id ? theme.colors.primary : theme.colors.border }
          ]}>
            <step.icon 
              size={20} 
              color={currentStep >= step.id ? '#FFFFFF' : theme.colors.textSecondary} 
            />
          </View>
          <Text style={[
            styles.stepTitle,
            { color: currentStep >= step.id ? theme.colors.text : theme.colors.textSecondary }
          ]}>
            {step.title}
          </Text>
          {index < steps.length - 1 && (
            <View style={[
              styles.stepLine,
              { backgroundColor: currentStep > step.id ? theme.colors.primary : theme.colors.border }
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderDeliveryStep = () => (
    <View style={[styles.stepContent, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.stepContentTitle, { color: theme.colors.text }]}>Teslimat Bilgileri</Text>
      
      <View style={styles.switchContainer}>
        <Text style={[styles.switchLabel, { color: theme.colors.text }]}>Profil bilgilerimi kullan</Text>
        <Switch
          value={form.sameAsProfile}
          onValueChange={(value) => setForm({ ...form, sameAsProfile: value })}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={form.sameAsProfile ? '#FFFFFF' : '#F3F4F6'}
        />
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Ad *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={form.firstName}
            onChangeText={(text) => setForm({ ...form, firstName: text })}
            placeholder="Adınız"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Soyad *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={form.lastName}
            onChangeText={(text) => setForm({ ...form, lastName: text })}
            placeholder="Soyadınız"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>E-posta *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
          value={form.email}
          onChangeText={(text) => setForm({ ...form, email: text })}
          placeholder="E-posta adresiniz"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Telefon *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
          value={form.phone}
          onChangeText={(text) => setForm({ ...form, phone: text })}
          placeholder="+90 5XX XXX XX XX"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Adres *</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
          value={form.address}
          onChangeText={(text) => setForm({ ...form, address: text })}
          placeholder="Tam adresiniz"
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputContainer, { flex: 2, marginRight: 8 }]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Şehir *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={form.city}
            onChangeText={(text) => setForm({ ...form, city: text })}
            placeholder="Şehir"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Posta Kodu</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={form.postalCode}
            onChangeText={(text) => setForm({ ...form, postalCode: text })}
            placeholder="06000"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );

  const renderPaymentStep = () => (
    <View style={[styles.stepContent, { backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.stepContentTitle, { color: theme.colors.text }]}>Ödeme Bilgileri</Text>
      
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Kart Numarası *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
          value={form.cardNumber}
          onChangeText={(text) => setForm({ ...form, cardNumber: formatCardNumber(text) })}
          placeholder="1234 5678 9012 3456"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="numeric"
          maxLength={19}
        />
      </View>

      <View style={styles.inputRow}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Son Kullanma *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={form.expiryDate}
            onChangeText={(text) => setForm({ ...form, expiryDate: formatExpiryDate(text) })}
            placeholder="MM/YY"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>CVV *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
            value={form.cvv}
            onChangeText={(text) => setForm({ ...form, cvv: text.replace(/\D/g, '').substring(0, 3) })}
            placeholder="123"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
            maxLength={3}
            secureTextEntry
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.colors.text }]}>Kart Üzerindeki İsim *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text, borderColor: theme.colors.border }]}
          value={form.cardName}
          onChangeText={(text) => setForm({ ...form, cardName: text })}
          placeholder="Ad Soyad"
          placeholderTextColor={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text style={[styles.switchLabel, { color: theme.colors.text }]}>Kartı kaydet</Text>
        <Switch
          value={form.saveCard}
          onValueChange={(value) => setForm({ ...form, saveCard: value })}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={form.saveCard ? '#FFFFFF' : '#F3F4F6'}
        />
      </View>

      {/* Order Summary */}
      <View style={[styles.orderSummary, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Sipariş Özeti</Text>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Ara Toplam</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>₺{orderSummary.subtotal.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Kargo</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.success }]}>Ücretsiz</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>KDV</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>₺{orderSummary.tax.toFixed(2)}</Text>
        </View>
        
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={[styles.totalLabel, { color: theme.colors.text }]}>Toplam</Text>
          <Text style={[styles.totalValue, { color: theme.colors.primary }]}>₺{orderSummary.total.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  const renderConfirmationStep = () => (
    <View style={[styles.stepContent, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.confirmationHeader}>
        <CheckCircle size={64} color={theme.colors.success} />
        <Text style={[styles.confirmationTitle, { color: theme.colors.text }]}>Sipariş Özeti</Text>
        <Text style={[styles.confirmationSubtitle, { color: theme.colors.textSecondary }]}>
          Bilgilerinizi kontrol edin ve siparişi tamamlayın
        </Text>
      </View>

      <View style={[styles.confirmationSection, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.confirmationSectionTitle, { color: theme.colors.text }]}>Teslimat Adresi</Text>
        <Text style={[styles.confirmationText, { color: theme.colors.textSecondary }]}>
          {form.firstName} {form.lastName}
        </Text>
        <Text style={[styles.confirmationText, { color: theme.colors.textSecondary }]}>
          {form.address}
        </Text>
        <Text style={[styles.confirmationText, { color: theme.colors.textSecondary }]}>
          {form.city} {form.postalCode}
        </Text>
        <Text style={[styles.confirmationText, { color: theme.colors.textSecondary }]}>
          {form.phone}
        </Text>
      </View>

      <View style={[styles.confirmationSection, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.confirmationSectionTitle, { color: theme.colors.text }]}>Ödeme Yöntemi</Text>
        <Text style={[styles.confirmationText, { color: theme.colors.textSecondary }]}>
          **** **** **** {form.cardNumber.slice(-4)}
        </Text>
        <Text style={[styles.confirmationText, { color: theme.colors.textSecondary }]}>
          {form.cardName}
        </Text>
      </View>

      <View style={[styles.orderSummary, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Ödeme Özeti</Text>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Ara Toplam</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>₺{orderSummary.subtotal.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Kargo</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.success }]}>Ücretsiz</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>KDV</Text>
          <Text style={[styles.summaryValue, { color: theme.colors.text }]}>₺{orderSummary.tax.toFixed(2)}</Text>
        </View>
        
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={[styles.totalLabel, { color: theme.colors.text }]}>Toplam</Text>
          <Text style={[styles.totalValue, { color: theme.colors.primary }]}>₺{orderSummary.total.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderDeliveryStep();
      case 2:
        return renderPaymentStep();
      case 3:
        return renderConfirmationStep();
      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={theme.colors.gradient} style={styles.container}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: theme.colors.surface }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Ödeme</Text>
        <View style={styles.placeholder} />
      </View>

      {renderStepIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStepContent()}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomContainer, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.bottomActions}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: theme.colors.background }]}
              onPress={() => setCurrentStep(currentStep - 1)}
            >
              <Text style={[styles.backButtonText, { color: theme.colors.text }]}>Geri</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.nextButton, processing && styles.nextButtonDisabled]}
            onPress={handleNextStep}
            disabled={processing}
          >
            <LinearGradient
              colors={theme.colors.headerGradient}
              style={styles.nextGradient}
            >
              {processing ? (
                <Text style={styles.nextButtonText}>İşleniyor...</Text>
              ) : (
                <Text style={styles.nextButtonText}>
                  {currentStep === 3 ? 'Siparişi Tamamla' : 'Devam Et'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingBottom: 20,
  },
  headerButton: {
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
  placeholder: {
    width: 44,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  stepLine: {
    position: 'absolute',
    top: 24,
    left: '75%',
    right: '-75%',
    height: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stepContent: {
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
  stepContentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  orderSummary: {
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  confirmationHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  confirmationSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  confirmationSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  confirmationSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  confirmationText: {
    fontSize: 14,
    marginBottom: 4,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});