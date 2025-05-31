
import type { Product, Category, Review, ProductSpecification, SiteSettings, User } from '@/types';

// Keep CATEGORIES exported as it's static data
export const CATEGORIES: Category[] = ["Electronics", "Apparel", "Home Goods", "Books", "Beauty"];

// localStorage keys
const PRODUCTS_STORAGE_KEY = 'shopSphereProducts';
const SETTINGS_STORAGE_KEY = 'shopSphereSettings';
const USERS_STORAGE_KEY = 'shopSphereUsers';

// --- Helper function to load from localStorage ---
function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
      return JSON.parse(storedValue);
    }
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    // If parsing fails, remove the corrupted item
    localStorage.removeItem(key);
  }
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


const sampleReviews: Review[] = [
  { id: 'review1', author: 'Jane Doe', rating: 5, comment: 'Absolutely fantastic product!', date: '2023-10-01' },
  { id: 'review2', author: 'John Smith', rating: 4, comment: 'Very good, but a bit pricey.', date: '2023-10-05' },
];

const sampleSpecifications: ProductSpecification[] = [
  { name: 'Material', value: 'Premium Cotton' },
  { name: 'Origin', value: 'Made in Italy' },
];

// Internal store for products - Initialized from localStorage or defaults
let productsData: Product[] = loadFromLocalStorage<Product[]>(PRODUCTS_STORAGE_KEY, [
  {
    id: '1',
    name: 'Elegant Smartwatch X1',
    description: 'A fusion of classic design and modern technology. Stay connected in style.',
    price: 29999.00, // Adjusted for INR
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
    price: 8999.00, // Adjusted for INR
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
    price: 6700.00, // Adjusted for INR
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
    price: 3375.00, // Adjusted for INR
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
    price: 14925.00, // Adjusted for INR
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
    price: 18750.00, // Adjusted for INR
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
    price: 26175.00, // Adjusted for INR
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
    price: 5625.00, // Adjusted for INR
    category: 'Home Goods',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: 4.3,
    reviews: [],
    specifications: [],
  },
  // Start of 50 new products
  {
    id: '9',
    name: 'New Electronics Product 1-1',
    description: 'This is a high-quality new electronics product 1-1. Explore its features and enjoy its benefits. A great addition to the Electronics collection.',
    price: parseFloat((Math.random() * (45000 - 5000) + 5000).toFixed(2)),
    category: 'Electronics',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '10',
    name: 'New Apparel Product 1-2',
    description: 'This is a high-quality new apparel product 1-2. Explore its features and enjoy its benefits. A great addition to the Apparel collection.',
    price: parseFloat((Math.random() * (15000 - 1000) + 1000).toFixed(2)),
    category: 'Apparel',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '11',
    name: 'New Home Goods Product 1-3',
    description: 'This is a high-quality new home goods product 1-3. Explore its features and enjoy its benefits. A great addition to the Home Goods collection.',
    price: parseFloat((Math.random() * (20000 - 1500) + 1500).toFixed(2)),
    category: 'Home Goods',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '12',
    name: 'New Books Product 1-4',
    description: 'This is a high-quality new books product 1-4. Explore its features and enjoy its benefits. A great addition to the Books collection.',
    price: parseFloat((Math.random() * (5000 - 500) + 500).toFixed(2)),
    category: 'Books',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '13',
    name: 'New Beauty Product 1-5',
    description: 'This is a high-quality new beauty product 1-5. Explore its features and enjoy its benefits. A great addition to the Beauty collection.',
    price: parseFloat((Math.random() * (10000 - 800) + 800).toFixed(2)),
    category: 'Beauty',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '14',
    name: 'New Electronics Product 2-1',
    description: 'This is a high-quality new electronics product 2-1. Explore its features and enjoy its benefits. A great addition to the Electronics collection.',
    price: parseFloat((Math.random() * (45000 - 5000) + 5000).toFixed(2)),
    category: 'Electronics',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '15',
    name: 'New Apparel Product 2-2',
    description: 'This is a high-quality new apparel product 2-2. Explore its features and enjoy its benefits. A great addition to the Apparel collection.',
    price: parseFloat((Math.random() * (15000 - 1000) + 1000).toFixed(2)),
    category: 'Apparel',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '16',
    name: 'New Home Goods Product 2-3',
    description: 'This is a high-quality new home goods product 2-3. Explore its features and enjoy its benefits. A great addition to the Home Goods collection.',
    price: parseFloat((Math.random() * (20000 - 1500) + 1500).toFixed(2)),
    category: 'Home Goods',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '17',
    name: 'New Books Product 2-4',
    description: 'This is a high-quality new books product 2-4. Explore its features and enjoy its benefits. A great addition to the Books collection.',
    price: parseFloat((Math.random() * (5000 - 500) + 500).toFixed(2)),
    category: 'Books',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '18',
    name: 'New Beauty Product 2-5',
    description: 'This is a high-quality new beauty product 2-5. Explore its features and enjoy its benefits. A great addition to the Beauty collection.',
    price: parseFloat((Math.random() * (10000 - 800) + 800).toFixed(2)),
    category: 'Beauty',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '19',
    name: 'New Electronics Product 3-1',
    description: 'This is a high-quality new electronics product 3-1. Explore its features and enjoy its benefits. A great addition to the Electronics collection.',
    price: parseFloat((Math.random() * (45000 - 5000) + 5000).toFixed(2)),
    category: 'Electronics',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '20',
    name: 'New Apparel Product 3-2',
    description: 'This is a high-quality new apparel product 3-2. Explore its features and enjoy its benefits. A great addition to the Apparel collection.',
    price: parseFloat((Math.random() * (15000 - 1000) + 1000).toFixed(2)),
    category: 'Apparel',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '21',
    name: 'New Home Goods Product 3-3',
    description: 'This is a high-quality new home goods product 3-3. Explore its features and enjoy its benefits. A great addition to the Home Goods collection.',
    price: parseFloat((Math.random() * (20000 - 1500) + 1500).toFixed(2)),
    category: 'Home Goods',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '22',
    name: 'New Books Product 3-4',
    description: 'This is a high-quality new books product 3-4. Explore its features and enjoy its benefits. A great addition to the Books collection.',
    price: parseFloat((Math.random() * (5000 - 500) + 500).toFixed(2)),
    category: 'Books',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '23',
    name: 'New Beauty Product 3-5',
    description: 'This is a high-quality new beauty product 3-5. Explore its features and enjoy its benefits. A great addition to the Beauty collection.',
    price: parseFloat((Math.random() * (10000 - 800) + 800).toFixed(2)),
    category: 'Beauty',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '24',
    name: 'New Electronics Product 4-1',
    description: 'This is a high-quality new electronics product 4-1. Explore its features and enjoy its benefits. A great addition to the Electronics collection.',
    price: parseFloat((Math.random() * (45000 - 5000) + 5000).toFixed(2)),
    category: 'Electronics',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '25',
    name: 'New Apparel Product 4-2',
    description: 'This is a high-quality new apparel product 4-2. Explore its features and enjoy its benefits. A great addition to the Apparel collection.',
    price: parseFloat((Math.random() * (15000 - 1000) + 1000).toFixed(2)),
    category: 'Apparel',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '26',
    name: 'New Home Goods Product 4-3',
    description: 'This is a high-quality new home goods product 4-3. Explore its features and enjoy its benefits. A great addition to the Home Goods collection.',
    price: parseFloat((Math.random() * (20000 - 1500) + 1500).toFixed(2)),
    category: 'Home Goods',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '27',
    name: 'New Books Product 4-4',
    description: 'This is a high-quality new books product 4-4. Explore its features and enjoy its benefits. A great addition to the Books collection.',
    price: parseFloat((Math.random() * (5000 - 500) + 500).toFixed(2)),
    category: 'Books',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '28',
    name: 'New Beauty Product 4-5',
    description: 'This is a high-quality new beauty product 4-5. Explore its features and enjoy its benefits. A great addition to the Beauty collection.',
    price: parseFloat((Math.random() * (10000 - 800) + 800).toFixed(2)),
    category: 'Beauty',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '29',
    name: 'New Electronics Product 5-1',
    description: 'This is a high-quality new electronics product 5-1. Explore its features and enjoy its benefits. A great addition to the Electronics collection.',
    price: parseFloat((Math.random() * (45000 - 5000) + 5000).toFixed(2)),
    category: 'Electronics',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '30',
    name: 'New Apparel Product 5-2',
    description: 'This is a high-quality new apparel product 5-2. Explore its features and enjoy its benefits. A great addition to the Apparel collection.',
    price: parseFloat((Math.random() * (15000 - 1000) + 1000).toFixed(2)),
    category: 'Apparel',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '31',
    name: 'New Home Goods Product 5-3',
    description: 'This is a high-quality new home goods product 5-3. Explore its features and enjoy its benefits. A great addition to the Home Goods collection.',
    price: parseFloat((Math.random() * (20000 - 1500) + 1500).toFixed(2)),
    category: 'Home Goods',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '32',
    name: 'New Books Product 5-4',
    description: 'This is a high-quality new books product 5-4. Explore its features and enjoy its benefits. A great addition to the Books collection.',
    price: parseFloat((Math.random() * (5000 - 500) + 500).toFixed(2)),
    category: 'Books',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '33',
    name: 'New Beauty Product 5-5',
    description: 'This is a high-quality new beauty product 5-5. Explore its features and enjoy its benefits. A great addition to the Beauty collection.',
    price: parseFloat((Math.random() * (10000 - 800) + 800).toFixed(2)),
    category: 'Beauty',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '34',
    name: 'New Electronics Product 6-1',
    description: 'This is a high-quality new electronics product 6-1. Explore its features and enjoy its benefits. A great addition to the Electronics collection.',
    price: parseFloat((Math.random() * (45000 - 5000) + 5000).toFixed(2)),
    category: 'Electronics',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '35',
    name: 'New Apparel Product 6-2',
    description: 'This is a high-quality new apparel product 6-2. Explore its features and enjoy its benefits. A great addition to the Apparel collection.',
    price: parseFloat((Math.random() * (15000 - 1000) + 1000).toFixed(2)),
    category: 'Apparel',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '36',
    name: 'New Home Goods Product 6-3',
    description: 'This is a high-quality new home goods product 6-3. Explore its features and enjoy its benefits. A great addition to the Home Goods collection.',
    price: parseFloat((Math.random() * (20000 - 1500) + 1500).toFixed(2)),
    category: 'Home Goods',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '37',
    name: 'New Books Product 6-4',
    description: 'This is a high-quality new books product 6-4. Explore its features and enjoy its benefits. A great addition to the Books collection.',
    price: parseFloat((Math.random() * (5000 - 500) + 500).toFixed(2)),
    category: 'Books',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '38',
    name: 'New Beauty Product 6-5',
    description: 'This is a high-quality new beauty product 6-5. Explore its features and enjoy its benefits. A great addition to the Beauty collection.',
    price: parseFloat((Math.random() * (10000 - 800) + 800).toFixed(2)),
    category: 'Beauty',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '39',
    name: 'New Electronics Product 7-1',
    description: 'This is a high-quality new electronics product 7-1. Explore its features and enjoy its benefits. A great addition to the Electronics collection.',
    price: parseFloat((Math.random() * (45000 - 5000) + 5000).toFixed(2)),
    category: 'Electronics',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '40',
    name: 'New Apparel Product 7-2',
    description: 'This is a high-quality new apparel product 7-2. Explore its features and enjoy its benefits. A great addition to the Apparel collection.',
    price: parseFloat((Math.random() * (15000 - 1000) + 1000).toFixed(2)),
    category: 'Apparel',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '41',
    name: 'New Home Goods Product 7-3',
    description: 'This is a high-quality new home goods product 7-3. Explore its features and enjoy its benefits. A great addition to the Home Goods collection.',
    price: parseFloat((Math.random() * (20000 - 1500) + 1500).toFixed(2)),
    category: 'Home Goods',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '42',
    name: 'New Books Product 7-4',
    description: 'This is a high-quality new books product 7-4. Explore its features and enjoy its benefits. A great addition to the Books collection.',
    price: parseFloat((Math.random() * (5000 - 500) + 500).toFixed(2)),
    category: 'Books',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '43',
    name: 'New Beauty Product 7-5',
    description: 'This is a high-quality new beauty product 7-5. Explore its features and enjoy its benefits. A great addition to the Beauty collection.',
    price: parseFloat((Math.random() * (10000 - 800) + 800).toFixed(2)),
    category: 'Beauty',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '44',
    name: 'New Electronics Product 8-1',
    description: 'This is a high-quality new electronics product 8-1. Explore its features and enjoy its benefits. A great addition to the Electronics collection.',
    price: parseFloat((Math.random() * (45000 - 5000) + 5000).toFixed(2)),
    category: 'Electronics',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '45',
    name: 'New Apparel Product 8-2',
    description: 'This is a high-quality new apparel product 8-2. Explore its features and enjoy its benefits. A great addition to the Apparel collection.',
    price: parseFloat((Math.random() * (15000 - 1000) + 1000).toFixed(2)),
    category: 'Apparel',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '46',
    name: 'New Home Goods Product 8-3',
    description: 'This is a high-quality new home goods product 8-3. Explore its features and enjoy its benefits. A great addition to the Home Goods collection.',
    price: parseFloat((Math.random() * (20000 - 1500) + 1500).toFixed(2)),
    category: 'Home Goods',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '47',
    name: 'New Books Product 8-4',
    description: 'This is a high-quality new books product 8-4. Explore its features and enjoy its benefits. A great addition to the Books collection.',
    price: parseFloat((Math.random() * (5000 - 500) + 500).toFixed(2)),
    category: 'Books',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '48',
    name: 'New Beauty Product 8-5',
    description: 'This is a high-quality new beauty product 8-5. Explore its features and enjoy its benefits. A great addition to the Beauty collection.',
    price: parseFloat((Math.random() * (10000 - 800) + 800).toFixed(2)),
    category: 'Beauty',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '49',
    name: 'New Electronics Product 9-1',
    description: 'This is a high-quality new electronics product 9-1. Explore its features and enjoy its benefits. A great addition to the Electronics collection.',
    price: parseFloat((Math.random() * (45000 - 5000) + 5000).toFixed(2)),
    category: 'Electronics',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '50',
    name: 'New Apparel Product 9-2',
    description: 'This is a high-quality new apparel product 9-2. Explore its features and enjoy its benefits. A great addition to the Apparel collection.',
    price: parseFloat((Math.random() * (15000 - 1000) + 1000).toFixed(2)),
    category: 'Apparel',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '51',
    name: 'New Home Goods Product 9-3',
    description: 'This is a high-quality new home goods product 9-3. Explore its features and enjoy its benefits. A great addition to the Home Goods collection.',
    price: parseFloat((Math.random() * (20000 - 1500) + 1500).toFixed(2)),
    category: 'Home Goods',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '52',
    name: 'New Books Product 9-4',
    description: 'This is a high-quality new books product 9-4. Explore its features and enjoy its benefits. A great addition to the Books collection.',
    price: parseFloat((Math.random() * (5000 - 500) + 500).toFixed(2)),
    category: 'Books',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '53',
    name: 'New Beauty Product 9-5',
    description: 'This is a high-quality new beauty product 9-5. Explore its features and enjoy its benefits. A great addition to the Beauty collection.',
    price: parseFloat((Math.random() * (10000 - 800) + 800).toFixed(2)),
    category: 'Beauty',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '54',
    name: 'New Electronics Product 10-1',
    description: 'This is a high-quality new electronics product 10-1. Explore its features and enjoy its benefits. A great addition to the Electronics collection.',
    price: parseFloat((Math.random() * (45000 - 5000) + 5000).toFixed(2)),
    category: 'Electronics',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '55',
    name: 'New Apparel Product 10-2',
    description: 'This is a high-quality new apparel product 10-2. Explore its features and enjoy its benefits. A great addition to the Apparel collection.',
    price: parseFloat((Math.random() * (15000 - 1000) + 1000).toFixed(2)),
    category: 'Apparel',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '56',
    name: 'New Home Goods Product 10-3',
    description: 'This is a high-quality new home goods product 10-3. Explore its features and enjoy its benefits. A great addition to the Home Goods collection.',
    price: parseFloat((Math.random() * (20000 - 1500) + 1500).toFixed(2)),
    category: 'Home Goods',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '57',
    name: 'New Books Product 10-4',
    description: 'This is a high-quality new books product 10-4. Explore its features and enjoy its benefits. A great addition to the Books collection.',
    price: parseFloat((Math.random() * (5000 - 500) + 500).toFixed(2)),
    category: 'Books',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  },
  {
    id: '58',
    name: 'New Beauty Product 10-5',
    description: 'This is a high-quality new beauty product 10-5. Explore its features and enjoy its benefits. A great addition to the Beauty collection.',
    price: parseFloat((Math.random() * (10000 - 800) + 800).toFixed(2)),
    category: 'Beauty',
    imageUrl: 'https://placehold.co/600x400.png',
    images: ['https://placehold.co/600x400.png'],
    rating: parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)),
    specifications: [],
    reviews: [],
  }
  // End of 50 new products
]);

