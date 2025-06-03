
'use server';
/**
 * @fileOverview An AI flow to generate style combinations for a product.
 *
 * - generateProductStyleCombinations - A function that handles the style combination generation.
 * - ProductStyleCombinationsInput - The input type for the generateProductStyleCombinations function.
 * - ProductStyleCombinationsOutput - The return type for the generateProductStyleCombinations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ProductStyleCombinationsInputSchema = z.object({
  productName: z.string().describe('The name of the primary product.'),
  productDescription: z.string().describe('The description of the primary product.'),
  productCategory: z.string().describe('The category of the primary product.'),
});
export type ProductStyleCombinationsInput = z.infer<typeof ProductStyleCombinationsInputSchema>;

const ComplementaryProductCategorySchema = z.object({
  category: z.string().describe("A general product category (e.g., 'Jeans', 'Sneakers', 'Lamps', 'Throw Pillows') that complements the primary product for this theme."),
  // reason: z.string().optional().describe("A brief (1 sentence) reason why this category fits the theme with the primary product.")
});

const ProductStyleCombinationSchema = z.object({
  themeName: z.string().describe("A short, catchy name for the style combination or theme (e.g., 'Urban Explorer', 'Cozy Evening In', 'Modern Minimalist Office')."),
  complementaryProductCategories: z.array(ComplementaryProductCategorySchema)
    .min(1)
    .max(2)
    .describe("A list of 1 or 2 product categories that would complement the primary product for this theme."),
});

export const ProductStyleCombinationsOutputSchema = z.object({
  combinations: z.array(ProductStyleCombinationSchema)
    .min(1)
    .max(2) // Suggest 1 or 2 themes in total.
    .describe("A list of 1 or 2 style combinations or themes, each featuring the primary product and complementary categories."),
});
export type ProductStyleCombinationsOutput = z.infer<typeof ProductStyleCombinationsOutputSchema>;


export async function generateProductStyleCombinations(input: ProductStyleCombinationsInput): Promise<ProductStyleCombinationsOutput> {
  return productStyleCombinationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productStyleCombinationsPrompt',
  input: {schema: ProductStyleCombinationsInputSchema},
  output: {schema: ProductStyleCombinationsOutputSchema},
  prompt: `You are a fashion and lifestyle stylist for an e-commerce store called ShopSphere.
Given the details of a primary product, your task is to suggest 1 or 2 distinct 'style combinations' or 'looks' that feature this primary product.

For each combination, you must provide:
1. A short, catchy \`themeName\` (e.g., 'Urban Explorer Wear', 'Cozy Reading Nook', 'Elegant Dinner Party Attire', 'Minimalist Workspace').
2. A list of 1 or 2 \`complementaryProductCategories\`. These should be general product categories (e.g., 'Sneakers', 'Jeans', 'Floor Lamp', 'Scented Candles', 'Statement Necklace', 'Bookshelf Speakers') that would pair well with the primary product to achieve the theme.
   - The categories should generally be different from the primary product's category.
   - The categories within the same theme should be different from each other.
   - Ensure the suggested categories are common and likely to be found in a general e-commerce store.

Primary Product Details:
Name: {{{productName}}}
Description: {{{productDescription}}}
Category: {{{productCategory}}}

Please provide your suggestions in the structured format requested.
Focus on creating appealing and logical combinations.
Example for a 'Luxury Silk Scarf' (Apparel):
Combination 1:
  themeName: "Chic Daytime Elegance"
  complementaryProductCategories: [{category: "Blazers"}, {category: "Tailored Trousers"}]
Combination 2:
  themeName: "Evening Glamour"
  complementaryProductCategories: [{category: "Evening Dresses"}, {category: "Clutch Bags"}]

Example for a 'Modern Desk Lamp' (Home Goods):
Combination 1:
  themeName: "Productive Workspace"
  complementaryProductCategories: [{category: "Office Chairs"}, {category: "Desk Organizers"}]
`,
  config: {
    temperature: 0.7,
  }
});

const productStyleCombinationsFlow = ai.defineFlow(
  {
    name: 'productStyleCombinationsFlow',
    inputSchema: ProductStyleCombinationsInputSchema,
    outputSchema: ProductStyleCombinationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("Failed to generate product style combinations. The AI model did not return an output.");
    }
    // Basic validation for category names - ensure they are not excessively long or contain unusual characters.
    output.combinations.forEach(combo => {
      combo.complementaryProductCategories.forEach(compCat => {
        if (compCat.category.length > 50 || !/^[a-zA-Z0-9\s\-']+$/.test(compCat.category)) {
          console.warn(`Potentially problematic category from AI: ${compCat.category}`);
          // Potentially sanitize or reject here if needed, for now, just log.
        }
      });
    });

    return output;
  }
);

