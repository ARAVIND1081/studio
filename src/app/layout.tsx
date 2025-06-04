
import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext'; // Import AuthProvider
import { SiteSettingsProvider } from '@/context/SiteSettingsContext'; // Import SiteSettingsProvider

export const metadata: Metadata = {
  title: 'ShopSphere - Luxurious Online Shopping',
  description: 'Discover a world of elegance and style at ShopSphere.',
  icons: null, // This will prevent Next.js from automatically using a favicon
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <CartProvider>
            <SiteSettingsProvider> {/* Wrap with SiteSettingsProvider */}
              <Header />
              <main className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>
              <Footer />
              <Toaster />
            </SiteSettingsProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
