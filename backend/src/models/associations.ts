import Project from './Project';
import Task from './Task';
import User from './User';

export function setupAssociations() {
  // Project associations
  Project.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });
  Project.belongsToMany(User, {
    through: 'ProjectMembers',
    as: 'teamMembers',
    foreignKey: 'projectId',
    otherKey: 'userId',
  });
  Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks' });

  // User associations
  User.belongsToMany(Project, {
    through: 'ProjectMembers',
    as: 'projects',
    foreignKey: 'userId',
    otherKey: 'projectId',
  });

  // Task associations
  Task.belongsTo(Project, { foreignKey: 'projectId' });
  Task.belongsTo(User, { as: 'assignee', foreignKey: 'assignedTo' });
} 