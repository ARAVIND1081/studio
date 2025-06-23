
import type { Product, Category, Review, ProductSpecification, SiteSettings, User, Order, OrderStatus, OrderItem, ShippingAddress, ScheduledCall, ScheduledCallStatus } from '@/types';
import { ORDER_STATUSES, SCHEDULED_CALL_STATUSES } from '@/types';

// localStorage keys
const PRODUCTS_STORAGE_KEY = 'shopSphereProducts_v3';
const SETTINGS_STORAGE_KEY = 'shopSphereSettings_v3';
const USERS_STORAGE_KEY = 'shopSphereUsers_v3';
const ORDERS_STORAGE_KEY = 'shopSphereOrders_v3';
const SCHEDULED_CALLS_STORAGE_KEY = 'shopSphereScheduledCalls_v3';

const TAX_RATE = 0.18; // 18% Tax Rate

export const CATEGORIES: Category[] = [
  'Electronics',
  'Apparel',
  'Home Goods',
  'Books',
  'Beauty',
];

// --- Helper function to load from localStorage ---
function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  let storedValue: string | null = null;
  try {
    storedValue = localStorage.getItem(key);
    if (storedValue) {
      if (storedValue === 'null' && defaultValue === null) {
        return null as T;
      }
      const parsedValue = JSON.parse(storedValue) as T;
      
      if (defaultValue !== null) {
        if (Array.isArray(defaultValue) && !Array.isArray(parsedValue)) {
          console.warn(`Type mismatch for ${key} in localStorage. Expected array, got ${typeof parsedValue}. Resetting to default.`);
          throw new Error('Type mismatch: Expected array');
        }
        if (!Array.isArray(defaultValue) && typeof defaultValue === 'object' && (typeof parsedValue !== 'object' || Array.isArray(parsedValue))) {
            console.warn(`Type mismatch for ${key} in localStorage. Expected object, got ${Array.isArray(parsedValue) ? 'array' : typeof parsedValue}. Resetting to default.`);
            throw new Error('Type mismatch: Expected object');
        }
      }
      return parsedValue;
    }
  } catch (error) {
    console.error(`Error loading or parsing ${key} from localStorage:`, error);
    if (key === PRODUCTS_STORAGE_KEY && storedValue) {
        console.error("Failed to parse product data. Value from localStorage (first 500 chars):", storedValue.substring(0, 500));
    }
    // If parsing fails or type mismatch occurs, remove the potentially corrupted item and save the default.
    localStorage.removeItem(key);
    saveToLocalStorage(key, defaultValue); 
    return defaultValue; 
  }
  // If storedValue was null (key not found), save the default value and return it.
  saveToLocalStorage(key, defaultValue);
  return defaultValue;
}

// --- Helper function to save to localStorage ---
function saveToLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.code === 22)) {
      console.warn(`LocalStorage quota exceeded for key "${key}". Changes may not be saved. Data size: ${JSON.stringify(value).length} bytes.`);
      alert(`Warning: Could not save all data. Storage limit might be exceeded. Some changes, especially for large images, may not persist.`);
    }
  }
}

// Function to apply tax to a price and round to 2 decimal places
const applyTax = (price: number): number => {
  return parseFloat((price * (1 + TAX_RATE)).toFixed(2));
};

const sampleReviews: Review[] = [
  { id: 'review1', author: 'Jane Doe', rating: 5, comment: 'Absolutely fantastic product!', date: '2023-10-01' },
  { id: 'review2', author: 'John Smith', rating: 4, comment: 'Very good, but a bit pricey.', date: '2023-10-05' },
];

const sampleSpecifications: ProductSpecification[] = [
  { name: 'Material', value: 'Premium Cotton' },
  { name: 'Origin', value: 'Made in Italy' },
];

const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmedUrl = url.trim();
  return trimmedUrl.startsWith('data:image') || trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://');
};

