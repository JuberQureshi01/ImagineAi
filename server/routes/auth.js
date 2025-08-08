
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth'); 

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body; 
  if (!email || !password || !name) {
    return res.status(400).json({ msg: 'Please enter name, email, and password' });
  }
  if (password.length < 6) {
    return res.status(400).json({ msg: 'Password must be at least 6 characters' });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name,
        passwordHash: passwordHash,
      },
    });

    const payload = {
      user: {
        id: newUser.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '30d' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          token,
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name, 
          },
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error during registration');
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '30d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            plan: user.plan,
          },
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error during login');
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        imageUrl: true,
        plan: true,
        projectsUsed: true,
        exportsThisMonth: true,
      },
    });

    if (!user) {
      return res.status(404).json({ msg: 'User not found.' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
