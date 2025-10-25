const mongoose = require('mongoose');
const Article = require('../dist/models/Article').Article;

async function checkArticles() {
  try {
    await mongoose.connect('mongodb://localhost:27017/newshub');
    
    // Check articles by language
    const languages = ['te', 'hi', 'en', 'ta', 'ml', 'bn', 'gu', 'mr'];
    
    console.log('=== Article Count by Language ===');
    for (const lang of languages) {
      const count = await Article.countDocuments({ language: lang });
      const withImages = await Article.countDocuments({ 
        language: lang, 
        thumbnail: { $exists: true, $ne: null } 
      });
      console.log(`${lang}: ${count} articles, ${withImages} with images`);
    }
    
    // Check a few sample articles
    console.log('\n=== Sample Articles ===');
    const samples = await Article.find({}).limit(5).select('title language thumbnail source.name');
    samples.forEach(a => {
      console.log(`- ${a.title} (${a.language}) - Image: ${a.thumbnail ? 'Yes' : 'No'} - Source: ${a.source?.name}`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkArticles();
