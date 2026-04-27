
const getCurrentISOWeek = () => {
  const d = new Date('2026-03-12T20:22:49'); // Today according to metadata
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

console.log(getCurrentISOWeek());
