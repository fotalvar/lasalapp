import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { onCall, HttpsError } from "firebase-functions/v2/https";

initializeApp();

// Weeztix API credentials
const WEEZTIX_API_ID = "xs7nobJLz9rKv2tZ1u1dJ8fK8w4DqoYKmmSlHCVd";
const WEEZTIX_API_SECRET = "FQ1o5vT7L1Cg0JNO6allPsEXANjxgdU685U1Q9Es";
const WEEZTIX_API_BASE_URL = "https://api.weeztix.com/v1";

// CORS configuration for callable functions
const corsOptions = {
  cors: [
    "http://localhost:9002",
    "https://*.web.app",
    "https://*.firebaseapp.com",
  ],
};

exports.setTeamAdminClaim = onCall(corsOptions, async (request) => {
  if (request.auth?.token.admin !== true) {
    throw new HttpsError(
      "permission-denied",
      "Must be an admin to set custom claims."
    );
  }

  const { userId, isAdmin } = request.data;
  if (typeof userId !== "string" || typeof isAdmin !== "boolean") {
    throw new HttpsError(
      "invalid-argument",
      "The function must be called with 'userId' (string) and 'isAdmin' (boolean) arguments."
    );
  }

  try {
    await getAuth().setCustomUserClaims(userId, { teamAdmin: isAdmin });
    return {
      message: `Success! User ${userId} has been ${
        isAdmin ? "made" : "removed as"
      } a team admin.`,
    };
  } catch (error) {
    console.error("Error setting custom claims:", error);
    throw new HttpsError(
      "internal",
      "An internal error occurred while setting custom claims."
    );
  }
});

// Get Weeztix events
exports.getWeeztixEvents = onCall(corsOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Must be authenticated to access Weeztix events."
    );
  }

  try {
    // Create Basic Auth token
    const authToken = Buffer.from(
      `${WEEZTIX_API_ID}:${WEEZTIX_API_SECRET}`
    ).toString("base64");

    // Fetch events from Weeztix API
    const response = await fetch(`${WEEZTIX_API_BASE_URL}/events`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Weeztix API error: ${response.status}`);
    }

    const data = await response.json();
    return { events: data };
  } catch (error) {
    console.error("Error fetching Weeztix events:", error);
    throw new HttpsError(
      "internal",
      "An error occurred while fetching events from Weeztix."
    );
  }
});

// Get specific Weeztix event details
exports.getWeeztixEvent = onCall(corsOptions, async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Must be authenticated to access Weeztix events."
    );
  }

  const { eventId } = request.data;
  if (typeof eventId !== "string") {
    throw new HttpsError(
      "invalid-argument",
      "The function must be called with 'eventId' (string) argument."
    );
  }

  try {
    const authToken = Buffer.from(
      `${WEEZTIX_API_ID}:${WEEZTIX_API_SECRET}`
    ).toString("base64");

    const response = await fetch(`${WEEZTIX_API_BASE_URL}/events/${eventId}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Weeztix API error: ${response.status}`);
    }

    const data = await response.json();
    return { event: data };
  } catch (error) {
    console.error("Error fetching Weeztix event:", error);
    throw new HttpsError(
      "internal",
      "An error occurred while fetching event details from Weeztix."
    );
  }
});
