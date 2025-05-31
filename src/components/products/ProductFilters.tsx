'use client';

import { useState } from 'react';
import { CATEGORIES } from '@/lib/data';
import type { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, Star, X } from 'lucide-react';

interface ProductFiltersProps {
  onFilterChange: (filters: { category: Category | 'all'; priceRange: [number, number]; rating: number }) => void;
  initialFilters: { category: Category | 'all'; priceRange: [number, number]; rating: number };
}

const MAX_PRICE = 500; // Example max price

export function ProductFilters({ onFilterChange, initialFilters }: ProductFiltersProps) {
  const [category, setCategory] = useState<Category | 'all'>(initialFilters.category);
  const [priceRange, setPriceRange] = useState<[number, number]>(initialFilters.priceRange);
  const [rating, setRating] = useState<number>(initialFilters.rating);

  const handleApplyFilters = () => {
    onFilterChange({ category, priceRange, rating });
  };

  const handleResetFilters = () => {
    setCategory('all');
    setPriceRange([0, MAX_PRICE]);
    setRating(0);
    onFilterChange({ category: 'all', priceRange: [0, MAX_PRICE], rating: 0 });
  };

  return (
    <Card className="mb-8 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl font-headline">
          <Filter className="mr-2 h-5 w-5 text-accent" /> Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="category-filter" className="text-base">Category</Label>
          <Select value={category} onValueChange={(value: Category | 'all') => setCategory(value)}>
            <SelectTrigger id="category-filter" className="w-full mt-1">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="price-range-filter" className="text-base">Price Range: ${priceRange[0]} - ${priceRange[1]}</Label>
          <Slider
            id="price-range-filter"
            min={0}
            max={MAX_PRICE}
            step={10}
            value={[priceRange[0], priceRange[1]]}
            onValueChange={(value: [number, number]) => setPriceRange(value)}
            className="mt-2 [&>span:first-child>span]:bg-accent [&>span:last-child]:bg-accent"
          />
        </div>

        <div>
          <Label htmlFor="rating-filter" className="text-base">Minimum Rating</Label>
          <div className="flex space-x-1 mt-1">
            {[1, 2, 3, 4, 5].map(r => (
              <Button
                key={r}
                variant={rating === r ? "default" : "outline"}
                onClick={() => setRating(r === rating ? 0 : r)}
                className={`flex-1 ${rating === r ? 'bg-accent text-accent-foreground hover:bg-accent/90' : 'hover:border-accent'}`}
              >
                {r} <Star className="ml-1 h-4 w-4 fill-current" />
              </Button>
            ))}
          </div>
        </div>
        
        <div className="flex space-x-2 pt-4">
          <Button onClick={handleApplyFilters} className="w-full bg-primary hover:bg-accent hover:text-accent-foreground transition-colors">
            <Filter className="mr-2 h-4 w-4" /> Apply Filters
          </Button>
          <Button onClick={handleResetFilters} variant="outline" className="w-full hover:border-accent hover:text-accent">
            <X className="mr-2 h-4 w-4" /> Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
