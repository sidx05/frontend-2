const mongoose = require('mongoose');
const Source = require('../dist/models/Source').Source;

async function checkSources() {
  try {
    await mongoose.connect('mongodb://localhost:27017/newshub');
    
    const sources = await Source.find({}).select('name lang url active');
    console.log('=== Sources by Language ===');
    const langGroups = {};
    sources.forEach(s => {
      if (!langGroups[s.lang]) langGroups[s.lang] = [];
      langGroups[s.lang].push(s.name);
    });
    
    Object.keys(langGroups).forEach(lang => {
      console.log(`${lang}: ${langGroups[lang].join(', ')}`);
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSources();
