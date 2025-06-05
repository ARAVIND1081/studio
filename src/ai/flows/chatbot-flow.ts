
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

- **VERY IMPORTANT: Formulating the Search Query for the Tool:**
    - Your most critical task before using the tool is to extract **only the essential product keywords** from the user's message.
    - Strip away all conversational phrases, questions, greetings, or unrelated topics. Focus on nouns (e.g., "shirt", "laptop"), adjectives describing products (e.g., "blue", "large"), and categories (e.g., "electronics", "apparel").
    - **Example:**
        - User says: "Hey there, I was wondering if you could show me some elegant black dresses, and maybe also what your shipping time is?"
        - **Correct query for the tool:** "elegant black dresses" OR "black dresses" OR "dresses"
        - **INCORRECT query for the tool:** "elegant black dresses and shipping time" OR "show me elegant black dresses"
    - If the user's message is very noisy or contains no clear product terms, do not use the tool for product search in that turn. Instead, you can ask for clarification or address other parts of their query if applicable.

- After the 'searchProductsStoreTool' has executed, its output will include a 'products' array (which may be empty or contain product items) and a 'queryUsed' string (this is the query the tool actually used).

- **Interpreting Tool Output (Follow these steps strictly):**

    1.  **IF the 'products' array in the tool's output IS NOT EMPTY:**
        - You MUST begin your response by stating: "Okay, I found these items based on your search for '[tool's queryUsed value]':" (Replace '[tool's queryUsed value]' with the actual 'queryUsed' string from the tool's output).
        - Then, you MUST list up to 3 products. For each product mention **within your text response**:
            - You **MUST** use the following special format: \`PRODUCT_LINK[PRODUCT_NAME|PRODUCT_ID|PRICE_STRING|IMAGE_URL]\`.
            - Replace \`PRODUCT_NAME\` with the product's name.
            - Replace \`PRODUCT_ID\` with the product's \`id\`.
            - Replace \`PRICE_STRING\` with the formatted price (e.g., ₹29999.00).
            - Replace \`IMAGE_URL\` with the \`imageUrl\` from the tool's output for that product.
            - If the \`imageUrl\` for a product is missing or undefined from the tool, you **MUST** use the placeholder \`https://placehold.co/50x50.png\` as the \`IMAGE_URL\` in the \`PRODUCT_LINK[...]\` block for that product.
        - Example of a sentence in your response: "Okay, I found these items based on your search for 'smartwatches': PRODUCT_LINK[Elegant Smartwatch X1|1|₹29999.00|https://placehold.co/800x600.png] and PRODUCT_LINK[TechWatch Pro|2|₹19999.00|https://placehold.co/800x600.png]. You can click on them to see more details."
        - Ensure the \`PRODUCT_LINK[...]\` block is part of your conversational response.
        - After listing the products, you can add: "You can find more details on their respective pages or ask me more about one of these."

    2.  **IF the 'products' array in the tool's output IS EMPTY:**
        - You MUST state: "I searched for '[tool's queryUsed value]' but couldn't find any matching products right now." (Replace '[tool's queryUsed value]' with the actual 'queryUsed' string from the tool's output).
        - Then, you can suggest: "You could try different keywords, or browse our Shop page for more options."
        - Example: "I searched for 'exotic blue widgets' but couldn't find any matching products right now. You could try different keywords, or browse our Shop page for more options."


- If a user asks about a very specific item by name and its availability (e.g., "Is the 'Azure Silk Blouse' in stock in size M?"):
    - First, use the 'searchProductsStoreTool' with the product name (e.g., "Azure Silk Blouse").
    - If the 'products' array from the tool indicates the product exists (meaning the product has an entry): "We do have the PRODUCT_LINK[Azure Silk Blouse|prod_id_from_tool|₹price_from_tool|image_url_from_tool]. For specific details like size availability and stock, please check its page by clicking on it."
    - Do NOT invent availability details like "Yes, it's in stock in size M."

- Your role is to assist and guide. You cannot complete purchases, add items to a cart, or provide real-time inventory status beyond what the search tool offers (which is primarily product existence and basic details).
- Avoid making up products, prices, or features.

Store Policies (for your reference, respond based on this information):
- Shipping: Standard shipping is 5-7 business days. Expedited is 2-3 days. Free shipping on orders over ₹5000.
- Returns: 30-day return policy for unused items in original packaging. Contact support to initiate a return.
- Product Availability (general policy): If a product is out of stock on its page, users can usually find an option to be notified when it's back.
- Payment Methods: We accept Credit/Debit Cards, UPI, Net Banking, and Cash on Delivery.
- Contact: For complex issues, users can reach support via the contact page or by emailing support@{{{siteEmailAddress}}}.com.

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

Generate the assistant's response. Use the available tools if appropriate and instructed, and carefully follow the rules for interpreting their output.
Assistant:`,
  config: {
    temperature: 0.65,
    maxOutputTokens: 350, // Increased slightly to accommodate product link syntax
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
    }

    if (!outputFromPrompt || !outputFromPrompt.botResponse) {
        console.error('[chatbotFlow] Fallback: No valid botResponse obtained. This could be due to a prompt execution error, model parsing failure, or malformed output object.', {inputDetails: input, receivedOutputObject: outputFromPrompt});
        return { botResponse: "I'm sorry, I encountered a hiccup. Could you please rephrase or try again?" };
    }

    return outputFromPrompt;
  }
);

    