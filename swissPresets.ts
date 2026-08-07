/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SwissPreset } from '../types';
import { calculateChfPrice, parseLDrawCode, normalizeAndFixLDrawCode } from '../utils/ldrParser';

// Helper to generate a preset with auto-calculated partCount & CHF price
function createSwissPreset(
  id: string,
  title: string,
  subtitle: string,
  tag: string,
  prompt: string,
  description: string,
  historicalContext: string,
  ldrCodeRaw: string
): SwissPreset {
  const { cleanCode } = normalizeAndFixLDrawCode(ldrCodeRaw);
  const { partCount } = parseLDrawCode(cleanCode);
  const chfPrice = calculateChfPrice(partCount);
  return {
    id,
    title,
    subtitle,
    tag,
    prompt,
    partCount,
    chfPrice,
    description,
    historicalContext,
    ldrCode: cleanCode.trim()
  };
}


const WALLISER_CHALET_LDR = `
0 // Walliser Bauernhaus im Micro-Scale - BrickyAI by Notch & Stud
0 // Fundament (Graue Steinplatten)
1 72 -40 0 -40 1 0 0 0 1 0 0 0 1 3034.dat
1 72 -40 0 40 1 0 0 0 1 0 0 0 1 3034.dat
1 72 40 0 -40 1 0 0 0 1 0 0 0 1 3034.dat
1 72 40 0 40 1 0 0 0 1 0 0 0 1 3034.dat
0 // Erdgeschoss Bruchsteinsockel (Dark Bluish Gray & Tan)
1 72 -40 -20 -40 1 0 0 0 1 0 0 0 1 3001.dat
1 72 40 -20 -40 1 0 0 0 1 0 0 0 1 3001.dat
1 71 -40 -20 40 1 0 0 0 1 0 0 0 1 3001.dat
1 71 40 -20 40 1 0 0 0 1 0 0 0 1 3001.dat
1 19 0 -20 -40 1 0 0 0 1 0 0 0 1 3004.dat
1 19 0 -20 40 1 0 0 0 1 0 0 0 1 3004.dat
0 // 1. Stock Walliser Lärchenholz-Wände (Brown & Dark Brown)
1 7 -40 -44 -40 1 0 0 0 1 0 0 0 1 3001.dat
1 28 40 -44 -40 1 0 0 0 1 0 0 0 1 3001.dat
1 7 -40 -44 40 1 0 0 0 1 0 0 0 1 3001.dat
1 28 40 -44 40 1 0 0 0 1 0 0 0 1 3001.dat
1 7 -40 -68 -40 1 0 0 0 1 0 0 0 1 3001.dat
1 7 40 -68 -40 1 0 0 0 1 0 0 0 1 3001.dat
1 28 -40 -68 40 1 0 0 0 1 0 0 0 1 3001.dat
1 7 40 -68 40 1 0 0 0 1 0 0 0 1 3001.dat
0 // Traditionelle kleine Fenster (White & Trans-Light Blue)
1 15 -60 -44 0 1 0 0 0 1 0 0 0 1 3005.dat
1 52 60 -44 0 1 0 0 0 1 0 0 0 1 3005.dat
1 15 -60 -68 0 1 0 0 0 1 0 0 0 1 3005.dat
1 52 60 -68 0 1 0 0 0 1 0 0 0 1 3005.dat
0 // Balkonvorbau & Holzbalken (Dark Tan)
1 78 -20 -80 -40 1 0 0 0 1 0 0 0 1 3020.dat
1 78 20 -80 -40 1 0 0 0 1 0 0 0 1 3020.dat
1 78 -20 -80 40 1 0 0 0 1 0 0 0 1 3020.dat
1 78 20 -80 40 1 0 0 0 1 0 0 0 1 3020.dat
0 // Dachstuhl (Brown)
1 28 0 -92 -40 1 0 0 0 1 0 0 0 1 3001.dat
1 28 0 -92 40 1 0 0 0 1 0 0 0 1 3001.dat
0 // Flaches Stein-Schieferdach mit Schrägsteinen (Dark Bluish Gray Slope 45)
1 72 -40 -116 -40 1 0 0 0 1 0 0 0 1 3039.dat
1 72 40 -116 -40 1 0 0 0 1 0 0 0 1 3039.dat
1 72 -40 -116 40 1 0 0 0 1 0 0 0 1 3039.dat
1 72 40 -116 40 1 0 0 0 1 0 0 0 1 3039.dat
1 71 0 -132 0 1 0 0 0 1 0 0 0 1 3022.dat
0 // Kamin auf dem Dach (Sand Blue)
1 151 40 -140 20 1 0 0 0 1 0 0 0 1 3005.dat
1 151 40 -160 20 1 0 0 0 1 0 0 0 1 3005.dat
`;

