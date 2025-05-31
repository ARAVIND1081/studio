
'use client';

import { ProductCard } from '@/components/products/ProductCard';
import { PRODUCTS } from '@/lib/data';
import type { Product } from '@/types';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShoppingBag } from 'lucide-react';

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching products
    setTimeout(() => {
      setAllProducts(PRODUCTS);
      setIsLoading(false);
    }, 500); // Simulating network delay
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
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
        <h1 className="text-5xl font-bold font-headline mb-4 text-primary">Welcome to ShopSphere</h1>
        <p className="text-xl text-muted-foreground">
          Discover our exclusive collection of curated products.
        </p>
      </div>
      
      {allProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {allProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <Alert variant="default" className="mt-8 border-accent text-accent-foreground bg-accent/10 max-w-md mx-auto">
            <ShoppingBag className="h-5 w-5 text-accent" />
            <AlertTitle className="font-headline text-accent">No Products Available</AlertTitle>
            <AlertDescription>
            We're currently updating our inventory. Please check back later to see our amazing products!
            </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
