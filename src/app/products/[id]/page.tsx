
'use client';

import { use, useEffect, useState } from 'react'; // Import 'use'
import Image from 'next/image';
import { getProductById } from '@/lib/data';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Star, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { ProductRecommendations } from '@/components/products/ProductRecommendations';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function ProductDetailPage({ params: paramsProp }: { params: Promise<{ id: string }> | { id: string } }) {
  // Conditionally unwrap paramsProp if it's a promise
  const params = (typeof paramsProp.then === 'function')
    ? use(paramsProp as Promise<{id: string}>)
    : paramsProp as {id: string};
  const { id } = params; // id is now from the resolved params object

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingHistory, setViewingHistory] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    // Reset loading state when id changes
    setIsLoading(true);
    setProduct(null); // Clear previous product
    
    const fetchedProduct = getProductById(id);
    if (fetchedProduct) {
      setProduct(fetchedProduct);
      // Update viewing history using the resolved id
      setViewingHistory(prev => {
        const newHistory = [id, ...prev.filter(viewedId => viewedId !== id)].slice(0, 5);
        if (typeof window !== 'undefined') {
          localStorage.setItem('shopSphereViewingHistory', JSON.stringify(newHistory));
        }
        return newHistory;
      });
    }
    setIsLoading(false);
  }, [id]); // Depend on the resolved id

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedHistory = localStorage.getItem('shopSphereViewingHistory');
      if (storedHistory) {
        setViewingHistory(JSON.parse(storedHistory));
      }
    }
  }, []);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
      });
    }
  };

  const nextImage = () => {
    if (product && product.images && product.images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % product.images!.length);
    }
  };

  const prevImage = () => {
    if (product && product.images && product.images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + product.images!.length) % product.images!.length);
    }
  };
  
  const displayImages = product?.images && product.images.length > 0 ? product.images : (product ? [product.imageUrl] : []);


  if (isLoading) {
    return <div className="text-center py-10">Loading product details...</div>;
  }

  if (!product) {
    return <div className="text-center py-10">Product not found.</div>;
  }

  return (
    <div className="space-y-12">
      <Link href="/" className="inline-flex items-center text-accent hover:underline mb-6">
        <ChevronLeft className="h-5 w-5 mr-1" /> Back to Products
      </Link>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div className="relative">
          <div className="aspect-[4/3] relative overflow-hidden rounded-lg shadow-xl">
            <Image
              src={displayImages[currentImageIndex]}
              alt={product.name}
              layout="fill"
              objectFit="cover"
              className="transition-opacity duration-300"
              data-ai-hint="product lifestyle"
            />
          </div>
          {displayImages.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background text-primary"
                onClick={prevImage}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background text-primary"
                onClick={nextImage}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {displayImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full ${index === currentImageIndex ? 'bg-accent' : 'bg-muted hover:bg-accent/50'
                      } transition-colors`}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <h1 className="text-4xl lg:text-5xl font-bold font-headline text-primary">{product.name}</h1>
          <p className="text-lg text-muted-foreground">{product.category}</p>
          <div className="flex items-center">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${i < Math.floor(product.rating) ? 'text-accent fill-accent' : 'text-muted-foreground'
                    }`}
                />
              ))}
            <span className="ml-2 text-muted-foreground">({product.rating.toFixed(1)} from {product.reviews?.length || 0} reviews)</span>
          </div>
          <p className="text-3xl font-semibold text-accent">${product.price.toFixed(2)}</p>
          <p className="text-foreground leading-relaxed">{product.description}</p>
          <Button onClick={handleAddToCart} size="lg" className="w-full md:w-auto bg-primary hover:bg-accent hover:text-accent-foreground transition-colors duration-300 text-lg py-3 px-8">
            <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
          </Button>
        </div>
      </div>

      <Separator />

      {/* Accordion for Specifications and Reviews */}
      <Accordion type="single" collapsible className="w-full">
        {product.specifications && product.specifications.length > 0 && (
          <AccordionItem value="specifications">
            <AccordionTrigger className="text-2xl font-headline text-primary hover:text-accent">Specifications</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc list-inside space-y-2 text-foreground pl-4">
                {product.specifications.map(spec => (
                  <li key={spec.name}><strong>{spec.name}:</strong> {spec.value}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )}

        {product.reviews && product.reviews.length > 0 && (
          <AccordionItem value="reviews">
            <AccordionTrigger className="text-2xl font-headline text-primary hover:text-accent">Customer Reviews</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6">
                {product.reviews.map(review => (
                  <Card key={review.id} className="bg-secondary/50">
                    <CardHeader>
                      <CardTitle className="text-lg font-headline">{review.author}</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">{new Date(review.date).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center mb-2">
                        {Array(5).fill(0).map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-accent fill-accent' : 'text-muted-foreground'}`} />
                        ))}
                      </div>
                      <p className="text-foreground">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
      
      <Separator />

      {/* Product Recommendations */}
      <div>
        <h2 className="text-3xl font-bold font-headline mb-6 text-primary">You Might Also Like</h2>
        <ProductRecommendations currentProductId={product.id} viewingHistory={viewingHistory} />
      </div>
    </div>
  );
}

