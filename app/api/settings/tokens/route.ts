import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import UserSettings from "@/lib/models/UserSettings";

export async function GET() {
  const session = await auth();
  if (!session?.user?.username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const settings = await UserSettings.findOne({ username: session.user.username });

    return NextResponse.json({
      hasNetlifyToken: !!settings?.netlifyToken,
      hasVercelToken: !!settings?.vercelToken,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { netlifyToken, vercelToken } = body;

  if (!netlifyToken && !vercelToken) {
    return NextResponse.json({ error: "At least one token is required" }, { status: 400 });
  }

  try {
    await dbConnect();

    const update: Record<string, string> = {};
    if (netlifyToken) update.netlifyToken = netlifyToken;
    if (vercelToken) update.vercelToken = vercelToken;

    await UserSettings.findOneAndUpdate(
      { username: session.user.username },
      { $set: update },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save tokens" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider");

  if (!provider || !["netlify", "vercel"].includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  try {
    await dbConnect();
    const field = provider === "netlify" ? "netlifyToken" : "vercelToken";
    await UserSettings.findOneAndUpdate(
      { username: session.user.username },
      { $unset: { [field]: "" } }
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete token" }, { status: 500 });
  }
}
