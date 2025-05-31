
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCart } from '@/context/CartContext';
import { MapPin, Package, CreditCard, Phone, CalendarDays, Lock } from "lucide-react";

const shippingAddressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State/Province is required"),
  zipCode: z.string().min(5, "ZIP/Postal code is required"),
  country: z.string().min(2, "Country is required").default("United States"),
  phoneNumber: z.string().min(10, "Valid phone number is required").regex(/^\+?[0-9\s-()]+$/, "Invalid phone number format"),
});

const paymentDetailsSchema = z.object({
  cardholderName: z.string().min(2, "Cardholder name is required"),
  cardNumber: z.string()
    .min(13, "Card number must be between 13 and 19 digits")
    .max(19, "Card number must be between 13 and 19 digits")
    .regex(/^\d+$/, "Card number must be all digits")
    .refine(value => { // Basic Luhn algorithm check (optional, but good for UX)
        let sum = 0;
        let shouldDouble = false;
        for (let i = value.length - 1; i >= 0; i--) {
            let digit = parseInt(value.charAt(i));
            if (shouldDouble) {
                if ((digit *= 2) > 9) digit -= 9;
            }
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        return (sum % 10) === 0;
    }, "Invalid card number"),
  expiryDate: z.string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiry date must be MM/YY format (e.g., 03/25)")
    .refine(val => {
      const [month, yearSuffix] = val.split('/');
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1; // 1-indexed month
      const inputYear = parseInt(`20${yearSuffix}`, 10);
      const inputMonth = parseInt(month, 10);

      if (inputYear < currentYear) return false;
      if (inputYear === currentYear && inputMonth < currentMonth) return false;
      return true;
    }, "Card is expired or invalid date"),
  cvv: z.string().min(3, "CVV must be 3 or 4 digits").max(4, "CVV must be 3 or 4 digits").regex(/^\d+$/, "CVV must be all digits"),
});

const checkoutFormSchema = z.object({
  shippingAddress: shippingAddressSchema,
  shippingMethod: z.string().min(1, "Please select a shipping method"),
  paymentDetails: paymentDetailsSchema,
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

const shippingOptions = [
  { id: 'standard', label: 'Standard Shipping (5-7 business days)', price: 0, description: 'Reliable and free' },
  { id: 'expedited', label: 'Expedited Shipping (2-3 business days)', price: 10.99, description: 'Faster delivery' },
  { id: 'priority', label: 'Priority Shipping (1 business day)', price: 19.99, description: 'Get it tomorrow' },
];

export default function CheckoutPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { cartItems, getCartTotal, clearCart, getItemCount } = useCart();
  const [selectedShippingPrice, setSelectedShippingPrice] = useState(shippingOptions[0].price);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      shippingAddress: {
        fullName: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States",
        phoneNumber: "",
      },
      shippingMethod: shippingOptions[0].id,
      paymentDetails: {
        cardholderName: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
      },
    },
  });

  const itemsSubtotal = getCartTotal();
  const orderTotal = itemsSubtotal + selectedShippingPrice;

  useEffect(() => {
    if (cartItems.length === 0) {
      toast({ title: "Your cart is empty", description: "Please add items to your cart before proceeding to checkout.", variant: "destructive" });
      router.push('/cart');
    }
  }, [cartItems, router, toast]);

  const onSubmit = (data: CheckoutFormValues) => {
    console.log("Checkout data:", data);
    toast({
      title: "Order Placed Successfully!",
      description: "Thank you for your purchase. Your order is being processed.",
    });
    clearCart();
    router.push(`/order-confirmation?orderTotal=${orderTotal.toFixed(2)}&itemCount=${getItemCount()}`);
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <p className="text-lg text-muted-foreground">Redirecting to cart...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold font-headline text-primary mb-8 text-center">Checkout</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-headline text-primary flex items-center"><MapPin className="mr-2 h-6 w-6 text-accent" /> Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="shippingAddress.fullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="shippingAddress.addressLine1" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl><Input placeholder="123 Main St" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="shippingAddress.addressLine2" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2 (Optional)</FormLabel>
                    <FormControl><Input placeholder="Apartment, suite, etc." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="shippingAddress.city" render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl><Input placeholder="Anytown" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="shippingAddress.state" render={({ field }) => (
                    <FormItem>
                      <FormLabel>State / Province</FormLabel>
                      <FormControl><Input placeholder="CA" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="shippingAddress.zipCode" render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP / Postal Code</FormLabel>
                      <FormControl><Input placeholder="90210" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="shippingAddress.country" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl><Input placeholder="United States" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="shippingAddress.phoneNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Phone className="mr-2 h-4 w-4 text-accent" />Phone Number</FormLabel>
                    <FormControl><Input type="tel" placeholder="(555) 123-4567" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            {/* Shipping Method */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-headline text-primary flex items-center"><Package className="mr-2 h-6 w-6 text-accent" /> Shipping Method</CardTitle>
              </CardHeader>
              <CardContent>
                <Controller
                  control={form.control}
                  name="shippingMethod"
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        const selectedOption = shippingOptions.find(opt => opt.id === value);
                        setSelectedShippingPrice(selectedOption ? selectedOption.price : 0);
                      }}
                      value={field.value}
                      className="space-y-3"
                    >
                      {shippingOptions.map((option) => (
                        <FormItem key={option.id} className="flex items-center space-x-3 p-3 border rounded-md hover:border-accent transition-colors">
                          <FormControl>
                            <RadioGroupItem value={option.id} />
                          </FormControl>
                          <FormLabel className="font-normal flex-grow cursor-pointer">
                            <div className="flex justify-between items-center">
                                <span>{option.label}</span>
                                <span className="font-semibold text-primary">${option.price.toFixed(2)}</span>
                            </div>
                            {option.description && <p className="text-sm text-muted-foreground">{option.description}</p>}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  )}
                />
                 <FormMessage>{form.formState.errors.shippingMethod?.message}</FormMessage>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-headline text-primary flex items-center"><CreditCard className="mr-2 h-6 w-6 text-accent" /> Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="paymentDetails.cardholderName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cardholder Name</FormLabel>
                    <FormControl><Input placeholder="John M Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="paymentDetails.cardNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl><Input placeholder="•••• •••• •••• ••••" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="paymentDetails.expiryDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-accent" />Expiry Date</FormLabel>
                      <FormControl><Input placeholder="MM/YY" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="paymentDetails.cvv" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><Lock className="mr-2 h-4 w-4 text-accent" />CVV</FormLabel>
                      <FormControl><Input placeholder="123" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl sticky top-24">
              <CardHeader>
                <CardTitle className="text-2xl font-headline text-primary">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                    {cartItems.map(item => (
                        <div key={item.product.id} className="flex items-center gap-3">
                            <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0">
                            <Image src={item.product.imageUrl} alt={item.product.name} layout="fill" objectFit="cover" data-ai-hint="product item" />
                            </div>
                            <div className="flex-grow">
                            <p className="text-sm font-medium truncate">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
                <Separator />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items ({getItemCount()}) Subtotal</span>
                    <span className="font-medium">${itemsSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">${selectedShippingPrice.toFixed(2)}</span>
                  </div>
                  {/* Mock Taxes - can be made more dynamic if needed */}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Taxes</span>
                    <span className="font-medium">${(itemsSubtotal * 0.07).toFixed(2)}</span> 
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-primary">Order Total</span>
                  <span className="text-accent">${(orderTotal + (itemsSubtotal * 0.07)).toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" size="lg" className="w-full bg-primary hover:bg-accent hover:text-accent-foreground text-lg py-3">
                  Place Your Order
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </Form>
    </div>
  );
}
