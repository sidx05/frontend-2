import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  return NextResponse.json({ error: "Newsletter disabled" }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ error: "Newsletter disabled" }, { status: 410 });
}

// ---------------------- Handlers (disabled) ----------------------

async function handleSubscription(data: any) {
  const { email, name, preferences } = data;

  if (!email || !name) {
    return NextResponse.json(
      { error: "Email and name are required" },
      { status: 400 }
    );
  }

  const existing = await db.subscriber.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Email already subscribed" },
      { status: 400 }
    );
  }

  const newSubscriber = await db.subscriber.create({
    data: {
      email,
      name,
      preferences: {
        frequency: preferences?.frequency || "daily",
        categories: preferences?.categories || [],
        format: preferences?.format || "html",
      },
      active: true,
      subscribedAt: new Date(),
      lastSent: null,
    },
  });

  return NextResponse.json(
    {
      message: "Successfully subscribed to newsletter",
      subscriber: newSubscriber,
    },
    { status: 201 }
  );
}

async function handleUnsubscription(data: any) {
  const { email } = data;

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const subscriber = await db.subscriber.update({
    where: { email },
    data: { active: false },
  }).catch(() => null);

  if (!subscriber) {
    return NextResponse.json(
      { error: "Email not found in subscriber list" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: "Successfully unsubscribed from newsletter",
  });
}

async function handleNewsletterSending(data: any) {
  const { frequency = "daily", categories = [] } = data;

  const subscribers = await db.subscriber.findMany({
    where: {
      active: true,
      // NOTE: Prisma JSON path filter isn't supported in this setup.
      // If needed later, filter in memory instead of using `path`.
    },
  });

  const newsletterContent = await generateNewsletterContent(frequency, categories);

  // 🔹 Here you’d actually send emails, update lastSent, etc.

  return NextResponse.json({
    message: `Newsletter prepared for ${subscribers.length} subscribers`,
    results: {
      sent: subscribers.length,
      content: newsletterContent,
      timestamp: new Date().toISOString(),
      frequency,
      categories,
    },
  });
}

async function handleTestEmail(data: any) {
  const { email, frequency = "daily", categories = [] } = data;

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const newsletterContent = await generateNewsletterContent(frequency, categories);

  return NextResponse.json({
    message: `Test newsletter generated for ${email}`,
    preview: newsletterContent,
  });
}

// ---------------------- Helpers ----------------------

async function generateNewsletterContent(frequency: string, categories: string[]) {
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let articles = await db.article.findMany();
  if (categories.length > 0) {
    articles = articles.filter((a) =>
      categories.includes(a.category ?? "")
    );
  }

  const subject =
    frequency === "breaking"
      ? "🚨 Breaking News Alert"
      : frequency === "weekly"
      ? `📰 Weekly News Digest - ${date}`
      : `📬 Daily News Briefing - ${date}`;

  return {
    subject,
    html: `<h1>${subject}</h1>${articles
      .map((a) => `<h3>${a.title}</h3><p>${a.summary}</p>`)
      .join("")}`,
    text: `${subject}\n\n${articles
      .map((a) => `${a.title}\n${a.summary}`)
      .join("\n\n")}`,
  };
}

async function generateNewsletterPreview(frequency: string, categories: string[]) {
  const content = await generateNewsletterContent(frequency, categories);

  const subscribers = await db.subscriber.findMany({
    where: {
      active: true,
    },
  });

  const articles = await db.article.findMany({
    where: categories.length > 0 ? { category: { in: categories } } : {},
  });

  return {
    subject: content.subject,
    articles,
    estimatedRecipients: subscribers.length,
  };
}
