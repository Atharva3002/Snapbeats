export const formatDuration = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

export const formatCount = (n) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K";
  return String(n);
};

export const MOOD_TAGS = [
  "Relax", "Focus", "Motivation", "Party", "Sad",
  "Happy", "Chill", "Hype", "Romance", "Study",
];
