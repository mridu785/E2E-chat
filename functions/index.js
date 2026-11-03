const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();
const rtdb = admin.database();

/**
 * Triggered on user account deletion:
 * Removes public user document, unregisters username handle, and cleans presence.
 */
exports.onUserAccountDeleted = functions.auth.user().onDelete(async (user) => {
  const uid = user.uid;
  const userDocRef = db.collection("users").doc(uid);

  try {
    const snap = await userDocRef.get();
    if (snap.exists) {
      const data = snap.data();
      if (data.username) {
        await db.collection("usernames").doc(data.username.toLowerCase()).delete();
      }
      await userDocRef.delete();
    }
    // Delete ephemeral status
    await rtdb.ref(`status/${uid}`).remove();
    console.log(`Cleaned up data for UID: ${uid}`);
  } catch (err) {
    console.error(`Error deleting user profile for ${uid}:`, err);
  }
});