// backend/scripts/seedBrandWire.ts
import connectDB from '../../src/lib/database';
import { BrandWire } from '../../src/models/BrandWire';

const sampleArticles = [
  {
    title: "Tech Visionaries: The Minds Shaping Our Digital Future",
    summary: "Exploring the innovative leaders who are revolutionizing technology and driving digital transformation across industries.",
    content: `In today's rapidly evolving digital landscape, a select group of visionaries stands at the forefront of technological innovation. These thought leaders are not just creating products; they're fundamentally reshaping how we interact with technology and envision our future.

From artificial intelligence pioneers to blockchain innovators, these individuals are pushing the boundaries of what's possible. Their work spans across multiple domains - from healthcare and finance to entertainment and education.

What sets these visionaries apart is their ability to see beyond current limitations and imagine solutions to problems we didn't even know we had. They combine technical expertise with entrepreneurial spirit, creating companies and technologies that have the potential to change the world.

As we look toward the future, it's clear that these leaders will continue to play a crucial role in shaping our digital destiny. Their innovations today will become the foundation for tomorrow's breakthroughs.`,
    category: "influential-personalities",
    tags: ["technology", "innovation", "leadership", "digital transformation"],
    author: "Sarah Chen",
    language: "en",
    status: "published",
    featured: true,
    priority: 90,
    images: [{
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop",
      alt: "Tech visionary working on innovative project",
      caption: "Leading innovators are shaping the future of technology"
    }]
  },
  {
    title: "Sustainable Business Practices: The New Competitive Advantage",
    summary: "How forward-thinking companies are integrating sustainability into their core business strategies and reaping the benefits.",
    content: `Sustainability is no longer just a buzzword or a nice-to-have initiative. It has become a fundamental driver of business success and competitive advantage. Companies that have embraced sustainable practices are not only contributing to environmental protection but also seeing significant improvements in their bottom line.

The shift toward sustainable business practices represents a fundamental change in how companies operate. It's about creating value not just for shareholders, but for all stakeholders - including employees, customers, communities, and the environment.

Leading companies are finding that sustainable practices often lead to cost savings, improved efficiency, and enhanced brand reputation. They're also discovering new market opportunities and attracting top talent who want to work for purpose-driven organizations.

The future belongs to companies that can balance profitability with purpose, creating sustainable value for all stakeholders while contributing to a better world.`,
    category: "industry-insights",
    tags: ["sustainability", "business strategy", "competitive advantage", "corporate responsibility"],
    author: "Michael Rodriguez",
    language: "en",
    status: "published",
    featured: false,
    priority: 75,
    images: [{
      url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop",
      alt: "Sustainable business practices in action",
      caption: "Companies are finding that sustainability drives both purpose and profit"
    }]
  },
  {
    title: "The Rise of Remote Work: Redefining the Modern Workplace",
    summary: "An in-depth look at how remote work is transforming company cultures, productivity metrics, and employee satisfaction.",
    content: `The workplace as we know it has undergone a dramatic transformation. Remote work, once considered a perk for a select few, has become the new normal for millions of workers worldwide. This shift has fundamentally changed how we think about work, productivity, and work-life balance.

Companies that have successfully adapted to remote work are discovering unexpected benefits. They're able to tap into global talent pools, reduce overhead costs, and often see improvements in employee satisfaction and retention.

However, the transition hasn't been without challenges. Organizations have had to rethink their communication strategies, invest in new technologies, and develop new ways to maintain company culture and team cohesion.

The future of work is likely to be hybrid, combining the flexibility of remote work with the collaboration benefits of in-person interaction. Companies that can master this balance will have a significant competitive advantage in attracting and retaining top talent.`,
    category: "thought-leadership",
    tags: ["remote work", "workplace transformation", "productivity", "company culture"],
    author: "Emily Watson",
    language: "en",
    status: "published",
    featured: true,
    priority: 85,
    images: [{
      url: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600&fit=crop",
      alt: "Modern remote workspace setup",
      caption: "Remote work is redefining how we think about productivity and collaboration"
    }]
  },
  {
    title: "Innovation Spotlight: Next-Gen Healthcare Technologies",
    summary: "Exploring breakthrough technologies that are revolutionizing patient care and medical research.",
    content: `The healthcare industry is experiencing unprecedented innovation, driven by advances in artificial intelligence, biotechnology, and digital health technologies. These breakthroughs are not just improving patient outcomes; they're fundamentally changing how healthcare is delivered and experienced.

From AI-powered diagnostic tools to personalized medicine based on genetic profiling, these technologies are making healthcare more precise, accessible, and effective. Telemedicine platforms have made healthcare more accessible to underserved populations, while wearable devices are enabling continuous health monitoring.

The integration of big data analytics in healthcare is providing insights that were previously impossible to obtain. Researchers can now identify patterns and correlations that lead to new treatments and preventive strategies.

As these technologies continue to evolve, we can expect to see even more dramatic improvements in healthcare outcomes, cost reduction, and patient satisfaction. The future of healthcare is bright, and it's being shaped by these innovative technologies and the visionary leaders who are developing them.`,
    category: "brand-spotlight",
    tags: ["healthcare technology", "innovation", "AI", "digital health", "medical research"],
    author: "Dr. James Park",
    language: "en",
    status: "published",
    featured: false,
    priority: 80,
    images: [{
      url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop",
      alt: "Advanced healthcare technology in use",
      caption: "Next-generation healthcare technologies are transforming patient care"
    }]
  },
  {
    title: "The Future of E-commerce: Personalization and AI",
    summary: "How artificial intelligence is revolutionizing online shopping experiences and driving unprecedented levels of personalization.",
    content: `E-commerce has evolved far beyond simple online shopping. Today's digital marketplaces are powered by sophisticated artificial intelligence systems that create highly personalized shopping experiences for each customer.

These AI systems analyze vast amounts of data - from browsing history and purchase patterns to social media activity and demographic information - to predict what customers want before they even know they want it.

The result is a shopping experience that feels tailor-made for each individual. Product recommendations are more accurate, search results are more relevant, and the overall shopping journey is more intuitive and satisfying.

As these technologies continue to advance, we can expect to see even more sophisticated personalization features, including virtual try-ons, AI-powered styling assistants, and predictive inventory management.

The companies that can master these AI-driven personalization techniques will have a significant competitive advantage in the increasingly crowded e-commerce landscape.`,
    category: "industry-insights",
    tags: ["e-commerce", "artificial intelligence", "personalization", "customer experience"],
    author: "Lisa Thompson",
    language: "en",
    status: "published",
    featured: false,
    priority: 70,
    images: [{
      url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
      alt: "AI-powered e-commerce interface",
      caption: "AI is revolutionizing how we shop online with personalized experiences"
    }]
  }
];

async function seedBrandWire() {
  try {
    await connectDB();
    console.log('🌱 Seeding Brand Wire articles...');

    // Clear existing articles
    await BrandWire.deleteMany({});
    console.log('✅ Cleared existing Brand Wire articles');

    // Insert sample articles
    for (const articleData of sampleArticles) {
      const article = new BrandWire(articleData);
      await article.save();
      console.log(`✅ Created: ${article.title}`);
    }

    console.log('🎉 Brand Wire seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding Brand Wire:', error);
  } finally {
    process.exit(0);
  }
}

seedBrandWire();
