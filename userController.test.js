import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server';
import User from '../models/User';
import jwt from 'jsonwebtoken';

// Mock environment variables
process.env.JWT_SECRET = 'testsecret';

// Create in-memory MongoDB instance for testing
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear database between tests
beforeEach(async () => {
  await User.deleteMany({});
});

describe('User Authentication API', () => {
  describe('POST /api/users', () => {
    test('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      // Check response structure
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', userData.name);
      expect(response.body).toHaveProperty('email', userData.email);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('tenantId');

      // Verify user was saved to database
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.name).toBe(userData.name);
    });

    test('should not register a user with existing email', async () => {
      // Create a user first
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
        tenantId: 'tenant_123'
      });

      // Try to register with the same email
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'User already exists');
    });

    test('should not register a user with invalid data', async () => {
      // Missing required fields
      const userData = {
        name: 'Test User'
        // Missing email and password
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/users/login', () => {
    test('should authenticate a user with valid credentials', async () => {
      // Create a user first
      const password = 'password123';
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: await bcrypt.hash(password, 10),
        tenantId: 'tenant_123'
      });

      const loginData = {
        email: 'test@example.com',
        password: password
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(200);

      // Check response structure
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', user.name);
      expect(response.body).toHaveProperty('email', user.email);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('tenantId', user.tenantId);
    });

    test('should not authenticate a user with invalid credentials', async () => {
      // Create a user first
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        tenantId: 'tenant_123'
      });

      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

  describe('GET /api/users/profile', () => {
    test('should get user profile with valid token', async () => {
      // Create a user
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        tenantId: 'tenant_123'
      });

      // Generate token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
      });

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Check response structure
      expect(response.body).toHaveProperty('_id', user._id.toString());
      expect(response.body).toHaveProperty('name', user.name);
      expect(response.body).toHaveProperty('email', user.email);
      expect(response.body).not.toHaveProperty('password');
    });

    test('should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });

    test('should not get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, token failed');
    });
  });

  describe('PUT /api/users/profile', () => {
    test('should update user profile with valid token', async () => {
      // Create a user
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        tenantId: 'tenant_123'
      });

      // Generate token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
      });

      const updateData = {
        name: 'Updated Name',
        preferences: {
          defaultActivityDuration: 45
        }
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      // Check response structure
      expect(response.body).toHaveProperty('name', updateData.name);
      expect(response.body.preferences).toHaveProperty('defaultActivityDuration', 45);

      // Verify user was updated in database
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.name).toBe(updateData.name);
      expect(updatedUser.preferences.defaultActivityDuration).toBe(45);
    });
  });
});
