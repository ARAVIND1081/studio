
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
