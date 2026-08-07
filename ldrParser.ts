/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LDrawBrickItem } from '../types';

// Standard LDraw color mapping (Color Code -> Hex & Name)
export const LDRAW_COLORS: Record<number, { hex: string; name: string; isTrans?: boolean }> = {
  0: { hex: '#05131D', name: 'Black' },
  1: { hex: '#0055BF', name: 'Blue' },
  2: { hex: '#237841', name: 'Green' },
  4: { hex: '#C91A09', name: 'Red' },
  7: { hex: '#583927', name: 'Brown' },
  14: { hex: '#F2CD37', name: 'Yellow' },
  15: { hex: '#FFFFFF', name: 'White' },
  19: { hex: '#E4CD9E', name: 'Tan' },
  25: { hex: '#E6E3DF', name: 'Dark Orange' },
  28: { hex: '#3B2414', name: 'Dark Brown' },
  71: { hex: '#A0A5A9', name: 'Light Bluish Gray' },
  72: { hex: '#6C6E68', name: 'Dark Bluish Gray' },
  78: { hex: '#958A73', name: 'Dark Tan' },
  288: { hex: '#184632', name: 'Dark Green' },
  297: { hex: '#AA7F2E', name: 'Pearl Gold' },
  320: { hex: '#720E0F', name: 'Dark Red' },
  378: { hex: '#A0BCAC', name: 'Sand Green' },
  330: { hex: '#635F52', name: 'Olive Green' },
  151: { hex: '#E1EBE8', name: 'Sand Blue' },
  33: { hex: '#0020A0', name: 'Trans-Blue', isTrans: true },
  36: { hex: '#C91A09', name: 'Trans-Red', isTrans: true },
  47: { hex: '#FC97AC', name: 'Trans-Clear', isTrans: true },
  52: { hex: '#A5A5CB', name: 'Trans-Light Blue', isTrans: true }
};

// Common Brick dimensions in Lego/LDraw Stud units (1 stud = 20 LDraw units)
export const PART_DIMENSIONS: Record<string, { width: number; height: number; length: number; studs: boolean; name: string }> = {
  '3005.dat': { width: 1, height: 1, length: 1, studs: true, name: 'Brick 1 x 1' },
  '3004.dat': { width: 1, height: 1, length: 2, studs: true, name: 'Brick 1 x 2' },
  '3622.dat': { width: 1, height: 1, length: 3, studs: true, name: 'Brick 1 x 3' },
  '3010.dat': { width: 1, height: 1, length: 4, studs: true, name: 'Brick 1 x 4' },
  '3003.dat': { width: 2, height: 1, length: 2, studs: true, name: 'Brick 2 x 2' },
  '3002.dat': { width: 2, height: 1, length: 3, studs: true, name: 'Brick 2 x 3' },
  '3001.dat': { width: 2, height: 1, length: 4, studs: true, name: 'Brick 2 x 4' },
  '3009.dat': { width: 1, height: 1, length: 6, studs: true, name: 'Brick 1 x 6' },
  '3008.dat': { width: 1, height: 1, length: 8, studs: true, name: 'Brick 1 x 8' },
  '3007.dat': { width: 2, height: 1, length: 8, studs: true, name: 'Brick 2 x 8' },
  
  // Plates (Height = 1/3 brick)
  '3024.dat': { width: 1, height: 0.333, length: 1, studs: true, name: 'Plate 1 x 1' },
  '3023.dat': { width: 1, height: 0.333, length: 2, studs: true, name: 'Plate 1 x 2' },
  '3623.dat': { width: 1, height: 0.333, length: 3, studs: true, name: 'Plate 1 x 3' },
  '3710.dat': { width: 1, height: 0.333, length: 4, studs: true, name: 'Plate 1 x 4' },
  '3022.dat': { width: 2, height: 0.333, length: 2, studs: true, name: 'Plate 2 x 2' },
  '3021.dat': { width: 2, height: 0.333, length: 3, studs: true, name: 'Plate 2 x 3' },
  '3020.dat': { width: 2, height: 0.333, length: 4, studs: true, name: 'Plate 2 x 4' },
  '3034.dat': { width: 2, height: 0.333, length: 8, studs: true, name: 'Plate 2 x 8' },
  '3867.dat': { width: 16, height: 0.15, length: 16, studs: true, name: 'Baseplate 16 x 16' },

  // Slopes
  '3040.dat': { width: 1, height: 1, length: 2, studs: false, name: 'Slope 45 2 x 1' },
  '3039.dat': { width: 2, height: 1, length: 2, studs: false, name: 'Slope 45 2 x 2' },
  '3298.dat': { width: 2, height: 1, length: 3, studs: false, name: 'Slope 33 3 x 2' },
  '3048.dat': { width: 1, height: 1, length: 2, studs: false, name: 'Slope 45 1 x 2 Double' },

  // Tiles & Specials
  '3070b.dat': { width: 1, height: 0.333, length: 1, studs: false, name: 'Tile 1 x 1' },
  '3069b.dat': { width: 1, height: 0.333, length: 2, studs: false, name: 'Tile 1 x 2' },
  '3068b.dat': { width: 2, height: 0.333, length: 2, studs: false, name: 'Tile 2 x 2' },
  '3062b.dat': { width: 1, height: 1, length: 1, studs: true, name: 'Brick 1 x 1 Round' },
  '4070.dat': { width: 1, height: 1, length: 1, studs: true, name: 'Brick 1 x 1 with Headlight' }
};

