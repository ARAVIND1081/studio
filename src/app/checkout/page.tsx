
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
import { MapPin, Package, CreditCard, Phone, Smartphone, HandCoins, Landmark, User, Calendar, Lock } from "lucide-react";

const shippingAddressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State/Province is required"),
  zipCode: z.string().min(5, "PIN code is required"),
  country: z.string().min(2, "Country is required").default("India"),
  phoneNumber: z.string().min(10, "Valid phone number is required").regex(/^\+?[0-9\s-()]+$/, "Invalid phone number format"),
});

const checkoutFormSchema = z.object({
  shippingAddress: shippingAddressSchema,
  shippingMethod: z.string().min(1, "Please select a shipping method"),
  paymentMethod: z.string().min(1, "Please select a payment method"),
  cardDetails: z.object({
    cardNumber: z.string(),
    cardHolderName: z.string(),
    expiryDate: z.string(),
    cvv: z.string(),
  }).optional(),
  upiId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.paymentMethod === 'card') {
    if (!data.cardDetails?.cardHolderName || data.cardDetails.cardHolderName.length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Cardholder name is required", path: ["cardDetails", "cardHolderName"] });
    }
    if (!data.cardDetails?.cardNumber || !/^\d{13,19}$/.test(data.cardDetails.cardNumber.replace(/\s/g, ''))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Valid card number is required", path: ["cardDetails", "cardNumber"] });
    }
    if (!data.cardDetails?.expiryDate || !/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(data.cardDetails.expiryDate)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Expiry date (MM/YY) is required", path: ["cardDetails", "expiryDate"] });
    }
    if (!data.cardDetails?.cvv || !/^\d{3,4}$/.test(data.cardDetails.cvv)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Valid CVV (3 or 4 digits) is required", path: ["cardDetails", "cvv"] });
    }
  }
  if (data.paymentMethod === 'upi') {
    if (!data.upiId || !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(data.upiId) ) { // Basic UPI ID format check
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Valid UPI ID is required (e.g., yourname@bank)", path: ["upiId"] });
    }
  }
});


type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

const shippingOptions = [
  { id: 'standard', label: 'Standard Shipping (5-7 business days)', price: 0, description: 'Reliable and free' },
  { id: 'expedited', label: 'Expedited Shipping (2-3 business days)', price: 150.00, description: 'Faster delivery' },
  { id: 'priority', label: 'Priority Shipping (1 business day)', price: 300.00, description: 'Get it tomorrow' },
];

const paymentMethods = [
    { id: 'card', label: 'Credit or Debit Card', icon: CreditCard },
    { id: 'upi', label: 'UPI', icon: Smartphone },
    { id: 'cod', label: 'Cash on Delivery', icon: HandCoins },
    { id: 'netbanking', label: 'Net Banking', icon: Landmark },
];

