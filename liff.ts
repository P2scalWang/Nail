
import { UserProfile } from './types';

declare const liff: any;

export const liffService = {
  init: async (liffId: string): Promise<UserProfile | null> => {
    // Check if the LIFF ID is a placeholder or empty
    if (!liffId || liffId.includes('YOUR_LIFF_ID')) {
      console.warn('LIFF ID is not configured. Running in Development/Mock mode.');
      // Return a mock profile immediately to bypass LIFF initialization errors
      return {
        userId: 'dev-user-123',
        displayName: 'ลูกค้าทดลอง (Mock)',
        pictureUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nailnan'
      };
    }

    try {
      await liff.init({ liffId });
      
      if (!liff.isLoggedIn()) {
        liff.login();
        return null;
      }

      const profile = await liff.getProfile();
      return {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl
      };
    } catch (error: any) {
      console.error('LIFF Initialization failed:', error);
      
      // Handle specific "channel not found" or general init errors gracefully
      // especially in sandbox/preview environments
      return {
        userId: 'dev-user-123',
        displayName: 'Test User (Failover)',
        pictureUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nailnan'
      };
    }
  },

  logout: () => {
    if (typeof liff !== 'undefined' && liff.isLoggedIn()) {
      liff.logout();
      window.location.reload();
    }
  }
};
