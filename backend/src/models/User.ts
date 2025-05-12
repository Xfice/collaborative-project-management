import { Model, DataTypes } from 'sequelize';
import sequelize from '../db/config';
import bcrypt from 'bcryptjs';
import type Project from './Project';

interface UserAttributes {
  id: string;
  name: string;
  email: string;
  password: string;
  projects?: Project[];
}

interface UserCreationAttributes extends Omit<UserAttributes, 'id' | 'projects'> {}

class User extends Model<UserAttributes, UserCreationAttributes> {
  declare id: string;
  declare name: string;
  declare email: string;
  declare password: string;
  declare projects?: Project[];

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
} 

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    hooks: {
      beforeCreate: async (user: User) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      },
    },
  }
);

export default User; 