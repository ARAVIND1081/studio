
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getAllProducts, addProduct, deleteProduct, updateProduct, ProductCreateInput, getSiteSettings, updateSiteSettings } from "@/lib/data";
import Link from "next/link";
import { Shield, Edit3, Trash2, Settings, FileText, PlusCircle, Edit } from 'lucide-react';
import type { Product, SiteSettings } from "@/types";
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

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({ siteName: '', siteTagline: '', contentManagementInfoText: '' });
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [currentSettingsForm, setCurrentSettingsForm] = useState<Partial<SiteSettings>>({});

  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [currentContentInfoText, setCurrentContentInfoText] = useState('');


  const { toast } = useToast();

  useEffect(() => {
    refreshProducts();
    refreshSiteSettings();
  }, []);

  const refreshProducts = () => {
    setProducts(getAllProducts());
  };

  const refreshSiteSettings = () => {
    const currentSettings = getSiteSettings();
    setSiteSettings(currentSettings);
    setCurrentSettingsForm({ siteName: currentSettings.siteName, siteTagline: currentSettings.siteTagline }); // Only siteName and tagline for this dialog
    setCurrentContentInfoText(currentSettings.contentManagementInfoText || '');
  }

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, formType: 'add' | 'edit' | 'settings' | 'content') => {
    const { name, value } = e.target;
    
    if (formType === 'settings') {
        setCurrentSettingsForm(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'content') {
        setCurrentContentInfoText(value);
    } else {
        const parsedValue = name === 'price' ? parseFloat(value) || 0 : value;
        if (formType === 'add') {
          setNewProduct(prev => ({ ...prev, [name]: parsedValue, }));
        } else {
          setCurrentProductForm(prev => ({ ...prev, [name]: parsedValue, }));
        }
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

  const handleOpenSettingsDialog = () => {
    const currentSettings = getSiteSettings();
    setCurrentSettingsForm({ siteName: currentSettings.siteName, siteTagline: currentSettings.siteTagline });
    setIsSettingsDialogOpen(true);
  };

  const handleUpdateSiteSettings = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentSettingsForm.siteName || !currentSettingsForm.siteTagline) {
      toast({ title: "Missing Fields", description: "Site Name and Tagline cannot be empty.", variant: "destructive" });
      return;
    }
    try {
      // Ensure we only update the fields relevant to this dialog
      const settingsToUpdate: Partial<SiteSettings> = {
        siteName: currentSettingsForm.siteName,
        siteTagline: currentSettingsForm.siteTagline,
      };
      updateSiteSettings(settingsToUpdate);
      refreshSiteSettings(); 
      toast({ title: "Settings Updated", description: "Site settings have been successfully updated." });
      setIsSettingsDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update site settings.", variant: "destructive" });
      console.error("Error updating site settings:", error);
    }
  };

  const handleOpenContentDialog = () => {
    const currentSettings = getSiteSettings();
    setCurrentContentInfoText(currentSettings.contentManagementInfoText || '');
    setIsContentDialogOpen(true);
  };

  const handleUpdateContentInfoText = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentContentInfoText) {
       toast({ title: "Missing Field", description: "Content Management Info Text cannot be empty.", variant: "destructive" });
       return;
    }
    try {
      updateSiteSettings({ contentManagementInfoText: currentContentInfoText });
      refreshSiteSettings();
      toast({ title: "Content Updated", description: "Content management info text has been updated." });
      setIsContentDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update content info text.", variant: "destructive" });
      console.error("Error updating content info text:", error);
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
              Manage general site configurations like Site Name and Tagline.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mt-4 bg-primary hover:bg-accent hover:text-accent-foreground" onClick={handleOpenSettingsDialog}>
                  Configure General Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md"> 
                <DialogHeader>
                  <DialogTitle>Configure Site Settings</DialogTitle>
                  <DialogDescription>
                    Update your site's name and tagline. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateSiteSettings} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="siteName" className="text-right">Site Name</Label>
                    <Input id="siteName" name="siteName" value={currentSettingsForm.siteName || ''} onChange={(e) => handleInputChange(e, 'settings')} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="siteTagline" className="text-right">Site Tagline</Label>
                    <Textarea id="siteTagline" name="siteTagline" value={currentSettingsForm.siteTagline || ''} onChange={(e) => handleInputChange(e, 'settings')} className="col-span-3" required />
                  </div>
                  <DialogFooter className="mt-2">
                    <Button type="submit" className="bg-primary hover:bg-accent hover:text-accent-foreground">Save Settings</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">Current Site Name: <span className="font-semibold text-foreground">{siteSettings.siteName}</span></p>
              <p className="text-sm text-muted-foreground">Current Tagline: <span className="font-semibold text-foreground">{siteSettings.siteTagline}</span></p>
            </div>
          </CardContent>
        </Card>

         <Card className="shadow-lg md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl font-headline">
              <FileText className="mr-2 h-6 w-6 text-accent"/> Content Management
            </CardTitle>
            <CardDescription>
              Edit informational text for various site sections.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Current Info Text: "{siteSettings.contentManagementInfoText || "Default placeholder text if not set."}"
            </p>
            <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-primary hover:bg-accent hover:text-accent-foreground" onClick={handleOpenContentDialog}>
                  <Edit className="mr-2 h-5 w-5" /> Manage Content Info Text
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Edit Content Management Info Text</DialogTitle>
                  <DialogDescription>
                    Update the informational text displayed in the content management section.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateContentInfoText} className="grid gap-4 py-4">
                    <Label htmlFor="contentManagementInfoText" className="sr-only">Content Management Info Text</Label>
                    <Textarea 
                        id="contentManagementInfoText" 
                        name="contentManagementInfoText" 
                        value={currentContentInfoText} 
                        onChange={(e) => handleInputChange(e, 'content')}
                        className="col-span-3 min-h-[150px]" 
                        placeholder="Enter informational text for the Content Management section..."
                        required 
                    />
                  <DialogFooter>
                    <Button type="submit" className="bg-primary hover:bg-accent hover:text-accent-foreground">Save Content Text</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

       <p className="text-sm text-muted-foreground text-center pt-4">
        Product management, site settings (Site Name, Tagline), and Content Info Text are now interactive. Changes are in-memory and will reset on server restart.
      </p>
    </div>
  );
}
