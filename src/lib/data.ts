
import type { Product, Category, Review, ProductSpecification, SiteSettings, User, Order, OrderStatus, OrderItem, ShippingAddress } from '@/types';
import { ORDER_STATUSES } from '@/types';

// Keep CATEGORIES exported as it's static data
export const CATEGORIES: Category[] = ["Electronics", "Apparel", "Home Goods", "Books", "Beauty"];

// localStorage keys
const PRODUCTS_STORAGE_KEY = 'shopSphereProducts';
const SETTINGS_STORAGE_KEY = 'shopSphereSettings';
const USERS_STORAGE_KEY = 'shopSphereUsers';
const ORDERS_STORAGE_KEY = 'shopSphereOrders';


// --- Helper function to load from localStorage ---
// Returns defaultValue if:
// 1. Running on server (window is undefined)
// 2. localStorage key is not found on client
// 3. localStorage data is corrupted on client (it removes the item and then returns default)
// In cases 2 and 3 (on client), it will also save defaultValue to localStorage.
function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      return JSON.parse(storedValue) as T;
    }
  } catch (error) {
    console.error(`Error loading or parsing ${key} from localStorage:`, error);
    localStorage.removeItem(key); // Clear corrupted data
  }
  // If not found, or error during parsing, or if localStorage was cleared:
  // Save the default value to initialize localStorage for next time (on client)
  saveToLocalStorage(key, defaultValue); // This save is also guarded
  return defaultValue;
}

// --- Helper function to save to localStorage ---
function saveToLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }
  // Special handling for null: if value is null, we store the string 'null'
  // This is because JSON.stringify(null) is 'null'.
  if (value === null) {
    try {
      localStorage.setItem(key, 'null');
    } catch (error) {
      console.error(`Error saving null to ${key} in localStorage:`, error);
    }
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    // Potentially handle quota exceeded error here if needed
  }
}


const sampleReviews: Review[] = [
  { id: 'review1', author: 'Jane Doe', rating: 5, comment: 'Absolutely fantastic product!', date: '2023-10-01' },
  { id: 'review2', author: 'John Smith', rating: 4, comment: 'Very good, but a bit pricey.', date: '2023-10-05' },
];

const sampleSpecifications: ProductSpecification[] = [
  { name: 'Material', value: 'Premium Cotton' },
  { name: 'Origin', value: 'Made in Italy' },
];