const CHATEAU_CHILLON_LDR = `
0 // Château de Chillon am Genfersee im Micro-Scale - Notch & Stud
0 // Genfersee Basisplatte (Trans-Blue Wasserplatten)
1 33 -80 0 -80 1 0 0 0 1 0 0 0 1 3867.dat
1 33 80 0 -80 1 0 0 0 1 0 0 0 1 3034.dat
1 33 -80 0 80 1 0 0 0 1 0 0 0 1 3034.dat
0 // Felsinsel am Ufer (Dark Bluish Gray & Light Bluish Gray)
1 72 -40 -16 -40 1 0 0 0 1 0 0 0 1 3001.dat
1 71 -40 -16 40 1 0 0 0 1 0 0 0 1 3001.dat
1 72 40 -16 -40 1 0 0 0 1 0 0 0 1 3001.dat
1 71 40 -16 40 1 0 0 0 1 0 0 0 1 3001.dat
0 // Hauptgemäuer des Schlosses (Tan & Light Bluish Gray)
1 19 -40 -40 -40 1 0 0 0 1 0 0 0 1 3001.dat
1 71 40 -40 -40 1 0 0 0 1 0 0 0 1 3001.dat
1 19 -40 -40 40 1 0 0 0 1 0 0 0 1 3001.dat
1 71 40 -40 40 1 0 0 0 1 0 0 0 1 3001.dat
1 19 -40 -64 -40 1 0 0 0 1 0 0 0 1 3001.dat
1 71 40 -64 -40 1 0 0 0 1 0 0 0 1 3001.dat
1 19 -40 -64 40 1 0 0 0 1 0 0 0 1 3001.dat
1 71 40 -64 40 1 0 0 0 1 0 0 0 1 3001.dat
0 // Runder Bergfried (Donjon Hauptturm Mitte)
1 71 0 -88 0 1 0 0 0 1 0 0 0 1 3003.dat
1 72 0 -112 0 1 0 0 0 1 0 0 0 1 3003.dat
1 71 0 -136 0 1 0 0 0 1 0 0 0 1 3003.dat
0 // Spitzdächer in Burgundisch-Rot (Dark Red & Red Slopes)
1 320 0 -160 0 1 0 0 0 1 0 0 0 1 3039.dat
1 4 -40 -88 -40 1 0 0 0 1 0 0 0 1 3039.dat
1 4 40 -88 -40 1 0 0 0 1 0 0 0 1 3039.dat
1 320 -40 -88 40 1 0 0 0 1 0 0 0 1 3039.dat
1 4 40 -88 40 1 0 0 0 1 0 0 0 1 3039.dat
0 // Kleine Ecktürme an der Seeseite
1 71 -70 -40 -70 1 0 0 0 1 0 0 0 1 3062b.dat
1 71 -70 -64 -70 1 0 0 0 1 0 0 0 1 3062b.dat
1 320 -70 -88 -70 1 0 0 0 1 0 0 0 1 3062b.dat
1 71 70 -40 70 1 0 0 0 1 0 0 0 1 3062b.dat
1 71 70 -64 70 1 0 0 0 1 0 0 0 1 3062b.dat
1 320 70 -88 70 1 0 0 0 1 0 0 0 1 3062b.dat
`;

