
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getAllProducts, addProduct, deleteProduct, updateProduct, type ProductCreateInput as DataProductCreateInput, getSiteSettings, updateSiteSettings } from "@/lib/data";
import { Shield, Edit3, Trash2, Settings, FileText, PlusCircle, Edit, LogOut, AlertTriangle, UserX, Image as ImageIcon, XCircle } from 'lucide-react';
import type { Product, SiteSettings } from "@/types";
import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // For image previews

const SUPER_ADMIN_EMAIL = "admin@shopsphere.com";

interface AdminProductFormInput {
  name: string;
  description: string;
  price: number;
  category: string;
  imagePreviews: string[]; // Store Data URIs or existing URLs for preview
}

const initialNewProductFormState: AdminProductFormInput = {
  name: "",
  description: "",
  price: 0,
  category: "",
  imagePreviews: [],
};


export default function AdminPage() {
  const { currentUser, isLoading: authIsLoading, logout: mainAppLogout } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [newProductForm, setNewProductForm] = useState<AdminProductFormInput>(initialNewProductFormState);
  const [currentProductForm, setCurrentProductForm] = useState<Partial<AdminProductFormInput & { id?: string }>>({});


  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: '',
    siteTagline: '',
    contentManagementInfoText: '',
    homePageNoProductsTitle: '',
    homePageNoProductsDescription: '',
    contactPageTitle: '',
    contactPageDescription: '',
    contactPagePhoneNumber: '',
    contactPageAddress: '',
    contactPageAdditionalInfo: '',
  });
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [currentSettingsForm, setCurrentSettingsForm] = useState<Partial<SiteSettings>>({});

  const [isContentDialogOpen, setIsContentDialogOpen] = useState(false);
  const [editableContentForm, setEditableContentForm] = useState<Partial<SiteSettings>>({});

  const { toast } = useToast();

  const isAuthorizedAdminUser = !authIsLoading && currentUser?.email === SUPER_ADMIN_EMAIL;

  useEffect(() => {
    if (isAuthorizedAdminUser) {
      refreshProducts();
      refreshSiteSettings();
    }
  }, [isAuthorizedAdminUser]);

  const refreshProducts = () => {
    setProducts(getAllProducts());
  };

  const refreshSiteSettings = () => {
    const currentSettings = getSiteSettings();
    setSiteSettings(currentSettings);
    setCurrentSettingsForm({ siteName: currentSettings.siteName, siteTagline: currentSettings.siteTagline });
    setEditableContentForm({
      contentManagementInfoText: currentSettings.contentManagementInfoText,
      homePageNoProductsTitle: currentSettings.homePageNoProductsTitle,
      homePageNoProductsDescription: currentSettings.homePageNoProductsDescription,
      contactPageTitle: currentSettings.contactPageTitle,
      contactPageDescription: currentSettings.contactPageDescription,
      contactPagePhoneNumber: currentSettings.contactPagePhoneNumber,
      contactPageAddress: currentSettings.contactPageAddress,
      contactPageAdditionalInfo: currentSettings.contactPageAdditionalInfo,
    });
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
        setEditableContentForm(prev => ({ ...prev, [name]: value }));
    } else {
        const parsedValue = name === 'price' ? parseFloat(value) || 0 : value;
        if (formType === 'add') {
          setNewProductForm(prev => ({ ...prev, [name]: parsedValue, }));
        } else {
          setCurrentProductForm(prev => ({ ...prev, [name]: parsedValue, }));
        }
    }
  };

  const handleImageFilesChange = async (event: ChangeEvent<HTMLInputElement>, formType: 'add' | 'edit') => {
    const files = event.target.files;
    if (!files) return;

    const filePromises = Array.from(files).map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read file as Data URI'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    try {
      const dataUris = await Promise.all(filePromises);
      if (formType === 'add') {
        setNewProductForm(prev => ({ ...prev, imagePreviews: dataUris }));
      } else {
        setCurrentProductForm(prev => ({ ...prev, imagePreviews: dataUris }));
      }
    } catch (error) {
      console.error("Error converting files to Data URIs:", error);
      toast({ title: "Image Error", description: "Could not process selected image(s).", variant: "destructive" });
    }
  };

  const removeImagePreview = (index: number, formType: 'add' | 'edit') => {
    if (formType === 'add') {
      setNewProductForm(prev => ({
        ...prev,
        imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
      }));
    } else {
      setCurrentProductForm(prev => ({
        ...prev,
        imagePreviews: (prev.imagePreviews || []).filter((_, i) => i !== index),
      }));
    }
  };


  const handleAddNewProduct = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!newProductForm.name || !newProductForm.category || newProductForm.price <=0 || newProductForm.imagePreviews.length === 0) {
        toast({ title: "Missing Fields", description: "Name, category, price, and at least one image are required.", variant: "destructive"});
        return;
    }

    const productToAdd: DataProductCreateInput = {
        name: newProductForm.name,
        description: newProductForm.description,
        price: newProductForm.price,
        category: newProductForm.category,
        imageUrl: newProductForm.imagePreviews[0], // First image as primary
        images: newProductForm.imagePreviews,      // All images
        rating: 0, 
        specifications: [], 
        reviews: [], 
    };

    try {
      addProduct(productToAdd);
      refreshProducts();
      toast({ title: "Product Added", description: `${newProductForm.name} has been successfully added.` });
      setIsAddDialogOpen(false);
      setNewProductForm(initialNewProductFormState);
    } catch (error) {
      toast({ title: "Error", description: "Failed to add product.", variant: "destructive" });
      console.error("Error adding product:", error);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    const existingImages = product.images && product.images.length > 0 
        ? product.images 
        : (product.imageUrl ? [product.imageUrl] : []);

    setCurrentProductForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imagePreviews: existingImages,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingProduct || !currentProductForm.name || !currentProductForm.category || (currentProductForm.price !== undefined && currentProductForm.price <= 0) || !currentProductForm.imagePreviews || currentProductForm.imagePreviews.length === 0) {
      toast({ title: "Missing Fields", description: "Name, category, price, and at least one image are required.", variant: "destructive" });
      return;
    }
    
    const productToUpdate: Partial<Omit<Product, 'id'>> = {
      name: currentProductForm.name,
      description: currentProductForm.description,
      price: currentProductForm.price,
      category: currentProductForm.category,
      imageUrl: currentProductForm.imagePreviews[0],
      images: currentProductForm.imagePreviews,
    };

    try {
      updateProduct(editingProduct.id, productToUpdate);
      refreshProducts();
      toast({ title: "Product Updated", description: `${currentProductForm.name} has been successfully updated.` });
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      setCurrentProductForm({imagePreviews: []}); // Reset form, including previews
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
    setEditableContentForm({
        contentManagementInfoText: currentSettings.contentManagementInfoText,
        homePageNoProductsTitle: currentSettings.homePageNoProductsTitle,
        homePageNoProductsDescription: currentSettings.homePageNoProductsDescription,
        contactPageTitle: currentSettings.contactPageTitle,
        contactPageDescription: currentSettings.contactPageDescription,
        contactPagePhoneNumber: currentSettings.contactPagePhoneNumber,
        contactPageAddress: currentSettings.contactPageAddress,
        contactPageAdditionalInfo: currentSettings.contactPageAdditionalInfo,
    });
    setIsContentDialogOpen(true);
  };

  const handleUpdatePageContent = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editableContentForm.contentManagementInfoText ||
        !editableContentForm.homePageNoProductsTitle ||
        !editableContentForm.homePageNoProductsDescription ||
        !editableContentForm.contactPageTitle ||
        !editableContentForm.contactPageDescription
        ) {
       toast({ title: "Missing Fields", description: "Core page content fields must be filled.", variant: "destructive" });
       return;
    }
    try {
      updateSiteSettings(editableContentForm);
      refreshSiteSettings();
      toast({ title: "Page Content Updated", description: "Relevant page content sections have been updated." });
      setIsContentDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update page content.", variant: "destructive" });
      console.error("Error updating page content:", error);
    }
  };

  if (authIsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <p className="text-lg text-muted-foreground">Loading authentication status...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold font-headline text-destructive mb-2">Access Denied</h1>
        <p className="text-lg text-muted-foreground mb-6">You must be logged in to access the admin dashboard.</p>
        <Button onClick={() => router.push('/login')} className="bg-primary hover:bg-accent hover:text-accent-foreground">
          Go to Login
        </Button>
      </div>
    );
  }

  if (!isAuthorizedAdminUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <UserX className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold font-headline text-destructive mb-2">Access Denied</h1>
        <p className="text-lg text-muted-foreground mb-6">You are not authorized to access the admin dashboard.</p>
        <Button onClick={() => mainAppLogout()} variant="outline" className="hover:border-destructive hover:text-destructive">
          <LogOut className="mr-2 h-5 w-5" /> Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold font-headline text-primary flex items-center">
          <Shield className="mr-3 h-10 w-10 text-accent" />
          Admin Dashboard
        </h1>
        <Button variant="outline" onClick={() => mainAppLogout()} className="hover:border-destructive hover:text-destructive">
          <LogOut className="mr-2 h-5 w-5" /> Logout from App
        </Button>
      </div>
      <p className="text-lg text-muted-foreground">
        {siteSettings.contentManagementInfoText || "Manage your products, site settings, and page content from here."}
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
            <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => { setIsAddDialogOpen(isOpen); if (!isOpen) setNewProductForm(initialNewProductFormState); }}>
              <DialogTrigger asChild>
                <Button className="w-full mt-4 bg-primary hover:bg-accent hover:text-accent-foreground">
                  <PlusCircle className="mr-2 h-5 w-5" /> Add New Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Fill in the details for the new product. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddNewProduct} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="add-name" className="text-right">Name</Label>
                    <Input id="add-name" name="name" value={newProductForm.name} onChange={(e) => handleInputChange(e, 'add')} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="add-description" className="text-right">Description</Label>
                    <Textarea id="add-description" name="description" value={newProductForm.description} onChange={(e) => handleInputChange(e, 'add')} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="add-price" className="text-right">Price</Label>
                    <Input id="add-price" name="price" type="number" value={newProductForm.price} onChange={(e) => handleInputChange(e, 'add')} className="col-span-3" required min="0.01" step="0.01" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="add-category" className="text-right">Category</Label>
                    <Input id="add-category" name="category" value={newProductForm.category} onChange={(e) => handleInputChange(e, 'add')} className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="add-images" className="text-right pt-2 flex items-center">
                      <ImageIcon className="mr-1 h-4 w-4 text-muted-foreground"/> Images
                    </Label>
                    <Input 
                        id="add-images" 
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageFilesChange(e, 'add')} 
                        className="col-span-3" 
                    />
                  </div>
                  {newProductForm.imagePreviews.length > 0 && (
                    <div className="col-span-4 grid grid-cols-3 gap-2 mt-2 pl-[25%]">
                      {newProductForm.imagePreviews.map((previewSrc, index) => (
                        <div key={index} className="relative group">
                          <Image src={previewSrc} alt={`Preview ${index + 1}`} width={100} height={75} className="rounded object-cover aspect-[4/3]" />
                          <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 bg-black/50 text-white group-hover:opacity-100 opacity-0 h-6 w-6" onClick={() => removeImagePreview(index, 'add')}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <DialogFooter>
                    <Button type="submit" className="bg-primary hover:bg-accent hover:text-accent-foreground">Save Product</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => { setIsEditDialogOpen(isOpen); if (!isOpen) { setEditingProduct(null); setCurrentProductForm({imagePreviews: []});}}}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Product</DialogTitle>
                  <DialogDescription>
                    Update the details for the product. Click save when you're done.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateProduct} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
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
                  <div className="grid grid-cols-4 items-start gap-4">
                     <Label htmlFor="edit-images" className="text-right pt-2 flex items-center">
                       <ImageIcon className="mr-1 h-4 w-4 text-muted-foreground"/> Images
                     </Label>
                    <Input 
                        id="edit-images" 
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleImageFilesChange(e, 'edit')} 
                        className="col-span-3"
                        placeholder="Upload new to replace existing"
                    />
                  </div>
                  {(currentProductForm.imagePreviews || []).length > 0 && (
                    <div className="col-span-4 grid grid-cols-3 gap-2 mt-2 pl-[25%]">
                      {(currentProductForm.imagePreviews || []).map((previewSrc, index) => (
                        <div key={index} className="relative group">
                          <Image src={previewSrc} alt={`Preview ${index + 1}`} width={100} height={75} className="rounded object-cover aspect-[4/3]" />
                           <Button type="button" variant="ghost" size="icon" className="absolute top-0 right-0 bg-black/50 text-white group-hover:opacity-100 opacity-0 h-6 w-6" onClick={() => removeImagePreview(index, 'edit')}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <DialogFooter>
                    <Button type="submit" className="bg-primary hover:bg-accent hover:text-accent-foreground">Save Changes</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <div className="max-h-72 overflow-y-auto pr-2 space-y-3">
              {products.map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center gap-3">
                    <Image src={product.imageUrl} alt={product.name} width={40} height={30} className="rounded object-cover aspect-[4/3]" data-ai-hint="product thumbnail" />
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-muted-foreground">₹{product.price.toFixed(2)} - {product.category}</p>
                    </div>
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
              Edit key text content for various site pages and contact information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog open={isContentDialogOpen} onOpenChange={setIsContentDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-primary hover:bg-accent hover:text-accent-foreground" onClick={handleOpenContentDialog}>
                  <Edit className="mr-2 h-5 w-5" /> Edit Page Content
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Edit Page Content</DialogTitle>
                  <DialogDescription>
                    Update key informational text displayed on various pages and contact details.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdatePageContent} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <Label htmlFor="contentManagementInfoText">Admin Dashboard Info Text</Label>
                        <Textarea
                            id="contentManagementInfoText"
                            name="contentManagementInfoText"
                            value={editableContentForm.contentManagementInfoText || ''}
                            onChange={(e) => handleInputChange(e, 'content')}
                            className="min-h-[80px] mt-1"
                            placeholder="Enter informational text for the Admin Dashboard..."
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="homePageNoProductsTitle">Home Page: "No Products" Title</Label>
                        <Input
                            id="homePageNoProductsTitle"
                            name="homePageNoProductsTitle"
                            value={editableContentForm.homePageNoProductsTitle || ''}
                            onChange={(e) => handleInputChange(e, 'content')}
                            className="mt-1"
                            placeholder="Title for no products alert..."
                            required
                        />
                    </div>
                     <div>
                        <Label htmlFor="homePageNoProductsDescription">Home Page: "No Products" Description</Label>
                        <Textarea
                            id="homePageNoProductsDescription"
                            name="homePageNoProductsDescription"
                            value={editableContentForm.homePageNoProductsDescription || ''}
                            onChange={(e) => handleInputChange(e, 'content')}
                            className="min-h-[80px] mt-1"
                            placeholder="Description for no products alert..."
                            required
                        />
                    </div>
                     <div>
                        <Label htmlFor="contactPageTitle">Contact Page: Title</Label>
                        <Input
                            id="contactPageTitle"
                            name="contactPageTitle"
                            value={editableContentForm.contactPageTitle || ''}
                            onChange={(e) => handleInputChange(e, 'content')}
                            className="mt-1"
                            placeholder="Main title for Contact Us page..."
                            required
                        />
                    </div>
                     <div>
                        <Label htmlFor="contactPageDescription">Contact Page: Description</Label>
                        <Textarea
                            id="contactPageDescription"
                            name="contactPageDescription"
                            value={editableContentForm.contactPageDescription || ''}
                            onChange={(e) => handleInputChange(e, 'content')}
                            className="min-h-[80px] mt-1"
                            placeholder="Introductory description for Contact Us page..."
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="contactPagePhoneNumber">Contact Page: Phone Number</Label>
                        <Input
                            id="contactPagePhoneNumber"
                            name="contactPagePhoneNumber"
                            value={editableContentForm.contactPagePhoneNumber || ''}
                            onChange={(e) => handleInputChange(e, 'content')}
                            className="mt-1"
                            placeholder="e.g., +1-555-123-4567"
                        />
                    </div>
                    <div>
                        <Label htmlFor="contactPageAddress">Contact Page: Address</Label>
                        <Textarea
                            id="contactPageAddress"
                            name="contactPageAddress"
                            value={editableContentForm.contactPageAddress || ''}
                            onChange={(e) => handleInputChange(e, 'content')}
                            className="min-h-[60px] mt-1"
                            placeholder="e.g., 123 Main St, Anytown, USA"
                        />
                    </div>
                    <div>
                        <Label htmlFor="contactPageAdditionalInfo">Contact Page: Additional Info</Label>
                        <Textarea
                            id="contactPageAdditionalInfo"
                            name="contactPageAdditionalInfo"
                            value={editableContentForm.contactPageAdditionalInfo || ''}
                            onChange={(e) => handleInputChange(e, 'content')}
                            className="min-h-[80px] mt-1"
                            placeholder="e.g., Office hours, specific directions..."
                        />
                    </div>
                  <DialogFooter className="mt-2">
                    <Button type="submit" className="bg-primary hover:bg-accent hover:text-accent-foreground">Save Page Content</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
             <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <p>Admin Info: <span className="text-foreground">{siteSettings.contentManagementInfoText}</span></p>
                <p>Contact Phone: <span className="text-foreground">{siteSettings.contactPagePhoneNumber || "Not set"}</span></p>
                <p>Contact Address: <span className="text-foreground">{siteSettings.contactPageAddress || "Not set"}</span></p>
             </div>
          </CardContent>
        </Card>
      </div>

       <p className="text-sm text-muted-foreground text-center pt-4">
        Product management, site settings, and specific page content sections (including contact details) are now interactive. Changes are in-memory.
        Access to this page requires main application login as '{SUPER_ADMIN_EMAIL}'. Image "uploads" are client-side Data URI conversions.
      </p>
    </div>
  );
}
    