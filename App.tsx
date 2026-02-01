
import React, { useState, useEffect } from 'react';
import { liffService } from './liff';
import { View, UserProfile } from './types';
import Home from './pages/Home';
import BookingPage from './pages/BookingPage';
import MyBookings from './pages/MyBookings';

import Gallery from './components/Gallery';
import { Loader2, Calendar, User, Home as HomeIcon, Image as ImageIcon } from 'lucide-react';
// LIFF ID is configured in .env.local file
const LIFF_ID = process.env.LIFF_ID || 'YOUR_LIFF_ID_HERE';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [loading, setLoading] = useState(true);
  // Move constant outside data to prevent recreation
  const GUEST_USER: UserProfile = { userId: 'guest', displayName: 'Guest' };

  useEffect(() => {
    const initialize = async () => {
      try {
        const profile = await liffService.init(LIFF_ID);
        if (profile) {
          setUser(profile);
        }
      } catch (err) {
        console.error("App initialization error:", err);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  const handleBookingComplete = React.useCallback(() => {
    setCurrentView(View.MY_BOOKINGS);
  }, []);

  const handleNavigate = React.useCallback((view: View) => {
    setCurrentView(view);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-stone-50">
        <Loader2 className="w-12 h-12 text-rose-400 animate-spin" />
        <p className="mt-4 text-stone-500 font-medium animate-pulse">กำลังเตรียมความสวยที่ nailnan...</p>
      </div>
    );
  }

  const currentUser = user || GUEST_USER;

  const renderView = () => {
    switch (currentView) {
      case View.HOME: return <Home onNavigate={handleNavigate} />;
      case View.BOOKING: return <BookingPage user={currentUser} onComplete={handleBookingComplete} />;
      case View.MY_BOOKINGS: return <MyBookings user={currentUser} />;
      case View.GALLERY: return <Gallery />;
      default: return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen bg-white shadow-xl flex flex-col relative overflow-hidden border-x border-stone-100 pb-20">
      {/* ... header ... */}
      <header className="p-4 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex flex-col">
          <h1 className="text-2xl font-luxury text-rose-500 tracking-tighter leading-none">nailnan</h1>
          <span className="text-[10px] text-stone-400 font-medium uppercase tracking-widest">Premium Salon</span>
        </div>
        {user && (
          <div className="flex items-center gap-2 bg-stone-50 p-1.5 pr-3 rounded-full border border-stone-100">
            <img src={user.pictureUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nailnan'} alt="profile" className="w-7 h-7 rounded-full shadow-sm" />
            <span className="text-[10px] font-bold text-stone-600 truncate max-w-[80px]">{user.displayName}</span>
          </div>
        )}
      </header>

      <main className={`flex-1 ${currentView === View.HOME ? 'overflow-hidden' : 'overflow-y-auto'} bg-stone-50/30`}>
        {renderView()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-lg border-t border-stone-100 px-4 py-3 flex justify-around items-center z-50">
        <button
          onClick={() => setCurrentView(View.HOME)}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === View.HOME ? 'text-rose-500 scale-110' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <HomeIcon size={20} />
          <span className="text-[10px] font-bold">หน้าแรก</span>
        </button>
        <button
          onClick={() => setCurrentView(View.GALLERY)}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === View.GALLERY ? 'text-rose-500 scale-110' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <ImageIcon size={20} />
          <span className="text-[10px] font-bold">อัลบั้มลายเล็บ</span>
        </button>
        <button
          onClick={() => setCurrentView(View.BOOKING)}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === View.BOOKING ? 'text-rose-500 scale-110' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <Calendar size={20} />
          <span className="text-[10px] font-bold">จองคิว</span>
        </button>
        <button
          onClick={() => setCurrentView(View.MY_BOOKINGS)}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === View.MY_BOOKINGS ? 'text-rose-500 scale-110' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <User size={20} />
          <span className="text-[10px] font-bold">ของฉัน</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
