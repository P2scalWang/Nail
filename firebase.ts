// Firebase Configuration - แก้ไขได้ที่ไฟล์ .env.local
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  push,
  set,
  get,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
  Database
} from 'firebase/database';
import { Appointment, GalleryImage } from './types';

// Firebase config จาก environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  databaseURL: process.env.FIREBASE_DATABASE_URL || '',
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_APP_ID || ''
};

// ตรวจสอบว่ามี Firebase config ครบหรือไม่
const isFirebaseConfigured = firebaseConfig.apiKey &&
  firebaseConfig.databaseURL &&
  !firebaseConfig.apiKey.includes('YOUR_');

// Initialize Firebase
let app: FirebaseApp | null = null;
let db: Database | null = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    console.log('✅ Firebase Realtime DB connected successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
  }
} else {
  console.warn('⚠️ Firebase not configured. Please set environment variables in .env.local');
}

const APPOINTMENTS_REF = 'appointments';
const GALLERY_REF = 'gallery';

export const firebaseService = {
  // ดึงข้อมูลการจองทั้งหมด
  getAppointments: async (): Promise<Appointment[]> => {
    if (!db) {
      console.error('Firebase not initialized');
      return [];
    }

    try {
      const snapshot = await get(ref(db, APPOINTMENTS_REF));
      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })) as Appointment[];
      }
      return [];
    } catch (error) {
      console.error('Error getting appointments:', error);
      return [];
    }
  },

  // เพิ่มการจองใหม่
  addAppointment: async (appointment: Appointment): Promise<boolean> => {
    if (!db) {
      console.error('Firebase not initialized');
      return false;
    }

    try {
      // ตรวจสอบว่าเวลานี้ถูกจองแล้วหรือไม่
      // Note: Realtime DB filtering is more limited, doing client-side check for specific day/time slot combo might be needed 
      // or using a composite key query if structured. 
      // For simplicity here, we query for date and check manual filter
      const q = query(ref(db, APPOINTMENTS_REF), orderByChild('date'), equalTo(appointment.date));
      const snapshot = await get(q);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const hasConflict = Object.values(data).some((a: any) =>
          a.time === appointment.time && a.status !== 'cancelled'
        );
        if (hasConflict) return false;
      }

      // เพิ่มการจองใหม่
      const newRef = push(ref(db, APPOINTMENTS_REF));
      await set(newRef, {
        ...appointment,
        createdAt: Date.now()
      });
      return true;
    } catch (error) {
      console.error('Error adding appointment:', error);
      return false;
    }
  },

  // อัพเดทสถานะการจอง
  updateStatus: async (id: string, status: 'confirmed' | 'cancelled'): Promise<void> => {
    if (!db) return;
    try {
      await update(ref(db, `${APPOINTMENTS_REF}/${id}`), { status });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  },

  // ยกเลิกการจอง
  cancelAppointment: async (id: string): Promise<void> => {
    if (!db) return;
    try {
      await update(ref(db, `${APPOINTMENTS_REF}/${id}`), { status: 'cancelled' });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  },

  // ดึงการจองตาม userId
  getAppointmentsByUserId: async (userId: string): Promise<Appointment[]> => {
    if (!db) return [];
    try {
      const q = query(ref(db, APPOINTMENTS_REF), orderByChild('userId'), equalTo(userId));
      const snapshot = await get(q);
      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })) as Appointment[];
      }
      return [];
    } catch (error) {
      console.error('Error getting user appointments:', error);
      return [];
    }
  },

  // ดึงการจองตามวันที่
  getAppointmentsByDate: async (date: string): Promise<Appointment[]> => {
    if (!db) return [];
    try {
      const q = query(ref(db, APPOINTMENTS_REF), orderByChild('date'), equalTo(date));
      const snapshot = await get(q);
      if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })) as Appointment[];
      }
      return [];
    } catch (error) {
      console.error('Error getting appointments by date:', error);
      return [];
    }
  },

  // ตรวจสอบว่า Firebase พร้อมใช้งานหรือไม่
  isReady: (): boolean => {
    return db !== null;
  }
};

// Initialize Storage (Still kept if needed for legacy compatibility, but ImgBB is preferred)
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject, FirebaseStorage } from 'firebase/storage';

let storage: FirebaseStorage | null = null;
if (app) {
  try {
    storage = getStorage(app);
  } catch (error) {
    console.warn('Firebase Storage init error', error);
  }
}

export const galleryService = {
  getImages: async (): Promise<GalleryImage[]> => {
    if (!db) return [];
    try {
      const snapshot = await get(ref(db, GALLERY_REF));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const images = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })) as GalleryImage[];
        return images.sort((a, b) => b.createdAt - a.createdAt);
      }
      return [];
    } catch (error) {
      console.error('Error getting gallery images:', error);
      return [];
    }
  },

  // Method for external image services (ImgBB)
  addImage: async (imageUrl: string, title: string): Promise<boolean> => {
    if (!db) return false;
    try {
      const newRef = push(ref(db, GALLERY_REF));
      await set(newRef, {
        imageUrl: imageUrl,
        title: title || '',
        createdAt: Date.now(),
      });
      return true;
    } catch (error) {
      console.error('Error adding gallery image doc:', error);
      return false;
    }
  },

  // Legacy method (kept for compatibility)
  uploadImage: async (file: File, title: string): Promise<boolean> => {
    if (!db || !storage) return false;
    try {
      // 1. Upload to Storage
      const fileRef = storageRef(storage, `gallery/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      // 2. Save metadata to Realtime Database
      const newRef = push(ref(db, GALLERY_REF));
      await set(newRef, {
        imageUrl: downloadURL,
        title: title || '',
        createdAt: Date.now(),
        storagePath: fileRef.fullPath
      });
      return true;
    } catch (error) {
      console.error('Error uploading image:', error);
      return false;
    }
  },

  deleteImage: async (id: string, storagePath?: string): Promise<void> => {
    if (!db) return;
    try {
      // 1. Delete from Realtime Database
      await remove(ref(db, `${GALLERY_REF}/${id}`));

      // 2. Delete from Storage if path exists
      if (storage && storagePath) {
        const fileRef = storageRef(storage, storagePath);
        await deleteObject(fileRef).catch(e => console.warn('Storage delete error', e));
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }
};
