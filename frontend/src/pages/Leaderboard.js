import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { userAPI } from '../utils/api';
import { Trophy, Medal, Award } from 'lucide-react';
import { toast } from 'sonner';

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await userAPI.getLeaderboard(50);
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-primary" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-secondary" />;
    if (rank === 3) return <Award className="w-6 h-6 text-accent" />;
    return <span className="w-6 text-center font-bold text-textMuted">{rank}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-primary text-xl font-mono">Loading leaderboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="leaderboard-page">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12 text-center">
          <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-heading font-bold text-primary mb-2 glow-text" data-testid="leaderboard-title">
            LEADERBOARD
          </h1>
          <p className="text-textMuted font-mono">Top hackers ranked by XP</p>
        </div>

        <div className="cyber-card rounded-sm overflow-hidden">
          <div className="bg-surface p-4 border-b border-white/10">
            <div className="grid grid-cols-12 gap-4 font-mono text-xs text-textMuted uppercase font-bold">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Hacker</div>
              <div className="col-span-2 text-center">Level</div>
              <div className="col-span-2 text-center">XP</div>
              <div className="col-span-2 text-center">Badges</div>
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {users.length > 0 ? (
              users.map((user, idx) => (
                <div 
                  key={user.id} 
                  className={`p-4 hover:bg-white/5 transition-colors ${
                    idx < 3 ? 'bg-white/5' : ''
                  }`}
                  data-testid={`leaderboard-user-${idx}`}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1 flex items-center">
                      {getRankIcon(idx + 1)}
                    </div>
                    <div className="col-span-5">
                      <div className="text-textMain font-bold font-mono">{user.username}</div>
                      <div className="text-xs text-textMuted font-mono">{user.email}</div>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-secondary font-bold font-mono text-lg">{user.level}</span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-primary font-bold font-mono text-lg">{user.xp}</span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-textMain font-mono">{user.badges?.length || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-textMuted font-mono">
                No users on the leaderboard yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
