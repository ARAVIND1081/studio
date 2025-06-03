
'use client';

import { useEffect, useState } from 'react';
import { productRecommendations, type ProductRecommendationsInput } from '@/ai/flows/product-recommendations';
import { getProductById, getAllProducts } from '@/lib/data';
import type { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Zap, AlertCircle } from 'lucide-react'; 

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
      let newRecommendationsList: Product[] = [];

      try {
        const historyForAI = viewingHistory.filter(id => id !== currentProductId).slice(0, 5);
        
        if (historyForAI.length > 0) {
          const input: ProductRecommendationsInput = { viewingHistory: historyForAI };
          const result = await productRecommendations(input);
          
          newRecommendationsList = result.productRecommendations
            .map(id => getProductById(id))
            .filter((p): p is Product => p !== undefined && p.id !== currentProductId)
            .slice(0, MAX_RECOMMENDATIONS);
        }
        
        // If AI recommendations are too few or none, fill with fallback
        if (newRecommendationsList.length < MAX_RECOMMENDATIONS) {
          const fallbackNeeded = MAX_RECOMMENDATIONS - newRecommendationsList.length;
          const currentRecommendedIds = new Set(newRecommendationsList.map(p => p.id));
          currentRecommendedIds.add(currentProductId);

          const fallbackItems = getAllProducts()
            .filter(p => !currentRecommendedIds.has(p.id)) 
            .sort(() => 0.5 - Math.random()) 
            .slice(0, fallbackNeeded);
          
          newRecommendationsList = [...newRecommendationsList, ...fallbackItems];
        }
        setRecommendations(newRecommendationsList);

      } catch (e) {
        const rawErrorMessage = e instanceof Error ? e.message : "Unknown error fetching recommendations";
        console.error(`[ProductRecommendations] Handled AI recommendation error: ${rawErrorMessage}. Displaying fallback products.`);
        
        let displayErrorMessage = "Could not load AI recommendations at this time. Showing some other suggestions.";
        if (rawErrorMessage.includes("503") || rawErrorMessage.toLowerCase().includes("service unavailable") || rawErrorMessage.toLowerCase().includes("model is overloaded")) {
          displayErrorMessage = "AI recommendations are temporarily unavailable due to high demand. Showing some other suggestions instead.";
        }
        setError(displayErrorMessage);
        
        // Fallback on error: load random products
        try {
          const fallbackOnError = getAllProducts()
                                                 .filter(p => p.id !== currentProductId)
                                                 .sort(() => 0.5 - Math.random())
                                                 .slice(0, MAX_RECOMMENDATIONS);
          setRecommendations(fallbackOnError);
        } catch (fallbackCatchError) {
            console.error("[ProductRecommendations] Critical error: Failed to load even fallback recommendations:", fallbackCatchError);
            setRecommendations([]); 
            setError("Could not load any recommendations at this moment. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (currentProductId) {
        fetchRecommendations().catch(unhandledError => {
          // Safety net for unhandled promise rejections from fetchRecommendations itself
          console.error("[ProductRecommendations] Unhandled error in fetchRecommendations promise chain:", unhandledError);
          if (!error) { // If no specific error was set by the inner catch
             setError("An unexpected error occurred while fetching recommendations. Displaying general suggestions.");
          }
           // Ensure fallback is attempted if not already done or if recommendations are empty
          if (recommendations.length === 0) {
            try {
              const fallbackOnError = getAllProducts()
                .filter(p => p.id !== currentProductId)
                .sort(() => 0.5 - Math.random())
                .slice(0, MAX_RECOMMENDATIONS);
              setRecommendations(fallbackOnError);
            } catch (superFallbackError) {
              console.error("[ProductRecommendations] Critical error in final fallback:", superFallbackError);
              setRecommendations([]);
            }
          }
          setIsLoading(false);
        });
    } else {
        setIsLoading(false); 
        setRecommendations([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProductId, viewingHistory]); // error was removed from deps to prevent re-fetch loops on error state change

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

  // If after loading, there are no recommendations and no specific error state was set for the AI call,
  // it implies a general lack of recommendations rather than a hard failure.
  if (recommendations.length === 0 && !error && !isLoading) {
    return (
         <Alert variant="default" className="border-primary/30">
            <Zap className="h-4 w-4 text-primary" />
            <AlertTitle>Explore More!</AlertTitle>
            <AlertDescription>We couldn't find specific recommendations, but check out other great items in our store!</AlertDescription>
        </Alert>
    );
  }

  return (
    <div>
      {error && !isLoading && ( 
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Recommendation Issue</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {recommendations.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      {recommendations.length === 0 && error && !isLoading && (
         <Alert variant="default" className="border-primary/30 mt-4">
            <Zap className="h-4 w-4 text-primary" />
            <AlertTitle>More to See</AlertTitle>
            <AlertDescription>While specific recommendations are unavailable, browse our full collection!</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
