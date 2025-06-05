
'use server';
/**
 * @fileOverview A ShopSphere customer support chatbot AI flow.
 *
 * - getChatbotResponse - Generates a response to user input in a conversation.
 * - ChatbotInput - Input type for the chatbot.
 * - ChatbotOutput - Output type for thechatbot.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { searchProductsStoreTool } from '@/ai/tools/product-search-tool'; // Import the new tool

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
  botResponse: z.string().describe('The chatbot\'s response to the user, potentially containing special PRODUCT_LINK directives for rendering products.'),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;

export async function getChatbotResponse(input: ChatbotInput): Promise<ChatbotOutput> {
  return chatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  tools: [searchProductsStoreTool], 
  input: {schema: ChatbotInputSchema},
  output: {schema: ChatbotOutputSchema},
  prompt: `You are a friendly customer support assistant for {{{siteName}}}.
Your goal is to help users with product questions and store policies.
Your response about products MUST be based *solely* on the 'products' array provided by the 'searchProductsStoreTool'.
Keep responses concise and helpful. Ask clarifying questions if the user's query is unclear.

Product Inquiries:
- If a user asks to find products, **you MUST use the 'searchProductsStoreTool'**.
- **Formulating the Search Query:** Extract ONLY essential product keywords (nouns, adjectives like "blue shirt", "laptops").
    - User: "Hi, I'm looking for elegant black dresses, and what's your return policy?" -> Tool Query: "elegant black dresses"
- **Interpreting Tool Output (Strictly follow these):**
    1.  **IF 'products' array in tool output IS NOT EMPTY:**
        - Start with: "Okay, I found these items based on your search for '[tool's queryUsed value]':"
        - For each product in the tool's 'products' array (max 3): Create a \\\`PRODUCT_LINK[PRODUCT_NAME|PRODUCT_ID|PRICE_STRING|IMAGE_URL]\\\`. Use exact data from the tool for each part.
        - Example: "Okay, I found these items based on your search for 'smartwatches': \\\`PRODUCT_LINK[Elegant Smartwatch X1|1|₹29999.00|https://placehold.co/800x600.png]\\\`. You can click to see more."
    2.  **IF 'products' array in tool output IS EMPTY:**
        - State: "I searched for '[tool's queryUsed value]' but couldn't find any matching products right now. Try different keywords or browse our Shop page."

Store Policies Summary:
- Shipping: 5-7 days standard, 2-3 days expedited. Free over ₹5000.
- Returns: 30-day policy for unused items.
- Payment: Credit/Debit Cards, UPI, Net Banking, COD.
- Contact: For complex issues, email support@{{{siteEmailAddress}}}.com.

Conversation History:
{{#if chatHistory}}
{{#each chatHistory}}
{{#if this.isUser}}User: {{{this.content}}}{{/if}}
{{#if this.isBot}}Assistant: {{{this.content}}}{{/if}}
{{/each}}
{{else}}
This is the start of our conversation.
{{/if}}

Current User Query:
User: {{{userInput}}}

Generate the assistant's JSON response containing the 'botResponse' field.
Assistant:`,
  config: {
    temperature: 0.3, 
    maxOutputTokens: 350, // Keep this reasonable for potentially multiple product links
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  }
});

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async (input: ChatbotInput): Promise<ChatbotOutput> => {
    const siteEmailAddress = input.siteName.toLowerCase().replace(/\s+/g, '');

    const processedChatHistory = input.chatHistory?.map(message => ({
      ...message,
      isUser: message.role === 'user',
      isBot: message.role === 'bot',
    }));

    const promptData = {
      ...input,
      chatHistory: processedChatHistory,
      siteEmailAddress: siteEmailAddress,
    };

    let outputFromPrompt: ChatbotOutput | null = null;
    try {
      const result = await prompt(promptData);
      outputFromPrompt = result.output;
    } catch (e) {
      console.error('[chatbotFlow] Error during prompt() execution:', e, {inputDetails: input});
      // outputFromPrompt remains null, will be handled by the check below
    }

    if (!outputFromPrompt || !outputFromPrompt.botResponse) {
        console.error('[chatbotFlow] Fallback: No valid botResponse obtained. This could be due to a prompt execution error, model parsing failure, or malformed output object.', {inputDetails: input, receivedOutputObject: outputFromPrompt});
        return { botResponse: "I'm sorry, I encountered a hiccup. Could you please rephrase or try again?" };
    }

    return outputFromPrompt;
  }
);

