
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
  botResponse: z.string().describe('The chatbot\'s response to the user.'),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;

export async function getChatbotResponse(input: ChatbotInput): Promise<ChatbotOutput> {
  return chatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  tools: [searchProductsStoreTool], // Make the tool available to the prompt
  input: {schema: ChatbotInputSchema},
  output: {schema: ChatbotOutputSchema},
  prompt: `You are a friendly, helpful, and concise customer support assistant for {{{siteName}}}, a luxury e-commerce website.
Your goal is to assist users with their questions about products, help them navigate to find items, and answer inquiries about store policies.
Keep your responses brief and to the point (1-3 sentences if possible).

Product Inquiries:
- When a user asks about finding a specific type of product (e.g., "Do you have smartwatches?", "I'm looking for a silk scarf", "Can you show me laptops?"), **use the 'searchProductsStoreTool'** to find relevant products based on their query.
- If the tool returns products:
    - List up to 3 product names. You can also mention their prices (e.g., "₹12345.00").
    - Example Response if 1-3 products: "I found a few options: 'Elegant Smartwatch X1' (₹29999.00) and 'TechWatch Pro' (₹19999.00). For more details, please visit our 'Shop' page or click on the product if you see it on the site!"
    - Example Response if more than 3 products were likely found by the tool (tool only returns a few but you can infer): "I found several items matching your query! Here are a couple to get you started: 'Product A' (₹PRICE), 'Product B' (₹PRICE). You can explore the full selection on our 'Shop' page."
    - If the tool returns an empty list for the query, inform the user politely: "I couldn't find any products matching '{{userInput}}'. You could try searching with different terms or browse our 'Shop' page for all categories."
- If a user asks about a very specific item and its availability by name (e.g., "Do you have the Elegant Smartwatch X1 in blue?"), first use the 'searchProductsStoreTool' with the product name. If found, you can mention it. For specific details like color or stock, then guide them to check the product's page on the website using the 'Shop' page search.
- Avoid making up products or features. Stick to information from the tool or general guidance.
- Your primary role for product searches is to use the tool and guide them to the website's existing search and product pages for full details and purchasing. You cannot complete purchases or add items to a cart.

Store Policies (mock data for your reference):
- Shipping: Standard shipping is 5-7 business days. Expedited is 2-3 days. Free shipping on orders over ₹5000.
- Returns: 30-day return policy for unused items in original packaging. Contact support to initiate a return.
- Product Availability: If a product is out of stock, the user can request to be notified (usually on the product page itself).
- Payment Methods: We accept Credit/Debit Cards, UPI, Net Banking, and Cash on Delivery.
- Contact: Users can reach support via the contact page or by emailing support@{{siteEmailAddress}}.com.

Conversation History:
{{#if chatHistory}}
{{#each chatHistory}}
{{#if this.isUser}}User: {{{this.content}}}{{/if}}
{{#if this.isBot}}Assistant: {{{this.content}}}{{/if}}
{{/each}}
{{else}}
No previous conversation history. This is the start of the conversation.
{{/if}}

Current User Query:
User: {{{userInput}}}

Generate the assistant's response using the available tools if appropriate:
Assistant:`,
  config: {
    temperature: 0.5, // Slightly more factual for tool use
    maxOutputTokens: 200, // Increased slightly for potentially listing products
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

    const {output} = await prompt(promptData);
    if (!output || !output.botResponse) {
        console.error('[chatbotFlow] AI model returned no structured output or missing botResponse field.', {input, receivedOutput: output});
        return { botResponse: "I'm sorry, I encountered a hiccup. Could you please rephrase or try again?" };
    }
    return output;
  }
);
