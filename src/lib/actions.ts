
'use server';

import { extractEmployeeInfo as extractEmployeeInfoFlow } from '@/ai/flows/extract-employee-info-flow';
import type { ExtractEmployeeInfoInput } from '@/lib/schema/employee';
import { app, auth as clientAuth, db } from '@/lib/firebase'; // Renamed auth to clientAuth to avoid conflict
import { getAuth as getAdminAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, getDocs, doc, deleteDoc } from 'firebase/firestore';


export async function extractEmployeeInfo(input: ExtractEmployeeInfoInput) {
    try {
        const result = await extractEmployeeInfoFlow(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during AI extraction.';
        return { success: false, error: errorMessage };
    }
}

// Separate auth instance for admin actions to avoid conflicts.
// This is necessary because the client-side auth object (used for the logged-in user)
// should not be used for admin-level user creation.
const adminAuth = getAdminAuth(app);

export async function createAdminUser(email: string, password: string): Promise<{ success: boolean, error?: string }> {
  try {
    // This creates the user in Firebase Authentication.
    const userCredential = await createUserWithEmailAndPassword(adminAuth, email, password);
    
    // Add an admin record to the 'admins' collection in Firestore.
    await addDoc(collection(db, 'admins'), {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      createdAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error creating admin user:", error);
    // Provide a more user-friendly error message
    let errorMessage = "An error occurred while creating the admin user.";
    if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email address is already in use by another account.";
    } else if (error.code === 'auth/invalid-email') {
        errorMessage = "The email address is not valid.";
    } else if (error.code === 'auth/weak-password') {
        errorMessage = "The password is too weak. Please use a stronger password.";
    }
    return { success: false, error: errorMessage };
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
        console.error("Error deleting admin user:", error);
        return { success: false, error: error.message };
    }
}
