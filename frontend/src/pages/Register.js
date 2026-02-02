import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Terminal } from 'lucide-react';
import { toast } from 'sonner';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(email, username, password);
      toast.success('Account created! Welcome to HackLidoLearn');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1768839720936-87ce3adf2d08?q=85')] bg-cover bg-center opacity-5"></div>
      
      <div className="relative w-full max-w-md">
        <div className="cyber-card p-8 rounded-sm">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Terminal className="w-10 h-10 text-primary" />
            <h1 className="text-3xl font-heading font-bold text-primary glow-text">HackLidoLearn</h1>
          </div>
          
          <h2 className="text-2xl font-heading font-bold text-textMain text-center mb-2">Join The Elite</h2>
          <p className="text-textMuted text-center mb-8 font-mono text-sm">INITIALIZE: Create your hacker profile</p>

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
                data-testid="register-email-input"
              />
            </div>

            <div>
              <label className="block text-sm font-mono text-textMain mb-2">USERNAME</label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-black/50 border-white/20 focus:border-primary text-white font-mono rounded-none"
                placeholder="cyberwarrior"
                required
                data-testid="register-username-input"
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
                minLength={6}
                data-testid="register-password-input"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-black hover:bg-primaryDim font-bold uppercase tracking-widest"
              disabled={loading}
              data-testid="register-submit-button"
            >
              {loading ? 'INITIALIZING...' : 'CREATE ACCOUNT'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-textMuted font-mono text-sm">
              Already have access?{' '}
              <Link to="/login" className="text-primary hover:text-primaryDim font-bold" data-testid="login-link">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
