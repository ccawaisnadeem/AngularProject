export interface User {
  id: string;
  name: string;
  email: string;
  address?: string;
  provider: 'google' | 'github' | 'manual';
  photoURL?: string;
  createdAt?: Date;
  updatedAt?: Date;
  role?: 'Admin' | 'Customer'; // Only backend values: Admin or Customer
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}