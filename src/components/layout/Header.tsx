
'use client';

import Link from 'next/link';
import { ShoppingCart, Shield, LogIn, UserPlus, LogOut, UserCircle2, ListOrdered, Menu } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSiteSettings } from '@/context/SiteSettingsContext'; // Import useSiteSettings
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';

export function Header() {
  const { getItemCount } = useCart();
  const { currentUser, logout, isLoading: authIsLoading } = useAuth();
  const { siteSettings, isLoading: settingsIsLoading } = useSiteSettings(); // Use site settings context
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const itemCount = mounted ? getItemCount() : 0;
  const siteName = settingsIsLoading ? "Loading..." : siteSettings.siteName;

  if ((authIsLoading || settingsIsLoading) && mounted) {
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

  const desktopNavLinks = (
    <>
      <Link href="/" className="text-foreground hover:text-accent transition-colors block py-2 md:py-0">
        Home
      </Link>
      <Link href="/shop" className="text-foreground hover:text-accent transition-colors block py-2 md:py-0">
        Products
      </Link>
      <Link href="/contact" className="text-foreground hover:text-accent transition-colors block py-2 md:py-0">
        Contact
      </Link>
      {mounted && currentUser && (
        <Link href="/my-orders" className="text-foreground hover:text-accent transition-colors flex items-center py-2 md:py-0">
          <ListOrdered className="mr-1 h-4 w-4" /> My Orders
        </Link>
      )}
      <Link href="/admin" className="text-foreground hover:text-accent transition-colors flex items-center py-2 md:py-0">
        <Shield className="mr-1 h-4 w-4" /> Admin
      </Link>
    </>
  );

  const mobileNavLinks = (
    <>
      <SheetClose asChild>
        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-foreground hover:text-accent transition-colors block py-2 md:py-0">
          Home
        </Link>
      </SheetClose>
      <SheetClose asChild>
        <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="text-foreground hover:text-accent transition-colors block py-2 md:py-0">
          Products
        </Link>
      </SheetClose>
      <SheetClose asChild>
        <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-foreground hover:text-accent transition-colors block py-2 md:py-0">
          Contact
        </Link>
      </SheetClose>
      {mounted && currentUser && (
        <SheetClose asChild>
          <Link href="/my-orders" onClick={() => setIsMobileMenuOpen(false)} className="text-foreground hover:text-accent transition-colors flex items-center py-2 md:py-0">
            <ListOrdered className="mr-1 h-4 w-4" /> My Orders
          </Link>
        </SheetClose>
      )}
      <SheetClose asChild>
        <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-foreground hover:text-accent transition-colors flex items-center py-2 md:py-0">
          <Shield className="mr-1 h-4 w-4" /> Admin
        </Link>
      </SheetClose>
    </>
  );


  return (
    <header className="bg-background shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-3xl font-bold font-headline text-primary hover:text-accent transition-colors">
          {siteName}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-1 sm:space-x-2 md:space-x-4 items-center flex-wrap">
          {desktopNavLinks}
          {mounted && currentUser ? (
            <>
              <span className="text-foreground flex items-center px-1 md:px-0 text-sm sm:text-base overflow-hidden">
                <UserCircle2 className="mr-1 h-5 w-5 text-accent flex-shrink-0" />
                <span className="truncate block max-w-[10ch] sm:max-w-[15ch] lg:max-w-none">{currentUser.name || currentUser.email}</span>
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

        {/* Mobile Navigation Trigger & Cart */}
        <div className="md:hidden flex items-center">
          <Link href="/cart" passHref>
            <Button variant="ghost" size="icon" className="relative text-foreground hover:text-accent hover:bg-accent/10 mr-2">
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 bg-accent text-accent-foreground rounded-full h-6 w-6 flex items-center justify-center text-xs">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:text-accent hover:bg-accent/10">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px] pt-10">
              <nav className="flex flex-col space-y-3">
                {mobileNavLinks}
                <hr className="my-3"/>
                {mounted && currentUser ? (
                  <>
                    <div className="text-foreground flex items-center px-1 text-sm overflow-hidden py-2">
                      <UserCircle2 className="mr-2 h-5 w-5 text-accent flex-shrink-0" />
                      <span className="truncate block">{currentUser.name || currentUser.email}</span>
                    </div>
                    <SheetClose asChild>
                      <Button variant="outline" size="sm" onClick={() => { logout(); setIsMobileMenuOpen(false);}} className="hover:border-destructive hover:text-destructive w-full">
                        <LogOut className="mr-2 h-4 w-4" /> Logout
                      </Button>
                    </SheetClose>
                  </>
                ) : mounted && !currentUser ? (
                  <>
                    <SheetClose asChild>
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-foreground hover:text-accent transition-colors flex items-center py-2">
                        <LogIn className="mr-2 h-4 w-4" /> Login
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="text-foreground hover:text-accent transition-colors flex items-center py-2">
                        <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                      </Link>
                    </SheetClose>
                  </>
                ) : null}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
