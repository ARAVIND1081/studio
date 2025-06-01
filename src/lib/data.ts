
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
function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      // Ensure that if 'null' was stored (as a string), it's parsed back to null.
      // This is important if defaultValue could be null.
      if (storedValue === 'null' && defaultValue === null) {
        return null as T; // Type assertion needed here
      }
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
  try {
    // If value is null, localStorage.setItem stores the string "null".
    // JSON.stringify(null) also produces "null". So this is fine.
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
const DEFAULT_PRODUCTS_SEED: Product[] = [
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
    reviews: sampleReviews.map(r => ({...r})),
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
    specifications: sampleSpecifications.map(s => ({...s})),
    reviews: [sampleReviews[0]].map(r => ({...r})),
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
    reviews: [sampleReviews[1]].map(r => ({...r})),
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
    reviews: sampleReviews.map(r => ({...r})),
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
        name: `New ${category} Item ${productNumber}-${subIndex}`, // Changed "Product" to "Item" for variety
        description: `This is a high-quality new ${category.toLowerCase()} item ${productNumber}-${subIndex}. Explore its features and enjoy its benefits. A great addition to the ${category} collection. Stock keeping unit: SKU${1000 + index}. Batch number BATCH-${2023 + index}.`,
        price: price,
        category: category,
        imageUrl: defaultImg,
        images: [defaultImg, `https://placehold.co/600x400.png?extra=${index}`], // Added a second unique image
        rating: parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(1)), // Slightly higher min rating
        specifications: [{name: "Origin", value: (index % 2 === 0) ? "Local" : "Imported"}, {name: "Warranty", value: "1 Year"}], // Added some basic specs
        reviews: [],
    };
  })
].map(p => mapProductForConsistency(p)); // Ensure all seed products are consistently mapped


// In-memory store
let productsData: Product[];

function mapProductForConsistency(p: any): Product {
  const defaultImg = 'https://placehold.co/600x400.png';
  const pImages = (p.images && Array.isArray(p.images) && p.images.length > 0)
                  ? p.images.map(String) // Ensure all image URLs are strings
                  : (p.imageUrl ? [String(p.imageUrl)] : [defaultImg]);

  return {
    id: String(p.id || `fallback-${Date.now()}-${Math.random()}`), // Ensure ID is a string and provide a robust fallback
    name: p.name || `Unnamed Product`,
    description: p.description || 'No description available.',
    price: typeof p.price === 'number' ? p.price : 0,
    category: p.category || CATEGORIES[0],
    imageUrl: pImages[0], // Ensure imageUrl is the first from the processed images array
    images: pImages,
    rating: typeof p.rating === 'number' ? parseFloat(p.rating.toFixed(1)) : parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: Array.isArray(p.specifications) ? p.specifications.map(s => ({ ...s, name: String(s.name), value: String(s.value) })) : [], // Ensure spec name/value are strings
    reviews: Array.isArray(p.reviews) ? p.reviews.map(r => ({ ...r, id: String(r.id), author: String(r.author), comment: String(r.comment), date: String(r.date), rating: Number(r.rating) })) : [], // Ensure review fields are correct type
  };
}

function initializeProductsData() {
  const storedProducts = loadFromLocalStorage<Product[] | null>(PRODUCTS_STORAGE_KEY, null);

  if (storedProducts && Array.isArray(storedProducts)) {
    // If localStorage has data, check if it's "older" (fewer items than current seed)
    // This is a heuristic for when the app's default seed data has been updated.
    if (storedProducts.length < DEFAULT_PRODUCTS_SEED.length) {
      productsData = DEFAULT_PRODUCTS_SEED.map(p => mapProductForConsistency(p)); // Use deep copy of full seed
      saveToLocalStorage(PRODUCTS_STORAGE_KEY, productsData); // "Upgrade" localStorage
    } else {
      // Use the data from localStorage, ensuring consistency
      productsData = storedProducts.map(p => mapProductForConsistency(p));
    }
  } else {
    // localStorage is empty or data was invalid (loadFromLocalStorage returned null and cleared it)
    // Initialize with the default seed
    productsData = DEFAULT_PRODUCTS_SEED.map(p => mapProductForConsistency(p)); // Use deep copy
    saveToLocalStorage(PRODUCTS_STORAGE_KEY, productsData);
  }
}
initializeProductsData();


// --- CRUD Functions for Products ---
export const getAllProducts = (): Product[] => {
  // Return deep copies to prevent direct mutation of the in-memory store from outside
  return productsData.map(p => ({ 
    ...p, 
    reviews: p.reviews?.map(r => ({...r})) || [], 
    specifications: p.specifications?.map(s => ({...s})) || [], 
    images: p.images ? [...p.images] : [] 
  }));
};

export const getProductById = (id: string): Product | undefined => {
  const product = productsData.find(p => p.id === id);
  // Return a deep copy if found
  return product ? ({ 
    ...product, 
    reviews: product.reviews?.map(r => ({...r})) || [], 
    specifications: product.specifications?.map(s => ({...s})) || [], 
    images: product.images ? [...product.images] : [] 
  }) : undefined;
};

