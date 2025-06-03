
'use client';

import { useEffect, useState } from 'react';
import { productRecommendations, type ProductRecommendationsInput } from '@/ai/flows/product-recommendations';
import { getProductById, getAllProducts } from '@/lib/data';
import type { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Zap, AlertCircle } from 'lucide-react'; // Added AlertCircle

interface ProductRecommendationsProps {
  currentProductId: string;
  viewingHistory: string[]; // IDs of viewed products
}

const MAX_RECOMMENDATIONS = 3;

export function ProductRecommendations({ currentProductId, viewingHistory }: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const historyForAI = viewingHistory.filter(id => id !== currentProductId).slice(0, 5);
        
        let recommendedProducts: Product[] = [];

        if (historyForAI.length > 0) {
          const input: ProductRecommendationsInput = { viewingHistory: historyForAI };
          const result = await productRecommendations(input);
          
          recommendedProducts = result.productRecommendations
            .map(id => getProductById(id))
            .filter((p): p is Product => p !== undefined && p.id !== currentProductId)
            .slice(0, MAX_RECOMMENDATIONS);
        }
        
        // If AI recommendations are too few or none, fill with fallback
        if (recommendedProducts.length < MAX_RECOMMENDATIONS) {
          const fallbackNeeded = MAX_RECOMMENDATIONS - recommendedProducts.length;
          const currentRecommendedIds = new Set(recommendedProducts.map(p => p.id));
          currentRecommendedIds.add(currentProductId);

          const fallbackItems = getAllProducts()
            .filter(p => !currentRecommendedIds.has(p.id)) // Exclude current product and already AI-recommended
            .sort(() => 0.5 - Math.random()) // Shuffle
            .slice(0, fallbackNeeded);
          
          recommendedProducts = [...recommendedProducts, ...fallbackItems];
        }

        setRecommendations(recommendedProducts);

      } catch (e) {
        console.error("Failed to fetch recommendations:", e);
        setError(e instanceof Error ? e.message : "Could not load recommendations at this time.");
        // Fallback on error: load random products
        const fallbackRecommendations = getAllProducts()
                                               .filter(p => p.id !== currentProductId)
                                               .sort(() => 0.5 - Math.random())
                                               .slice(0, MAX_RECOMMENDATIONS);
        setRecommendations(fallbackRecommendations);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce or delay fetching if viewingHistory changes too rapidly, or simply fetch on mount/id change.
    // For now, just fetch if currentProductId is valid.
    if (currentProductId) {
        fetchRecommendations();
    } else {
        setIsLoading(false); // No product to base recommendations on
    }
  }, [currentProductId, viewingHistory]); // Rerun if current product or history changes

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: MAX_RECOMMENDATIONS }).map((_, index) => (
           <div key={index} className="border rounded-lg p-4 shadow-lg animate-pulse">
            <div className="bg-muted aspect-[4/3] rounded mb-4"></div>
            <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-muted rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
     return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Recommendation Error</AlertTitle>
          <AlertDescription>{error} Displaying some general products instead.</AlertDescription>
        </Alert>
     );
  }

  if (recommendations.length === 0 && !isLoading) { // Ensure not to show if still loading
    return (
         <Alert variant="default" className="border-primary/30">
            <Zap className="h-4 w-4 text-primary" />
            <AlertTitle>Explore More!</AlertTitle>
            <AlertDescription>We couldn't find specific recommendations, but check out other great items in our store!</AlertDescription>
        </Alert>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {recommendations.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
