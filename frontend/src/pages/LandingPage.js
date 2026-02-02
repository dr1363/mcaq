import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Terminal, Shield, Zap, Users, Code, Trophy } from 'lucide-react';
import { Button } from '../components/ui/button';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Terminal className="w-12 h-12 text-primary" />,
      title: 'Real Interactive Labs',
      description: 'Practice in browser-based terminals with real Docker containers'
    },
    {
      icon: <Shield className="w-12 h-12 text-secondary" />,
      title: 'Capture The Flag',
      description: 'Solve challenges and submit flags to prove your skills'
    },
    {
      icon: <Code className="w-12 h-12 text-primary" />,
      title: 'Coding Practice',
      description: 'Sharpen your programming skills with real code execution'
    },
    {
      icon: <Trophy className="w-12 h-12 text-secondary" />,
      title: 'XP & Leaderboards',
      description: 'Earn XP, unlock badges, and compete with others'
    },
    {
      icon: <Users className="w-12 h-12 text-primary" />,
      title: 'Structured Learning',
      description: '5 complete roadmaps from beginner to advanced'
    },
    {
      icon: <Zap className="w-12 h-12 text-secondary" />,
      title: 'Hands-On Training',
      description: 'Real vulnerabilities, real commands, real outputs'
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-white/10 bg-surface/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Terminal className="w-8 h-8 text-primary" />
              <span className="text-2xl font-heading font-bold text-primary glow-text">HackLidoLearn</span>
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={() => navigate('/login')} 
                variant="ghost" 
                className="text-textMain hover:text-primary border border-primary/20 hover:bg-primary/10"
                data-testid="login-button"
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate('/register')} 
                className="bg-primary text-black hover:bg-primaryDim font-bold uppercase tracking-wider"
                data-testid="register-button"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1680992046617-e2e35451bcdb?q=85')] bg-cover bg-center opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-heading font-black text-primary mb-6 glow-text uppercase tracking-tighter" data-testid="hero-title">
              Master Cybersecurity
            </h1>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-secondary mb-8">
              Through Hands-On Hacking
            </h2>
            <p className="text-lg md:text-xl text-textMuted max-w-3xl mx-auto mb-12 leading-relaxed">
              Learn ethical hacking, penetration testing, and cybersecurity through real interactive labs, 
              CTF challenges, and structured learning paths. No simulations - just real terminals and real exploits.
            </p>
            <div className="flex gap-6 justify-center">
              <Button 
                onClick={() => navigate('/register')} 
                size="lg"
                className="bg-primary text-black hover:bg-primaryDim font-bold uppercase tracking-widest text-lg px-8 py-6 clip-path-polygon-[0_0,100%_0,100%_80%,90%_100%,0_100%]"
                data-testid="hero-cta-button"
              >
                Start Learning Free
              </Button>
              <Button 
                onClick={() => navigate('/login')} 
                size="lg"
                variant="outline"
                className="border-2 border-secondary text-secondary hover:bg-secondary/10 font-bold uppercase tracking-widest text-lg px-8 py-6"
                data-testid="hero-login-button"
              >
                Sign In
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-24">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="cyber-card p-6 rounded-sm hover:border-primary/30 transition-all group"
                data-testid={`feature-card-${idx}`}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-heading font-bold text-textMain mb-3">{feature.title}</h3>
                <p className="text-textMuted leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-32 text-center">
            <h3 className="text-3xl md:text-5xl font-heading font-bold text-textMain mb-6">
              5 Complete Learning Roadmaps
            </h3>
            <p className="text-lg text-textMuted mb-12 max-w-2xl mx-auto">
              From networking fundamentals to advanced exploitation techniques
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {['Networking Fundamentals', 'Web Penetration Testing', 'Linux Fundamentals', 'OSINT', 'Python for Hacking'].map((roadmap, idx) => (
                <div key={idx} className="cyber-card p-4 text-center" data-testid={`roadmap-preview-${idx}`}>
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="text-textMain font-mono font-bold">{roadmap}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-32 text-center bg-gradient-to-r from-primary/10 to-secondary/10 p-12 rounded-sm border border-white/10">
            <h3 className="text-4xl font-heading font-bold text-primary mb-4 glow-text">Ready to Start Hacking?</h3>
            <p className="text-lg text-textMuted mb-8">Join thousands of learners mastering cybersecurity</p>
            <Button 
              onClick={() => navigate('/register')} 
              size="lg"
              className="bg-primary text-black hover:bg-primaryDim font-bold uppercase tracking-widest text-lg px-12 py-6"
              data-testid="footer-cta-button"
            >
              Create Free Account
            </Button>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/10 bg-surface/50 backdrop-blur-xl py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-textMuted font-mono text-sm">
          <p>© 2025 HackLidoLearn. Master cybersecurity through real hands-on practice.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
