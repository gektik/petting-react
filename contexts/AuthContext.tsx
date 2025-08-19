import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Platform } from 'react-native';
import { apiService, AuthResponse, RegisterRequest, LoginRequest, SocialLoginRequest } from '@/services/api';

export interface User {
  id: string;
  username: string;
  email: string;
  profilePhoto?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Set up automatic logout on 401 responses FIRST
    apiService.setUnauthorizedCallback(() => {
      console.log('AuthContext: 401 hatası nedeniyle otomatik logout yapılıyor...');
      logout();
    });
    
    checkAuthStatus();
    
    return () => {
      isMountedRef.current = false;
      // Clean up callback
      apiService.setUnauthorizedCallback(null);
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (isMountedRef.current) {
        setIsLoading(true);
      }
      
      // Check if token exists
      let token = null;
      try {
        if (Platform.OS === 'web') {
          token = localStorage.getItem('auth_token');
        } else {
          const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
          token = await AsyncStorage.getItem('auth_token');
        }
        
        // Treat empty string as null
        if (token === '') {
          token = null;
        }
      } catch (storageError) {
        console.warn('Storage access error:', storageError);
      }
      
      // Set token in apiService
      apiService.setAuthToken(token);
      
      if (!token) {
        // Explicitly set user to null when no valid token
        if (isMountedRef.current) {
          setUser(null);
        }
        if (isMountedRef.current) {
          setIsLoading(false);
        }
        return;
      }

      // Check if user data exists in storage
      try {
        let userData = null;
        if (Platform.OS === 'web') {
          userData = localStorage.getItem('user_data');
        } else {
          const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
          userData = await AsyncStorage.getItem('user_data');
        }
        
        if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log('💾 AuthContext: Storage\'dan yüklenen kullanıcı verisi:', parsedUser);
          console.log('💾 AuthContext: Profil resmi URL\'si:', parsedUser.profilePhoto);
          if (isMountedRef.current) {
            setUser(parsedUser);
          }
        }
      } catch (storageError) {
        console.warn('User data storage error:', storageError);
      }

