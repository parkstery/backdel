import React, { useRef, useState } from 'react';
import { ActiveTab } from '../types';
import { Volume2, VolumeX, Keyboard } from 'lucide-react';

interface AnalogClockProps {
  activeTab: ActiveTab;
  currentTime: Date;
  stopwatchMs: number;
  isStopwatchRunning: boolean;
  nextAlarmTime?: { hours: number; minutes: number; seconds: number } | null;
  onInteractiveTimeChange?: (hours: number, minutes: number, seconds: number) => void;
  alarmPreviewTime?: { hours: number; minutes: number; seconds: number } | null;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onOpenShortcuts?: () => void;
}

export const AnalogClock: React.FC<AnalogClockProps> = ({
  activeTab,
  currentTime,
  stopwatchMs,
  nextAlarmTime,
  onInteractiveTimeChange,
  alarmPreviewTime,
  isMuted = false,
  onToggleMute,
  onOpenShortcuts,
}) => {
  const clockRef = useRef<SVGSVGElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Angles calculation - 초침은 1초 단위 틱(Tick)으로 움직임
  let hourAngle = 0;
  let minuteAngle = 0;
  let secondAngle = 0;

  if (activeTab === 'stopwatch') {
    const totalSeconds = Math.floor(stopwatchMs / 1000);
    const minutes = (stopwatchMs / 1000) / 60;
    const hours = minutes / 60;

    secondAngle = (totalSeconds % 60) * 6; // 360 / 60 = 6 deg/sec
    minuteAngle = (minutes % 60) * 6;
    hourAngle = (hours % 12) * 30;
  } else {
    // Clock / Alarm mode - 틱 단위로 정확히 1초씩 이동
    const displayTime = alarmPreviewTime || {
      hours: currentTime.getHours(),
      minutes: currentTime.getMinutes(),
      seconds: currentTime.getSeconds(),
    };

    const s = displayTime.seconds;
    const m = displayTime.minutes + s / 60;
    const h = (displayTime.hours % 12) + m / 60;

    secondAngle = s * 6;
    minuteAngle = m * 6;
    hourAngle = h * 30;
  }

  // Next alarm angle indicator
  let nextAlarmAngle: number | null = null;
  if (nextAlarmTime) {
    const alarmH = (nextAlarmTime.hours % 12) + nextAlarmTime.minutes / 60 + nextAlarmTime.seconds / 3600;
    nextAlarmAngle = alarmH * 30;
  }

  // Direct interaction for alarm setting
  const handlePointerInteraction = (e: React.PointerEvent<SVGSVGElement>) => {
    if (activeTab !== 'alarm' || !onInteractiveTimeChange || !clockRef.current) return;

    const rect = clockRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    let theta = Math.atan2(dx, -dy) * (180 / Math.PI);
    if (theta < 0) theta += 360;

    if (e.shiftKey) {
      const sec = Math.round((theta / 360) * 60) % 60;
      const currentH = alarmPreviewTime ? alarmPreviewTime.hours : currentTime.getHours();
      const currentM = alarmPreviewTime ? alarmPreviewTime.minutes : currentTime.getMinutes();
      onInteractiveTimeChange(currentH, currentM, sec);
    } else {
      const min = Math.round((theta / 360) * 60) % 60;
      const currentH = alarmPreviewTime ? alarmPreviewTime.hours : currentTime.getHours();
      const currentS = alarmPreviewTime ? alarmPreviewTime.seconds : 0;
      onInteractiveTimeChange(currentH, min, currentS);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (activeTab === 'alarm') {
      setIsDragging(true);
      (e.target as Element).setPointerCapture?.(e.pointerId);
      handlePointerInteraction(e);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isDragging && activeTab === 'alarm') {
      handlePointerInteraction(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as Element).releasePointerCapture?.(e.pointerId);
      } catch {
        // Safe catch
      }
    }
  };

  // Generate 60 ticks
  const ticks = Array.from({ length: 60 }).map((_, i) => {
    const isMajor = i % 5 === 0;
    const isQuarter = i % 15 === 0;
    const angle = i * 6;
    const radian = (angle * Math.PI) / 180;
    const radius = 172;
    const length = isQuarter ? 15 : isMajor ? 11 : 6;
    const width = isQuarter ? 3.5 : isMajor ? 2.5 : 1.2;

    const x1 = 200 + (radius - length) * Math.sin(radian);
    const y1 = 200 - (radius - length) * Math.cos(radian);
    const x2 = 200 + radius * Math.sin(radian);
    const y2 = 200 - radius * Math.cos(radian);

    return { x1, y1, x2, y2, angle, isMajor, isQuarter, width, key: i };
  });

  const numbers = [
    { num: 12, x: 200, y: 55 },
    { num: 1, x: 272, y: 75 },
    { num: 2, x: 327, y: 130 },
    { num: 3, x: 347, y: 205 },
    { num: 4, x: 327, y: 280 },
    { num: 5, x: 272, y: 335 },
    { num: 6, x: 200, y: 355 },
    { num: 7, x: 128, y: 335 },
    { num: 8, x: 73, y: 280 },
    { num: 9, x: 53, y: 205 },
    { num: 10, x: 73, y: 130 },
    { num: 11, x: 128, y: 75 },
  ];

  return (
    <div className="flex-1 w-full flex items-center justify-center min-h-0 select-none py-1 relative">
      {/* 좌측 상단 컨트롤: 소리켬/음소거 버튼 + 키보드 단축키 버튼 (좌측으로 이동 및 크기 통일) */}
      <div className="absolute top-0.5 left-0 z-30 flex items-center space-x-1.5">
        {onToggleMute && (
          <button
            type="button"
            onClick={onToggleMute}
            className={`w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg border transition-all flex items-center justify-center shadow-md cursor-pointer active:scale-95 ${
              isMuted
                ? 'bg-slate-900/95 border-rose-500/60 text-rose-400 hover:bg-slate-800'
                : 'bg-slate-900/95 border-emerald-500/60 text-emerald-300 hover:bg-slate-800'
            }`}
            title={isMuted ? '음소거 해제' : '음소거'}
            aria-label={isMuted ? '음소거 해제' : '음소거'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>
        )}

        {onOpenShortcuts && (
          <button
            type="button"
            onClick={onOpenShortcuts}
            className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg border border-slate-800 bg-slate-900/95 text-sky-400 hover:text-white hover:bg-slate-800 transition-all flex items-center justify-center shadow-md cursor-pointer active:scale-95"
            title="키보드 단축키 안내"
            aria-label="키보드 단축키 안내"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 원형 시계 프레임: 가용 공간을 최대로 채움 (aspect-square 1:1) */}
      <div className="relative h-full max-h-[380px] aspect-square w-auto filter drop-shadow-2xl flex items-center justify-center">
        <svg
          ref={clockRef}
          viewBox="0 0 400 400"
          className={`w-full h-full ${activeTab === 'alarm' ? 'cursor-crosshair' : 'cursor-default'}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          id="analog-chronograph-dial"
        >
          <defs>
            <radialGradient id="dialMetalBezel" cx="50%" cy="50%" r="50%">
              <stop offset="88%" stopColor="#1e293b" />
              <stop offset="95%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>

            <linearGradient id="innerDialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#090d16" />
              <stop offset="50%" stopColor="#111827" />
              <stop offset="100%" stopColor="#030712" />
            </linearGradient>

            <linearGradient id="silverHand" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            <linearGradient id="goldAlarmHand" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="50%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>

            <filter id="handShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1.5" dy="3.5" stdDeviation="2.5" floodOpacity="0.5" floodColor="#000" />
            </filter>
          </defs>

          {/* Outer Ring & Case */}
          <circle cx="200" cy="200" r="196" fill="url(#dialMetalBezel)" stroke="#475569" strokeWidth="2.5" />
          <circle cx="200" cy="200" r="186" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="2,3" opacity="0.6" />

          {/* Inner Main Dial */}
          <circle cx="200" cy="200" r="182" fill="url(#innerDialGrad)" />

          {/* Precision Seconds/Minute Track Ring */}
          <circle cx="200" cy="200" r="172" fill="none" stroke="#334155" strokeWidth="1.2" />
          <circle cx="200" cy="200" r="162" fill="none" stroke="#1e293b" strokeWidth="0.8" />

          {/* Dial Ticks */}
          {ticks.map((t) => (
            <line
              key={t.key}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke={t.isQuarter ? '#38bdf8' : t.isMajor ? '#e2e8f0' : '#64748b'}
              strokeWidth={t.width}
              strokeLinecap="round"
            />
          ))}

          {/* Dial Numbers - High contrast & large for supreme readability */}
          {numbers.map((n) => (
            <text
              key={n.num}
              x={n.x}
              y={n.y}
              fill={n.num === 12 ? '#38bdf8' : '#f8fafc'}
              fontSize={n.num === 12 ? '24' : '20'}
              fontWeight={n.num === 12 ? '800' : '700'}
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
              alignmentBaseline="middle"
              opacity="0.95"
            >
              {n.num}
            </text>
          ))}

          {/* Minimal Brand Accent */}
          <g transform="translate(200, 140)">
            <text
              x="0"
              y="0"
              fill="#64748b"
              fontSize="9"
              letterSpacing="2.5"
              fontWeight="700"
              textAnchor="middle"
            >
              CHRONO
            </text>
          </g>

          {/* Alarm Indicator Marker (if set) */}
          {nextAlarmAngle !== null && (
            <g transform={`rotate(${nextAlarmAngle} 200 200)`} opacity="0.95">
              <polygon points="196,32 204,32 200,20" fill="url(#goldAlarmHand)" filter="url(#handShadow)" />
              <line x1="200" y1="32" x2="200" y2="72" stroke="#eab308" strokeWidth="1.8" strokeDasharray="3,2" />
            </g>
          )}

          {/* Hour Hand */}
          <g transform={`rotate(${hourAngle} 200 200)`} filter="url(#handShadow)">
            <polygon
              points="195.5,215 204.5,215 202.5,102 200,92 197.5,102"
              fill="url(#silverHand)"
              stroke="#475569"
              strokeWidth="0.8"
            />
            <line x1="200" y1="180" x2="200" y2="112" stroke="#38bdf8" strokeWidth="2" opacity="0.85" />
          </g>

          {/* Minute Hand */}
          <g transform={`rotate(${minuteAngle} 200 200)`} filter="url(#handShadow)">
            <polygon
              points="196,220 204,220 202,56 200,45 198,56"
              fill="url(#silverHand)"
              stroke="#475569"
              strokeWidth="0.8"
            />
            <line x1="200" y1="190" x2="200" y2="62" stroke="#38bdf8" strokeWidth="2" opacity="0.85" />
          </g>

          {/* Second Hand: Continuous bold red needle with counterweight ring */}
          <g transform={`rotate(${secondAngle} 200 200)`} filter="url(#handShadow)">
            <line
              x1="200"
              y1="245"
              x2="200"
              y2="28"
              stroke="#ef4444"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <circle cx="200" cy="232" r="5" fill="#ef4444" />
            <polygon points="196.5,46 203.5,46 200,28" fill="#ef4444" />
          </g>

          {/* Center Pivot & Cap */}
          <circle cx="200" cy="200" r="7.5" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.5" />
          <circle cx="200" cy="200" r="3.2" fill="#ef4444" />
        </svg>
      </div>
    </div>
  );
};
