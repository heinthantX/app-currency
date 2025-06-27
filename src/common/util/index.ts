import crypto from 'crypto';

export function removeNullishKeys<T>(obj: T): T {
  for (const key in obj) if (obj[key] == null) delete obj[key];
  return obj;
}

export function generateApiSecret(prefix: string = 'sk'): string {
  const timestamp = Date.now().toString(36);
  const randomBytes = crypto.randomBytes(48).toString('hex');
  return `${prefix}_${timestamp}_${randomBytes}`;
}
