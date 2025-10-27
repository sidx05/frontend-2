const {MongoClient, ObjectId} = require('mongodb');

async function recategorizeArticles() {
  const uri = 'mongodb+srv://idk_db_user:EFzZdCnJcVO78WD5@cluster0.dqeyxbk.mongodb.net/?appName=Cluster0';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas\n');

    const db = client.db();

    // Get all categories to build a mapping (by key only, categories are language-agnostic)
    const categories = await db.collection('categories').find({}).toArray();
    const categoryMap = {};
    
    categories.forEach(cat => {
      categoryMap[cat.key] = cat._id.toString();
    });

    console.log('📋 Category mapping created:', Object.keys(categoryMap).length, 'categories\n');
    console.log('Categories:', Object.keys(categoryMap).join(', '), '\n');

    // Get articles with categoryDetected field
    const articles = await db.collection('articles').find({
      categoryDetected: { $exists: true, $ne: null }
    }).toArray();

    console.log(`📰 Found ${articles.length} articles with categoryDetected field\n`);

    let fixed = 0;
    let skipped = 0;
    let errors = 0;

    for (const article of articles) {
      try {
        const detectedCategory = article.categoryDetected;
        
        const correctCategoryId = categoryMap[detectedCategory];

        if (!correctCategoryId) {
          if (skipped === 0) {
            console.log(`⚠️  No category found for "${detectedCategory}"`);
          }
          skipped++;
          continue;
        }

        // Check if already correct
        if (article.category === correctCategoryId || 
            (article.categories && article.categories.includes(correctCategoryId))) {
          skipped++;
          continue;
        }

        // Update the article
        await db.collection('articles').updateOne(
          { _id: article._id },
          {
            $set: {
              category: correctCategoryId,
              categories: [correctCategoryId]
            }
          }
        );

        fixed++;
        if (fixed % 100 === 0) {
          console.log(`✅ Fixed ${fixed} articles...`);
        }

      } catch (error) {
        console.error(`❌ Error fixing article ${article._id}:`, error.message);
        errors++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Fixed: ${fixed} articles`);
    console.log(`   ⏭️  Skipped: ${skipped} articles`);
    console.log(`   ❌ Errors: ${errors} articles`);

    // Show counts by category
    console.log('\n📊 Articles by category after fix:');
    const sortedCategories = Object.entries(categoryMap).sort((a, b) => a[0].localeCompare(b[0]));
    for (const [key, categoryId] of sortedCategories) {
      const count = await db.collection('articles').countDocuments({
        status: { $in: ['scraped', 'processed', 'published'] },
        $or: [
          { category: categoryId },
          { categories: { $in: [categoryId] } }
        ]
      });
      if (count > 0) {
        console.log(`   ${key.padEnd(20)} ${count} articles`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
}

recategorizeArticles();
