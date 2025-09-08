
'use server';

import { extractEmployeeInfo as extractEmployeeInfoFlow } from '@/ai/flows/extract-employee-info-flow';
import type { ExtractEmployeeInfoInput } from '@/lib/schema/employee';
import { app, auth as clientAuth, db } from '@/lib/firebase'; // Renamed auth to clientAuth to avoid conflict
import { getAuth as getAdminAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, getDocs, doc, deleteDoc, query, where } from 'firebase/firestore';


export async function extractEmployeeInfo(input: ExtractEmployeeInfoInput) {
    try {
        const result = await extractEmployeeInfoFlow(input);
        return { success: true, data: result };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during AI extraction.';
        return { success: false, error: errorMessage };
    }
}

// Separate auth instance for admin actions to avoid conflicts.
// This is necessary because the client-side auth object (used for the logged-in user)
// should not be used for admin-level user creation.
const adminAuth = getAdminAuth(app);

export async function createAdminUser(email: string, password: string): Promise<{ success: boolean, error?: string }> {
  let uid: string;
  let userEmail: string;

  try {
    // This creates the user in Firebase Authentication.
    const userCredential = await createUserWithEmailAndPassword(adminAuth, email, password);
    uid = userCredential.user.uid;
    userEmail = userCredential.user.email!;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
        // This is okay, the user might have been created by our hardcoded login.
        // We will proceed to add them to firestore if they don't exist there.
        userEmail = email;
    } else if (error.code === 'auth/invalid-email') {
        return { success: false, error: "The email address is not valid." };
    } else if (error.code === 'auth/weak-password') {
        return { success: false, error: "The password is too weak. Please use a stronger password." };
    } else {
        return { success: false, error: "An error occurred while creating the admin user in Authentication." };
    }
  }

  try {
     // Check if admin already exists in Firestore to prevent duplicates
    const adminsRef = collection(db, 'admins');
    const q = query(adminsRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
        // Admin already exists in Firestore. No need to add again.
        return { success: true };
    }
    
    // We need a UID. If the user was just created, we have it. 
    // If they already existed, we don't have it from the client.
    // For this prototype, we'll omit UID if it's an existing auth user.
    // A robust solution would use a cloud function to get the UID by email.
    
    // Add an admin record to the 'admins' collection in Firestore.
    await addDoc(collection(db, 'admins'), {
      // uid: uid, // This might be undefined if user already existed
      email: userEmail,
      createdAt: serverTimestamp(),
    });

    return { success: true };
  } catch(error: any) {
    return { success: false, error: "User was created in Authentication, but failed to save to the admin list." };
  }
}

export async function deleteAdminUser(adminId: string): Promise<{ success: boolean, error?: string }> {
    try {
        // This is a simplified deletion. In a real app, you would need a server-side
        // function (e.g., Cloud Function) to delete the Firebase Auth user.
        // For this prototype, we'll just delete the Firestore record.
        await deleteDoc(doc(db, "admins", adminId));
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
