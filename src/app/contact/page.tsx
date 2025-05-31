'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { Mail, MessageSquare, User } from "lucide-react";

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }).max(500, { message: "Message cannot exceed 500 characters."}),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  async function onSubmit(data: ContactFormValues) {
    // In a real app, you'd send this data to a backend API
    console.log("Contact form submitted:", data);
    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We'll get back to you soon.",
    });
    form.reset(); // Reset form after submission
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <Mail className="mx-auto h-12 w-12 text-accent mb-4" />
          <CardTitle className="text-4xl font-bold font-headline text-primary">Contact Us</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Have a question or feedback? Fill out the form below and we'll be in touch.
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
    </div>
  );
}
