import React from 'react';
import { Play, Pause, RotateCcw, Flag } from 'lucide-react';
import { LapTime } from '../types';
import { formatStopwatchMs } from '../utils/formatters';

interface StopwatchControlsProps {
  stopwatchMs: number;
  isRunning: boolean;
  laps: LapTime[];
  onStartPause: () => void;
  onLap: () => void;
  onReset: () => void;
}

export const StopwatchControls: React.FC<StopwatchControlsProps> = ({
  stopwatchMs,
  isRunning,
  laps,
  onStartPause,
  onLap,
  onReset,
}) => {
  const { hoursStr, minutesStr, secondsStr, hundredthsStr } = formatStopwatchMs(stopwatchMs);

  let fastestLapId: string | null = null;
  let slowestLapId: string | null = null;
  if (laps.length >= 2) {
    const sorted = [...laps].sort((a, b) => a.lapDiffMs - b.lapDiffMs);
    fastestLapId = sorted[0].id;
    slowestLapId = sorted[sorted.length - 1].id;
  }

  return (
    <div className="flex flex-col h-full space-y-2 min-h-0">
      {/* Digital Display - High visibility, clean font */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-xl py-1.5 px-3 shadow-inner flex items-center justify-center shrink-0">
        <div className="flex items-baseline font-mono tracking-tight text-white select-all">
          <span className="text-3xl sm:text-4xl font-bold text-slate-100">{hoursStr}</span>
          <span className="text-2xl sm:text-3xl text-sky-400 mx-1">:</span>
          <span className="text-3xl sm:text-4xl font-bold text-slate-100">{minutesStr}</span>
          <span className="text-2xl sm:text-3xl text-sky-400 mx-1">:</span>
          <span className="text-3xl sm:text-4xl font-bold text-slate-100">{secondsStr}</span>
          <span className="text-xl sm:text-2xl text-sky-400 ml-1.5 font-bold">.{hundredthsStr}</span>
        </div>
      </div>

      {/* Action Buttons: Ergonomic touch targets, clear icons */}
      <div className="grid grid-cols-3 gap-2 shrink-0">
        {/* Lap Button */}
        <button
          id="btn-stopwatch-lap"
          onClick={onLap}
          disabled={!isRunning}
          className={`flex items-center justify-center py-2.5 px-3 rounded-xl border font-bold transition-all shadow-sm ${
            isRunning
              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-sky-300 active:scale-95 cursor-pointer'
              : 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
          }`}
          title="랩 [L]"
          aria-label="랩 기록"
        >
          <Flag className="w-4 h-4 mr-1.5 text-sky-400" />
          <span className="text-sm font-semibold">랩</span>
        </button>

        {/* Start / Pause Button - Most prominent */}
        <button
          id="btn-stopwatch-toggle"
          onClick={onStartPause}
          className={`flex items-center justify-center py-2.5 px-3 rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
          }`}
          title={isRunning ? '일시정지 [Space]' : '시작 [Space]'}
          aria-label={isRunning ? '일시정지' : '시작'}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 fill-current mr-1.5" />
              <span className="text-sm font-bold">정지</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current mr-1.5" />
              <span className="text-sm font-bold">시작</span>
            </>
          )}
        </button>

        {/* Reset Button */}
        <button
          id="btn-stopwatch-reset"
          onClick={onReset}
          disabled={stopwatchMs === 0 && laps.length === 0}
          className={`flex items-center justify-center py-2.5 px-3 rounded-xl border font-bold transition-all shadow-sm ${
            stopwatchMs > 0 || laps.length > 0
              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-rose-300 active:scale-95 cursor-pointer'
              : 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
          }`}
          title="초기화 [R]"
          aria-label="초기화"
        >
          <RotateCcw className="w-4 h-4 mr-1.5 text-rose-400" />
          <span className="text-sm font-semibold">리셋</span>
        </button>
      </div>

      {/* Lap Times Table: Flex-1 to naturally fill remaining vertical container space */}
      <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 flex flex-col min-h-0 overflow-hidden">
        {/* Table Header: 1포인트 크게 (text-sm font-bold) */}
        <div className="grid grid-cols-12 pb-1.5 border-b border-slate-800 text-sm text-slate-300 font-bold px-2 shrink-0">
          <span className="col-span-4">랩</span>
          <span className="col-span-4 text-center">구간 차이</span>
          <span className="col-span-4 text-right">총 시간</span>
        </div>

        {/* Table Body - smooth internal scroll without pushing page layout */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pt-1.5 pr-1 min-h-0">
          {laps.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs py-4">
              <span>기록된 랩이 없습니다</span>
            </div>
          ) : (
            laps.map((lap) => {
              const diffFmt = formatStopwatchMs(lap.lapDiffMs);
              const totalFmt = formatStopwatchMs(lap.timeMs);
              const isFastest = fastestLapId === lap.id;
              const isSlowest = slowestLapId === lap.id;

              return (
                <div
                  key={lap.id}
                  className={`grid grid-cols-12 items-center text-base sm:text-lg py-1.5 px-2.5 rounded-lg font-mono border ${
                    isFastest
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                      : isSlowest
                      ? 'bg-rose-950/40 text-rose-300 border-rose-800/60'
                      : 'bg-slate-800/50 text-slate-200 border-slate-700/60'
                  }`}
                >
                  <div className="col-span-4 flex items-center space-x-1">
                    <span className="font-bold text-white">
                      #{lap.lapNumber.toString().padStart(2, '0')}
                    </span>
                    {isFastest && (
                      <span className="text-xs font-sans font-bold bg-emerald-500/25 text-emerald-300 px-1 rounded">
                        최고
                      </span>
                    )}
                    {isSlowest && (
                      <span className="text-xs font-sans font-bold bg-rose-500/25 text-rose-300 px-1 rounded">
                        최저
                      </span>
                    )}
                  </div>

                  <div className="col-span-4 text-center font-bold tracking-tight text-slate-200">
                    +{diffFmt.minutesStr}:{diffFmt.secondsStr}.{diffFmt.hundredthsStr}
                  </div>

                  <div className="col-span-4 text-right font-extrabold text-white">
                    {totalFmt.hoursStr !== '00' ? `${totalFmt.hoursStr}:` : ''}
                    {totalFmt.minutesStr}:{totalFmt.secondsStr}.{totalFmt.hundredthsStr}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
