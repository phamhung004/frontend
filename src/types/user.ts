export type UserRole = 'CUSTOMER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface AdminUser {
  id: number;
  authUserId?: string | null;
  email: string;
  fullName?: string | null;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string | null;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type UpdateUserPayload = Partial<Pick<AdminUser, 'fullName' | 'phone' | 'role' | 'status'>>;
