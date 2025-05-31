
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getAllProducts, addProduct, deleteProduct, updateProduct, ProductCreateInput } from "@/lib/data";
import Link from "next/link";
import { Shield, Edit3, Trash2, Settings, FileText, PlusCircle } from 'lucide-react';
import type { Product } from "@/types";
import { useEffect, useState, type FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<ProductCreateInput>({
    name: "",
    description: "",
    price: 0,
    category: "",
    imageUrl: "",
    images: [],
    rating: 0,
    specifications: [],
    reviews: [],
  });
  const [currentProductForm, setCurrentProductForm] = useState<Partial<Product>>({});

  const { toast } = useToast();

  useEffect(() => {
    refreshProducts();
  }, []);

  const refreshProducts = () => {
    setProducts(getAllProducts());
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const success = deleteProduct(productId);
      if (success) {
        refreshProducts();
        toast({ title: "Product Deleted", description: "The product has been removed." });
      } else {
        toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, formType: 'add' | 'edit') => {
    const { name, value } = e.target;
    const parsedValue = name === 'price' ? parseFloat(value) || 0 : value;

    if (formType === 'add') {
      setNewProduct(prev => ({
        ...prev,
        [name]: parsedValue,
      }));
    } else {
      setCurrentProductForm(prev => ({
        ...prev,
        [name]: parsedValue,
      }));
    }
  };

  const handleAddNewProduct = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.category || newProduct.price <=0 || !newProduct.imageUrl) {
        toast({ title: "Missing Fields", description: "Please fill in all required product details.", variant: "destructive"});
        return;
    }
    try {
      addProduct(newProduct);
      refreshProducts();
      toast({ title: "Product Added", description: `${newProduct.name} has been successfully added.` });
      setIsAddDialogOpen(false);
      setNewProduct({ name: "", description: "", price: 0, category: "", imageUrl: "", images: [], rating: 0, specifications: [], reviews: [] });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add product.", variant: "destructive" });
      console.error("Error adding product:", error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setCurrentProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct || !currentProductForm.name || !currentProductForm.category || (currentProductForm.price !== undefined && currentProductForm.price <= 0) || !currentProductForm.imageUrl) {
      toast({ title: "Missing Fields", description: "Please fill in all required product details for editing.", variant: "destructive" });
      return;
    }
    try {
      updateProduct(editingProduct.id, currentProductForm as Partial<Omit<Product, 'id'>>);
      refreshProducts();
      toast({ title: "Product Updated", description: `${currentProductForm.name} has been successfully updated.` });
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      setCurrentProductForm({});
    } catch (error) {
      toast({ title: "Error", description: "Failed to update product.", variant: "destructive" });
      console.error("Error updating product:", error);
    }
  };


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
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mt-4 bg-primary hover:bg-accent hover:text-accent-foreground">
                  <PlusCircle className="mr-2 h-5 w-5" /> Add New Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Fill in the details for the new product. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddNewProduct} className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="add-name" className="text-right">Name</Label>
                    <Input id="add-name" name="name" value={newProduct.name} onChange={(e) => handleInputChange(e, 'add')} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="add-description" className="text-right">Description</Label>
                    <Textarea id="add-description" name="description" value={newProduct.description} onChange={(e) => handleInputChange(e, 'add')} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="add-price" className="text-right">Price</Label>
                    <Input id="add-price" name="price" type="number" value={newProduct.price} onChange={(e) => handleInputChange(e, 'add')} className="col-span-3" required min="0.01" step="0.01" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="add-category" className="text-right">Category</Label>
                    <Input id="add-category" name="category" value={newProduct.category} onChange={(e) => handleInputChange(e, 'add')} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="add-imageUrl" className="text-right">Image URL</Label>
                    <Input id="add-imageUrl" name="imageUrl" value={newProduct.imageUrl} onChange={(e) => handleInputChange(e, 'add')} className="col-span-3" placeholder="https://placehold.co/600x400.png" required />
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="bg-primary hover:bg-accent hover:text-accent-foreground">Save Product</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Edit Product Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Product</DialogTitle>
                  <DialogDescription>
                    Update the details for the product. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateProduct} className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-name" className="text-right">Name</Label>
                    <Input id="edit-name" name="name" value={currentProductForm.name || ''} onChange={(e) => handleInputChange(e, 'edit')} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-description" className="text-right">Description</Label>
                    <Textarea id="edit-description" name="description" value={currentProductForm.description || ''} onChange={(e) => handleInputChange(e, 'edit')} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-price" className="text-right">Price</Label>
                    <Input id="edit-price" name="price" type="number" value={currentProductForm.price || 0} onChange={(e) => handleInputChange(e, 'edit')} className="col-span-3" required min="0.01" step="0.01" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-category" className="text-right">Category</Label>
                    <Input id="edit-category" name="category" value={currentProductForm.category || ''} onChange={(e) => handleInputChange(e, 'edit')} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-imageUrl" className="text-right">Image URL</Label>
                    <Input id="edit-imageUrl" name="imageUrl" value={currentProductForm.imageUrl || ''} onChange={(e) => handleInputChange(e, 'edit')} className="col-span-3" placeholder="https://placehold.co/600x400.png" required />
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="bg-primary hover:bg-accent hover:text-accent-foreground">Save Changes</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <div className="max-h-72 overflow-y-auto pr-2 space-y-3">
              {products.map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-muted-foreground">${product.price.toFixed(2)} - {product.category}</p>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                      <Edit3 className="mr-1 h-4 w-4" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(product.id)} className="text-destructive hover:border-destructive hover:text-destructive">
                      <Trash2 className="mr-1 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {products.length === 0 && <p className="text-muted-foreground">No products found.</p>}
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
        Product management (add, edit, delete) is now interactive. Changes are in-memory and will reset on server restart.
      </p>
    </div>
  );
}
