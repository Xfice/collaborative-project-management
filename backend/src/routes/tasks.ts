import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { protect } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import Task, { TaskStatus } from '../models/Task';
import Project from '../models/Project';
import User from '../models/User';

const router = Router();

const taskSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  status: z.nativeEnum(TaskStatus),
  projectId: z.string().uuid(),
  assignedTo: z.string().uuid(),
});

// Get all tasks for a project
router.get('/project/:projectId', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findByPk(req.params.projectId, {
      include: [
        {
          model: User,
          as: 'teamMembers',
          attributes: ['id'],
          through: { attributes: [] },
        },
      ],
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Check if user has access to the project
    const isTeamMember = project.teamMembers?.some((member: { id: string }) => member.id === req.user!.id) ?? false;
    if (project.ownerId !== req.user!.id && !isTeamMember) {
      throw new AppError('You do not have permission to view these tasks', 403);
    }

    const tasks = await Task.findAll({
      where: { projectId: req.params.projectId },
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    res.json({
      status: 'success',
      data: { tasks },
    });
  } catch (error) {
    next(error);
  }
});

// Create a new task
router.post('/', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskData = taskSchema.parse(req.body);

    const project = await Project.findByPk(taskData.projectId, {
      include: [
        {
          model: User,
          as: 'teamMembers',
          attributes: ['id'],
          through: { attributes: [] },
        },
      ],
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Check if user has access to create tasks in the project
    const isTeamMember = project.teamMembers?.some((member: { id: string }) => member.id === req.user!.id) ?? false;
    if (project.ownerId !== req.user!.id && !isTeamMember) {
      throw new AppError('You do not have permission to create tasks in this project', 403);
    }

    const task = await Task.create(taskData);

    const taskWithAssociations = await Task.findByPk(task.id, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    res.status(201).json({
      status: 'success',
      data: { task: taskWithAssociations },
    });
  } catch (error) {
    next(error);
  }
});

// Update a task
router.patch('/:id', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskData = taskSchema.parse(req.body);

    const task = await Task.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          include: [
            {
              model: User,
              as: 'teamMembers',
              attributes: ['id'],
              through: { attributes: [] },
            },
            {
              model: User,
              as: 'owner',
              attributes: ['id'],
            },
          ],
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Check if user has access to update the task
    const project = await Project.findByPk(task.projectId, {
      include: [
        {
          model: User,
          as: 'teamMembers',
          attributes: ['id'],
          through: { attributes: [] },
        },
      ],
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const isTeamMember = project.teamMembers?.some((member: { id: string }) => member.id === req.user!.id) ?? false;
    if (project.ownerId !== req.user!.id && !isTeamMember) {
      throw new AppError('You do not have permission to update this task', 403);
    }

    await task.update(taskData);

    const updatedTask = await Task.findByPk(task.id, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    res.json({
      status: 'success',
      data: { task: updatedTask },
    });
  } catch (error) {
    next(error);
  }
});

// Delete a task
router.delete('/:id', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          include: [
            {
              model: User,
              as: 'teamMembers',
              attributes: ['id'],
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Check if user has access to delete the task
    const project = await Project.findByPk(task.projectId, {
      include: [
        {
          model: User,
          as: 'teamMembers',
          attributes: ['id'],
          through: { attributes: [] },
        },
      ],
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const isTeamMember = project.teamMembers?.some((member: { id: string }) => member.id === req.user!.id) ?? false;
    if (project.ownerId !== req.user!.id && !isTeamMember) {
      throw new AppError('You do not have permission to delete this task', 403);
    }

    await task.destroy();

    res.json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

export const taskRouter = router; 