export type ProductCreateInput = Omit<Product, 'id'>;

export const addProduct = (productInput: ProductCreateInput): Product => {
  const existingIds = productsData.map(p => parseInt(p.id, 10)).filter(id => !isNaN(id));
  const newIdNumber = existingIds.length > 0 ? Math.max(0, ...existingIds) + 1 : 1;
  const newId = newIdNumber.toString();

  const newProductRaw: Product = {
    ...productInput,
    id: newId,
    rating: productInput.rating ?? 0,
    specifications: productInput.specifications ?? [],
    reviews: productInput.reviews ?? [],
    images: productInput.images && productInput.images.length > 0 ? productInput.images : (productInput.imageUrl ? [productInput.imageUrl] : ['https://placehold.co/600x400.png']),
    imageUrl: (productInput.images && productInput.images.length > 0) ? productInput.images[0] : (productInput.imageUrl || 'https://placehold.co/600x400.png'),
  };
  const newProduct = mapProductForConsistency(newProductRaw); // Ensure consistency
  productsData.push(newProduct);
  saveToLocalStorage(PRODUCTS_STORAGE_KEY, productsData);
  // Return a deep copy
  return { ...newProduct, reviews: newProduct.reviews?.map(r => ({...r})), specifications: newProduct.specifications?.map(s => ({...s})), images: newProduct.images ? [...newProduct.images] : [] };
};

export const updateProduct = (id: string, updates: Partial<Omit<Product, 'id'>>): Product | undefined => {
  const productIndex = productsData.findIndex(p => p.id === id);
  if (productIndex === -1) {
    return undefined;
  }

  const existingProduct = productsData[productIndex];
  let updatedProductData: Product = { ...existingProduct, ...updates };

  // Ensure images and imageUrl are consistent after updates
  if (updates.images && Array.isArray(updates.images)) {
    if (updates.images.length > 0) {
      updatedProductData.imageUrl = updates.images[0];
      updatedProductData.images = updates.images.map(img => String(img));
    } else { 
      const defaultImg = 'https://placehold.co/600x400.png';
      updatedProductData.imageUrl = defaultImg;
      updatedProductData.images = [defaultImg];
    }
  } else if (updates.imageUrl && (!updates.images || (Array.isArray(updates.images) && updates.images.length === 0))) {
    updatedProductData.images = [updates.imageUrl];
  }


  productsData[productIndex] = mapProductForConsistency(updatedProductData); 
  saveToLocalStorage(PRODUCTS_STORAGE_KEY, productsData);
  const savedProduct = productsData[productIndex];
  // Return a deep copy
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

  const product = productsData[productIndex]; // This is a reference to the object in productsData
  const newReview: Review = {
    id: `review${product.reviews ? product.reviews.length + 1 : 1}_${productId}_${Date.now()}`,
    author: reviewInput.author,
    rating: reviewInput.rating,
    comment: reviewInput.comment,
    date: new Date().toISOString().split('T')[0],
  };

  product.reviews = [...(product.reviews || []), newReview]; // Ensure reviews array exists and add new review immutably

  const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
  product.rating = product.reviews.length > 0 ? parseFloat((totalRating / product.reviews.length).toFixed(1)) : 0;

  // productsData[productIndex] is already updated as product is a reference.
  saveToLocalStorage(PRODUCTS_STORAGE_KEY, productsData);
  const savedProduct = productsData[productIndex];
  // Return a deep copy
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
  const loadedSettings = loadFromLocalStorage<SiteSettings | null>(SETTINGS_STORAGE_KEY, null);
  
  if (loadedSettings) {
    // Merge loaded settings with defaults to ensure all keys are present
    siteSettingsData = { ...DEFAULT_SITE_SETTINGS, ...loadedSettings };
  } else {
    siteSettingsData = { ...DEFAULT_SITE_SETTINGS }; // Use a copy of defaults
  }
  // Save back to ensure localStorage has the full, potentially merged, structure
  saveToLocalStorage(SETTINGS_STORAGE_KEY, siteSettingsData);
}
initializeSiteSettings();


export const getSiteSettings = (): SiteSettings => {
  return { ...siteSettingsData }; // Return a copy
};

export const updateSiteSettings = (newSettings: Partial<SiteSettings>): SiteSettings => {
  siteSettingsData = { ...siteSettingsData, ...newSettings };
  saveToLocalStorage(SETTINGS_STORAGE_KEY, siteSettingsData);
  return { ...siteSettingsData }; // Return a copy
};

// --- User Management ---
const DEFAULT_USERS_DATA: User[] = [
    { id: 'user1', email: 'test@example.com', password: 'password123', name: 'Test User' },
    { id: 'adminuser', email: 'admin@shopsphere.com', password: 'adminpass', name: 'Shop Admin' }
].map(u => ({...u})); // Make copies

let usersData: User[];
let newIdNumber = 1; // Used in createUser if name is not provided

