
'use server';
/**
 * @fileOverview An AI flow to generate an evocative ambiance or story for a product.
 *
 * - generateProductAmbiance - A function that handles the product ambiance generation.
 * - ProductAmbianceInput - The input type for the generateProductAmbiance function.
 * - ProductAmbianceOutput - The return type for the generateProductAmbiance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductAmbianceInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productDescription: z.string().describe('The description of the product.'),
});
export type ProductAmbianceInput = z.infer<typeof ProductAmbianceInputSchema>;

const ProductAmbianceOutputSchema = z.object({
  ambiance: z
    .string()
    .describe('A short, evocative story or ambiance text for the product (2-3 sentences).'),
});
export type ProductAmbianceOutput = z.infer<typeof ProductAmbianceOutputSchema>;

export async function generateProductAmbiance(input: ProductAmbianceInput): Promise<ProductAmbianceOutput> {
  return productAmbianceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productAmbiancePrompt',
  input: {schema: ProductAmbianceInputSchema},
  output: {schema: ProductAmbianceOutputSchema},
  prompt: `You are a creative marketing assistant for a luxury e-commerce brand called ShopSphere.
Your task is to generate a short (2-3 sentences, max 150 characters) and evocative 'ambiance' or 'story snippet' that captures the essence and feeling of owning or using the provided product.
Focus on aspirational, sensory details, and the lifestyle associated with the product.

Product Name: {{{productName}}}
Product Description: {{{productDescription}}}

Generated Ambiance:`,
  config: {
    temperature: 0.8, // Slightly more creative
  }
});

const productAmbianceFlow = ai.defineFlow(
  {
    name: 'productAmbianceFlow',
    inputSchema: ProductAmbianceInputSchema,
    outputSchema: ProductAmbianceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.ambiance) { // Also check if ambiance field itself is present
        // Log the problematic input and (lack of) output for easier debugging
        console.error('[productAmbianceFlow] AI model returned no structured output or missing ambiance field.', {input, receivedOutput: output});
        throw new Error("Failed to generate product ambiance. The AI model did not return the expected output structure.");
    }
    return output;
  }
);

