import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, Shield, CheckCircle, AlertCircle } from 'lucide-react';

// Configuración de API
const API_URL = "http://localhost:3001/api/v1/auth";

// Interfaces
export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface ForgotPasswordResponse {
  message: string;
  success: boolean;
}

// Servicio de API
class ForgotPasswordService {
  async requestPasswordReset(email: string): Promise<ForgotPasswordResponse> {
    try {
      console.log("Sending request to:", `${API_URL}/forgot-password`);
      console.log("With email:", email);

      const response = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(errorText || "Error al solicitar recuperación de contraseña");
      }

      const data = await response.json();
      console.log("Success response:", data);
      return data;
    } catch (error) {
      console.error("Error in requestPasswordReset:", error);
      throw error;
    }
  }

  async verifyResetCode(email: string, code: string): Promise<ForgotPasswordResponse> {
    try {
      const response = await fetch(`${API_URL}/verify-reset-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Código de verificación inválido");
      }
      return data;
    } catch (error) {
      console.error("Error verifying reset code:", error);
      throw error;
    }
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<ForgotPasswordResponse> {
    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Error al restablecer la contraseña");
      }
      return data;
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  }
}

const forgotPasswordService = new ForgotPasswordService();

// Props del componente
interface ForgotPasswordFlowProps {
  onBackToLogin: () => void;
  onSuccess: () => void;
}

type Step = 'request' | 'verify' | 'reset' | 'success';

interface FormErrors {
  [key: string]: string;
}

export const ForgotPasswordFlow: React.FC<ForgotPasswordFlowProps> = ({ 
  onBackToLogin, 
  onSuccess 
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [timer, setTimer] = useState(0);

  const validateEmail = (email: string) => {
    if (!email) return 'El correo es requerido';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Correo inválido';
    return '';
  };

  const validateCode = (code: string) => {
    if (!code) return 'El código es requerido';
    if (!/^\d{6}$/.test(code)) return 'El código debe tener 6 dígitos';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'La contraseña es requerida';
    if (password.length < 6) return 'Mínimo 6 caracteres';
    return '';
  };

  const clearErrors = () => setErrors({});

  const handleRequestReset = async () => {
    clearErrors();

    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    setIsLoading(true);
    try {
      await forgotPasswordService.requestPasswordReset(email);
      setCurrentStep('verify'); // Cambiar a 'verify' después del éxito
      setTimer(300); // 5 minutos
      
      // Iniciar countdown
      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      setErrors({ api: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    clearErrors();

    const codeError = validateCode(code);
    if (codeError) {
      setErrors({ code: codeError });
      return;
    }

    setIsLoading(true);
    try {
      await forgotPasswordService.verifyResetCode(email, code);
      setCurrentStep('reset'); // Cambiar a 'reset' después del éxito
    } catch (error: any) {
      setErrors({ api: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    clearErrors();

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setErrors({ password: passwordError });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Las contraseñas no coinciden' });
      return;
    }

    setIsLoading(true);
    try {
      await forgotPasswordService.resetPassword(email, code, newPassword);
      setCurrentStep('success'); // Cambiar a 'success' después del éxito
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (error: any) {
      setErrors({ api: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-6">
      <div className="flex items-center space-x-2">
        {['request', 'verify', 'reset', 'success'].map((step, index) => (
          <React.Fragment key={step}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === step 
                ? 'bg-blue-600 text-white' 
                : ['request', 'verify', 'reset', 'success'].indexOf(currentStep) > index
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
            }`}>
              {['request', 'verify', 'reset', 'success'].indexOf(currentStep) > index ? '✓' : index + 1}
            </div>
            {index < 3 && (
              <div className={`w-8 h-0.5 ${
                ['request', 'verify', 'reset', 'success'].indexOf(currentStep) > index 
                  ? 'bg-green-500' 
                  : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBackToLogin}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </button>
      </div>

      <div className="flex justify-center mb-4">
        <img src="/assets/imagenes/LogoUcn.jpeg" alt="Logo UCENIN" className="h-16 w-16 object-contain" />
      </div>

      {renderStepIndicator()}

      {/* Error Message */}
      {errors.api && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md flex items-start">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
          <span className="text-red-700 text-sm">{errors.api}</span>
        </div>
      )}

      {/* Step 1: Request Reset */}
      {currentStep === 'request' && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">¿Olvidaste tu contraseña?</h2>
            <p className="text-gray-600 text-sm">
              Ingresa tu correo electrónico y te enviaremos un código para restablecer tu contraseña.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                placeholder="tucorreo@ejemplo.com"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <button
              onClick={handleRequestReset}
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </div>
              ) : (
                'Enviar código'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Verify Code */}
      {currentStep === 'verify' && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Verificar código</h2>
            <p className="text-gray-600 text-sm mb-2">
              Hemos enviado un código de 6 dígitos a <span className="font-medium">{email}</span>
            </p>
            {timer > 0 && (
              <p className="text-xs text-gray-500">
                El código expira en: <span className="font-mono font-bold text-blue-600">{formatTime(timer)}</span>
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Código de verificación
              </label>
              <input
                id="code"
                type="text"
                placeholder="123456"
                maxLength={6}
                className={`w-full px-4 py-3 rounded-lg border text-center text-lg font-mono tracking-widest ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setCode(value);
                  if (errors.code) setErrors(prev => ({ ...prev, code: '' }));
                }}
              />
              {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
            </div>

            <button
              onClick={handleVerifyCode}
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verificando...
                </div>
              ) : (
                'Verificar código'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setCurrentStep('request')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                ¿No recibiste el código? Volver a enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Reset Password */}
      {currentStep === 'reset' && (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Nueva contraseña</h2>
            <p className="text-gray-600 text-sm">
              Ingresa tu nueva contraseña. Debe tener al menos 6 caracteres.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Nueva contraseña
              </label>
              <input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                }}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors`}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                }}
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            <button
              onClick={handleResetPassword}
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cambiando contraseña...
                </div>
              ) : (
                'Cambiar contraseña'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {currentStep === 'success' && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">¡Contraseña cambiada!</h2>
          <p className="text-gray-600 text-sm mb-6">
            Tu contraseña ha sido actualizada exitosamente. Serás redirigido al inicio de sesión.
          </p>
          
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-gray-600">Redirigiendo...</span>
          </div>

          <button
            onClick={onSuccess}
            className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Ir al inicio de sesión ahora
          </button>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordFlow;