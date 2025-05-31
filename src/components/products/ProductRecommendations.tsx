
'use client';

import { useEffect, useState } from 'react';
import { productRecommendations, type ProductRecommendationsInput } from '@/ai/flows/product-recommendations';
import { getProductById, getAllProducts } from '@/lib/data'; // Changed from PRODUCTS
import type { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Zap } from 'lucide-react';

interface ProductRecommendationsProps {
  currentProductId: string;
  viewingHistory: string[]; // IDs of viewed products
}

export function ProductRecommendations({ currentProductId, viewingHistory }: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Ensure viewing history does not include current product, and is relevant.
        const historyForAI = viewingHistory.filter(id => id !== currentProductId).slice(0, 5);
        
        if (historyForAI.length === 0) {
          // Fallback: if no relevant history, recommend some popular/random items excluding current.
          const fallbackRecommendations = getAllProducts() // Use getAllProducts
                                                 .filter(p => p.id !== currentProductId)
                                                 .sort(() => 0.5 - Math.random()) // Shuffle
                                                 .slice(0, 3);
          setRecommendations(fallbackRecommendations);
          setIsLoading(false);
          return;
        }

        const input: ProductRecommendationsInput = { viewingHistory: historyForAI };
        const result = await productRecommendations(input);
        
        const recommendedProducts = result.productRecommendations
          .map(id => getProductById(id))
          .filter((p): p is Product => p !== undefined && p.id !== currentProductId) // Ensure product exists and is not the current one
          .slice(0, 3); // Limit to 3 recommendations

        setRecommendations(recommendedProducts);
      } catch (e) {
        console.error("Failed to fetch recommendations:", e);
        setError("Could not load recommendations at this time.");
        // Fallback on error
        const fallbackRecommendations = getAllProducts() // Use getAllProducts
                                               .filter(p => p.id !== currentProductId)
                                               .sort(() => 0.5 - Math.random())
                                               .slice(0, 3);
        setRecommendations(fallbackRecommendations);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [currentProductId, viewingHistory]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
           <div key={index} className="border rounded-lg p-4 shadow-lg">
            <div className="bg-muted aspect-[4/3] rounded animate-pulse mb-4"></div>
            <div className="h-6 bg-muted rounded animate-pulse w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded animate-pulse w-1/2 mb-2"></div>
            <div className="h-8 bg-muted rounded animate-pulse w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
     return (
        <Alert variant="destructive">
          <Zap className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
     );
  }

  if (recommendations.length === 0) {
    return <p className="text-muted-foreground">No recommendations available right now.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recommendations.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
