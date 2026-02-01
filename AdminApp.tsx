
import React, { useState, useEffect } from 'react';
import { Appointment } from './types';
import { firebaseService } from './firebase';
import {
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
  Settings,
  LogOut,
  RefreshCw,
  Clock,
  User as UserIcon,
  Check,
  X,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import AdminGallery from './components/AdminGallery';

const AdminApp: React.FC = () => {
  // ใช้ timezone ประเทศไทย (UTC+7)
  const getThaiDate = () => {
    const now = new Date();
    const thaiTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    return thaiTime.toISOString().split('T')[0];
  };
  const [date, setDate] = useState(getThaiDate());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDailyAppointments = React.useCallback(async () => {
    setLoading(true);
    const data = await firebaseService.getAppointmentsByDate(date);
    setAppointments(data.sort((a, b) => a.time.localeCompare(b.time)));
    setTimeout(() => setLoading(false), 300);
  }, [date]);

  useEffect(() => {
    fetchDailyAppointments();
  }, [fetchDailyAppointments]);

  const handleUpdateStatus = React.useCallback(async (id: string, status: 'confirmed' | 'cancelled') => {
    await firebaseService.updateStatus(id, status);
    fetchDailyAppointments();
  }, [fetchDailyAppointments]);

  const stats = React.useMemo(() => ({
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    pending: appointments.filter(a => a.status !== 'confirmed' && a.status !== 'cancelled').length,
  }), [appointments]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Simple Header */}
      <header className="bg-white border-b sticky top-0 z-10 px-4 py-4 md:px-8 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-rose-200">N</div>
            <h1 className="text-xl font-luxury font-bold text-slate-900">nailnan Admin</h1>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 px-2 py-1"
            />
            <button
              onClick={fetchDailyAppointments}
              className="p-1 px-2 hover:bg-white rounded-lg text-slate-500 transition-all shadow-sm"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Simple Stats Cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8 mt-2">
          {[
            { label: 'ทั้งหมด', value: stats.total, color: 'bg-white/80 text-slate-800' },
            { label: 'คอนเฟิร์ม', value: stats.confirmed, color: 'bg-emerald-50/80 text-emerald-700 backdrop-blur-md' },
            { label: 'รอดำเนินการ', value: stats.pending, color: 'bg-amber-50/80 text-amber-700 backdrop-blur-md' }
          ].map((stat, idx) => (
            <div key={idx} className={`${stat.color} p-4 rounded-2xl border border-white/50 shadow-sm flex flex-col items-center justify-center text-center backdrop-blur-md`}>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{stat.label}</span>
              <span className="text-2xl md:text-3xl font-bold">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Schedule Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Calendar size={18} className="text-rose-500" />
              ตารางคิวงาน
            </h3>
            <span className="text-xs font-bold text-slate-400">
              {new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
            </span>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <RefreshCw className="animate-spin text-rose-500" size={32} />
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">กำลังโหลดข้อมูล...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border-2 border-dashed border-slate-200 text-center flex flex-col items-center">
              <Calendar size={48} className="text-slate-200 mb-4" />
              <p className="text-slate-400 font-medium font-luxury">ไม่มีนัดหมายในวันนี้</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {appointments.map((app) => (
                <div key={app.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:border-rose-200 transition-all flex flex-col md:flex-row md:items-center gap-4">
                  {/* Time Badge */}
                  <div className="flex items-center justify-between md:flex-col md:justify-center md:w-20 md:border-r md:pr-4">
                    <span className="text-lg font-bold text-slate-900">{app.time}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${app.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                      app.status === 'cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                      {app.status || 'รอยืนยัน'}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {app.userPicture ? (
                      <img src={app.userPicture} className="w-12 h-12 rounded-xl border object-cover" alt="avatar" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <UserIcon size={20} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="block font-bold text-slate-800 truncate">{app.userName}</span>
                      <span className="block text-xs text-rose-500 font-medium">{app.service}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 md:pt-0">
                    {app.status !== 'confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(app.id!, 'confirmed')}
                        className="flex-1 md:flex-none py-2.5 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-sm font-bold shadow-md shadow-emerald-100 transition-all active:scale-95"
                      >
                        ยืนยันคิว
                      </button>
                    )}
                    {app.status !== 'cancelled' && (
                      <button
                        onClick={() => handleUpdateStatus(app.id!, 'cancelled')}
                        className="p-2.5 px-4 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-2xl border border-slate-200 transition-all active:scale-95"
                        title="ยกเลิกนัด"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="my-8 border-t border-slate-200" />

        {/* Gallery Management Section */}
        <AdminGallery />
      </main>

      {/* Floating Info */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-6 py-3 rounded-full backdrop-blur-md shadow-2xl flex items-center gap-4 border border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Nailnan Live</span>
        </div>
        <div className="w-px h-3 bg-white/20"></div>
        <p className="text-[10px] font-bold opacity-70">ADMIN SYSTEM V2</p>
      </footer>
    </div>
  );
};

export default AdminApp;
