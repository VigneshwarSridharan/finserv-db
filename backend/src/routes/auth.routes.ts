import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { validate, registerSchema, loginSchema } from '../middleware/validator';

const router = Router();

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validate(registerSchema), register);

/**
 * @route   POST /auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 */
router.post('/login', validate(loginSchema), login);

export default router;

