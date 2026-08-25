import { query } from './db';

let cachedOrigins: string[] = [];
let cacheExpiry = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export async function getAllowedOrigins(): Promise<string[]> {
  const now = Date.now();
  if (cachedOrigins.length > 0 && now < cacheExpiry) {
    return cachedOrigins;
  }

  try {
    const { rows } = await query(
      'SELECT origin FROM allowed_origins WHERE is_active = true'
    );
    cachedOrigins = rows.map((r: { origin: string }) => r.origin.toLowerCase().trim());
    cacheExpiry = now + CACHE_TTL_MS;
  } catch (error) {
    console.error('Failed to fetch allowed origins from database:', error);
  }

  return cachedOrigins;
}

export function clearOriginsCache() {
  cachedOrigins = [];
  cacheExpiry = 0;
}

export async function getCorsHeaders(requestOrigin: string | null): Promise<Record<string, string>> {
  const defaultHeaders = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (!requestOrigin) {
    return defaultHeaders;
  }

  const normalizedOrigin = requestOrigin.toLowerCase().trim();
  const allowed = await getAllowedOrigins();

  if (allowed.includes(normalizedOrigin)) {
    return {
      ...defaultHeaders,
      'Access-Control-Allow-Origin': requestOrigin,
      'Vary': 'Origin',
    };
  }

  return defaultHeaders;
}
