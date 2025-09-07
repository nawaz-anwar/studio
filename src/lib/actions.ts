
'use server';

import { monthlySalarySummary, MonthlySalarySummaryInput } from '@/ai/flows/monthly-salary-summary';
import { extractEmployeeInfo as extractEmployeeInfoFlow, ExtractEmployeeInfoInput } from '@/ai/flows/extract-employee-info-flow';

export async function generateSalarySummary(input: MonthlySalarySummaryInput) {
  try {
    const result = await monthlySalarySummary(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}

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
