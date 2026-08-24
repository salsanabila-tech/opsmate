const ACCESS_TOKEN_KEY = 'opsmate.web.access_token';

const REFRESH_TOKEN_KEY = 'opsmate.web.refresh_token';

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export function saveTokens(tokens: Tokens): void {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);

  sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function clearTokens(): void {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);

  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}
