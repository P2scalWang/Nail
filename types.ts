
export interface Appointment {
  id?: string;
  userId: string;
  userName: string;
  userPicture?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:00
  service: string; // Deprecated, kept for backward compatibility
  services?: string[]; // New field for multiple services
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: number;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

export interface GalleryImage {
  id?: string;
  imageUrl: string;
  title?: string;
  createdAt: number;
  storagePath?: string;
}

export enum View {
  HOME = 'home',
  BOOKING = 'booking',
  MY_BOOKINGS = 'my-bookings',
  GALLERY = 'gallery'
}
