import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../server';
import User from '../models/User';
import Activity from '../models/Activity';
import jwt from 'jsonwebtoken';

// Mock environment variables
process.env.JWT_SECRET = 'testsecret';

// Create in-memory MongoDB instance for testing
let mongoServer;
let testUser;
let authToken;
let testActivities;

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
  
  // Create test activities
  testActivities = await Activity.create([
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
    },
    {
      title: 'Learn Programming',
      type: 'Learning',
      duration: 45,
      preferredTimeOfDay: 'Afternoon',
      priority: 'High',
      user: testUser._id,
      tenantId: testUser.tenantId
    }
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Suggestion API', () => {
  describe('POST /api/suggestions', () => {
    test('should generate suggestions for a free time slot', async () => {
      const suggestionData = {
        freeTimeSlotId: mongoose.Types.ObjectId().toString(),
        duration: 60,
        timeOfDay: 'Morning'
      };

      const response = await request(app)
        .post('/api/suggestions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(suggestionData)
        .expect(200);

      // Check response structure
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('activity');
      expect(response.body[0]).toHaveProperty('score');
      expect(response.body[0]).toHaveProperty('reason');
    });

    test('should not generate suggestions without authentication', async () => {
      const suggestionData = {
        freeTimeSlotId: mongoose.Types.ObjectId().toString(),
        duration: 60,
        timeOfDay: 'Morning'
      };

      const response = await request(app)
        .post('/api/suggestions')
        .send(suggestionData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });
  });

  describe('POST /api/suggestions/duration', () => {
    test('should generate suggestions based on duration', async () => {
      const suggestionData = {
        duration: 30,
        timeOfDay: 'Morning'
      };

      const response = await request(app)
        .post('/api/suggestions/duration')
        .set('Authorization', `Bearer ${authToken}`)
        .send(suggestionData)
        .expect(200);

      // Check response structure
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('activity');
      expect(response.body[0]).toHaveProperty('score');
      
      // Should prioritize activities that fit within the duration
      expect(response.body[0].activity.duration).toBeLessThanOrEqual(suggestionData.duration);
    });

    test('should consider time of day preferences', async () => {
      const suggestionData = {
        duration: 60,
        timeOfDay: 'Morning'
      };

      const response = await request(app)
        .post('/api/suggestions/duration')
        .set('Authorization', `Bearer ${authToken}`)
        .send(suggestionData)
        .expect(200);

      // Morning activities should score higher
      const morningActivities = response.body.filter(
        suggestion => suggestion.activity.preferredTimeOfDay === 'Morning'
      );
      
      if (morningActivities.length > 0) {
        const morningScores = morningActivities.map(suggestion => suggestion.score);
        const otherScores = response.body
          .filter(suggestion => suggestion.activity.preferredTimeOfDay !== 'Morning')
          .map(suggestion => suggestion.score);
        
        if (otherScores.length > 0) {
          const avgMorningScore = morningScores.reduce((a, b) => a + b, 0) / morningScores.length;
          const avgOtherScore = otherScores.reduce((a, b) => a + b, 0) / otherScores.length;
          
          expect(avgMorningScore).toBeGreaterThan(avgOtherScore);
        }
      }
    });
  });

  describe('POST /api/suggestions/adapt', () => {
    test('should adapt activity to fit shorter time slot', async () => {
      const adaptData = {
        activityId: testActivities[1]._id, // Read a Book (60 min)
        availableDuration: 30
      };

      const response = await request(app)
        .post('/api/suggestions/adapt')
        .set('Authorization', `Bearer ${authToken}`)
        .send(adaptData)
        .expect(200);

      // Check response structure
      expect(response.body).toHaveProperty('adapted');
      expect(response.body.adapted).toHaveProperty('title');
      expect(response.body.adapted).toHaveProperty('duration', adaptData.availableDuration);
      expect(response.body.adapted).toHaveProperty('originalDuration', testActivities[1].duration);
      expect(response.body.adapted).toHaveProperty('adaptationReason');
    });

    test('should not adapt activity that already fits', async () => {
      const adaptData = {
        activityId: testActivities[0]._id, // Morning Yoga (30 min)
        availableDuration: 45
      };

      const response = await request(app)
        .post('/api/suggestions/adapt')
        .set('Authorization', `Bearer ${authToken}`)
        .send(adaptData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Activity already fits within available time');
    });

    test('should not adapt activity to extremely short duration', async () => {
      const adaptData = {
        activityId: testActivities[1]._id, // Read a Book (60 min)
        availableDuration: 5
      };

      const response = await request(app)
        .post('/api/suggestions/adapt')
        .set('Authorization', `Bearer ${authToken}`)
        .send(adaptData)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Cannot adapt activity to such a short duration');
    });
  });
});
