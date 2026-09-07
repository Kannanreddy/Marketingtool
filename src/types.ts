export interface Product {
  SKU: string;
  Name: string;
  Price: string;
  DiscountPrice: string;
  Stock: number | string;
  ImageDriveURL: string;
  Tags: string;
  CustomFields?: string;
  Status: 'Active' | 'Draft' | 'Out of Stock';
  ShortDescription: string;
  LongDescription?: string;
  BannerDriveURL?: string;
  PublicLink?: string;
  category?: string;
  viscosity?: string;
  size?: string;
}

export interface Order {
  OrderID: string;
  Timestamp: string;
  SKU: string;
  CustomerName: string;
  Phone: string;
  Address: string;
  Total: string;
  Source: string;
  Status: 'New' | 'Confirmed' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  Quantity: number;
  PaymentMethod: 'COD' | 'UPI' | 'Card';
  PaymentStatus: 'Pending' | 'Paid';
  TrackingNumber?: string;
  Notes?: string;
}

export interface StoreSettings {
  StoreName: string;
  Currency: string;
  WhatsAppNumber: string;
  SellerEmail: string;
  HeaderAnnouncement: string;
  FooterText: string;
  SpreadsheetId: string;
  GoogleSheetUrl?: string;
}

export type BannerAspectRatio = '1:1' | '9:16' | '16:9' | '4:5' | 'A4';

export interface BannerConfig {
  aspectRatio: BannerAspectRatio;
  style: string;
  palette: string;
  theme: string;
  pattern: string;
  headlineCustom?: string;
  showQrCode: boolean;
  showContactBar: boolean;
  badgeText?: string;
}

export interface ScheduleItem {
  id: string;
  sku: string;
  productName: string;
  title: string;
  scheduledDate: string;
  scheduledTime: string;
  channels: string[];
  status: 'Scheduled' | 'Queued' | 'Published';
  caption: string;
  aspectRatio: BannerAspectRatio;
  style: string;
  palette: string;
}
