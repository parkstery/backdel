import { useEffect } from 'react';
import { ActiveTab } from '../types';

interface KeyboardShortcutsProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onStopwatchToggle: () => void;
  onStopwatchLap: () => void;
  onStopwatchReset: () => void;
  onMuteToggle: () => void;
  onDismissAlarm: () => void;
  isAlarmRinging: boolean;
}

export function useKeyboardShortcuts({
  activeTab,
  setActiveTab,
  onStopwatchToggle,
  onStopwatchLap,
  onStopwatchReset,
  onMuteToggle,
  onDismissAlarm,
  isAlarmRinging,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is typing in an input element or textarea, avoid triggering global shortcuts
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.getAttribute('contenteditable') === 'true');

      if (e.key === 'Escape' && isAlarmRinging) {
        e.preventDefault();
        onDismissAlarm();
        return;
      }

      if (isInput) {
        return;
      }

      switch (e.key) {
        case ' ': // Spacebar
          e.preventDefault();
          onStopwatchToggle();
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          onStopwatchLap();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          onStopwatchReset();
          break;
        case '1':
          e.preventDefault();
          setActiveTab('stopwatch');
          break;
        case '2':
          e.preventDefault();
          setActiveTab('alarm');
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          onMuteToggle();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeTab,
    setActiveTab,
    onStopwatchToggle,
    onStopwatchLap,
    onStopwatchReset,
    onMuteToggle,
    onDismissAlarm,
    isAlarmRinging,
  ]);
}
