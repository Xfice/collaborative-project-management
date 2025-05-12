import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Op } from 'sequelize';
import { protect } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import Project from '../models/Project';
import User from '../models/User';
import Task from '../models/Task';

const router = Router();

const projectSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  teamMembers: z.array(z.string().uuid()).optional(),
});

// Get all projects for the authenticated user
router.get('/', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projects = await Project.findAll({
      where: {
        [Op.or]: [
          { ownerId: req.user!.id },
          { '$teamMembers.id$': req.user!.id },
        ],
      },
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: User,
          as: 'teamMembers',
          attributes: ['id', 'name', 'email'],
          through: { attributes: [] },
        },
      ],
    });

    res.json({
      status: 'success',
      data: { projects },
    });
  } catch (error) {
    next(error);
  }
});

// Get a single project
router.get('/:id', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: User,
          as: 'teamMembers',
          attributes: ['id', 'name', 'email'],
          through: { attributes: [] },
        },
        {
          model: Task,
          as: 'tasks',
          include: [
            {
              model: User,
              as: 'assignee',
              attributes: ['id', 'name', 'email'],
            },
          ],
        },
      ],
    });

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // Check if user has access to the project
    const isTeamMember = project.teamMembers?.some((member) => member.id === req.user!.id) ?? false;
    if (project.ownerId !== req.user!.id && !isTeamMember) {
      throw new AppError('You do not have permission to view this project', 403);
    }

    res.json({
      status: 'success',
      data: { project },
    });
  } catch (error) {
    next(error);
  }
});

// Create a new project
router.post('/', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, teamMembers } = projectSchema.parse(req.body);

    // Verify user exists
    const user = await User.findByPk(req.user!.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Create project with verified user
    const project = await Project.create({
      title,
      description,
      ownerId: user.id,
    });

    // Add team members if provided
    if (teamMembers && teamMembers.length > 0) {
      await project.addTeamMembers(teamMembers);
    }

    const projectWithAssociations = await Project.findByPk(project.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: User,
          as: 'teamMembers',
          attributes: ['id', 'name', 'email'],
          through: { attributes: [] },
        },
      ],
    });

    res.status(201).json({
      status: 'success',
      data: { project: projectWithAssociations },
    });
  } catch (error) {
    next(error);
  }
});

// Update a project
router.patch('/:id', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, teamMembers } = projectSchema.parse(req.body);

    const project = await Project.findByPk(req.params.id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (project.ownerId !== req.user!.id) {
      throw new AppError('You do not have permission to update this project', 403);
    }

    await project.update({ title, description });

    if (teamMembers) {
      await project.setTeamMembers(teamMembers);
    }

    const updatedProject = await Project.findByPk(project.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: User,
          as: 'teamMembers',
          attributes: ['id', 'name', 'email'],
          through: { attributes: [] },
        },
      ],
    });

    res.json({
      status: 'success',
      data: { project: updatedProject },
    });
  } catch (error) {
    next(error);
  }
});

// Delete a project
router.delete('/:id', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (project.ownerId !== req.user!.id) {
      throw new AppError('You do not have permission to delete this project', 403);
    }

    await project.destroy();

    res.json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
});

export const projectRouter = router; 