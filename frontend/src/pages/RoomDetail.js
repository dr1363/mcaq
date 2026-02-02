import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { roomAPI, labAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Terminal, Play, Flag, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const RoomDetail = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingLab, setStartingLab] = useState(false);
  const [roomFlags, setRoomFlags] = useState([]);
  const [answeredFlags, setAnsweredFlags] = useState([]);
  const [flagAnswers, setFlagAnswers] = useState({});
  const [submittingFlag, setSubmittingFlag] = useState(null);

  useEffect(() => {
    if (roomId) {
      fetchRoom();
      fetchRoomFlags();
      fetchAnsweredFlags();
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

  const fetchRoomFlags = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/room-flags/${roomId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoomFlags(response.data);
    } catch (error) {
      console.error('Failed to load flags');
    }
  };

  const fetchAnsweredFlags = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/answered-flags`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnsweredFlags(response.data);
    } catch (error) {
      console.error('Failed to load answered flags');
    }
  };

  const handleStartLab = async () => {
    if (startingLab) return;
    
    setStartingLab(true);
    try {
      if (room.lab_type === 'code_editor' || room.room_type === 'programming') {
        toast.success('Opening code editor...');
        navigate(`/challenges/python-${roomId}`);
        return;
      }
      
      if (room.lab_type === 'web') {
        const response = await labAPI.start({ room_id: roomId });
        toast.success('Web challenge loaded!');
        navigate(`/web-lab/${response.data.id}`);
        return;
      }
      
      const response = await labAPI.start({ room_id: roomId });
      const sessionId = response.data.id;
      
      if (sessionId) {
        toast.success('Terminal lab started!');
        setTimeout(() => {
          navigate(`/lab/${sessionId}`);
        }, 500);
      } else {
        toast.error('Failed to get session ID');
        setStartingLab(false);
      }
    } catch (error) {
      console.error('Lab start error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to start lab';
      toast.error(errorMsg);
      setStartingLab(false);
    }
  };

  const handleSubmitAnswer = async (flagId) => {
    const answer = flagAnswers[flagId];
    if (!answer || !answer.trim()) {
      toast.error('Please enter an answer');
      return;
    }
    
    setSubmittingFlag(flagId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/room-flags/check?flag_id=${flagId}`,
        { answer: answer },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.correct) {
        toast.success(response.data.message);
        if (response.data.points_earned > 0) {
          toast.success(`+${response.data.points_earned} points earned!`);
        }
        setAnsweredFlags([...answeredFlags, flagId]);
        setFlagAnswers({...flagAnswers, [flagId]: ''});
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to submit answer');
    } finally {
      setSubmittingFlag(null);
    }
  };

  const handleAnswerChange = (flagId, value) => {
    setFlagAnswers({...flagAnswers, [flagId]: value});
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

  const tasks = room.tasks || [];

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
                    {room.lab_type === 'code_editor' || room.room_type === 'programming' ? 'Open Code Editor' :
                     room.lab_type === 'web' ? 'Launch Web Challenge' :
                     'Start Terminal Lab'}
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
              <div className="text-textMuted whitespace-pre-wrap leading-relaxed" data-testid="room-content">
                {room.content || 'No content available for this room.'}
              </div>
            </div>

            {tasks.length > 0 && (
              <div className="cyber-card p-6 rounded-sm">
                <h3 className="text-xl font-heading font-bold text-textMain mb-4">Tasks</h3>
                <div className="space-y-3">
                  {tasks.slice(0, 10).map((task, idx) => (
                    <div key={`task-${idx}`} className="flex items-start gap-3 p-3 bg-white/5 rounded-sm" data-testid={`task-${idx}`}>
                      <div className="text-primary font-mono text-sm mt-1">{idx + 1}.</div>
                      <div className="flex-1 text-textMuted text-sm">{task.description || task.title || task}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="cyber-card p-6 rounded-sm">
              <h3 className="text-xl font-heading font-bold text-textMain mb-4 flex items-center gap-2">
                <Flag className="w-5 h-5 text-primary" />
                Answer the Questions
              </h3>
              
              {roomFlags.length > 0 ? (
                <div className="space-y-4">
                  {roomFlags.map((flag, idx) => {
                    const isAnswered = answeredFlags.includes(flag.id);
                    return (
                      <div key={flag.id} className="border border-white/10 p-4 rounded-sm" data-testid={`flag-question-${idx}`}>
                        <div className="flex items-start gap-2 mb-3">
                          <span className="text-primary font-mono font-bold">{idx + 1}.</span>
                          <div className="flex-1">
                            <p className="text-textMain font-mono text-sm mb-2">{flag.question}</p>
                            {isAnswered ? (
                              <div className="flex items-center gap-2 bg-primary/10 px-3 py-2 rounded-sm">
                                <CheckCircle className="w-4 h-4 text-primary" />
                                <span className="text-primary font-mono text-sm font-bold">Correct! +{flag.points} pts</span>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Input
                                  type="text"
                                  value={flagAnswers[flag.id] || ''}
                                  onChange={(e) => handleAnswerChange(flag.id, e.target.value)}
                                  placeholder="Your answer..."
                                  className="bg-black/50 border-white/20 focus:border-primary text-white font-mono rounded-none"
                                  data-testid={`answer-input-${idx}`}
                                />
                                <Button
                                  onClick={() => handleSubmitAnswer(flag.id)}
                                  disabled={submittingFlag === flag.id || !flagAnswers[flag.id]?.trim()}
                                  className="w-full bg-primary text-black hover:bg-primaryDim font-bold uppercase tracking-wider text-sm"
                                  data-testid={`submit-answer-${idx}`}
                                >
                                  {submittingFlag === flag.id ? 'Checking...' : 'Submit'}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Flag className="w-12 h-12 text-textMuted mx-auto mb-3" />
                  <p className="text-textMuted font-mono text-sm">No questions added yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
