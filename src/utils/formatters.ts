export function formatTime(hours: number, minutes: number, seconds: number): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function formatStopwatchMs(ms: number): {
  hoursStr: string;
  minutesStr: string;
  secondsStr: string;
  hundredthsStr: string;
  fullFormatted: string;
} {
  const totalSeconds = Math.floor(ms / 1000);
  const hundredths = Math.floor((ms % 1000) / 10);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);

  const pad = (n: number) => n.toString().padStart(2, '0');

  const hoursStr = pad(hours);
  const minutesStr = pad(minutes);
  const secondsStr = pad(seconds);
  const hundredthsStr = pad(hundredths);

  return {
    hoursStr,
    minutesStr,
    secondsStr,
    hundredthsStr,
    fullFormatted: `${hoursStr}:${minutesStr}:${secondsStr}.${hundredthsStr}`,
  };
}

export function formatSecondsToHuman(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const parts: string[] = [];
  if (h > 0) parts.push(`${h}시간`);
  if (m > 0 || h > 0) parts.push(`${m}분`);
  parts.push(`${s}초`);

  return parts.join(' ');
}
