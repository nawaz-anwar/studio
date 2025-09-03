'use server';

/**
 * @fileOverview Genkit flow for generating a monthly salary summary, highlighting unusual changes or discrepancies.
 *
 * - monthlySalarySummary - A function that generates the monthly salary summary.
 * - MonthlySalarySummaryInput - The input type for the monthlySalarySummary function.
 * - MonthlySalarySummaryOutput - The return type for the monthlySalarySummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MonthlySalarySummaryInputSchema = z.object({
  month: z.string().describe('The month for which to generate the salary summary (e.g., January, February).'),
  year: z.string().describe('The year for which to generate the salary summary (e.g., 2024).'),
  employeeData: z.string().describe('A stringified JSON array of employee records, each containing employee details, attendance, salary, and overtime hours.'),
});
export type MonthlySalarySummaryInput = z.infer<typeof MonthlySalarySummaryInputSchema>;

const MonthlySalarySummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the monthly salary calculations, highlighting any unusual changes or discrepancies.'),
});
export type MonthlySalarySummaryOutput = z.infer<typeof MonthlySalarySummaryOutputSchema>;

export async function monthlySalarySummary(input: MonthlySalarySummaryInput): Promise<MonthlySalarySummaryOutput> {
  return monthlySalarySummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'monthlySalarySummaryPrompt',
  input: {schema: MonthlySalarySummaryInputSchema},
  output: {schema: MonthlySalarySummaryOutputSchema},
  prompt: `You are an expert payroll analyst.

  Generate a summary of the monthly salary calculations for {{month}} {{year}}, based on the provided employee data.
  Highlight any unusual changes or discrepancies in salaries or overtime hours compared to previous months.
  Identify potential issues and provide insights to ensure accurate payroll processing.

  Employee Data (JSON string array):
  {{employeeData}}
  `,
});

const monthlySalarySummaryFlow = ai.defineFlow(
  {
    name: 'monthlySalarySummaryFlow',
    inputSchema: MonthlySalarySummaryInputSchema,
    outputSchema: MonthlySalarySummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
