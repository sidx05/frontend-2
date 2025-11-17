import { NextResponse } from "next/server";

// This would typically come from a database
// You can integrate with Google AdSense, or your own ad management system
const advertisements = [
  {
    id: "ad-1",
    type: "banner",
    title: "Advertise With Us",
    description: "Reach millions of readers across multiple languages and regions",
    badge: "Partner With Us",
    link: "/advertise",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop",
    position: "left-top",
    active: true,
    impressions: 0,
    clicks: 0,
  },
  {
    id: "ad-2",
    type: "card",
    title: "Advanced Analytics Platform",
    description: "Track your business metrics in real-time with our powerful dashboard",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    badge: "Sponsored",
    link: "/advertise",
    position: "left-middle",
    active: true,
    impressions: 0,
    clicks: 0,
  },
  {
    id: "ad-3",
    type: "compact",
    title: "Cloud Storage Solution",
    description: "Secure your files with 99.9% uptime guarantee",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=200&h=200&fit=crop",
    badge: "Ad",
    link: "/advertise",
    position: "left-bottom",
    active: true,
    impressions: 0,
    clicks: 0,
  },
  {
    id: "ad-4",
    type: "banner",
    title: "Boost Your Business",
    description: "Advertise with us and reach millions of readers worldwide",
    badge: "Advertise",
    link: "/advertise",
    position: "right-top",
    active: true,
    impressions: 0,
    clicks: 0,
  },
  {
    id: "ad-5",
    type: "card",
    title: "Professional Development Course",
    description: "Master your skills with industry-leading experts. Enroll now and get 30% off!",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
    badge: "Sponsored",
    link: "/advertise",
    position: "right-middle",
    active: true,
    impressions: 0,
    clicks: 0,
  },
  {
    id: "ad-6",
    type: "compact",
    title: "Investment Platform",
    description: "Start investing with as little as $10. Join 2M+ investors",
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=200&h=200&fit=crop",
    badge: "Ad",
    link: "/advertise",
    position: "right-bottom",
    active: true,
    impressions: 0,
    clicks: 0,
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");

    let filteredAds = advertisements.filter(ad => ad.active);

    if (position) {
      filteredAds = filteredAds.filter(ad => ad.position.startsWith(position));
    }

    return NextResponse.json({
      success: true,
      data: filteredAds,
    });
  } catch (error) {
    console.error("Error fetching ads:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch advertisements" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { adId, action } = body; // action can be 'impression' or 'click'

    // Here you would typically update the database
    // For now, we'll just log it
    console.log(`Ad ${adId} - Action: ${action}`);

    return NextResponse.json({
      success: true,
      message: `Ad ${action} tracked successfully`,
    });
  } catch (error) {
    console.error("Error tracking ad:", error);
    return NextResponse.json(
      { success: false, error: "Failed to track ad action" },
      { status: 500 }
    );
  }
}
