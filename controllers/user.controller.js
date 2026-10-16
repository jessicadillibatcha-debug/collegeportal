
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userService = require('../services/userservices');

// STUDENT SIGNUP
const signup = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            department,
            rollNumber
        } = req.body;

        if (
            typeof name !== 'string' || !name.trim() ||
            typeof email !== 'string' || !email.trim() ||
            typeof password !== 'string' || !password ||
            typeof department !== 'string' || !department.trim()
        ) {
            return res.status(400).json({
                message: 'Name, email, password and department are required'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await userService.findUserByEmail(
            normalizedEmail
        );

        if (existingUser) {
            return res.status(409).json({
                message: 'Email already registered'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userService.createUser({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: 'Student',
            department: department.trim(),
            rollNumber:
                typeof rollNumber === 'string'
                    ? rollNumber.trim()
                    : undefined
        });

        return res.status(201).json({
            message: 'Student registered successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                rollNumber: user.rollNumber
            }
        });
    } catch (error) {
        console.error('Signup error:', error.message);

        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Email already registered'
            });
        }

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

// LOGIN - STUDENT OR TEACHER
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            typeof email !== 'string' || !email.trim() ||
            typeof password !== 'string' || !password
        ) {
            return res.status(400).json({
                message: 'Valid email and password are required'
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not configured');

            return res.status(500).json({
                message: 'Server configuration error'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await userService.findUserByEmail(
            normalizedEmail
        );

        if (!user || !user.isActive) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '1d'
            }
        );

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            }
        });
    } catch (error) {
        console.error('Login error:', error.message);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

// CREATE TEACHER
// IMPORTANT: Protect this endpoint before production deployment.
const createTeacher = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            department,
            designation
        } = req.body;

        if (
            typeof name !== 'string' || !name.trim() ||
            typeof email !== 'string' || !email.trim() ||
            typeof password !== 'string' || !password ||
            typeof department !== 'string' || !department.trim() ||
            typeof designation !== 'string' || !designation.trim()
        ) {
            return res.status(400).json({
                message: 'Name, email, password, department and designation are required'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await userService.findUserByEmail(
            normalizedEmail
        );

        if (existingUser) {
            return res.status(409).json({
                message: 'Email already registered'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const teacher = await userService.createUser({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            department: department.trim(),
            designation: designation.trim(),
            role: 'Teacher'
        });

        return res.status(201).json({
            message: 'Teacher created successfully',
            teacher: {
                id: teacher._id,
                name: teacher.name,
                email: teacher.email,
                department: teacher.department,
                designation: teacher.designation,
                role: teacher.role
            }
        });
    } catch (error) {
        console.error('Create teacher error:', error.message);

        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Email already registered'
            });
        }

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

module.exports = {
    signup,
    login,
    createTeacher
};
