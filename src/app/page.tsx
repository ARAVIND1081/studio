
'use client';

import { ProductCard } from '@/components/products/ProductCard';
import { getAllProducts } from '@/lib/data';
import { useSiteSettings } from '@/context/SiteSettingsContext'; 
import type { Product } from '@/types';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShoppingBag, Sparkles, Info } from 'lucide-react'; // Added Sparkles, Info
import { generatePersonalizedGreeting, type PersonalizedGreetingInput } from '@/ai/flows/personalized-greeting-flow';

const HOME_PAGE_PRODUCT_LIMIT = 8;

export default function HomePage() {
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const { siteSettings, isLoading: settingsLoading } = useSiteSettings(); 

  const [personalizedGreeting, setPersonalizedGreeting] = useState<string | null>(null);
  const [isGreetingLoading, setIsGreetingLoading] = useState(true);
  const [greetingError, setGreetingError] = useState<string | null>(null);


  useEffect(() => {
    const fetchProducts = () => {
      setIsLoadingProducts(true);
      setTimeout(() => {
        const allProducts = getAllProducts();
        setDisplayedProducts(allProducts.slice(0, HOME_PAGE_PRODUCT_LIMIT)); 
        setIsLoadingProducts(false);
      }, 500); 
    };
    
    if (!settingsLoading) {
        fetchProducts();
    }

  }, [settingsLoading]);

  useEffect(() => {
    const fetchGreeting = async () => {
      if (settingsLoading) return; // Wait for site settings to load

      setIsGreetingLoading(true);
      setGreetingError(null);
      try {
        let viewingHistory: string[] = [];
        if (typeof window !== 'undefined') {
          const storedHistory = localStorage.getItem('shopSphereViewingHistory');
          if (storedHistory) {
            viewingHistory = JSON.parse(storedHistory);
          }
        }
        
        const input: PersonalizedGreetingInput = { viewingHistory, siteName: siteSettings.siteName };
        const result = await generatePersonalizedGreeting(input);
        setPersonalizedGreeting(result.greeting);
      } catch (error) {
        console.error("Failed to generate personalized greeting:", error);
        const errorMessage = error instanceof Error ? error.message : "Could not load a personalized greeting.";
        setGreetingError(errorMessage.substring(0,150)); // Show a snippet of the error
        setPersonalizedGreeting(null); // Fallback to default tagline if AI fails
      } finally {
        setIsGreetingLoading(false);
      }
    };

    fetchGreeting();
  }, [settingsLoading, siteSettings.siteName]);


  if (isLoadingProducts || settingsLoading || isGreetingLoading) {
    return (
      <div>
        <div className="mb-12 text-center">
          <div className="h-12 w-3/4 bg-muted rounded mx-auto mb-4 animate-pulse"></div> {/* Placeholder for Site Name */}
          <div className="h-6 w-full bg-muted rounded mx-auto animate-pulse"></div> {/* Placeholder for Tagline/Greeting */}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {Array.from({ length: HOME_PAGE_PRODUCT_LIMIT }).map((_, index) => (
            <div key={index} className="border rounded-lg p-4 shadow-lg">
              <div className="bg-muted aspect-[4/3] rounded animate-pulse mb-4"></div>
              <div className="h-6 bg-muted rounded animate-pulse w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded animate-pulse w-1/2 mb-2"></div>
              <div className="h-8 bg-muted rounded animate-pulse w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const displayTagline = personalizedGreeting || siteSettings.siteTagline;

  return (
    <div>
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold font-headline mb-4 text-primary">Welcome to {siteSettings.siteName}</h1>
        <p className="text-xl text-muted-foreground min-h-[2rem] flex items-center justify-center">
          {personalizedGreeting && <Sparkles className="w-5 h-5 mr-2 text-accent flex-shrink-0" />}
          {displayTagline}
        </p>
        {greetingError && !personalizedGreeting && (
          <Alert variant="destructive" className="mt-4 max-w-md mx-auto text-left text-xs">
            <Info className="h-4 w-4" />
            <AlertTitle>AI Greeting Note</AlertTitle>
            <AlertDescription>
              Could not load a personalized greeting at this time. Error: {greetingError}
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      {displayedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {displayedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <Alert variant="default" className="mt-8 border-accent text-accent-foreground bg-accent/10 max-w-md mx-auto">
            <ShoppingBag className="h-5 w-5 text-accent" />
            <AlertTitle className="font-headline text-accent">{siteSettings.homePageNoProductsTitle}</AlertTitle>
            <AlertDescription>
            {siteSettings.homePageNoProductsDescription}
            </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
