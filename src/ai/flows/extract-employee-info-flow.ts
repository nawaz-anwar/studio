'use server';
/**
 * @fileOverview An AI flow to extract employee details from an image and text context.
 *
 * - extractEmployeeInfo - A function that handles the employee information extraction process.
 * - ExtractEmployeeInfoInput - The input type for the extractEmployeeInfo function.
 * - ExtractEmployeeInfoOutput - The return type for the extractEmployeeInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ExtractEmployeeInfoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of an employee's document (like a resume or ID), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  context: z.string().optional().describe('Optional text providing additional context about the employee, such as their salary or specific role.'),
});
export type ExtractEmployeeInfoInput = z.infer<typeof ExtractEmployeeInfoInputSchema>;

export const ExtractEmployeeInfoOutputSchema = z.object({
  name: z.string().describe("The full name of the employee."),
  designation: z.string().describe("The job title or designation of the employee."),
  salary: z.number().describe("The monthly salary of the employee in AED."),
  nationality: z.string().describe("The nationality or country of origin of the employee."),
});
export type ExtractEmployeeInfoOutput = z.infer<typeof ExtractEmployeeInfoOutputSchema>;

export async function extractEmployeeInfo(input: ExtractEmployeeInfoInput): Promise<ExtractEmployeeInfoOutput> {
  return extractEmployeeInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractEmployeeInfoPrompt',
  input: {schema: ExtractEmployeeInfoInputSchema},
  output: {schema: ExtractEmployeeInfoOutputSchema},
  prompt: `You are an expert HR assistant responsible for employee data entry.
Your task is to extract the following information from the provided image and text:
- Full Name
- Designation (Job Title)
- Monthly Salary (in AED)
- Nationality (Country)

Analyze the image and any additional context carefully. The salary might be mentioned in the text context.
Prioritize information from the text if it conflicts with the image. If any information is missing, make a reasonable inference based on the data provided, but do not invent details that are not present.

Image:
{{media url=photoDataUri}}

Additional Context:
"{{{context}}}"
`,
});

const extractEmployeeInfoFlow = ai.defineFlow(
  {
    name: 'extractEmployeeInfoFlow',
    inputSchema: ExtractEmployeeInfoInputSchema,
    outputSchema: ExtractEmployeeInfoOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
