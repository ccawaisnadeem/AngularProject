export interface User {
  id: string;
  name?: string;
  fullName?: string; // Added to support the backend response structure
  email: string;
  address?: string;
  provider?: 'google' | 'github' | 'manual';
  photoURL?: string;
  createdAt?: Date | string; // Support both Date object and string date format
  updatedAt?: Date | string;
  role?: 'Admin' | 'Customer'; // Only backend values: Admin or Customer
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}