function mapProductForConsistency(p: any): Product {
  const defaultImg = 'https://placehold.co/600x400.png';
  let imagesToUse: string[] = [];

  if (p.images && Array.isArray(p.images) && p.images.length > 0) {
    const validPImages = p.images.filter(isValidImageUrl);
    if (validPImages.length > 0) {
      imagesToUse = validPImages;
    }
  }

  if (imagesToUse.length === 0 && isValidImageUrl(p.imageUrl)) {
    imagesToUse = [p.imageUrl.trim()];
  }
  
  if (imagesToUse.length === 0) {
    imagesToUse = [defaultImg];
  }

  const finalImageUrl = imagesToUse[0];
  const finalImages = imagesToUse;
  
  const productName = p.name || `Unnamed Product (ID: ${p.id || 'N/A'})`;

  return {
    id: String(p.id || `fallback-${Date.now()}-${Math.random()}`),
    name: productName,
    description: p.description || 'No description available.',
    price: typeof p.price === 'number' ? p.price : 0,
    category: p.category && CATEGORIES.includes(p.category) ? p.category : CATEGORIES[0],
    imageUrl: finalImageUrl,
    images: finalImages,
    rating: typeof p.rating === 'number' ? parseFloat(p.rating.toFixed(1)) : parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: Array.isArray(p.specifications) ? p.specifications.map((s: any) => ({ name: String(s.name || 'N/A'), value: String(s.value || 'N/A') })) : [],
    reviews: Array.isArray(p.reviews) ? p.reviews.map((r: any) => ({ id: String(r.id || `rev-${Date.now()}`), author: String(r.author || 'Anonymous'), comment: String(r.comment || ''), date: String(r.date || new Date().toISOString().split('T')[0]), rating: Number(r.rating || 0) })) : [],
  };
}


