
'use server';

import { extractEmployeeInfo as extractEmployeeInfoFlow } from '@/ai/flows/extract-employee-info-flow';
import type { ExtractEmployeeInfoInput } from '@/lib/schema/employee';
import { app, auth, db } from '@/lib/firebase';
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

// Separate auth instance for admin actions to avoid conflicts
const adminAuth = getAdminAuth(app);

export async function createAdminUser(email: string, password: string): Promise<{ success: boolean, error?: string }> {
  try {
    // Note: This creates the user in Firebase Auth, but does not sign them in.
    const userCredential = await createUserWithEmailAndPassword(adminAuth, email, password);
    
    // Add admin record to Firestore
    await addDoc(collection(db, 'admins'), {
      email: userCredential.user.email,
      createdAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error creating admin user:", error);
    return { success: false, error: error.message };
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
