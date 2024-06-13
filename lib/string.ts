export function truncateMiddle(str: string, maxLength: number) {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength / 2)}...${str.slice(-maxLength / 2)}`;
}
