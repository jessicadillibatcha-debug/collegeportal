require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');

const app = express();
const userRoutes = require('./routes/user_routes');
app.use(express.json());

app.use('/api/auth', userRoutes);
const userPermissionMiddleware =
  require('./middleware/userPermissionMiddleware');
const authMiddleware = require('./middleware/authMiddleware');


app.get('/', (req, res) => {
  res.json({ message: 'College Portal API is running!' });
});
app.get('/api/test-auth', authMiddleware, (req, res) => {
  res.status(200).json({
    message: 'Authentication successful',
    user: req.user
  });
});

app.get(
  '/api/test-student',
  authMiddleware,
  userPermissionMiddleware('Student', 'Teacher'),
  (req, res) => {
    res.json({
      message: 'Students access granted',
      role: req.user.role
    });
  }
);

app.get(
  '/api/test-teacher',
  authMiddleware,
  userPermissionMiddleware('Teacher'),
  (req, res) => {
    res.json({
      message: 'Teacher access granted',
      role: req.user.role
    });
  }
);


const PORT = process.env.PORT || 2000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();