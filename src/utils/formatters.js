export const formatGD = (gd) => (gd > 0 ? `+${gd}` : `${gd}`);

export const formatGap = (gap) => (gap >= 0 ? `+${gap}` : `${gap}`);

export const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
