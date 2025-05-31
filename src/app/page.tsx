'use client';

import { useState, useMemo, useEffect } from 'react';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilters } from '@/components/products/ProductFilters';
import { SortDropdown, type SortOption } from '@/components/products/SortDropdown';
import { PRODUCTS, CATEGORIES } from '@/lib/data';
import type { Product, Category } from '@/types';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SearchX } from 'lucide-react';

const MAX_PRICE_DEFAULT = 500;

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<{ category: Category | 'all'; priceRange: [number, number]; rating: number }>({
    category: 'all',
    priceRange: [0, MAX_PRICE_DEFAULT],
    rating: 0,
  });
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching products
    setTimeout(() => {
      setAllProducts(PRODUCTS);
      setIsLoading(false);
    }, 500); // Simulating network delay
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = allProducts;

    if (filters.category !== 'all') {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    filtered = filtered.filter(
      p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    if (filters.rating > 0) {
      filtered = filtered.filter(p => Math.floor(p.rating) >= filters.rating);
    }

    switch (sortOption) {
      case 'price-asc':
        return [...filtered].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...filtered].sort((a, b) => b.price - a.price);
      case 'rating-desc':
        return [...filtered].sort((a, b) => b.rating - a.rating);
      case 'name-asc':
        return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return [...filtered].sort((a, b) => b.name.localeCompare(a.name));
      default:
        return filtered;
    }
  }, [allProducts, filters, sortOption]);

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
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="w-full lg:w-1/4 xl:w-1/5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
        <ProductFilters onFilterChange={setFilters} initialFilters={filters} />
      </aside>
      <section className="w-full lg:w-3/4 xl:w-4/5">
        <h1 className="text-4xl font-bold font-headline mb-4 text-primary">Discover Our Collection</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Browse through our curated selection of fine products. Use the filters to find exactly what you're looking for.
        </p>
        <SortDropdown onSortChange={setSortOption} currentSort={sortOption} />
        <Separator className="my-6" />
        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
            {filteredAndSortedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <Alert variant="default" className="mt-8 border-accent text-accent-foreground bg-accent/10">
            <SearchX className="h-5 w-5 text-accent" />
            <AlertTitle className="font-headline text-accent">No Products Found</AlertTitle>
            <AlertDescription>
              We couldn't find any products matching your current filters. Try adjusting your criteria.
            </AlertDescription>
          </Alert>
        )}
      </section>
    </div>
  );
}