/**
 * Calculates CHF price according to user formula:
 * Teileanzahl * 0.15 CHF * Multiplikator 2.5
 */
export function calculateChfPrice(partCount: number): number {
  const price = partCount * 0.15 * 2.5;
  // Round to nearest 0.05 CHF (Swiss rounding)
  return Math.round(price * 20) / 20;
}

/**
 * Parses raw LDraw text code (.ldr) into structured array of LDrawBrickItem for 3D rendering
 */
export function parseLDrawCode(ldrCode: string): {
  bricks: LDrawBrickItem[];
  partCount: number;
  chfPrice: number;
  colorsUsed: number[];
} {
  const lines = ldrCode.split('\n');
  const bricks: LDrawBrickItem[] = [];
  const colorSet = new Set<number>();

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    // In LDraw, line type '1' denotes a sub-file / part reference
    // Syntax: 1 <color> <x> <y> <z> <a b c d e f g h i> <part.dat>
    if (!trimmed.startsWith('1 ')) return;

    const tokens = trimmed.split(/\s+/);
    if (tokens.length < 15) return;

    const colorCode = parseInt(tokens[1], 10) || 0;
    const x = parseFloat(tokens[2]) || 0;
    const y = parseFloat(tokens[3]) || 0;
    const z = parseFloat(tokens[4]) || 0;

    // Rotation matrix elements (tokens 5 to 13)
    const matrix = tokens.slice(5, 14).map(v => parseFloat(v) || 0);
    const rawPartId = tokens[14].toLowerCase();
    const partId = rawPartId.endsWith('.dat') ? rawPartId : `${rawPartId}.dat`;

    colorSet.add(colorCode);

    const colorInfo = LDRAW_COLORS[colorCode] || { hex: '#808080', name: `Color ${colorCode}` };
    const dim = PART_DIMENSIONS[partId] || {
      width: 1,
      height: 1,
      length: 1,
      studs: true,
      name: `Part ${partId}`
    };

    bricks.push({
      lineNumber: idx + 1,
      colorCode,
      colorHex: colorInfo.hex,
      colorName: colorInfo.name,
      x,
      y,
      z,
      matrix,
      partId,
      partName: dim.name,
      dimensions: dim
    });
  });

  const partCount = bricks.length;
  const chfPrice = calculateChfPrice(partCount);

  return {
    bricks,
    partCount,
    chfPrice,
    colorsUsed: Array.from(colorSet)
  };
}

