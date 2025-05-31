
'use client';

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, ShoppingBag, Minus, Plus } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart, getItemCount } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      toast({
        title: "Item removed",
        description: "Item quantity set to 0 and removed from cart.",
        variant: "default",
      });
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-4xl font-bold font-headline mb-4 text-primary">Your Cart is Empty</h1>
        <p className="text-lg text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link href="/" passHref>
          <Button size="lg" className="bg-primary hover:bg-accent hover:text-accent-foreground text-lg py-3 px-8">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold font-headline text-primary">Your Shopping Cart</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map(item => (
            <Card key={item.product.id} className="flex flex-col md:flex-row items-center p-4 shadow-lg gap-4">
              <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-md overflow-hidden shrink-0">
                <Image
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  layout="fill"
                  objectFit="cover"
                  data-ai-hint="product item"
                />
              </div>
              <div className="flex-grow space-y-1 text-center md:text-left">
                <Link href={`/products/${item.product.id}`} legacyBehavior>
                  <a className="text-lg font-semibold font-headline hover:text-accent transition-colors">{item.product.name}</a>
                </Link>
                <p className="text-sm text-muted-foreground">{item.product.category}</p>
                <p className="text-md font-semibold text-primary">${item.product.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <Button variant="outline" size="icon" onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)} className="h-8 w-8">
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.product.id, parseInt(e.target.value))}
                  min="1"
                  className="w-16 h-8 text-center"
                />
                <Button variant="outline" size="icon" onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)} className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="shrink-0">
                <p className="text-lg font-semibold text-primary md:w-24 text-center md:text-right">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => {
                removeFromCart(item.product.id);
                toast({ title: "Item removed", description: `${item.product.name} removed from cart.`});
                }} className="text-destructive hover:text-destructive/80 shrink-0">
                <Trash2 className="h-5 w-5" />
              </Button>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card className="shadow-xl sticky top-24">
            <CardHeader>
              <CardTitle className="text-2xl font-headline text-primary">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({getItemCount()} items)</span>
                <span className="font-semibold">${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-semibold">FREE</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span className="text-primary">Total</span>
                <span className="text-accent">${getCartTotal().toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button size="lg" className="w-full bg-primary hover:bg-accent hover:text-accent-foreground text-lg" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
              <Button variant="outline" className="w-full hover:border-destructive hover:text-destructive" onClick={() => {
                clearCart();
                toast({ title: "Cart Cleared", description: "All items removed from cart."});
                }}>
                Clear Cart
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
