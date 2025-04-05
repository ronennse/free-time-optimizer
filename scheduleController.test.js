import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server';
import Schedule from '../models/Schedule';
import Activity from '../models/Activity';
import FreeTimeSlot from '../models/FreeTimeSlot';
import User from '../models/User';
import jwt from 'jsonwebtoken';

// Mock environment variables
process.env.JWT_SECRET = 'testsecret';

// Create in-memory MongoDB instance for testing
let mongoServer;
let testUser;
let authToken;
let testActivity;
let testFreeTimeSlot;

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
  
  // Create a test activity
  testActivity = await Activity.create({
    title: 'Morning Yoga',
    type: 'Exercise',
    duration: 30,
    preferredTimeOfDay: 'Morning',
    priority: 'High',
    user: testUser._id,
    tenantId: testUser.tenantId
  });
  
  // Create a test free time slot
  const now = new Date();
  testFreeTimeSlot = await FreeTimeSlot.create({
    start: now,
    end: new Date(now.getTime() + 60 * 60 * 1000),
    duration: 60,
    user: testUser._id,
    tenantId: testUser.tenantId
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear schedules between tests
beforeEach(async () => {
  await Schedule.deleteMany({});
});

describe('Schedule API', () => {
  describe('POST /api/schedules', () => {
    test('should create a new schedule', async () => {
      const scheduleData = {
        activity: testActivity._id,
        freeTimeSlot: testFreeTimeSlot._id,
        start: testFreeTimeSlot.start,
        end: new Date(testFreeTimeSlot.start.getTime() + testActivity.duration * 60 * 1000),
        status: 'scheduled'
      };

      const response = await request(app)
        .post('/api/schedules')
        .set('Authorization', `Bearer ${authToken}`)
        .send(scheduleData)
        .expect(201);

      // Check response structure
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('activity', testActivity._id.toString());
      expect(response.body).toHaveProperty('freeTimeSlot', testFreeTimeSlot._id.toString());
      expect(response.body).toHaveProperty('start');
      expect(response.body).toHaveProperty('end');
      expect(response.body).toHaveProperty('status', 'scheduled');
      expect(response.body).toHaveProperty('user', testUser._id.toString());
      expect(response.body).toHaveProperty('tenantId', testUser.tenantId);

      // Verify schedule was saved to database
      const schedule = await Schedule.findById(response.body._id);
      expect(schedule).toBeTruthy();
      expect(schedule.status).toBe('scheduled');
    });

    test('should not create schedule without authentication', async () => {
      const scheduleData = {
        activity: testActivity._id,
        freeTimeSlot: testFreeTimeSlot._id,
        start: testFreeTimeSlot.start,
        end: new Date(testFreeTimeSlot.start.getTime() + testActivity.duration * 60 * 1000),
        status: 'scheduled'
      };

      const response = await request(app)
        .post('/api/schedules')
        .send(scheduleData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });

    test('should not create schedule with invalid data', async () => {
      // Missing required fields
      const scheduleData = {
        activity: testActivity._id,
        // Missing freeTimeSlot, start, end
        status: 'scheduled'
      };

      const response = await request(app)
        .post('/api/schedules')
        .set('Authorization', `Bearer ${authToken}`)
        .send(scheduleData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/schedules', () => {
    test('should get all schedules for the authenticated user', async () => {
      // Create some test schedules
      await Schedule.create([
        {
          activity: testActivity._id,
          freeTimeSlot: testFreeTimeSlot._id,
          start: testFreeTimeSlot.start,
          end: new Date(testFreeTimeSlot.start.getTime() + testActivity.duration * 60 * 1000),
          status: 'scheduled',
          user: testUser._id,
          tenantId: testUser.tenantId
        },
        {
          activity: testActivity._id,
          freeTimeSlot: testFreeTimeSlot._id,
          start: new Date(testFreeTimeSlot.start.getTime() + 2 * 60 * 60 * 1000),
          end: new Date(testFreeTimeSlot.start.getTime() + 2 * 60 * 60 * 1000 + testActivity.duration * 60 * 1000),
          status: 'completed',
          user: testUser._id,
          tenantId: testUser.tenantId
        }
      ]);

      const response = await request(app)
        .get('/api/schedules')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Check response structure
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('activity');
      expect(response.body[0]).toHaveProperty('freeTimeSlot');
      expect(response.body[0]).toHaveProperty('status');
      expect(response.body[0]).toHaveProperty('user', testUser._id.toString());
    });

    test('should filter schedules by status', async () => {
      // Create some test schedules with different statuses
      await Schedule.create([
        {
          activity: testActivity._id,
          freeTimeSlot: testFreeTimeSlot._id,
          start: testFreeTimeSlot.start,
          end: new Date(testFreeTimeSlot.start.getTime() + testActivity.duration * 60 * 1000),
          status: 'scheduled',
          user: testUser._id,
          tenantId: testUser.tenantId
        },
        {
          activity: testActivity._id,
          freeTimeSlot: testFreeTimeSlot._id,
          start: new Date(testFreeTimeSlot.start.getTime() + 2 * 60 * 60 * 1000),
          end: new Date(testFreeTimeSlot.start.getTime() + 2 * 60 * 60 * 1000 + testActivity.duration * 60 * 1000),
          status: 'completed',
          user: testUser._id,
          tenantId: testUser.tenantId
        }
      ]);

      const response = await request(app)
        .get('/api/schedules?status=completed')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should only return completed schedules
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty('status', 'completed');
    });
  });

  describe('GET /api/schedules/:id', () => {
    test('should get schedule by ID', async () => {
      // Create a test schedule
      const schedule = await Schedule.create({
        activity: testActivity._id,
        freeTimeSlot: testFreeTimeSlot._id,
        start: testFreeTimeSlot.start,
        end: new Date(testFreeTimeSlot.start.getTime() + testActivity.duration * 60 * 1000),
        status: 'scheduled',
        user: testUser._id,
        tenantId: testUser.tenantId
      });

      const response = await request(app)
        .get(`/api/schedules/${schedule._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Check response structure
      expect(response.body).toHaveProperty('_id', schedule._id.toString());
      expect(response.body).toHaveProperty('activity');
      expect(response.body).toHaveProperty('status', schedule.status);
    });
  });

  describe('PUT /api/schedules/:id', () => {
    test('should update schedule status', async () => {
      // Create a test schedule
      const schedule = await Schedule.create({
        activity: testActivity._id,
        freeTimeSlot: testFreeTimeSlot._id,
        start: testFreeTimeSlot.start,
        end: new Date(testFreeTimeSlot.start.getTime() + testActivity.duration * 60 * 1000),
        status: 'scheduled',
        user: testUser._id,
        tenantId: testUser.tenantId
      });

      const updateData = {
        status: 'completed'
      };

      const response = await request(app)
        .put(`/api/schedules/${schedule._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      // Check response structure
      expect(response.body).toHaveProperty('_id', schedule._id.toString());
      expect(response.body).toHaveProperty('status', updateData.status);

      // Verify schedule was updated in database
      const updatedSchedule = await Schedule.findById(schedule._id);
      expect(updatedSchedule.status).toBe(updateData.status);
    });
  });

  describe('DELETE /api/schedules/:id', () => {
    test('should delete schedule', async () => {
      // Create a test schedule
      const schedule = await Schedule.create({
        activity: testActivity._id,
        freeTimeSlot: testFreeTimeSlot._id,
        start: testFreeTimeSlot.start,
        end: new Date(testFreeTimeSlot.start.getTime() + testActivity.duration * 60 * 1000),
        status: 'scheduled',
        user: testUser._id,
        tenantId: testUser.tenantId
      });

      const response = await request(app)
        .delete(`/api/schedules/${schedule._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Schedule removed');

      // Verify schedule was deleted from database
      const deletedSchedule = await Schedule.findById(schedule._id);
      expect(deletedSchedule).toBeNull();
    });
  });
});
