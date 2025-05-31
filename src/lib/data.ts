
import type { Product, Category, Review, ProductSpecification, SiteSettings, User } from '@/types';

// Keep CATEGORIES exported as it's static data
export const CATEGORIES: Category[] = ["Electronics", "Apparel", "Home Goods", "Books", "Beauty"];

// localStorage keys
const PRODUCTS_STORAGE_KEY = 'shopSphereProducts';
const SETTINGS_STORAGE_KEY = 'shopSphereSettings';
const USERS_STORAGE_KEY = 'shopSphereUsers';

// --- Helper function to load from localStorage ---
function loadFromLocalStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      return JSON.parse(storedValue);
    }
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    localStorage.removeItem(key); // Clear corrupted data
  }
  return null;
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
  // Start of 50 new products
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
    return {
        id: `${9 + index}`, // Start IDs from 9
        name: `New ${category} Product ${productNumber}-${subIndex}`,
        description: `This is a high-quality new ${category.toLowerCase()} product ${productNumber}-${subIndex}. Explore its features and enjoy its benefits. A great addition to the ${category} collection.`,
        price: price,
        category: category,
        imageUrl: 'https://placehold.co/600x400.png',
        images: ['https://placehold.co/600x400.png'],
        rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
        specifications: [],
        reviews: [],
    };
  })
  // End of 50 new products
].map(product => { // Ensure consistency for all default seed products
  const defaultImg = 'https://placehold.co/600x400.png';
  const images = product.images && product.images.length > 0 
                 ? product.images 
                 : (product.imageUrl ? [product.imageUrl] : [defaultImg]);
  return {
    ...product,
    images: images,
    imageUrl: images[0],
    rating: product.rating ?? parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: product.specifications ?? [],
    reviews: product.reviews ?? [],
  };
});

let productsData: Product[];

if (typeof window !== 'undefined') {
  const storedProductsRaw = loadFromLocalStorage<string>(PRODUCTS_STORAGE_KEY);
  if (storedProductsRaw) {
    try {
      const storedProductsParsed: Product[] = JSON.parse(storedProductsRaw).map((p: any) => ({ // Map to ensure consistency
        ...p,
        id: String(p.id), // Ensure ID is string
        images: (p.images && Array.isArray(p.images) && p.images.length > 0) ? p.images : (p.imageUrl ? [p.imageUrl] : ['https://placehold.co/600x400.png']),
        imageUrl: ((p.images && Array.isArray(p.images) && p.images.length > 0) ? p.images[0] : p.imageUrl) || 'https://placehold.co/600x400.png',
        rating: p.rating ?? parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
        specifications: p.specifications ?? [],
        reviews: p.reviews ?? [],
      }));

      if (storedProductsParsed.length < DEFAULT_PRODUCTS_SEED.length) {
        // console.log("localStorage product list is shorter than current default. Upgrading localStorage.");
        productsData = [...DEFAULT_PRODUCTS_SEED];
        saveToLocalStorage(PRODUCTS_STORAGE_KEY, productsData);
      } else {
        productsData = storedProductsParsed;
      }
    } catch (error) {
      console.error('Error parsing products from localStorage. Initializing with default seed data.', error);
      productsData = [...DEFAULT_PRODUCTS_SEED];
      saveToLocalStorage(PRODUCTS_STORAGE_KEY, productsData);
    }
  } else {
    // console.log("No products in localStorage. Initializing with default seed data.");
    productsData = [...DEFAULT_PRODUCTS_SEED];
    saveToLocalStorage(PRODUCTS_STORAGE_KEY, productsData);
  }
} else {
  productsData = [...DEFAULT_PRODUCTS_SEED];
}


// --- CRUD Functions for Products ---

// READ
export const getAllProducts = (): Product[] => {
  return productsData.map(p => ({ ...p })); // Return a copy
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
  const images = productInput.images && productInput.images.length > 0
                 ? productInput.images
                 : (productInput.imageUrl ? [productInput.imageUrl] : [defaultImageUrl]);

  const newProduct: Product = {
    ...productInput,
    id: newId,
    imageUrl: images[0],
    images: images,
    rating: productInput.rating ?? 0,
    specifications: productInput.specifications ?? [],
    reviews: productInput.reviews ?? [],
  };
  productsData.push(newProduct); // Modify in-memory store
  saveToLocalStorage(PRODUCTS_STORAGE_KEY, productsData); // Persist
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

  if (updates.images && updates.images.length > 0) {
    updatedProductData.imageUrl = updates.images[0];
  } else if (updates.images && updates.images.length === 0) {
    const defaultImg = 'https://placehold.co/600x400.png';
    updatedProductData.imageUrl = defaultImg;
    updatedProductData.images = [defaultImg];
  } else if (updates.imageUrl && (!updates.images || updates.images.length === 0)) {
    updatedProductData.images = [updates.imageUrl];
  }

  productsData[productIndex] = updatedProductData; // Modify in-memory store
  saveToLocalStorage(PRODUCTS_STORAGE_KEY, productsData); // Persist
  return { ...productsData[productIndex] };
};