// --- Product Data Initialization ---
const RAW_DEFAULT_PRODUCTS_SEED: Partial<Product>[] = [
  {
    id: '1',
    name: 'Elegant Smartwatch X1',
    description: 'A fusion of classic design and modern technology. Stay connected in style.',
    price: 29999.00,
    category: 'Electronics',
    imageUrl: 'https://placehold.co/800x600.png',
    images: ['https://placehold.co/800x600.png', 'https://placehold.co/800x600.png?1', 'https://placehold.co/800x600.png?2'],
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
    price: 8999.00,
    category: 'Apparel',
    imageUrl: 'https://placehold.co/800x600.png',
    images: ['https://placehold.co/800x600.png', 'https://placehold.co/800x600.png?3'],
    rating: 4.9,
    specifications: sampleSpecifications,
    reviews: [sampleReviews[0]],
  },
  {
    id: '3',
    name: 'Artisan Coffee Maker',
    description: 'Brew the perfect cup every morning with this stylish and efficient coffee maker.',
    price: 6700.00,
    category: 'Home Goods',
    imageUrl: 'https://placehold.co/800x600.png',
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
    price: 3375.00,
    category: 'Books',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
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
    price: 14925.00,
    category: 'Beauty',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: 5.0,
    specifications: [{ name: 'Volume', value: '100ml' }],
    reviews: sampleReviews,
  },
  {
    id: '6',
    name: 'Cashmere Blend Sweater',
    description: 'Luxuriously soft and warm, this sweater is a timeless wardrobe staple.',
    price: 18750.00,
    category: 'Apparel',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: 4.6,
    reviews: [],
    specifications: [],
  },
  {
    id: '7',
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Immerse yourself in pure sound with these premium headphones.',
    price: 26175.00,
    category: 'Electronics',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: 4.9,
    reviews: [],
    specifications: [],
  },
  {
    id: '8',
    name: 'Velvet Throw Pillow Set',
    description: 'Add a touch of luxury to your living space with these plush velvet pillows.',
    price: 5625.00,
    category: 'Home Goods',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: 4.3,
    reviews: [],
    specifications: [],
  },
  ...Array.from({ length: 50 }).map((_, index) => {
    const categoryIndex = index % CATEGORIES.length;
    const category = CATEGORIES[categoryIndex];
    const productNumber = Math.floor(index / CATEGORIES.length) + 1;
    const subIndex = index % CATEGORIES.length + 1;
    let price;
    switch (category) {
        case 'Electronics': price = parseFloat((Math.random() * (45000 - 5000) + 5000).toFixed(2)); break;
        case 'Apparel': price = parseFloat((Math.random() * (15000 - 1000) + 1000).toFixed(2)); break;
        case 'Home Goods': price = parseFloat((Math.random() * (20000 - 1500) + 1500).toFixed(2)); break;
        case 'Books': price = parseFloat((Math.random() * (5000 - 500) + 500).toFixed(2)); break;
        case 'Beauty': price = parseFloat((Math.random() * (10000 - 800) + 800).toFixed(2)); break;
        default: price = parseFloat((Math.random() * (10000 - 500) + 500).toFixed(2));
    }
    const defaultImg = 'https://placehold.co/600x400.png';
    return {
        id: `${9 + index}`,
        name: `New ${category} Product ${productNumber}-${subIndex}`,
        description: `This is a high-quality new ${category.toLowerCase()} product ${productNumber}-${subIndex}. Explore its features and enjoy its benefits. A great addition to the ${category} collection.`,
        price: price,
        category: category,
        imageUrl: defaultImg,
        images: [defaultImg],
        rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
        specifications: [],
        reviews: [],
    };
  })
];

const DEFAULT_PRODUCTS_SEED: Product[] = RAW_DEFAULT_PRODUCTS_SEED.map((p, index) => {
    const defaultImg = 'https://placehold.co/600x400.png';
    const pImages = p.images && p.images.length > 0 ? p.images : (p.imageUrl ? [p.imageUrl] : [defaultImg]);
    return {
      id: p.id || `${index + 1}-prod`,
      name: p.name || `Product ${index + 1}`,
      description: p.description || 'Default product description.',
      price: p.price || parseFloat((Math.random() * 1000).toFixed(2)),
      category: p.category || CATEGORIES[index % CATEGORIES.length],
      imageUrl: pImages[0],
      images: pImages,
      rating: p.rating || parseFloat((Math.random() * 2 + 3).toFixed(1)), // Between 3.0 and 5.0
      specifications: p.specifications || [],
      reviews: p.reviews || [],
    };
});

// In-memory store
let productsData: Product[];

function mapProductForConsistency(p: any): Product { // Add 'any' type for p from potentially old localStorage
  const defaultImg = 'https://placehold.co/600x400.png';
  const pImages = (p.images && Array.isArray(p.images) && p.images.length > 0)
                  ? p.images
                  : (p.imageUrl ? [p.imageUrl] : [defaultImg]);
  return {
    id: String(p.id || 'unknown'),
    name: p.name || `Unnamed Product ${p.id || 'unknown'}`,
    description: p.description || 'No description available.',
    price: typeof p.price === 'number' ? p.price : 0,
    category: p.category || CATEGORIES[0],
    imageUrl: pImages[0],
    images: pImages.map(img => String(img)), // Ensure image URLs are strings
    rating: typeof p.rating === 'number' ? parseFloat(p.rating.toFixed(1)) : parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: Array.isArray(p.specifications) ? p.specifications.map(s => ({ ...s })) : [],
    reviews: Array.isArray(p.reviews) ? p.reviews.map(r => ({ ...r })) : [],
  };
}

