
import React, { useState, useEffect } from 'react';
import { Appointment } from './types';
import { firebaseService } from './firebase';
import {
  Calendar,
  RefreshCw,
  User as UserIcon,
  X,
  Clock,
  LayoutList,
  History,
  AlertCircle,
  Check,
  CheckCircle2
} from 'lucide-react';
import AdminGallery from './components/AdminGallery';

type ViewMode = 'today' | 'pending' | 'all';

const AdminApp: React.FC = () => {
  // ใช้ timezone ประเทศไทย (UTC+7)
  const getThaiDate = () => {
    const now = new Date();
    const thaiTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    return thaiTime.toISOString().split('T')[0];
  };
  const [date, setDate] = useState(getThaiDate());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [loading, setLoading] = useState(true);

  const fetchAppointments = React.useCallback(async () => {
    setLoading(true);
    let data: Appointment[] = [];

    if (viewMode === 'today') {
      data = await firebaseService.getAppointmentsByDate(date);
    } else {
      // Fetch all for pending/all views (can be optimized later)
      const allData = await firebaseService.getAppointments();
      if (viewMode === 'pending') {
        data = allData.filter(a => a.status === 'pending' || !a.status);
      } else {
        data = allData;
      }
    }

    // Sort by date then time
    setAppointments(data.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    }));

    setTimeout(() => setLoading(false), 300);
  }, [date, viewMode]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleUpdateStatus = React.useCallback(async (id: string, status: 'confirmed' | 'cancelled') => {
    await firebaseService.updateStatus(id, status);
    fetchAppointments();
  }, [fetchAppointments]);

  const stats = React.useMemo(() => ({
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    pending: appointments.filter(a => a.status !== 'confirmed' && a.status !== 'cancelled').length,
  }), [appointments]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 px-4 py-4 md:px-8 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-rose-200">N</div>
            <h1 className="text-xl font-luxury font-bold text-slate-900">nailnan Admin</h1>
          </div>
          <button
            onClick={fetchAppointments}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-all shadow-sm border border-slate-200"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-8">

        {/* Navigation Tabs */}
        <div className="flex p-1 bg-white rounded-2xl border border-slate-200 mb-6 shadow-sm overflow-x-auto">
          <button
            onClick={() => setViewMode('today')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap
              ${viewMode === 'today' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Calendar size={16} /> วันนี้
          </button>
          <button
            onClick={() => setViewMode('pending')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap
              ${viewMode === 'pending' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <AlertCircle size={16} /> รอดำเนินการ
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all whitespace-nowrap
              ${viewMode === 'all' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <History size={16} /> ทั้งหมด
          </button>
        </div>

        {/* Filters & Info */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              {viewMode === 'today' && <Calendar size={18} className="text-rose-500" />}
              {viewMode === 'pending' && <AlertCircle size={18} className="text-amber-500" />}
              {viewMode === 'all' && <LayoutList size={18} className="text-slate-500" />}
              {viewMode === 'today' ? 'คิวงานวันนี้' : viewMode === 'pending' ? 'รายการรอยืนยัน' : 'ประวัติทั้งหมด'}
            </h3>
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
              {appointments.length}
            </span>
          </div>

          {viewMode === 'today' && (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 px-3 py-1.5 outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          )}
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <RefreshCw className="animate-spin text-rose-500" size={32} />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">กำลังโหลดข้อมูล...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border-2 border-dashed border-slate-200 text-center flex flex-col items-center">
            {viewMode === 'pending' ? (
              <CheckCircle2 size={48} className="text-emerald-200 mb-4" />
            ) : (
              <Calendar size={48} className="text-slate-200 mb-4" />
            )}
            <p className="text-slate-400 font-medium font-luxury">
              {viewMode === 'pending' ? 'เคลียร์ครบแล้ว ยอดเยี่ยม!' : 'ไม่มีรายการจอง'}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {appointments.map((app) => (
              <div key={app.id}
                className={`bg-white rounded-3xl p-5 border shadow-sm hover:border-rose-200 transition-all flex flex-col md:flex-row md:items-center gap-4 relative overflow-hidden
                  ${app.status === 'pending' || !app.status ? 'border-amber-200 shadow-amber-50' : 'border-slate-200'}
                `}
              >
                {/* Pending Indicator Strip */}
                {(app.status === 'pending' || !app.status) && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400"></div>
                )}

                {/* Date & Time Badge */}
                <div className="flex md:flex-col items-center justify-between md:justify-center md:w-24 md:border-r md:pr-6 gap-2">
                  {(viewMode !== 'today') && (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {new Date(app.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                  <span className="text-xl font-bold text-slate-800">{app.time}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${app.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                    app.status === 'cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                    {app.status || 'รอรับงาน'}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0 pl-2">
                  {app.userPicture ? (
                    <img src={app.userPicture} className="w-12 h-12 rounded-2xl border border-slate-100 object-cover shadow-sm" alt="avatar" />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                      <UserIcon size={20} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="block font-bold text-slate-800 text-lg truncate mb-0.5">{app.userName}</span>
                    <div className="flex flex-wrap gap-1">
                      {(app.services || [app.service]).map((s, i) => (
                        <span key={i} className="flex items-center gap-1.5 text-xs text-rose-500 font-bold uppercase tracking-wide bg-rose-50 px-2 py-0.5 rounded-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50 mt-2 md:mt-0">
                  {app.status !== 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(app.id!, 'confirmed')}
                      className="flex-1 md:flex-none py-2.5 px-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Check size={16} /> ยืนยัน
                    </button>
                  )}
                  {app.status !== 'cancelled' && (
                    <button
                      onClick={() => handleUpdateStatus(app.id!, 'cancelled')}
                      className="p-2.5 px-4 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl border border-slate-200 transition-all active:scale-95"
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

        <div className="my-8 border-t border-slate-200" />

        {/* Gallery Management Section */}
        <AdminGallery />
      </main>

      {/* Floating Info */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-6 py-3 rounded-full backdrop-blur-md shadow-2xl flex items-center gap-4 border border-white/10 z-50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Nailnan Live</span>
        </div>
        <div className="w-px h-3 bg-white/20"></div>
        <p className="text-[10px] font-bold opacity-70">ADMIN SYSTEM V2.5</p>
      </footer>
    </div>
  );
};

export default AdminApp;
