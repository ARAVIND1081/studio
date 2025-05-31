
import type { Product, Category, Review, ProductSpecification, SiteSettings, User } from '@/types';

// Keep CATEGORIES exported as it's static data
export const CATEGORIES: Category[] = ["Electronics", "Apparel", "Home Goods", "Books", "Beauty"];

const sampleReviews: Review[] = [
  { id: 'review1', author: 'Jane Doe', rating: 5, comment: 'Absolutely fantastic product!', date: '2023-10-01' },
  { id: 'review2', author: 'John Smith', rating: 4, comment: 'Very good, but a bit pricey.', date: '2023-10-05' },
];

const sampleSpecifications: ProductSpecification[] = [
  { name: 'Material', value: 'Premium Cotton' },
  { name: 'Origin', value: 'Made in Italy' },
];

// Internal store for products
let productsData: Product[] = [
  {
    id: '1',
    name: 'Elegant Smartwatch X1',
    description: 'A fusion of classic design and modern technology. Stay connected in style.',
    price: 299.99,
    category: 'Electronics',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/800x600.png', 'https://placehold.co/800x600.png', 'https://placehold.co/800x600.png'],
    rating: 4.8,
    specifications: [
      { name: 'Display', value: '1.4" AMOLED' },
      { name: 'Battery Life', value: '7 days' },
      { name: 'Water Resistance', value: '5 ATM' },
    ],
    reviews: sampleReviews,
  },
  {
    id: '2',
    name: 'Luxury Silk Scarf',
    description: 'Handcrafted 100% silk scarf with an intricate design. The perfect accessory.',
    price: 120.00,
    category: 'Apparel',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/800x600.png', 'https://placehold.co/800x600.png'],
    rating: 4.9,
    specifications: sampleSpecifications,
    reviews: [sampleReviews[0]],
  },
  {
    id: '3',
    name: 'Artisan Coffee Maker',
    description: 'Brew the perfect cup every morning with this stylish and efficient coffee maker.',
    price: 89.50,
    category: 'Home Goods',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/800x600.png'],
    rating: 4.5,
    specifications: [
      { name: 'Capacity', value: '1.2 Liters' },
      { name: 'Material', value: 'Stainless Steel & Glass' },
    ],
    reviews: [sampleReviews[1]],
  },
  {
    id: '4',
    name: '"The Art of Elegance" - Hardcover',
    description: 'A beautifully illustrated book on the principles of timeless design and style.',
    price: 45.00,
    category: 'Books',
    imageUrl: 'https://placehold.co/600x400.png',
    rating: 4.7,
    specifications: [
      { name: 'Pages', value: '320' },
      { name: 'Publisher', value: 'Prestige Press' },
    ],
    reviews: [],
  },
  {
    id: '5',
    name: 'Opulent Oud Perfume',
    description: 'An exotic and captivating fragrance with notes of rare oud, amber, and spice.',
    price: 199.00,
    category: 'Beauty',
    imageUrl: 'https://placehold.co/600x400.png',
    rating: 5.0,
    specifications: [{ name: 'Volume', value: '100ml' }],
    reviews: sampleReviews,
  },
  {
    id: '6',
    name: 'Cashmere Blend Sweater',
    description: 'Luxuriously soft and warm, this sweater is a timeless wardrobe staple.',
    price: 250.00,
    category: 'Apparel',
    imageUrl: 'https://placehold.co/600x400.png',
    rating: 4.6,
    reviews: [],
    specifications: [],
  },
  {
    id: '7',
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Immerse yourself in pure sound with these premium headphones.',
    price: 349.00,
    category: 'Electronics',
    imageUrl: 'https://placehold.co/600x400.png',
    rating: 4.9,
    reviews: [],
    specifications: [],
  },
  {
    id: '8',
    name: 'Velvet Throw Pillow Set',
    description: 'Add a touch of luxury to your living space with these plush velvet pillows.',
    price: 75.00,
    category: 'Home Goods',
    imageUrl: 'https://placehold.co/600x400.png',
    rating: 4.3,
    reviews: [],
    specifications: [],
  },
];

// --- CRUD Functions for Products ---

// READ
export const getAllProducts = (): Product[] => {
  return productsData.map(p => ({ ...p }));
};

export const getProductById = (id: string): Product | undefined => {
  const product = productsData.find(p => p.id === id);
  return product ? { ...product } : undefined;
};

// CREATE
export type ProductCreateInput = Omit<Product, 'id'>;

