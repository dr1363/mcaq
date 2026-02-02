import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { roomAPI, labAPI, flagAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Terminal, Play, Flag, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
// Markdown rendering temporarily simplified

const RoomDetail = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingLab, setStartingLab] = useState(false);
  const [flag, setFlag] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (roomId) {
      fetchRoom();
    }
    // eslint-disable-next-line
  }, [roomId]);

  const fetchRoom = async () => {
    try {
      const response = await roomAPI.getById(roomId);
      setRoom(response.data);
    } catch (error) {
      toast.error('Failed to load room');
    } finally {
      setLoading(false);
    }
  };

  const handleStartLab = async () => {
    setStartingLab(true);
    try {
      const response = await labAPI.start(roomId);
      toast.success('Lab started! Launching terminal...');
      navigate(`/lab/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to start lab');
    } finally {
      setStartingLab(false);
    }
  };

  const handleSubmitFlag = async () => {
    if (!flag.trim()) return;
    setSubmitting(true);
    try {
      const response = await flagAPI.submit(roomId, flag);
      if (response.data.correct) {
        toast.success(response.data.message);
        if (response.data.xp_earned) {
          toast.success(`+${response.data.xp_earned} XP earned!`);
        }
        fetchRoom();
      } else {
        toast.error(response.data.message);
      }
      setFlag('');
    } catch (error) {
      toast.error('Failed to submit flag');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-primary text-xl font-mono">Loading room...</div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-accent text-xl font-mono">Room not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="room-detail-page">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="cyber-card p-8 rounded-sm mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-heading font-bold text-primary mb-3 glow-text" data-testid="room-title">
                {room.title}
              </h1>
              <p className="text-textMuted text-lg mb-4">{room.description}</p>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-mono px-3 py-1 rounded-sm font-bold ${
                  room.difficulty === 'Beginner' ? 'bg-primary/20 text-primary' :
                  room.difficulty === 'Intermediate' ? 'bg-secondary/20 text-secondary' :
                  'bg-accent/20 text-accent'
                }`}>
                  {room.difficulty}
                </span>
                <span className="text-sm font-mono bg-white/5 text-textMuted px-3 py-1 rounded-sm">
                  {room.category}
                </span>
                <span className="text-sm font-mono text-primary font-bold">+{room.xp_reward} XP</span>
              </div>
            </div>
            {room.has_lab && (
              <Button
                onClick={handleStartLab}
                disabled={startingLab}
                className="bg-primary text-black hover:bg-primaryDim font-bold uppercase tracking-wider"
                data-testid="start-lab-button"
              >
                {startingLab ? (
                  <span>Starting...</span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Start Lab
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="cyber-card p-8 rounded-sm mb-8">
              <h2 className="text-2xl font-heading font-bold text-textMain mb-6 flex items-center gap-2">
                <Terminal className="w-6 h-6 text-primary" />
                Room Content
              </h2>
              <div className="prose prose-invert max-w-none text-textMuted whitespace-pre-wrap" data-testid="room-content">
                {room.content || 'No content available for this room.'}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="cyber-card p-6 rounded-sm mb-6">
              <h3 className="text-xl font-heading font-bold text-textMain mb-4 flex items-center gap-2">
                <Flag className="w-5 h-5 text-primary" />
                Submit Flag
              </h3>
              <div className="space-y-4">
                <Input
                  type="text"
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  placeholder="Enter flag here..."
                  className="bg-black/50 border-white/20 focus:border-primary text-white font-mono rounded-none"
                  data-testid="flag-input"
                />
                <Button
                  onClick={handleSubmitFlag}
                  disabled={submitting || !flag.trim()}
                  className="w-full bg-primary text-black hover:bg-primaryDim font-bold uppercase tracking-wider"
                  data-testid="submit-flag-button"
                >
                  {submitting ? 'Submitting...' : 'Submit Flag'}
                </Button>
              </div>
            </div>

            {room.tasks && room.tasks.length > 0 && (
              <div className="cyber-card p-6 rounded-sm">
                <h3 className="text-xl font-heading font-bold text-textMain mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Tasks ({room.tasks.length})
                </h3>
                <div className="space-y-3">
                  {room.tasks.map((task, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-white/5 rounded-sm" data-testid={`task-${idx}`}>
                      <div className="text-primary font-mono text-sm mt-1">{idx + 1}.</div>
                      <div className="flex-1 text-textMuted text-sm">{task.description || task.title || task}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
