import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { X, PawPrint, Tag, Calendar, MapPin, Heart, Users } from 'lucide-react-native';
import { Pet } from '@/types';

const { width: screenWidth } = Dimensions.get('window');

interface PetDetailModalProps {
  pet: Pet | null;
  visible: boolean;
  onClose: () => void;
  theme: any;
}

export const PetDetailModal: React.FC<PetDetailModalProps> = ({ pet, visible, onClose, theme }) => {
  if (!pet) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
          <ScrollView>
            <Image 
              source={{ uri: pet.photos[0] || '' }} 
              style={styles.modalImage}
            />
            <Text style={[styles.modalPetName, { color: theme.colors.text }]}>{pet.name}</Text>
            <Text style={[styles.modalPetBreed, { color: theme.colors.textSecondary }]}>{pet.breed}</Text>
            
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>Detaylar</Text>
              <View style={styles.detailRow}>
                <PawPrint size={18} color={theme.colors.primary} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>Tür: {pet.species === 'cat' ? 'Kedi' : 'Köpek'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Tag size={18} color={theme.colors.primary} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>Cins: {pet.breed}</Text>
              </View>
              <View style={styles.detailRow}>
                <Calendar size={18} color={theme.colors.primary} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>Yaş: {pet.age} yaşında</Text>
              </View>
              <View style={styles.detailRow}>
                <Users size={18} color={theme.colors.primary} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>Cinsiyet: {pet.gender === 'male' ? 'Erkek' : 'Dişi'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Heart size={18} color={theme.colors.primary} />
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>Kısırlaştırılmış: {pet.neutered ? 'Evet' : 'Hayır'}</Text>
              </View>
              {pet.color && (
                <View style={styles.detailRow}>
                  <Tag size={18} color={theme.colors.primary} />
                  <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>Renk: {pet.color}</Text>
                </View>
              )}
              {pet.location && (
                <View style={styles.detailRow}>
                  <MapPin size={18} color={theme.colors.primary} />
                  <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>Konum: {pet.location}</Text>
                </View>
              )}
            </View>

            {pet.description && (
              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>Açıklama</Text>
                <Text style={[styles.descriptionText, { color: theme.colors.textSecondary }]}>{pet.description}</Text>
              </View>
            )}
          </ScrollView>
          
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '75%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
  },
  modalImage: {
    width: '100%',
    height: 250,
    borderRadius: 16,
    marginBottom: 16,
  },
  modalPetName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalPetBreed: {
    fontSize: 18,
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    marginLeft: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
