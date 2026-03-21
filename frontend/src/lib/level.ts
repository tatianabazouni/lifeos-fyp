export const LEVELS = [
  { level: 1, title: 'Wanderer', xpRequired: 0 },
  { level: 5, title: 'Explorer', xpRequired: 200 },
  { level: 10, title: 'Dream Builder', xpRequired: 500 },
  { level: 20, title: 'Pathfinder', xpRequired: 1200 },
  { level: 40, title: 'Life Architect', xpRequired: 3000 },
];

export function getLevelInfo(xp: number) {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || LEVELS[i];
      break;
    }
  }
  const progress = next === current ? 100 : ((xp - current.xpRequired) / (next.xpRequired - current.xpRequired)) * 100;
  return { current, next, progress: Math.min(progress, 100) };
}
