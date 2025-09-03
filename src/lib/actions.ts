
'use server';

import { monthlySalarySummary, MonthlySalarySummaryInput } from '@/ai/flows/monthly-salary-summary';

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