      // Verify token with server (optional)
      // Validate token by making an authenticated request
      try {
        await apiService.getUserPets();
        console.log('AuthContext: Token validation successful');
        console.log('AuthContext: Final user state after validation:', user);
      } catch (validationError: any) {
        console.log('AuthContext: Token validation failed, clearing auth state');
        // Token is invalid, clear everything
        apiService.setAuthToken(null);
        if (Platform.OS === 'web') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          localStorage.removeItem('token_expiration');
        } else {
          const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
          await AsyncStorage.multiRemove(['auth_token', 'user_data', 'token_expiration']);
        }
        if (isMountedRef.current) {
          setUser(null);
        }
        if (isMountedRef.current) {
          setIsLoading(false);
        }
        return;
      }
      
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Don't call logout on startup errors, just clear state
      if (isMountedRef.current) {
        setUser(null);
        setIsLoading(false);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const login = async (data: LoginRequest) => {
    try {
      if (isMountedRef.current) {
        setIsLoading(true);
      }
      console.log('AuthContext: Login başlatılıyor...');
      const response: AuthResponse = await apiService.login(data);
      console.log('AuthContext: API yanıtı alındı:', response);
      
      if (response.isSuccess) {
        console.log('AuthContext: Login başarılı, kullanıcı verisi oluşturuluyor...');
        let userData: User = {
          id: response.user?.id || response.userId || 'unknown',
          username: response.user?.username || response.username || 'Unknown User',
          email: response.user?.email || response.email || 'unknown@example.com',
          profilePhoto: response.user?.profilePictureURL || undefined,
        };
        
        console.log('AuthContext: Kullanıcı verisi:', userData);
        if (isMountedRef.current) {
          setUser(userData);
        }
        
        // Save token to storage and set in apiService
        if (Platform.OS === 'web') {
          localStorage.setItem('auth_token', response.token);
        } else {
          const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
          await AsyncStorage.setItem('auth_token', response.token);
        }
        apiService.setAuthToken(response.token);
        
        // Storage'a kaydet
        if (Platform.OS === 'web') {
          localStorage.setItem('user_data', JSON.stringify(userData));
        } else {
          const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
          await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        }
        
        // Token expiration kaydet
        if (response.tokenExpiration || response.tokenExpirationDate) {
          const expiration = response.tokenExpiration || response.tokenExpirationDate;
          if (Platform.OS === 'web') {
            localStorage.setItem('token_expiration', expiration);
          } else {
            const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
            await AsyncStorage.setItem('token_expiration', expiration);
          }
        }
        console.log('AuthContext: Kullanıcı verisi kaydedildi');
      } else {
        console.log('AuthContext: Login başarısız');
        throw new Error(response.errors?.[0] || 'Giriş başarısız');
      }
    } catch (error) {
      console.error('AuthContext: Login hatası:', error);
      throw error;
    } finally {
      console.log('AuthContext: Login işlemi tamamlandı, loading false yapılıyor');
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      if (isMountedRef.current) {
        setIsLoading(true);
      }
      const response: AuthResponse = await apiService.register(data);
      
      if (response.isSuccess) {
        let userData: User = {
          id: response.user?.id || response.userId || 'unknown',
          username: response.user?.username || response.username || data.username,
          email: response.user?.email || response.email || data.email,
          profilePhoto: response.user?.profilePictureURL || undefined,
        };
        
        if (isMountedRef.current) {
          setUser(userData);
        }
        
        // Save token to storage and set in apiService
        if (Platform.OS === 'web') {
          localStorage.setItem('auth_token', response.token);
        } else {
          const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
          await AsyncStorage.setItem('auth_token', response.token);
        }
        apiService.setAuthToken(response.token);
        
        if (Platform.OS === 'web') {
          localStorage.setItem('user_data', JSON.stringify(userData));
        } else {
          const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
          await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        }
        if (response.tokenExpiration || response.tokenExpirationDate) {
          const expiration = response.tokenExpiration || response.tokenExpirationDate;
          if (Platform.OS === 'web') {
            localStorage.setItem('token_expiration', expiration);
          } else {
            const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
            await AsyncStorage.setItem('token_expiration', expiration);
          }
        }
      } else {
        throw new Error(response.errors?.[0] || 'Kayıt başarısız');
      }
    } catch (error) {
      throw error;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };


  const logout = async () => {
    try {
      console.log('AuthContext: Logout başlatılıyor...');
      if (isMountedRef.current) {
        setIsLoading(true);
      }
      await apiService.logout();
      console.log('AuthContext: API logout tamamlandı');
      
      // Clear token from apiService
      apiService.setAuthToken(null);
      
      if (Platform.OS === 'web') {
        // Only remove auth token, keep user data for profile image persistence
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token_expiration');
        console.log('AuthContext: Web storage temizlendi');
      } else {
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        // Only remove auth token, keep user data for profile image persistence
        await AsyncStorage.multiRemove(['auth_token', 'token_expiration']);
        console.log('AuthContext: AsyncStorage temizlendi');
      }
      if (isMountedRef.current) {
        setUser(null);
        console.log('AuthContext: User state temizlendi');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Hata olsa bile user'ı temizle
      apiService.setAuthToken(null);
      if (isMountedRef.current) {
        setUser(null);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      console.log('AuthContext: Logout işlemi tamamlandı');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    console.log('🔄 AuthContext: updateUser çağrıldı:', userData);
    console.log('🔄 AuthContext: Mevcut user:', user);
    
    if (user && isMountedRef.current) {
      const updatedUser = { ...user, ...userData };
      console.log('🔄 AuthContext: Güncellenmiş user:', updatedUser);
      setUser(updatedUser);
      
      // Save to storage synchronously
      try {
        if (Platform.OS === 'web') {
          localStorage.setItem('user_data', JSON.stringify(updatedUser));
          console.log('💾 AuthContext: Web storage\'a kaydedildi');
        } else {
          // Use async function for AsyncStorage
          (async () => {
            try {
              const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
              await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
              console.log('💾 AuthContext: AsyncStorage\'a kaydedildi');
            } catch (error) {
              console.error('Error saving user data to AsyncStorage:', error);
            }
          })();
        }
      } catch (error) {
        console.error('Error saving user data:', error);
      }
    } else if (!user && isMountedRef.current) {
      // Eğer user yoksa yeni user oluştur
      const newUser = userData as User;
      setUser(newUser);
      console.log('🔄 AuthContext: Yeni user oluşturuldu:', newUser);
      
      // Save new user to storage
      try {
        if (Platform.OS === 'web') {
          localStorage.setItem('user_data', JSON.stringify(newUser));
          console.log('💾 AuthContext: Yeni user web storage\'a kaydedildi');
        } else {
          // Use async function for AsyncStorage
          (async () => {
            try {
              const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
              await AsyncStorage.setItem('user_data', JSON.stringify(newUser));
              console.log('💾 AuthContext: Yeni user AsyncStorage\'a kaydedildi');
            } catch (error) {
              console.error('Error saving new user data to AsyncStorage:', error);
            }
          })();
        }
      } catch (error) {
        console.error('Error saving new user data:', error);
      }
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}