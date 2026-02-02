import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { roomAPI } from '../../utils/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { BookOpen, Plus, Edit, Trash2, Shield, Code, Flag, X } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import axios from 'axios';

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [roomType, setRoomType] = useState('cybersecurity');
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [roomQuestions, setRoomQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({ question: '', correct_answer: '', points: 10 });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner',
    category: 'General',
    content: '',
    xp_reward: 100,
    has_lab: false,
    lab_type: 'terminal',
    docker_image: 'ubuntu:20.04',
    code_language: 'python',
    flags: '',
    tasks: '',
    room_type: 'cybersecurity'
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (currentRoomId) {
      fetchRoomFlags(currentRoomId);
    }
  }, [currentRoomId]);

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

  const fetchRoomFlags = async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/room-flags/${roomId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoomFlags(response.data);
    } catch (error) {
      console.error('Failed to load flags');
    }
  };

  const handleSubmit = async () => {
    try {
      const roomData = {
        ...formData,
        room_type: roomType,
        flags: [],
        tasks: formData.tasks ? formData.tasks.split('\n').map(t => t.trim()).filter(t => t).map(task => ({ description: task })) : [],
        has_lab: roomType === 'programming' ? true : formData.has_lab,
        lab_type: roomType === 'programming' ? 'code_editor' : formData.lab_type
      };
      
      let roomId;
      if (editingRoom) {
        await roomAPI.update(editingRoom.id, roomData);
        roomId = editingRoom.id;
        toast.success('Room updated successfully');
      } else {
        const response = await roomAPI.create(roomData);
        roomId = response.data.id;
        toast.success('Room created successfully');
      }
      
      if (selectedFiles.length > 0 && roomId) {
        await handleFileUpload(roomId);
      }
      
      setIsDialogOpen(false);
      setCurrentRoomId(roomId);
      setEditingRoom(null);
      resetForm();
      fetchRooms();
      
      // Open flags management
      setTimeout(() => {
        toast.success('Now add questions/flags for this room!');
      }, 500);
    } catch (error) {
      toast.error('Failed to save room');
    }
  };

  const handleFileUpload = async (roomId) => {
    if (!selectedFiles.length) return;
    
    setUploadingFiles(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/upload-lab-files?room_id=${roomId}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        }
      );
      
      if (response.ok) {
        toast.success(`Uploaded ${selectedFiles.length} file(s)`);
        setSelectedFiles([]);
      } else {
        toast.error('Failed to upload files');
      }
    } catch (error) {
      toast.error('Error uploading files');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleAddFlag = async () => {
    if (!currentRoomId || !newFlag.question.trim() || !newFlag.correct_answer.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/room-flags/add?room_id=${currentRoomId}`,
        newFlag,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Question added!');
      setNewFlag({ question: '', correct_answer: '', points: 10 });
      fetchRoomFlags(currentRoomId);
    } catch (error) {
      toast.error('Failed to add question');
    }
  };

  const handleDeleteFlag = async (flagId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/room-flags/${flagId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Question deleted');
      fetchRoomFlags(currentRoomId);
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setRoomType(room.room_type || 'cybersecurity');
    setCurrentRoomId(room.id);
    setFormData({
      ...room,
      flags: '',
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
      lab_type: 'terminal',
      docker_image: 'ubuntu:20.04',
      code_language: 'python',
      flags: '',
      tasks: '',
      room_type: 'cybersecurity'
    });
    setSelectedFiles([]);
  };

  const cyberRooms = Array.isArray(rooms) ? rooms.filter(r => r.room_type !== 'programming') : [];
  const progRooms = Array.isArray(rooms) ? rooms.filter(r => r.room_type === 'programming') : [];

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
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-accent mb-2 glow-text">ROOM MANAGEMENT</h1>
          <p className="text-textMuted font-mono">Create rooms and add unlimited questions</p>
        </div>

        <div className="flex gap-4 mb-8">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => { setRoomType('cybersecurity'); setEditingRoom(null); resetForm(); setCurrentRoomId(null); }}
                className="bg-accent text-white hover:bg-accent/80 font-bold uppercase tracking-wider flex-1"
              >
                <Shield className="w-5 h-5 mr-2" />
                Create Cybersecurity Room
              </Button>
            </DialogTrigger>
            <DialogTrigger asChild>
              <Button 
                onClick={() => { setRoomType('programming'); setEditingRoom(null); resetForm(); setCurrentRoomId(null); }}
                className="bg-primary text-black hover:bg-primaryDim font-bold uppercase tracking-wider flex-1"
              >
                <Code className="w-5 h-5 mr-2" />
                Create Programming Challenge
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-4xl bg-surface border-white/10 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-heading" style={{color: roomType === 'programming' ? '#00ff41' : '#ff003c'}}>
                  {editingRoom ? 'Edit Room' : roomType === 'cybersecurity' ? '🛡️ Create Cybersecurity Room' : '💻 Create Programming Challenge'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-textMain font-mono">Title *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="bg-black/50 border-white/20 text-white"
                      placeholder={roomType === 'programming' ? 'Python Loops' : 'SQL Injection Lab'}
                    />
                  </div>
                  <div>
                    <Label className="text-textMain font-mono">XP Reward</Label>
                    <Input
                      type="number"
                      value={formData.xp_reward}
                      onChange={(e) => setFormData({...formData, xp_reward: parseInt(e.target.value) || 100})}
                      className="bg-black/50 border-white/20 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-textMain font-mono">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="bg-black/50 border-white/20 text-white"
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-textMain font-mono">Difficulty</Label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                      className="w-full bg-black/50 border border-white/20 text-white p-2 rounded"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-textMain font-mono">Category</Label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-black/50 border border-white/20 text-white p-2 rounded"
                    >
                      <option>General</option>
                      <option>Web</option>
                      <option>Networking</option>
                      <option>Linux</option>
                      <option>OSINT</option>
                      <option>Cryptography</option>
                      <option>Forensics</option>
                    </select>
                  </div>
                </div>

                {roomType === 'cybersecurity' && (
                  <div className="border border-accent/30 p-4 rounded-sm bg-accent/5">
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={formData.has_lab}
                        onChange={(e) => setFormData({...formData, has_lab: e.target.checked})}
                        className="w-5 h-5"
                        id="has-lab-checkbox"
                      />
                      <Label htmlFor="has-lab-checkbox" className="text-accent font-mono font-bold text-lg cursor-pointer">
                        Enable Interactive Lab
                      </Label>
                    </div>
                    
                    {formData.has_lab && (
                      <div className="space-y-3 mt-4">
                        <div>
                          <Label className="text-textMain font-mono text-sm">Lab Type</Label>
                          <select
                            value={formData.lab_type}
                            onChange={(e) => setFormData({...formData, lab_type: e.target.value})}
                            className="w-full bg-black/50 border border-white/20 text-white p-2 rounded"
                          >
                            <option value="terminal">Terminal (Linux/Network)</option>
                            <option value="web">Web Challenge (SQL/XSS)</option>
                          </select>
                        </div>
                        
                        <div>
                          <Label className="text-textMain font-mono text-sm">Docker Image</Label>
                          <Input
                            value={formData.docker_image}
                            onChange={(e) => setFormData({...formData, docker_image: e.target.value})}
                            className="bg-black/50 border-white/20 text-white font-mono"
                            placeholder="ubuntu:20.04"
                          />
                        </div>
                        
                        <div className="border border-secondary/30 p-3 rounded-sm bg-secondary/5">
                          <Label className="text-secondary font-mono text-sm font-bold mb-2 block">Upload Lab Files 📁</Label>
                          <input
                            type="file"
                            multiple
                            onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                            className="w-full text-sm text-textMuted file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-black hover:file:bg-secondary/80 cursor-pointer"
                          />
                          {selectedFiles.length > 0 && (
                            <p className="text-xs text-secondary font-bold mt-2">Selected: {selectedFiles.length} files</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {roomType === 'programming' && (
                  <div className="border border-primary/30 p-4 rounded-sm bg-primary/5">
                    <Label className="text-primary font-mono font-bold text-lg mb-3 block">💻 Programming Settings</Label>
                    <div>
                      <Label className="text-textMain font-mono text-sm">Language</Label>
                      <select
                        value={formData.code_language}
                        onChange={(e) => setFormData({...formData, code_language: e.target.value})}
                        className="w-full bg-black/50 border border-white/20 text-white p-2 rounded mt-1"
                      >
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="bash">Bash</option>
                      </select>
                    </div>
                  </div>
                )}
                
                <div>
                  <Label className="text-textMain font-mono">Tasks (One per line)</Label>
                  <Textarea
                    value={formData.tasks}
                    onChange={(e) => setFormData({...formData, tasks: e.target.value})}
                    className="bg-black/50 border-white/20 text-white"
                    placeholder="Complete the challenge\nFind vulnerabilities\nCapture the flag"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label className="text-textMain font-mono">Content (Markdown)</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="bg-black/50 border-white/20 text-white font-mono text-sm min-h-[120px]"
                    placeholder="# Challenge\n\nDescription..."
                  />
                </div>
                
                <Button 
                  onClick={handleSubmit}
                  className="w-full font-bold uppercase tracking-wider"
                  style={{backgroundColor: roomType === 'programming' ? '#00ff41' : '#ff003c', color: '#000'}}
                >
                  {editingRoom ? 'Update Room' : 'Create Room'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Flags Management Section */}
        {currentRoomId && (
          <div className="cyber-card p-6 rounded-sm mb-8">
            <h2 className="text-2xl font-heading font-bold text-primary mb-4 flex items-center gap-2">
              <Flag className="w-6 h-6" />
              Manage Questions/Flags for Room
            </h2>
            
            {/* Add New Flag */}
            <div className="bg-primary/5 border border-primary/30 p-4 rounded-sm mb-4">
              <h3 className="text-lg font-mono font-bold text-primary mb-3">Add New Question</h3>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label className="text-textMain font-mono text-sm">Question *</Label>
                  <Input
                    value={newFlag.question}
                    onChange={(e) => setNewFlag({...newFlag, question: e.target.value})}
                    className="bg-black/50 border-white/20 text-white"
                    placeholder="What is the root flag?"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <Label className="text-textMain font-mono text-sm">Correct Answer *</Label>
                    <Input
                      value={newFlag.correct_answer}
                      onChange={(e) => setNewFlag({...newFlag, correct_answer: e.target.value})}
                      className="bg-black/50 border-white/20 text-white font-mono"
                      placeholder="FLAG{answer} or text answer"
                    />
                  </div>
                  <div>
                    <Label className="text-textMain font-mono text-sm">Points</Label>
                    <Input
                      type="number"
                      value={newFlag.points}
                      onChange={(e) => setNewFlag({...newFlag, points: parseInt(e.target.value) || 10})}
                      className="bg-black/50 border-white/20 text-white"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddFlag}
                  className="bg-primary text-black hover:bg-primaryDim font-bold uppercase"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </div>

            {/* Existing Flags List */}
            <div className="space-y-2">
              <h3 className="text-lg font-mono font-bold text-textMain mb-3">Questions List ({roomFlags.length})</h3>
              {roomFlags.length > 0 ? (
                roomFlags.map((flag, idx) => (
                  <div key={flag.id} className="bg-white/5 p-4 rounded-sm flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-primary font-mono font-bold">{idx + 1}.</span>
                        <div className="flex-1">
                          <p className="text-textMain font-mono text-sm mb-1">{flag.question}</p>
                          <p className="text-xs text-textMuted font-mono">Answer: {flag.correct_answer}</p>
                          <p className="text-xs text-primary font-mono">Points: {flag.points}</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDeleteFlag(flag.id)}
                      variant="ghost"
                      size="sm"
                      className="text-accent hover:bg-accent/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-textMuted font-mono text-sm text-center py-4">No questions added yet</p>
              )}
            </div>
            
            <Button
              onClick={() => setCurrentRoomId(null)}
              variant="outline"
              className="w-full mt-4 border-white/20 text-textMuted hover:bg-white/5"
            >
              Close
            </Button>
          </div>
        )}

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-heading font-bold text-accent mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Cybersecurity Rooms ({cyberRooms.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cyberRooms.map((room) => (
                <div key={room.id} className="cyber-card p-6 rounded-sm">
                  <div className="flex items-start justify-between mb-4">
                    <BookOpen className="w-8 h-8 text-accent" />
                    <div className="flex gap-2">
                      <Button onClick={() => { setCurrentRoomId(room.id); handleEdit(room); }} variant="ghost" size="sm" className="text-secondary hover:bg-secondary/10">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => setCurrentRoomId(room.id)} variant="ghost" size="sm" className="text-primary hover:bg-primary/10" title="Manage Questions">
                        <Flag className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => handleDelete(room.id, room.title)} variant="ghost" size="sm" className="text-accent hover:bg-accent/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="text-xl font-heading font-bold text-textMain mb-2">{room.title}</h3>
                  <p className="text-textMuted text-sm mb-4 line-clamp-2">{room.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono px-2 py-1 rounded-sm bg-accent/20 text-accent">{room.difficulty}</span>
                    <span className="text-xs font-mono text-primary">+{room.xp_reward} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-heading font-bold text-primary mb-4 flex items-center gap-2">
              <Code className="w-6 h-6" />
              Programming Challenges ({progRooms.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {progRooms.map((room) => (
                <div key={room.id} className="cyber-card p-6 rounded-sm border-primary/30">
                  <div className="flex items-start justify-between mb-4">
                    <Code className="w-8 h-8 text-primary" />
                    <div className="flex gap-2">
                      <Button onClick={() => { setCurrentRoomId(room.id); handleEdit(room); }} variant="ghost" size="sm" className="text-secondary hover:bg-secondary/10">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => setCurrentRoomId(room.id)} variant="ghost" size="sm" className="text-primary hover:bg-primary/10" title="Manage Questions">
                        <Flag className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => handleDelete(room.id, room.title)} variant="ghost" size="sm" className="text-accent hover:bg-accent/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="text-xl font-heading font-bold text-textMain mb-2">{room.title}</h3>
                  <p className="text-textMuted text-sm mb-4 line-clamp-2">{room.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono px-2 py-1 rounded-sm bg-primary/20 text-primary">{room.difficulty}</span>
                    <span className="text-xs font-mono text-primary">+{room.xp_reward} XP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRooms;
