'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <AlertTriangle className="mx-auto h-20 w-20 text-destructive mb-6" />
      <h1 className="text-4xl font-bold font-headline text-destructive mb-4">Oops! Something went wrong.</h1>
      <p className="text-lg text-muted-foreground mb-8">
        We encountered an unexpected issue. Please try again.
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        Error details: {error.message}
        {error.digest && <span className="block">Digest: {error.digest}</span>}
      </p>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        size="lg"
        className="bg-primary hover:bg-accent hover:text-accent-foreground"
      >
        Try Again
      </Button>
    </div>
  );
}
