
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare, User, Phone, MapPin, Info } from "lucide-react";
import { getSiteSettings } from "@/lib/data";
import type { SiteSettings } from "@/types";
import { Separator } from "@/components/ui/separator";

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }).max(500, { message: "Message cannot exceed 500 characters."}),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactPageContent extends SiteSettings {
  // Inherits all from SiteSettings, can add more if needed
}

export default function ContactPage() {
  const { toast } = useToast();
  const [pageContent, setPageContent] = useState<Partial<ContactPageContent>>({
    contactPageTitle: "Contact Us",
    contactPageDescription: "Have a question or feedback? Fill out the form below and we'll be in touch.",
    contactPagePhoneNumber: "",
    contactPageAddress: "",
    contactPageAdditionalInfo: "",
  });

  useEffect(() => {
    const settings = getSiteSettings();
    setPageContent({
      contactPageTitle: settings.contactPageTitle || "Contact Us",
      contactPageDescription: settings.contactPageDescription || "Have a question or feedback? Fill out the form below and we'll be in touch.",
      contactPagePhoneNumber: settings.contactPagePhoneNumber,
      contactPageAddress: settings.contactPageAddress,
      contactPageAdditionalInfo: settings.contactPageAdditionalInfo,
    });
  }, []);
  
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  async function onSubmit(data: ContactFormValues) {
    console.log("Contact form submitted:", data);
    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll get back to you soon.",
    });
    form.reset();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <Mail className="mx-auto h-12 w-12 text-accent mb-4" />
          <CardTitle className="text-4xl font-bold font-headline text-primary">{pageContent.contactPageTitle}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground px-4">
            {pageContent.contactPageDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base flex items-center"><User className="mr-2 h-4 w-4 text-accent" /> Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} className="text-base py-6" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base flex items-center"><Mail className="mr-2 h-4 w-4 text-accent" /> Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} className="text-base py-6" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base flex items-center"><MessageSquare className="mr-2 h-4 w-4 text-accent" /> Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us how we can help..."
                        className="resize-none text-base min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                     <FormDescription className="text-right">{field.value.length} / 500</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="w-full bg-primary hover:bg-accent hover:text-accent-foreground text-lg py-7">
                Send Message
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {(pageContent.contactPagePhoneNumber || pageContent.contactPageAddress || pageContent.contactPageAdditionalInfo) && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-primary">Our Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            {pageContent.contactPagePhoneNumber && (
              <div className="flex items-start">
                <Phone className="mr-3 h-5 w-5 text-accent flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold text-foreground">Phone:</span>
                  <p>{pageContent.contactPagePhoneNumber}</p>
                </div>
              </div>
            )}
            {pageContent.contactPageAddress && (
              <div className="flex items-start">
                <MapPin className="mr-3 h-5 w-5 text-accent flex-shrink-0 mt-1" />
                <div>
                  <span className="font-semibold text-foreground">Address:</span>
                  <p className="whitespace-pre-line">{pageContent.contactPageAddress}</p>
                </div>
              </div>
            )}
            {pageContent.contactPageAdditionalInfo && (
              <>
                {(pageContent.contactPagePhoneNumber || pageContent.contactPageAddress) && <Separator className="my-3"/>}
                <div className="flex items-start">
                  <Info className="mr-3 h-5 w-5 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <span className="font-semibold text-foreground">More Info:</span>
                    <p className="whitespace-pre-line">{pageContent.contactPageAdditionalInfo}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
