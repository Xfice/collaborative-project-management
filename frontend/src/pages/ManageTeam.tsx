import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  owner: User;
  teamMembers: User[];
}

const ManageTeam = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [initialTeamMembers, setInitialTeamMembers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch project details
        const projectResponse = await axios.get<{ data: { project: Project } }>(
          `/api/projects/${projectId}`
        );
        const project = projectResponse.data.data.project;
        setProject(project);

        // Only allow project owner to manage team
        if (project.owner.id !== user?.id) {
          navigate(`/projects/${projectId}`);
          return;
        }

        // Initialize selected users with current team members
        const initialSelected = new Set(project.teamMembers.map(member => member.id));
        setSelectedUsers(initialSelected);
        setInitialTeamMembers(new Set(initialSelected)); // Store initial state for comparison

        // Fetch all available users
        const usersResponse = await axios.get<{ data: { users: User[] } }>('/api/auth/users');
        // Filter out the owner and sort by name
        const filteredUsers = usersResponse.data.data.users
          .sort((a, b) => a.name.localeCompare(b.name));
        setAvailableUsers(filteredUsers);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId, user, navigate]);

  const handleUserToggle = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.patch(`/api/projects/${projectId}`, {
        title: project?.title,
        description: project?.description,
        teamMembers: Array.from(selectedUsers)
      });
      navigate(`/projects/${projectId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update team members');
    }
  };

  // Check if there are any changes
  const hasChanges = () => {
    if (selectedUsers.size !== initialTeamMembers.size) return true;
    return Array.from(selectedUsers).some(id => !initialTeamMembers.has(id)) ||
           Array.from(initialTeamMembers).some(id => !selectedUsers.has(id));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Project not found</h3>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Manage Team Members</h1>
          <p className="mt-2 text-gray-600">
            Select team members for {project.title}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {availableUsers.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No users available to add to the team.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  {selectedUsers.size} member{selectedUsers.size !== 1 ? 's' : ''} selected
                </p>
                <button
                  type="button"
                  onClick={() => setSelectedUsers(new Set())}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear all
                </button>
              </div>
              {availableUsers.map((availableUser) => (
                <div
                  key={availableUser.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium text-sm">
                          {availableUser.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{availableUser.name}</p>
                      <p className="text-sm text-gray-500">{availableUser.email}</p>
                    </div>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(availableUser.id)}
                      onChange={() => handleUserToggle(availableUser.id)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(`/projects/${projectId}`)}
              className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!hasChanges()}
              className={`px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white 
                ${hasChanges() 
                  ? 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                  : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageTeam; 