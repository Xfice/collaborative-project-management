import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { TaskStatus } from '../types/task';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignee: User;
}

interface Project {
  id: string;
  title: string;
  description: string;
  owner: User;
  teamMembers: User[];
  tasks: Task[];
}

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get<{ data: { project: Project } }>(
          `/api/projects/${projectId}`
        );
        setProject(response.data.data.project);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch project details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

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
        <p className="mt-2 text-sm text-gray-600">
          The project you're looking for doesn't exist or you don't have access to it.
        </p>
      </div>
    );
  }

  const isOwner = project.owner.id === user?.id;
  const isTeamMember = project.teamMembers.some((member) => member.id === user?.id);

  if (!isOwner && !isTeamMember) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Access Denied</h3>
        <p className="mt-2 text-sm text-gray-600">
          You don't have permission to view this project.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{project.title}</h1>
          <p className="mt-2 text-gray-600">{project.description}</p>
        </div>
        {isOwner && (
          <div className="flex space-x-3">
            <Link
              to={`/projects/${project.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Edit Project
            </Link>
          </div>
        )}
      </div>

      {/* Team Members Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Team Members</h2>
          {isOwner && (
            <Link
              to={`/projects/${project.id}/team`}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Manage Team
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {project.owner.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{project.owner.name}</p>
              <p className="text-xs text-gray-500">{project.owner.email}</p>
              <p className="text-xs font-medium text-primary-600">Owner</p>
            </div>
          </div>
          {project.teamMembers.map((member) => (
            <div key={member.id} className="flex items-center space-x-3 p-3 border rounded-lg">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 font-medium text-sm">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{member.name}</p>
                <p className="text-xs text-gray-500">{member.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
          <Link
            to={`/projects/${project.id}/tasks/new`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Add Task
          </Link>
        </div>
        {project.tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No tasks yet. Create one to get started!</p>
        ) : (
          <div className="space-y-4">
            {project.tasks.map((task) => (
              <div
                key={task.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.status === TaskStatus.COMPLETED
                        ? 'bg-green-100 text-green-800'
                        : task.status === TaskStatus.IN_PROGRESS
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span>Assigned to: {task.assignee.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails; 