// Ensure consistency for all products after loading/initializing
productsData = productsData.map(product => {
  const defaultImg = 'https://placehold.co/600x400.png';
  let currentImages = product.images && product.images.length > 0 ? product.images : (product.imageUrl ? [product.imageUrl] : []);
  if (currentImages.length === 0) {
    currentImages = [defaultImg];
  }
  return {
    ...product,
    images: currentImages,
    imageUrl: currentImages[0], // Ensure imageUrl is the first of the images array
    rating: product.rating ?? parseFloat((Math.random() * (5 - 3) + 3).toFixed(1)), // Default rating if missing
    specifications: product.specifications ?? [],
    reviews: product.reviews ?? [],
  };
});

// Save initial products to localStorage if it was empty
if (typeof window !== 'undefined' && !localStorage.getItem(PRODUCTS_STORAGE_KEY)) {
  saveToLocalStorage(PRODUCTS_STORAGE_KEY, productsData);
}


// --- CRUD Functions for Products ---

// READ
export const getAllProducts = (): Product[] => {
  // Return a fresh copy from localStorage if available, otherwise from the in-memory one
  if (typeof window !== 'undefined') {
      const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (storedProducts) {
          try {
              return JSON.parse(storedProducts);
          } catch (e) {
              console.error("Error parsing products from localStorage, returning initial data", e);
              // fall through to return in-memory productsData if parsing fails
          }
      }
  }
  return productsData.map(p => ({ ...p }));
};

