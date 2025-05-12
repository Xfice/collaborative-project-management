import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Project {
  id: string;
  title: string;
  description: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  teamMembers: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get<{ data: { projects: Project[] } }>('/api/projects');
        setProjects(response.data.data.projects);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Your Projects</h1>
        <Link
          to="/projects/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Create New Project
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {project.description}
              </p>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">Owner:</span>
                  <span className="ml-1">
                    {project.owner.id === user?.id ? 'You' : project.owner.name}
                  </span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span className="font-medium">Team Members:</span>
                  <span className="ml-1">
                    {project.teamMembers.length} member
                    {project.teamMembers.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {projects.length === 0 && !error && (
          <div className="col-span-full text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
            <p className="mt-2 text-sm text-gray-600">
              Create your first project to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 