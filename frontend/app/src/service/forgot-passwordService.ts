// services/forgotPasswordService.ts
export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

class ForgotPasswordService {
  //private readonly baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  private async makeRequest<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<ApiResponse<T>> {
    try {
      const config: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Para enviar cookies de sesión si es necesario
      };

      if (body && method !== 'GET') {
        config.body = JSON.stringify(body);
      }

      const response = await fetch(`/api/v1${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error de conexión');
    }
  }

  /**
   * Solicitar código de restablecimiento de contraseña
   */
  async requestPasswordReset(email: string): Promise<ApiResponse> {
    const payload: ForgotPasswordRequest = { email };
    return this.makeRequest('/auth/forgot-password', 'POST', payload);
  }

  /**
   * Verificar código de restablecimiento
   */
  async verifyResetCode(email: string, code: string): Promise<ApiResponse> {
    const payload: VerifyResetCodeRequest = { email, code };
    return this.makeRequest('/auth/verify-reset-code', 'POST', payload);
  }

  /**
   * Restablecer contraseña
   */
  async resetPassword(email: string, code: string, newPassword: string): Promise<ApiResponse> {
    const payload: ResetPasswordRequest = { email, code, newPassword };
    return this.makeRequest('/auth/reset-password', 'POST', payload);
  }

  /**
   * Reenviar código de verificación
   */
  async resendCode(email: string): Promise<ApiResponse> {
    return this.requestPasswordReset(email);
  }
}

// Singleton instance
export const forgotPasswordService = new ForgotPasswordService();

// Hook personalizado para React (opcional)
import { useState, useCallback } from 'react';

export interface UseForgotPasswordReturn {
  requestReset: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useForgotPassword = (): UseForgotPasswordReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const requestReset = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await forgotPasswordService.requestPasswordReset(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyCode = useCallback(async (email: string, code: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await forgotPasswordService.verifyResetCode(email, code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string, code: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await forgotPasswordService.resetPassword(email, code, newPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    requestReset,
    verifyCode,
    resetPassword,
    isLoading,
    error,
    clearError,
  };
};