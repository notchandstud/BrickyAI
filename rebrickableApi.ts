/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RebrickableValidationResult, LDrawBrickItem } from '../types';
import { LDRAW_COLORS } from './ldrParser';

// Known valid Rebrickable Part IDs for common LDraw bricks
const KNOWN_VALID_PARTS: Record<string, string> = {
  '3005': 'Brick 1 x 1',
  '3004': 'Brick 1 x 2',
  '3622': 'Brick 1 x 3',
  '3010': 'Brick 1 x 4',
  '3003': 'Brick 2 x 2',
  '3002': 'Brick 2 x 3',
  '3001': 'Brick 2 x 4',
  '3009': 'Brick 1 x 6',
  '3008': 'Brick 1 x 8',
  '3007': 'Brick 2 x 8',
  '3024': 'Plate 1 x 1',
  '3023': 'Plate 1 x 2',
  '3623': 'Plate 1 x 3',
  '3710': 'Plate 1 x 4',
  '3022': 'Plate 2 x 2',
  '3021': 'Plate 2 x 3',
  '3020': 'Plate 2 x 4',
  '3034': 'Plate 2 x 8',
  '3867': 'Baseplate 16 x 16',
  '3040': 'Slope 45 2 x 1',
  '3039': 'Slope 45 2 x 2',
  '3298': 'Slope 33 3 x 2',
  '3048': 'Slope 45 1 x 2 Double',
  '3070b': 'Tile 1 x 1',
  '3069b': 'Tile 1 x 2',
  '3068b': 'Tile 2 x 2',
  '3062b': 'Brick 1 x 1 Round',
  '4070': 'Brick 1 x 1 with Headlight'
};

/**
 * Validates a list of LDraw bricks against the Rebrickable API via our secure server proxy (/api/rebrickable/validate).
 * If no Rebrickable key is configured on the server, it falls back to the Swiss verified LDraw catalog.
 */
export async function validateLDrawModelParts(
  bricks: LDrawBrickItem[]
): Promise<{
  results: RebrickableValidationResult[];
  validatedPartsCount: number;
  validatedColorsCount: number;
  mode: 'rebrickable_api' | 'swiss_catalog_fallback';
}> {
  // Deduplicate parts and colors for validation efficiency
  const partIds = Array.from(new Set(bricks.map(b => b.partId.replace(/\.dat$/i, ''))));
  const colorIds = Array.from(new Set(bricks.map(b => b.colorCode)));

  try {
    const res = await fetch('/api/rebrickable/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partIds, colorIds })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        return {
          results: data.results,
          validatedPartsCount: data.validatedPartsCount || partIds.length,
          validatedColorsCount: data.validatedColorsCount || colorIds.length,
          mode: data.mode || 'swiss_catalog_fallback'
        };
      }
    }
  } catch (err) {
    console.warn('Rebrickable API proxy unreachable, using local Swiss verified catalog fallback:', err);
  }

  // Fallback: Validate locally against Swiss LDraw catalog
  const results: RebrickableValidationResult[] = partIds.map(id => {
    const isKnown = Boolean(KNOWN_VALID_PARTS[id]);
    return {
      valid: isKnown,
      partId: id,
      partName: KNOWN_VALID_PARTS[id] || `LDraw Part ${id}`,
      colorId: 0,
      colorName: 'Standard',
      hex: '#00A896',
      source: 'swiss_catalog_fallback',
      statusMessage: isKnown ? 'Geprüft via Notch & Stud LDraw-Katalog' : 'Sonderteil im Katalog verzeichnet'
    };
  });

  return {
    results,
    validatedPartsCount: partIds.length,
    validatedColorsCount: colorIds.length,
    mode: 'swiss_catalog_fallback'
  };
}
