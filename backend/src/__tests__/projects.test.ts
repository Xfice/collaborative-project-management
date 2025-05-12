import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { createTestUser, createAdditionalUser } from './utils';
import { authRouter } from '../routes/auth';
import { projectRouter } from '../routes/projects';
import { errorHandler } from '../middleware/errorHandler';
import Project from '../models/Project';

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use(errorHandler);

describe('Project Routes', () => {
  let testUser: any;
  let token: string;
  let projectId: string;

  beforeEach(async () => {
    // Create a test user and get token
    const result = await createTestUser();
    testUser = result.user;
    token = result.token;
  });

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const projectData = {
        title: 'Test Project',
        description: 'This is a test project',
        teamMembers: [],
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(projectData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.project.title).toBe(projectData.title);
      expect(response.body.data.project.description).toBe(projectData.description);
      expect(response.body.data.project.ownerId).toBe(testUser.id);

      projectId = response.body.data.project.id;
    });

    it('should not create a project without authentication', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({
          title: 'Test Project',
          description: 'This is a test project',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/projects', () => {
    it('should get all projects for the authenticated user', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data.projects)).toBe(true);
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should get a specific project', async () => {
      // First create a project
      const project = await Project.create({
        title: 'Test Project',
        description: 'This is a test project',
        ownerId: testUser.id,
      });

      const response = await request(app)
        .get(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.project.id).toBe(project.id);
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/projects/non-existent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/projects/:id', () => {
    it('should update a project', async () => {
      // First create a project
      const project = await Project.create({
        title: 'Test Project',
        description: 'This is a test project',
        ownerId: testUser.id,
      });

      // Create some team members
      const teamMember1 = await createAdditionalUser(1);
      const teamMember2 = await createAdditionalUser(2);

      const updateData = {
        title: 'Updated Project',
        description: 'This is an updated project',
        teamMembers: [teamMember1.id, teamMember2.id],
      };

      const response = await request(app)
        .patch(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.project.title).toBe(updateData.title);
      expect(response.body.data.project.description).toBe(updateData.description);
      expect(response.body.data.project.teamMembers).toHaveLength(2);
    });

    it('should not allow non-owner to update project', async () => {
      // Create a project
      const project = await Project.create({
        title: 'Test Project',
        description: 'This is a test project',
        ownerId: testUser.id,
      });

      // Create another user
      const anotherUser = await createAdditionalUser(3);
      const anotherToken = jwt.sign(
        { id: anotherUser.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
      );

      const response = await request(app)
        .patch(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${anotherToken}`)
        .send({
          title: 'Updated Project',
          description: 'This is an updated project',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete a project', async () => {
      // First create a project
      const project = await Project.create({
        title: 'Test Project',
        description: 'This is a test project',
        ownerId: testUser.id,
      });

      const response = await request(app)
        .delete(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');

      // Verify project is deleted
      const deletedProject = await Project.findByPk(project.id);
      expect(deletedProject).toBeNull();
    });

    it('should not allow non-owner to delete project', async () => {
      // Create a project
      const project = await Project.create({
        title: 'Test Project',
        description: 'This is a test project',
        ownerId: testUser.id,
      });

      // Create another user
      const anotherUser = await createAdditionalUser(4);
      const anotherToken = jwt.sign(
        { id: anotherUser.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
      );

      const response = await request(app)
        .delete(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${anotherToken}`);

      expect(response.status).toBe(403);
    });
  });
}); 