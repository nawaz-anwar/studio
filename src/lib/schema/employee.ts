import { z } from 'zod';

export const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  designation: z.string().min(2, 'Designation is required.'),
  salary: z.coerce.number().positive('Salary must be a positive number.'),
  city: z.string().optional(),
  country: z.string().min(2, 'Country is required.'),
  mobile: z.string().optional(),
});

export const extractionSchema = z.object({
  photo: z.custom<FileList>().refine(files => files?.length > 0, 'An image is required.'),
  context: z.string().optional(),
});


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