// --- Product Data Initialization ---
const DEFAULT_PRODUCTS_SEED_PRE_TAX: Omit<Product, 'id' | 'price' | 'rating' | 'specifications' | 'reviews' | 'images'> & { price: number, rating?: number, specifications?: ProductSpecification[], reviews?: Review[], images?: string[] }[] = [
  {
    id: '1', name: 'Elegant Smartwatch X1', description: 'A fusion of classic design and modern technology. Stay connected in style.', price: 29999.00, category: 'Electronics', imageUrl: 'https://placehold.co/800x600.png', images: ['https://placehold.co/800x600.png', 'https://placehold.co/800x600.png?1', 'https://placehold.co/800x600.png?2'], rating: 4.8, specifications: [ { name: 'Display', value: '1.4" AMOLED' }, { name: 'Battery Life', value: '7 days' }, { name: 'Water Resistance', value: '5 ATM' }, ], reviews: sampleReviews.map(r => ({...r})),
  }, {
    id: '2', name: 'Luxury Silk Scarf', description: 'Handcrafted 100% silk scarf with an intricate design. The perfect accessory.', price: 8999.00, category: 'Apparel', imageUrl: 'https://placehold.co/800x600.png', images: ['https://placehold.co/800x600.png', 'https://placehold.co/800x600.png?3'], rating: 4.9, specifications: sampleSpecifications.map(s => ({...s})), reviews: [sampleReviews[0]].map(r => ({...r})),
  }, {
    id: '3', name: 'Artisan Coffee Maker', description: 'Brew the perfect cup every morning with this stylish and efficient coffee maker.', price: 6700.00, category: 'Home Goods', imageUrl: 'https://placehold.co/800x600.png', images: ['https://placehold.co/800x600.png'], rating: 4.5, specifications: [ { name: 'Capacity', value: '1.2 Liters' }, { name: 'Material', value: 'Stainless Steel & Glass' }, ], reviews: [sampleReviews[1]].map(r => ({...r})),
  }, {
    id: '4', name: '"The Art of Elegance" - Hardcover', description: 'A beautifully illustrated book on the principles of timeless design and style.', price: 3375.00, category: 'Books', imageUrl: 'https://placehold.co/600x400.png', images: ['https://placehold.co/600x400.png'], rating: 4.7, specifications: [ { name: 'Pages', value: '320' }, { name: 'Publisher', value: 'Prestige Press' }, ], reviews: [],
  }, {
    id: '5', name: 'Opulent Oud Perfume', description: 'An exotic and captivating fragrance with notes of rare oud, amber, and spice.', price: 14925.00, category: 'Beauty', imageUrl: 'https://placehold.co/600x400.png', images: ['https://placehold.co/600x400.png'], rating: 5.0, specifications: [{ name: 'Volume', value: '100ml' }], reviews: sampleReviews.map(r => ({...r})),
  }, {
    id: '6', name: 'Cashmere Blend Sweater', description: 'Luxuriously soft and warm, this sweater is a timeless wardrobe staple.', price: 18750.00, category: 'Apparel', imageUrl: 'https://placehold.co/600x400.png', images: ['https://placehold.co/600x400.png'], rating: 4.6, reviews: [], specifications: [],
  }, {
    id: '7', name: 'Wireless Noise-Cancelling Headphones', description: 'Immerse yourself in pure sound with these premium headphones.', price: 26175.00, category: 'Electronics', imageUrl: 'https://placehold.co/600x400.png', images: ['https://placehold.co/600x400.png'], rating: 4.9, reviews: [], specifications: [],
  }, {
    id: '8', name: 'Velvet Throw Pillow Set', description: 'Add a touch of luxury to your living space with these plush velvet pillows.', price: 5625.00, category: 'Home Goods', imageUrl: 'https://placehold.co/600x400.png', images: ['https://placehold.co/600x400.png'], rating: 4.3, reviews: [], specifications: [],
  },
  ...Array.from({ length: 50 }).map((_, index) => {
    const categoryIndex = index % CATEGORIES.length;
    const category = CATEGORIES[categoryIndex];
    const productNumber = Math.floor(index / CATEGORIES.length) + 1;
    const subIndex = index % CATEGORIES.length + 1;
    let basePrice;
    switch (category) {
        case 'Electronics': basePrice = parseFloat((Math.random() * (45000 - 5000) + 5000).toFixed(2)); break;
        case 'Apparel': basePrice = parseFloat((Math.random() * (15000 - 1000) + 1000).toFixed(2)); break;
        case 'Home Goods': basePrice = parseFloat((Math.random() * (20000 - 1500) + 1500).toFixed(2)); break;
        case 'Books': basePrice = parseFloat((Math.random() * (5000 - 500) + 500).toFixed(2)); break;
        case 'Beauty': basePrice = parseFloat((Math.random() * (10000 - 800) + 800).toFixed(2)); break;
        default: basePrice = parseFloat((Math.random() * (10000 - 500) + 500).toFixed(2));
    }
    const defaultImg = 'https://placehold.co/600x400.png';
    return {
        id: `${9 + index}`,
        name: `New ${category} Item ${productNumber}-${subIndex}`,
        description: `This is a high-quality new ${category.toLowerCase()} item ${productNumber}-${subIndex}. Explore its features and enjoy its benefits. A great addition to the ${category} collection. Stock keeping unit: SKU${1000 + index}. Batch number BATCH-${2023 + index}.`,
        price: basePrice, // Price here is pre-tax
        category: category,
        imageUrl: defaultImg,
        images: [defaultImg, `https://placehold.co/600x400.png?extra=${index}`],
        rating: parseFloat((Math.random() * (5 - 3.5) + 3.5).toFixed(1)),
        specifications: [{name: "Origin", value: (index % 2 === 0) ? "Local" : "Imported"}, {name: "Warranty", value: "1 Year"}],
        reviews: [],
    };
  })
];

const DEFAULT_PRODUCTS_SEED: Product[] = DEFAULT_PRODUCTS_SEED_PRE_TAX.map(p => 
  mapProductForConsistency({ ...p, price: applyTax(p.price) })
);

// This function loads from localStorage or falls back to the default seed.
// By removing the in-memory cache, we ensure it's always the live data.
function getProductsDataStore(): Product[] {
  return loadFromLocalStorage<Product[]>(
    PRODUCTS_STORAGE_KEY, 
    DEFAULT_PRODUCTS_SEED.map(p => mapProductForConsistency(p))
  );
}


// --- CRUD Functions for Products ---
export const getAllProducts = (): Product[] => {
  const store = getProductsDataStore();
  return store.map(p => mapProductForConsistency(p));
};

export const getProductById = (id: string): Product | undefined => {
  const store = getProductsDataStore();
  const product = store.find(p => p.id === id);
  return product ? mapProductForConsistency(product) : undefined;
};

export type ProductCreateInput = Omit<Product, 'id'>;

