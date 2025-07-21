export interface User {
  id: string;
  name: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthRegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface AuthRegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export interface FetchMeResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
  };
}
