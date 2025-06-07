
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
import { searchProductsStoreTool } from '@/ai/tools/product-search-tool';

// Schema for the items in chatHistory array, as expected by the Handlebars template
const ChatHistoryMessageSchemaForTemplate = z.object({
  role: z.enum(['user', 'bot']),
  content: z.string(),
  isUser: z.boolean().describe("True if the message is from the user."), // For Handlebars
  isBot: z.boolean().describe("True if the message is from the bot/assistant."),   // For Handlebars
});

// Schema for the actual data object passed to the prompt template engine
const PromptTemplateDataSchema = z.object({
  userInput: z.string().describe('The latest message from the user.'),
  chatHistory: z.array(ChatHistoryMessageSchemaForTemplate).optional().describe('A brief history of the conversation, if any.'),
  siteName: z.string().describe('The name of the e-commerce site.'),
  siteEmailAddress: z.string().describe('The derived email address for the site (e.g., support@sitename).'), // For Handlebars
});

// Schema for the input of the exported getChatbotResponse function and the chatbotFlow
const ChatbotFunctionInputSchema = z.object({
  userInput: z.string().describe('The latest message from the user.'),
  chatHistory: z.array(z.object({ // Simpler chat history for the public API
    role: z.enum(['user', 'bot']).describe('Who sent the message.'),
    content: z.string().describe('The content of the message.'),
  })).optional().describe('A brief history of the conversation, if any. Current user input is separate.'),
  siteName: z.string().describe('The name of the e-commerce site.'),
});
export type ChatbotInput = z.infer<typeof ChatbotFunctionInputSchema>; // Public input type

// Schema for the output of the chatbot flow
const ChatbotOutputSchema = z.object({
  botResponse: z.string().describe('The chatbot\'s response to the user, potentially containing special PRODUCT_LINK directives for rendering products.'),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;

// Exported function remains the same
export async function getChatbotResponse(input: ChatbotInput): Promise<ChatbotOutput> {
  return chatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  tools: [searchProductsStoreTool],
  input: {schema: PromptTemplateDataSchema}, // Uses the detailed schema for template data
  output: {schema: ChatbotOutputSchema},
  prompt: `You are a friendly, helpful, and conversational AI assistant for the e-commerce store: {{{siteName}}}.
Your main job is to assist users with their questions about our products and store policies, and to help them find items they're looking for.
Always aim for a natural and engaging tone in your responses. Ask clarifying questions if the user's query is unclear.

Product Search and Display:
- When a user's message indicates they are looking for products (e.g., "show me red shoes", "do you have laptops?", "I need a gift for my friend"), you **MUST** use the 'searchProductsStoreTool' to find relevant items.
- **Query for the Tool**: From the user's message, extract the most important keywords that describe the product (like type, color, features). For instance, if the user says "I'm searching for some warm winter jackets, maybe in blue", a good query for the tool would be "blue winter jackets".
- **After the Tool Responds**:
    1.  **If the tool's 'products' array is NOT empty**:
        - Start by saying: "Okay, I searched for '[tool's queryUsed value]' and found these items:" (Replace '[tool's queryUsed value]' with the tool's actual 'queryUsed' value).
        - Then, for **each product object that is ACTUALLY PRESENT in the tool's 'products' array** (display a maximum of 3 products even if the tool returns more), you **MUST** create one \\\`PRODUCT_LINK\\\`.
        - **You MUST NOT list any product that is NOT explicitly found and provided in the tool's 'products' array output.** Do NOT invent, assume, or add any other products. Your response about products must be based *solely* on the tool's output.
        - For each product you list (which must be from the tool's output):
            - You **MUST** use the following special format: \\\`PRODUCT_LINK[PRODUCT_NAME|PRODUCT_ID|PRICE_STRING|IMAGE_URL]\\\`.
            - Replace \\\`PRODUCT_NAME\\\` with the product's \\\`name\\\` field **from the tool's output for that product**.
            - Replace \\\`PRODUCT_ID\\\` with the product's \\\`id\\\` field **from the tool's output for that product**.
            - Replace \\\`PRICE_STRING\\\` with the product's \\\`priceString\\\` field **from the tool's output for that product**.
            - Replace \\\`IMAGE_URL\\\` with the product's \\\`imageUrl\\\` field **from the tool's output for that product**.
        - Example if tool returns one product: "Okay, I searched for 'smartwatches' and found this: \\\`PRODUCT_LINK[Elegant Smartwatch X1|1|₹29999.00|https://placehold.co/800x600.png]\\\`. You can click on it for more details."
        - Example if tool returns two products: "Okay, I searched for 'blue shirts' and found these: \\\`PRODUCT_LINK[Blue Cotton Shirt|10|₹1299.00|https://placehold.co/800x600.png]\\\` and \\\`PRODUCT_LINK[Navy Silk Shirt|12|₹2499.00|https://placehold.co/800x600.png]\\\`."
    2.  **If the tool's 'products' array IS empty**:
        - Inform the user: "I looked for '[tool's queryUsed value]' but couldn't find any matching products right now. Perhaps try different keywords?" (Replace '[tool's queryUsed value]' with the tool's actual 'queryUsed' value).
Your response about products MUST be based *solely* on the information (especially the 'products' array and 'queryUsed' value) provided by the 'searchProductsStoreTool'. Do NOT make up product details or list products that the tool did not find.

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
    temperature: 0.2, 
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
    inputSchema: ChatbotFunctionInputSchema, // Flow uses the simpler public input schema
    outputSchema: ChatbotOutputSchema,
  },
  async (input: ChatbotInput): Promise<ChatbotOutput> => { // `input` matches ChatbotFunctionInputSchema
    // Derive siteEmailAddress from siteName
    const siteEmailAddress = input.siteName.toLowerCase().replace(/\s+/g, '');

    // Process chatHistory to add isUser and isBot flags for Handlebars
    const processedChatHistory = input.chatHistory?.map(message => ({
      ...message,
      isUser: message.role === 'user',
      isBot: message.role === 'bot',
    }));

    // Construct the data object that matches PromptTemplateDataSchema
    const promptDataForTemplate: z.infer<typeof PromptTemplateDataSchema> = {
      userInput: input.userInput,
      siteName: input.siteName,
      chatHistory: processedChatHistory, // This now matches ChatHistoryMessageSchemaForTemplate
      siteEmailAddress: siteEmailAddress,
    };

    let outputFromPrompt: ChatbotOutput | null = null;
    try {
      // Pass the fully constructed and schema-compliant data to the prompt
      const result = await prompt(promptDataForTemplate);
      outputFromPrompt = result.output;
    } catch (e) {
      console.error('[chatbotFlow] Error during prompt() execution:', e, {userInput: input.userInput, siteName: input.siteName, siteEmailAddress: siteEmailAddress});
      // Log more detailed input to prompt if possible, without exposing sensitive parts of chatHistory easily
    }

    if (!outputFromPrompt || !outputFromPrompt.botResponse) {
        console.error('[chatbotFlow] Fallback: No valid botResponse obtained. This could be due to a prompt execution error, model parsing failure, or malformed output object.', {userInput: input.userInput, receivedOutputObject: outputFromPrompt});
        return { botResponse: "I'm sorry, I encountered a hiccup. Could you please rephrase or try again?" };
    }

    return outputFromPrompt;
  }
);

