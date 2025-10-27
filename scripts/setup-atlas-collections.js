const { MongoClient } = require('mongodb');

async function setupAtlasCollections() {
  const uri = process.argv[2] || process.env.DATABASE_URL;
  
  if (!uri) {
    console.error('❌ DATABASE_URL not provided');
    console.log('Usage: node setup-atlas-collections.js <mongodb-uri>');
    process.exit(1);
  }

  console.log('🔄 Connecting to MongoDB Atlas...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');

    const db = client.db();

    // Get existing collections
    const existingCollections = await db.listCollections().toArray();
    const existingNames = existingCollections.map(c => c.name);
    console.log('\n📋 Existing collections:', existingNames.join(', '));

    // Collections to create
    const requiredCollections = [
      {
        name: 'adminsessions',
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['userId', 'token', 'createdAt', 'expiresAt'],
            properties: {
              userId: { bsonType: 'objectId' },
              token: { bsonType: 'string' },
              createdAt: { bsonType: 'date' },
              expiresAt: { bsonType: 'date' },
              lastActivity: { bsonType: 'date' }
            }
          }
        },
        indexes: [
          { key: { token: 1 }, unique: true },
          { key: { userId: 1 } },
          { key: { expiresAt: 1 }, expireAfterSeconds: 0 }
        ]
      },
      {
        name: 'adminusers',
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['username', 'email', 'password', 'role'],
            properties: {
              username: { bsonType: 'string' },
              email: { bsonType: 'string' },
              password: { bsonType: 'string' },
              role: { enum: ['admin', 'editor', 'viewer'] },
              isActive: { bsonType: 'bool' },
              createdAt: { bsonType: 'date' },
              updatedAt: { bsonType: 'date' },
              lastLogin: { bsonType: 'date' }
            }
          }
        },
        indexes: [
          { key: { username: 1 }, unique: true },
          { key: { email: 1 }, unique: true }
        ]
      },
      {
        name: 'brandwires',
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['title', 'content', 'status'],
            properties: {
              title: { bsonType: 'string' },
              content: { bsonType: 'string' },
              excerpt: { bsonType: 'string' },
              slug: { bsonType: 'string' },
              status: { enum: ['draft', 'published', 'archived'] },
              publishedAt: { bsonType: 'date' },
              createdAt: { bsonType: 'date' },
              updatedAt: { bsonType: 'date' },
              author: { bsonType: 'string' },
              imageUrl: { bsonType: 'string' },
              tags: { bsonType: 'array' }
            }
          }
        },
        indexes: [
          { key: { slug: 1 }, unique: true, sparse: true },
          { key: { status: 1, publishedAt: -1 } },
          { key: { createdAt: -1 } }
        ]
      },
      {
        name: 'settings',
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['key', 'value'],
            properties: {
              key: { bsonType: 'string' },
              value: {}, // Can be any type
              description: { bsonType: 'string' },
              category: { bsonType: 'string' },
              isPublic: { bsonType: 'bool' },
              updatedAt: { bsonType: 'date' }
            }
          }
        },
        indexes: [
          { key: { key: 1 }, unique: true },
          { key: { category: 1 } }
        ]
      }
    ];

    console.log('\n🔨 Creating missing collections...\n');

    for (const collectionConfig of requiredCollections) {
      try {
        if (existingNames.includes(collectionConfig.name)) {
          console.log(`⏭️  Skipping ${collectionConfig.name} (already exists)`);
          continue;
        }

        // Create collection with validator
        await db.createCollection(collectionConfig.name, {
          validator: collectionConfig.validator
        });
        console.log(`✅ Created collection: ${collectionConfig.name}`);

        // Create indexes
        const collection = db.collection(collectionConfig.name);
        for (const indexSpec of collectionConfig.indexes) {
          await collection.createIndex(indexSpec.key, {
            unique: indexSpec.unique,
            sparse: indexSpec.sparse,
            expireAfterSeconds: indexSpec.expireAfterSeconds
          });
        }
        console.log(`   📑 Created ${collectionConfig.indexes.length} index(es) for ${collectionConfig.name}`);

      } catch (error) {
        console.error(`❌ Error creating ${collectionConfig.name}:`, error.message);
      }
    }

    // Summary
    console.log('\n📊 Summary:');
    const finalCollections = await db.listCollections().toArray();
    const finalNames = finalCollections.map(c => c.name);
    console.log(`Total collections: ${finalNames.length}`);
    console.log(`Collections: ${finalNames.join(', ')}`);

    console.log('\n✅ Setup complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

setupAtlasCollections();