export const addProduct = (productInput: ProductCreateInput): Product => {
  const existingIds = productsData.map(p => parseInt(p.id, 10)).filter(id => !isNaN(id));
  const newIdNumber = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
  const newId = newIdNumber.toString();

  const defaultImageUrl = 'https://placehold.co/600x400.png';

  const newProduct: Product = {
    ...productInput,
    id: newId,
    imageUrl: productInput.images && productInput.images.length > 0 ? productInput.images[0] : (productInput.imageUrl || defaultImageUrl),
    images: productInput.images && productInput.images.length > 0 ? productInput.images : (productInput.imageUrl ? [productInput.imageUrl] : [defaultImageUrl]),
    rating: productInput.rating ?? 0,
    specifications: productInput.specifications ?? [],
    reviews: productInput.reviews ?? [],
  };
  productsData.push(newProduct);
  return { ...newProduct }; 
};

// UPDATE
export const updateProduct = (id: string, updates: Partial<Omit<Product, 'id'>>): Product | undefined => {
  const productIndex = productsData.findIndex(p => p.id === id);
  if (productIndex === -1) {
    return undefined;
  }
  
  const existingProduct = productsData[productIndex];
  let updatedProductData = { ...existingProduct, ...updates };

  // If images are being updated, ensure imageUrl is also updated to the first image
  if (updates.images && updates.images.length > 0) {
    updatedProductData.imageUrl = updates.images[0];
  } else if (updates.images && updates.images.length === 0) { 
    // If images array is cleared, fall back to a default or potentially clear imageUrl too
    updatedProductData.imageUrl = 'https://placehold.co/600x400.png'; 
  }


  productsData[productIndex] = updatedProductData;
  return { ...productsData[productIndex] }; 
};

// DELETE
export const deleteProduct = (id: string): boolean => {
  const initialLength = productsData.length;
  productsData = productsData.filter(p => p.id !== id);
  return productsData.length < initialLength;
};

// --- Product Reviews ---
export interface ReviewCreateInput {
  author: string;
  rating: number;
  comment: string;
}

export const addProductReview = (productId: string, reviewInput: ReviewCreateInput): Product | undefined => {
  const productIndex = productsData.findIndex(p => p.id === productId);
  if (productIndex === -1) {
    return undefined;
  }

  const product = productsData[productIndex];
  const newReview: Review = {
    id: `review${product.reviews ? product.reviews.length + 1 : 1}_${productId}_${Date.now()}`,
    author: reviewInput.author,
    rating: reviewInput.rating,
    comment: reviewInput.comment,
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
  };

  if (!product.reviews) {
    product.reviews = [];
  }
  product.reviews.push(newReview);
  
  const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
  product.rating = product.reviews.length > 0 ? parseFloat((totalRating / product.reviews.length).toFixed(1)) : 0;

  productsData[productIndex] = product; // Update the product in the main array
  return { ...product }; // Return a copy of the updated product
};


// --- Site Settings ---
let siteSettingsData: SiteSettings = {
  siteName: "ShopSphere",
  siteTagline: "Your premier destination for luxury and style. Explore our curated collection.",
  contentManagementInfoText: "Manage your products, site settings, and page content from here.",
  homePageNoProductsTitle: "Our Shelves Are Being Restocked!",
  homePageNoProductsDescription: "We're currently updating our inventory with exciting new products. Please check back soon!",
  contactPageTitle: "Get In Touch",
  contactPageDescription: "We'd love to hear from you! Whether you have a question about our products, an order, or just want to say hello, please use the form below.",
  contactPagePhoneNumber: "1-800-555-0199",
  contactPageAddress: "123 Luxury Lane, Shopsville, CA 90210",
  contactPageAdditionalInfo: "Our customer service team is available Monday to Friday, 9 AM - 5 PM PST.",
};

export const getSiteSettings = (): SiteSettings => {
  return { ...siteSettingsData }; // Return a copy
};

export const updateSiteSettings = (newSettings: Partial<SiteSettings>): SiteSettings => {
  siteSettingsData = { ...siteSettingsData, ...newSettings };
  return { ...siteSettingsData }; // Return a copy
};

// --- User Management (In-memory, for UI Prototyping Only - NOT SECURE) ---
let usersData: User[] = [
    { id: 'user1', email: 'test@example.com', password: 'password123', name: 'Test User' },
    { id: 'adminuser', email: 'admin@shopsphere.com', password: 'adminpass', name: 'Shop Admin' }
];

export const getUserByEmail = (email: string): User | undefined => {
  const user = usersData.find(user => user.email === email);
  return user ? {...user} : undefined; // Return a copy
};

export type UserCreateInput = Omit<User, 'id'>;

export const createUser = (userInput: UserCreateInput): User | { error: string } => {
  if (getUserByEmail(userInput.email)) {
    return { error: 'Account already exists with this email.' };
  }
  const newId = `user${usersData.length + 1}_${Date.now()}`;
  const newUser: User = { ...userInput, id: newId };
  usersData.push(newUser);
  return { ...newUser }; // Return a copy
};

export const verifyUserCredentials = (email: string, pass: string): User | null => {
    const user = usersData.find(u => u.email === email); 
    if (user && user.password === pass) { 
        return {...user}; 
    }
    return null;
}