function initializeProductsData() {
  const loadedProducts = loadFromLocalStorage<Product[]>(PRODUCTS_STORAGE_KEY, DEFAULT_PRODUCTS_SEED);
  
  // This heuristic checks if the loaded data from localStorage is likely an older, smaller seed set.
  // It compares lengths. If current code's default seed is larger, it suggests an update to localStorage.
  // The `loadedProducts !== DEFAULT_PRODUCTS_SEED` check ensures this "upgrade" logic only runs
  // if `loadFromLocalStorage` actually returned data from localStorage, not the default seed itself (e.g. on SSR).
  if (typeof window !== 'undefined' && loadedProducts !== DEFAULT_PRODUCTS_SEED && loadedProducts.length < DEFAULT_PRODUCTS_SEED.length) {
    productsData = DEFAULT_PRODUCTS_SEED.map(mapProductForConsistency); // Use a deep copy of the full seed
    saveToLocalStorage(PRODUCTS_STORAGE_KEY, productsData); // "Upgrade" localStorage
  } else {
    // Use loadedProducts (which could be from localStorage or the default seed if SSR/empty LS)
    // Map it to ensure all products conform to the current Product structure and have defaults for new fields.
    productsData = loadedProducts.map(mapProductForConsistency);
  }
}
initializeProductsData();


// --- CRUD Functions for Products ---
export const getAllProducts = (): Product[] => {
  return productsData.map(p => ({ ...p, reviews: p.reviews?.map(r => ({...r})), specifications: p.specifications?.map(s => ({...s})), images: p.images ? [...p.images] : [] }));
};

export const getProductById = (id: string): Product | undefined => {
  const product = productsData.find(p => p.id === id);
  return product ? ({ ...product, reviews: product.reviews?.map(r => ({...r})), specifications: product.specifications?.map(s => ({...s})), images: product.images ? [...product.images] : [] }) : undefined;
};

export type ProductCreateInput = Omit<Product, 'id'>;

export const addProduct = (productInput: ProductCreateInput): Product => {
  const existingIds = productsData.map(p => parseInt(p.id, 10)).filter(id => !isNaN(id));
  const newIdNumber = existingIds.length > 0 ? Math.max(0, ...existingIds) + 1 : 1; // Ensure Math.max has at least one number or defaults to 0
  const newId = newIdNumber.toString();

  const defaultImageUrl = 'https://placehold.co/600x400.png';
  const images = productInput.images && productInput.images.length > 0
                 ? productInput.images
                 : (productInput.imageUrl ? [productInput.imageUrl] : [defaultImageUrl]);

  const newProduct: Product = {
    ...productInput,
    id: newId,
    imageUrl: images[0],
    images: images.map(img => String(img)),
    rating: productInput.rating ?? 0,
    specifications: productInput.specifications ?? [],
    reviews: productInput.reviews ?? [],
  };
  productsData.push(newProduct);
  saveToLocalStorage(PRODUCTS_STORAGE_KEY, productsData);
  return { ...newProduct, reviews: newProduct.reviews?.map(r => ({...r})), specifications: newProduct.specifications?.map(s => ({...s})), images: newProduct.images ? [...newProduct.images] : [] };
};

export const updateProduct = (id: string, updates: Partial<Omit<Product, 'id'>>): Product | undefined => {
  const productIndex = productsData.findIndex(p => p.id === id);
  if (productIndex === -1) {
    return undefined;
  }

  const existingProduct = productsData[productIndex];
  let updatedProductData: Product = { ...existingProduct, ...updates };

  // Ensure images and imageUrl are consistent
  if (updates.images && Array.isArray(updates.images)) {
    if (updates.images.length > 0) {
      updatedProductData.imageUrl = updates.images[0];
      updatedProductData.images = updates.images.map(img => String(img));
    } else { // If images array is explicitly set to empty
      const defaultImg = 'https://placehold.co/600x400.png';
      updatedProductData.imageUrl = defaultImg;
      updatedProductData.images = [defaultImg];
    }
  } else if (updates.imageUrl && (!updates.images || updates.images.length === 0)) {
    // If only imageUrl is updated and images array is not, or is empty.
    updatedProductData.images = [updates.imageUrl];
  }


  productsData[productIndex] = mapProductForConsistency(updatedProductData); // Ensure structure consistency on update
  saveToLocalStorage(PRODUCTS_STORAGE_KEY, productsData);
  const savedProduct = productsData[productIndex];
  return { ...savedProduct, reviews: savedProduct.reviews?.map(r => ({...r})), specifications: savedProduct.specifications?.map(s => ({...s})), images: savedProduct.images ? [...savedProduct.images] : [] };
};

