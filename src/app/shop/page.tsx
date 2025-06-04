
'use client';

import { useState, useMemo, useEffect } from 'react';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductFilters } from '@/components/products/ProductFilters';
import { SortDropdown, type SortOption } from '@/components/products/SortDropdown';
import { getAllProducts, CATEGORIES } from '@/lib/data'; 
import type { Product, Category } from '@/types';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from '@/components/ui/input';
import { SearchX, Search } from 'lucide-react';

const MAX_PRICE_DEFAULT_INR = 60000; // Adjusted for tax-inclusive prices (approx 50000 * 1.18)

export default function ShopPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<{ category: Category | 'all'; priceRange: [number, number]; rating: number }>({
    category: 'all',
    priceRange: [0, MAX_PRICE_DEFAULT_INR],
    rating: 0,
  });
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Removed setTimeout
    setAllProducts(getAllProducts()); 
    setIsLoading(false);
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = allProducts;

    // 1. Filter by search term
    if (searchTerm.trim() !== '') {
      const lowercasedSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(lowercasedSearchTerm) ||
        product.description.toLowerCase().includes(lowercasedSearchTerm) ||
        product.category.toLowerCase().includes(lowercasedSearchTerm)
      );
    }

    // 2. Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    // 3. Filter by price range
    filtered = filtered.filter(
      p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // 4. Filter by rating
    if (filters.rating > 0) {
      filtered = filtered.filter(p => Math.floor(p.rating) >= filters.rating);
    }

    // 5. Sort
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
  }, [allProducts, filters, sortOption, searchTerm]);

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
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline mb-4 text-primary">Explore Our Collection</h1>
        <p className="text-lg text-muted-foreground">
          Use the filters and sorting options to discover your next favorite item. All prices include tax.
        </p>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search products by name, category, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-base rounded-md shadow-sm border-input focus:border-primary focus:ring-primary"
        />
      </div>
      
      <div className="flex flex-col lg:flex-row lg:items-start gap-8">
        <aside className="w-full lg:w-1/4 xl:w-1/5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <ProductFilters 
            onFilterChange={setFilters} 
            initialFilters={{
                ...filters, 
                priceRange: filters.priceRange[1] > MAX_PRICE_DEFAULT_INR ? [0, MAX_PRICE_DEFAULT_INR] : filters.priceRange 
            }}
          />
        </aside>
        <section className="w-full lg:w-3/4 xl:w-4/5">
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
                We couldn't find any products matching your current search and filters. Try adjusting your criteria or check back later!
              </AlertDescription>
            </Alert>
          )}
        </section>
      </div>
    </div>
  );
}