const KAPELLBRUECKE_LDR = `
0 // Die Kapellbrücke in Luzern mit Wasserturm - Notch & Stud
0 // Reuss Flusswasser (Blue Baseplates)
1 1 -60 0 -40 1 0 0 0 1 0 0 0 1 3034.dat
1 1 0 0 -40 1 0 0 0 1 0 0 0 1 3034.dat
1 1 60 0 -40 1 0 0 0 1 0 0 0 1 3034.dat
0 // Wasserturm (Achteckiger Steinturm links im Wasser)
1 71 -50 -20 20 1 0 0 0 1 0 0 0 1 3003.dat
1 72 -50 -44 20 1 0 0 0 1 0 0 0 1 3003.dat
1 71 -50 -68 20 1 0 0 0 1 0 0 0 1 3003.dat
1 72 -50 -92 20 1 0 0 0 1 0 0 0 1 3003.dat
1 71 -50 -116 20 1 0 0 0 1 0 0 0 1 3003.dat
0 // Turm-Spitzdach (Rotbraune Ziegel)
1 4 -50 -140 20 1 0 0 0 1 0 0 0 1 3039.dat
1 4 -50 -164 20 1 0 0 0 1 0 0 0 1 3005.dat
0 // Brückenpfeiler im Fluss
1 72 -80 -10 -40 1 0 0 0 1 0 0 0 1 3004.dat
1 72 -20 -10 -40 1 0 0 0 1 0 0 0 1 3004.dat
1 72 40 -10 -40 1 0 0 0 1 0 0 0 1 3004.dat
0 // Holzsteg der Kapellbrücke (Tan & Brown Plates)
1 19 -80 -24 -40 1 0 0 0 1 0 0 0 1 3020.dat
1 19 -40 -24 -40 1 0 0 0 1 0 0 0 1 3020.dat
1 19 0 -24 -40 1 0 0 0 1 0 0 0 1 3020.dat
1 19 40 -24 -40 1 0 0 0 1 0 0 0 1 3020.dat
0 // Seitliche Geländer & Giebelstreben (Brown)
1 7 -80 -38 -40 1 0 0 0 1 0 0 0 1 3004.dat
1 7 -40 -38 -40 1 0 0 0 1 0 0 0 1 3004.dat
1 7 0 -38 -40 1 0 0 0 1 0 0 0 1 3004.dat
1 7 40 -38 -40 1 0 0 0 1 0 0 0 1 3004.dat
0 // Schrägdach der Holzbrücke (Dark Red Slopes)
1 320 -80 -60 -40 1 0 0 0 1 0 0 0 1 3039.dat
1 320 -40 -60 -40 1 0 0 0 1 0 0 0 1 3039.dat
1 320 0 -60 -40 1 0 0 0 1 0 0 0 1 3039.dat
1 320 40 -60 -40 1 0 0 0 1 0 0 0 1 3039.dat
0 // Blumenschmuck an den Seiten (Red & Yellow 1x1 plates)
1 4 -60 -28 -50 1 0 0 0 1 0 0 0 1 3024.dat
1 14 -20 -28 -50 1 0 0 0 1 0 0 0 1 3024.dat
1 4 20 -28 -50 1 0 0 0 1 0 0 0 1 3024.dat
`;

const MATTERHORN_HUETTE_LDR = `
0 // Matterhorn & Zermatt Berghütte - Notch & Stud
0 // Alpiner Fels & Gletscher-Untergrund (White & Light Bluish Gray)
1 15 -60 0 -60 1 0 0 0 1 0 0 0 1 3034.dat
1 71 60 0 60 1 0 0 0 1 0 0 0 1 3034.dat
1 72 -60 0 60 1 0 0 0 1 0 0 0 1 3034.dat
1 15 60 0 -60 1 0 0 0 1 0 0 0 1 3034.dat
0 // Das Matterhorn / Gipfelgestein (Schroffe Schrägsteine)
1 72 40 -24 -40 1 0 0 0 1 0 0 0 1 3001.dat
1 71 40 -48 -40 1 0 0 0 1 0 0 0 1 3001.dat
1 72 40 -72 -40 1 0 0 0 1 0 0 0 1 3003.dat
1 71 40 -96 -40 1 0 0 0 1 0 0 0 1 3039.dat
1 15 40 -120 -40 1 0 0 0 1 0 0 0 1 3040.dat
0 // Berggrat rechts (Schnee & Gneiss)
1 15 70 -24 -10 1 0 0 0 1 0 0 0 1 3001.dat
1 72 70 -48 -10 1 0 0 0 1 0 0 0 1 3039.dat
0 // Berghütte / Hörnlihütte im Vordergrund (Dark Brown & Red)
1 28 -40 -20 30 1 0 0 0 1 0 0 0 1 3001.dat
1 7 -40 -44 30 1 0 0 0 1 0 0 0 1 3001.dat
1 4 -40 -68 30 1 0 0 0 1 0 0 0 1 3039.dat
0 // Schweizer Flagge vor der Hütte (Red & White)
1 4 -10 -20 50 1 0 0 0 1 0 0 0 1 3062b.dat
1 4 -10 -44 50 1 0 0 0 1 0 0 0 1 3062b.dat
1 15 -10 -68 50 1 0 0 0 1 0 0 0 1 3024.dat
0 // Tannenbaum & Alpwiese im Tal (Green & Sand Green)
1 2 -70 -24 -20 1 0 0 0 1 0 0 0 1 3062b.dat
1 288 -70 -48 -20 1 0 0 0 1 0 0 0 1 3062b.dat
`;

