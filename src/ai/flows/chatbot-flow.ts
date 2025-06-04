
'use server';
/**
 * @fileOverview A ShopSphere customer support chatbot AI flow.
 *
 * - getChatbotResponse - Generates a response to user input in a conversation.
 * - ChatbotInput - Input type for the chatbot.
 * - ChatbotOutput - Output type for the chatbot.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

const ChatbotInputSchema = z.object({
  userInput: z.string().describe('The latest message from the user.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'bot']).describe('Who sent the message.'),
    content: z.string().describe('The content of the message.'),
  })).optional().describe('A brief history of the conversation, if any. Current user input is separate.'),
  siteName: z.string().describe('The name of the e-commerce site.'),
});
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

const ChatbotOutputSchema = z.object({
  botResponse: z.string().describe('The chatbot\'s response to the user.'),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;

export async function getChatbotResponse(input: ChatbotInput): Promise<ChatbotOutput> {
  return chatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  input: {schema: ChatbotInputSchema}, // This schema is for the direct input to the prompt function if called independently.
                                      // Handlebars will operate on the actual data object passed at runtime.
  output: {schema: ChatbotOutputSchema},
  prompt: `You are a friendly, helpful, and concise customer support assistant for {{{siteName}}}, a luxury e-commerce website.
Your goal is to assist users with their questions about products, store policies, and general inquiries.
Keep your responses brief and to the point (1-3 sentences if possible).

Store Policies (mock data for your reference):
- Shipping: Standard shipping is 5-7 business days. Expedited is 2-3 days. Free shipping on orders over ₹5000.
- Returns: 30-day return policy for unused items in original packaging. Contact support to initiate a return.
- Product Availability: If a product is out of stock, the user can request to be notified.
- Payment Methods: We accept Credit/Debit Cards, UPI, Net Banking, and Cash on Delivery.
- Contact: Users can reach support via the contact page or by emailing support@{{siteEmailAddress}}.com.

Conversation History:
{{#if chatHistory}}
{{#each chatHistory}}
{{#if (eq this.role "user")}}User: {{{this.content}}}{{/if}}
{{#if (eq this.role "bot")}}Assistant: {{{this.content}}}{{/if}}
{{/each}}
{{else}}
No previous conversation history. This is the start of the conversation.
{{/if}}

Current User Query:
User: {{{userInput}}}

Generate the assistant's response:
Assistant:`,
  config: {
    temperature: 0.6, // Slightly more factual but still friendly
    maxOutputTokens: 150,
  }
});

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async (input: ChatbotInput) => {
    const siteEmailAddress = input.siteName.toLowerCase().replace(/\s+/g, '');
    
    // Create an object to pass to the prompt, including the derived siteEmailAddress
    const promptData = {
      ...input,
      siteEmailAddress: siteEmailAddress,
    };

    const {output} = await prompt(promptData);
    if (!output || !output.botResponse) {
        console.error('[chatbotFlow] AI model returned no structured output or missing botResponse field.', {input, receivedOutput: output});
        return { botResponse: "I'm sorry, I encountered a hiccup. Could you please rephrase or try again?" };
    }
    return output;
  }
);
