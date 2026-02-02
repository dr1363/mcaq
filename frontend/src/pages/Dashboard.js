import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { roadmapAPI, roomAPI, userAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { BookOpen, Target, Zap, Trophy, Code, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState([]);
  const [recentRooms, setRecentRooms] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [roadmapsRes, roomsRes, progressRes] = await Promise.all([
        roadmapAPI.getAll(),
        roomAPI.getAll(),
        userAPI.getProgress()
      ]);
      setRoadmaps(roadmapsRes.data.slice(0, 5));
      setRecentRooms(roomsRes.data.slice(0, 6));
      setProgress(progressRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const completedCount = progress.filter(p => p.completed).length;
  const totalRooms = recentRooms.length;
  const completionRate = totalRooms > 0 ? Math.round((completedCount / totalRooms) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-primary text-xl font-mono">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="dashboard">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <h1 className="text-4xl font-heading font-bold text-primary mb-2 glow-text" data-testid="dashboard-title">
            WELCOME BACK, {user?.username?.toUpperCase()}
          </h1>
          <p className="text-textMuted font-mono">Continue your cybersecurity journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="cyber-card p-6 rounded-sm" data-testid="stat-xp">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-8 h-8 text-primary" />
              <span className="text-2xl font-heading font-bold text-primary">{user?.xp || 0}</span>
            </div>
            <div className="text-sm font-mono text-textMuted uppercase">Total XP</div>
          </div>

          <div className="cyber-card p-6 rounded-sm" data-testid="stat-level">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-secondary" />
              <span className="text-2xl font-heading font-bold text-secondary">{user?.level || 1}</span>
            </div>
            <div className="text-sm font-mono text-textMuted uppercase">Level</div>
          </div>

          <div className="cyber-card p-6 rounded-sm" data-testid="stat-completed">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-primary" />
              <span className="text-2xl font-heading font-bold text-primary">{completedCount}</span>
            </div>
            <div className="text-sm font-mono text-textMuted uppercase">Completed</div>
          </div>

          <div className="cyber-card p-6 rounded-sm" data-testid="stat-streak">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-secondary" />
              <span className="text-2xl font-heading font-bold text-secondary">{user?.streak || 0}</span>
            </div>
            <div className="text-sm font-mono text-textMuted uppercase">Day Streak</div>
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-heading font-bold text-textMain">Learning Roadmaps</h2>
            <Link to="/roadmaps">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10" data-testid="view-all-roadmaps">
                View All
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmaps.map((roadmap, idx) => (
              <Link key={roadmap.id} to={`/roadmaps?roadmap=${roadmap.id}`} data-testid={`roadmap-card-${idx}`}>
                <div className="cyber-card p-6 rounded-sm hover:border-primary/50 transition-all h-full">
                  <div className="text-4xl mb-4">{roadmap.icon || '🎯'}</div>
                  <h3 className="text-xl font-heading font-bold text-textMain mb-2">{roadmap.title}</h3>
                  <p className="text-textMuted text-sm mb-4">{roadmap.description}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono px-2 py-1 rounded-sm ${
                      roadmap.difficulty === 'Beginner' ? 'bg-primary/20 text-primary' :
                      roadmap.difficulty === 'Intermediate' ? 'bg-secondary/20 text-secondary' :
                      'bg-accent/20 text-accent'
                    }`}>
                      {roadmap.difficulty}
                    </span>
                    <span className="text-xs font-mono text-textMuted">{roadmap.rooms?.length || 0} rooms</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-heading font-bold text-textMain">Recent Rooms</h2>
            <Link to="/roadmaps">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10" data-testid="browse-all-rooms">
                Browse All
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentRooms.map((room, idx) => {
              const isCompleted = progress.some(p => p.room_id === room.id && p.completed);
              return (
                <Link key={room.id} to={`/rooms/${room.id}`} data-testid={`room-card-${idx}`}>
                  <div className="cyber-card p-6 rounded-sm hover:border-primary/50 transition-all h-full">
                    <div className="flex items-start justify-between mb-4">
                      <BookOpen className="w-8 h-8 text-primary" />
                      {isCompleted && <Trophy className="w-5 h-5 text-primary" />}
                    </div>
                    <h3 className="text-lg font-heading font-bold text-textMain mb-2">{room.title}</h3>
                    <p className="text-textMuted text-sm mb-4 line-clamp-2">{room.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-mono px-2 py-1 rounded-sm ${
                        room.difficulty === 'Beginner' ? 'bg-primary/20 text-primary' :
                        room.difficulty === 'Intermediate' ? 'bg-secondary/20 text-secondary' :
                        'bg-accent/20 text-accent'
                      }`}>
                        {room.difficulty}
                      </span>
                      <span className="text-xs font-mono bg-white/5 text-textMuted px-2 py-1 rounded-sm">
                        {room.category}
                      </span>
                      <span className="text-xs font-mono text-primary">+{room.xp_reward} XP</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="cyber-card p-8 rounded-sm text-center">
          <Code className="w-16 h-16 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-heading font-bold text-textMain mb-2">Ready for Coding Challenges?</h3>
          <p className="text-textMuted mb-6">Practice Python, Bash, and JavaScript with real code execution</p>
          <Link to="/challenges">
            <Button className="bg-primary text-black hover:bg-primaryDim font-bold uppercase tracking-wider" data-testid="goto-challenges">
              Start Coding
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
