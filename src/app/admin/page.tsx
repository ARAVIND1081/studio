
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllProducts } from "@/lib/data"; // Changed from PRODUCTS
import Link from "next/link";
import { Shield, Edit3, Trash2, Settings, FileText } from 'lucide-react';
import type { Product } from "@/types";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setProducts(getAllProducts());
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold font-headline text-primary flex items-center">
          <Shield className="mr-3 h-10 w-10 text-accent" />
          Admin Dashboard
        </h1>
      </div>
      <p className="text-lg text-muted-foreground">
        Welcome to the ShopSphere Admin Panel. Manage your products, site content, and settings from here.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-headline">
              <Edit3 className="mr-2 h-6 w-6 text-accent"/> Product Management
            </CardTitle>
            <CardDescription>
              View, add, edit, or delete products in your store.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-72 overflow-y-auto pr-2 space-y-3">
              {products.map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-muted-foreground">${product.price.toFixed(2)} - {product.category}</p>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" disabled>
                      <Edit3 className="mr-1 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" disabled className="text-destructive hover:border-destructive hover:text-destructive">
                      <Trash2 className="mr-1 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {products.length === 0 && <p className="text-muted-foreground">No products found.</p>}
             <Button className="w-full mt-4" disabled>Add New Product</Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-headline">
              <Settings className="mr-2 h-6 w-6 text-accent"/> Site Settings
            </CardTitle>
            <CardDescription>
              Manage general site configurations (Placeholder).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Theme customization, contact information, and other global settings will be managed here.
              This functionality is currently under development.
            </p>
            <Button className="mt-4" disabled>Configure Settings</Button>
          </CardContent>
        </Card>

         <Card className="shadow-lg md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-headline">
              <FileText className="mr-2 h-6 w-6 text-accent"/> Content Management
            </CardTitle>
            <CardDescription>
              Edit page content, promotional banners, etc. (Placeholder).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Tools to edit static content on pages like 'About Us', 'Contact', or promotional sections on the Home Page.
              This functionality is currently under development.
            </p>
            <Button className="mt-4" disabled>Manage Content</Button>
          </CardContent>
        </Card>
      </div>

       <p className="text-sm text-muted-foreground text-center pt-4">
        Please note: Full editing capabilities require further development, including backend integration and robust authentication. The current product list is managed in-memory.
      </p>
    </div>
  );
}
