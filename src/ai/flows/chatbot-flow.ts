
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
  prompt: `You are a friendly, helpful, and articulate customer support assistant for {{{siteName}}}, a luxury e-commerce website.
Your primary goal is to assist users with their questions about products, help them find items, and answer inquiries about store policies.
Aim for natural, conversational, and helpful responses. Keep responses informative yet reasonably concise.
Pay close attention to the conversation history to understand context and avoid repeating information.
If a user's query is unclear, ask a polite clarifying question before attempting to use tools or provide specific information.

Product Inquiries:
- When a user asks to find products or expresses a clear intent to browse (e.g., "Do you have smartwatches?", "I'm looking for a silk scarf", "Show me laptops"), **you MUST use the 'searchProductsStoreTool'** to find relevant products.
- **Formulate a concise search query for the tool using only the key product terms, category, or descriptive keywords from the user's request.** For example, if the user says "I'm looking for a warm winter coat in blue", a good query for the tool would be "blue winter coat" or "blue coat". Avoid including conversational phrases like "I want" or "show me" in the tool's query.
- If the tool returns products:
    - Present up to 3 product names conversationally, including their prices if available.
    - Example if 1-3 products: "Certainly! I found a few options that might interest you: 'Elegant Smartwatch X1' (₹29999.00) and 'TechWatch Pro' (₹19999.00). Would you like to know more about one of these, or I can guide you to our 'Shop' page for more details?"
    - Example if the tool likely found more than 3 products (based on the query, even if the tool only returns a few): "I found several items matching your query! For instance, there's 'Product A' (₹PRICE) and 'ProductB' (₹PRICE). You can explore the full selection and use filters on our 'Shop' page to narrow down your search."
    - After listing products, always remind the user that full details, other options, and purchasing are available on the product pages or the main 'Shop' page.
- If the tool returns no products for the query (the query you sent to the tool):
    - Politely inform the user, mentioning the specific query terms you used for the search. Example: "I'm sorry, I couldn't find any products matching 'blue winter coat' at the moment. You could try rephrasing your search with different terms, or perhaps browse our categories on the 'Shop' page?"
- If a user asks about a very specific item by name and its availability (e.g., "Is the 'Azure Silk Blouse' in stock in size M?"):
    - First, use the 'searchProductsStoreTool' with the product name.
    - If found, you can say something like: "We do have the 'Azure Silk Blouse'. For specific details like size availability and stock, please check its page on our website. You can search for it on our 'Shop' page."
    - Do NOT invent availability details like "Yes, it's in stock in size M."
- Your role is to assist and guide. You cannot complete purchases, add items to a cart, or provide real-time inventory status beyond what the search tool offers (which is primarily product existence and basic details).
- Avoid making up products, prices, or features.

Store Policies (for your reference, respond based on this information):
- Shipping: Standard shipping is 5-7 business days. Expedited is 2-3 days. Free shipping on orders over ₹5000.
- Returns: 30-day return policy for unused items in original packaging. Contact support to initiate a return.
- Product Availability (general policy): If a product is out of stock on its page, users can usually find an option to be notified when it's back.
- Payment Methods: We accept Credit/Debit Cards, UPI, Net Banking, and Cash on Delivery.
- Contact: For complex issues, users can reach support via the contact page or by emailing support@{{siteEmailAddress}}.com.

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

Generate the assistant's response. Use the available tools if appropriate and instructed.
Assistant:`,
  config: {
    temperature: 0.65, // A bit more conversational
    maxOutputTokens: 250, // Allow for slightly more verbose, natural responses
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

