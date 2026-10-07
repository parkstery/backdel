export type ActiveTab = 'stopwatch' | 'alarm';

export interface LapTime {
  id: string;
  lapNumber: number;
  timeMs: number;
  lapDiffMs: number;
  recordedAt: number;
}

export type AlarmType = 'time' | 'timer'; // 'time': 특정 시각(예: 14:30:00), 'timer': 경과 시간(예: 00:03:00 후)

export interface AlarmItem {
  id: string;
  hours: number;
  minutes: number;
  seconds: number;
  label: string;
  enabled: boolean;
  createdAt: number;
  alarmType?: AlarmType; // 시각 vs 시간 (타이머)
  targetTimestamp?: number; // '시간(타이머)' 모드일 때 울릴 타임스탬프 (ms)
  durationSeconds?: number; // '시간(타이머)' 모드일 때 총 설정 초수
  isRinging?: boolean;
}

export interface TimeInputState {
  hours: number;
  minutes: number;
  seconds: number;
}
