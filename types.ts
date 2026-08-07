/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LDrawBrickItem {
  lineNumber: number;
  colorCode: number;
  colorHex: string;
  colorName: string;
  x: number;
  y: number;
  z: number;
  matrix: number[];
  partId: string;
  partName: string;
  dimensions: { width: number; height: number; length: number; studs: boolean };
}

export interface LDrawModel {
  id: string;
  name: string;
  prompt: string;
  ldrCode: string;
  partCount: number;
  chfPrice: number;
  description: string;
  historicalContext: string;
  createdAt: string;
  validatedPartsCount: number;
  validatedColorsCount: number;
}

export interface OrderInquiry {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  address: string;
  postalCode?: string;
  city?: string;
  phone?: string;
  correctionNotes?: string;
  prompt: string;
  modelName: string;
  partCount: number;
  chfPrice: number;
  ldrCode: string;
  status: 'neu' | 'in_bearbeitung' | 'konstruktion' | 'abgeschlossen';
}

export interface RebrickableValidationResult {
  valid: boolean;
  partId: string;
  partName: string;
  colorId: number;
  colorName: string;
  hex: string;
  source: 'rebrickable_api' | 'swiss_catalog_fallback';
  statusMessage: string;
}

export interface SwissPreset {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  prompt: string;
  partCount: number;
  chfPrice: number;
  description: string;
  historicalContext: string;
  ldrCode: string;
}

export interface RebrickableStatus {
  hasKey: boolean;
  keyPreview: string | null;
  mode: 'live_api' | 'verified_catalog';
}
