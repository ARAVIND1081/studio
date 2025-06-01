
'use client';

import Link from 'next/link';
import { ShoppingCart, Shield, LogIn, UserPlus, LogOut, UserCircle2, ListOrdered } from 'lucide-react'; // Added ListOrdered
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { getSiteSettings } from '@/lib/data';
import { useAuth } from '@/context/AuthContext'; 

export function Header() {
  const { getItemCount } = useCart();
  const { currentUser, logout, isLoading } = useAuth(); 
  const [mounted, setMounted] = useState(false);
  const [siteName, setSiteName] = useState("ShopSphere");

  useEffect(() => {
    setMounted(true);
    const settings = getSiteSettings();
    setSiteName(settings.siteName);
  }, []);

  const itemCount = mounted ? getItemCount() : 0;

  if (isLoading && mounted) {
    return (
      <header className="bg-background shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold font-headline text-primary hover:text-accent transition-colors">
            {siteName}
          </Link>
          <nav className="space-x-4 flex items-center">
            <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
            <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
            <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
          </nav>
        </div>
      </header>
    );
  }


  return (
    <header className="bg-background shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-3xl font-bold font-headline text-primary hover:text-accent transition-colors">
          {siteName}
        </Link>
        <nav className="space-x-1 sm:space-x-2 md:space-x-4 flex items-center flex-wrap">
          <Link href="/" className="text-foreground hover:text-accent transition-colors px-1 md:px-0">
            Home
          </Link>
          <Link href="/shop" className="text-foreground hover:text-accent transition-colors px-1 md:px-0">
            Products
          </Link>
          <Link href="/contact" className="text-foreground hover:text-accent transition-colors px-1 md:px-0">
            Contact
          </Link>

          {mounted && currentUser && (
            <Link href="/my-orders" className="text-foreground hover:text-accent transition-colors flex items-center px-1 md:px-0">
              <ListOrdered className="mr-1 h-4 w-4" /> My Orders
            </Link>
          )}
          
          <Link href="/admin" className="text-foreground hover:text-accent transition-colors flex items-center px-1 md:px-0">
            <Shield className="mr-1 h-4 w-4" /> Admin
          </Link>

          {mounted && currentUser ? (
            <>
              <span className="text-foreground flex items-center px-1 md:px-0 text-sm sm:text-base">
                <UserCircle2 className="mr-1 h-5 w-5 text-accent" />
                {currentUser.name || currentUser.email}
              </span>
              <Button variant="outline" size="sm" onClick={logout} className="hover:border-destructive hover:text-destructive text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1.5">
                <LogOut className="mr-1 h-4 w-4" /> Logout
              </Button>
            </>
          ) : mounted && !currentUser ? (
            <>
              <Link href="/login" className="text-foreground hover:text-accent transition-colors flex items-center px-1 md:px-0">
                <LogIn className="mr-1 h-4 w-4" /> Login
              </Link>
              <Link href="/signup" className="text-foreground hover:text-accent transition-colors flex items-center px-1 md:px-0">
                <UserPlus className="mr-1 h-4 w-4" /> Sign Up
              </Link>
            </>
          ) : null}
          
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

    