import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { Article } from "@/models/Article";

export async function GET() {
  try {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI || "");
    }

    // Get featured/editor's pick articles
    // You could add a "featured" or "editorsPick" field to your Article model
    const articles = await Article.find({
      // If you have a featured field: featured: true,
    })
      .sort({ publishedAt: -1 })
      .limit(4)
      .select("title category readTime slug")
      .lean();

    return NextResponse.json({
      success: true,
      data: articles.map(article => ({
        title: article.title,
        category: article.category?.label || article.category || "News",
        time: article.readTime || "5 min read",
        slug: article.slug,
      })),
    });
  } catch (error) {
    console.error("Error fetching editor's picks:", error);
    
    // Return mock data if database is not available
    return NextResponse.json({
      success: true,
      data: [
        {
          title: "The Future of Artificial Intelligence in 2025",
          category: "Technology",
          time: "5 min read",
        },
        {
          title: "Global Markets React to Economic Policy Changes",
          category: "Business",
          time: "7 min read",
        },
        {
          title: "Climate Summit Reaches Historic Agreement",
          category: "Environment",
          time: "6 min read",
        },
        {
          title: "Breakthrough in Renewable Energy Storage",
          category: "Science",
          time: "8 min read",
        },
      ],
    });
  }
}
