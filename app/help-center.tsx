import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Search, ChevronRight, MessageCircle, Mail, Phone } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function HelpCenterScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      title: 'Hesap ve Profil',
      questions: [
        'Hesabımı nasıl oluştururum?',
        'Profil fotoğrafımı nasıl değiştiririm?',
        'Şifremi unuttum, ne yapmalıyım?',
        'Hesabımı nasıl silerim?',
      ],
    },
    {
      title: 'Eşleşme ve Beğeniler',
      questions: [
        'Eşleşme nasıl çalışır?',
        'Beğenilerimi nasıl görebilirim?',
        'Yanlışlıkla geçtiğim birini nasıl bulabilirim?',
        'Eşleşme algoritması nasıl çalışır?',
      ],
    },
    {
      title: 'Mesajlaşma',
      questions: [
        'Mesaj gönderemiyorum, neden?',
        'Mesajlarım neden gitmiyor?',
        'Birini nasıl engellerim?',
        'Spam mesajları nasıl bildiririm?',
      ],
    },
    {
      title: 'Güvenlik ve Gizlilik',
      questions: [
        'Verilerim güvende mi?',
        'Profilimi kimler görebilir?',
        'Sahte hesapları nasıl bildiririm?',
        'Gizlilik ayarlarımı nasıl değiştiririm?',
      ],
    },
  ];

  const contactOptions = [
    {
      icon: MessageCircle,
      title: 'Canlı Destek',
      subtitle: 'Anında yardım alın',
      color: '#6366F1',
      onPress: () => Alert.alert('Bilgi', 'Canlı destek özelliği yakında gelecek.'),
    },
    {
      icon: Mail,
      title: 'E-posta Desteği',
      subtitle: 'support@petting.com',
      color: '#10B981',
      onPress: () => Alert.alert('Bilgi', 'E-posta desteği özelliği yakında gelecek.'),
    },
    {
      icon: Phone,
      title: 'Telefon Desteği',
      subtitle: '+90 (212) 123 45 67',
      color: '#F59E0B',
      onPress: () => Alert.alert('Bilgi', 'Telefon desteği özelliği yakında gelecek.'),
    },
  ];

  const handleQuestionPress = (question: string) => {
    Alert.alert('SSS', `"${question}" sorusunun cevabı yakında eklenecek.`);
  };

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(question =>
      question.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.questions.length > 0);

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
        <Text style={styles.headerTitle}>Yardım Merkezi</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Sorunuzu arayın..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Contact Options */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>İletişim</Text>
          <View style={styles.contactGrid}>
            {contactOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.contactCard}
                onPress={option.onPress}
              >
                <View style={[styles.contactIcon, { backgroundColor: `${option.color}20` }]}>
                  <option.icon size={24} color={option.color} />
                </View>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>Sık Sorulan Sorular</Text>
          {(searchQuery ? filteredCategories : faqCategories).map((category, categoryIndex) => (
            <View key={categoryIndex} style={styles.faqCategory}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <View style={styles.categoryContainer}>
                {category.questions.map((question, questionIndex) => (
                  <TouchableOpacity
                    key={questionIndex}
                    style={styles.questionItem}
                    onPress={() => handleQuestionPress(question)}
                  >
                    <Text style={styles.questionText}>{question}</Text>
                    <ChevronRight size={20} color="#6B7280" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
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
  placeholder: {
    width: 44,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  contactSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  contactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  contactSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  faqSection: {
    paddingHorizontal: 16,
  },
  faqCategory: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  categoryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    marginRight: 12,
  },
});