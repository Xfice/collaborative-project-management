import sequelize from '../db/config';
import { setupAssociations } from '../models/associations';

beforeAll(async () => {
  // Set up associations
  setupAssociations();
  
  // Sync database with force true to ensure clean state
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Close database connection
  await sequelize.close();
}); 