/**
 * Generates a clean .ldr file string with Notch & Stud header comments
 */
export function formatLDrawFile(
  modelName: string,
  prompt: string,
  ldrCode: string,
  partCount: number,
  chfPrice: number
): string {
  const now = new Date().toISOString().split('T')[0];
  const header = `0 // =============================================================
0 // Model: ${modelName}
0 // Created with: BrickyAI (Powered by Notch & Stud)
0 // Slogan: Schweizer Geschichte, Stein für Stein.
0 // Prompt: "${prompt}"
0 // Parts Count: ${partCount}
0 // Estimated Price: CHF ${chfPrice.toFixed(2)}
0 // Date: ${now}
0 // Compatible with: BrickLink Studio, LDraw, LeoCAD
0 // =============================================================
0
`;

  // Clean out duplicate header lines if already present in code
  const body = ldrCode
    .split('\n')
    .filter(line => !line.trim().startsWith('0 // Model:') && !line.trim().startsWith('0 // Created with:'))
    .join('\n');

  return header + body.trim() + '\n';
}

/**
 * Calculates physical LEGO model dimensions (in centimeters, studs, and brick layers)
 * 1 Stud (20 LDU) = 8 mm = 0.8 cm
 * 1 Brick Height (24 LDU) = 9.6 mm ~ 0.96 cm
 */
export function calculateModelDimensions(bricks: LDrawBrickItem[]): {
  widthCm: number;
  depthCm: number;
  heightCm: number;
  widthStuds: number;
  depthStuds: number;
  heightBricks: number;
} {
  if (!bricks || bricks.length === 0) {
    return { widthCm: 0, depthCm: 0, heightCm: 0, widthStuds: 0, depthStuds: 0, heightBricks: 0 };
  }

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  bricks.forEach(b => {
    const halfW = (b.dimensions.width * 20) / 2;
    const halfL = (b.dimensions.length * 20) / 2;
    const h = b.dimensions.height * 24;

    minX = Math.min(minX, b.x - halfW);
    maxX = Math.max(maxX, b.x + halfW);
    minZ = Math.min(minZ, b.z - halfL);
    maxZ = Math.max(maxZ, b.z + halfL);
    minY = Math.min(minY, b.y);
    maxY = Math.max(maxY, b.y + h);
  });

  const spanX = Math.max(20, maxX - minX);
  const spanZ = Math.max(20, maxZ - minZ);
  const spanY = Math.max(8, maxY - minY);

  const widthStuds = Math.round(spanX / 20);
  const depthStuds = Math.round(spanZ / 20);
  const heightBricks = Math.round(spanY / 24 * 10) / 10;

  const widthCm = Math.round(spanX * 0.04 * 10) / 10;
  const depthCm = Math.round(spanZ * 0.04 * 10) / 10;
  const heightCm = Math.round(spanY * 0.04 * 10) / 10;

  return {
    widthCm,
    depthCm,
    heightCm,
    widthStuds,
    depthStuds,
    heightBricks
  };
}

/**
 * Normalizes LDraw coordinates and resolves physics:
 * - Snaps X and Z to standard 10 LDU grid increments
 * - Snaps Y to multiples of 8 LDU (plate/brick height increments)
 * - Removes overlapping bricks using 3D spatial bounding boxes
 * - Removes floating bricks (bricks that have no support below them)
 */
