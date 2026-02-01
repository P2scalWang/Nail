
import React from 'react';
import { View } from '../types';
import { ArrowRight, Star, Heart, Clock } from 'lucide-react';

interface HomeProps {
  onNavigate: (view: View) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <section className="relative rounded-3xl overflow-hidden shadow-2xl shrink-0 group">
          <img
            src="/banner.jpg"
            alt="Nail Art"
            className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
          />

        </section>

        <div className="grid grid-cols-2 gap-4 shrink-0">
          <div className="bg-rose-50 p-4 rounded-2xl flex flex-col gap-2 border border-rose-100">
            <Clock className="text-rose-400" size={24} />
            <h3 className="font-semibold text-rose-900">รวดเร็ว</h3>
            <p className="text-xs text-rose-700">จองง่ายใน 1 นาที ผ่าน LINE</p>
          </div>
          <div className="bg-stone-50 p-4 rounded-2xl flex flex-col gap-2 border border-stone-100">
            <Heart className="text-stone-400" size={24} />
            <h3 className="font-semibold text-stone-900">ใส่ใจ</h3>
            <p className="text-xs text-stone-700">ใช้อุปกรณ์มาตรฐาน สะอาด</p>
          </div>
        </div>

        <section className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Star className="text-amber-400 fill-amber-400" size={20} />
            บริการยอดนิยม
          </h3>
          <div className="space-y-3">
            <div key="service-1" className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-100 shadow-sm hover:border-rose-200 transition-colors">
              <span className="font-medium">ทาสีเจลเริ่มต้น</span>
              <span className="text-rose-500 font-bold">฿250+</span>
            </div>
            <div key="service-2" className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-100 shadow-sm hover:border-rose-200 transition-colors">
              <span className="font-medium">งานเพ้น</span>
              <span className="text-rose-500 font-bold">฿450-800</span>
            </div>
            <div key="service-3" className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-100 shadow-sm hover:border-rose-200 transition-colors">
              <span className="font-medium">ต่อเล็บ</span>
              <span className="text-rose-500 font-bold">฿200</span>
            </div>
            <div key="service-4" className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-100 shadow-sm hover:border-rose-200 transition-colors">
              <span className="font-medium">ล้างสีเจล</span>
              <span className="text-rose-500 font-bold">฿100-200</span>
            </div>
          </div>
        </section>
      </div>

      <div className="p-4 pt-2 bg-stone-50/50 backdrop-blur-sm z-10 shrink-0">
        <button
          onClick={() => onNavigate(View.BOOKING)}
          className="w-full bg-rose-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-200 active:scale-95 transition-transform"
        >
          จองคิวตอนนี้
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default Home;
