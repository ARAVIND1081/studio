
'use server';
/**
 * @fileOverview A Genkit tool for searching products in the e-commerce store.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getAllProducts } from '@/lib/data';
import type { Product } from '@/types';

const MAX_SEARCH_RESULTS = 4;

const ProductSearchInputSchema = z.object({
  query: z.string().describe("The user's search query for products. This could be a product name, category, keyword, or partial description."),
});
export type ProductSearchInput = z.infer<typeof ProductSearchInputSchema>;

const ProductSearchResultItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  category: z.string(),
  imageUrl: z.string().optional().describe("A URL to an image of the product."),
});

const ProductSearchOutputSchema = z.object({
  products: z.array(ProductSearchResultItemSchema).describe(`A list of matching products, up to ${MAX_SEARCH_RESULTS} items. If no products are found, this array will be empty.`),
  queryUsed: z.string().describe("The original query used for the search."),
});
export type ProductSearchOutput = z.infer<typeof ProductSearchOutputSchema>;

export const searchProductsStoreTool = ai.defineTool(
  {
    name: 'searchProductsStoreTool',
    description: "Searches the e-commerce store's product catalog based on a user's query. Use this when a user asks to find products, look for items, or inquires about product availability by type or name. Returns a list of matching products.",
    inputSchema: ProductSearchInputSchema,
    outputSchema: ProductSearchOutputSchema,
  },
  async (input: ProductSearchInput): Promise<ProductSearchOutput> => {
    const allProducts = getAllProducts();
    const query = input.query.toLowerCase().trim();

    if (!query) {
      return { products: [], queryUsed: input.query };
    }

    const filteredProducts = allProducts.filter(product => {
      return (
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    });

    const resultProducts = filteredProducts.slice(0, MAX_SEARCH_RESULTS).map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      category: p.category,
      imageUrl: p.imageUrl,
    }));

    return { products: resultProducts, queryUsed: input.query };
  }
);
