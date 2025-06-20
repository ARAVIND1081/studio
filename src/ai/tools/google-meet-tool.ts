
'use server';
/**
 * @fileOverview A Genkit tool for creating mock Google Meet links.
 *
 * - createGoogleMeetLinkTool - The tool definition.
 * - CreateGoogleMeetLinkInput - Input schema for the tool.
 * - CreateGoogleMeetLinkOutput - Output schema for the tool.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const CreateGoogleMeetLinkInputSchema = z.object({
  context: z.string().optional().describe("Optional context for the meeting, e.g., product name or user ID."),
});
export type CreateGoogleMeetLinkInput = z.infer<typeof CreateGoogleMeetLinkInputSchema>;

export const CreateGoogleMeetLinkOutputSchema = z.object({
  meetingLink: z.string().url().describe("The generated mock Google Meet link."),
});
export type CreateGoogleMeetLinkOutput = z.infer<typeof CreateGoogleMeetLinkOutputSchema>;

export const createGoogleMeetLinkTool = ai.defineTool(
  {
    name: 'createGoogleMeetLinkTool',
    description: 'Generates a unique (mock) Google Meet link for a video call. This tool does not require external API calls and creates a placeholder link.',
    inputSchema: CreateGoogleMeetLinkInputSchema,
    outputSchema: CreateGoogleMeetLinkOutputSchema,
  },
  async (input) => {
    // Generate a random-looking string for the meet link
    const randomPart = () => Math.random().toString(36).substring(2, 5); // 3 chars
    const mockLink = `https://meet.google.com/${randomPart()}-${randomPart()}${randomPart().charAt(0)}-${randomPart()}`;
    
    console.log(`[createGoogleMeetLinkTool] Generated mock link for context "${input?.context || 'N/A'}": ${mockLink}`);
    return { meetingLink: mockLink };
  }
);
