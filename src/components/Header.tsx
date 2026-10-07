import React from 'react';
import { Compass } from 'lucide-react';
import { formatTime } from '../utils/formatters';

interface HeaderProps {
  currentTime: Date;
}

export const Header: React.FC<HeaderProps> = ({ currentTime }) => {
  const formattedTime = formatTime(
    currentTime.getHours(),
    currentTime.getMinutes(),
    currentTime.getSeconds()
  );

  // 오늘 날짜 포맷팅: 항상 선명하게 표시 (예: 2026.09.29 (화))
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const year = currentTime.getFullYear();
  const month = (currentTime.getMonth() + 1).toString().padStart(2, '0');
  const date = currentTime.getDate().toString().padStart(2, '0');
  const dayName = days[currentTime.getDay()];
  const formattedDate = `${year}.${month}.${date} (${dayName})`;

  return (
    <header className="w-full flex items-center justify-between pb-1.5 border-b border-slate-800/80 shrink-0 select-none">
      {/* 왼쪽: 로고 및 EZ-TIME 타이틀 + 이동된 날짜 텍스트 */}
      <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
            <Compass className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white animate-spin-slow" />
          </div>
          <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            EZ-TIME
          </h1>
        </div>

        <span className="text-slate-700 font-semibold select-none">|</span>

        {/* 오늘 날짜 (왼쪽으로 위치 이동) */}
        <span className="text-xs sm:text-sm font-sans font-medium text-slate-300 shrink-0">
          {formattedDate}
        </span>
      </div>

      {/* 오른쪽: 실시간 디지털 시간 (오른쪽 정렬) */}
      <div className="flex items-center shrink-0">
        <div className="bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-lg text-amber-300 font-mono text-base sm:text-lg font-bold tracking-tight shadow-inner">
          <span>{formattedTime}</span>
        </div>
      </div>
    </header>
  );
};

