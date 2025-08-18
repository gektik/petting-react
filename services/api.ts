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

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
    this.setupNetworkListener();
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
          await this.clearToken();
          // Redirect to login screen
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

  // Pet methods
  async getUserPets(): Promise<Pet[]> {
    try {
      console.log('API: getUserPets çağrılıyor...');
      console.log('API: Token mevcut:', !!this.token);
      console.log('API: Request URL:', `${BASE_URL}/pets/my-pets`);
      const response = await this.api.get('/pets/my-pets');
      console.log('API: getUserPets yanıtı:', response.data);
      // API direkt array döndürüyor, .data wrapper'ı yok
      return response.data || [];
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
      const response = await this.api.post(endpoint, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Request failed');
    }
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
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

  // Pet update method
  async updatePet(petId: string, petData: any): Promise<any> {
    try {
      console.log('API: updatePet çağrılıyor...', { petId, petData });
      const response = await this.api.put(`/api/Pets/${petId}`, petData);
      console.log('API: updatePet yanıtı:', response.data);
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
}

export const apiService = new ApiService();

// Mock data methods - these will be replaced with real API calls
export const mockApiMethods = {
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

// Ensure getUserPets method is available on the instance
(apiService as any).getUserPets = ApiService.prototype.getUserPets.bind(apiService);