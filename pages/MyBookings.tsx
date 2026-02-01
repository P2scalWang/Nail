
import React, { useState, useEffect } from 'react';
import { UserProfile, Appointment } from '../types';
import { firebaseService } from '../firebase';
import { Calendar, Clock, Trash2 } from 'lucide-react';

interface MyBookingsProps {
  user: UserProfile;
}

const MyBookings: React.FC<MyBookingsProps> = ({ user }) => {
  const [bookings, setBookings] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [user.userId]);

  const fetchBookings = async () => {
    const data = await firebaseService.getAppointmentsByUserId(user.userId);
    setBookings(data.sort((a, b) => b.createdAt - a.createdAt));
    setLoading(false);
  };

  const handleCancel = async (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคิวนี้?')) {
      await firebaseService.cancelAppointment(id);
      fetchBookings();
    }
  };

  if (loading) return <div className="p-8 text-center text-stone-500">กำลังโหลดรายการ...</div>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">การจองของฉัน</h2>

      {bookings.length === 0 ? (
        <div className="bg-stone-50 rounded-3xl p-12 text-center border-2 border-dashed border-stone-200">
          <p className="text-stone-400">ยังไม่มีประวัติการจอง</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className={`p-5 rounded-2xl border bg-white shadow-sm relative overflow-hidden transition-all
                ${booking.status === 'cancelled' ? 'opacity-60 border-stone-200' : 'border-rose-100'}
              `}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-wrap gap-1 max-w-[70%]">
                  {(booking.services || [booking.service]).map((s, i) => (
                    <span key={i} className="bg-rose-50 text-rose-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                      {s}
                    </span>
                  ))}
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full
                  ${booking.status === 'confirmed' ? 'bg-green-50 text-green-600' :
                    booking.status === 'cancelled' ? 'bg-stone-100 text-stone-500' :
                      'bg-amber-50 text-amber-600'}
                `}>
                  {booking.status === 'confirmed' ? 'ยืนยันแล้ว' :
                    booking.status === 'cancelled' ? 'ยกเลิกแล้ว' :
                      'รอยืนยัน'}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-stone-700">
                  <Calendar size={16} className="text-stone-400" />
                  <span className="font-medium">{new Date(booking.date).toLocaleDateString('th-TH', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <Clock size={16} className="text-stone-400" />
                  <span className="font-medium">{booking.time} น.</span>
                </div>
              </div>

              {booking.status === 'confirmed' && (
                <button
                  onClick={() => handleCancel(booking.id!)}
                  className="absolute bottom-4 right-4 text-stone-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
