// ============================================
// READER — Lee el archivo de datos JSON
// ============================================

import { readFile } from 'fs/promises';
import { join } from 'path';
import type { Campaign } from './types.js';

export async function readCampaigns(): Promise<Campaign[]> {
  const filePath = join(import.meta.dirname, '..', 'data', 'campaigns.json');

  try {
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw) as Campaign[];
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`No se pudo leer campaigns.json: ${message}`);
  }
}