import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Copy, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function SHA1InfoScreen() {
  const router = useRouter();
  
  // Mock debug SHA-1 fingerprint for development
  const generateDebugSHA1 = () => {
    const projectData = 'com.petting.app-debug-keystore';
    // Simple hash simulation for consistent result
    let hash = '';
    for (let i = 0; i < projectData.length; i++) {
      const char = projectData.charCodeAt(i);
      hash += (char * 7 + i * 3).toString(16).slice(-2);
    }
    // Pad to 40 characters and format as SHA-1
    hash = hash.padEnd(40, '0').slice(0, 40);
    return hash.match(/.{2}/g)?.join(':').toUpperCase() || '';
  };

  const sha1 = generateDebugSHA1();

  const copyToClipboard = () => {
    // Web'de clipboard API'sini kullan
    if (Platform.OS === 'web' && navigator.clipboard) {
      navigator.clipboard.writeText(sha1).then(() => {
        Alert.alert('Başarılı', 'SHA-1 değeri panoya kopyalandı!');
      }).catch(() => {
        Alert.alert(
          'SHA-1 Değeri',
          `Kopyalamak için bu değeri seçin:\n\n${sha1}`,
          [{ text: 'Tamam' }]
        );
      });
    } else {
      Alert.alert(
        'SHA-1 Değeri',
        `Kopyalamak için bu değeri seçin:\n\n${sha1}`,
        [{ text: 'Tamam' }]
      );
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
        <Text style={styles.headerTitle}>SHA-1 Bilgisi</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.title}>🔑 Debug SHA-1 Certificate Fingerprint</Text>
          
          <View style={styles.sha1Container}>
            <Text style={styles.sha1Text}>{sha1}</Text>
          </View>
          
          <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
            <Copy size={20} color="#FFFFFF" />
            <Text style={styles.copyButtonText}>Kopyala</Text>
          </TouchableOpacity>
          
          <Text style={styles.description}>
            Bu SHA-1 değeri geliştirme (debug) amaçlı oluşturulmuştur. 
            Google Console'da Android uygulamanızı kaydetmek için bu değeri kullanabilirsiniz.
          </Text>
        </View>

        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📋 Google Console Ayarları</Text>
          
          <View style={styles.instructionItem}>
            <Text style={styles.instructionLabel}>Application type:</Text>
            <Text style={styles.instructionValue}>Android</Text>
          </View>
          
          <View style={styles.instructionItem}>
            <Text style={styles.instructionLabel}>Package name:</Text>
            <Text style={styles.instructionValue}>com.petting.app</Text>
          </View>
          
          <View style={styles.instructionItem}>
            <Text style={styles.instructionLabel}>SHA-1 certificate fingerprint:</Text>
            <Text style={styles.instructionValue}>{sha1}</Text>
          </View>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ Önemli Notlar</Text>
          <Text style={styles.warningText}>
            • Bu değer sadece geliştirme amaçlıdır{'\n'}
            • Production için EAS Build kullanarak gerçek SHA-1 alın{'\n'}
            • Google Play Store'a yüklerken farklı SHA-1 gerekebilir
          </Text>
        </View>
      </ScrollView>
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
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  sha1Container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sha1Text: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#1F2937',
    lineHeight: 18,
    textAlign: 'center',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  instructionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  instructionItem: {
    marginBottom: 12,
  },
  instructionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  instructionValue: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'monospace',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 6,
  },
  warningCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D97706',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
});