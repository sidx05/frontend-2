import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "10";
    const exclude = searchParams.get("exclude");

    // Forward to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    let url = `${backendUrl}/api/articles?limit=${limit}&sort=-publishedAt`;
    
    if (exclude) {
      url += `&exclude=${exclude}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
