import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../config/database';
import { users } from '../db/schema';
import { generateToken } from '../utils/jwt';
import { ApiError } from '../middleware/errorHandler';
import { UserCreateDTO, UserLoginDTO, AuthResponse } from '../types';

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 *       500:
 *         description: Server error
 */
export async function register(req: Request, res: Response) {
  try {
    const userData: UserCreateDTO = req.body;

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new ApiError(400, 'User with this email already exists');
    }

    // Check if username is taken
    const existingUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, userData.username))
      .limit(1);

    if (existingUsername.length > 0) {
      throw new ApiError(400, 'Username already taken');
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(userData.password, saltRounds);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        username: userData.username,
        email: userData.email,
        password_hash,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        date_of_birth: userData.date_of_birth
      })
      .returning();

    // Generate JWT token
    const token = generateToken(
      newUser[0].user_id,
      newUser[0].email,
      newUser[0].username
    );

    // Prepare response
    const response: AuthResponse = {
      user: {
        user_id: newUser[0].user_id,
        username: newUser[0].username,
        email: newUser[0].email,
        first_name: newUser[0].first_name,
        last_name: newUser[0].last_name
      },
      token
    };

    res.status(201).json({
      success: true,
      data: response,
      message: 'User registered successfully'
    });
  } catch (error) {
    throw error;
  }
}

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password }: UserLoginDTO = req.body;

    // Find user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Check if user is active
    if (!user[0].is_active) {
      throw new ApiError(401, 'Account is inactive. Please contact support');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user[0].password_hash);

    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid email or password');
    }

    // Generate JWT token
    const token = generateToken(
      user[0].user_id,
      user[0].email,
      user[0].username
    );

    // Prepare response
    const response: AuthResponse = {
      user: {
        user_id: user[0].user_id,
        username: user[0].username,
        email: user[0].email,
        first_name: user[0].first_name,
        last_name: user[0].last_name
      },
      token
    };

    res.status(200).json({
      success: true,
      data: response,
      message: 'Login successful'
    });
  } catch (error) {
    throw error;
  }
}

