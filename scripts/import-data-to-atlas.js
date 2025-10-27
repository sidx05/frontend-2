const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function importDataToAtlas() {
  const uri = process.argv[2] || process.env.DATABASE_URL;
  
  if (!uri) {
    console.error('❌ DATABASE_URL not provided');
    console.log('Usage: node import-data-to-atlas.js <mongodb-uri>');
    process.exit(1);
  }

  console.log('🔄 Connecting to MongoDB Atlas...');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas\n');

    const db = client.db();

    // Define the JSON files to import
    const imports = [
      {
        file: 'C:\\Users\\gsidd\\Downloads\\newshub.settings.json',
        collection: 'settings',
        description: 'Site settings'
      },
      {
        file: 'C:\\Users\\gsidd\\Downloads\\newshub.brandwires.json',
        collection: 'brandwires',
        description: 'Brand Wire articles'
      },
      {
        file: 'C:\\Users\\gsidd\\Downloads\\newshub.adminusers.json',
        collection: 'adminusers',
        description: 'Admin users'
      }
    ];

    for (const importConfig of imports) {
      try {
        console.log(`📂 Processing ${importConfig.description}...`);
        
        // Check if file exists
        if (!fs.existsSync(importConfig.file)) {
          console.log(`   ⏭️  Skipping: File not found at ${importConfig.file}\n`);
          continue;
        }

        // Read and parse JSON file
        const fileContent = fs.readFileSync(importConfig.file, 'utf8');
        let documents = JSON.parse(fileContent);

        // Ensure it's an array
        if (!Array.isArray(documents)) {
          documents = [documents];
        }

        // Convert MongoDB extended JSON to proper format
        documents = documents.map(doc => {
          return convertExtendedJSON(doc);
        });

        console.log(`   📄 Found ${documents.length} document(s)`);

        const collection = db.collection(importConfig.collection);

        // Check if collection already has data
        const existingCount = await collection.countDocuments();
        if (existingCount > 0) {
          console.log(`   ⚠️  Collection already has ${existingCount} document(s)`);
          console.log(`   🔄 Clearing existing data...`);
          await collection.deleteMany({});
        }

        // Insert documents
        if (documents.length > 0) {
          const result = await collection.insertMany(documents);
          console.log(`   ✅ Imported ${result.insertedCount} document(s) to ${importConfig.collection}`);
        } else {
          console.log(`   ⚠️  No documents to import`);
        }

        console.log('');

      } catch (error) {
        console.error(`   ❌ Error importing ${importConfig.description}:`, error.message);
        console.log('');
      }
    }

    console.log('📊 Import Summary:');
    const collections = ['settings', 'brandwires', 'adminusers'];
    for (const collectionName of collections) {
      const count = await db.collection(collectionName).countDocuments();
      console.log(`   ${collectionName}: ${count} document(s)`);
    }

    console.log('\n✅ Import complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Disconnected from MongoDB Atlas');
  }
}

// Helper function to convert MongoDB extended JSON format
function convertExtendedJSON(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => convertExtendedJSON(item));
  }

  if (typeof obj === 'object') {
    // Handle MongoDB extended JSON types
    if (obj.$oid) {
      // Keep ObjectId as string, MongoDB driver will handle it
      return obj.$oid;
    }
    if (obj.$date) {
      return new Date(obj.$date);
    }
    if (obj.$numberInt) {
      return parseInt(obj.$numberInt);
    }
    if (obj.$numberLong) {
      return parseInt(obj.$numberLong);
    }
    if (obj.$numberDouble) {
      return parseFloat(obj.$numberDouble);
    }

    // Recursively process object properties
    const converted = {};
    for (const key in obj) {
      if (key === '_id' && obj[key].$oid) {
        // Skip _id, let MongoDB generate new ones
        continue;
      }
      converted[key] = convertExtendedJSON(obj[key]);
    }
    return converted;
  }

  return obj;
}

importDataToAtlas();