export function normalizeAndFixLDrawCode(ldrCode: string): {
  cleanCode: string;
  stats: {
    snappedCount: number;
    removedOverlaps: number;
    fixedFloating: number;
  };
} {
  const lines = ldrCode.split('\n');
  const resultLines: string[] = [];
  
  // 3D Spatial Grid to track occupied space
  const placedBricks: { minX: number, maxX: number, minY: number, maxY: number, minZ: number, maxZ: number }[] = [];

  let snappedCount = 0;
  let removedOverlaps = 0;
  let fixedFloating = 0;

  interface ParsedBrick {
    originalLine: string;
    color: string;
    snappedX: number;
    snappedY: number;
    snappedZ: number;
    matrixStr: string;
    partId: string;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
  }
  
  const bricksToProcess: ParsedBrick[] = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith('1 ')) {
      if (trimmed.length > 0 || resultLines.length > 0) {
        resultLines.push(line);
      }
      return;
    }

    const tokens = trimmed.split(/\s+/);
    if (tokens.length < 15) {
      resultLines.push(line);
      return;
    }

    const color = tokens[1];
    const rawX = parseFloat(tokens[2]) || 0;
    const rawY = parseFloat(tokens[3]) || 0;
    const rawZ = parseFloat(tokens[4]) || 0;

    const snappedX = Math.round(rawX / 10) * 10;
    const snappedZ = Math.round(rawZ / 10) * 10;
    const snappedY = Math.round(rawY / 8) * 8;

    if (snappedX !== rawX || snappedY !== rawY || snappedZ !== rawZ) {
      snappedCount++;
    }

    const rawPartId = tokens[14].toLowerCase();
    const partId = rawPartId.endsWith('.dat') ? rawPartId : `${rawPartId}.dat`;
    
    const dim = PART_DIMENSIONS[partId] || { width: 1, height: 1, length: 1 };
    
    const worldW = dim.width * 20;
    const worldL = dim.length * 20;
    const worldH = dim.height * 24;
    
    const minX = snappedX - worldW / 2 + 1;
    const maxX = snappedX + worldW / 2 - 1;
    const minY = snappedY + 1; 
    const maxY = snappedY + worldH - 1; 
    const minZ = snappedZ - worldL / 2 + 1;
    const maxZ = snappedZ + worldL / 2 - 1;

    const matrixStr = tokens.slice(5, 14).join(' ');
    
    bricksToProcess.push({
      originalLine: line,
      color,
      snappedX,
      snappedY,
      snappedZ,
      matrixStr,
      partId: tokens[14],
      minX, maxX, minY, maxY, minZ, maxZ
    });
  });

  // Sort bricks by maxY descending (highest Y value = ground first)
  bricksToProcess.sort((a, b) => b.maxY - a.maxY);

  bricksToProcess.forEach(brick => {
    // 1. Check for Overlaps
    let overlaps = false;
    for (const b of placedBricks) {
      if (
        brick.minX <= b.maxX && brick.maxX >= b.minX &&
        brick.minY <= b.maxY && brick.maxY >= b.minY &&
        brick.minZ <= b.maxZ && brick.maxZ >= b.minZ
      ) {
        overlaps = true;
        break;
      }
    }

    if (overlaps) {
      removedOverlaps++;
      return; 
    }
    
    // 2. Check for Support
    let supported = false;
    if (brick.maxY >= -4) {
      supported = true; 
    } else {
      const supportY = brick.maxY + 1; // bottom edge
      for (const b of placedBricks) {
        // If bottom of this brick touches top of another brick
        if (Math.abs(supportY - b.minY) <= 8) {
          if (brick.minX <= b.maxX && brick.maxX >= b.minX && brick.minZ <= b.maxZ && brick.maxZ >= b.minZ) {
            supported = true;
            break;
          }
        }
      }
    }
    
    if (!supported) {
      fixedFloating++;
      return; 
    }

    placedBricks.push({ 
      minX: brick.minX, maxX: brick.maxX, 
      minY: brick.minY, maxY: brick.maxY, 
      minZ: brick.minZ, maxZ: brick.maxZ 
    });

    resultLines.push(`1 ${brick.color} ${brick.snappedX} ${brick.snappedY} ${brick.snappedZ} ${brick.matrixStr} ${brick.partId}`);
  });

  return {
    cleanCode: resultLines.join('\n'),
    stats: {
      snappedCount,
      removedOverlaps,
      fixedFloating
    }
  };
}