export const deleteProduct = (id: string): boolean => {
  const initialLength = productsData.length;
  productsData = productsData.filter(p => p.id !== id);
  const success = productsData.length < initialLength;
  if (success) {
    saveToLocalStorage(PRODUCTS_STORAGE_KEY, productsData);
  }
  return success;
};

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
    date: new Date().toISOString().split('T')[0],
  };

  if (!product.reviews) {
    product.reviews = [];
  }
  product.reviews.push(newReview);

  const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
  product.rating = product.reviews.length > 0 ? parseFloat((totalRating / product.reviews.length).toFixed(1)) : 0;

  productsData[productIndex] = product;
  saveToLocalStorage(PRODUCTS_STORAGE_KEY, productsData);
  const savedProduct = productsData[productIndex];
  return { ...savedProduct, reviews: savedProduct.reviews?.map(r => ({...r})), specifications: savedProduct.specifications?.map(s => ({...s})), images: savedProduct.images ? [...savedProduct.images] : [] };
};


// --- Site Settings ---
const DEFAULT_SITE_SETTINGS: SiteSettings = {
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

let siteSettingsData: SiteSettings;

function initializeSiteSettings() {
  const loadedSettings = loadFromLocalStorage<SiteSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SITE_SETTINGS);
  
  const finalSettings = { ...DEFAULT_SITE_SETTINGS, ...loadedSettings };
  siteSettingsData = finalSettings;

  // If on client and the merging resulted in changes compared to what was *loaded* from LS
  // (meaning DEFAULT_SITE_SETTINGS provided new/updated default values for missing keys) then save the merged version.
  // This also handles the case where loadFromLocalStorage had to save the default for the first time.
  if (typeof window !== 'undefined' && 
      JSON.stringify(siteSettingsData) !== JSON.stringify(loadedSettings) && // Check if merged value is different from what was loaded
      loadedSettings !== DEFAULT_SITE_SETTINGS) { // And ensure it was actually loaded from LS, not the default from SSR
     saveToLocalStorage(SETTINGS_STORAGE_KEY, siteSettingsData);
  }
  // If loadFromLocalStorage returned DEFAULT_SITE_SETTINGS (e.g., on first client load or SSR),
  // it has already handled saving it to localStorage on the client side.
}
initializeSiteSettings();


export const getSiteSettings = (): SiteSettings => {
  return { ...siteSettingsData };
};

export const updateSiteSettings = (newSettings: Partial<SiteSettings>): SiteSettings => {
  siteSettingsData = { ...siteSettingsData, ...newSettings };
  saveToLocalStorage(SETTINGS_STORAGE_KEY, siteSettingsData);
  return { ...siteSettingsData };
};

// --- User Management ---
const DEFAULT_USERS_DATA: User[] = [
    { id: 'user1', email: 'test@example.com', password: 'password123', name: 'Test User' },
    { id: 'adminuser', email: 'admin@shopsphere.com', password: 'adminpass', name: 'Shop Admin' }
];

let usersData: User[];

