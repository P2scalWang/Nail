import React, { useState, useEffect } from 'react';
import { UserProfile, Appointment } from '../types';
import { firebaseService } from '../firebase';
// Added Sparkles to the list of icons imported from lucide-react to fix the compilation error
import { Calendar as CalendarIcon, Clock, CheckCircle, AlertCircle, Sparkles, User as UserIcon } from 'lucide-react';

interface BookingFormProps {
  user: UserProfile;
  onComplete: () => void;
}

const SERVICES = ['ทาสีเจลเริ่มต้น', 'งานเพ้น', 'ต่อเล็บ', 'ล้างสีเจล'];
const TIME_SLOTS = [
  '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00'
];

const BookingPage: React.FC<BookingFormProps> = ({ user, onComplete }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [name, setName] = useState(user.displayName || '');
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (date) {
      checkAvailability();
    }
  }, [date]);

  const checkAvailability = async () => {
    const appointments = await firebaseService.getAppointmentsByDate(date);
    const taken = appointments
      .filter(a => a.status !== 'cancelled')
      .map(a => a.time);
    setBookedSlots(taken);
  };

  const toggleService = (s: string) => {
    setSelectedServices(prev =>
      prev.includes(s)
        ? prev.filter(item => item !== s)
        : [...prev, s]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || selectedServices.length === 0) {
      setMessage({ type: 'error', text: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
      return;
    }

    setLoading(true);
    const appointment: Appointment = {
      userId: user.userId,
      userName: name,
      userPicture: user.pictureUrl,
      date,
      time,
      service: selectedServices.join(', '), // For backward compatibility
      services: selectedServices,
      status: 'pending',
      createdAt: Date.now()
    };

    const success = await firebaseService.addAppointment(appointment);
    setLoading(false);

    if (success) {
      setMessage({ type: 'success', text: 'จองคิวสำเร็จแล้ว!' });
      setTimeout(onComplete, 2000);
    } else {
      setMessage({ type: 'error', text: 'ขออภัย เวลานี้ถูกจองไปแล้ว' });
      checkAvailability();
    }
  };

  // ใช้ timezone ประเทศไทย (UTC+7)
  const getThaiDate = (daysToAdd = 0) => {
    const now = new Date();
    const thaiTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    thaiTime.setDate(thaiTime.getDate() + daysToAdd);
    return thaiTime.toISOString().split('T')[0];
  };
  const minDate = getThaiDate(0); // จองได้ตั้งแต่วันนี้

  return (
    <div className="p-6 space-y-6 pb-32">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-stone-900">จองคิวทำเล็บ</h2>
        <p className="text-sm text-stone-500">เลือกวันที่และเวลาที่คุณต้องการ</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-stone-700 flex items-center gap-2 mb-2">
              <UserIcon size={16} /> ชื่อผู้จอง
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 rounded-xl border border-stone-200 focus:ring-4 focus:ring-rose-100 focus:border-rose-400 outline-none transition-all shadow-sm text-stone-700 bg-white/50 backdrop-blur-sm"
              placeholder="กรอกชื่อของคุณ"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-stone-700 flex items-center gap-2 mb-2">
              <CalendarIcon size={16} /> วันที่เข้ารับบริการ
            </span>
            <input
              type="date"
              min={minDate}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-4 rounded-xl border border-stone-200 focus:ring-4 focus:ring-rose-100 focus:border-rose-400 outline-none transition-all shadow-sm text-stone-700 bg-white/50 backdrop-blur-sm"
            />
          </label>

          {date && (
            <div className="space-y-2">
              <span className="text-sm font-semibold text-stone-700 flex items-center gap-2 mb-2">
                <Clock size={16} /> เลือกเวลา (ใช้เวลาประมาณ 1 ชม./คิว)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const isBooked = bookedSlots.includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isBooked}
                      onClick={() => setTime(slot)}
                      className={`py-3 rounded-xl text-sm font-medium transition-all border
                        ${isBooked
                          ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                          : time === slot
                            ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-200 scale-105'
                            : 'bg-white text-stone-600 border-stone-100 hover:border-rose-200 hover:bg-rose-50/50'
                        }
                      `}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <label className="block">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                <Sparkles size={16} /> เลือกบริการ
              </span>
              <span className="text-xs text-stone-400 font-medium">เลือกได้มากกว่า 1 อย่าง</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {SERVICES.map((s) => {
                const isSelected = selectedServices.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleService(s)}
                    className={`p-4 rounded-xl text-left text-sm font-medium transition-all border flex justify-between items-center
                      ${isSelected
                        ? 'bg-rose-50 border-rose-400 text-rose-700 ring-4 ring-rose-50'
                        : 'bg-white border-stone-100 text-stone-600 hover:border-rose-200 hover:bg-rose-50/30'
                      }
                    `}
                  >
                    <span>{s}</span>
                    {isSelected && <CheckCircle size={16} className="text-rose-500" />}
                  </button>
                );
              })}
            </div>
          </label>
        </div>

        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 animate-bounce
            ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}
          `}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !date || !time || selectedServices.length === 0}
          className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
        >
          {loading ? 'กำลังดำเนินการ...' : 'ยืนยันการจอง'}
        </button>
      </form>
    </div>
  );
};

export default BookingPage;