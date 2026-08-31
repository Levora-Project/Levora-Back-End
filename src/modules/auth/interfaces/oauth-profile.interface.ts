export interface OAuthProfile {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  provider: string;
}

export interface OAuthLoginData {
  provider: string;
  providerUserId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  accessToken: string;
  refreshToken?: string | null;
}
