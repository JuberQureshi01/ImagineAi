
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    // Defensive check to ensure the middleware worked as expected
    if (!req.user || !req.user.id) {
      console.error("User ID is missing from token after auth middleware.");
      return res.status(401).json({ msg: "Authentication error: User ID not found in token." });
    }

    const projects = await prisma.project.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(projects);
  } catch (error) {
    console.error("Error in GET /api/projects:", error);
    res.status(500).json({ msg: 'Server error while fetching projects.' });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const project = await prisma.project.findUnique({
            where: { id: req.params.id },
        });

        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        if (project.userId !== req.user.id) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        res.json(project);
    } catch (error) {
        console.error("Error in GET /api/projects/:id :", error);
        res.status(500).json({ msg: 'Server error' });
    }
});


// --- Create a New Project ---
router.post('/', authMiddleware, async (req, res) => {
  const { title, width, height, ...otherArgs } = req.body;
  if (!title || !width || !height) {
    return res.status(400).json({ msg: 'Title, width, and height are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (user.plan === 'free' && user.projectsUsed >= 3) {
      return res.status(402).json({ msg: 'Free plan limited to 3 projects. Please upgrade.' });
    }

    const newProject = await prisma.$transaction(async (tx) => {
      const createdProject = await tx.project.create({
        data: {
          title,
          width,
          height,
          userId: req.user.id,
          ...otherArgs, 
        },
      });

      await tx.user.update({
        where: { id: req.user.id },
        data: {
          projectsUsed: { increment: 1 },
          lastActiveAt: new Date(),
        },
      });

      return createdProject;
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ msg: 'Server error while creating project' });
  }
});

// --- Update a Project ---
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const project = await prisma.project.findUnique({ where: { id: req.params.id } });
        if (!project || project.userId !== req.user.id) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const updatedProject = await prisma.project.update({
            where: { id: req.params.id },
            data: { ...req.body, updatedAt: new Date() },
        });

        await prisma.user.update({
            where: { id: req.user.id },
            data: { lastActiveAt: new Date() }
        });

        res.json(updatedProject);
    } catch (error) {
        console.error("Error updating project:", error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// --- Delete a Project ---
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const project = await prisma.project.findUnique({ where: { id: req.params.id } });
        if (!project || project.userId !== req.user.id) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        await prisma.$transaction(async (tx) => {
            await tx.project.delete({ where: { id: req.params.id } });
            await tx.user.update({
                where: { id: req.user.id },
                data: {
                    projectsUsed: { decrement: 1 },
                    lastActiveAt: new Date(),
                },
            });
        });

        res.json({ success: true, msg: 'Project deleted' });
    } catch (error) {
        console.error("Error deleting project:", error);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;