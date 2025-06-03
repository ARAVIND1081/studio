
'use client';

import { ProductCard } from '@/components/products/ProductCard';
import { getAllProducts } from '@/lib/data';
import { useSiteSettings } from '@/context/SiteSettingsContext'; // Import useSiteSettings
import type { Product, SiteSettings } from '@/types';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShoppingBag } from 'lucide-react';

const HOME_PAGE_PRODUCT_LIMIT = 8;

export default function HomePage() {
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { siteSettings, isLoading: settingsLoading } = useSiteSettings(); // Use context for site settings


  useEffect(() => {
    // Data fetching logic can remain, but site settings come from context
    const fetchData = () => {
      setIsLoading(true);
      setTimeout(() => {
        const allProducts = getAllProducts();
        setDisplayedProducts(allProducts.slice(0, HOME_PAGE_PRODUCT_LIMIT)); 
        setIsLoading(false); // Set loading to false after products are set
      }, 500); 
    };
    
    // Fetch product data once settings are available or if settings are not loading.
    // This ensures settings are applied correctly if they affect product display or other elements.
    if (!settingsLoading) {
        fetchData();
    }

  }, [settingsLoading]); // Re-run if settingsLoading changes (e.g. from true to false)


  if (isLoading || settingsLoading) { // Check both loading states
    return (
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
    );
  }

  return (
    <div>
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold font-headline mb-4 text-primary">Welcome to {siteSettings.siteName}</h1>
        <p className="text-xl text-muted-foreground">
          {siteSettings.siteTagline}
        </p>
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