export const addProduct = (productInput: ProductCreateInput): Product => {
  const store = getProductsDataStore();
  const existingIds = store.map(p => parseInt(p.id, 10)).filter(idNum => !isNaN(idNum));
  const newIdNumber = existingIds.length > 0 ? Math.max(0, ...existingIds) + 1 : 1;
  const newId = newIdNumber.toString();

  const newProductRaw: Omit<Product, 'id'> & { id: string } = {
    ...productInput,
    id: newId,
    rating: productInput.rating ?? parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)), // Ensure rating exists
    specifications: productInput.specifications ?? [],
    reviews: productInput.reviews ?? [],
    images: productInput.images && productInput.images.length > 0 ? productInput.images : (productInput.imageUrl ? [productInput.imageUrl] : ['https://placehold.co/600x400.png']),
    imageUrl: (productInput.images && productInput.images.length > 0) ? productInput.images[0] : (productInput.imageUrl || 'https://placehold.co/600x400.png'),
  };
  const newProduct = mapProductForConsistency(newProductRaw);
  store.push(newProduct);
  saveToLocalStorage(PRODUCTS_STORAGE_KEY, store.map(p => mapProductForConsistency(p)));
  return mapProductForConsistency(newProduct); 
};

export const updateProduct = (id: string, updates: Partial<Omit<Product, 'id'>>): Product | undefined => {
  const store = getProductsDataStore();
  const productIndex = store.findIndex(p => p.id === id);
  if (productIndex === -1) {
    return undefined;
  }

  const existingProduct = store[productIndex];
  
  const productDataWithUpdates = {
    ...existingProduct,
    ...updates,
  };

  store[productIndex] = mapProductForConsistency(productDataWithUpdates);
  saveToLocalStorage(PRODUCTS_STORAGE_KEY, store.map(p => mapProductForConsistency(p)));
  return mapProductForConsistency(store[productIndex]);
};

export const deleteProduct = (id: string): boolean => {
  let store = getProductsDataStore(); 
  const initialLength = store.length;
  const updatedStore = store.filter(p => p.id !== id); 
  const success = updatedStore.length < initialLength;
  if (success) {
    saveToLocalStorage(PRODUCTS_STORAGE_KEY, updatedStore.map(p => mapProductForConsistency(p)));
  }
  return success;
};

export interface ReviewCreateInput {
  author: string;
  rating: number;
  comment: string;
}

