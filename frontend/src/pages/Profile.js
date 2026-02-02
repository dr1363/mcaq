import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { userAPI } from '../utils/api';
import { User, Trophy, Target, Zap, Award } from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile(userId);
      setProfile(response.data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-primary text-xl font-mono">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-accent text-xl font-mono">Profile not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="profile-page">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="cyber-card p-8 rounded-sm mb-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <User className="w-12 h-12 text-black" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-heading font-bold text-primary mb-2 glow-text" data-testid="profile-username">
                {profile.username}
              </h1>
              <p className="text-textMuted font-mono mb-4">{profile.email}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="text-xl font-bold text-primary" data-testid="profile-xp">{profile.xp} XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-secondary" />
                  <span className="text-xl font-bold text-secondary" data-testid="profile-level">Level {profile.level}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span className="text-xl font-bold text-textMain" data-testid="profile-completed">
                    {profile.completed_rooms_count} Completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="cyber-card p-6 rounded-sm" data-testid="stat-streak">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-8 h-8 text-secondary" />
              <span className="text-3xl font-heading font-bold text-secondary">{profile.streak}</span>
            </div>
            <div className="text-sm font-mono text-textMuted uppercase">Day Streak</div>
          </div>

          <div className="cyber-card p-6 rounded-sm" data-testid="stat-badges">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-primary" />
              <span className="text-3xl font-heading font-bold text-primary">{profile.badges?.length || 0}</span>
            </div>
            <div className="text-sm font-mono text-textMuted uppercase">Badges Earned</div>
          </div>

          <div className="cyber-card p-6 rounded-sm" data-testid="stat-achievements">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-secondary" />
              <span className="text-3xl font-heading font-bold text-secondary">{profile.achievements?.length || 0}</span>
            </div>
            <div className="text-sm font-mono text-textMuted uppercase">Achievements</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="cyber-card p-6 rounded-sm">
            <h2 className="text-2xl font-heading font-bold text-textMain mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" />
              Badges
            </h2>
            {profile.badges && profile.badges.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {profile.badges.map((badge, idx) => (
                  <div key={idx} className="bg-white/5 p-3 rounded-sm text-center" data-testid={`badge-${idx}`}>
                    <div className="text-2xl mb-1">🏆</div>
                    <div className="text-xs font-mono text-textMuted">{badge}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-textMuted font-mono text-sm">No badges earned yet</p>
            )}
          </div>

          <div className="cyber-card p-6 rounded-sm">
            <h2 className="text-2xl font-heading font-bold text-textMain mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Achievements
            </h2>
            {profile.achievements && profile.achievements.length > 0 ? (
              <div className="space-y-2">
                {profile.achievements.map((achievement, idx) => (
                  <div key={idx} className="bg-white/5 p-3 rounded-sm" data-testid={`achievement-${idx}`}>
                    <div className="flex items-center gap-3">
                      <div className="text-xl">✨</div>
                      <div className="text-sm font-mono text-textMain">{achievement}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-textMuted font-mono text-sm">No achievements unlocked yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
