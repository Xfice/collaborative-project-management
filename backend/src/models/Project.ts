import { Model, DataTypes } from 'sequelize';
import sequelize from '../db/config';
import User from './User';
import type Task from './Task';

interface ProjectAttributes {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  teamMembers?: User[];
  tasks?: Task[];
}

interface ProjectCreationAttributes extends Omit<ProjectAttributes, 'id' | 'teamMembers' | 'tasks'> {}

class Project extends Model<ProjectAttributes, ProjectCreationAttributes> {
  declare id: string;
  declare title: string;
  declare description: string;
  declare ownerId: string;
  declare teamMembers?: User[];
  declare owner?: User;
  declare tasks?: Task[];

  // Explicitly declare association methods
  declare static associations: {
    owner: any;
    teamMembers: any;
    tasks: any;
  };

  declare addTeamMembers: (userIds: string[]) => Promise<void>;
  declare setTeamMembers: (userIds: string[]) => Promise<void>;
  declare removeTeamMembers: (userIds: string[]) => Promise<void>;
  declare getTeamMembers: () => Promise<User[]>;
}

Project.init(
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
    ownerId: {
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
    modelName: 'Project',
    tableName: 'Projects',
  }
);

export default Project; 