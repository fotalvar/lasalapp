import { NextRequest, NextResponse } from "next/server";

// Weeztix API credentials
const WEEZTIX_API_BASE_URL = "https://api.weeztix.com";

export async function GET(request: NextRequest) {
  try {
    // Get access token from cookie
    const accessToken = request.cookies.get("weeztix_access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "Not authenticated. Please authorize first.",
          needsAuth: true,
        },
        { status: 401 }
      );
    }

    // Fetch events from Weeztix API
    // Using "upcoming" to get only future events
    const response = await fetch(`${WEEZTIX_API_BASE_URL}/event/upcoming`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Weeztix API error:",
        response.status,
        response.statusText,
        errorText
      );
      return NextResponse.json(
        { error: "Failed to fetch events from Weeztix", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ events: data });
  } catch (error) {
    console.error("Error fetching Weeztix events:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
