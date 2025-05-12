import jwt from 'jsonwebtoken';
import User from '../models/User';

export const createTestUser = async () => {
  const user = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  });

  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1d' }
  );

  return { user, token };
};

export const createAdditionalUser = async (index: number) => {
  const user = await User.create({
    name: `Test User ${index}`,
    email: `test${index}@example.com`,
    password: 'password123',
  });

  return user;
}; 