export default function CheckoutPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { cartItems, getCartTotal, clearCart, getItemCount } = useCart();
  const [selectedShippingPrice, setSelectedShippingPrice] = useState(shippingOptions[0].price);

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

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
        country: "India",
        phoneNumber: "",
      },
      shippingMethod: shippingOptions[0].id,
      paymentMethod: "",
      cardDetails: {
        cardNumber: "",
        cardHolderName: "",
        expiryDate: "",
        cvv: "",
      },
      upiId: "",
    },
  });

  const itemsSubtotal = getCartTotal();
  const mockTaxes = itemsSubtotal * 0.18; 
  const finalOrderTotal = itemsSubtotal + selectedShippingPrice + mockTaxes;

  const watchedPaymentMethod = form.watch("paymentMethod");

  useEffect(() => {
    if (hasMounted && cartItems.length === 0) {
      toast({ title: "Your cart is empty", description: "Please add items to your cart before proceeding to checkout.", variant: "destructive" });
      router.push('/cart');
    }
  }, [hasMounted, cartItems, router, toast]);

  const onSubmit = (data: CheckoutFormValues) => {
    console.log("Checkout data:", data);
    // Log specific payment details based on method
    let paymentDetailsDescription = `Payment method: ${paymentMethods.find(pm => pm.id === data.paymentMethod)?.label || data.paymentMethod}.`;
    if (data.paymentMethod === 'card' && data.cardDetails) {
        paymentDetailsDescription += ` Card ending in ${data.cardDetails.cardNumber.slice(-4)}.`;
    } else if (data.paymentMethod === 'upi' && data.upiId) {
        paymentDetailsDescription += ` UPI ID: ${data.upiId}.`;
    }

    toast({
      title: "Order Placed Successfully!",
      description: `Thank you for your purchase. ${paymentDetailsDescription} Your order is being processed.`,
    });
    clearCart();
    router.push(`/order-confirmation?orderTotal=${finalOrderTotal.toFixed(2)}&itemCount=${getItemCount()}`);
  };

  if (!hasMounted) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <p className="text-lg text-muted-foreground">Loading checkout...</p>
      </div>
    );
  }

  if (cartItems.length === 0 && hasMounted) { 
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
                      <FormControl><Input placeholder="Mumbai" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="shippingAddress.state" render={({ field }) => (
                    <FormItem>
                      <FormLabel>State / Province</FormLabel>
                      <FormControl><Input placeholder="Maharashtra" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="shippingAddress.zipCode" render={({ field }) => (
                    <FormItem>
                      <FormLabel>PIN Code</FormLabel>
                      <FormControl><Input placeholder="400001" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="shippingAddress.country" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl><Input placeholder="India" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="shippingAddress.phoneNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Phone className="mr-2 h-4 w-4 text-accent" />Phone Number</FormLabel>
                    <FormControl><Input type="tel" placeholder="+91 98765 43210" {...field} /></FormControl>
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
                                <span className="font-semibold text-primary">₹{option.price.toFixed(2)}</span>
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

            {/* Payment Method Selection */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-headline text-primary flex items-center"><CreditCard className="mr-2 h-6 w-6 text-accent" /> Select Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Controller
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="space-y-3"
                    >
                      {paymentMethods.map((method) => (
                        <FormItem key={method.id} className="flex items-center space-x-3 p-3 border rounded-md hover:border-accent transition-colors">
                          <FormControl>
                            <RadioGroupItem value={method.id} />
                          </FormControl>
                          <FormLabel className="font-normal flex-grow cursor-pointer flex items-center">
                            <method.icon className="mr-3 h-5 w-5 text-muted-foreground" />
                            {method.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  )}
                />
                <FormMessage>{form.formState.errors.paymentMethod?.message}</FormMessage>

                {/* Conditional Fields for Card Payment */}
                {watchedPaymentMethod === 'card' && (
                  <div className="space-y-4 pt-4 border-t mt-4">
                    <h3 className="text-lg font-medium text-foreground">Enter Card Details</h3>
                    <FormField control={form.control} name="cardDetails.cardHolderName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><User className="mr-2 h-4 w-4 text-muted-foreground" /> Cardholder Name</FormLabel>
                        <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="cardDetails.cardNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><CreditCard className="mr-2 h-4 w-4 text-muted-foreground" /> Card Number</FormLabel>
                        <FormControl><Input placeholder="•••• •••• •••• ••••" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="cardDetails.expiryDate" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><Calendar className="mr-2 h-4 w-4 text-muted-foreground" /> Expiry Date</FormLabel>
                          <FormControl><Input placeholder="MM/YY" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="cardDetails.cvv" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><Lock className="mr-2 h-4 w-4 text-muted-foreground" /> CVV</FormLabel>
                          <FormControl><Input placeholder="•••" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                )}

                {/* Conditional Fields for UPI Payment */}
                {watchedPaymentMethod === 'upi' && (
                  <div className="space-y-4 pt-4 border-t mt-4">
                     <h3 className="text-lg font-medium text-foreground">Enter UPI ID</h3>
                    <FormField control={form.control} name="upiId" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center"><Smartphone className="mr-2 h-4 w-4 text-muted-foreground" /> UPI ID</FormLabel>
                        <FormControl><Input placeholder="yourname@bank" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                )}

                {/* Info for Cash on Delivery */}
                {watchedPaymentMethod === 'cod' && (
                  <div className="pt-4 border-t mt-4">
                    <p className="text-sm text-muted-foreground">You will pay with cash upon delivery of your order.</p>
                  </div>
                )}

                 {/* Info for Net Banking */}
                 {watchedPaymentMethod === 'netbanking' && (
                  <div className="pt-4 border-t mt-4">
                    <p className="text-sm text-muted-foreground">You will be redirected to your bank's portal to complete the payment securely. (This is a mock-up)</p>
                  </div>
                )}

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
                            <Image src={item.product.imageUrl} alt={item.product.name} layout="fill" objectFit="cover" data-ai-hint="product item"/>
                            </div>
                            <div className="flex-grow">
                            <p className="text-sm font-medium truncate">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-semibold">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
                <Separator />
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items ({getItemCount()}) Subtotal</span>
                    <span className="font-medium">₹{itemsSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium">₹{selectedShippingPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Taxes</span>
                    <span className="font-medium">₹{mockTaxes.toFixed(2)}</span> 
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-primary">Order Total</span>
                  <span className="text-accent">₹{finalOrderTotal.toFixed(2)}</span>
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

    