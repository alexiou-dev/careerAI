import {z} from 'zod';
import { FileText, Mail, Handshake } from 'lucide-react';

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_FILE_TYPES = ['application/pdf'];

export const documentTypes = [
  { value: 'cover-letter', label: 'Cover Letter', icon: FileText },
  { value: 'thank-you-email', label: 'Thank-You Email', icon: Mail },
  { value: 'networking-outreach', label: 'Networking Outreach', icon: Handshake },
] as const;

export const DocumentTypeSchema = z.enum(documentTypes.map(d => d.value) as [string, ...string[]]);
export type DocumentType = z.infer<typeof DocumentTypeSchema>;

// Schema for the AI flow input
export const GenerateDocumentInputSchema = z.object({
  resumePdfDataUri: z
    .string()
    .describe(
      "The user's resume in PDF format, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  jobDescription: z.string().describe('The job description the user is applying for.'),
  documentType: DocumentTypeSchema.describe("The type of document to generate."),
});
export type GenerateDocumentInput = z.infer<typeof GenerateDocumentInputSchema>;

// Schema for the AI flow output
export const GenerateDocumentOutputSchema = z.object({
  generatedDocument: z.string().describe('The generated document in plain text.'),
});
export type GenerateDocumentOutput = z.infer<typeof GenerateDocumentOutputSchema>;


// Schema for the frontend form
export const GenerateDocumentFormSchema = z.object({
  resume: z
    .any()
    .refine((files) => files?.length === 1, 'Resume is required.')
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
      'Only .pdf files are accepted.'
    ),
  jobDescription: z.string().min(50, 'Job description must be at least 50 characters.'),
  documentType: DocumentTypeSchema,
});

export type GenerateDocumentFormValues = z.infer<typeof GenerateDocumentFormSchema>;