export const getProductById = (id: string): Product | undefined => {
  const currentProducts = getAllProducts(); // Use getAllProducts to ensure we're checking current storage
  const product = currentProducts.find(p => p.id === id);
  return product ? { ...product } : undefined;
};

// CREATE
export type ProductCreateInput = Omit<Product, 'id'>;

export const addProduct = (productInput: ProductCreateInput): Product => {
  let currentProducts = getAllProducts();
  const existingIds = currentProducts.map(p => parseInt(p.id, 10)).filter(id => !isNaN(id));
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
  currentProducts.push(newProduct);
  saveToLocalStorage(PRODUCTS_STORAGE_KEY, currentProducts);
  // Update in-memory state as well, though getAllProducts will now read from localStorage
  productsData = currentProducts; 
  return { ...newProduct };
};

// UPDATE
export const updateProduct = (id: string, updates: Partial<Omit<Product, 'id'>>): Product | undefined => {
  let currentProducts = getAllProducts();
  const productIndex = currentProducts.findIndex(p => p.id === id);
  if (productIndex === -1) {
    return undefined;
  }

  const existingProduct = currentProducts[productIndex];
  let updatedProductData = { ...existingProduct, ...updates };

  if (updates.images && updates.images.length > 0) {
    updatedProductData.imageUrl = updates.images[0];
  } else if (updates.images && updates.images.length === 0) { // if images array is explicitly set to empty
    const defaultImg = 'https://placehold.co/600x400.png';
    updatedProductData.imageUrl = defaultImg;
    updatedProductData.images = [defaultImg];
  } else if (updates.imageUrl && (!updates.images || updates.images.length === 0)) {
    // if only imageUrl is updated, ensure images array reflects this
    updatedProductData.images = [updates.imageUrl];
  }


  currentProducts[productIndex] = updatedProductData;
  saveToLocalStorage(PRODUCTS_STORAGE_KEY, currentProducts);
  productsData = currentProducts; // Update in-memory cache
  return { ...currentProducts[productIndex] };
};

