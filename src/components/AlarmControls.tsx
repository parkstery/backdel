import React, { useRef, useState } from 'react';
import {
  Plus,
  Trash2,
  Sliders,
  Hash,
  ChevronUp,
  ChevronDown,
  Clock,
  Hourglass,
  RotateCcw,
} from 'lucide-react';
import { AlarmItem, TimeInputState, AlarmType } from '../types';
import { formatTime } from '../utils/formatters';

interface AlarmControlsProps {
  alarms: AlarmItem[];
  currentSetting: TimeInputState;
  onSettingChange: (newSetting: TimeInputState) => void;
  onAddAlarm: (
    hours: number,
    minutes: number,
    seconds: number,
    label: string,
    alarmType: AlarmType
  ) => void;
  onToggleAlarm: (id: string) => void;
  onDeleteAlarm: (id: string) => void;
  alarmMode: AlarmType;
  onAlarmModeChange: (mode: AlarmType) => void;
  currentTime: Date;
  isListExpanded?: boolean;
  onToggleListExpanded?: () => void;
}

export const AlarmControls: React.FC<AlarmControlsProps> = ({
  alarms,
  currentSetting,
  onSettingChange,
  onAddAlarm,
  onToggleAlarm,
  onDeleteAlarm,
  alarmMode,
  onAlarmModeChange,
  currentTime,
  isListExpanded = false,
  onToggleListExpanded,
}) => {
  const [inputMode, setInputMode] = useState<'both' | 'digital' | 'slider'>('both');
  const [alarmLabel, setAlarmLabel] = useState<string>('');

  const hourInputRef = useRef<HTMLInputElement>(null);
  const minInputRef = useRef<HTMLInputElement>(null);
  const secInputRef = useRef<HTMLInputElement>(null);

  const updateHours = (val: number) => {
    const clamped = Math.max(0, Math.min(23, isNaN(val) ? 0 : val));
    onSettingChange({ ...currentSetting, hours: clamped });
  };

  const updateMinutes = (val: number) => {
    const clamped = Math.max(0, Math.min(59, isNaN(val) ? 0 : val));
    onSettingChange({ ...currentSetting, minutes: clamped });
  };

  const updateSeconds = (val: number) => {
    const clamped = Math.max(0, Math.min(59, isNaN(val) ? 0 : val));
    onSettingChange({ ...currentSetting, seconds: clamped });
  };

  const handleWheel = (e: React.WheelEvent, type: 'hours' | 'minutes' | 'seconds') => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1 : -1;
    if (type === 'hours') {
      updateHours((currentSetting.hours + delta + 24) % 24);
    } else if (type === 'minutes') {
      updateMinutes((currentSetting.minutes + delta + 60) % 60);
    } else if (type === 'seconds') {
      updateSeconds((currentSetting.seconds + delta + 60) % 60);
    }
  };

  const handleDigitKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: 'hours' | 'minutes' | 'seconds'
  ) => {
    const step = e.shiftKey ? 10 : 1;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (type === 'hours') updateHours((currentSetting.hours + step) % 24);
      if (type === 'minutes') updateMinutes((currentSetting.minutes + step) % 60);
      if (type === 'seconds') updateSeconds((currentSetting.seconds + step) % 60);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (type === 'hours') updateHours((currentSetting.hours - step + 24) % 24);
      if (type === 'minutes') updateMinutes((currentSetting.minutes - step + 60) % 60);
      if (type === 'seconds') updateSeconds((currentSetting.seconds - step + 60) % 60);
    } else if (e.key === 'ArrowRight' && (e.target as HTMLInputElement).selectionEnd === 2) {
      if (type === 'hours') minInputRef.current?.focus();
      if (type === 'minutes') secInputRef.current?.focus();
    } else if (e.key === 'ArrowLeft' && (e.target as HTMLInputElement).selectionStart === 0) {
      if (type === 'seconds') minInputRef.current?.focus();
      if (type === 'minutes') hourInputRef.current?.focus();
    }
  };

  const handleDigitChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'hours' | 'minutes' | 'seconds') => {
    const raw = e.target.value.replace(/\D/g, '').slice(-2);
    const num = parseInt(raw, 10);
    if (type === 'hours') {
      updateHours(num);
      if (raw.length === 2 && num >= 0 && num <= 23) {
        minInputRef.current?.focus();
        minInputRef.current?.select();
      }
    } else if (type === 'minutes') {
      updateMinutes(num);
      if (raw.length === 2 && num >= 0 && num <= 59) {
        secInputRef.current?.focus();
        secInputRef.current?.select();
      }
    } else if (type === 'seconds') {
      updateSeconds(num);
    }
  };

  const handleQuickAdd = (secondsToAdd: number) => {
    const totalSec = currentSetting.hours * 3600 + currentSetting.minutes * 60 + currentSetting.seconds + secondsToAdd;
    const normSec = (totalSec + 86400) % 86400;
    const h = Math.floor(normSec / 3600);
    const m = Math.floor((normSec % 3600) / 60);
    const s = normSec % 60;
    onSettingChange({ hours: h, minutes: m, seconds: s });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onAddAlarm(
      currentSetting.hours,
      currentSetting.minutes,
      currentSetting.seconds,
      alarmLabel.trim(),
      alarmMode
    );
    setAlarmLabel('');
  };

  return (
    <div className="flex flex-col h-full space-y-2 min-h-0">
      {/* Top Setting Block */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 shadow-sm flex flex-col space-y-1.5 shrink-0">
        {/* Toolbar: [시각 | 시간] Mode Switcher on the left, Input Style on the right */}
        <div className="flex items-center justify-between gap-1.5">
          {/* Mode Switch: '시각' vs '시간' - 1포인트 크게 (text-sm) */}
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-sm">
            <button
              type="button"
              onClick={() => onAlarmModeChange('time')}
              className={`px-2.5 py-1 rounded font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                alarmMode === 'time'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="특정 시각에 알람 (예: 14시 30분 00초)"
            >
              <Clock className="w-4 h-4" />
              <span>시각</span>
            </button>
            <button
              type="button"
              onClick={() => onAlarmModeChange('timer')}
              className={`px-2.5 py-1 rounded font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                alarmMode === 'timer'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="설정한 시간 경과 후 알람 (예: 3분 00초 후)"
            >
              <Hourglass className="w-4 h-4" />
              <span>시간</span>
            </button>
          </div>

          {/* Input style selector: 1포인트 크게 (text-xs) */}
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setInputMode('digital')}
              className={`px-2 py-0.5 rounded flex items-center space-x-1 cursor-pointer ${
                inputMode === 'digital' ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-400'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>디지털</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('slider')}
              className={`px-2 py-0.5 rounded flex items-center space-x-1 cursor-pointer ${
                inputMode === 'slider' ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-400'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>슬라이더</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('both')}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                inputMode === 'both' ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-400'
              }`}
            >
              전체
            </button>
          </div>
        </div>

        {/* 1. DIGITAL INPUT SECTION */}
        {(inputMode === 'digital' || inputMode === 'both') && (
          <div className="relative flex items-center justify-center py-1 px-2 bg-slate-950/80 border border-slate-800/80 rounded-lg">
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Hours */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => updateHours((currentSetting.hours + 1) % 24)}
                  className="p-0.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <input
                  ref={hourInputRef}
                  type="text"
                  inputMode="numeric"
                  value={currentSetting.hours.toString().padStart(2, '0')}
                  onChange={(e) => handleDigitChange(e, 'hours')}
                  onKeyDown={(e) => handleDigitKeyDown(e, 'hours')}
                  onWheel={(e) => handleWheel(e, 'hours')}
                  className="w-12 sm:w-14 h-9 text-center text-2xl font-mono font-bold bg-slate-900 border border-slate-700 rounded text-amber-300 outline-none select-all"
                />
                <button
                  type="button"
                  onClick={() => updateHours((currentSetting.hours - 1 + 24) % 24)}
                  className="p-0.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-xl font-mono font-bold text-slate-600">:</span>

              {/* Minutes */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => updateMinutes((currentSetting.minutes + 1) % 60)}
                  className="p-0.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <input
                  ref={minInputRef}
                  type="text"
                  inputMode="numeric"
                  value={currentSetting.minutes.toString().padStart(2, '0')}
                  onChange={(e) => handleDigitChange(e, 'minutes')}
                  onKeyDown={(e) => handleDigitKeyDown(e, 'minutes')}
                  onWheel={(e) => handleWheel(e, 'minutes')}
                  className="w-12 sm:w-14 h-9 text-center text-2xl font-mono font-bold bg-slate-900 border border-slate-700 rounded text-amber-300 outline-none select-all"
                />
                <button
                  type="button"
                  onClick={() => updateMinutes((currentSetting.minutes - 1 + 60) % 60)}
                  className="p-0.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-xl font-mono font-bold text-slate-600">:</span>

              {/* Seconds */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => updateSeconds((currentSetting.seconds + 1) % 60)}
                  className="p-0.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <input
                  ref={secInputRef}
                  type="text"
                  inputMode="numeric"
                  value={currentSetting.seconds.toString().padStart(2, '0')}
                  onChange={(e) => handleDigitChange(e, 'seconds')}
                  onKeyDown={(e) => handleDigitKeyDown(e, 'seconds')}
                  onWheel={(e) => handleWheel(e, 'seconds')}
                  className="w-12 sm:w-14 h-9 text-center text-2xl font-mono font-bold bg-slate-900 border border-slate-700 rounded text-rose-400 outline-none select-all"
                />
                <button
                  type="button"
                  onClick={() => updateSeconds((currentSetting.seconds - 1 + 60) % 60)}
                  className="p-0.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 디지털 시 분 초 박스의 오른쪽 아래: 알람 시간 리셋 버튼 */}
            <button
              type="button"
              onClick={() => onSettingChange({ hours: 0, minutes: 0, seconds: 0 })}
              className="absolute right-1.5 bottom-1.5 p-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-amber-300 transition-colors flex items-center space-x-1 text-xs cursor-pointer active:scale-95 shadow-xs"
              title="알람 시간 리셋 (00:00:00)"
              aria-label="알람 시간 리셋"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold pr-0.5">리셋</span>
            </button>
          </div>
        )}

        {/* 2. SLIDER INPUT SECTION */}
        {(inputMode === 'slider' || inputMode === 'both') && (
          <div className="space-y-1 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
            {/* Hours Slider - 1포인트 크게 (text-xs) */}
            <div className="flex items-center space-x-2">
              <span className="w-5 text-xs font-mono font-semibold text-slate-300">시</span>
              <input
                type="range"
                min="0"
                max="23"
                value={currentSetting.hours}
                onChange={(e) => updateHours(parseInt(e.target.value, 10))}
                onWheel={(e) => handleWheel(e, 'hours')}
                className="flex-1 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-500"
              />
              <span className="w-6 text-right text-sm font-mono font-bold text-amber-300">
                {currentSetting.hours}
              </span>
            </div>

            {/* Minutes Slider - 1포인트 크게 (text-xs) */}
            <div className="flex items-center space-x-2">
              <span className="w-5 text-xs font-mono font-semibold text-slate-300">분</span>
              <input
                type="range"
                min="0"
                max="59"
                value={currentSetting.minutes}
                onChange={(e) => updateMinutes(parseInt(e.target.value, 10))}
                onWheel={(e) => handleWheel(e, 'minutes')}
                className="flex-1 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-500"
              />
              <span className="w-6 text-right text-sm font-mono font-bold text-amber-300">
                {currentSetting.minutes}
              </span>
            </div>

            {/* Seconds Slider - 1포인트 크게 (text-xs) */}
            <div className="flex items-center space-x-2">
              <span className="w-5 text-xs font-mono text-rose-400 font-bold">초</span>
              <input
                type="range"
                min="0"
                max="59"
                value={currentSetting.seconds}
                onChange={(e) => updateSeconds(parseInt(e.target.value, 10))}
                onWheel={(e) => handleWheel(e, 'seconds')}
                className="flex-1 h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-rose-500"
              />
              <span className="w-6 text-right text-sm font-mono font-bold text-rose-400">
                {currentSetting.seconds}
              </span>
            </div>
          </div>
        )}

        {/* Quick Presets & Register Button - 1포인트 크게 (text-sm) */}
        <div className="flex items-center justify-between gap-1 pt-0.5">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickAdd(10)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium rounded transition-colors cursor-pointer"
            >
              +10초
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd(60)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium rounded transition-colors cursor-pointer"
            >
              +1분
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd(300)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium rounded transition-colors cursor-pointer"
            >
              +5분
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleSubmit()}
            id="btn-add-alarm"
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg shadow flex items-center space-x-1 cursor-pointer shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>등록</span>
          </button>
        </div>
      </div>

      {/* Alarms List - 버튼화 및 상단 시계 밀어올리기 토글 기능 제공 */}
      <div className={`flex-1 bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 flex flex-col min-h-0 overflow-hidden transition-all duration-300 ${
        isListExpanded ? 'ring-1 ring-amber-500/40' : ''
      }`}>
        <button
          type="button"
          onClick={onToggleListExpanded}
          className="w-full flex items-center justify-between pb-1 border-b border-slate-800 text-sm text-slate-200 font-bold px-1 shrink-0 hover:text-amber-300 transition-colors cursor-pointer group"
          title={isListExpanded ? '알람 리스트 접기 (시계 펼치기)' : '알람 리스트 펼쳐서 전체 보기'}
          aria-expanded={isListExpanded}
        >
          <div className="flex items-center space-x-2">
            <span className="group-hover:text-amber-300 transition-colors">등록된 알람 ({alarms.length})</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold group-hover:bg-amber-500/30">
              {isListExpanded ? '시계 보기' : '펼쳐서 확인'}
            </span>
          </div>
          <div className="flex items-center text-xs text-slate-400 group-hover:text-amber-300 space-x-1">
            <span>{isListExpanded ? '접기' : '리스트 확장'}</span>
            {isListExpanded ? (
              <ChevronDown className="w-4 h-4 transition-transform text-amber-400" />
            ) : (
              <ChevronUp className="w-4 h-4 transition-transform text-amber-400" />
            )}
          </div>
        </button>

        <div className="flex-1 overflow-y-auto space-y-1.5 pt-1.5 pr-1 min-h-0">
          {alarms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm py-4">
              <span>등록된 알람이 없습니다</span>
            </div>
          ) : (
            alarms.map((alarm) => {
              const isTimer = alarm.alarmType === 'timer';
              let timeStr = formatTime(alarm.hours, alarm.minutes, alarm.seconds);
              let remainingStr = '';

              if (isTimer && alarm.targetTimestamp && alarm.enabled) {
                const diffMs = Math.max(0, alarm.targetTimestamp - currentTime.getTime());
                const diffSec = Math.ceil(diffMs / 1000);
                const rh = Math.floor(diffSec / 3600);
                const rm = Math.floor((diffSec % 3600) / 60);
                const rs = diffSec % 60;
                remainingStr = `남은시간: ${formatTime(rh, rm, rs)}`;
              }

              return (
                <div
                  key={alarm.id}
                  className={`flex items-center justify-between py-2 px-3 rounded-lg border transition-all ${
                    alarm.enabled
                      ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                      : 'bg-slate-900/40 border-slate-800/60 text-slate-500'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <button
                      type="button"
                      onClick={() => onToggleAlarm(alarm.id)}
                      className={`w-8 h-4.5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                        alarm.enabled
                          ? isTimer
                            ? 'bg-sky-500'
                            : 'bg-amber-500'
                          : 'bg-slate-700'
                      }`}
                      aria-label="알람 토글"
                    >
                      <div
                        className={`bg-white w-3.5 h-3.5 rounded-full shadow transform transition-transform ${
                          alarm.enabled ? 'translate-x-3.5' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    <div className="flex flex-col">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-base sm:text-lg font-bold text-white tracking-tight">
                          {timeStr}
                        </span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-sans font-semibold ${
                            isTimer
                              ? 'bg-sky-950 text-sky-400 border border-sky-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {isTimer ? '시간(타이머)' : '시각'}
                        </span>
                      </div>
                      {remainingStr && (
                        <span className="text-xs font-mono text-sky-300 font-medium">
                          {remainingStr}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteAlarm(alarm.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-slate-800 cursor-pointer"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
