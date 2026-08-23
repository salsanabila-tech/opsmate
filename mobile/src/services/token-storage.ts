import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'opsmate.access_token';

const REFRESH_TOKEN_KEY = 'opsmate.refresh_token';

type SaveTokensInput = {
  accessToken: string;
  refreshToken: string;
};

export async function saveTokens(input: SaveTokensInput): Promise<void> {
  await Promise.all([SecureStore.setItemAsync(ACCESS_TOKEN_KEY, input.accessToken), SecureStore.setItemAsync(REFRESH_TOKEN_KEY, input.refreshToken)]);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY), SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)]);
}
