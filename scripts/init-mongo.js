// MongoDB initialization script for Docker
db = db.getSiblingDB('newshub');

// Create collections with validation
db.createCollection('articles', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'content', 'language'],
      properties: {
        title: { bsonType: 'string' },
        content: { bsonType: 'string' },
        language: { bsonType: 'string' },
        status: { 
          bsonType: 'string',
          enum: ['scraped', 'processed', 'published', 'archived']
        }
      }
    }
  }
});

db.createCollection('categories', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['key', 'label'],
      properties: {
        key: { bsonType: 'string' },
        label: { bsonType: 'string' },
        name: { bsonType: 'string' }
      }
    }
  }
});

db.createCollection('sources', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'url'],
      properties: {
        name: { bsonType: 'string' },
        url: { bsonType: 'string' },
        active: { bsonType: 'bool' }
      }
    }
  }
});

// Create indexes for better performance
db.articles.createIndex({ "publishedAt": -1 });
db.articles.createIndex({ "language": 1, "category": 1 });
db.articles.createIndex({ "status": 1 });
db.articles.createIndex({ "source.name": 1 });
db.articles.createIndex({ "title": "text", "summary": "text", "content": "text" });

db.categories.createIndex({ "key": 1 }, { unique: true });
db.sources.createIndex({ "name": 1 }, { unique: true });
db.sources.createIndex({ "active": 1 });

// Insert default categories
db.categories.insertMany([
  { key: 'politics', label: 'Politics', name: 'Politics', icon: '🏛️', color: '#3B82F6' },
  { key: 'sports', label: 'Sports', name: 'Sports', icon: '⚽', color: '#10B981' },
  { key: 'entertainment', label: 'Entertainment', name: 'Entertainment', icon: '🎬', color: '#F59E0B' },
  { key: 'technology', label: 'Technology', name: 'Technology', icon: '💻', color: '#8B5CF6' },
  { key: 'health', label: 'Health', name: 'Health', icon: '🏥', color: '#EF4444' },
  { key: 'business', label: 'Business', name: 'Business', icon: '💼', color: '#06B6D4' },
  { key: 'education', label: 'Education', name: 'Education', icon: '📚', color: '#84CC16' },
  { key: 'crime', label: 'Crime', name: 'Crime', icon: '🚨', color: '#F97316' },
  { key: 'general', label: 'General', name: 'General', icon: '📰', color: '#6B7280' }
]);

print('Database initialized successfully!');
