
'use client';

import Link from 'next/link';
import { ShoppingCart, Search } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

export function Header() {
  const { getItemCount } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const itemCount = mounted ? getItemCount() : 0;

  return (
    <header className="bg-background shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-3xl font-bold font-headline text-primary hover:text-accent transition-colors">
          ShopSphere
        </Link>
        <nav className="space-x-6 flex items-center">
          <Link href="/" className="text-foreground hover:text-accent transition-colors">
            Home
          </Link>
          <Link href="/shop" className="text-foreground hover:text-accent transition-colors">
            Products
          </Link>
          <Link href="/contact" className="text-foreground hover:text-accent transition-colors">
            Contact
          </Link>
          {/* Future search bar implementation
          <div className="relative">
            <Input type="search" placeholder="Search products..." className="pl-10 w-64" />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          */}
          <Link href="/cart" passHref>
            <Button variant="ghost" size="icon" className="relative text-foreground hover:text-accent hover:bg-accent/10">
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 bg-accent text-accent-foreground rounded-full h-6 w-6 flex items-center justify-center text-xs">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
