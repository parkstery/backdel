import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-4 shadow-2xl relative">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-1.5 text-white font-bold text-xs">
            <Keyboard className="w-3.5 h-3.5 text-sky-400" />
            <span>키보드 단축키</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="py-3 space-y-2 text-xs text-slate-300">
          <div className="grid grid-cols-2 gap-1.5 font-mono">
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800 flex justify-between">
              <span className="text-slate-400 font-sans">시작/정지</span>
              <span className="text-amber-400 font-bold">[Space]</span>
            </div>
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800 flex justify-between">
              <span className="text-slate-400 font-sans">랩 기록</span>
              <span className="text-sky-400 font-bold">[L]</span>
            </div>
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800 flex justify-between">
              <span className="text-slate-400 font-sans">초기화</span>
              <span className="text-rose-400 font-bold">[R]</span>
            </div>
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800 flex justify-between">
              <span className="text-slate-400 font-sans">음소거 토글</span>
              <span className="text-purple-400 font-bold">[M]</span>
            </div>
            <div className="bg-slate-950 p-1.5 rounded border border-slate-800 flex justify-between col-span-2">
              <span className="text-slate-400 font-sans">모드 전환</span>
              <span className="text-emerald-400 font-bold">[1] 스톱워치 / [2] 알람</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-1">
            • 알람 다이얼 드래그 또는 휠 스크롤로 초단위 변경 가능
          </div>
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
