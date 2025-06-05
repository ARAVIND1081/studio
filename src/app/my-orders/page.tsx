
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getOrdersByCustomerId } from '@/lib/data';
import type { Order, OrderStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, ShoppingBag, ListOrdered, CalendarDays, Info, Tag, DollarSign, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const getStatusVariant = (status: OrderStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'Pending':
      return 'outline';
    case 'Processing':
      return 'default'; 
    case 'Shipped':
      return 'secondary'; 
    case 'Delivered':
      return 'default'; 
    case 'Cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};
const getStatusColorClass = (status: OrderStatus): string => {
    switch (status) {
        case 'Pending': return 'border-yellow-500 text-yellow-700 bg-yellow-100';
        case 'Processing': return 'border-blue-500 text-blue-700 bg-blue-100';
        case 'Shipped': return 'border-indigo-500 text-indigo-700 bg-indigo-100';
        case 'Delivered': return 'border-green-500 text-green-700 bg-green-100';
        case 'Cancelled': return 'border-red-500 text-red-700 bg-red-100';
        default: return 'border-gray-500 text-gray-700 bg-gray-100';
    }
}


export default function MyOrdersPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (currentUser?.id) {
        const userOrders = getOrdersByCustomerId(currentUser.id);
        setOrders(userOrders);
      } else {
        setOrders([]); 
      }
      setPageLoading(false);
    }
  }, [currentUser, authLoading]);

  if (authLoading || pageLoading) {
    return (
      <div className="text-center py-20">
        <ListOrdered className="mx-auto h-12 w-12 text-muted-foreground animate-pulse mb-4" />
        <p className="text-lg text-muted-foreground">Loading your orders...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold font-headline text-destructive mb-2">Access Denied</h1>
        <p className="text-lg text-muted-foreground mb-6">Please log in to view your orders.</p>
        <Button asChild className="bg-primary hover:bg-accent hover:text-accent-foreground">
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingBag className="mx-auto h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-4xl font-bold font-headline mb-4 text-primary">No Orders Yet</h1>
        <p className="text-lg text-muted-foreground mb-8">You haven't placed any orders with us. Start shopping to see them here!</p>
        <Button size="lg" asChild className="bg-primary hover:bg-accent hover:text-accent-foreground text-lg py-3 px-8">
          <Link href="/shop">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-10">
        <ListOrdered className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold font-headline text-primary">Your Orders</h1>
        <p className="text-lg text-muted-foreground">Track the status of your purchases.</p>
      </div>

      <div className="space-y-6">
        {orders.map(order => (
          <Card key={order.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <CardTitle className="text-xl font-headline text-primary flex items-center">
                  <Tag className="mr-2 h-5 w-5 text-accent" /> Order #{order.orderNumber}
                </CardTitle>
                <Badge variant={getStatusVariant(order.status)} className={`text-sm px-3 py-1 ${getStatusColorClass(order.status)}`}>
                  <Truck className="mr-1.5 h-4 w-4"/> Status: {order.status}
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground flex items-center pt-1">
                <CalendarDays className="mr-1.5 h-3 w-3"/> Placed on: {new Date(order.orderDate).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-4 space-y-4">
              <div>
                <h4 className="font-semibold text-muted-foreground mb-2 text-sm">Items:</h4>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                {order.items.map(item => (
                  <div key={item.product.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-md text-xs">
                    <Image 
                      src={item.product.imageUrl} 
                      alt={item.product.name} 
                      width={40} 
                      height={40} 
                      className="rounded object-cover aspect-square"
                      data-ai-hint="product thumbnail" 
                    />
                    <div className="flex-grow">
                      <p className="font-medium text-foreground truncate">{item.product.name}</p>
                      <p className="text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-primary">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                </div>
              </div>
              <Separator/>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                    <p className="text-muted-foreground"><strong>Shipping To:</strong> {order.customerName}</p>
                    <p className="text-muted-foreground">{order.shippingAddress.addressLine1}, {order.shippingAddress.city}</p>
                </div>
                 <div>
                    <p className="text-muted-foreground"><strong>Shipping Method:</strong> {order.shippingMethod}</p>
                    <p className="text-muted-foreground"><strong>Payment:</strong> {order.paymentMethod}</p>
                </div>
                <div>
                    <p className="text-muted-foreground"><strong>Subtotal (Incl. Tax):</strong> ₹{order.subtotal.toFixed(2)}</p>
                    <p className="text-muted-foreground"><strong>Shipping:</strong> ₹{order.shippingCost.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
            <Separator/>
            <CardFooter className="flex justify-end items-center p-4 bg-muted/30">
                <div className="flex items-center text-lg">
                    <DollarSign className="mr-1 h-5 w-5 text-accent"/>
                    <span className="font-semibold text-primary">Total: ₹{order.totalAmount.toFixed(2)}</span>
                </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

    