import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Index Screen: Auth durumu kontrol ediliyor...', { isAuthenticated, isLoading });
    if (!isLoading) {
      if (isAuthenticated) {
        console.log('Index Screen: Kullanıcı giriş yapmış, tabs\'a yönlendiriliyor...');
        router.replace('/(tabs)');
      } else {
        console.log('Index Screen: Kullanıcı giriş yapmamış, welcome\'a yönlendiriliyor...');
        router.replace('/welcome');
      }
    }
  }, [isAuthenticated, isLoading]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6366F1" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});