export const SWISS_PRESETS: SwissPreset[] = [
  createSwissPreset(
    'wallis-chalet',
    'Walliser Bauernhaus',
    'Traditionelles Chalet im Micro-Scale',
    'Wallis • Architektur',
    'Ein traditionelles Walliser Bauernhaus im Micro-Scale mit Stein-Fundament, dunklen Holzbalken und Schiefer-Dach',
    'Das traditionelle Walliser Holzhaus aus sonnengereiftem Lärchenholz mit Steinsockel. Ein Meisterstück alpiner Schweizer Handwerkskunst und nachhaltiger Bauweise.',
    'Seit dem 15. Jahrhundert prägen die sonnengebrannten Speicher und Wohnhäuser das Walliser Landschaftsbild. Die typischen „Mäuseplatten“ schützten einst die Getreidevorräte auf kunstvolle Weise.',
    WALLISER_CHALET_LDR
  ),
  createSwissPreset(
    'chateau-chillon',
    'Château de Chillon',
    'Wasserburg am Genfersee',
    'Waadt • Mittelalter',
    'Château de Chillon am Genfersee im Micro-Scale mit Seewasser-Platte, wehrhaften Mauern und roten Dächern',
    'Das meistbesuchte historische Monument der Schweiz, auf einer Felsinsel am östlichen Ufer des Genfersees bei Veytaux erbaut. Die Anlage vereint Festung, herrschaftliche Residenz und Gefängnis.',
    'Schon in der Bronzezeit besiedelt, bauten die Grafen von Savoyen ab dem 12. Jahrhundert die heutige Wehranlage aus. Lord Byron verewigte das Schloss 1816 in seinem berühmten Gedicht „Der Gefangene von Chillon“.',
    CHATEAU_CHILLON_LDR
  ),
  createSwissPreset(
    'kapellbruecke',
    'Die Kapellbrücke Luzern',
    'Mit historischem Wasserturm',
    'Luzern • Wahrzeichen',
    'Die Kapellbrücke in Luzern mit Wasserturm, gedecktem Holzsteg, rotem Dach und Blumenkasten im Reuss-Fluss',
    'Die älteste überdachte Holzbrücke Europas überspannt die Reuss in Luzern. Zusammen mit dem oktogonalen Wasserturm bildet sie das weltbekannte Wahrzeichen der Zentralschweiz.',
    'Erbaut um 1365 als Teil der städtischen Befestigung. Der markante Wasserturm diente im Laufe der Jahrhunderte als Archiv, Tresorraum und sogar als Gefängnis.',
    KAPELLBRUECKE_LDR
  ),
  createSwissPreset(
    'matterhorn-huette',
    'Matterhorn & Zermatt Hütte',
    'Alpines Berg-Diorama',
    'Alpen • Gipfelstürmer',
    'Matterhorn-Gipfel und Hörnlihütte im Diorama-Stil mit alpinen Felsen, Gletscher, Schweizer Flagge und Tannenbaum',
    'Der symbolträchtigste Berg der Schweiz (4478 m ü. M.) in Zermatt, eingefangen in einem stimmungsvollen Miniatur-Diorama mit Berghütte und Schweizer Flagge.',
    'Seit der dramatischen Erstbesteigung durch Edward Whymper im Jahr 1865 zieht die perfekte Pyramidenform des Matterhorns Alpinisten und Architekturfreunde auf der ganzen Welt in ihren Bann.',
    MATTERHORN_HUETTE_LDR
  )
];
