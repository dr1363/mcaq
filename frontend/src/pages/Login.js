import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Terminal } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back, hacker!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1719255418097-acf2f18306ce?q=85')] bg-cover bg-center opacity-5"></div>
      
      <div className="relative w-full max-w-md">
        <div className="cyber-card p-8 rounded-sm">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Terminal className="w-10 h-10 text-primary" />
            <h1 className="text-3xl font-heading font-bold text-primary glow-text">HackLidoLearn</h1>
          </div>
          
          <h2 className="text-2xl font-heading font-bold text-textMain text-center mb-2">Welcome Back</h2>
          <p className="text-textMuted text-center mb-8 font-mono text-sm">ACCESS GRANTED: Enter credentials</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-mono text-textMain mb-2">EMAIL</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/50 border-white/20 focus:border-primary text-white font-mono rounded-none"
                placeholder="hacker@example.com"
                required
                data-testid="login-email-input"
              />
            </div>

            <div>
              <label className="block text-sm font-mono text-textMain mb-2">PASSWORD</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/50 border-white/20 focus:border-primary text-white font-mono rounded-none"
                placeholder="••••••••"
                required
                data-testid="login-password-input"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-black hover:bg-primaryDim font-bold uppercase tracking-widest"
              disabled={loading}
              data-testid="login-submit-button"
            >
              {loading ? 'AUTHENTICATING...' : 'LOGIN'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-textMuted font-mono text-sm">
              New hacker?{' '}
              <Link to="/register" className="text-primary hover:text-primaryDim font-bold" data-testid="register-link">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
