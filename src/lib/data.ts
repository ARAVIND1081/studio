
import type { Product, Category, Review, ProductSpecification, SiteSettings } from '@/types';

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

  const newProduct: Product = {
    ...productInput,
    id: newId,
    rating: productInput.rating ?? 0,
    reviews: productInput.reviews ?? [],
    specifications: productInput.specifications ?? [],
    images: productInput.images ?? (productInput.imageUrl ? [productInput.imageUrl] : []),
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
  productsData[productIndex] = { ...productsData[productIndex], ...updates };
  return { ...productsData[productIndex] }; 
};

// DELETE
export const deleteProduct = (id: string): boolean => {
  const initialLength = productsData.length;
  productsData = productsData.filter(p => p.id !== id);
  return productsData.length < initialLength;
};

// --- Site Settings ---
let siteSettingsData: SiteSettings = {
  siteName: "ShopSphere",
  siteTagline: "Your premier destination for luxury and style. Explore our curated collection.",
  contentManagementInfoText: "Tools to edit static content on pages like 'About Us', 'Contact', or promotional sections on the Home Page. This functionality is currently under development.",
};

export const getSiteSettings = (): SiteSettings => {
  return { ...siteSettingsData }; // Return a copy
};

export const updateSiteSettings = (newSettings: Partial<SiteSettings>): SiteSettings => {
  siteSettingsData = { ...siteSettingsData, ...newSettings };
  return { ...siteSettingsData }; // Return a copy
};
