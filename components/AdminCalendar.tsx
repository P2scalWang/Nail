import React, { useMemo } from 'react';
import { Appointment } from '../types';
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';

interface AdminCalendarProps {
    currentDate: Date;
    onDateChange: (date: Date) => void;
    appointments: Appointment[];
    onSelectDate: (dateString: string) => void;
}

const THAI_MONTHS = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const AdminCalendar: React.FC<AdminCalendarProps> = ({ currentDate, onDateChange, appointments, onSelectDate }) => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const handlePrevMonth = () => {
        onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        onDateChange(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMonth = parseInt(e.target.value);
        onDateChange(new Date(currentDate.getFullYear(), newMonth, 1));
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newYear = parseInt(e.target.value);
        // 543 is for Thai Buddhist Calendar display, but value is Gregorian
        onDateChange(new Date(newYear, currentDate.getMonth(), 1));
    };

    const currentYear = new Date().getFullYear(); // Use current real year for range generation
    const years = [];
    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
        years.push(i);
    }

    // Group appointments by date
    const appointmentsByDate = useMemo(() => {
        const map: Record<string, Appointment[]> = {};
        appointments.forEach(app => {
            if (!map[app.date]) map[app.date] = [];
            map[app.date].push(app);
        });
        return map;
    }, [appointments]);

    const renderDays = () => {
        const days = [];
        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 bg-slate-50/50 border border-slate-100/50"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayApps = appointmentsByDate[dateStr] || [];
            const confirmedCount = dayApps.filter(a => a.status === 'confirmed').length;
            const pendingCount = dayApps.filter(a => a.status === 'pending' || a.status === undefined).length;
            const cancelledCount = dayApps.filter(a => a.status === 'cancelled').length;

            days.push(
                <div
                    key={day}
                    onClick={() => onSelectDate(dateStr)}
                    className={`h-24 border border-slate-100 p-1 relative cursor-pointer transition-all hover:bg-rose-50 hover:shadow-inner group ${new Date().toISOString().split('T')[0] === dateStr ? 'bg-indigo-50/30' : 'bg-white'
                        }`}
                >
                    <span className={`text-sm font-bold block mb-1 w-6 h-6 flex items-center justify-center rounded-full ${new Date().toISOString().split('T')[0] === dateStr ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-700'
                        }`}>
                        {day}
                    </span>

                    <div className="flex flex-col gap-0.5">
                        {confirmedCount > 0 && (
                            <div className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded flex justify-between items-center font-bold">
                                <span>คิวชัวร์</span>
                                <span>{confirmedCount}</span>
                            </div>
                        )}
                        {pendingCount > 0 && (
                            <div className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded flex justify-between items-center font-bold animate-pulse">
                                <span>รอคอนเฟิร์ม</span>
                                <span>{pendingCount}</span>
                            </div>
                        )}
                        {cancelledCount > 0 && (
                            <div className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded flex justify-between items-center opacity-60">
                                <span>ยกเลิก</span>
                                <span>{cancelledCount}</span>
                            </div>
                        )}
                    </div>
                </div>
            );
        }
        return days;
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <select
                        value={currentDate.getMonth()}
                        onChange={handleMonthChange}
                        className="bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg focus:ring-rose-500 focus:border-rose-500 block p-2 cursor-pointer hover:bg-slate-50"
                    >
                        {THAI_MONTHS.map((month, index) => (
                            <option key={index} value={index}>{month}</option>
                        ))}
                    </select>
                    <select
                        value={currentDate.getFullYear()}
                        onChange={handleYearChange}
                        className="bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg focus:ring-rose-500 focus:border-rose-500 block p-2 cursor-pointer hover:bg-slate-50"
                    >
                        {years.map(year => (
                            <option key={year} value={year}>{year + 543}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-1">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 text-center bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 py-2">
                <div className="text-red-500">อา.</div>
                <div>จ.</div>
                <div>อ.</div>
                <div>พ.</div>
                <div>พฤ.</div>
                <div>ศ.</div>
                <div className="text-blue-500">ส.</div>
            </div>

            <div className="grid grid-cols-7">
                {renderDays()}
            </div>
        </div>
    );
};

export default AdminCalendar;
