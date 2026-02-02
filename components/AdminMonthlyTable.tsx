import React from 'react';
import { Appointment } from '../types';
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';

interface AdminMonthlyTableProps {
    currentDate: Date;
    appointments: Appointment[];
    onDateChange: (date: Date) => void;
}

const TIME_SLOTS = [
    '10:00', '11:00', '12:00', '13:00', '14:00',
    '15:00', '16:00', '17:00', '18:00', '19:00'
];

const THAI_MONTHS = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const AdminMonthlyTable: React.FC<AdminMonthlyTableProps> = ({ currentDate, appointments, onDateChange }) => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

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
        onDateChange(new Date(newYear, currentDate.getMonth(), 1));
    };

    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
        years.push(i);
    }

    const renderRows = () => {
        const rows = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayApps = appointments.filter(a => a.date === dateStr && a.status !== 'cancelled');

            const dateObj = new Date(dateStr);
            const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

            rows.push(
                <tr key={day} className={`hover:bg-slate-50 ${isWeekend ? 'bg-slate-50/50' : ''}`}>
                    <td className="p-2 border border-slate-100 sticky left-0 bg-white z-10 w-24 text-center">
                        <div className="flex flex-col items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase">
                                {dateObj.toLocaleDateString('th-TH', { weekday: 'short' })}
                            </span>
                            <span className={`text-sm font-bold ${new Date().toISOString().split('T')[0] === dateStr ? 'text-rose-500' : 'text-slate-700'
                                }`}>
                                {day}
                            </span>
                        </div>
                    </td>
                    {TIME_SLOTS.map(time => {
                        const app = dayApps.find(a => a.time === time);
                        return (
                            <td key={time} className="p-1 border border-slate-100 h-16 min-w-[120px] max-w-[150px]">
                                {app ? (
                                    <div className={`w-full h-full rounded-lg p-1.5 text-xs flex flex-col justify-between overflow-hidden relative group
                    ${app.status === 'confirmed' ? 'bg-emerald-50 border border-emerald-100 text-emerald-800' :
                                            'bg-amber-50 border border-amber-100 text-amber-800'}
                  `}>
                                        <div className="font-bold truncate" title={app.userName}>{app.userName}</div>
                                        <div className="text-[10px] opacity-75 truncate">
                                            {(app.services || [app.service]).join(', ')}
                                        </div>
                                        {/* Tooltip on hover */}
                                        <div className="absolute inset-0 bg-black/80 text-white text-xs p-2 hidden group-hover:flex flex-col z-20 overflow-auto whitespace-normal">
                                            <span className="font-bold">{app.userName}</span>
                                            <span>{app.services?.join(', ') || app.service}</span>
                                            <span className="mt-auto pt-1 text-[10px] opacity-70">{app.status}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full"></div>
                                )}
                            </td>
                        );
                    })}
                </tr>
            );
        }
        return rows;
    };

    return (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shadow-sm z-20">
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
            <div className="overflow-auto flex-1">
                <table className="w-full border-collapse">
                    <thead className="bg-slate-50 sticky top-0 z-20 shadow-sm">
                        <tr>
                            <th className="p-3 border border-slate-200 text-slate-500 font-bold text-xs sticky left-0 bg-slate-50 z-30 w-24">
                                วันที่ / เวลา
                            </th>
                            {TIME_SLOTS.map(time => (
                                <th key={time} className="p-3 border border-slate-200 text-slate-500 font-bold text-xs min-w-[120px]">
                                    {time}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {renderRows()}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminMonthlyTable;
