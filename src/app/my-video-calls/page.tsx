
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getScheduledCallsByUserId } from '@/lib/data';
import type { ScheduledCall, ScheduledCallStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Video, CalendarDays, MessageSquareText, Info, ShoppingBag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const getCallStatusBadgeVariant = (status: ScheduledCallStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'Pending': return 'outline'; 
        case 'Confirmed': return 'default'; 
        case 'Completed': return 'secondary'; 
        case 'Cancelled': return 'destructive';
        default: return 'outline';
    }
};

const getCallStatusColorClass = (status: ScheduledCallStatus): string => {
    switch (status) {
        case 'Pending': return 'border-yellow-500 text-yellow-700 bg-yellow-100/80 dark:bg-yellow-900/30 dark:text-yellow-300';
        case 'Confirmed': return 'border-blue-500 text-blue-700 bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-300';
        case 'Completed': return 'border-green-500 text-green-700 bg-green-100/80 dark:bg-green-900/30 dark:text-green-300';
        case 'Cancelled': return 'border-red-500 text-red-700 bg-red-100/80 dark:bg-red-900/30 dark:text-red-300';
        default: return 'border-gray-500 text-gray-700 bg-gray-100/80 dark:bg-gray-700/30 dark:text-gray-300';
    }
};


export default function MyVideoCallsPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const [requests, setRequests] = useState<ScheduledCall[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (currentUser?.id) {
        const userRequests = getScheduledCallsByUserId(currentUser.id);
        setRequests(userRequests);
      } else {
        setRequests([]); 
      }
      setPageLoading(false);
    }
  }, [currentUser, authLoading]);

  if (authLoading || pageLoading) {
    return (
      <div className="text-center py-20">
        <Video className="mx-auto h-12 w-12 text-muted-foreground animate-pulse mb-4" />
        <p className="text-lg text-muted-foreground">Loading your video call requests...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold font-headline text-destructive mb-2">Access Denied</h1>
        <p className="text-lg text-muted-foreground mb-6">Please log in to view your video call requests.</p>
        <Button asChild className="bg-primary hover:bg-accent hover:text-accent-foreground">
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-20">
        <Video className="mx-auto h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="text-4xl font-bold font-headline mb-4 text-primary">No Video Call Requests Yet</h1>
        <p className="text-lg text-muted-foreground mb-8">You haven't scheduled any video viewings. Browse products to request one!</p>
        <Button size="lg" asChild className="bg-primary hover:bg-accent hover:text-accent-foreground text-lg py-3 px-8">
          <Link href="/shop"><ShoppingBag className="mr-2 h-5 w-5" /> Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-10">
        <Video className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold font-headline text-primary">Your Video Call Requests</h1>
        <p className="text-lg text-muted-foreground">Track the status of your scheduled product viewings.</p>
      </div>

      <div className="space-y-6">
        {requests.map(call => (
          <Card key={call.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                 <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden shrink-0">
                        <Image 
                        src={call.productImageUrl} 
                        alt={call.productName} 
                        layout="fill"
                        objectFit="cover"
                        className="bg-muted"
                        data-ai-hint="product thumbnail"
                        />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-headline text-primary hover:text-accent transition-colors">
                           <Link href={`/products/${call.productId}`}>{call.productName}</Link>
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground pt-1">
                            Requested for: {format(new Date(call.requestedDateTime), "PPP 'at' h:mm a")}
                        </CardDescription>
                    </div>
                 </div>
                <Badge variant={getCallStatusBadgeVariant(call.status)} className={`text-sm px-3 py-1 mt-2 sm:mt-0 self-start sm:self-center ${getCallStatusColorClass(call.status)}`}>
                  <Info className="mr-1.5 h-4 w-4"/> Status: {call.status}
                </Badge>
              </div>
            </CardHeader>
            
            {call.notes && (
                <>
                <Separator />
                <CardContent className="pt-3 pb-3 text-sm">
                    <div className="flex items-start text-muted-foreground">
                        <MessageSquareText className="mr-2 h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <div>
                            <span className="font-medium text-foreground">Your Notes:</span>
                            <p className="italic whitespace-pre-wrap">{call.notes}</p>
                        </div>
                    </div>
                </CardContent>
                </>
            )}
            <Separator />
            <CardFooter className="p-3 bg-muted/30 text-xs text-muted-foreground flex justify-end">
                Request submitted: {format(new Date(call.createdAt), "PPp")}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}


    