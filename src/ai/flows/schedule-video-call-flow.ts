
'use server';
/**
 * @fileOverview Flow to schedule a video call, including generating a Google Meet link.
 *
 * - scheduleVideoCall - Handles scheduling and link generation.
 * - ScheduleVideoCallInput - Input for the flow.
 * - ScheduleVideoCallOutput - Output from the flow (the ScheduledCall object).
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { createGoogleMeetLinkTool } from '@/ai/tools/google-meet-tool';
import { addScheduledCall, type ScheduledCallCreateInput } from '@/lib/data';
import type { ScheduledCall } from '@/types';

export const ScheduleVideoCallInputSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  productImageUrl: z.string().url(),
  userId: z.string().optional(),
  requesterName: z.string(),
  requesterEmail: z.string().email().optional(), // Make email optional as per current UI
  requestedDateTime: z.string().datetime({ message: "Invalid date-time format for requestedDateTime" }),
  notes: z.string().optional(),
});
export type ScheduleVideoCallInput = z.infer<typeof ScheduleVideoCallInputSchema>;

// Output is the full ScheduledCall object, so we use z.custom to rely on the TypeScript type.
// Ensure your ScheduledCall type is robustly defined in src/types/index.ts
const ScheduledCallOutputSchema = z.custom<ScheduledCall>((data) => {
  // Add basic runtime checks if needed, e.g., presence of id, status
  if (typeof data === 'object' && data !== null && 'id' in data && 'status' in data) {
    return true;
  }
  // throw new Error("Invalid ScheduledCall object structure for output"); // Or return false
  return false; // For zod, returning false indicates validation failure
});

export type ScheduleVideoCallOutput = ScheduledCall;

export async function scheduleVideoCall(input: ScheduleVideoCallInput): Promise<ScheduleVideoCallOutput> {
  // Validate input with Zod before calling the flow, or let the flow do it.
  // Here, the flow will validate, which is fine.
  return scheduleVideoCallFlow(input);
}

const scheduleVideoCallFlow = ai.defineFlow(
  {
    name: 'scheduleVideoCallFlow',
    inputSchema: ScheduleVideoCallInputSchema,
    outputSchema: ScheduledCallOutputSchema,
  },
  async (input) => {
    // 1. Generate the Google Meet link
    const { output: meetLinkToolOutput } = await createGoogleMeetLinkTool({ context: `Video call for ${input.productName} by ${input.requesterName}` });
    
    const meetingLink = meetLinkToolOutput?.meetingLink;

    if (!meetingLink) {
      console.error('[scheduleVideoCallFlow] Failed to generate Google Meet link from tool.');
      throw new Error('Failed to generate Google Meet link. The tool did not return a link.');
    }

    // 2. Prepare data for storing the scheduled call
    const callInputForDb: ScheduledCallCreateInput = {
      productId: input.productId,
      productName: input.productName,
      productImageUrl: input.productImageUrl,
      userId: input.userId,
      requesterName: input.requesterName,
      requesterEmail: input.requesterEmail,
      requestedDateTime: input.requestedDateTime,
      notes: input.notes,
      meetingLink: meetingLink, // Include the generated link
    };

    // 3. Add the scheduled call to our data store
    const newScheduledCall = addScheduledCall(callInputForDb);

    // 4. Return the complete ScheduledCall object
    return newScheduledCall;
  }
);
