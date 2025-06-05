
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
  prompt: `You are a friendly, helpful, and conversational AI assistant for the e-commerce store: {{{siteName}}}.
Your main job is to assist users with their questions about our products and store policies, and to help them find items they're looking for.
Always aim for a natural and engaging tone in your responses. Ask clarifying questions if the user's query is unclear.

Product Search and Display:
- When a user's message indicates they are looking for products (e.g., "show me red shoes", "do you have laptops?", "I need a gift for my friend"), you **MUST** use the 'searchProductsStoreTool' to find relevant items.
- **Query for the Tool**: From the user's message, extract the most important keywords that describe the product (like type, color, features). For instance, if the user says "I'm searching for some warm winter jackets, maybe in blue", a good query for the tool would be "blue winter jackets".
- **After the Tool Responds**:
    1.  **If the tool finds products** (i.e., the 'products' array in its output is not empty):
        - Start by saying something like: "Okay, I searched for '[tool's queryUsed value]' and found these items for you:" (Replace '[tool's queryUsed value]' with the actual 'queryUsed' value from the tool's output).
        - Then, for each product returned by the tool (list up to 3 items if more are found), you **MUST** present it using this exact format: \\\`PRODUCT_LINK[PRODUCT_NAME|PRODUCT_ID|PRICE_STRING|IMAGE_URL]\\\`.
        - Use the exact \`name\`, \`id\`, \`priceString\`, and \`imageUrl\` values provided by the tool for each product.
        - Example: "Okay, I searched for 'smartwatches' and found this for you: \\\`PRODUCT_LINK[Elegant Smartwatch X1|1|₹29999.00|https://placehold.co/800x600.png]\\\`. You can click on it for more details."
    2.  **If the tool does not find products** (i.e., the 'products' array is empty):
        - Inform the user, for example: "I looked for '[tool's queryUsed value]' but couldn't find any matching products at the moment. Perhaps try different search terms, or you can browse our collections on the Shop page!"
Your response about products MUST be based *solely* on the 'products' array provided by the 'searchProductsStoreTool'. Do NOT invent or add any products that were not explicitly returned by the tool.

Store Policies (Provide this information if asked):
- Shipping: Standard shipping takes 5-7 business days, expedited is 2-3 days. Shipping is free for orders over ₹5000.
- Returns: We have a 30-day return policy for items that are unused and in their original condition.
- Payment Methods: We accept Credit/Debit Cards, UPI, Net Banking, and Cash on Delivery (COD).
- For other questions or complex issues, users can email support@{{{siteEmailAddress}}}.com.

Conversation Context:
{{#if chatHistory}}
Here's a brief history of our conversation so far:
{{#each chatHistory}}
{{#if this.isUser}}User: {{{this.content}}}{{/if}}
{{#if this.isBot}}Assistant: {{{this.content}}}{{/if}}
{{/each}}
{{else}}
This is the beginning of our conversation.
{{/if}}

User's current message:
User: {{{userInput}}}

Now, please generate the assistant's response. Your entire output **MUST** be a single JSON object, with one key "botResponse" containing your textual reply.
Assistant:`,
  config: {
    temperature: 0.7, 
    maxOutputTokens: 450, 
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

