'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowDownUp } from 'lucide-react';

export type SortOption = 'price-asc' | 'price-desc' | 'rating-desc' | 'name-asc' | 'name-desc' | 'default';

interface SortDropdownProps {
  onSortChange: (sortOption: SortOption) => void;
  currentSort: SortOption;
}

export function SortDropdown({ onSortChange, currentSort }: SortDropdownProps) {
  return (
    <div className="mb-6 flex items-center justify-end space-x-2">
      <ArrowDownUp className="h-5 w-5 text-accent" />
      <Label htmlFor="sort-products" className="text-base">Sort by:</Label>
      <Select value={currentSort} onValueChange={(value: SortOption) => onSortChange(value)}>
        <SelectTrigger id="sort-products" className="w-[200px]">
          <SelectValue placeholder="Sort products" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default</SelectItem>
          <SelectItem value="price-asc">Price: Low to High</SelectItem>
          <SelectItem value="price-desc">Price: High to Low</SelectItem>
          <SelectItem value="rating-desc">Rating: High to Low</SelectItem>
          <SelectItem value="name-asc">Name: A to Z</SelectItem>
          <SelectItem value="name-desc">Name: Z to A</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
