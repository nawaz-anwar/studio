
'use server';

import { extractEmployeeInfo as extractEmployeeInfoFlow } from '@/ai/flows/extract-employee-info-flow';
import type { ExtractEmployeeInfoInput } from '@/lib/schema/employee';

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