function initializeUsersData() {
  const loadedUsers = loadFromLocalStorage<User[]>(USERS_STORAGE_KEY, DEFAULT_USERS_DATA.map(u => ({...u})));
  usersData = loadedUsers.map(u => ({...u})); // Work with copies

  // On the client, ensure default users (like admin) are present if they were somehow removed
  // or if DEFAULT_USERS_DATA was updated with new essential users.
  if (typeof window !== 'undefined') {
    let needsSave = false;
    DEFAULT_USERS_DATA.forEach(defaultUser => {
      if (!usersData.find(u => u.email === defaultUser.email)) {
        usersData.push({...defaultUser});
        needsSave = true;
      }
    });
    if (needsSave) {
      saveToLocalStorage(USERS_STORAGE_KEY, usersData);
    }
  }
  // If loadFromLocalStorage returned DEFAULT_USERS_DATA, it already saved it to LS on client.
}
initializeUsersData();


export const getUserByEmail = (email: string): User | undefined => {
  const user = usersData.find(user => user.email === email);
  return user ? {...user} : undefined;
};

export type UserCreateInput = Omit<User, 'id'>;

export const createUser = (userInput: UserCreateInput): User | { error: string } => {
  if (usersData.find(user => user.email === userInput.email)) {
    return { error: 'Account already exists with this email.' };
  }
  const newId = `user${usersData.length + 1}_${Date.now()}`;
  const newUser: User = { ...userInput, id: newId, name: userInput.name || `User ${newIdNumber.toString().slice(-4)}` };
  usersData.push(newUser);
  saveToLocalStorage(USERS_STORAGE_KEY, usersData);
  return { ...newUser };
};

export const verifyUserCredentials = (email: string, pass: string): User | null => {
    const user = usersData.find(u => u.email === email);
    if (user && user.password === pass) { // Plain text password check (demo only)
        return {...user};
    }
    return null;
};

// --- Order Management ---
const DEFAULT_ORDERS_SEED: Order[] = []; // Start with no default orders
let ordersData: Order[];
let newIdNumber = 1; // for user IDs if needed for name generation

function initializeOrdersData() {
  // loadFromLocalStorage will return DEFAULT_ORDERS_SEED if:
  // 1. Running on server (window is undefined)
  // 2. localStorage key is not found on client
  // 3. localStorage data is corrupted on client (it removes the item and then returns default)
  // In cases 2 and 3 (on client), it will also save DEFAULT_ORDERS_SEED to localStorage.
  ordersData = loadFromLocalStorage<Order[]>(ORDERS_STORAGE_KEY, DEFAULT_ORDERS_SEED);
  // No further complex conditions are needed here for the initial load.
  // ordersData is now correctly populated either from localStorage or with the default.
}
initializeOrdersData();


export const getAllOrders = (): Order[] => {
  return ordersData.map(o => ({...o})).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()); // Sort by most recent
};

export type OrderCreateInput = Omit<Order, 'id' | 'orderNumber' | 'orderDate' | 'status'>;

export const addOrder = (orderInput: OrderCreateInput): Order => {
  const newId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newOrderNumber = `SHP-${Date.now().toString().slice(-6)}`;
  
  const newOrder: Order = {
    ...orderInput,
    id: newId,
    orderNumber: newOrderNumber,
    orderDate: new Date().toISOString(),
    status: 'Pending', // Default status
  };
  ordersData.unshift(newOrder); // Add to the beginning for recent first
  saveToLocalStorage(ORDERS_STORAGE_KEY, ordersData);
  return { ...newOrder };
};

export const updateOrderStatus = (orderId: string, newStatus: OrderStatus): Order | undefined => {
    const orderIndex = ordersData.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        return undefined;
    }
    ordersData[orderIndex].status = newStatus;
    saveToLocalStorage(ORDERS_STORAGE_KEY, ordersData);
    return { ...ordersData[orderIndex] };
};

// Reset function for debugging/testing - not for production use
export function _resetAllData_USE_WITH_CAUTION() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    localStorage.removeItem(USERS_STORAGE_KEY);
    localStorage.removeItem(ORDERS_STORAGE_KEY);
    console.warn("All ShopSphere localStorage data has been cleared.");
    // Re-initialize with defaults
    initializeProductsData();
    initializeSiteSettings();
    initializeUsersData();
    initializeOrdersData();
  } else {
    console.warn("_resetAllData_USE_WITH_CAUTION can only be called on the client.");
  }
}
