import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { roadmapAPI, roomAPI } from '../utils/api';
import { Button } from '../components/ui/button';
import { BookOpen, Target } from 'lucide-react';
import { toast } from 'sonner';

const RoadmapsPage = () => {
  const [searchParams] = useSearchParams();
  const [roadmaps, setRoadmaps] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  useEffect(() => {
    const roadmapId = searchParams.get('roadmap');
    if (roadmapId && roadmaps.length > 0) {
      const roadmap = roadmaps.find(r => r.id === roadmapId);
      if (roadmap) {
        setSelectedRoadmap(roadmap);
        fetchRooms(roadmapId);
      }
    }
  }, [searchParams, roadmaps]);

  const fetchRoadmaps = async () => {
    try {
      const response = await roadmapAPI.getAll();
      setRoadmaps(response.data);
    } catch (error) {
      toast.error('Failed to load roadmaps');
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async (roadmapId) => {
    try {
      const response = await roomAPI.getAll({ roadmap_id: roadmapId });
      setRooms(response.data);
    } catch (error) {
      toast.error('Failed to load rooms');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-primary text-xl font-mono">Loading roadmaps...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="roadmaps-page">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <h1 className="text-4xl font-heading font-bold text-primary mb-2 glow-text" data-testid="roadmaps-title">
            LEARNING ROADMAPS
          </h1>
          <p className="text-textMuted font-mono">Structured paths from beginner to expert</p>
        </div>

        {!selectedRoadmap ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roadmaps.map((roadmap, idx) => (
              <Link 
                key={roadmap.id} 
                to={`/roadmaps?roadmap=${roadmap.id}`}
                data-testid={`roadmap-${idx}`}
              >
                <div className="cyber-card p-8 rounded-sm hover:border-primary/50 transition-all h-full">
                  <div className="text-5xl mb-4">{roadmap.icon || '🎯'}</div>
                  <h3 className="text-2xl font-heading font-bold text-textMain mb-3">{roadmap.title}</h3>
                  <p className="text-textMuted mb-6 leading-relaxed">{roadmap.description}</p>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-mono px-3 py-1 rounded-sm font-bold ${
                      roadmap.difficulty === 'Beginner' ? 'bg-primary/20 text-primary' :
                      roadmap.difficulty === 'Intermediate' ? 'bg-secondary/20 text-secondary' :
                      'bg-accent/20 text-accent'
                    }`}>
                      {roadmap.difficulty}
                    </span>
                    <span className="text-sm font-mono text-textMuted">
                      {roadmap.rooms?.length || 0} rooms
                    </span>
                  </div>
                  <Button className="w-full mt-6 bg-primary text-black hover:bg-primaryDim font-bold uppercase tracking-wider">
                    Start Learning
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <Link to="/roadmaps">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 mb-4" data-testid="back-to-roadmaps">
                  ← All Roadmaps
                </Button>
              </Link>
              <div className="cyber-card p-8 rounded-sm">
                <div className="flex items-start gap-6">
                  <div className="text-6xl">{selectedRoadmap.icon || '🎯'}</div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-heading font-bold text-primary mb-3 glow-text">
                      {selectedRoadmap.title}
                    </h2>
                    <p className="text-textMuted mb-4 leading-relaxed">{selectedRoadmap.description}</p>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-mono px-3 py-1 rounded-sm font-bold ${
                        selectedRoadmap.difficulty === 'Beginner' ? 'bg-primary/20 text-primary' :
                        selectedRoadmap.difficulty === 'Intermediate' ? 'bg-secondary/20 text-secondary' :
                        'bg-accent/20 text-accent'
                      }`}>
                        {selectedRoadmap.difficulty}
                      </span>
                      <span className="text-sm font-mono text-textMuted">
                        {rooms.length} rooms in this roadmap
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.length > 0 ? (
                rooms.map((room, idx) => (
                  <Link key={room.id} to={`/rooms/${room.id}`} data-testid={`room-${idx}`}>
                    <div className="cyber-card p-6 rounded-sm hover:border-primary/50 transition-all h-full">
                      <div className="flex items-start justify-between mb-4">
                        <BookOpen className="w-8 h-8 text-primary" />
                        {room.has_lab && <Target className="w-6 h-6 text-secondary" />}
                      </div>
                      <h3 className="text-xl font-heading font-bold text-textMain mb-2">{room.title}</h3>
                      <p className="text-textMuted text-sm mb-4 line-clamp-3">{room.description}</p>
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
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-textMuted font-mono">No rooms available in this roadmap yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapsPage;
