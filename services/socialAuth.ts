import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

interface SocialAuthResult {
  token: string;
  provider: 'Google' | 'Facebook';
}

class SocialAuthServiceWeb {
  constructor() {
    // Configuration will be done when needed
  }

  async signInWithGoogle(): Promise<SocialAuthResult> {
    // Google Sign-In is not supported in Expo Go
    // For development purposes, use web authentication or build a development build
    throw new Error('Google Sign-In özelliği şu anda kullanılamıyor. Lütfen normal giriş yöntemini kullanın.');
  }

  async signInWithFacebook(): Promise<SocialAuthResult> {
    // Facebook Sign-In is not supported in Expo Go
    // For development purposes, use web authentication or build a development build
    throw new Error('Facebook Sign-In özelliği şu anda kullanılamıyor. Lütfen normal giriş yöntemini kullanın.');
  }

  private async googleWebAuth(): Promise<SocialAuthResult> {
    const webRedirectUri = Platform.OS === 'web'
      ? `${window.location.origin}/auth/callback`
      : this.redirectUri;

    const request = new AuthSession.AuthRequest({
      clientId: this.googleWebClientId,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Code,
      redirectUri: webRedirectUri,
      extraParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    });

    console.log('OAuth Request Config:', {
      clientId: this.googleWebClientId,
      redirectUri: webRedirectUri,
      scopes: ['openid', 'profile', 'email'],
    });

    const result = await request.promptAsync({
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      useProxy: Platform.OS !== 'web',
      showInRecents: false,
    });

    console.log('OAuth Result:', result);

    if (result.type === 'success' && result.params.code) {
      const tokenResponse = await this.exchangeCodeForToken(result.params.code, webRedirectUri);
      return {
        token: tokenResponse.access_token,
        provider: 'Google',
      };
    }

    throw new Error('Google authentication was cancelled or failed');
  }

  private async exchangeCodeForToken(code: string, redirectUri: string) {
    const tokenEndpoint = 'https://oauth2.googleapis.com/token';
    
    const params = new URLSearchParams({
      client_id: this.googleWebClientId,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    });

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error('Token exchange failed');
    }

    return await response.json();
  }

  private async facebookWebAuth(): Promise<SocialAuthResult> {
    // For web, use the current origin with a specific path  
    const webRedirectUri = Platform.OS === 'web' 
      ? `${window.location.origin}/auth/callback`
      : this.redirectUri;

    const request = new AuthSession.AuthRequest({
      clientId: this.facebookAppId,
      scopes: ['public_profile', 'email'],
      responseType: AuthSession.ResponseType.Token,
      redirectUri: webRedirectUri,
      extraParams: {
        display: 'popup',
      },
    });

    console.log('Facebook OAuth Request Config:', {
      clientId: this.facebookAppId,
      redirectUri: webRedirectUri,
      scopes: ['public_profile', 'email'],
    });

    const result = await request.promptAsync({
      authorizationEndpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
      useProxy: Platform.OS !== 'web',
      showInRecents: false,
    });

    console.log('Facebook OAuth Result:', result);

    if (result.type === 'success' && result.params.access_token) {
      return {
        token: result.params.access_token,
        provider: 'Facebook',
      };
    }

    throw new Error('Facebook authentication was cancelled or failed');
  }

  async signOut(): Promise<void> {
    if (Platform.OS !== 'web') {
      try {
        // Google sign out
        const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
        if (await GoogleSignin.isSignedIn()) {
          await GoogleSignin.signOut();
        }
        
        // Facebook sign out
        const { LoginManager } = await import('react-native-fbsdk-next');
        LoginManager.logOut();
        
        console.log('Sosyal medya hesaplarından çıkış yapıldı');
      } catch (error) {
        console.error('Sign out error:', error);
      }
    }
  }
}

export const socialAuthService = new SocialAuthServiceWeb();