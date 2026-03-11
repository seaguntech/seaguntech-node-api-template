export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResponse = {
  message: string;
  data: {
    user: {
      id: string;
      email: string;
    };
    tokens: AuthTokens;
  };
};
