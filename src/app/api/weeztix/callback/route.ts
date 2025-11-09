import { NextRequest, NextResponse } from "next/server";

// Weeztix OAuth2 credentials
const WEEZTIX_CLIENT_ID = "xs7nobJLz9rKv2tZ1u1dJ8fK8w4DqoYKmmSlHCVd";
const WEEZTIX_CLIENT_SECRET = "FQ1o5vT7L1Cg0JNO6allPsEXANjxgdU685U1Q9Es";
const WEEZTIX_TOKEN_URL = "https://auth.openticket.tech/tokens";
const REDIRECT_URI =
  process.env.WEEZTIX_REDIRECT_URI ||
  "https://lasala.atresquarts.com/api/weeztix/callback";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    // Verify state to prevent CSRF
    const savedState = request.cookies.get("weeztix_oauth_state")?.value;

    if (!code) {
      return NextResponse.json(
        { error: "No authorization code provided" },
        { status: 400 }
      );
    }

    if (state !== savedState) {
      return NextResponse.json(
        { error: "Invalid state parameter" },
        { status: 400 }
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch(WEEZTIX_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: WEEZTIX_CLIENT_ID,
        client_secret: WEEZTIX_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token exchange failed:", tokenResponse.status, errorText);
      return NextResponse.json(
        { error: "Failed to exchange code for token" },
        { status: tokenResponse.status }
      );
    }

    const tokenData = await tokenResponse.json();

    // TODO: Store tokens securely (in database or secure storage)
    // For now, we'll store in cookies (NOT recommended for production)
    const response = NextResponse.redirect(
      new URL("/dashboard/weeztix", request.url)
    );

    response.cookies.set("weeztix_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: tokenData.expires_in, // Use actual expiry from response
    });

    if (tokenData.refresh_token) {
      response.cookies.set("weeztix_refresh_token", tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: tokenData.refresh_token_expires_in,
      });
    }

    // Clear the state cookie
    response.cookies.delete("weeztix_oauth_state");

    return response;
  } catch (error) {
    console.error("Error in OAuth callback:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
