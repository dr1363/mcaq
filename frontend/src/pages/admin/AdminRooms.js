import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { roomAPI } from '../../utils/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { BookOpen, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner',
    category: 'General',
    content: '',
    xp_reward: 100,
    has_lab: false,
    docker_image: 'ubuntu:20.04',
    flags: '',
    tasks: ''
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await roomAPI.getAll();
      setRooms(response.data);
    } catch (error) {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      // Parse flags and tasks from comma-separated strings to arrays
      const roomData = {
        ...formData,
        flags: formData.flags ? formData.flags.split(',').map(f => f.trim()).filter(f => f) : [],
        tasks: formData.tasks ? formData.tasks.split('\n').map(t => t.trim()).filter(t => t).map(task => ({ description: task })) : []
      };
      
      if (editingRoom) {
        await roomAPI.update(editingRoom.id, roomData);
        toast.success('Room updated successfully');
      } else {
        await roomAPI.create(roomData);
        toast.success('Room created successfully');
      }
      setIsDialogOpen(false);
      setEditingRoom(null);
      resetForm();
      fetchRooms();
    } catch (error) {
      toast.error('Failed to save room');
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      ...room,
      flags: room.flags ? room.flags.join(', ') : '',
      tasks: room.tasks ? room.tasks.map(t => t.description || t.title || t).join('\n') : ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (roomId, roomTitle) => {
    if (window.confirm(`Are you sure you want to delete room "${roomTitle}"?`)) {
      try {
        await roomAPI.delete(roomId);
        toast.success('Room deleted');
        fetchRooms();
      } catch (error) {
        toast.error('Failed to delete room');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      difficulty: 'Beginner',
      category: 'General',
      content: '',
      xp_reward: 100,
      has_lab: false,
      docker_image: 'ubuntu:20.04',
      flags: [],
      tasks: []
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-primary text-xl font-mono">Loading rooms...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="admin-rooms-page">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-heading font-bold text-accent mb-2 glow-text" data-testid="admin-rooms-title">
              ROOM MANAGEMENT
            </h1>
            <p className="text-textMuted font-mono">Create and manage learning rooms</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => { setEditingRoom(null); resetForm(); }}
                className="bg-accent text-white hover:bg-accent/80 font-bold uppercase tracking-wider"
                data-testid="create-room-button"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Room
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-surface border-white/10">
              <DialogHeader>
                <DialogTitle className="text-2xl font-heading text-primary">
                  {editingRoom ? 'Edit Room' : 'Create New Room'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <Label className="text-textMain font-mono">Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="bg-black/50 border-white/20 text-white"
                    data-testid="room-title-input"
                  />
                </div>
                <div>
                  <Label className="text-textMain font-mono">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="bg-black/50 border-white/20 text-white"
                    data-testid="room-description-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-textMain font-mono">Difficulty</Label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                      className="w-full bg-black/50 border border-white/20 text-white p-2 rounded"
                      data-testid="room-difficulty-select"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-textMain font-mono">XP Reward</Label>
                    <Input
                      type="number"
                      value={formData.xp_reward}
                      onChange={(e) => setFormData({...formData, xp_reward: parseInt(e.target.value)})}
                      className="bg-black/50 border-white/20 text-white"
                      data-testid="room-xp-input"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-textMain font-mono">Content (Markdown)</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="bg-black/50 border-white/20 text-white min-h-[200px]"
                    data-testid="room-content-input"
                  />
                </div>
                <Button 
                  onClick={handleSubmit}
                  className="w-full bg-primary text-black hover:bg-primaryDim font-bold uppercase tracking-wider"
                  data-testid="submit-room-button"
                >
                  {editingRoom ? 'Update Room' : 'Create Room'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room, idx) => (
            <div key={room.id} className="cyber-card p-6 rounded-sm" data-testid={`room-card-${idx}`}>
              <div className="flex items-start justify-between mb-4">
                <BookOpen className="w-8 h-8 text-primary" />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(room)}
                    variant="ghost"
                    size="sm"
                    className="text-secondary hover:bg-secondary/10"
                    data-testid={`edit-room-${idx}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(room.id, room.title)}
                    variant="ghost"
                    size="sm"
                    className="text-accent hover:bg-accent/10"
                    data-testid={`delete-room-${idx}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <h3 className="text-xl font-heading font-bold text-textMain mb-2">{room.title}</h3>
              <p className="text-textMuted text-sm mb-4 line-clamp-2">{room.description}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-mono px-2 py-1 rounded-sm ${
                  room.difficulty === 'Beginner' ? 'bg-primary/20 text-primary' :
                  room.difficulty === 'Intermediate' ? 'bg-secondary/20 text-secondary' :
                  'bg-accent/20 text-accent'
                }`}>
                  {room.difficulty}
                </span>
                <span className="text-xs font-mono text-primary">+{room.xp_reward} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminRooms;
