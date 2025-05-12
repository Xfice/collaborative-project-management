import { Model, DataTypes } from 'sequelize';
import sequelize from '../db/config';
import type Project from './Project';
import User from './User';

export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}

interface TaskAttributes {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  projectId: string;
  assignedTo: string;
  project?: Project;
  assignee?: User;
}

interface TaskCreationAttributes extends Omit<TaskAttributes, 'id' | 'project' | 'assignee'> {}

class Task extends Model<TaskAttributes, TaskCreationAttributes> {
  declare id: string;
  declare title: string;
  declare description: string;
  declare status: TaskStatus;
  declare projectId: string;
  declare assignedTo: string;
  declare project?: Project;
  declare assignee?: User;
}

Task.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TaskStatus)),
      allowNull: false,
      defaultValue: TaskStatus.PENDING,
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Projects',
        key: 'id',
      },
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Task',
    tableName: 'Tasks',
  }
);

export default Task; 