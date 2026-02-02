import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { roomAPI, labAPI, flagAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Terminal, Play, Flag, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const RoomDetail = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingLab, setStartingLab] = useState(false);
  const [flag, setFlag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [activeTab, setActiveTab] = useState('flag');

  useEffect(() => {
    if (roomId) {
      fetchRoom();
      fetchQuestions();
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

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/questions/${roomId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQuestions(response.data);
    } catch (error) {
      console.error('Failed to load questions');
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

  const handleSubmitFlag = async () => {
    if (!flag.trim()) return;
    setSubmitting(true);
    try {
      const response = await flagAPI.submit({ room_id: roomId, flag: flag });
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

  const handleAskQuestion = async () => {
    if (!newQuestion.trim()) return;
    setAskingQuestion(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/questions/ask?room_id=${roomId}`,
        { question: newQuestion },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Question posted!');
      setNewQuestion('');
      fetchQuestions();
    } catch (error) {
      toast.error('Failed to post question');
    } finally {
      setAskingQuestion(false);
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
                    {room.lab_type === 'code_editor' ? 'Open Code Editor' :
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
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* Tab Navigation */}
            <div className="cyber-card rounded-sm overflow-hidden">
              <div className="flex border-b border-white/10">
                <button
                  onClick={() => setActiveTab('flag')}
                  className={`flex-1 px-4 py-3 font-mono text-sm font-bold uppercase transition-colors ${
                    activeTab === 'flag' 
                      ? 'bg-primary/20 text-primary border-b-2 border-primary' 
                      : 'text-textMuted hover:bg-white/5'
                  }`}
                  data-testid="tab-flag"
                >
                  <Flag className="w-4 h-4 inline mr-2" />
                  Submit Flag
                </button>
                <button
                  onClick={() => setActiveTab('questions')}
                  className={`flex-1 px-4 py-3 font-mono text-sm font-bold uppercase transition-colors ${
                    activeTab === 'questions' 
                      ? 'bg-secondary/20 text-secondary border-b-2 border-secondary' 
                      : 'text-textMuted hover:bg-white/5'
                  }`}
                  data-testid="tab-questions"
                >
                  <MessageCircle className="w-4 h-4 inline mr-2" />
                  Q&A ({questions.length})
                </button>
              </div>

              {/* Flag Submission Tab */}
              {activeTab === 'flag' && (
                <div className="p-6">
                  <h3 className="text-lg font-heading font-bold text-textMain mb-4 flex items-center gap-2">
                    <Flag className="w-5 h-5 text-primary" />
                    Submit Your Flag
                  </h3>
                  <div className="space-y-4">
                    <Input
                      type="text"
                      value={flag}
                      onChange={(e) => setFlag(e.target.value)}
                      placeholder="FLAG{your_answer_here}"
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
                    <p className="text-xs text-textMuted font-mono">
                      ⚡ Find the flag in the challenge and submit it here
                    </p>
                  </div>
                </div>
              )}

              {/* Questions Tab */}
              {activeTab === 'questions' && (
                <div className="p-6">
                  <h3 className="text-lg font-heading font-bold text-textMain mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-secondary" />
                    Ask Questions
                  </h3>
                  
                  {/* Ask New Question */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
                    <Textarea
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Ask your question about this room..."
                      className="bg-black/50 border-white/20 focus:border-secondary text-white font-mono rounded-none min-h-[80px]"
                      data-testid="question-input"
                    />
                    <Button
                      onClick={handleAskQuestion}
                      disabled={askingQuestion || !newQuestion.trim()}
                      className="w-full bg-secondary text-black hover:bg-secondary/80 font-bold uppercase tracking-wider"
                      data-testid="ask-question-button"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {askingQuestion ? 'Posting...' : 'Post Question'}
                    </Button>
                  </div>

                  {/* Questions List */}
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {questions.length > 0 ? (
                      questions.map((q, idx) => (
                        <div key={q.id} className="bg-white/5 p-4 rounded-sm" data-testid={`question-${idx}`}>
                          <div className="flex items-start gap-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                              {q.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-textMain font-mono text-sm font-bold">{q.username}</span>
                                <span className="text-xs text-textMuted font-mono">
                                  {new Date(q.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-textMuted text-sm">{q.question}</p>
                              
                              {q.reply && (
                                <div className="mt-3 pl-4 border-l-2 border-secondary">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-secondary font-mono text-xs font-bold">Admin Reply:</span>
                                    <span className="text-xs text-textMuted font-mono">{q.replied_by}</span>
                                  </div>
                                  <p className="text-textMain text-sm">{q.reply}</p>
                                </div>
                              )}
                              
                              {!q.reply && (
                                <p className="text-xs text-textMuted font-mono mt-2">⏳ Waiting for admin response...</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-textMuted mx-auto mb-3" />
                        <p className="text-textMuted font-mono text-sm">No questions yet. Be the first to ask!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {tasks.length > 0 && (
              <div className="cyber-card p-6 rounded-sm">
                <h3 className="text-xl font-heading font-bold text-textMain mb-4">Tasks ({tasks.length})</h3>
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
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
