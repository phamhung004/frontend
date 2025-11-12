import { getSupabaseClient } from './supabaseClient';
import api from './api';
import type {
  User,
  AuthError,
  SignUpCredentials,
  SignInCredentials,
  ResetPasswordCredentials,
} from '../types/auth';
import type { AdminUser, UserRole } from '../types/user';

class AuthService {
  private supabase = getSupabaseClient();

  /**
   * Đồng bộ user với backend sau khi đăng ký/đăng nhập
   */
  private async syncUserWithBackend(user: any): Promise<void> {
    try {
      await api.post('/users/sync', {
        authUserId: user.id,
        email: user.email,
        firstName: user.user_metadata?.first_name,
        lastName: user.user_metadata?.last_name,
        fullName: user.user_metadata?.full_name,
        avatarUrl: user.user_metadata?.avatar_url,
      });
      console.log('User synced with backend successfully');
    } catch (error) {
      console.error('Failed to sync user with backend:', error);
      // Không throw error để không ảnh hưởng đến flow đăng ký/đăng nhập
    }
  }

  /**
   * Cập nhật last login
   */
  private async updateLastLogin(userId: string): Promise<void> {
    try {
      await api.post(`/users/auth/${userId}/login`);
    } catch (error) {
      console.error('Failed to update last login:', error);
    }
  }

  /**
   * Lấy backend user ID từ auth ID
   */
  private async getBackendUser(authUserId: string): Promise<AdminUser | null> {
    try {
      const response = await api.get(`/users/auth/${authUserId}`);
      return response.data as AdminUser;
    } catch (error) {
      console.error('Failed to get backend user profile:', error);
      return null;
    }
  }

  private normalizeRole(role?: string | null): UserRole | undefined {
    if (!role) {
      return undefined;
    }

    const normalized = role.toString().trim().toUpperCase();

    if (normalized === 'ADMINISTRATOR' || normalized === 'ADMIN') {
      return 'ADMIN';
    }

    if (normalized === 'CUSTOMER') {
      return 'CUSTOMER';
    }

    return undefined;
  }

  /**
   * Đăng ký người dùng mới
   */
  async signUp({ email, password, firstName, lastName }: SignUpCredentials): Promise<{
    user: User | null;
    error: AuthError | null;
  }> {
    if (!this.supabase) {
      return { user: null, error: { message: 'Supabase client not initialized' } };
    }

    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            full_name: `${firstName} ${lastName}`,
          },
        },
      });

      if (error) {
        return { user: null, error: { message: error.message, code: error.code } };
      }

      if (!data.user) {
        return { user: null, error: { message: 'Failed to create user' } };
      }

      // Đồng bộ user với backend
      await this.syncUserWithBackend(data.user);

      // Đăng xuất ngay sau khi đăng ký để user phải confirm email và đăng nhập lại
      await this.supabase.auth.signOut();

      // Trả về null để không tự động đăng nhập
      // User cần confirm email và đăng nhập thủ công
      return { user: null, error: null };
    } catch (err) {
      return {
        user: null,
        error: { message: err instanceof Error ? err.message : 'Unknown error occurred' },
      };
    }
  }

  /**
   * Đăng nhập
   */
  async signIn({ email, password }: SignInCredentials): Promise<{
    user: User | null;
    error: AuthError | null;
  }> {
    if (!this.supabase) {
      return { user: null, error: { message: 'Supabase client not initialized' } };
    }

    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: { message: error.message, code: error.code } };
      }

      if (!data.user) {
        return { user: null, error: { message: 'Failed to sign in' } };
      }

      // Đồng bộ user với backend (phòng trường hợp chưa có trong DB)
      await this.syncUserWithBackend(data.user);
      
      // Cập nhật last login
      await this.updateLastLogin(data.user.id);


      const backendUser = await this.getBackendUser(data.user.id);
      const roleFromMetadata = this.normalizeRole(data.user.user_metadata?.role);
      const role = this.normalizeRole(backendUser?.role) ?? roleFromMetadata;

      const user: User = {
        id: data.user.id,
        backendUserId: backendUser?.id,
        email: data.user.email!,
        firstName: data.user.user_metadata?.first_name,
        lastName: data.user.user_metadata?.last_name,
        fullName: data.user.user_metadata?.full_name,
        avatarUrl: data.user.user_metadata?.avatar_url,
        createdAt: data.user.created_at,
        role,
      };

      return { user, error: null };
    } catch (err) {
      return {
        user: null,
        error: { message: err instanceof Error ? err.message : 'Unknown error occurred' },
      };
    }
  }

  /**
   * Đăng xuất
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    if (!this.supabase) {
      return { error: { message: 'Supabase client not initialized' } };
    }

    try {
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        return { error: { message: error.message, code: error.code } };
      }

      return { error: null };
    } catch (err) {
      return {
        error: { message: err instanceof Error ? err.message : 'Unknown error occurred' },
      };
    }
  }

  /**
   * Lấy thông tin user hiện tại
   */
  async getCurrentUser(): Promise<User | null> {
    if (!this.supabase) {
      return null;
    }

    try {
      const { data: { user } } = await this.supabase.auth.getUser();

      if (!user) {
        return null;
      }

      const backendUser = await this.getBackendUser(user.id);
      const roleFromMetadata = this.normalizeRole(user.user_metadata?.role);
      const role = this.normalizeRole(backendUser?.role) ?? roleFromMetadata;

      return {
        id: user.id,
        backendUserId: backendUser?.id,
        email: user.email!,
        firstName: user.user_metadata?.first_name,
        lastName: user.user_metadata?.last_name,
        fullName: user.user_metadata?.full_name,
        avatarUrl: user.user_metadata?.avatar_url,
        createdAt: user.created_at,
        role,
      };
    } catch {
      return null;
    }
  }

  /**
   * Gửi email reset password
   */
  async resetPassword({ email }: ResetPasswordCredentials): Promise<{
    error: AuthError | null;
  }> {
    if (!this.supabase) {
      return { error: { message: 'Supabase client not initialized' } };
    }

    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error: { message: error.message, code: error.code } };
      }

      return { error: null };
    } catch (err) {
      return {
        error: { message: err instanceof Error ? err.message : 'Unknown error occurred' },
      };
    }
  }

  /**
   * Cập nhật password mới
   */
  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    if (!this.supabase) {
      return { error: { message: 'Supabase client not initialized' } };
    }

    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error: { message: error.message, code: error.code } };
      }

      return { error: null };
    } catch (err) {
      return {
        error: { message: err instanceof Error ? err.message : 'Unknown error occurred' },
      };
    }
  }

  /**
   * Lắng nghe thay đổi auth state
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    if (!this.supabase) {
      return { unsubscribe: () => {} };
    }

    const { data: { subscription } } = this.supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          let backendUser: AdminUser | null = null;
          try {
            backendUser = await this.getBackendUser(session.user.id);
          } catch (error) {
            console.error('Failed to resolve backend user on auth change:', error);
          }

          const roleFromMetadata = this.normalizeRole(session.user.user_metadata?.role);
          const role = this.normalizeRole(backendUser?.role) ?? roleFromMetadata;

          const user: User = {
            id: session.user.id,
            backendUserId: backendUser?.id,
            email: session.user.email!,
            firstName: session.user.user_metadata?.first_name,
            lastName: session.user.user_metadata?.last_name,
            fullName: session.user.user_metadata?.full_name,
            avatarUrl: session.user.user_metadata?.avatar_url,
            createdAt: session.user.created_at,
            role,
          };
          callback(user);
        } else {
          callback(null);
        }
      }
    );

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  }
}

export const authService = new AuthService();
