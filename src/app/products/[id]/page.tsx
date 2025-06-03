
'use client';

import { use, useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import Image from 'next/image';
import { getProductById, addProductReview, type ReviewCreateInput } from '@/lib/data';
import type { Product, Review } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Star, ShoppingCart, ChevronLeft, ChevronRight, MessageSquare, User, Zap, Sparkles, Loader2, AlertCircle, Shirt, UploadCloud, Wand2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { ProductRecommendations } from '@/components/products/ProductRecommendations';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { generateProductAmbiance, type ProductAmbianceInput } from '@/ai/flows/product-ambiance-flow.ts';
import { generateVirtualTryOnImage, type VirtualTryOnInput, type VirtualTryOnOutput } from '@/ai/flows/virtual-tryon-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export default function ProductDetailPage({ params: paramsProp }: { params: Promise<{ id: string }> | { id: string } }) {
  const params = (typeof paramsProp.then === 'function')
    ? use(paramsProp as Promise<{id: string}>)
    : paramsProp as {id: string};
  const { id } = params;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingHistory, setViewingHistory] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState<number>(0);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [ambianceText, setAmbianceText] = useState<string | null>(null);
  const [isAmbianceLoading, setIsAmbianceLoading] = useState(false);
  const [ambianceError, setAmbianceError] = useState<string | null>(null);

  // State for AI Virtual Try-On
  const [userPhotoPreview, setUserPhotoPreview] = useState<string | null>(null);
  const [userPhotoFile, setUserPhotoFile] = useState<File | null>(null);
  const [generatedTryOnImage, setGeneratedTryOnImage] = useState<string | null>(null);
  const [isTryOnLoading, setIsTryOnLoading] = useState(false);
  const [tryOnError, setTryOnError] = useState<string | null>(null);


  const { addToCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    setProduct(null); 
    setCurrentImageIndex(0);
    setAmbianceText(null);
    setIsAmbianceLoading(false);
    setAmbianceError(null);
    // Reset Try-On state on product change
    setUserPhotoPreview(null);
    setUserPhotoFile(null);
    setGeneratedTryOnImage(null);
    setIsTryOnLoading(false);
    setTryOnError(null);
    
    const fetchedProduct = getProductById(id);
    if (fetchedProduct) {
      setProduct(fetchedProduct);
      setViewingHistory(prev => {
        const newHistory = [id, ...prev.filter(viewedId => viewedId !== id)].slice(0, 5);
        if (typeof window !== 'undefined') {
          localStorage.setItem('shopSphereViewingHistory', JSON.stringify(newHistory));
        }
        return newHistory;
      });
    }
    setIsLoading(false);
  }, [id]);

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

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, 1); 
      router.push('/checkout');
    }
  };

  const displayImages = product?.images && product.images.length > 0 ? product.images : (product ? [product.imageUrl] : []);

  const nextImage = () => {
    if (displayImages.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % displayImages.length);
    }
  };

  const prevImage = () => {
     if (displayImages.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + displayImages.length) % displayImages.length);
    }
  };
  
  const handleReviewSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product) return;
    if (newReviewRating === 0) {
      toast({ title: "Rating Required", description: "Please select a star rating for your review.", variant: "destructive" });
      return;
    }
    if (!newReviewComment.trim()) {
      toast({ title: "Comment Required", description: "Please write a comment for your review.", variant: "destructive" });
      return;
    }
    if (!newReviewAuthor.trim()) {
      toast({ title: "Name Required", description: "Please enter your name.", variant: "destructive" });
      return;
    }

    setIsSubmittingReview(true);
    const reviewInput: ReviewCreateInput = {
      author: newReviewAuthor,
      rating: newReviewRating,
      comment: newReviewComment,
    };

    const updatedProduct = addProductReview(product.id, reviewInput);

    if (updatedProduct) {
      setProduct(updatedProduct); 
      toast({ title: "Review Submitted!", description: "Thank you for your feedback." });
      setNewReviewAuthor('');
      setNewReviewRating(0);
      setNewReviewComment('');
    } else {
      toast({ title: "Error", description: "Could not submit review. Product not found.", variant: "destructive" });
    }
    setIsSubmittingReview(false);
  };

  const handleGenerateAmbiance = async () => {
    if (!product) return;

    setIsAmbianceLoading(true);
    setAmbianceText(null);
    setAmbianceError(null);

    try {
      const input: ProductAmbianceInput = {
        productName: product.name,
        productDescription: product.description,
      };
      const result = await generateProductAmbiance(input);
      setAmbianceText(result.ambiance);
    } catch (error) {
      console.error("Failed to generate product ambiance:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred while generating the ambiance.";
      setAmbianceError(errorMessage);
      toast({
        title: "AI Ambiance Error",
        description: `Could not generate ambiance: ${errorMessage.substring(0,100)}`,
        variant: "destructive",
      });
    } finally {
      setIsAmbianceLoading(false);
    }
  };

  const handleUserPhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // ~4MB limit for user photo
        toast({ title: "Image Too Large", description: "Please upload an image smaller than 4MB.", variant: "destructive" });
        event.target.value = ''; // Reset file input
        return;
      }
      setUserPhotoFile(file);
      setGeneratedTryOnImage(null); // Clear previous result if new photo is uploaded
      setTryOnError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setUserPhotoFile(null);
      setUserPhotoPreview(null);
    }
  };

  const handleGenerateTryOn = async () => {
    if (!userPhotoPreview || !product) { // Check userPhotoPreview which holds the Data URI
      toast({ title: "Missing Photo", description: "Please upload your photo first.", variant: "destructive" });
      return;
    }

    setIsTryOnLoading(true);
    setGeneratedTryOnImage(null);
    setTryOnError(null);

    try {
      const input: VirtualTryOnInput = {
        userPhotoDataUri: userPhotoPreview,
        productPhotoUrl: product.imageUrl, // This can be an http/https URL or a Data URI
        productName: product.name,
        productCategory: product.category,
      };
      const result: VirtualTryOnOutput = await generateVirtualTryOnImage(input);
      setGeneratedTryOnImage(result.generatedImageDataUri);
      toast({ title: "AI Try-On Complete!", description: "Check out your virtual try-on image.", duration: 5000});
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during virtual try-on.";
      setTryOnError(errorMessage);
      toast({ title: "AI Try-On Error", description: errorMessage.substring(0,150), variant: "destructive", duration: 7000 });
    } finally {
      setIsTryOnLoading(false);
    }
  };


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
            {displayImages.length > 0 ? (
                 <Image
                    src={displayImages[currentImageIndex]}
                    alt={product.name}
                    layout="fill"
                    objectFit="cover"
                    className="transition-opacity duration-300"
                    data-ai-hint="product lifestyle"
                    key={displayImages[currentImageIndex]} 
                />
            ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">No image available</p>
                </div>
            )}
          </div>
          {displayImages.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background text-primary z-10"
                onClick={prevImage}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background text-primary z-10"
                onClick={nextImage}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
           {/* Thumbnails */}
          {displayImages.length > 1 && (
            <div className="mt-4">
              <ScrollArea className="w-full whitespace-nowrap rounded-md">
                <div className="flex space-x-2 pb-2">
                  {displayImages.map((imgSrc, index) => (
                    <button
                      key={index}
                      className={cn(
                        "relative h-16 w-16 shrink-0 rounded-md overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        currentImageIndex === index ? "border-primary" : "border-transparent hover:border-muted-foreground/50"
                      )}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`View image ${index + 1} of ${product.name}`}
                    >
                      <Image
                        src={imgSrc}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                      />
                    </button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
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
          <p className="text-3xl font-semibold text-accent">₹{product.price.toFixed(2)}</p>
          <p className="text-foreground leading-relaxed">{product.description}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleAddToCart} size="lg" className="flex-1 bg-primary hover:bg-accent hover:text-accent-foreground transition-colors duration-300 text-lg py-3 px-8">
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
            <Button onClick={handleBuyNow} size="lg" variant="outline" className="flex-1 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-colors duration-300 text-lg py-3 px-8">
              <Zap className="mr-2 h-5 w-5" /> Buy Now
            </Button>
          </div>
        </div>
      </div>

      {/* AI Product Ambiance Section */}
      <Separator />
      <Card className="shadow-lg border-accent/50">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            <Sparkles className="mr-2 h-6 w-6 text-accent" /> AI Product Ambiance
          </CardTitle>
          <CardDescription>Let our AI weave a little story about this product for you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGenerateAmbiance} disabled={isAmbianceLoading} className="bg-primary hover:bg-accent hover:text-accent-foreground">
            {isAmbianceLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {ambianceText ? "Regenerate Ambiance" : "Generate AI Ambiance"}
              </>
            )}
          </Button>
          {isAmbianceLoading && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-accent" />
              <span>Crafting an experience...</span>
            </div>
          )}
          {ambianceError && !isAmbianceLoading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Generation Failed</AlertTitle>
              <AlertDescription>{ambianceError}</AlertDescription>
            </Alert>
          )}
          {ambianceText && !isAmbianceLoading && !ambianceError && (
            <Alert variant="default" className="border-primary/50 bg-primary/5 text-primary-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <AlertTitle className="font-semibold text-primary">ShopSphere AI Says:</AlertTitle>
              <AlertDescription className="text-foreground/90 italic">
                "{ambianceText}"
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {/* AI Virtual Try-On Section */}
      <Separator />
      <Card className="shadow-lg border-accent/50">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            <Shirt className="mr-2 h-6 w-6 text-accent" /> AI Virtual Try-On (Experimental)
          </CardTitle>
          <CardDescription>Upload your photo to see how this product might look on you! Results may vary.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* User Photo Upload and Preview */}
            <div className="space-y-3">
              <Label htmlFor="userPhotoUpload" className="text-base font-medium flex items-center">
                <UploadCloud className="mr-2 h-5 w-5 text-accent" /> Upload Your Photo
              </Label>
              <Input 
                id="userPhotoUpload" 
                type="file" 
                accept="image/jpeg, image/png, image/webp" 
                onChange={handleUserPhotoChange} 
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              {userPhotoPreview && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-1">Your Photo Preview:</p>
                  <div className="relative aspect-square w-full max-w-xs rounded-md overflow-hidden border shadow-inner bg-muted">
                    <Image src={userPhotoPreview} alt="User photo preview" layout="fill" objectFit="contain" />
                  </div>
                </div>
              )}
            </div>

            {/* Product Photo (for context) & Action Button */}
            <div className="space-y-3">
               <p className="text-base font-medium flex items-center">
                <Wand2 className="mr-2 h-5 w-5 text-accent" /> Product: {product.name}
              </p>
              <div className="relative aspect-square w-full max-w-xs rounded-md overflow-hidden border shadow-inner bg-muted">
                 <Image src={product.imageUrl} alt={product.name} layout="fill" objectFit="contain" data-ai-hint="product fashion" />
              </div>
              <Button 
                onClick={handleGenerateTryOn} 
                disabled={isTryOnLoading || !userPhotoPreview}
                className="w-full bg-primary hover:bg-accent hover:text-accent-foreground mt-4 py-3 text-base"
              >
                {isTryOnLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Try-On...
                  </>
                ) : (
                  <>
                    <Shirt className="mr-2 h-5 w-5" />
                    Try On with AI
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Generated Image Display Area */}
          {isTryOnLoading && (
            <div className="mt-6 text-center space-y-2 p-6 border border-dashed rounded-md bg-muted/50">
              <Loader2 className="h-10 w-10 animate-spin text-accent mx-auto" />
              <p className="text-muted-foreground">Our AI is working its magic... This might take a moment.</p>
              <p className="text-xs text-muted-foreground">(Image generation can take up to 15-30 seconds)</p>
            </div>
          )}
          {tryOnError && !isTryOnLoading && (
            <Alert variant="destructive" className="mt-6">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="text-lg">Try-On Generation Failed</AlertTitle>
              <AlertDescription>{tryOnError}</AlertDescription>
            </Alert>
          )}
          {generatedTryOnImage && !isTryOnLoading && !tryOnError && (
            <div className="mt-6 space-y-3">
              <h3 className="text-xl font-semibold text-primary text-center">Your AI Virtual Try-On!</h3>
              <div className="relative aspect-square w-full max-w-md mx-auto rounded-lg overflow-hidden border-2 border-accent shadow-xl bg-muted">
                <Image src={generatedTryOnImage} alt="AI generated virtual try-on" layout="fill" objectFit="contain" />
              </div>
               <p className="text-xs text-muted-foreground text-center">Note: This is an AI-generated image and is for illustrative purposes. Actual fit may vary.</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            **Experimental Feature**: Virtual Try-On uses advanced AI. Results are for illustrative purposes and might not be perfectly accurate. Please upload a clear, well-lit photo of yourself. Supported image types: JPG, PNG, WebP. Max file size: 4MB.
          </p>
        </CardContent>
      </Card>

      <Separator />

      <Accordion type="single" collapsible className="w-full" defaultValue="reviews">
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

        <AccordionItem value="reviews">
          <AccordionTrigger className="text-2xl font-headline text-primary hover:text-accent">Customer Reviews ({product.reviews?.length || 0})</AccordionTrigger>
          <AccordionContent>
            {product.reviews && product.reviews.length > 0 ? (
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
            ) : (
              <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary flex items-center">
            <MessageSquare className="mr-2 h-6 w-6 text-accent" /> Leave a Review
          </CardTitle>
          <CardDescription>Share your thoughts about {product.name}.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReviewSubmit} className="space-y-6">
            <div>
              <Label htmlFor="reviewAuthor" className="flex items-center mb-1">
                <User className="mr-2 h-4 w-4 text-accent" /> Your Name
              </Label>
              <Input
                id="reviewAuthor"
                value={newReviewAuthor}
                onChange={(e) => setNewReviewAuthor(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <Label className="mb-1 block">Your Rating</Label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <Button
                    key={starValue}
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setNewReviewRating(starValue)}
                    className={`h-8 w-8 p-0 ${newReviewRating >= starValue ? 'text-accent' : 'text-muted-foreground hover:text-accent/80'}`}
                    aria-label={`Rate ${starValue} out of 5 stars`}
                  >
                    <Star className={`h-6 w-6 ${newReviewRating >= starValue ? 'fill-accent' : 'fill-transparent'}`} />
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="reviewComment" className="flex items-center mb-1">
                <MessageSquare className="mr-2 h-4 w-4 text-accent" /> Your Comment
              </Label>
              <Textarea
                id="reviewComment"
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                placeholder={`What did you like or dislike about ${product.name}?`}
                rows={4}
                required
                className="min-h-[100px]"
              />
            </div>
            <Button type="submit" disabled={isSubmittingReview} className="bg-primary hover:bg-accent hover:text-accent-foreground">
              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Separator />

      <div>
        <h2 className="text-3xl font-bold font-headline mb-6 text-primary">You Might Also Like</h2>
        <ProductRecommendations currentProductId={product.id} viewingHistory={viewingHistory} />
      </div>
    </div>
  );
}
