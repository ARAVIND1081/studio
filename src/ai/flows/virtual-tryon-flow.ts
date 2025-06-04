
'use server';
/**
 * @fileOverview An AI flow to generate a virtual try-on image.
 *
 * - generateVirtualTryOnImage - Generates an image of a user with a product.
 * - VirtualTryOnInput - Input type for the generation.
 * - VirtualTryOnOutput - Output type for the generation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VirtualTryOnInputSchema = z.object({
  userPhotoDataUri: z.string().describe("A photo of the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  productPhotoUrl: z.string().describe('The URL of the product image (can be HTTP/HTTPS or a data URI).'),
  productName: z.string().describe('The name of the product.'),
  productCategory: z.string().describe('The category of the product (e.g., "Shoes", "Hat", "Shirt"). Helps guide the AI on how the product is worn.'),
});
export type VirtualTryOnInput = z.infer<typeof VirtualTryOnInputSchema>;

const VirtualTryOnOutputSchema = z.object({
  generatedImageDataUri: z.string().describe('The generated image as a data URI.'),
});
export type VirtualTryOnOutput = z.infer<typeof VirtualTryOnOutputSchema>;

export async function generateVirtualTryOnImage(input: VirtualTryOnInput): Promise<VirtualTryOnOutput> {
  return virtualTryOnFlow(input);
}

const virtualTryOnFlow = ai.defineFlow(
  {
    name: 'virtualTryOnFlow',
    inputSchema: VirtualTryOnInputSchema,
    outputSchema: VirtualTryOnOutputSchema,
  },
  async (input) => {
    const generationPrompt = [
      {
        text: `You are an expert AI image generation assistant specializing in virtual try-on.
Your task is to create a new image.
The new image should show the person from the 'User Photo' appearing to naturally wear or use the product (named "${input.productName}", which is a type of "${input.productCategory}") shown in the 'Product Photo'.

Instructions for the AI:
- Integrate the product seamlessly onto the person.
- Pay close attention to perspective, lighting, shadows, and how the product category (${input.productCategory}) would typically be worn or used. For example:
    - If it's a shoe, the person should be wearing the shoe on their feet.
    - If it's a hat, it should be on their head.
    - If it's a shirt, it should be on their torso.
    - If it's an accessory like a bag, it should be held or worn appropriately.
- The person's pose, facial features, and body shape from the 'User Photo' should be preserved as much as possible.
- The background can be inspired by the user's photo or a neutral studio setting if the user's background is too complex or distracting.
- Aim for a realistic and high-quality result. If the product is a piece of clothing, try to make it look like it fits the person appropriately, without significant distortion of the product or person.
- Do not include any text overlays, watermarks, or annotations on the generated image. Only output the final composed image.
- If the request is unclear or impossible (e.g. trying to "wear" a car), generate an image of the user alongside the product in an appropriate setting.
User Photo (first image): The person to feature.
Product Photo (second image): The product to integrate.
`,
      },
      { media: { url: input.userPhotoDataUri } }, // User photo
      { media: { url: input.productPhotoUrl } },  // Product photo
    ];

    try {
      const { media, text } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp', 
        prompt: generationPrompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'], 
          safetySettings: [
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
          // You might need to adjust temperature or other parameters for desired creativity/realism
          // temperature: 0.4, // Example: lower temperature for more deterministic/less random outputs
        },
      });
      
      if (text) {
        console.log('[virtualTryOnFlow] AI Text Output:', text);
      }

      if (!media || !media.url) {
        console.error('[virtualTryOnFlow] AI model did not return an image.', {input, textOutput: text});
        throw new Error('The AI model did not return an image. It might have been a text-only response or an issue with generation.');
      }
      return { generatedImageDataUri: media.url };

    } catch (error) {
      console.error('[virtualTryOnFlow] Error during AI image generation:', error);
      if (error instanceof Error && (error.message.includes('filtered by safety policy') || error.message.includes('blocked for safety reasons'))) {
          throw new Error('The image generation request was blocked by safety filters. Please try a different user image or product.');
      }
      if (error instanceof Error && (error.message.includes('Deadline exceeded') || error.message.includes('503') || error.message.includes('model is overloaded'))) {
          throw new Error('The AI image generation service is currently unavailable or timed out. Please try again later.');
      }
      if (error instanceof Error && error.message.includes('Invalid input image')) {
          throw new Error('One of the provided images (user or product) is invalid or could not be processed. Please try different images.');
      }
      throw new Error(`Failed to generate virtual try-on image. ${error instanceof Error ? error.message.substring(0, 200) : 'An unknown error occurred'}`);
    }
  }
);

