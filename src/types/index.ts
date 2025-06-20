
export interface Review {
  id: string;
  author: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface ProductSpecification {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  images?: string[]; // Additional images for product detail page
  rating: number; // Average rating
  specifications?: ProductSpecification[];
  reviews?: Review[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type Category = string;

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  contentManagementInfoText?: string;
  homePageNoProductsTitle?: string;
  homePageNoProductsDescription?: string;
  contactPageTitle?: string;
  contactPageDescription?: string;
  contactPagePhoneNumber?: string;
  contactPageAddress?: string;
  contactPageAdditionalInfo?: string;
}

export interface User {
  id: string;
  name?: string;
  email: string;
  password?: string; // In a real app, this should be a securely hashed password
}

// Order related types
export interface OrderItem extends CartItem {
  // Inherits product and quantity
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export const ORDER_STATUSES: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];


export interface Order {
  id: string; // Unique internal ID
  orderNumber: string; // User-friendly order number (e.g., SHP-123456)
  customerId?: string; // Optional: if users are logged in and we want to link orders
  customerName: string; // From shipping details
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  shippingMethod: string;
  shippingCost: number;
  paymentMethod: string;
  paymentDetails?: string; // e.g., "Card ending in XXXX" or "UPI ID: ..."
  subtotal: number;
  taxes: number;
  totalAmount: number;
  orderDate: string; // ISO string for date/time
  status: OrderStatus;
}

// Scheduled Video Call related types
export type ScheduledCallStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
export const SCHEDULED_CALL_STATUSES: ScheduledCallStatus[] = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

export interface ScheduledCall {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  userId?: string;
  requesterName: string; // Can be from User.name or manually entered
  requesterEmail?: string; // Manually entered if not logged in
  requestedDateTime: string; // ISO string
  status: ScheduledCallStatus;
  notes?: string;
  meetingLink?: string; // Added field for Google Meet link
  createdAt: string; // ISO string
}