function initializeUsersData() {
  const loadedUsers = loadFromLocalStorage<User[] | null>(USERS_STORAGE_KEY, null);

  if (loadedUsers && Array.isArray(loadedUsers)) {
    usersData = loadedUsers.map(u => ({...u})); // Work with copies
    // Ensure default users are present
    let needsSave = false;
    DEFAULT_USERS_DATA.forEach(defaultUser => {
      if (!usersData.find(u => u.email === defaultUser.email)) {
        usersData.push({...defaultUser}); // Add a copy
        needsSave = true;
      }
    });
    if (needsSave) {
      saveToLocalStorage(USERS_STORAGE_KEY, usersData);
    }
  } else {
    usersData = DEFAULT_USERS_DATA.map(u => ({...u})); // Use copies of defaults
    saveToLocalStorage(USERS_STORAGE_KEY, usersData);
  }
}
initializeUsersData();


export const getUserByEmail = (email: string): User | undefined => {
  const user = usersData.find(user => user.email === email);
  return user ? {...user} : undefined; // Return a copy
};

export type UserCreateInput = Omit<User, 'id'>;

export const createUser = (userInput: UserCreateInput): User | { error: string } => {
  if (usersData.find(user => user.email === userInput.email)) {
    return { error: 'Account already exists with this email.' };
  }
  const newGeneratedId = `user${usersData.length + 1}_${Date.now()}`;
  const newUser: User = { ...userInput, id: newGeneratedId, name: userInput.name || `User ${newIdNumber.toString().slice(-4)}` };
  newIdNumber++; // Increment for next potential default name
  usersData.push(newUser);
  saveToLocalStorage(USERS_STORAGE_KEY, usersData);
  return { ...newUser }; // Return a copy
};

export const verifyUserCredentials = (email: string, pass: string): User | null => {
    const user = usersData.find(u => u.email === email);
    if (user && user.password === pass) { 
        return {...user}; // Return a copy
    }
    return null;
};

// --- Order Management ---
const DEFAULT_ORDERS_SEED: Order[] = []; 
let ordersData: Order[];

function initializeOrdersData() {
  ordersData = loadFromLocalStorage<Order[]>(ORDERS_STORAGE_KEY, DEFAULT_ORDERS_SEED.map(o => ({...o}))); // Ensure it's an array
  // If ordersData from localStorage is null (first load or corrupted data that was cleared),
  // loadFromLocalStorage would have returned DEFAULT_ORDERS_SEED (an empty array in this case)
  // and saved it back. So ordersData will always be an array here.
}
initializeOrdersData();


export const getAllOrders = (): Order[] => {
  return ordersData.map(o => ({
    ...o, 
    items: o.items.map(item => ({...item, product: {...item.product}})), // Deep copy items and product within items
    shippingAddress: {...o.shippingAddress} // Copy shippingAddress
  })).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
};

export const getOrdersByCustomerId = (customerId: string): Order[] => {
  return ordersData
    .filter(order => order.customerId === customerId)
    .map(o => ({ // Deep copy matching orders
      ...o,
      items: o.items.map(item => ({...item, product: {...item.product}})),
      shippingAddress: {...o.shippingAddress}
    }))
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
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
    status: 'Pending', 
  };
  ordersData.unshift(newOrder); 
  saveToLocalStorage(ORDERS_STORAGE_KEY, ordersData);
  // Return a deep copy of the new order
  return {
    ...newOrder,
    items: newOrder.items.map(item => ({...item, product: {...item.product}})),
    shippingAddress: {...newOrder.shippingAddress}
  };
};

export const updateOrderStatus = (orderId: string, newStatus: OrderStatus): Order | undefined => {
    const orderIndex = ordersData.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        return undefined;
    }
    ordersData[orderIndex].status = newStatus;
    saveToLocalStorage(ORDERS_STORAGE_KEY, ordersData);
    // Return a deep copy of the updated order
    const updatedOrder = ordersData[orderIndex];
    return {
      ...updatedOrder,
      items: updatedOrder.items.map(item => ({...item, product: {...item.product}})),
      shippingAddress: {...updatedOrder.shippingAddress}
    };
};

// Reset function for debugging/testing - not for production use
export function _resetAllData_USE_WITH_CAUTION() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    localStorage.removeItem(USERS_STORAGE_KEY);
    localStorage.removeItem(ORDERS_STORAGE_KEY);
    console.warn("All ShopSphere localStorage data has been cleared. Please refresh the page to re-initialize with defaults.");
    // Re-initialize with defaults by effectively "re-running" the module's top-level init logic,
    // or rather, by setting the in-memory stores to defaults and letting the next load pick them up
    // if localStorage is truly empty. A page refresh is the most reliable way after clearing LS.
    initializeProductsData();
    initializeSiteSettings();
    initializeUsersData();
    initializeOrdersData();
  } else {
    console.warn("_resetAllData_USE_WITH_CAUTION can only be called on the client.");
  }
}

    