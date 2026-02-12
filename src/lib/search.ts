export function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function matchesQuery(value: string, query: string) {
  if (!query) return true;
  return normalize(value).includes(normalize(query));
}
