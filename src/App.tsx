import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ActiveTab, LapTime, AlarmItem, TimeInputState, AlarmType } from './types';
import { AnalogClock } from './components/AnalogClock';
import { StopwatchControls } from './components/StopwatchControls';
import { AlarmControls } from './components/AlarmControls';
import { AlarmRingingBanner } from './components/AlarmRingingBanner';
import { Header } from './components/Header';
import { ShortcutsModal } from './components/ShortcutsModal';
import { soundEngine } from './utils/audio';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Timer, Bell } from 'lucide-react';
import { formatTime } from './utils/formatters';

const ALARM_STORAGE_KEY = 'precision_analog_clock_alarms_v2';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('stopwatch');
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);

  // Real-time Clock state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Stopwatch state
  const [stopwatchMs, setStopwatchMs] = useState<number>(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<LapTime[]>([]);
  const stopwatchStartRef = useRef<number>(0);
  const stopwatchAccumulatedRef = useRef<number>(0);
  const stopwatchRafRef = useRef<number | null>(null);

  // Alarm state: 'time' (시각) vs 'timer' (시간/타이머)
  const [alarmMode, setAlarmMode] = useState<AlarmType>('time');
  const [isAlarmListExpanded, setIsAlarmListExpanded] = useState<boolean>(false);

  const [alarms, setAlarms] = useState<AlarmItem[]>(() => {
    try {
      const saved = localStorage.getItem(ALARM_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    const initDate = new Date();
    initDate.setMinutes(initDate.getMinutes() + 1);
    return [
      {
        id: 'default-1',
        hours: initDate.getHours(),
        minutes: initDate.getMinutes(),
        seconds: 0,
        label: '시각 알람',
        enabled: true,
        createdAt: Date.now(),
        alarmType: 'time',
      },
    ];
  });

  const [currentSetting, setCurrentSetting] = useState<TimeInputState>(() => {
    const d = new Date();
    return {
      hours: d.getHours(),
      minutes: (d.getMinutes() + 5) % 60,
      seconds: 0,
    };
  });

  const [ringingAlarm, setRingingAlarm] = useState<AlarmItem | null>(null);

  // Persist alarms
  useEffect(() => {
    try {
      localStorage.setItem(ALARM_STORAGE_KEY, JSON.stringify(alarms));
    } catch {
      // ignore
    }
  }, [alarms]);

  // Real-time Clock & Alarm Ringing Loop
  useEffect(() => {
    let animId: number;
    let lastSecond = -1;

    const tick = () => {
      const now = new Date();
      setCurrentTime(now);

      const curSec = now.getSeconds();
      if (curSec !== lastSecond) {
        lastSecond = curSec;
        if (!isStopwatchRunning) {
          soundEngine.playTick(curSec % 5 === 0);
        }
      }

      const nowTimestamp = now.getTime();

      alarms.forEach((alarm) => {
        if (!alarm.enabled || ringingAlarm) return;

        if (alarm.alarmType === 'timer') {
          // '시간' (타이머) 모드: targetTimestamp 도달 시 발동
          if (alarm.targetTimestamp && nowTimestamp >= alarm.targetTimestamp) {
            setRingingAlarm(alarm);
            soundEngine.startAlarmSound();
          }
        } else {
          // '시각' 모드: 특정 시/분/초 일치 시 발동
          if (
            alarm.hours === now.getHours() &&
            alarm.minutes === now.getMinutes() &&
            alarm.seconds === now.getSeconds()
          ) {
            setRingingAlarm(alarm);
            soundEngine.startAlarmSound();
          }
        }
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [alarms, ringingAlarm, isStopwatchRunning]);

  // Stopwatch Loop via requestAnimationFrame
  const updateStopwatch = useCallback(() => {
    if (!isStopwatchRunning) return;
    const now = performance.now();
    const elapsed = now - stopwatchStartRef.current + stopwatchAccumulatedRef.current;
    setStopwatchMs(elapsed);
    stopwatchRafRef.current = requestAnimationFrame(updateStopwatch);
  }, [isStopwatchRunning]);

  useEffect(() => {
    if (isStopwatchRunning) {
      stopwatchStartRef.current = performance.now();
      stopwatchRafRef.current = requestAnimationFrame(updateStopwatch);
    } else {
      if (stopwatchRafRef.current) {
        cancelAnimationFrame(stopwatchRafRef.current);
      }
    }
    return () => {
      if (stopwatchRafRef.current) cancelAnimationFrame(stopwatchRafRef.current);
    };
  }, [isStopwatchRunning, updateStopwatch]);

  // Stopwatch actions
  const handleStopwatchToggle = () => {
    soundEngine.playClick();
    if (isStopwatchRunning) {
      const now = performance.now();
      stopwatchAccumulatedRef.current += now - stopwatchStartRef.current;
      setIsStopwatchRunning(false);
    } else {
      stopwatchStartRef.current = performance.now();
      setIsStopwatchRunning(true);
    }
  };

  const handleStopwatchLap = () => {
    if (!isStopwatchRunning) return;
    soundEngine.playClick();
    const currentMs = stopwatchMs;
    const prevMs = laps.length > 0 ? laps[0].timeMs : 0;
    const lapDiff = laps.length > 0 ? currentMs - prevMs : currentMs;

    const newLap: LapTime = {
      id: `${Date.now()}-${laps.length + 1}`,
      lapNumber: laps.length + 1,
      timeMs: currentMs,
      lapDiffMs: lapDiff,
      recordedAt: Date.now(),
    };

    setLaps([newLap, ...laps]);
  };

  const handleStopwatchReset = () => {
    soundEngine.playClick();
    setIsStopwatchRunning(false);
    setStopwatchMs(0);
    stopwatchAccumulatedRef.current = 0;
    setLaps([]);
  };

  // Alarm actions
  const handleAddAlarm = (
    hours: number,
    minutes: number,
    seconds: number,
    label: string,
    mode: AlarmType
  ) => {
    soundEngine.playClick();

    let targetTimestamp: number | undefined;
    let durationSeconds: number | undefined;

    if (mode === 'timer') {
      const totalSec = hours * 3600 + minutes * 60 + seconds;
      if (totalSec <= 0) return; // 0초 타이머 방지
      durationSeconds = totalSec;
      targetTimestamp = Date.now() + totalSec * 1000;
    }

    const defaultLabel =
      label ||
      (mode === 'timer'
        ? `${formatTime(hours, minutes, seconds)} 후 알람`
        : `${formatTime(hours, minutes, seconds)} 시각 알람`);

    const newAlarm: AlarmItem = {
      id: `alarm-${Date.now()}`,
      hours,
      minutes,
      seconds,
      label: defaultLabel,
      enabled: true,
      createdAt: Date.now(),
      alarmType: mode,
      targetTimestamp,
      durationSeconds,
    };
    setAlarms((prev) => [newAlarm, ...prev]);
  };

  const handleToggleAlarm = (id: string) => {
    soundEngine.playClick();
    setAlarms((prev) =>
      prev.map((al) => {
        if (al.id !== id) return al;
        const willEnable = !al.enabled;
        let newTargetTimestamp = al.targetTimestamp;
        // 타이머 모드 알람을 다시 켤 때 현재 시점부터 재시작
        if (willEnable && al.alarmType === 'timer' && al.durationSeconds) {
          newTargetTimestamp = Date.now() + al.durationSeconds * 1000;
        }
        return {
          ...al,
          enabled: willEnable,
          targetTimestamp: newTargetTimestamp,
        };
      })
    );
  };

  const handleDeleteAlarm = (id: string) => {
    soundEngine.playClick();
    setAlarms((prev) => prev.filter((al) => al.id !== id));
  };

  const handleDismissAlarm = () => {
    soundEngine.stopAlarmSound();
    soundEngine.playClick();
    if (ringingAlarm) {
      setAlarms((prev) =>
        prev.map((a) => (a.id === ringingAlarm.id ? { ...a, enabled: false } : a))
      );
      setRingingAlarm(null);
    }
  };

  const handleSnooze = (minutes: number) => {
    soundEngine.stopAlarmSound();
    soundEngine.playClick();
    if (ringingAlarm) {
      const now = new Date();
      now.setMinutes(now.getMinutes() + minutes);
      const snoozedAlarm: AlarmItem = {
        id: `snooze-${Date.now()}`,
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds(),
        label: `${ringingAlarm.label} (${minutes}분 스누즈)`,
        enabled: true,
        createdAt: Date.now(),
        alarmType: 'time',
      };
      setAlarms((prev) => [
        snoozedAlarm,
        ...prev.map((a) => (a.id === ringingAlarm.id ? { ...a, enabled: false } : a)),
      ]);
      setRingingAlarm(null);
    }
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundEngine.setMuted(nextMute);
  };

  const handleInteractiveTimeChange = (hours: number, minutes: number, seconds: number) => {
    setCurrentSetting({ hours, minutes, seconds });
  };

  const handleAlarmModeChange = (mode: AlarmType) => {
    setAlarmMode(mode);
    soundEngine.playClick();
    if (mode === 'timer') {
      // 시간(타이머) 모드로 전환 시 직관적으로 00시 03분 00초 기본값 세팅
      setCurrentSetting({ hours: 0, minutes: 3, seconds: 0 });
    } else {
      // 시각 모드로 전환 시 현재 시각 + 5분 기본값 세팅
      const now = new Date();
      now.setMinutes(now.getMinutes() + 5);
      setCurrentSetting({
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: 0,
      });
    }
  };

  const nextActiveAlarm = alarms.find((a) => a.enabled && a.alarmType !== 'timer') || null;

  useKeyboardShortcuts({
    activeTab,
    setActiveTab,
    onStopwatchToggle: handleStopwatchToggle,
    onStopwatchLap: handleStopwatchLap,
    onStopwatchReset: handleStopwatchReset,
    onMuteToggle: handleToggleMute,
    onDismissAlarm: handleDismissAlarm,
    isAlarmRinging: !!ringingAlarm,
  });

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-2 sm:p-3 font-sans select-none overflow-hidden">
      {/* Active Alarm Banner */}
      {ringingAlarm && (
        <AlarmRingingBanner
          ringingAlarm={ringingAlarm}
          onDismiss={handleDismissAlarm}
          onSnooze={handleSnooze}
        />
      )}

      {/* Main Container - Full height, zero-scroll mobile vertical priority */}
      <main className="w-full max-w-md h-full flex flex-col bg-slate-900/80 border border-slate-800/90 rounded-2xl p-2.5 sm:p-3 shadow-2xl backdrop-blur-md overflow-hidden min-h-0">
        {/* Single Row Clean Header: EZ-TIME + Date/Time + Keyboard Shortcut Icon on the right */}
        <Header currentTime={currentTime} />

        {/* Analog Dial (Maximized): utilizes corner empty spaces for Sweep & Sound buttons */}
        <div className={`flex flex-col items-center justify-center min-h-0 py-0.5 overflow-hidden transition-all duration-300 ease-in-out ${
          activeTab === 'alarm'
            ? isAlarmListExpanded
              ? 'h-0 opacity-0 py-0 overflow-hidden shrink-0'
              : 'flex-[0.9] max-h-[46%]'
            : 'flex-1'
        }`}>
          <AnalogClock
            activeTab={activeTab}
            currentTime={currentTime}
            stopwatchMs={stopwatchMs}
            isStopwatchRunning={isStopwatchRunning}
            nextAlarmTime={nextActiveAlarm}
            alarmPreviewTime={activeTab === 'alarm' && alarmMode === 'time' ? currentSetting : null}
            onInteractiveTimeChange={handleInteractiveTimeChange}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onOpenShortcuts={() => setShowShortcuts(true)}
          />
        </div>

        {/* Tab Switcher - Simple and compact */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0 mb-1.5">
          <button
            type="button"
            id="tab-btn-stopwatch"
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('stopwatch');
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'stopwatch'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>스톱워치</span>
          </button>

          <button
            type="button"
            id="tab-btn-alarm"
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('alarm');
            }}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === 'alarm'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>알람</span>
          </button>
        </div>

        {/* Controls Deck - Flexible height, perfectly fills remaining space with no dead empty gaps */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {activeTab === 'stopwatch' ? (
            <StopwatchControls
              stopwatchMs={stopwatchMs}
              isRunning={isStopwatchRunning}
              laps={laps}
              onStartPause={handleStopwatchToggle}
              onLap={handleStopwatchLap}
              onReset={handleStopwatchReset}
            />
          ) : (
            <AlarmControls
              alarms={alarms}
              currentSetting={currentSetting}
              onSettingChange={setCurrentSetting}
              onAddAlarm={handleAddAlarm}
              onToggleAlarm={handleToggleAlarm}
              onDeleteAlarm={handleDeleteAlarm}
              alarmMode={alarmMode}
              onAlarmModeChange={handleAlarmModeChange}
              currentTime={currentTime}
              isListExpanded={isAlarmListExpanded}
              onToggleListExpanded={() => {
                soundEngine.playClick();
                setIsAlarmListExpanded((prev) => !prev);
              }}
            />
          )}
        </div>
      </main>

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}
