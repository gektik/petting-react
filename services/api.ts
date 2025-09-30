import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import { mockPets, mockMatches, mockChats, mockAdoptionListings } from './mockData';
import { Pet, Match, Chat, AdoptionListing } from '../types';

const BASE_URL = 'https://pet.kervanbey.com/api';
const DEFAULT_CAT_IMAGE = 'https://pet.kervanbey.com/wwwroot/uploads/pets/default-cat.png';
const DEFAULT_DOG_IMAGE = 'https://pet.kervanbey.com/wwwroot/uploads/pets/default-dog.png';
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

  // Mock methods
  async getChats(): Promise<Chat[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockChats;
  }

  async getAdoptionListings(): Promise<AdoptionListing[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockAdoptionListings;
  }

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 30000, // 30 saniye timeout
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
    this.setupNetworkListener();
  }

  // Resim URL'ini düzelt - /wwwroot/ ekle
  private fixImageUrl(url: string): string {
    if (!url) return '';
    
    // Eğer URL zaten wwwroot içeriyorsa olduğu gibi döndür
    if (url.includes('/wwwroot/')) {
      return url;
    }
    
    // Eğer URL /uploads/ ile başlıyorsa /wwwroot/ ekle
    if (url.includes('/uploads/')) {
      return url.replace('/uploads/', '/wwwroot/uploads/');
    }
    
    // Diğer durumlarda olduğu gibi döndür
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

  // Public method to get auth token
  getToken(): string | null {
    return this.token;
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
          photos: (apiPet.photos && apiPet.photos.length > 0) 
            ? apiPet.photos.map((photo: string) => this.fixImageUrl(photo))
            : (apiPet.profilePictureURL ? [this.fixImageUrl(apiPet.profilePictureURL)] : []),
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
      
      // Daha anlaşılır hata mesajları
      if (error.response?.status === 401) {
        throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
      } else if (error.response?.status === 403) {
        throw new Error('Bu işlem için yetkiniz yok.');
      } else if (error.response?.status === 404) {
        throw new Error('API endpoint bulunamadı.');
      } else if (error.response?.status >= 500) {
        throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
      } else if (!error.response) {
        throw new Error('İnternet bağlantınızı kontrol edin.');
      } else {
        throw new Error(error.message || 'Beklenmeyen bir hata oluştu.');
      }
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

  // Get pets for matching (swipe cards)
  async getPetsForMatching(petId: string, options?: { 
    location?: { latitude: number; longitude: number }; 
    radiusInKm?: number | null;
    neutered?: boolean;
    color?: string;
    breed?: number;
  }): Promise<Pet[]> {
    try {
      console.log(`API: getPetsForMatching (candidates) çağrılıyor... Pet ID: ${petId}`);
      console.log('🔍 Token kontrolü:', !!this.token);
      console.log('🔍 Token değeri:', this.token ? this.token.substring(0, 20) + '...' : 'null');
      console.log('🔍 Filtreler API\'ye gönderiliyor:', options);

      const params: any = {
        useCurrentLocation: options?.location ? false : true,
        radiusInKm: options?.radiusInKm ?? 50, // Varsayılan veya filtreden gelen değer
        latitude: options?.location?.latitude,
        longitude: options?.location?.longitude,
      };

      // Filtreleri ekle
      if (options?.neutered !== undefined) {
        params.neutered = options.neutered;
      }
      if (options?.color) {
        params.color = options.color;
      }
      if (options?.breed) {
        params.breed = options.breed;
      }

      console.log('🔍 API parametreleri:', params);

      const response = await this.api.get(`/matching/candidates/${petId}`, { params });
      
      console.log('API: getPetsForMatching yanıtı:', response.data);
      
      const pets = response.data || [];
      console.log(`🔍 API'den ${pets.length} hayvan geldi (backend zaten aktif olanları filtreliyor)`);
      return pets.map((apiPet: any) => this.transformPetData(apiPet));
    } catch (error: any) {
      console.error('API: getPetsForMatching hatası:', {
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
      
      // Yeni pet için genel upload endpoint'i kullan
      const endpoint = petId ? `/pets/${petId}/upload-image` : '/users/me/upload-profile-image';
      const response = await this.api.post(endpoint, formData, {
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

  // Delete pet photo
  async deletePetPhoto(petId: string): Promise<any> {
    try {
      console.log('🖼️ API: deletePetPhoto çağrılıyor...', { petId });
      // Fotoğrafı silmek için updatePet metodunu kullanarak profilePictureURL'yi null yap
      const response = await this.updatePet(petId, { profilePictureURL: null });
      console.log('🖼️ API: deletePetPhoto yanıtı:', response);
      return response;
    } catch (error: any) {
      console.error('🖼️ API: deletePetPhoto hatası:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }

  // Delete profile photo
  async deleteProfilePhoto(): Promise<any> {
    try {
      console.log('🖼️ API: deleteProfilePhoto çağrılıyor...');
      // Profil fotoğrafını silmek için updateUserProfile metodunu kullanarak profilePictureURL'yi null yap
      const response = await this.updateUserProfile({ profilePictureURL: null });
      console.log('🖼️ API: deleteProfilePhoto yanıtı:', response);
      return response;
    } catch (error: any) {
      console.error('🖼️ API: deleteProfilePhoto hatası:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }

  // Get user statistics
  async getUserStats(): Promise<any> {
    try {
      console.log('📊 API: getUserStats çağrılıyor...');
      const response = await this.api.get('/users/me/stats');
      console.log('📊 API: getUserStats yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('📊 API: getUserStats hatası:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  }

  // Get user likes count
  async getUserLikesCount(): Promise<number> {
    try {
      console.log('❤️ API: getUserLikesCount çağrılıyor...');
      const response = await this.api.get('/users/me/likes/count');
      console.log('❤️ API: getUserLikesCount yanıtı:', response.data);
      return response.data.count || response.data || 0;
    } catch (error: any) {
      console.error('❤️ API: getUserLikesCount hatası:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return 0; // Hata durumunda 0 döndür
    }
  }

  // Get user matches count
  async getUserMatchesCount(): Promise<number> {
    try {
      console.log('💕 API: getUserMatchesCount çağrılıyor...');
      const response = await this.api.get('/users/me/matches/count');
      console.log('💕 API: getUserMatchesCount yanıtı:', response.data);
      return response.data.count || response.data || 0;
    } catch (error: any) {
      console.error('💕 API: getUserMatchesCount hatası:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      return 0; // Hata durumunda 0 döndür
    }
  }

  // Get current user details
  async getCurrentUser(): Promise<any> {
    try {
      console.log('👤 API: getCurrentUser çağrılıyor...');
      const response = await this.api.get('/users/me');
      console.log('👤 API: getCurrentUser yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('👤 API: getCurrentUser hatası:', {
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
      const response = await this.api.put('/users/me', profileData);
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

  // Matching methods
  async getMatches(petId: string): Promise<Match[]> {
    try {
      console.log(`API: getMatches çağrılıyor... Pet ID: ${petId}`);
      // petId'yi sorgu parametresi olarak gönder
      const response = await this.api.get('/matching/matches', { params: { petId } });
      console.log('API: getMatches yanıtı:', response.data);
      
      // API'den gelen veriyi dönüştür
      const matches = response.data || [];
      return matches.map((match: any) => {
        // API'den gelen veri otherPet içeriyor
        const otherPet = match.otherPet;
        
        return {
          id: match.matchID?.toString() || '',
          petId: petId,
          matchedPetId: otherPet?.petID?.toString() || '',
          status: 'matched', // API'den gelen eşleşmeler zaten matched
          createdAt: match.matchDate || new Date().toISOString(),
          chatId: match.chatId,
          otherPet: otherPet ? {
            id: otherPet.petID?.toString() || '',
            name: otherPet.name || '',
            species: otherPet.petTypeID === 1 ? 'cat' : 'dog',
            breed: otherPet.breedName || '',
            age: otherPet.age || 0,
            gender: otherPet.gender === 0 ? 'female' : 'male',
            neutered: otherPet.isNeutered || false,
            photos: [otherPet.profilePictureURL || ''],
            description: otherPet.description || '',
            color: otherPet.color || '',
            ownerId: otherPet.userID?.toString() || '',
            isActive: otherPet.isActiveForMatching !== false,
            location: otherPet.location || 'Türkiye',
            createdAt: otherPet.createdDate || new Date().toISOString(),
            birthDate: otherPet.birthDate
          } : undefined,
          matchedPet: otherPet ? {
            id: otherPet.petID?.toString() || '',
            name: otherPet.name || '',
            species: otherPet.petTypeID === 1 ? 'cat' : 'dog',
            breed: otherPet.breedName || '',
            age: otherPet.age || 0,
            gender: otherPet.gender === 0 ? 'female' : 'male',
            neutered: otherPet.isNeutered || false,
            photos: [otherPet.profilePictureURL || ''],
            description: otherPet.description || '',
            color: otherPet.color || '',
            ownerId: otherPet.userID?.toString() || '',
            isActive: otherPet.isActiveForMatching !== false,
            location: otherPet.location || 'Türkiye',
            createdAt: otherPet.createdDate || new Date().toISOString(),
            birthDate: otherPet.birthDate
          } : undefined
        };
      });
    } catch (error: any) {
      console.error('API: getMatches hatası:', error);
      return [];
    }
  }

  async getLikedPets(petId: string): Promise<Pet[]> {
    try {
      console.log(`API: getLikedPets çağrılıyor... Pet ID: ${petId}`);
      const response = await this.api.get('/matching/liked-pets', { params: { petId } });
      console.log('API: getLikedPets yanıtı:', response.data);
      const pets = response.data || [];
      return pets.map((apiPet: any) => this.transformPetData(apiPet));
    } catch (error: any) {
      console.error('API: getLikedPets hatası:', error);
      return [];
    }
  }

  async getPassedPets(petId: string): Promise<Pet[]> {
    try {
      console.log(`API: getPassedPets çağrılıyor... Pet ID: ${petId}`);
      const response = await this.api.get('/matching/passed-pets', { params: { petId } });
      console.log('API: getPassedPets yanıtı:', response.data);
      const pets = response.data || [];
      return pets.map((apiPet: any) => this.transformPetData(apiPet));
    } catch (error: any) {
      console.error('API: getPassedPets hatası:', error);
      return [];
    }
  }

  async likePet(likerPetId: string, likedPetId: string): Promise<any> {
    try {
      console.log('API: likePet çağrılıyor...', { likerPetId, likedPetId });
      const response = await this.api.post('/matching/like', { 
        likerPetId: parseInt(likerPetId), 
        likedPetId: parseInt(likedPetId) 
      });
      console.log('API: likePet yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: likePet hatası:', error);
      throw error;
    }
  }

  async unlikePet(likerPetId: string, likedPetId: string): Promise<any> {
    try {
      console.log('API: unlikePet çağrılıyor...', { likerPetId, likedPetId });
      // HTTP metodunu DELETE olarak değiştir ve veriyi 'data' içinde gönder
      const response = await this.api.delete('/matching/unlike', { 
        data: { 
          likerPetId: parseInt(likerPetId), 
          likedPetId: parseInt(likedPetId) 
        } 
      });
      console.log('API: unlikePet yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: unlikePet hatası:', error);
      throw error;
    }
  }

  async unpassPet(passerPetId: string, passedPetId: string): Promise<any> {
    try {
      console.log('API: unpassPet çağrılıyor...', { passerPetId, passedPetId });
       // HTTP metodunu DELETE olarak değiştir ve veriyi 'data' içinde gönder
      const response = await this.api.delete('/matching/unpass', { 
        data: { 
          passerPetId: parseInt(passerPetId), 
          passedPetId: parseInt(passedPetId) 
        } 
      });
      console.log('API: unpassPet yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: unpassPet hatası:', error);
      throw error;
    }
  }

  async passPet(passerPetId: string, passedPetId: string): Promise<any> {
    try {
      console.log('API: passPet çağrılıyor...', { passerPetId, passedPetId });
      const response = await this.api.post('/matching/pass', { 
        passerPetId: parseInt(passerPetId), 
        passedPetId: parseInt(passedPetId) 
      });
      console.log('API: passPet yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API: passPet hatası:', error);
      throw error;
    }
  }

  // Helper function to transform pet data from API to our Pet type
  // String normalization to fix encoding issues
  private normalizeString(str: string): string {
    if (!str || typeof str !== 'string') return '';
    
    // Doğrudan Türkçe kelime eşleştirmeleri
    if (str === "Dişi Kedi 1" || str === "DiÅŸi Kedi 1" || str === "DiÃ§i Kedi 1") {
      return "Dişi Kedi 1";
    }
    
    if (str === "Dişi Kedi 2" || str === "DiÅŸi Kedi 2" || str === "DiÃ§i Kedi 2") {
      return "Dişi Kedi 2";
    }
    
    // Fix common UTF-8 encoding issues for Turkish characters
    let normalized = str
      .replace(/Ã§/g, 'ç')
      .replace(/Ä±/g, 'ı')
      .replace(/Äž/g, 'ğ')
      .replace(/Ã¼/g, 'ü')
      .replace(/Ã¶/g, 'ö')
      .replace(/Å\x9F/g, 'ş')
      .replace(/Ä°/g, 'İ')
      .replace(/Ä/g, 'Ğ')
      .replace(/Ã\x9C/g, 'Ü')
      .replace(/Ã\x96/g, 'Ö')
      .replace(/Å\x9E/g, 'Ş')
      .replace(/Ã\x87/g, 'Ç')
      .replace(/DiÅŸi/g, 'Dişi')
      .replace(/DiÃ§i/g, 'Dişi')
      .replace(/Erkek/g, 'Erkek')
      .trim();
      
    // Türkçe kelimeler için özel düzeltmeler
    if (normalized.includes('DiÅŸi') || normalized.includes('DiÃ§i')) {
      normalized = 'Dişi';
    }
    
    return normalized;
  }

  private transformPetData(apiPet: any): Pet {
    // API'den gelen fotoğraf bilgilerini kontrol et ve düzelt
    let photos: string[] = [];
    
    // Önce photos dizisini kontrol et
    if (apiPet.photos && Array.isArray(apiPet.photos) && apiPet.photos.length > 0) {
      photos = apiPet.photos
        .filter((photo: any) => photo && typeof photo === 'string' && photo.trim() !== '')
        .map((photo: string) => this.fixImageUrl(photo));
    }
    
    // Eğer photos dizisi boşsa, profilePictureURL'i kontrol et
    if (photos.length === 0 && apiPet.profilePictureURL && typeof apiPet.profilePictureURL === 'string' && apiPet.profilePictureURL.trim() !== '') {
      photos = [this.fixImageUrl(apiPet.profilePictureURL)];
    }
    
    // API'den gelen resim yoksa boş bırak, frontend placeholder gösterecek
    if (photos.length === 0 || !photos[0] || photos[0].trim() === '') {
      console.log('No image from API for pet:', apiPet.name, 'Type:', apiPet.petTypeID);
      photos = []; // Boş bırak, frontend placeholder gösterecek
    }
    
    // Safe string normalization to fix encoding issues
    const safeName = this.normalizeString(apiPet.name || '');
    const safeBreed = this.normalizeString(apiPet.breedName || apiPet.breed || '');
    const safeDescription = this.normalizeString(apiPet.description || '');
    const safeColor = this.normalizeString(apiPet.color || '');

    return {
      id: (apiPet.petID || apiPet.id || '').toString(),
      name: safeName,
      species: apiPet.petTypeID === 1 ? 'cat' : (apiPet.petTypeID === 2 ? 'dog' : 'other'),
      breed: safeBreed,
      age: apiPet.age || 0,
      gender: apiPet.gender === 0 ? 'female' : 'male',
      neutered: apiPet.isNeutered || false,
      photos: photos,
      description: safeDescription,
      color: safeColor,
      ownerId: (apiPet.userID || apiPet.ownerId || '').toString(),
      isActive: apiPet.isActiveForMatching !== false,
      location: apiPet.location || 'Bilinmiyor', // Konum yoksa varsayılan değer
      distanceKm: apiPet.distanceKm, // Mesafe bilgisini ekle
      createdAt: apiPet.createdDate || apiPet.createdAt || new Date().toISOString(),
      birthDate: apiPet.birthDate || undefined,
    };
  }

  // Sohbet fonksiyonları
  async getChatInfo(chatId: string): Promise<any> {
    try {
      console.log('💬 API: getChatInfo çağrılıyor...', { chatId });
      const response = await this.api.get(`/chat/${chatId}`);
      console.log('💬 API: getChatInfo yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('💬 API: getChatInfo hatası:', error);
      throw error;
    }
  }

  async getChatMessages(chatId: string): Promise<any[]> {
    try {
      console.log('💬 API: getChatMessages çağrılıyor...', { chatId });
      const response = await this.api.get(`/chat/${chatId}/messages`);
      console.log('💬 API: getChatMessages yanıtı:', response.data);
      return response.data || [];
    } catch (error: any) {
      console.error('💬 API: getChatMessages hatası:', error);
      throw error;
    }
  }

  async sendChatMessage(chatId: string, messageData: { content: string; senderPetId: string }): Promise<any> {
    try {
      console.log('💬 API: sendChatMessage çağrılıyor...', { chatId, messageData });
      const response = await this.api.post(`/chat/${chatId}/messages`, {
        content: messageData.content,
        petId: messageData.senderPetId
      });
      console.log('💬 API: sendChatMessage yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('💬 API: sendChatMessage hatası:', error);
      throw error;
    }
  }

  // Mesaj durumu güncelleme
  async markMessageAsRead(chatId: string, messageId: string, petId: string): Promise<any> {
    try {
      console.log('💬 API: markMessageAsRead çağrılıyor...', { chatId, messageId, petId });
      const response = await this.api.put(`/chat/${chatId}/messages/${messageId}/read`, {
        petId: petId
      });
      console.log('💬 API: markMessageAsRead yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('💬 API: markMessageAsRead hatası:', error);
      throw error;
    }
  }

  // Tüm mesajları okundu olarak işaretle
  async markAllMessagesAsRead(chatId: string, petId: string): Promise<any> {
    try {
      console.log('💬 API: markAllMessagesAsRead çağrılıyor...', { chatId, petId });
      const response = await this.api.put(`/chat/${chatId}/read-all`, {
        petId: petId
      });
      console.log('💬 API: markAllMessagesAsRead yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('💬 API: markAllMessagesAsRead hatası:', error);
      throw error;
    }
  }

  // Chat listesi al
  async getChatList(petId: string): Promise<any[]> {
    try {
      console.log('💬 API: getChatList çağrılıyor...', { petId });
      const response = await this.api.get(`/chat/list`, {
        params: { petId }
      });
      console.log('💬 API: getChatList yanıtı:', response.data);
      return response.data || [];
    } catch (error: any) {
      console.error('💬 API: getChatList hatası:', error);
      throw error;
    }
  }

  // Chat oluştur (eşleşme sonrası)
  async createChat(matchId: string, petId: string): Promise<any> {
    try {
      console.log('💬 API: createChat çağrılıyor...', { matchId, petId });
      const response = await this.api.post(`/chat/create`, {
        matchId: matchId,
        petId: petId
      });
      console.log('💬 API: createChat yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('💬 API: createChat hatası:', error);
      throw error;
    }
  }

  // Send chat message
  async sendChatMessage(chatId: string, messageData: { content: string; senderPetId: string }): Promise<any> {
    try {
      console.log('💬 API: sendChatMessage çağrılıyor...', { chatId, messageData });
      const response = await this.api.post(`/chat/${chatId}/messages`, {
        content: messageData.content,
        petId: messageData.senderPetId
      });
      console.log('💬 API: sendChatMessage yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('💬 API: sendChatMessage hatası:', {
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
      throw error;
    }
  }

  // Delete match
  async deleteMatch(matchId: string): Promise<any> {
    try {
      console.log('🗑️ API: deleteMatch çağrılıyor...', { matchId });
      const response = await this.api.delete(`/matching/matches/${matchId}`);
      console.log('🗑️ API: deleteMatch yanıtı:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('🗑️ API: deleteMatch hatası:', error);
      throw error;
    }
  }
}

// Create instance of ApiService
export const apiService = new ApiService();