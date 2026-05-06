const countOccurrences = (start, end, freq) => {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (e < s) return 0;
  if (freq === "daily")   return Math.floor((e - s) / 86400000) + 1;
  if (freq === "weekly")  return Math.floor((e - s) / (86400000 * 7)) + 1;
  if (freq === "monthly")
    return (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1;
  return 1;
}

export default countOccurrences