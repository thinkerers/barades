export interface SignupDto {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
}