export const addProductReview = (productId: string, reviewInput: ReviewCreateInput): Product | undefined => {
  const store = getProductsDataStore();
  const productIndex = store.findIndex(p => p.id === productId);
  if (productIndex === -1) {
    return undefined;
  }

  const product = store[productIndex];
  const newReview: Review = {
    id: `review${product.reviews ? product.reviews.length + 1 : 1}_${productId}_${Date.now()}`,
    author: reviewInput.author,
    rating: reviewInput.rating,
    comment: reviewInput.comment,
    date: new Date().toISOString().split('T')[0],
  };

  product.reviews = [...(product.reviews || []), newReview];
  const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
  product.rating = product.reviews.length > 0 ? parseFloat((totalRating / product.reviews.length).toFixed(1)) : 0;
  
  store[productIndex] = mapProductForConsistency(product); 
  saveToLocalStorage(PRODUCTS_STORAGE_KEY, store.map(p => mapProductForConsistency(p)));
  return mapProductForConsistency(store[productIndex]); 
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

let _siteSettingsData: SiteSettings | null = null;

function getSiteSettingsStore(): SiteSettings {
  if (_siteSettingsData === null) {
    _siteSettingsData = loadFromLocalStorage<SiteSettings>(SETTINGS_STORAGE_KEY, { ...DEFAULT_SITE_SETTINGS });
  }
  return _siteSettingsData;
}

export const getSiteSettings = (): SiteSettings => {
  const store = getSiteSettingsStore();
  return { ...store };
};

export const updateSiteSettings = (newSettings: Partial<SiteSettings>): SiteSettings => {
  let store = getSiteSettingsStore(); 
  _siteSettingsData = { ...store, ...newSettings }; 
  saveToLocalStorage(SETTINGS_STORAGE_KEY, _siteSettingsData);
  // No need to nullify _siteSettingsData here as SiteSettingsProvider handles its own state refresh based on context.
  return { ..._siteSettingsData };
};

// --- User Management ---
const DEFAULT_USERS_DATA: User[] = [
    { id: 'user1', email: 'test@example.com', password: 'password123', name: 'Test User' },
    { id: 'adminuser', email: 'admin@shopsphere.com', password: 'adminpass', name: 'Shop Admin' }
].map(u => ({...u}));

let _usersData: User[] | null = null;
let _newUserIdCounter = DEFAULT_USERS_DATA.length + 1; 

function getUsersDataStore(): User[] {
  if (_usersData === null) {
    _usersData = loadFromLocalStorage<User[]>(USERS_STORAGE_KEY, [...DEFAULT_USERS_DATA]);
    let needsSave = false;
      DEFAULT_USERS_DATA.forEach(defaultUser => {
        if (!_usersData!.find(u => u.email === defaultUser.email)) {
          _usersData!.push({...defaultUser});
          needsSave = true;
        }
      });
      if (needsSave && typeof window !== 'undefined') {
        saveToLocalStorage(USERS_STORAGE_KEY, _usersData);
      }
    _newUserIdCounter = (_usersData.length > 0 ? Math.max(..._usersData.map(u => parseInt(u.id.replace('user','').split('_')[0]) || 0)) : 0) + 1;
  }
  return _usersData;
}

export const getUserByEmail = (email: string): User | undefined => {
  const store = getUsersDataStore();
  const user = store.find(user => user.email === email);
  return user ? {...user} : undefined;
};

export type UserCreateInput = Omit<User, 'id'>;

export const createUser = (userInput: UserCreateInput): User | { error: string } => {
  const store = getUsersDataStore();
  if (store.find(user => user.email === userInput.email)) {
    return { error: 'Account already exists with this email.' };
  }
  const numericIds = store.map(u => parseInt(u.id.replace('user','').split('_')[0])).filter(id => !isNaN(id));
  const nextIdNum = numericIds.length > 0 ? Math.max(0, ...numericIds) + 1 : 1;
  _newUserIdCounter = Math.max(_newUserIdCounter, nextIdNum);

  const newGeneratedId = `user${_newUserIdCounter}_${Date.now()}`;
  const newUser: User = { ...userInput, id: newGeneratedId, name: userInput.name || `User ${_newUserIdCounter}` };
  _newUserIdCounter++; 
  store.push(newUser);
  saveToLocalStorage(USERS_STORAGE_KEY, store);
  _usersData = null; // Force reload
  return { ...newUser };
};

export const verifyUserCredentials = (email: string, pass: string): User | null => {
  const store = getUsersDataStore();
  const user = store.find(u => u.email === email);
  if (user && user.password === pass) { 
      return {...user};
  }
  return null;
};

// --- Order Management ---
const DEFAULT_ORDERS_SEED: Order[] = []; 
let _ordersData: Order[] | null = null;

function getOrdersDataStore(): Order[] {
  if (_ordersData === null) {
    _ordersData = loadFromLocalStorage<Order[]>(ORDERS_STORAGE_KEY, [...DEFAULT_ORDERS_SEED]);
  }
  return _ordersData;
}

export const getAllOrders = (): Order[] => {
  const store = getOrdersDataStore();
  return store.map(o => ({
    ...o, 
    items: o.items.map(item => ({...item, product: mapProductForConsistency(item.product)})), 
    shippingAddress: {...o.shippingAddress}
  })).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
};

export const getOrdersByCustomerId = (customerId: string): Order[] => {
  const store = getOrdersDataStore();
  return store
    .filter(order => order.customerId === customerId)
    .map(o => ({
      ...o,
      items: o.items.map(item => ({...item, product: mapProductForConsistency(item.product)})),
      shippingAddress: {...o.shippingAddress}
    }))
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
};

export type OrderCreateInput = Omit<Order, 'id' | 'orderNumber' | 'orderDate' | 'status'>;

export const addOrder = (orderInput: OrderCreateInput): Order => {
  const store = getOrdersDataStore();
  const newId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newOrderNumber = `SHP-${Date.now().toString().slice(-6)}`;
  
  const newOrder: Order = {
    ...orderInput,
    id: newId,
    orderNumber: newOrderNumber,
    orderDate: new Date().toISOString(),
    status: 'Pending',
    taxes: 0, 
    totalAmount: orderInput.subtotal + orderInput.shippingCost, 
    items: orderInput.items.map(item => ({...item, product: mapProductForConsistency(item.product)})), 
  };
  store.unshift(newOrder); 
  saveToLocalStorage(ORDERS_STORAGE_KEY, store.map(o => ({...o, items: o.items.map(item => ({...item, product: mapProductForConsistency(item.product)}))})));
  _ordersData = null; // Force reload
  return {
    ...newOrder,
    items: newOrder.items.map(item => ({...item, product: mapProductForConsistency(item.product)})),
    shippingAddress: {...newOrder.shippingAddress}
  };
};

export const updateOrderStatus = (orderId: string, newStatus: OrderStatus): Order | undefined => {
  const store = getOrdersDataStore();
  const orderIndex = store.findIndex(o => o.id === orderId);
  if (orderIndex === -1) {
      return undefined;
  }
  store[orderIndex].status = newStatus;
  saveToLocalStorage(ORDERS_STORAGE_KEY, store.map(o => ({...o, items: o.items.map(item => ({...item, product: mapProductForConsistency(item.product)}))})));
  _ordersData = null; // Force reload
  const updatedOrder = store[orderIndex];
  return {
    ...updatedOrder,
    items: updatedOrder.items.map(item => ({...item, product: mapProductForConsistency(item.product)})),
    shippingAddress: {...updatedOrder.shippingAddress}
  };
};

// --- Scheduled Video Call Management ---
const DEFAULT_SCHEDULED_CALLS_SEED: ScheduledCall[] = [];
let _scheduledCallsData: ScheduledCall[] | null = null;

function getScheduledCallsDataStore(): ScheduledCall[] {
  if (_scheduledCallsData === null) {
    _scheduledCallsData = loadFromLocalStorage<ScheduledCall[]>(SCHEDULED_CALLS_STORAGE_KEY, [...DEFAULT_SCHEDULED_CALLS_SEED]);
  }
  return _scheduledCallsData;
}

export const getAllScheduledCalls = (): ScheduledCall[] => {
  const store = getScheduledCallsDataStore();
  // Sort by creation date, newest first
  return [...store].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getScheduledCallsByUserId = (userId: string): ScheduledCall[] => {
  const store = getScheduledCallsDataStore();
  return store
    .filter(call => call.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export type ScheduledCallCreateInput = Omit<ScheduledCall, 'id' | 'status' | 'createdAt'>;

export const addScheduledCall = (callInput: ScheduledCallCreateInput): ScheduledCall => {
  const store = getScheduledCallsDataStore();
  const newId = `call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newCall: ScheduledCall = {
    ...callInput,
    id: newId,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  store.unshift(newCall); // Add to the beginning of the array
  saveToLocalStorage(SCHEDULED_CALLS_STORAGE_KEY, store);
  _scheduledCallsData = null; // Force reload
  return { ...newCall };
};

export const updateScheduledCallStatus = (callId: string, newStatus: ScheduledCallStatus): ScheduledCall | undefined => {
  const store = getScheduledCallsDataStore();
  const callIndex = store.findIndex(c => c.id === callId);
  if (callIndex === -1) {
    return undefined;
  }
  store[callIndex].status = newStatus;
  saveToLocalStorage(SCHEDULED_CALLS_STORAGE_KEY, store);
  _scheduledCallsData = null; // Force reload
  return { ...store[callIndex] };
};


export function _resetAllData_USE_WITH_CAUTION() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    localStorage.removeItem(USERS_STORAGE_KEY);
    localStorage.removeItem(ORDERS_STORAGE_KEY);
    localStorage.removeItem(SCHEDULED_CALLS_STORAGE_KEY);
    
    // _productsData = null; // This variable is removed
    _siteSettingsData = null;
    _usersData = null;
    _ordersData = null;
    _scheduledCallsData = null;
    
    console.warn("All ShopSphere localStorage data has been cleared and in-memory stores reset. Please refresh or navigate to re-initialize with defaults.");
  } else {
    console.warn("_resetAllData_USE_WITH_CAUTION can only be called on the client.");
  }
}
