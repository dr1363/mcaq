import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { adminAPI } from '../../utils/api';
import { Shield, Users, BookOpen, Terminal, TrendingUp } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-primary text-xl font-mono">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="admin-dashboard">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <h1 className="text-4xl font-heading font-bold text-accent mb-2 glow-text" data-testid="admin-title">
            ADMIN PANEL
          </h1>
          <p className="text-textMuted font-mono">Platform management and analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="cyber-card p-6 rounded-sm" data-testid="stat-users">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-primary" />
              <span className="text-3xl font-heading font-bold text-primary">{stats?.total_users || 0}</span>
            </div>
            <div className="text-sm font-mono text-textMuted uppercase">Total Users</div>
          </div>

          <div className="cyber-card p-6 rounded-sm" data-testid="stat-rooms">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="w-8 h-8 text-secondary" />
              <span className="text-3xl font-heading font-bold text-secondary">{stats?.total_rooms || 0}</span>
            </div>
            <div className="text-sm font-mono text-textMuted uppercase">Total Rooms</div>
          </div>

          <div className="cyber-card p-6 rounded-sm" data-testid="stat-sessions">
            <div className="flex items-center justify-between mb-2">
              <Terminal className="w-8 h-8 text-primary" />
              <span className="text-3xl font-heading font-bold text-primary">{stats?.total_sessions || 0}</span>
            </div>
            <div className="text-sm font-mono text-textMuted uppercase">Lab Sessions</div>
          </div>

          <div className="cyber-card p-6 rounded-sm" data-testid="stat-active">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-secondary" />
              <span className="text-3xl font-heading font-bold text-secondary">{stats?.active_sessions || 0}</span>
            </div>
            <div className="text-sm font-mono text-textMuted uppercase">Active Now</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/admin/users">
            <div className="cyber-card p-8 rounded-sm hover:border-accent/50 transition-all h-full" data-testid="manage-users-card">
              <Users className="w-12 h-12 text-accent mb-4" />
              <h3 className="text-2xl font-heading font-bold text-textMain mb-2">Manage Users</h3>
              <p className="text-textMuted mb-4">View, edit, and manage user accounts and permissions</p>
              <Button className="bg-accent text-white hover:bg-accent/80 font-bold uppercase tracking-wider">
                Go to Users
              </Button>
            </div>
          </Link>

          <Link to="/admin/rooms">
            <div className="cyber-card p-8 rounded-sm hover:border-accent/50 transition-all h-full" data-testid="manage-rooms-card">
              <BookOpen className="w-12 h-12 text-accent mb-4" />
              <h3 className="text-2xl font-heading font-bold text-textMain mb-2">Manage Rooms</h3>
              <p className="text-textMuted mb-4">Create, edit, and delete learning rooms and labs</p>
              <Button className="bg-accent text-white hover:bg-accent/80 font-bold uppercase tracking-wider">
                Go to Rooms
              </Button>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
