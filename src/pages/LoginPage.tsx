import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { insforge } from '../lib/insforge';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

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
            alert('Check your email for the confirmation link!');
        } else {
            // Auto sign in if verification not required
             alert('Sign up successful!');
             setMode('signin');
        }
      } else {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-bg p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary">缘脉 BridgeFlow</h1>
          <p className="text-text-secondary mt-2">
            {mode === 'signin' ? '登录以管理您的人脉' : '注册新账号'}
          </p>
        </div>
        
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

        <div className="mt-4 text-center">
          <button
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="text-blue-600 hover:underline text-sm"
          >
            {mode === 'signin' ? 'Need an account? Sign Up' : 'Already have an account? Login'}
          </button>
        </div>

        <div className="mt-4 text-center border-t pt-4">
          <button
            onClick={() => {
              localStorage.setItem('dev_mode', 'true');
              window.location.reload();
            }}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Enter Dev Mode (Skip Login)
          </button>
        </div>
      </div>
    </div>
  );
}
