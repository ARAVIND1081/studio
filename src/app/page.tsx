
'use client';

import { ProductCard } from '@/components/products/ProductCard';
import { getAllProducts, getSiteSettings } from '@/lib/data';
import type { Product, SiteSettings } from '@/types';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShoppingBag } from 'lucide-react';

const HOME_PAGE_PRODUCT_LIMIT = 8;

export default function HomePage() {
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSiteSettings, setCurrentSiteSettings] = useState<SiteSettings>({
    siteName: "ShopSphere",
    siteTagline: "Your premier destination for luxury and style. Explore our curated collection.",
    homePageNoProductsTitle: "Our Shelves Are Being Restocked!",
    homePageNoProductsDescription: "We're currently updating our inventory with exciting new products. Please check back soon!",
  });

  useEffect(() => {
    const settings = getSiteSettings();
    setCurrentSiteSettings(settings);
    
    setTimeout(() => {
      const allProducts = getAllProducts();
      setDisplayedProducts(allProducts.slice(0, HOME_PAGE_PRODUCT_LIMIT)); 
      setIsLoading(false);
    }, 500); 
  }, []);

  if (isLoading) {
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
        <h1 className="text-5xl font-bold font-headline mb-4 text-primary">Welcome to {currentSiteSettings.siteName}</h1>
        <p className="text-xl text-muted-foreground">
          {currentSiteSettings.siteTagline}
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
            <AlertTitle className="font-headline text-accent">{currentSiteSettings.homePageNoProductsTitle}</AlertTitle>
            <AlertDescription>
            {currentSiteSettings.homePageNoProductsDescription}
            </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
