export function removeNullishKeys<T>(obj: T): T {
  for (const key in obj) if (obj[key] == null) delete obj[key];
  return obj;
}
