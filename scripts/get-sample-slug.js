const { MongoClient } = require('mongodb');

(async () => {
  const c = new MongoClient('mongodb+srv://idk_db_user:EFzZdCnJcVO78WD5@cluster0.dqeyxbk.mongodb.net/?appName=Cluster0');
  await c.connect();
  const db = c.db();
  const crime = await db.collection('articles').findOne({
    $or: [{ category: '68ef6680e6976860f4cee3bd' }, { categories: { $in: ['68ef6680e6976860f4cee3bd'] } }],
    language: 'en'
  });
  console.log({ slug: crime.slug, title: crime.title });
  await c.close();
})();
