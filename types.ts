

export interface Variant {
  id: string;
  productId: string;
  attributes: Record<string, string>; // e.g., { "Color": "Rojo", "Talla": "M" }
  price: number; // Net price for this specific variant
  stock: number;
  imageUrl: string; // Reverted back to a single image URL
  discount?: number; // Discount is now on the variant level
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  // price, stock, and imageUrls are moved to variants
  // imageUrls: string[];
  category: string;
  subcategory?: string;
  description: string;
  variants: Variant[];
  isGarageSale?: boolean;
}

export interface Category {
  id?: string; // Add ID for Firestore documents
  name: string;
  subcategories: string[];
}

export interface OrderItem {
    // This will now be a snapshot of the product and variant at the time of order
    productId: string;
    variantId: string;
    name: string;
    imageUrl: string; // This will store the primary image for the order item
    variantAttributes: Record<string, string>;
    quantity: number;
    price: number; // The net price of the variant at the time of order
    quotedPrice?: number; // Price quoted by the seller
    discount?: number;
    sellerId: string;
}


export interface LineItem {
    id: string;
    description: string;
    amount: number; // Can be positive (shipping) or negative (discount)
}

export interface Message {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
}

export type OrderStatus = 'Pendiente de Cotización' | 'Cotizado' | 'Aceptado' | 'Cancelado' | 'Procesando' | 'Enviado' | 'Entregado';

export interface CustomerDetails {
    name: string;
    email: string;
    address: string;
}

export interface Order {
    id: string;
    customer: CustomerDetails;
    sellerId: string;
    items: OrderItem[];
    date: string;
    status: OrderStatus;
    total: number;
    notes?: string;
    lineItems?: LineItem[];
    validUntil?: string;
    messages?: Message[];
    isRated?: boolean;
}

export interface PublicRequest {
    id: string;
    requesterId: string;
    title: string;
    category: string;
    description: string;
    budget?: number;
    deadline: string;
}

export interface Rating {
    id?: string; // Firestore document ID
    orderId: string;
    sellerId: string; // Keep track of which seller is being rated
    buyerId: string;
    buyerName: string;
    value: number; // 1 to 5
    comment: string;
    date: string;
}

export interface AnalyticsData {
    totalQuotes: number;
    acceptanceRate: number;
    totalRevenue: number;
    monthlyQuotes: { month: string; count: number }[];
    popularProducts: { productId: string; name: string; count: number }[];
}


// User Management Types
export type UserRole = 'user' | 'admin' | 'profile';

export interface User {
    id: string;
    email: string;
    password?: string; // For mock purposes
    role: UserRole;
    name: string; // Main display name for all users
    accountType: 'natural' | 'juridica';

    // Optional seller fields
    legalName?: string; // Razón Social
    rut?: string;
    address?: string;
    whatsapp?: string;
    logoUrl?: string;
    isVerified?: boolean;
    bio?: string;
    // ratings?: Rating[]; // Ratings are now in their own collection
}
