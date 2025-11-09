import { NextRequest, NextResponse } from "next/server";

// Weeztix API credentials
const WEEZTIX_API_BASE_URL = "https://api.weeztix.com";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

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

    // Fetch event details from Weeztix API
    const response = await fetch(`${WEEZTIX_API_BASE_URL}/event/${eventId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Weeztix API error:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Failed to fetch event from Weeztix" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ event: data });
  } catch (error) {
    console.error("Error fetching Weeztix event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
