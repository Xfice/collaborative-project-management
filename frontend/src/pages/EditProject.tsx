import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: string;
  name: string;
  email: string;
}

const EditProject = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjectAndUsers = async () => {
      try {
        // Fetch project details
        const projectResponse = await axios.get(`/api/projects/${projectId}`);
        const project = projectResponse.data.data.project;
        
        // Check if user has permission to edit
        if (project.owner.id !== user?.id) {
          navigate(`/projects/${projectId}`);
          return;
        }

        setTitle(project.title);
        setDescription(project.description);
        setSelectedTeamMembers(project.teamMembers.map((member: User) => member.id));

        // Fetch all users for team member selection
        const usersResponse = await axios.get('/api/auth/users');
        setAvailableUsers(usersResponse.data.data.users);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch project details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectAndUsers();
  }, [projectId, user?.id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await axios.patch(`/api/projects/${projectId}`, {
        title,
        description,
        teamMembers: selectedTeamMembers,
      });

      navigate(`/projects/${projectId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update project');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Project</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Team Members
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableUsers.map((availableUser) => (
              <label key={availableUser.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedTeamMembers.includes(availableUser.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTeamMembers([...selectedTeamMembers, availableUser.id]);
                    } else {
                      setSelectedTeamMembers(selectedTeamMembers.filter(id => id !== availableUser.id));
                    }
                  }}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{availableUser.name}</p>
                  <p className="text-sm text-gray-500">{availableUser.email}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(`/projects/${projectId}`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProject; 