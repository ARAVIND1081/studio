
import type { Product, Category, Review, ProductSpecification, SiteSettings, User, Order, OrderStatus, OrderItem, ShippingAddress } from '@/types';
import { ORDER_STATUSES } from '@/types';

// Keep CATEGORIES exported as it's static data
export const CATEGORIES: Category[] = ["Electronics", "Apparel", "Home Goods", "Books", "Beauty"];

// localStorage keys
const PRODUCTS_STORAGE_KEY = 'shopSphereProducts';
const SETTINGS_STORAGE_KEY = 'shopSphereSettings';
const USERS_STORAGE_KEY = 'shopSphereUsers';
const ORDERS_STORAGE_KEY = 'shopSphereOrders';

const TAX_RATE = 0.18; // 18% Tax Rate

// --- Helper function to load from localStorage ---
function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      if (storedValue === 'null' && defaultValue === null) {
        return null as T;
      }
      const parsedValue = JSON.parse(storedValue) as T;
      
      if (defaultValue !== null && !Array.isArray(defaultValue) && typeof defaultValue === 'object') {
        if (typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
          console.warn(`Type mismatch for ${key} in localStorage. Expected object, got ${Array.isArray(parsedValue) ? 'array' : typeof parsedValue}. Resetting to default.`);
          throw new Error('Type mismatch: Expected object');
        }
      } else if (defaultValue !== null && Array.isArray(defaultValue)) {
         if (!Array.isArray(parsedValue)) {
            console.warn(`Type mismatch for ${key} in localStorage. Expected array, got ${typeof parsedValue}. Resetting to default.`);
            throw new Error('Type mismatch: Expected array');
         }
      }
      return parsedValue;
    }
  } catch (error) {
    console.error(`Error loading or parsing ${key} from localStorage:`, error);
    localStorage.removeItem(key); // Clear corrupted data
  }
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

function mapProductForConsistency(p: any): Product {
  const defaultImg = 'https://placehold.co/600x400.png';
  let validImagesFromArray: string[] = [];

  if (p.images && Array.isArray(p.images)) {
    validImagesFromArray = p.images
      .map(img => String(img))
      .filter(imgStr => imgStr && (imgStr.startsWith('data:image') || imgStr.startsWith('http')));
  }

  let validPImageUrl: string | null = null;
  if (p.imageUrl) {
    const pImageUrlStr = String(p.imageUrl);
    if (pImageUrlStr.startsWith('data:image') || pImageUrlStr.startsWith('http')) {
      validPImageUrl = pImageUrlStr;
    }
  }

  let finalImages: string[];
  if (validImagesFromArray.length > 0) {
    finalImages = validImagesFromArray;
  } else if (validPImageUrl) {
    finalImages = [validPImageUrl];
  } else {
    finalImages = [defaultImg];
  }
  
  // Ensure imageUrl is always set from finalImages or defaults if finalImages is somehow empty
  const finalImageUrl = finalImages.length > 0 ? finalImages[0] : defaultImg;

  return {
    id: String(p.id || `fallback-${Date.now()}-${Math.random()}`),
    name: p.name || `Unnamed Product`,
    description: p.description || 'No description available.',
    price: typeof p.price === 'number' ? p.price : 0,
    category: p.category || CATEGORIES[0],
    imageUrl: finalImageUrl,
    images: finalImages,
    rating: typeof p.rating === 'number' ? parseFloat(p.rating.toFixed(1)) : parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: Array.isArray(p.specifications) ? p.specifications.map((s: any) => ({ name: String(s.name), value: String(s.value) })) : [],
    reviews: Array.isArray(p.reviews) ? p.reviews.map((r: any) => ({ id: String(r.id), author: String(r.author), comment: String(r.comment), date: String(r.date), rating: Number(r.rating) })) : [],
  };
}


