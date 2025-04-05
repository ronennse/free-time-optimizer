import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server';
import FreeTimeSlot from '../models/FreeTimeSlot';
import User from '../models/User';
import jwt from 'jsonwebtoken';

// Mock environment variables
process.env.JWT_SECRET = 'testsecret';

// Create in-memory MongoDB instance for testing
let mongoServer;
let testUser;
let authToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  
  // Create a test user
  testUser = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    tenantId: 'tenant_123'
  });
  
  // Generate token for authentication
  authToken = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear free time slots between tests
beforeEach(async () => {
  await FreeTimeSlot.deleteMany({});
});

describe('Free Time API', () => {
  describe('POST /api/freetime', () => {
    test('should create a new free time slot', async () => {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      
      const freeTimeData = {
        start: now.toISOString(),
        end: oneHourLater.toISOString(),
        duration: 60
      };

      const response = await request(app)
        .post('/api/freetime')
        .set('Authorization', `Bearer ${authToken}`)
        .send(freeTimeData)
        .expect(201);

      // Check response structure
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('start');
      expect(response.body).toHaveProperty('end');
      expect(response.body).toHaveProperty('duration', freeTimeData.duration);
      expect(response.body).toHaveProperty('user', testUser._id.toString());
      expect(response.body).toHaveProperty('tenantId', testUser.tenantId);

      // Verify free time slot was saved to database
      const freeTimeSlot = await FreeTimeSlot.findById(response.body._id);
      expect(freeTimeSlot).toBeTruthy();
      expect(freeTimeSlot.duration).toBe(freeTimeData.duration);
    });

    test('should not create free time slot without authentication', async () => {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      
      const freeTimeData = {
        start: now.toISOString(),
        end: oneHourLater.toISOString(),
        duration: 60
      };

      const response = await request(app)
        .post('/api/freetime')
        .send(freeTimeData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });

    test('should not create free time slot with invalid data', async () => {
      // End time before start time
      const now = new Date();
      const oneHourEarlier = new Date(now.getTime() - 60 * 60 * 1000);
      
      const freeTimeData = {
        start: now.toISOString(),
        end: oneHourEarlier.toISOString(),
        duration: 60
      };

      const response = await request(app)
        .post('/api/freetime')
        .set('Authorization', `Bearer ${authToken}`)
        .send(freeTimeData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/freetime', () => {
    test('should get all free time slots for the authenticated user', async () => {
      const now = new Date();
      
      // Create some test free time slots
      await FreeTimeSlot.create([
        {
          start: now,
          end: new Date(now.getTime() + 60 * 60 * 1000),
          duration: 60,
          user: testUser._id,
          tenantId: testUser.tenantId
        },
        {
          start: new Date(now.getTime() + 2 * 60 * 60 * 1000),
          end: new Date(now.getTime() + 3 * 60 * 60 * 1000),
          duration: 60,
          user: testUser._id,
          tenantId: testUser.tenantId
        }
      ]);

      const response = await request(app)
        .get('/api/freetime')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Check response structure
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('start');
      expect(response.body[0]).toHaveProperty('end');
      expect(response.body[0]).toHaveProperty('duration');
      expect(response.body[0]).toHaveProperty('user', testUser._id.toString());
    });

    test('should only return free time slots for the authenticated user', async () => {
      const now = new Date();
      
      // Create a different user
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123',
        tenantId: 'tenant_456'
      });

      // Create free time slots for both users
      await FreeTimeSlot.create([
        {
          start: now,
          end: new Date(now.getTime() + 60 * 60 * 1000),
          duration: 60,
          user: testUser._id,
          tenantId: testUser.tenantId
        },
        {
          start: new Date(now.getTime() + 2 * 60 * 60 * 1000),
          end: new Date(now.getTime() + 3 * 60 * 60 * 1000),
          duration: 60,
          user: otherUser._id,
          tenantId: otherUser.tenantId
        }
      ]);

      const response = await request(app)
        .get('/api/freetime')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should only return free time slots for testUser
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty('user', testUser._id.toString());
    });
  });

  describe('GET /api/freetime/:id', () => {
    test('should get free time slot by ID', async () => {
      const now = new Date();
      
      // Create a test free time slot
      const freeTimeSlot = await FreeTimeSlot.create({
        start: now,
        end: new Date(now.getTime() + 60 * 60 * 1000),
        duration: 60,
        user: testUser._id,
        tenantId: testUser.tenantId
      });

      const response = await request(app)
        .get(`/api/freetime/${freeTimeSlot._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Check response structure
      expect(response.body).toHaveProperty('_id', freeTimeSlot._id.toString());
      expect(response.body).toHaveProperty('duration', freeTimeSlot.duration);
      expect(response.body).toHaveProperty('user', testUser._id.toString());
    });

    test('should not get free time slot that belongs to another user', async () => {
      const now = new Date();
      
      // Create a different user
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123',
        tenantId: 'tenant_456'
      });

      // Create free time slot for other user
      const freeTimeSlot = await FreeTimeSlot.create({
        start: now,
        end: new Date(now.getTime() + 60 * 60 * 1000),
        duration: 60,
        user: otherUser._id,
        tenantId: otherUser.tenantId
      });

      const response = await request(app)
        .get(`/api/freetime/${freeTimeSlot._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Free time slot not found');
    });
  });

  describe('DELETE /api/freetime/:id', () => {
    test('should delete free time slot', async () => {
      const now = new Date();
      
      // Create a test free time slot
      const freeTimeSlot = await FreeTimeSlot.create({
        start: now,
        end: new Date(now.getTime() + 60 * 60 * 1000),
        duration: 60,
        user: testUser._id,
        tenantId: testUser.tenantId
      });

      const response = await request(app)
        .delete(`/api/freetime/${freeTimeSlot._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Free time slot removed');

      // Verify free time slot was deleted from database
      const deletedFreeTimeSlot = await FreeTimeSlot.findById(freeTimeSlot._id);
      expect(deletedFreeTimeSlot).toBeNull();
    });
  });
});
