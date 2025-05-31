
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getAllProducts, addProduct, deleteProduct, updateProduct, ProductCreateInput, getSiteSettings, updateSiteSettings } from "@/lib/data";
import { Shield, Edit3, Trash2, Settings, FileText, PlusCircle, Edit, LogOut, KeyRound, AlertTriangle } from 'lucide-react';
import type { Product, SiteSettings } from "@/types";
import { useEffect, useState, type FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import { useRouter } from 'next/navigation'; // Import useRouter

// --- IMPORTANT: Basic illustrative login ---
// --- NOT FOR PRODUCTION USE. LACKS SECURITY. ---
const HARDCODED_USERNAME = "admin";
const HARDCODED_PASSWORD = "password";
// --- End of illustrative login warning ---

export default function AdminPage() {
  const { currentUser, isLoading: authIsLoading } = useAuth(); // Get main app auth state
  const router = useRouter();

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

  // --- Admin's internal login state ---
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  // --- End of admin's internal login state ---

  useEffect(() => {
    if (!authIsLoading && !currentUser) {
      router.push('/login'); // Redirect if not logged into main app
    }
  }, [currentUser, authIsLoading, router]);

  useEffect(() => {
    // Load admin data only if main user is authenticated AND admin is authenticated internally
    if (currentUser && isAdminAuthenticated) {
      refreshProducts();
      refreshSiteSettings();
    }
  }, [currentUser, isAdminAuthenticated]);

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

  // --- Admin's internal illustrative login functions ---
  const handleAdminLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError(null);
    if (loginUsername === HARDCODED_USERNAME && loginPassword === HARDCODED_PASSWORD) {
      setIsAdminAuthenticated(true);
      setLoginUsername("");
      setLoginPassword("");
      toast({title: "Admin Login Successful", description: "Welcome to the Admin Dashboard."});
    } else {
      setLoginError("Invalid admin username or password.");
      toast({title: "Admin Login Failed", description: "Invalid admin username or password.", variant: "destructive"});
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    toast({title: "Admin Logged Out", description: "You have been logged out of the Admin Dashboard."});
  };
  // --- End of admin's internal illustrative login functions ---

  if (authIsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <p className="text-lg text-muted-foreground">Loading authentication status...</p>
      </div>
    );
  }

  // If main app user is not logged in (and auth is not loading), this will be caught by the useEffect redirect.
  // This is a fallback display if redirect hasn't happened yet or for clearer state.
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

  // If main app user IS logged in, then show the admin's internal login or dashboard
  if (!isAdminAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <KeyRound className="mx-auto h-12 w-12 text-primary mb-3" />
            <CardTitle className="text-3xl font-bold font-headline">Admin Login</CardTitle>
            <CardDescription>Enter your admin credentials to access the dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="admin-username">Admin Username</Label>
                <Input
                  id="admin-username"
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="admin"
                  required
                  className="py-3 px-4 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Admin Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="password"
                  required
                  className="py-3 px-4 text-base"
                />
              </div>
              {loginError && <p className="text-sm text-destructive text-center">{loginError}</p>}
              <Button type="submit" className="w-full bg-primary hover:bg-accent hover:text-accent-foreground text-lg py-3">
                Login to Admin
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If main app user is logged in AND admin is internally authenticated:
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold font-headline text-primary flex items-center">
          <Shield className="mr-3 h-10 w-10 text-accent" />
          Admin Dashboard
        </h1>
        <Button variant="outline" onClick={handleAdminLogout} className="text-destructive hover:border-destructive hover:text-destructive">
          <LogOut className="mr-2 h-5 w-5" /> Logout from Admin
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
        Admin login is illustrative and uses hardcoded credentials ('admin'/'password'). Access to this page requires main application login.
      </p>
    </div>
  );
}
