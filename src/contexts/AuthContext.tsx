import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User, SignUpCredentials, SignInCredentials } from '../types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (credentials: SignUpCredentials) => Promise<{ error: string | null }>;
  signIn: (credentials: SignInCredentials) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy user hiện tại khi app khởi động
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Lắng nghe thay đổi auth state
    const { unsubscribe } = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signUp = async (credentials: SignUpCredentials) => {
    try {
      const { error } = await authService.signUp(credentials);
      
      if (error) {
        return { error: error.message };
      }

      // Không set user vì user sẽ phải confirm email và đăng nhập lại
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error occurred' };
    }
  };

  const signIn = async (credentials: SignInCredentials) => {
    try {
      const { user, error } = await authService.signIn(credentials);
      
      if (error) {
        return { error: error.message };
      }

      setUser(user);
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error occurred' };
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await authService.resetPassword({ email });
      
      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error occurred' };
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
