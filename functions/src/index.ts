
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { onCall, HttpsError } from "firebase-functions/v2/https";

initializeApp();

exports.setTeamAdminClaim = onCall(async (request) => {
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

