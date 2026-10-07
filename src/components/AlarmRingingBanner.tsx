import React from 'react';
import { BellRing, VolumeX, RotateCw, AlertTriangle } from 'lucide-react';
import { AlarmItem } from '../types';
import { formatTime } from '../utils/formatters';

interface AlarmRingingBannerProps {
  ringingAlarm: AlarmItem;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
}

export const AlarmRingingBanner: React.FC<AlarmRingingBannerProps> = ({
  ringingAlarm,
  onDismiss,
  onSnooze,
}) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-bounce">
      <div className="bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 text-white p-4 rounded-2xl shadow-2xl border-2 border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-white/20 rounded-full animate-spin">
            <BellRing className="w-7 h-7 text-yellow-200" />
          </div>
          <div>
            <div className="text-xs font-semibold text-amber-200 uppercase tracking-wider flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>알람 시각 도달!</span>
            </div>
            <div className="text-xl font-bold font-mono">
              {formatTime(ringingAlarm.hours, ringingAlarm.minutes, ringingAlarm.seconds)}
            </div>
            <div className="text-xs text-white/90 truncate max-w-[200px]">
              {ringingAlarm.label}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => onSnooze(5)}
            className="px-3 py-2 bg-black/30 hover:bg-black/50 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all flex items-center space-x-1 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>5분 스누즈</span>
          </button>
          <button
            onClick={onDismiss}
            className="px-4 py-2 bg-white text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-xl shadow-lg transition-all flex items-center space-x-1 cursor-pointer"
          >
            <VolumeX className="w-4 h-4" />
            <span>알람 끄기 (Esc)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
