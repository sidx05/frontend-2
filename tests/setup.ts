import mongoose from 'mongoose';

// Test database setup
beforeAll(async () => {
  // Connect to test database
  const testMongoUri = process.env.MONGO_URI?.replace('/newshub', '/newshub-test') || 'mongodb://localhost:27017/newshub-test';
  
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(testMongoUri);
  }
});

// Cleanup after each test
afterEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Close connections after all tests
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});