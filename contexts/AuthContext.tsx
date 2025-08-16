import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    checkAuthStatus();
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (isMountedRef.current) {
        setIsLoading(true);
      }
      
      // Check if token exists
      const token = Platform.OS === 'web' 
        ? localStorage.getItem('auth_token')
        : await AsyncStorage.getItem('auth_token');
      if (!token) {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
        return;
      }

      // Check if user data exists in storage
      const userData = Platform.OS === 'web'
        ? localStorage.getItem('user_data')
        : await AsyncStorage.getItem('user_data');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (isMountedRef.current) {
          setUser(parsedUser);
        }
      }

      // Verify token with server (optional)
      // You can add a /auth/verify endpoint to check token validity
      
    } catch (error) {
      console.error('Error checking auth status:', error);
      await logout();
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
        const userData: User = {
          id: response.userId,
          username: response.username,
          email: response.email,
        };
        
        console.log('AuthContext: Kullanıcı verisi:', userData);
        if (isMountedRef.current) {
          setUser(userData);
        }
        if (Platform.OS === 'web') {
          localStorage.setItem('user_data', JSON.stringify(userData));
        } else {
          await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        }
        if (response.tokenExpiration || response.tokenExpirationDate) {
          const expiration = response.tokenExpiration || response.tokenExpirationDate;
          if (Platform.OS === 'web') {
            localStorage.setItem('token_expiration', expiration);
          } else {
            await AsyncStorage.setItem('token_expiration', expiration);
          }
        }
        console.log('AuthContext: Kullanıcı verisi kaydedildi');
      } else {
        console.log('AuthContext: Login başarısız');
        throw new Error('Login failed');
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
        const userData: User = {
          id: response.userId,
          username: response.username,
          email: response.email,
        };
        
        if (isMountedRef.current) {
          setUser(userData);
        }
        if (Platform.OS === 'web') {
          localStorage.setItem('user_data', JSON.stringify(userData));
        } else {
          await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        }
        if (response.tokenExpiration || response.tokenExpirationDate) {
          const expiration = response.tokenExpiration || response.tokenExpirationDate;
          if (Platform.OS === 'web') {
            localStorage.setItem('token_expiration', expiration);
          } else {
            await AsyncStorage.setItem('token_expiration', expiration);
          }
        }
      } else {
        throw new Error('Registration failed');
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
      if (Platform.OS === 'web') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('token_expiration');
        console.log('AuthContext: Web storage temizlendi');
      } else {
        await AsyncStorage.multiRemove(['auth_token', 'user_data', 'token_expiration']);
        console.log('AuthContext: AsyncStorage temizlendi');
      }
      if (isMountedRef.current) {
        setUser(null);
        console.log('AuthContext: User state temizlendi');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Hata olsa bile user'ı temizle
      if (isMountedRef.current) {
        setUser(null);
      }
      if (Platform.OS === 'web') {
        localStorage.clear();
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      console.log('AuthContext: Logout işlemi tamamlandı');
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user && isMountedRef.current) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      if (Platform.OS === 'web') {
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
      } else {
        AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
      }
    } else if (!user && isMountedRef.current) {
      // Eğer user yoksa yeni user oluştur
      const newUser = userData as User;
      setUser(newUser);
      if (Platform.OS === 'web') {
        localStorage.setItem('user_data', JSON.stringify(newUser));
      } else {
        AsyncStorage.setItem('user_data', JSON.stringify(newUser));
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