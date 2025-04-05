import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server';
import Activity from '../models/Activity';
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

// Clear activities between tests
beforeEach(async () => {
  await Activity.deleteMany({});
});

describe('Activity API', () => {
  describe('POST /api/activities', () => {
    test('should create a new activity', async () => {
      const activityData = {
        title: 'Morning Yoga',
        type: 'Exercise',
        duration: 30,
        preferredTimeOfDay: 'Morning',
        priority: 'High'
      };

      const response = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send(activityData)
        .expect(201);

      // Check response structure
      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('title', activityData.title);
      expect(response.body).toHaveProperty('type', activityData.type);
      expect(response.body).toHaveProperty('duration', activityData.duration);
      expect(response.body).toHaveProperty('user', testUser._id.toString());
      expect(response.body).toHaveProperty('tenantId', testUser.tenantId);

      // Verify activity was saved to database
      const activity = await Activity.findById(response.body._id);
      expect(activity).toBeTruthy();
      expect(activity.title).toBe(activityData.title);
    });

    test('should not create activity without authentication', async () => {
      const activityData = {
        title: 'Morning Yoga',
        type: 'Exercise',
        duration: 30
      };

      const response = await request(app)
        .post('/api/activities')
        .send(activityData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });

    test('should not create activity with invalid data', async () => {
      // Missing required fields
      const activityData = {
        type: 'Exercise',
        // Missing title and duration
      };

      const response = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .send(activityData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/activities', () => {
    test('should get all activities for the authenticated user', async () => {
      // Create some test activities
      await Activity.create([
        {
          title: 'Morning Yoga',
          type: 'Exercise',
          duration: 30,
          preferredTimeOfDay: 'Morning',
          priority: 'High',
          user: testUser._id,
          tenantId: testUser.tenantId
        },
        {
          title: 'Read a Book',
          type: 'Relaxation',
          duration: 60,
          preferredTimeOfDay: 'Evening',
          priority: 'Medium',
          user: testUser._id,
          tenantId: testUser.tenantId
        }
      ]);

      const response = await request(app)
        .get('/api/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Check response structure
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('type');
      expect(response.body[0]).toHaveProperty('user', testUser._id.toString());
    });

    test('should only return activities for the authenticated user', async () => {
      // Create a different user
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123',
        tenantId: 'tenant_456'
      });

      // Create activities for both users
      await Activity.create([
        {
          title: 'Morning Yoga',
          type: 'Exercise',
          duration: 30,
          user: testUser._id,
          tenantId: testUser.tenantId
        },
        {
          title: 'Other User Activity',
          type: 'Learning',
          duration: 45,
          user: otherUser._id,
          tenantId: otherUser.tenantId
        }
      ]);

      const response = await request(app)
        .get('/api/activities')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Should only return activities for testUser
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty('title', 'Morning Yoga');
    });
  });

  describe('GET /api/activities/:id', () => {
    test('should get activity by ID', async () => {
      // Create a test activity
      const activity = await Activity.create({
        title: 'Morning Yoga',
        type: 'Exercise',
        duration: 30,
        preferredTimeOfDay: 'Morning',
        priority: 'High',
        user: testUser._id,
        tenantId: testUser.tenantId
      });

      const response = await request(app)
        .get(`/api/activities/${activity._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Check response structure
      expect(response.body).toHaveProperty('_id', activity._id.toString());
      expect(response.body).toHaveProperty('title', activity.title);
      expect(response.body).toHaveProperty('type', activity.type);
    });

    test('should not get activity that belongs to another user', async () => {
      // Create a different user
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123',
        tenantId: 'tenant_456'
      });

      // Create activity for other user
      const activity = await Activity.create({
        title: 'Other User Activity',
        type: 'Learning',
        duration: 45,
        user: otherUser._id,
        tenantId: otherUser.tenantId
      });

      const response = await request(app)
        .get(`/api/activities/${activity._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Activity not found');
    });
  });

  describe('PUT /api/activities/:id', () => {
    test('should update activity', async () => {
      // Create a test activity
      const activity = await Activity.create({
        title: 'Morning Yoga',
        type: 'Exercise',
        duration: 30,
        preferredTimeOfDay: 'Morning',
        priority: 'High',
        user: testUser._id,
        tenantId: testUser.tenantId
      });

      const updateData = {
        title: 'Updated Yoga Session',
        duration: 45,
        priority: 'Medium'
      };

      const response = await request(app)
        .put(`/api/activities/${activity._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      // Check response structure
      expect(response.body).toHaveProperty('_id', activity._id.toString());
      expect(response.body).toHaveProperty('title', updateData.title);
      expect(response.body).toHaveProperty('duration', updateData.duration);
      expect(response.body).toHaveProperty('priority', updateData.priority);
      expect(response.body).toHaveProperty('type', activity.type); // Unchanged field

      // Verify activity was updated in database
      const updatedActivity = await Activity.findById(activity._id);
      expect(updatedActivity.title).toBe(updateData.title);
      expect(updatedActivity.duration).toBe(updateData.duration);
    });
  });

  describe('DELETE /api/activities/:id', () => {
    test('should delete activity', async () => {
      // Create a test activity
      const activity = await Activity.create({
        title: 'Morning Yoga',
        type: 'Exercise',
        duration: 30,
        user: testUser._id,
        tenantId: testUser.tenantId
      });

      const response = await request(app)
        .delete(`/api/activities/${activity._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Activity removed');

      // Verify activity was deleted from database
      const deletedActivity = await Activity.findById(activity._id);
      expect(deletedActivity).toBeNull();
    });

    test('should not delete activity that belongs to another user', async () => {
      // Create a different user
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123',
        tenantId: 'tenant_456'
      });

      // Create activity for other user
      const activity = await Activity.create({
        title: 'Other User Activity',
        type: 'Learning',
        duration: 45,
        user: otherUser._id,
        tenantId: otherUser.tenantId
      });

      const response = await request(app)
        .delete(`/api/activities/${activity._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Activity not found');

      // Verify activity still exists in database
      const existingActivity = await Activity.findById(activity._id);
      expect(existingActivity).toBeTruthy();
    });
  });
});
