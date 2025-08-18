export interface User {
  id: string;
  name: string;
  email: string;
  address?: string;
  provider: 'google' | 'github' | 'facebook' | 'manual';
  photoURL?: string;
  createdAt?: Date;
  updatedAt?: Date;
}