// DELETE
export const deleteProduct = (id: string): boolean => {
  let currentProducts = getAllProducts();
  const initialLength = currentProducts.length;
  currentProducts = currentProducts.filter(p => p.id !== id);
  const success = currentProducts.length < initialLength;
  if (success) {
    saveToLocalStorage(PRODUCTS_STORAGE_KEY, currentProducts);
    productsData = currentProducts; // Update in-memory cache
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
  let currentProducts = getAllProducts();
  const productIndex = currentProducts.findIndex(p => p.id === productId);
  if (productIndex === -1) {
    return undefined;
  }

  const product = currentProducts[productIndex];
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

  currentProducts[productIndex] = product;
  saveToLocalStorage(PRODUCTS_STORAGE_KEY, currentProducts);
  productsData = currentProducts; // Update in-memory cache
  return { ...product };
};


// --- Site Settings ---
let siteSettingsData: SiteSettings = loadFromLocalStorage<SiteSettings>(SETTINGS_STORAGE_KEY, {
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
});

// Save initial settings to localStorage if it was empty
if (typeof window !== 'undefined' && !localStorage.getItem(SETTINGS_STORAGE_KEY)) {
  saveToLocalStorage(SETTINGS_STORAGE_KEY, siteSettingsData);
}

export const getSiteSettings = (): SiteSettings => {
  // Return a fresh copy from localStorage if available, otherwise from the in-memory one
  if (typeof window !== 'undefined') {
      const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (storedSettings) {
          try {
              return JSON.parse(storedSettings);
          } catch (e) {
                console.error("Error parsing settings from localStorage, returning initial data", e);
          }
      }
  }
  return { ...siteSettingsData };
};

export const updateSiteSettings = (newSettings: Partial<SiteSettings>): SiteSettings => {
  let currentSettings = getSiteSettings();
  currentSettings = { ...currentSettings, ...newSettings };
  saveToLocalStorage(SETTINGS_STORAGE_KEY, currentSettings);
  siteSettingsData = currentSettings; // Update in-memory cache
  return { ...currentSettings };
};

// --- User Management (In-memory, for UI Prototyping Only - NOT SECURE) ---
let usersData: User[] = loadFromLocalStorage<User[]>(USERS_STORAGE_KEY, [
    { id: 'user1', email: 'test@example.com', password: 'password123', name: 'Test User' },
    { id: 'adminuser', email: 'admin@shopsphere.com', password: 'adminpass', name: 'Shop Admin' }
]);

// Save initial users to localStorage if it was empty
if (typeof window !== 'undefined' && !localStorage.getItem(USERS_STORAGE_KEY)) {
  saveToLocalStorage(USERS_STORAGE_KEY, usersData);
}

export const getUserByEmail = (email: string): User | undefined => {
  const currentUsers = typeof window !== 'undefined' ? loadFromLocalStorage(USERS_STORAGE_KEY, usersData) : usersData;
  const user = currentUsers.find(user => user.email === email);
  return user ? {...user} : undefined;
};

export type UserCreateInput = Omit<User, 'id'>;

export const createUser = (userInput: UserCreateInput): User | { error: string } => {
  let currentUsers = typeof window !== 'undefined' ? loadFromLocalStorage(USERS_STORAGE_KEY, usersData) : usersData;
  if (currentUsers.find(user => user.email === userInput.email)) {
    return { error: 'Account already exists with this email.' };
  }
  const newId = `user${currentUsers.length + 1}_${Date.now()}`;
  const newUser: User = { ...userInput, id: newId };
  currentUsers.push(newUser);
  saveToLocalStorage(USERS_STORAGE_KEY, currentUsers);
  usersData = currentUsers; // Update in-memory cache
  return { ...newUser };
};

export const verifyUserCredentials = (email: string, pass: string): User | null => {
    const currentUsers = typeof window !== 'undefined' ? loadFromLocalStorage(USERS_STORAGE_KEY, usersData) : usersData;
    const user = currentUsers.find(u => u.email === email);
    if (user && user.password === pass) { // Insecure: direct password comparison
        return {...user};
    }
    return null;
}

    