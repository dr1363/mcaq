import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { labAPI, roomAPI, flagAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Square, Globe, Flag, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const WebLabPage = () => {
  const { sessionId } = useParams();
  const [room, setRoom] = useState(null);
  const [flag, setFlag] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [webAppUrl, setWebAppUrl] = useState('');

  useEffect(() => {
    fetchLabInfo();
  }, [sessionId]);

  const fetchLabInfo = async () => {
    try {
      // Get session info to find room
      const rooms = await roomAPI.getAll();
      // For demo, use first web room
      const webRoom = rooms.data.find(r => r.lab_type === 'web');
      if (webRoom) {
        setRoom(webRoom);
        setWebAppUrl(webRoom.web_app_url || 'about:blank');
      }
    } catch (error) {
      console.error('Error fetching lab info:', error);
    }
  };

  const handleStopLab = async () => {
    try {
      await labAPI.stop(sessionId);
      toast.success('Lab stopped');
      window.location.href = '/dashboard';
    } catch (error) {
      toast.error('Failed to stop lab');
    }
  };

  const handleSubmitFlag = async () => {
    if (!flag.trim() || !room) return;
    setSubmitting(true);
    try {
      const response = await flagAPI.submit({ room_id: room.id, flag: flag });
      if (response.data.correct) {
        toast.success(response.data.message);
        if (response.data.xp_earned) {
          toast.success(`+${response.data.xp_earned} XP earned!`);
        }
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

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="web-lab-page">
      <Navbar />
      
      <div className="flex-1 flex flex-col">
        <div className="border-b border-white/10 bg-surface/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6 text-secondary" />
                <div>
                  <h2 className="text-xl font-heading font-bold text-secondary">Web Challenge Lab</h2>
                  <p className="text-xs font-mono text-textMuted">
                    {room ? room.title : 'Loading...'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-accent/10 px-3 py-2 rounded-sm">
                  <AlertTriangle className="w-4 h-4 text-accent" />
                  <span className="text-xs font-mono text-accent">Vulnerable App - Practice Only</span>
                </div>
                <Button
                  onClick={handleStopLab}
                  variant="outline"
                  className="border-accent text-accent hover:bg-accent/10 font-bold uppercase tracking-wider"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop Lab
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
          <div className="lg:col-span-3">
            <div className="cyber-card h-full rounded-sm overflow-hidden">
              <div className="bg-black/50 p-2 border-b border-white/10 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="ml-2 text-xs font-mono text-textMuted">Vulnerable Web Application</span>
              </div>
              <div className="h-[calc(100vh-250px)] bg-white">
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-8">
                  <div className="text-center max-w-2xl">
                    <Globe className="w-24 h-24 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Vulnerable Web Application</h3>
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                      <p className="text-gray-600 mb-4">
                        This is a simulated vulnerable web application for security testing.
                      </p>
                      <div className="text-left space-y-3">
                        <div className="border-l-4 border-blue-500 pl-4">
                          <p className="font-semibold text-gray-800">SQL Injection Test:</p>
                          <code className="text-sm bg-gray-100 p-2 block rounded mt-2">
                            ' OR '1'='1
                          </code>
                        </div>
                        <div className="border-l-4 border-green-500 pl-4">
                          <p className="font-semibold text-gray-800">XSS Test:</p>
                          <code className="text-sm bg-gray-100 p-2 block rounded mt-2">
                            &lt;script&gt;alert('XSS')&lt;/script&gt;
                          </code>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      <strong>Note:</strong> In production, this would load a real vulnerable Docker container.
                      <br />Current: Simulated interface showing exploit examples.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="cyber-card p-4 rounded-sm mb-4">
              <h3 className="text-lg font-heading font-bold text-textMain mb-3 flex items-center gap-2">
                <Flag className="w-5 h-5 text-primary" />
                Submit Flag
              </h3>
              <Input
                type="text"
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                placeholder="FLAG{...}"
                className="bg-black/50 border-white/20 focus:border-primary text-white font-mono rounded-none mb-3"
              />
              <Button
                onClick={handleSubmitFlag}
                disabled={submitting || !flag.trim()}
                className="w-full bg-primary text-black hover:bg-primaryDim font-bold uppercase tracking-wider"
              >
                {submitting ? 'Submitting...' : 'Submit Flag'}
              </Button>
            </div>

            <div className="cyber-card p-4 rounded-sm">
              <h3 className="text-lg font-heading font-bold text-textMain mb-3">Tasks</h3>
              <div className="space-y-2 text-sm text-textMuted">
                {room?.tasks?.map((task, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-primary">{idx + 1}.</span>
                    <span>{task.description || task}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebLabPage;
