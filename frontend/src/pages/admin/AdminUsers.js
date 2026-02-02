import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { adminAPI } from '../../utils/api';
import { Button } from '../../components/ui/button';
import { Users, Shield, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateRole(userId, newRole);
      toast.success('User role updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      try {
        await adminAPI.deleteUser(userId);
        toast.success('User deleted');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-primary text-xl font-mono">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="admin-users-page">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-accent mb-2 glow-text" data-testid="admin-users-title">
            USER MANAGEMENT
          </h1>
          <p className="text-textMuted font-mono">Manage user accounts and permissions</p>
        </div>

        <div className="cyber-card rounded-sm overflow-hidden">
          <div className="bg-surface p-4 border-b border-white/10">
            <div className="grid grid-cols-12 gap-4 font-mono text-xs text-textMuted uppercase font-bold">
              <div className="col-span-3">Username</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2 text-center">XP</div>
              <div className="col-span-2 text-center">Role</div>
              <div className="col-span-2 text-center">Actions</div>
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {users.map((user, idx) => (
              <div key={user.id} className="p-4 hover:bg-white/5 transition-colors" data-testid={`user-row-${idx}`}>
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3">
                    <div className="text-textMain font-bold font-mono">{user.username}</div>
                  </div>
                  <div className="col-span-3">
                    <div className="text-textMuted font-mono text-sm">{user.email}</div>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-primary font-bold font-mono">{user.xp}</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="bg-black/50 border border-white/20 text-textMain font-mono text-sm px-2 py-1 rounded-sm"
                      data-testid={`role-select-${idx}`}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="col-span-2 text-center">
                    <Button
                      onClick={() => handleDeleteUser(user.id, user.username)}
                      variant="ghost"
                      size="sm"
                      className="text-accent hover:bg-accent/10"
                      data-testid={`delete-user-${idx}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
