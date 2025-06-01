
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || `MOCK-${Date.now().toString().slice(-6)}`;
  const orderTotal = searchParams.get('orderTotal') || '0.00';
  const itemCount = searchParams.get('itemCount') || '0';

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
      <Card className="w-full max-w-lg shadow-xl p-6">
        <CardHeader className="items-center">
          <CheckCircle2 className="h-20 w-20 text-green-500 mb-6" />
          <CardTitle className="text-4xl font-bold font-headline text-primary">Thank You For Your Order!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Your order <span className="font-semibold text-primary">#{orderNumber}</span> has been placed successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We've received your order and will begin processing it shortly. 
            You'll receive an email confirmation with your order details.
          </p>
          <div className="border border-dashed rounded-md p-4 space-y-2 bg-muted/50">
            <div className="flex justify-between">
                <span className="text-muted-foreground">Order Number:</span>
                <span className="font-semibold text-primary">{orderNumber}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Items Purchased:</span>
                <span className="font-semibold text-primary">{itemCount}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-muted-foreground">Order Total:</span>
                <span className="font-semibold text-primary">₹{parseFloat(orderTotal).toFixed(2)}</span>
            </div>
          </div>
          
          <Button asChild size="lg" className="w-full bg-primary hover:bg-accent hover:text-accent-foreground mt-6">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading confirmation...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
