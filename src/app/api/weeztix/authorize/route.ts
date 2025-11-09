import { NextRequest, NextResponse } from "next/server";

// Weeztix OAuth2 credentials
const WEEZTIX_CLIENT_ID = "xs7nobJLz9rKv2tZ1u1dJ8fK8w4DqoYKmmSlHCVd";
const WEEZTIX_AUTH_URL = "https://auth.openticket.tech/tokens/authorize";
const REDIRECT_URI =
  process.env.WEEZTIX_REDIRECT_URI ||
  "https://lasala.atresquarts.com/api/weeztix/callback";

export async function GET(request: NextRequest) {
  try {
    // Generate a random state for CSRF protection
    const state =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    // Build authorization URL
    const authUrl = new URL(WEEZTIX_AUTH_URL);
    authUrl.searchParams.append("client_id", WEEZTIX_CLIENT_ID);
    authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("state", state);

    // Store state in session/cookie for verification later
    const response = NextResponse.redirect(authUrl.toString());
    response.cookies.set("weeztix_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error("Error initiating OAuth flow:", error);
    return NextResponse.json(
      { error: "Failed to initiate authorization" },
      { status: 500 }
    );
  }
}
