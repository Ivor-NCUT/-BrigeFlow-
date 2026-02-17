/**
 * [INPUT]: 依赖 insforge SDK 进行用户认证 (signUp/signInWithPassword/verifyEmail/resendVerificationEmail)
 * [OUTPUT]: 对外提供 LoginPage 组件，处理用户登录、注册、邮箱验证码验证全流程
 * [POS]: pages/LoginPage，认证入口页面，支持 signin/signup/verify 三种模式
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { insforge } from '../lib/insforge';

type AuthMode = 'signin' | 'signup' | 'verify';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<AuthMode>('signin');
  const [resending, setResending] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { data, error } = await insforge.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        if (data?.requireEmailVerification) {
          setMode('verify');
        } else {
          alert('Sign up successful!');
          setMode('signin');
        }
      } else if (mode === 'signin') {
        const { error } = await insforge.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await insforge.auth.verifyEmail({
        email,
        otp: verificationCode,
      });
      
      if (error) throw error;
      
      if (data?.accessToken) {
        alert('Email verified successfully!');
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setError(null);
    
    try {
      const { data, error } = await insforge.auth.resendVerificationEmail({
        email,
      });
      
      if (error) throw error;
      
      if (data?.success) {
        alert('Verification code resent! Please check your email.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const handleBackToSignup = () => {
    setMode('signup');
    setVerificationCode('');
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-bg p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary">缘脉 BridgeFlow</h1>
          <p className="text-text-secondary mt-2">
            {mode === 'signin' ? '登录以管理您的人脉' : mode === 'signup' ? '注册新账号' : '验证邮箱'}
          </p>
        </div>
        
        {mode === 'verify' ? (
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-text-secondary">
                我们已向 <span className="font-medium text-text-primary">{email}</span> 发送了验证码
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">验证码</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                required
                placeholder="请输入6位验证码"
                className="w-full px-3 py-2 border rounded-md text-center text-lg tracking-widest"
              />
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '验证中...' : '确认'}
            </button>

            <div className="flex justify-between text-sm">
              <button
                type="button"
                onClick={handleBackToSignup}
                className="text-blue-600 hover:underline"
              >
                返回重新注册
              </button>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resending}
                className="text-blue-600 hover:underline disabled:opacity-50"
              >
                {resending ? '发送中...' : '重新发送验证码'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : mode === 'signin' ? 'Login' : 'Sign Up'}
            </button>
          </form>
        )}

        {mode !== 'verify' && (
          <div className="mt-4 text-center">
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
              className="text-blue-600 hover:underline text-sm"
            >
              {mode === 'signin' ? 'Need an account? Sign Up' : 'Already have an account? Login'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
