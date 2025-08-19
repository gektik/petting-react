import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import { mockPets, mockMatches, mockChats, mockAdoptionListings } from './mockData';
import { Pet, Match, Chat, AdoptionListing } from '../types';

const BASE_URL = 'https://pet.kervanbey.com/api';
const USE_MOCK_DATA = false; // Gerçek API kullan

export interface AuthResponse {
  isSuccess: boolean;
  token: string;
  refreshToken?: string;
  tokenExpirationDate?: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profilePictureURL?: string;
  };
  userId?: string;
  username?: string;
  email?: string;
  tokenExpiration?: string;
  errors?: string[] | null;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  login: string; // username or email
  password: string;
}

export interface SocialLoginRequest {
  token: string;
  provider: 'Google' | 'Facebook';
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;
  private isOnline: boolean = true;
  private onUnauthorized: (() => void) | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8',
      },
    });

    this.setupInterceptors();
    this.setupNetworkListener();
  }

  // Resim URL'ini düzelt - /wwwroot/ ekle
  private fixImageUrl(url: string): string {
    if (!url) return url;
    
    // Eğer URL zaten wwwroot içeriyorsa /wwwroot/ kısmını kaldır
    if (url.includes('/wwwroot/uploads/')) {
      return url.replace('/wwwroot/uploads/', '/uploads/');
    }
    
    // URL'yi olduğu gibi döndür - API'den gelen format doğru
    
    return url;
  }

  // Method to set unauthorized callback
  setUnauthorizedCallback(callback: (() => void) | null) {
    this.onUnauthorized = callback;
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          console.log('API: 401 hatası alındı, otomatik logout tetikleniyor...');
          if (this.onUnauthorized) {
            this.onUnauthorized();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private setupNetworkListener() {
    if (Platform.OS !== 'web') {
      import('@react-native-community/netinfo').then(({ default: NetInfo }) => {
        NetInfo.addEventListener(state => {
          this.isOnline = state.isConnected ?? false;
        });
      });
    }
  }

  // Public method to set auth token from AuthContext
  setAuthToken(token: string | null) {
    this.token = token;
  }

  // Authentication methods
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      console.log('Register attempt:', { username: data.username, email: data.email });
      console.log('API Base URL:', BASE_URL);
      console.log('Full register URL:', `${BASE_URL}/auth/register`);
      console.log('Request payload:', JSON.stringify(data));
      console.log('Register attempt:', { username: data.username, email: data.email });
      const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', data);
      console.log('API Response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Register error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        isNetworkError: !error.response,
        isTimeout: error.code === 'ECONNABORTED',
        errorCode: error.code
      });
      
      if (error.response) {
        // Sunucudan yanıt geldi, gerçek hata mesajını göster
        const status = error.response.status;
        const serverMessage = error.response.data?.message || error.response.data?.errors?.[0];
        
        if (status === 409) {
          throw new Error('Bu e-posta veya kullanıcı adı zaten kullanılıyor.');
        } else if (status === 400) {
          throw new Error(serverMessage || 'Geçersiz bilgiler. Lütfen kontrol edin.');
        } else {
          // Sunucudan gelen gerçek hata mesajını göster
          throw new Error(serverMessage || `Sunucu hatası (${status})`);
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('İstek zaman aşımına uğradı. İnternet bağlantınızı kontrol edin.');
      } else if (error.request) {
        // Sunucuya hiç ulaşılamadı
        throw new Error('Sunucu geçici olarak kullanılamıyor. Lütfen birkaç dakika sonra tekrar deneyin.');
      } else {
        throw new Error('Beklenmeyen bir hata oluştu.');
      }
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      console.log('Login attempt:', { login: data.login });
      console.log('API Base URL:', BASE_URL);
      console.log('Full login URL:', `${BASE_URL}/auth/login`);
      console.log('Request payload:', JSON.stringify(data));
      const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', data);
      console.log('API Response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Login error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        isNetworkError: !error.response,
        isTimeout: error.code === 'ECONNABORTED',
        errorCode: error.code
      });
      
      if (error.response) {
        // Sunucudan yanıt geldi, gerçek hata mesajını göster
        const status = error.response.status;
        const serverMessage = error.response.data?.message || error.response.data?.errors?.[0];
        
        if (status === 401) {
          throw new Error(serverMessage || 'Kullanıcı adı veya şifre hatalı.');
        } else {
          // Sunucudan gelen gerçek hata mesajını göster
          throw new Error(serverMessage || `Sunucu hatası (${status})`);
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('İstek zaman aşımına uğradı. İnternet bağlantınızı kontrol edin.');
      } else if (error.request) {
        // Sunucuya hiç ulaşılamadı
        throw new Error('Sunucu geçici olarak kullanılamıyor. Lütfen birkaç dakika sonra tekrar deneyin.');
      } else {
        throw new Error('Beklenmeyen bir hata oluştu.');
      }
    }
  }

  async googleLogin(token: string): Promise<AuthResponse> {
    try {
      console.log('Google login attempt with token:', token.substring(0, 20) + '...');
      const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/google-mobile', {
        token,
        provider: 'Google'
      });
      console.log('Google API Response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Google login error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        isNetworkError: !error.response,
        isTimeout: error.code === 'ECONNABORTED',
        errorCode: error.code
      });
      
      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message || error.response.data?.errors?.[0];
        
        if (status === 401) {
          throw new Error(serverMessage || 'Google token geçersiz.');
        } else {
          throw new Error(serverMessage || `Sunucu hatası (${status})`);
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('İstek zaman aşımına uğradı. İnternet bağlantınızı kontrol edin.');
      } else if (error.request) {
        throw new Error('Sunucu geçici olarak kullanılamıyor. Lütfen birkaç dakika sonra tekrar deneyin.');
      } else {
        throw new Error('Beklenmeyen bir hata oluştu.');
      }
    }
  }

  async facebookLogin(token: string): Promise<AuthResponse> {
    try {
      console.log('Facebook login attempt with token:', token.substring(0, 20) + '...');
      const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/facebook-mobile', {
        token,
        provider: 'Facebook'
      });
      console.log('Facebook API Response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Facebook login error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        isNetworkError: !error.response,
        isTimeout: error.code === 'ECONNABORTED',
        errorCode: error.code
      });
      
      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message || error.response.data?.errors?.[0];
        
        if (status === 401) {
          throw new Error(serverMessage || 'Facebook token geçersiz.');
        } else {
          throw new Error(serverMessage || `Sunucu hatası (${status})`);
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('İstek zaman aşımına uğradı. İnternet bağlantınızı kontrol edin.');
      } else if (error.request) {
        throw new Error('Sunucu geçici olarak kullanılamıyor. Lütfen birkaç dakika sonra tekrar deneyin.');
      } else {
        throw new Error('Beklenmeyen bir hata oluştu.');
      }
    }
  }

  async logout(): Promise<void> {
    this.token = null;
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  isNetworkAvailable(): boolean {
    return this.isOnline;
  }

  getToken(): string | null {
    return this.token;
  }

  // Get current user profile method
  async getCurrentUser(): Promise<any> {
    try {
      console.log('🔍 API: getCurrentUser çağrılıyor...');
      const response = await this.api.get('/users/me');
      console.log('🔍 API: getCurrentUser yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🔍 API: getCurrentUser hatası:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }

  // Pet methods
  async getUserPets(): Promise<Pet[]> {
    try {
      console.log('API: getUserPets çağrılıyor...');
      console.log('API: Token mevcut:', !!this.token);
      console.log('API: Request URL:', `${BASE_URL}/pets/my-pets`);
      const response = await this.api.get('/pets/my-pets');
      console.log('API: getUserPets yanıtı:', response.data);
      
      // API'den gelen veriyi Pet tipine dönüştür
      const pets = response.data || [];
      return pets
        .filter((apiPet: any) => apiPet && (apiPet.petID || apiPet.id)) // Filter out null/undefined pets or pets without ID
        .map((apiPet: any) => ({
          id: (apiPet.petID || apiPet.id || '').toString(),
          name: apiPet.name || '',
          species: apiPet.petTypeID === 1 ? 'cat' : 'dog',
          breed: apiPet.breedName || apiPet.breed || '',
          age: apiPet.age || 0,
          gender: apiPet.gender === 0 ? 'female' : 'male',
          neutered: apiPet.isNeutered || false,
          photos: apiPet.photos || (apiPet.profilePictureURL ? [this.fixImageUrl(apiPet.profilePictureURL)] : ['https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=400']),
          description: apiPet.description || '',
          color: apiPet.color || '',
          ownerId: (apiPet.userID || apiPet.ownerId || '').toString(),
          isActive: apiPet.isActiveForMatching !== false,
          location: apiPet.location || 'Türkiye',
          createdAt: apiPet.createdDate || apiPet.createdAt || new Date().toISOString(),
          birthDate: apiPet.birthDate || undefined,
        }));
    } catch (error: any) {
      console.error('API: getUserPets hatası:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        headers: error.config?.headers,
        isNetworkError: !error.response,
        fullError: error
      });
      throw error;
    }
  }

  // Pet delete method
  async deletePet(petId: string): Promise<any> {
    try {
      console.log('API: deletePet çağrılıyor...', { petId });
      const response = await this.api.delete(`/pets/${petId}`);
      console.log('API: deletePet yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: deletePet hatası:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }
  // Generic API methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get(endpoint);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Request failed');
    }
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      // Ensure UTF-8 encoding for Turkish characters
      const encodedData = JSON.stringify(data);
      console.log('API POST Data (UTF-8):', encodedData);
      
      const response = await this.api.post(endpoint, data);
      return response.data;
    } catch (error: any) {
      console.error('API POST Error:', {
        endpoint,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        isNetworkError: !error.response
      });
      
      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message || error.response.data?.errors?.[0];
        throw new Error(serverMessage || `Server error (${status}): ${error.response.statusText}`);
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please check your internet connection.');
      } else if (error.request) {
        throw new Error('Network error. Server is temporarily unavailable.');
      } else {
        throw new Error(`Request failed: ${error.message}`);
      }
    }
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      // Ensure UTF-8 encoding for Turkish characters
      const encodedData = JSON.stringify(data);
      console.log('API PUT Data (UTF-8):', encodedData);
      
      const response = await this.api.put(endpoint, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Request failed');
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete(endpoint);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Request failed');
    }
  }

  // Image upload method
  async uploadImage(imageUri: string, petId?: string): Promise<{ imageUrl: string }> {
    try {
      console.log('API: uploadImage çağrılıyor...', { imageUri: imageUri.substring(0, 50) + '...', petId });
      
      // Create FormData for multipart/form-data upload
      const formData = new FormData();
      
      // Add the image file
      const filename = `pet_${Date.now()}.jpg`;
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: filename,
      } as any);
      
      // Add petId if provided
      if (petId) {
        formData.append('petId', petId);
      }
      
      console.log('API: FormData hazırlandı:', { filename, petId });
      
      const response = await this.api.post(`/pets/${petId}/upload-image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds for image upload
      });
      
      console.log('API: uploadImage yanıtı:', response.data);
     console.log('API: Upload response format check:', {
       hasImageUrl: !!response.data.imageUrl,
       hasUrl: !!response.data.url,
       hasProfilePictureURL: !!response.data.profilePictureURL,
       rawResponse: response.data
     });
      // Don't log 401 errors if they're being handled by auth context
      if (error.response?.status !== 401 || !this.onUnauthorized) {
        console.error('API: getUserPets hatası:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          headers: error.config?.headers,
          isNetworkError: !error.response,
          fullError: error
        });
      }
      
     // API'den dönen response formatını kontrol et ve normalize et
     const result = response.data;
     let finalImageUrl = '';
     
     // Öncelik sırası: imageUrl > url > profilePictureURL
     if (result.imageUrl) {
       finalImageUrl = this.fixImageUrl(result.imageUrl);
       console.log('API: imageUrl kullanılıyor:', finalImageUrl);
     } else if (result.url) {
       finalImageUrl = this.fixImageUrl(result.url);
       console.log('API: url kullanılıyor:', finalImageUrl);
     } else if (result.profilePictureURL) {
       finalImageUrl = this.fixImageUrl(result.profilePictureURL);
       console.log('API: profilePictureURL kullanılıyor:', finalImageUrl);
     } else {
       console.error('API: Hiçbir URL field\'ı bulunamadı!', result);
       throw new Error('Upload başarılı ama resim URL\'si döndürülmedi');
     }
     
     // Standardize edilmiş format döndür
     return {
       imageUrl: finalImageUrl,
       // Backward compatibility için diğer field'ları da ekle
       url: finalImageUrl,
       profilePictureURL: finalImageUrl,
       ...result
     };
    } catch (error: any) {
      console.error('API: uploadImage hatası:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }

  // Profile image upload method
  async uploadProfileImage(imageUri: string): Promise<{ imageUrl: string }> {
    try {
      console.log('🔄 API: uploadProfileImage çağrılıyor...', { imageUri: imageUri.substring(0, 50) + '...' });
      
      // Create FormData for multipart/form-data upload
      const formData = new FormData();
      
      // Add the image file
      const filename = `profile_${Date.now()}.jpg`;
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: filename,
      } as any);
      
      console.log('🔄 API: Profile FormData hazırlandı:', { filename });
      
      const response = await this.api.post('/users/me/upload-profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds for image upload
      });
      
      console.log('🔄 API: uploadProfileImage yanıtı:', response.data);
      console.log('🔄 API: Profile upload response format check:', {
        hasImageUrl: !!response.data.imageUrl,
        hasUrl: !!response.data.url,
        hasProfilePictureURL: !!response.data.profilePictureURL,
        rawResponse: response.data
      });
      
      // API'den dönen response formatını kontrol et ve normalize et
      const result = response.data;
      let finalImageUrl = '';
      
      // Öncelik sırası: imageUrl > url > profilePictureURL
      if (result.imageUrl) {
        finalImageUrl = this.fixImageUrl(result.imageUrl);
        console.log('🔄 API: imageUrl kullanılıyor:', finalImageUrl);
      } else if (result.url) {
        finalImageUrl = this.fixImageUrl(result.url);
        console.log('🔄 API: url kullanılıyor:', finalImageUrl);
      } else if (result.profilePictureURL) {
        finalImageUrl = this.fixImageUrl(result.profilePictureURL);
        console.log('🔄 API: profilePictureURL kullanılıyor:', finalImageUrl);
      } else {
        console.error('🔄 API: Hiçbir URL field\'ı bulunamadı!', result);
        throw new Error('Upload başarılı ama resim URL\'si döndürülmedi');
      }
      
      // Standardize edilmiş format döndür
      return {
        imageUrl: finalImageUrl,
        // Backward compatibility için diğer field'ları da ekle
        url: finalImageUrl,
        profilePictureURL: finalImageUrl,
        ...result
      };
    } catch (error: any) {
      console.error('🔄 API: uploadProfileImage hatası:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }

  // User profile update method
  async updateUserProfile(profileData: any): Promise<any> {
    try {
      console.log('👤 API: updateUserProfile çağrılıyor...', profileData);
      const response = await this.api.put('/api/users/me', profileData);
      console.log('👤 API: updateUserProfile yanıtı:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('👤 API: updateUserProfile hatası:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }

  // Pet update method
  async updatePet(petId: string, petData: any): Promise<any> {
    try {
      console.log('API: updatePet çağrılıyor...', { petId, petData });
      console.log('API: Renk değeri gönderiliyor:', petData.color);
      const response = await this.api.put(`/pets/${petId}`, petData);
      console.log('API: updatePet yanıtı:', response.data);
      console.log('API: Dönen renk değeri:', response.data.color);
      return response.data;
    } catch (error: any) {
      console.error('API: updatePet hatası:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }

  // Pet create method
  async createPet(petData: any): Promise<any> {
    try {
      console.log('API: createPet çağrılıyor...', { petData });
      const response = await this.api.post('/pets', petData);
      console.log('API: createPet yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: createPet hatası:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }
};

// Create instance of ApiService
export const apiService = new ApiService();

// Mock API methods for features not yet implemented
const mockApiMethods = {
  async getPetsForMatching(): Promise<Pet[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockPets;
  },

  async getMatches(): Promise<Match[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockMatches;
  },

  async getChats(): Promise<Chat[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockChats;
  },

  async getAdoptionListings(): Promise<AdoptionListing[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockAdoptionListings;
  },

  async likePet(petId: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`Mock: Liked pet ${petId}`);
    // Simulate random match
    const matched = Math.random() > 0.7;
    return { success: true, matched };
  }
};

// Add mock methods to apiService for backward compatibility
apiService.getPetsForMatching = mockApiMethods.getPetsForMatching;
apiService.getMatches = mockApiMethods.getMatches;
apiService.getChats = mockApiMethods.getChats;
apiService.getAdoptionListings = mockApiMethods.getAdoptionListings;
apiService.likePet = mockApiMethods.likePet;