// DELETE
export const deleteProduct = (id: string): boolean => {
  const initialLength = productsData.length;
  productsData = productsData.filter(p => p.id !== id); // Modify in-memory store
  const success = productsData.length < initialLength;
  if (success) {
    saveToLocalStorage(PRODUCTS_STORAGE_KEY, productsData); // Persist
  }
  return success;
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
    date: new Date().toISOString().split('T')[0],
  };

  if (!product.reviews) {
    product.reviews = [];
  }
  product.reviews.push(newReview);

  const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
  product.rating = product.reviews.length > 0 ? parseFloat((totalRating / product.reviews.length).toFixed(1)) : 0;

  productsData[productIndex] = product; // Modify in-memory store
  saveToLocalStorage(PRODUCTS_STORAGE_KEY, productsData); // Persist
  return { ...product };
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

if (typeof window !== 'undefined') {
  const storedSettingsRaw = loadFromLocalStorage<string>(SETTINGS_STORAGE_KEY);
  if (storedSettingsRaw) {
    try {
      const parsedStoredSettings = JSON.parse(storedSettingsRaw);
      siteSettingsData = { ...DEFAULT_SITE_SETTINGS, ...parsedStoredSettings };
      // Save back to ensure any new default fields are persisted if they weren't in localStorage
      if (Object.keys(DEFAULT_SITE_SETTINGS).some(key => !(key in parsedStoredSettings))) {
         saveToLocalStorage(SETTINGS_STORAGE_KEY, siteSettingsData);
      }
    } catch (error) {
      console.error('Error parsing site settings from localStorage. Initializing with defaults.', error);
      siteSettingsData = { ...DEFAULT_SITE_SETTINGS };
      saveToLocalStorage(SETTINGS_STORAGE_KEY, siteSettingsData);
    }
  } else {
    siteSettingsData = { ...DEFAULT_SITE_SETTINGS };
    saveToLocalStorage(SETTINGS_STORAGE_KEY, siteSettingsData);
  }
} else {
  siteSettingsData = { ...DEFAULT_SITE_SETTINGS };
}


export const getSiteSettings = (): SiteSettings => {
  return { ...siteSettingsData }; // Return a copy
};

export const updateSiteSettings = (newSettings: Partial<SiteSettings>): SiteSettings => {
  siteSettingsData = { ...siteSettingsData, ...newSettings }; // Modify in-memory
  saveToLocalStorage(SETTINGS_STORAGE_KEY, siteSettingsData); // Persist
  return { ...siteSettingsData };
};

// --- User Management ---
const DEFAULT_USERS_DATA: User[] = [
    { id: 'user1', email: 'test@example.com', password: 'password123', name: 'Test User' },
    { id: 'adminuser', email: 'admin@shopsphere.com', password: 'adminpass', name: 'Shop Admin' }
];

let usersData: User[];

if (typeof window !== 'undefined') {
  const storedUsersRaw = loadFromLocalStorage<string>(USERS_STORAGE_KEY);
  if (storedUsersRaw) {
    try {
      const storedUsersParsed: User[] = JSON.parse(storedUsersRaw);
      // Simple strategy: if localStorage has fewer users than default, it might be stale regarding default users.
      // For users, usually localStorage is king if it exists for user-created accounts.
      // But if default users are updated in code, this ensures they are present.
      const combinedUsers = [...storedUsersParsed];
      DEFAULT_USERS_DATA.forEach(defaultUser => {
        if (!combinedUsers.find(u => u.email === defaultUser.email)) {
          combinedUsers.push(defaultUser);
        }
      });
      usersData = combinedUsers;
      // Save back if we added default users
      if (usersData.length > storedUsersParsed.length) {
        saveToLocalStorage(USERS_STORAGE_KEY, usersData);
      }

    } catch (error) {
      console.error('Error parsing users from localStorage. Initializing with defaults.', error);
      usersData = [...DEFAULT_USERS_DATA];
      saveToLocalStorage(USERS_STORAGE_KEY, usersData);
    }
  } else {
    usersData = [...DEFAULT_USERS_DATA];
    saveToLocalStorage(USERS_STORAGE_KEY, usersData);
  }
} else {
  usersData = [...DEFAULT_USERS_DATA];
}

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
  const newUser: User = { ...userInput, id: newId };
  usersData.push(newUser); // Modify in-memory
  saveToLocalStorage(USERS_STORAGE_KEY, usersData); // Persist
  return { ...newUser };
};

export const verifyUserCredentials = (email: string, pass: string): User | null => {
    const user = usersData.find(u => u.email === email);
    if (user && user.password === pass) {
        return {...user};
    }
    return null;
}
    
