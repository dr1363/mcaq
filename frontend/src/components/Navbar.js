import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Terminal, User, Trophy, Code, BookOpen, LogOut, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b border-white/10 bg-surface/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2" data-testid="logo-link">
            <Terminal className="w-8 h-8 text-primary" />
            <span className="text-2xl font-heading font-bold text-primary glow-text">HackLidoLearn</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="text-textMain hover:text-primary transition-colors" data-testid="nav-dashboard">
              <BookOpen className="w-5 h-5 inline mr-1" />
              Dashboard
            </Link>
            <Link to="/roadmaps" className="text-textMain hover:text-primary transition-colors" data-testid="nav-roadmaps">
              <BookOpen className="w-5 h-5 inline mr-1" />
              Roadmaps
            </Link>
            <Link to="/challenges" className="text-textMain hover:text-primary transition-colors" data-testid="nav-challenges">
              <Code className="w-5 h-5 inline mr-1" />
              Challenges
            </Link>
            <Link to="/leaderboard" className="text-textMain hover:text-primary transition-colors" data-testid="nav-leaderboard">
              <Trophy className="w-5 h-5 inline mr-1" />
              Leaderboard
            </Link>
            
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-accent hover:text-accent/80 transition-colors" data-testid="nav-admin">
                <Shield className="w-5 h-5 inline mr-1" />
                Admin
              </Link>
            )}

            <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
              <div className="text-right">
                <div className="text-sm font-mono text-textMain">{user?.username}</div>
                <div className="text-xs text-primary font-bold">{user?.xp || 0} XP</div>
              </div>
              
              <Link to={`/profile/${user?.id}`} data-testid="nav-profile">
                <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                  <User className="w-5 h-5 text-primary" />
                </Button>
              </Link>
              
              <Button 
                onClick={handleLogout} 
                variant="ghost" 
                size="icon" 
                className="hover:bg-accent/10"
                data-testid="logout-button"
              >
                <LogOut className="w-5 h-5 text-accent" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