// --- Product Data Initialization ---
const DEFAULT_PRODUCTS_SEED_PRE_TAX: Omit<Product, 'price'> & { price: number }[] = [
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


let _productsData: Product[] | null = null;

function getProductsDataStore(): Product[] {
  if (_productsData === null) {
    _productsData = loadFromLocalStorage<Product[]>(PRODUCTS_STORAGE_KEY, DEFAULT_PRODUCTS_SEED);
    if (_productsData.length < DEFAULT_PRODUCTS_SEED.length && typeof window !== 'undefined') {
      _productsData = [...DEFAULT_PRODUCTS_SEED];
      saveToLocalStorage(PRODUCTS_STORAGE_KEY, _productsData);
    }
  }
  return _productsData;
}


// --- CRUD Functions for Products ---
export const getAllProducts = (): Product[] => {
  const store = getProductsDataStore();
  return store.map(p => ({ 
    ...p, 
    reviews: p.reviews?.map(r => ({...r})) || [], 
    specifications: p.specifications?.map(s => ({...s})) || [], 
    images: p.images ? [...p.images] : [] 
  }));
};

export const getProductById = (id: string): Product | undefined => {
  const store = getProductsDataStore();
  const product = store.find(p => p.id === id);
  return product ? ({ 
    ...product, 
    reviews: product.reviews?.map(r => ({...r})) || [], 
    specifications: product.specifications?.map(s => ({...s})) || [], 
    images: product.images ? [...product.images] : [] 
  }) : undefined;
};

export type ProductCreateInput = Omit<Product, 'id'>;

export const addProduct = (productInput: ProductCreateInput): Product => {
  const store = getProductsDataStore();
  const existingIds = store.map(p => parseInt(p.id, 10)).filter(idNum => !isNaN(idNum));
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
  const newProduct = mapProductForConsistency(newProductRaw);
  store.push(newProduct);
  saveToLocalStorage(PRODUCTS_STORAGE_KEY, store);
  return { ...newProduct, reviews: newProduct.reviews?.map(r => ({...r})), specifications: newProduct.specifications?.map(s => ({...s})), images: newProduct.images ? [...newProduct.images] : [] };
};

export const updateProduct = (id: string, updates: Partial<Omit<Product, 'id'>>): Product | undefined => {
  const store = getProductsDataStore();
  const productIndex = store.findIndex(p => p.id === id);
  if (productIndex === -1) {
    return undefined;
  }

  const existingProduct = store[productIndex];
  let updatedProductData: Product = { ...existingProduct, ...updates };

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

  store[productIndex] = mapProductForConsistency(updatedProductData); 
  saveToLocalStorage(PRODUCTS_STORAGE_KEY, store);
  const savedProduct = store[productIndex];
  return { ...savedProduct, reviews: savedProduct.reviews?.map(r => ({...r})), specifications: savedProduct.specifications?.map(s => ({...s})), images: savedProduct.images ? [...savedProduct.images] : [] };
};

export const deleteProduct = (id: string): boolean => {
  let store = getProductsDataStore(); 
  const initialLength = store.length;
  _productsData = store.filter(p => p.id !== id); 
  const success = _productsData.length < initialLength;
  if (success) {
    saveToLocalStorage(PRODUCTS_STORAGE_KEY, _productsData);
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
  
  saveToLocalStorage(PRODUCTS_STORAGE_KEY, store);
  const savedProduct = store[productIndex];
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
    items: o.items.map(item => ({...item, product: {...item.product}})),
    shippingAddress: {...o.shippingAddress}
  })).sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
};

export const getOrdersByCustomerId = (customerId: string): Order[] => {
  const store = getOrdersDataStore();
  return store
    .filter(order => order.customerId === customerId)
    .map(o => ({
      ...o,
      items: o.items.map(item => ({...item, product: {...item.product}})),
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
  };
  store.unshift(newOrder); 
  saveToLocalStorage(ORDERS_STORAGE_KEY, store);
  return {
    ...newOrder,
    items: newOrder.items.map(item => ({...item, product: {...item.product}})),
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
  saveToLocalStorage(ORDERS_STORAGE_KEY, store);
  const updatedOrder = store[orderIndex];
  return {
    ...updatedOrder,
    items: updatedOrder.items.map(item => ({...item, product: {...item.product}})),
    shippingAddress: {...updatedOrder.shippingAddress}
  };
};

export function _resetAllData_USE_WITH_CAUTION() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PRODUCTS_STORAGE_KEY);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    localStorage.removeItem(USERS_STORAGE_KEY);
    localStorage.removeItem(ORDERS_STORAGE_KEY);
    
    _productsData = null;
    _siteSettingsData = null;
    _usersData = null;
    _ordersData = null;
    
    console.warn("All ShopSphere localStorage data has been cleared and in-memory stores reset. Please refresh or navigate to re-initialize with defaults.");
  } else {
    console.warn("_resetAllData_USE_WITH_CAUTION can only be called on the client.");
  }
}

