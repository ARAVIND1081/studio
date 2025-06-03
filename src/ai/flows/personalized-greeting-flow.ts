
'use server';
/**
 * @fileOverview An AI flow to generate a personalized homepage greeting.
 *
 * - generatePersonalizedGreeting - Generates a greeting based on user viewing history.
 * - PersonalizedGreetingInput - Input type for the greeting generation.
 * - PersonalizedGreetingOutput - Output type for the greeting generation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedGreetingInputSchema = z.object({
  viewingHistory: z
    .array(z.string().describe('Product ID'))
    .optional()
    .describe('An optional list of product IDs the user has recently viewed. Can be empty.'),
  siteName: z.string().describe('The name of the e-commerce site.'),
});
export type PersonalizedGreetingInput = z.infer<typeof PersonalizedGreetingInputSchema>;

const PersonalizedGreetingOutputSchema = z.object({
  greeting: z.string().describe('A short, personalized welcome message for the homepage (1-2 sentences, max 150 characters).'),
});
export type PersonalizedGreetingOutput = z.infer<typeof PersonalizedGreetingOutputSchema>;

export async function generatePersonalizedGreeting(input: PersonalizedGreetingInput): Promise<PersonalizedGreetingOutput> {
  return personalizedGreetingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedGreetingPrompt',
  input: {schema: PersonalizedGreetingInputSchema},
  output: {schema: PersonalizedGreetingOutputSchema},
  prompt: `You are a friendly and insightful AI assistant for {{{siteName}}}, a luxury e-commerce site.
Your goal is to provide a warm and personalized welcome message for the user on the homepage.

Consider the user's viewing history (if provided):
{{#if viewingHistory}}
User's Recently Viewed Product IDs:
{{#each viewingHistory}}
- {{{this}}}
{{/each}}
If the history suggests an interest (e.g., multiple items from 'Electronics', or high-value items), you can subtly weave this into the greeting. For example: "Welcome back to {{{siteName}}}! We noticed you have an eye for our latest electronics. Discover your next favorite today!"
{{else}}
The user has no specific viewing history, or is potentially a new visitor.
{{/if}}

Craft a concise greeting (1-2 sentences, maximum 150 characters).

Examples:
- If history shows interest in 'Apparel': "Welcome back to {{{siteName}}}! Exploring our latest fashion arrivals? We hope you find the perfect piece to elevate your style."
- If history is empty: "Welcome to {{{siteName}}}! Discover a world of elegance and find something special today."
- If history is mixed: "Welcome back to {{{siteName}}}! We're delighted to see you exploring our curated collections again."

Generate the greeting:`,
  config: {
    temperature: 0.7, // Moderately creative
  }
});

const personalizedGreetingFlow = ai.defineFlow(
  {
    name: 'personalizedGreetingFlow',
    inputSchema: PersonalizedGreetingInputSchema,
    outputSchema: PersonalizedGreetingOutputSchema,
  },
  async (input: PersonalizedGreetingInput) => {
    const {output} = await prompt(input);
    if (!output || !output.greeting) {
        console.error('[personalizedGreetingFlow] AI model returned no structured output or missing greeting field.', {input, receivedOutput: output});
        // Fallback greeting
        return { greeting: `Welcome to ${input.siteName || 'ShopSphere'}! Explore our exclusive collections.` };
    }
    return output;
  }
);
