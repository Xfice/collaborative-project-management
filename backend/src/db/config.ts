import { Sequelize } from 'sequelize';

class Database {
  private static instance: Database;
  public sequelize: Sequelize;

  private constructor() {
    this.sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: false,
      define: {
        freezeTableName: true
      }
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const db = Database.getInstance();

export function getSequelize() {
  return db.sequelize;
}

export function initializeDatabase() {
  return db.sequelize.sync();
}

export default db.sequelize; 