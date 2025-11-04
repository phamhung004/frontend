export interface User {
  id: string; // Supabase Auth ID (UUID)
  backendUserId?: number; // Backend database ID (BIGINT)
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface ResetPasswordCredentials {
  email: string;
}
