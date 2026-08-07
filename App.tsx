/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Download,
  Send,
  Layers,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Eye,
  Info,
  ChevronRight,
  Database,
  SlidersHorizontal,
  Wrench,
  Ruler,
  User,
  LogOut,
  Save,
  FolderHeart,
  Lock,
  Unlock,
  Zap,
  Cuboid
} from 'lucide-react';
import { LDrawViewer3D } from './components/LDrawViewer3D';
import { InquiryModal } from './components/InquiryModal';
import { AdminDashboard } from './components/AdminDashboard';
import { SWISS_PRESETS } from './data/swissPresets';
import {
  calculateChfPrice,
  formatLDrawFile,
  parseLDrawCode,
  calculateModelDimensions,
  normalizeAndFixLDrawCode
} from './utils/ldrParser';
import { validateLDrawModelParts } from './utils/rebrickableApi';
import { LDrawModel, RebrickableValidationResult, SwissPreset } from './types';

export default function App() {

  // Navigation State (Landingpage vs Admin Dashboard)
  const [viewMode, setViewMode] = useState<'studio' | 'admin'>('studio');

  // Loaded model state (Standard: empty defaults, target parts 100)
  const [promptText, setPromptText] = useState<string>('');
  const [modelName, setModelName] = useState<string>('');
  const [targetPartCount, setTargetPartCount] = useState<number>(100);

  // Calculated LDraw data & CHF price
  const [ldrCode, setLdrCode] = useState<string>('');
  const [partCount, setPartCount] = useState<number>(0);
  const [chfPrice, setChfPrice] = useState<number>(0);

  // AI Generation status
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Rebrickable API validation status
  const [validationResults, setValidationResults] = useState<RebrickableValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationMode, setValidationMode] = useState<'rebrickable_api' | 'swiss_catalog_fallback'>('swiss_catalog_fallback');

  // Modal State
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState<boolean>(false);

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('bricky_user') || null;
  });
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authUsername, setAuthUsername] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authErrorMsg, setAuthErrorMsg] = useState<string | null>(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState<string | null>(null);
  const [savedModelsList, setSavedModelsList] = useState<any[]>([]);
  const [isSavingModel, setIsSavingModel] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser) {
      fetchUserModels(currentUser);
    } else {
      setSavedModelsList([]);
    }
  }, [currentUser]);

  const fetchUserModels = async (username: string) => {
    try {
      const res = await fetch(`/api/user/models/${username}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.models)) {
        setSavedModelsList(data.models);
      }
    } catch (err) {
      console.warn('Error loading user models:', err);
    }
  };

  // Optimizer / Statics feedback message
  const [optimizerMsg, setOptimizerMsg] = useState<string | null>(null);

  // Real-time physical model dimensions (cm, studs, brick layers)
  const dimensions = React.useMemo(() => {
    const parsed = parseLDrawCode(ldrCode);
    return calculateModelDimensions(parsed.bricks);
  }, [ldrCode]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorMsg(null);
    setAuthSuccessMsg(null);

    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authUsername, password: authPassword })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (authMode === 'login') {
          if (data.isAdmin) {
            setViewMode('admin');
            setAuthUsername('');
            setAuthPassword('');
            return;
          }
          setCurrentUser(data.username);
          localStorage.setItem('bricky_user', data.username);
          setAuthSuccessMsg(`Willkommen zurück, ${data.username}!`);
          setAuthUsername('');
          setAuthPassword('');
        } else {
          setAuthSuccessMsg(data.message || 'Registrierung erfolgreich! Bitte anmelden.');
          setAuthMode('login');
          setAuthPassword('');
        }
      } else {
        setAuthErrorMsg(data.message || 'Falscher Benutzername oder Passwort.');
      }
    } catch (err) {
      console.error(err);
      setAuthErrorMsg('Verbindungsfehler zum Server.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bricky_user');
    setAuthSuccessMsg(null);
    setAuthErrorMsg(null);
  };

  const handleSaveModel = async () => {
    if (!currentUser || !ldrCode) return;
    setIsSavingModel(true);
    setAuthErrorMsg(null);
    setAuthSuccessMsg(null);

    try {
      const res = await fetch('/api/user/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser,
          modelName,
          prompt: promptText,
          ldrCode,
          partCount
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAuthSuccessMsg('Modell erfolgreich gespeichert!');
        fetchUserModels(currentUser);
      } else {
        setAuthErrorMsg(data.message || 'Fehler beim Speichern.');
      }
    } catch (err) {
      console.error(err);
      setAuthErrorMsg('Verbindungsfehler.');
    } finally {
      setIsSavingModel(false);
    }
  };

  const handleLoadSavedModel = (model: any) => {
    setLdrCode(model.ldrCode);
    setModelName(model.modelName);
    setPromptText(model.prompt || '');
    setAuthSuccessMsg(`Modell "${model.modelName}" geladen.`);
  };

  // Recalculate stats whenever LDraw text code changes

  useEffect(() => {
    const parsed = parseLDrawCode(ldrCode);
    setPartCount(parsed.partCount);
    setChfPrice(parsed.chfPrice);

    // Validate parts against Rebrickable API / Swiss Catalog
    setIsValidating(true);
    validateLDrawModelParts(parsed.bricks)
      .then((res) => {
        setValidationResults(res.results);
        setValidationMode(res.mode);
      })
      .catch((e) => {
        console.warn('Rebrickable validation error:', e);
      })
      .finally(() => {
        setIsValidating(false);
      });
  }, [ldrCode]);

  // Handler: Select preset removed (defaulting to 100 bricks, Vorlagen removed)

  // Handler: Generate LDraw code using AI / backend
  const handleGenerateLDraw = async () => {
    if (!promptText.trim()) return;
    setIsGenerating(true);
    setGenerationError(null);

    try {
      const res = await fetch('/api/generate-ldr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText, targetPartCount, version: 'click1fast' })
      });

      const data = await res.json();
      if (res.ok && data.success && data.ldrCode) {
        setLdrCode(data.ldrCode);
        // Extract a nice model name from prompt
        const words = promptText.trim().split(' ');
        const shortTitle = words.slice(0, 4).join(' ').replace(/[^a-zA-ZäöüÄÖÜß\s]/g, '');
        setModelName(shortTitle || 'Schweizer Architektur Unikat');
      } else {
        // Fallback: If Gemini key isn't configured or quota exceeded, adapt the closest Swiss preset
        const closest = SWISS_PRESETS.find(p =>
          promptText.toLowerCase().includes('chillon') || promptText.toLowerCase().includes('schloss') || promptText.toLowerCase().includes('castle')
            ? p.id === 'chateau-chillon'
            : promptText.toLowerCase().includes('kapell') || promptText.toLowerCase().includes('brücke') || promptText.toLowerCase().includes('bridge')
            ? p.id === 'kapellbruecke'
            : promptText.toLowerCase().includes('matterhorn') || promptText.toLowerCase().includes('zermatt') || promptText.toLowerCase().includes('berg')
            ? p.id === 'matterhorn-huette'
            : p.id === 'wallis-chalet'
        ) || SWISS_PRESETS[0];

        setLdrCode(closest.ldrCode);
        setModelName(closest.title);
        if (data.error) {
          setGenerationError(`${data.error} — Zeige verifizierten Schweizer LDraw-Entwurf für dieses Modell.`);
        }
      }
    } catch (err) {
      console.error('Fehler beim Aufruf von /api/generate-ldr:', err);
      // Fallback
      setLdrCode(SWISS_PRESETS[0].ldrCode);
      setModelName(SWISS_PRESETS[0].title);
      setGenerationError('Verbindung zum KI-Server unterbrochen. Zeige Schweizer Walliser Bauernhaus Vorlage.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handler: Download the LDraw file for BrickLink Studio
  const handleDownloadLDrawFile = () => {
    try {
      const name = modelName ? modelName.trim() : 'Schweizer Architektur Unikat';
      const formatted = formatLDrawFile(name, promptText || '', ldrCode || '', partCount || 0, chfPrice || 0);
      
      // Clean up filename to prevent issues with special characters or empty string
      const safeName = name
        .toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[^a-z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .trim();
      const filename = `${safeName || 'modell'}-notchandstud.ldr`;
      
      // Use standard form submission to trigger server-side attachment download,
      // bypassing any iframe sandbox blob download blocks completely
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/api/download-ldr';
      form.style.display = 'none';
      
      const filenameInput = document.createElement('input');
      filenameInput.type = 'hidden';
      filenameInput.name = 'filename';
      filenameInput.value = filename;
      
      const contentInput = document.createElement('input');
      contentInput.type = 'hidden';
      contentInput.name = 'content';
      contentInput.value = formatted;
      
      form.appendChild(filenameInput);
      form.appendChild(contentInput);
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    } catch (err) {
      console.error('Download error:', err);
      setAuthErrorMsg('Der automatische Download ist fehlgeschlagen. Bitte nutzen Sie den Button "LDraw-Code kopieren".');
    }
  };

  // If Admin Dashboard is selected
  if (viewMode === 'admin') {
    return (
      <AdminDashboard
        onBackToStudio={() => setViewMode('studio')}
      />
    );
  }

  // 1. SLEEK INTERFACE LANDINGPAGE (BRICKY AI IN FOREGROUND, NOTCH & STUD IN BACKGROUND)
  return (
    <div className="flex flex-col min-h-screen bg-[#121212] text-[#F5F5F7] font-sans overflow-hidden border-t-2 border-[#00A896] selection:bg-[#00A896] selection:text-[#121212]">
      {/* HEADER: BrickyAI in foreground, Notch & Stud subtle */}
      <header className="flex flex-wrap items-center justify-between px-6 md:px-8 py-4 border-b border-[#00A896]/20 bg-[#161616] gap-4 z-30">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#00A896] leading-none">
              BrickyAI
            </h1>
            <span className="text-[10px] uppercase tracking-widest bg-[#00A896]/15 border border-[#00A896]/40 text-[#00A896] px-2 py-0.5 rounded font-mono">
              3D Studio
            </span>
            <span className="text-[10px] uppercase tracking-widest bg-red-900/30 border border-red-500/40 text-red-400 px-2 py-0.5 rounded font-mono">
              BETA
            </span>
          </div>
          <p className="text-[11px] text-[#F5F5F7]/50 mt-1">
            Powered by <span className="text-[#00A896] font-semibold">Notch &amp; Stud</span>
          </p>
        </div>

        <div className="flex items-center space-x-3.5">
          {currentUser === 'Admin26' && (
            <button
              onClick={() => setViewMode('admin')}
              className="text-[#F5F5F7]/60 hover:text-[#00A896] text-xs uppercase tracking-wider border border-[#00A896]/20 hover:border-[#00A896]/60 bg-[#1A1A1A] px-3.5 py-1.5 rounded-lg transition-all flex items-center cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 mr-1.5 text-[#00A896]" />
              Admin Dashboard
            </button>
          )}
          <div className="flex bg-[#1A1A1A] rounded-lg border border-[#00A896]/20 p-1">
            <span
              className="text-xs font-mono font-bold px-3 py-1 rounded-md transition-all flex items-center gap-1 text-[#00A896] bg-[#00A896]/15 border border-[#00A896]/30"
            >
              <Zap className="w-3 h-3" />
              Click 1 Fast
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT WORKSPACE: LEFT SLEEK CONTROL SIDEBAR + RIGHT 3D VIEWPORT */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* LEFT SLEEK CONTROL SIDEBAR (Cleaner, less overloaded) */}
        <div className="w-full lg:w-[390px] border-b lg:border-b-0 lg:border-r border-[#00A896]/15 p-6 flex flex-col space-y-5 bg-[#161616] z-20 overflow-y-auto max-h-[50vh] lg:max-h-none">
          {/* Prompt Section */}
          <div className="space-y-2">
            <label className="block text-[11px] uppercase tracking-widest text-[#00A896] font-semibold">
              Prompt
            </label>
            <textarea
              rows={3}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="w-full bg-[#1C1C1D] border border-[#00A896]/25 rounded-lg p-3 text-sm focus:outline-none focus:border-[#00A896] resize-none text-[#F5F5F7] placeholder-[#F5F5F7]/30 transition-colors"
              placeholder="Ein traditionelles Walliser Bauernhaus im Micro-Scale..."
            />
          </div>

          {/* BRICK COUNT REGULATOR */}
          <div className="space-y-2 bg-[#1C1C1D] p-3.5 rounded-lg border border-[#00A896]/15">
            <div className="flex items-center justify-between">
              <label className="text-[11px] uppercase tracking-wider text-[#F5F5F7]/80 flex items-center font-medium">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#00A896] mr-1.5" />
                Ungefähre Steineanzahl
              </label>
              <span className="text-xs font-mono font-bold text-[#00A896]">
                ca. {targetPartCount} Steine
              </span>
            </div>
            
            <input
              type="range"
              min={50}
              max={150}
              step={25}
              value={targetPartCount}
              onChange={(e) => setTargetPartCount(Number(e.target.value))}
              className="w-full accent-[#00A896] h-1.5 bg-[#2C2C2E] rounded-lg appearance-none cursor-pointer"
            />
            
            <div className="flex justify-between items-center pt-1">
              {[50, 75, 100, 150].map((presetVal) => (
                <button
                  key={presetVal}
                  type="button"
                  onClick={() => setTargetPartCount(presetVal)}
                  className={`text-[10px] px-2 py-0.5 rounded font-mono border transition-all cursor-pointer ${
                    targetPartCount === presetVal
                      ? 'bg-[#00A896] text-[#121212] border-[#00A896] font-bold shadow-sm'
                      : 'bg-[#252527] text-[#F5F5F7]/60 border-transparent hover:text-[#00A896]'
                  }`}
                >
                  {presetVal}
                </button>
              ))}
            </div>
          </div>

          {/* GENERATE BUTTON */}
          <button
            onClick={handleGenerateLDraw}
            disabled={isGenerating}
            className="w-full bg-[#00A896] hover:bg-[#008F80] disabled:opacity-50 text-[#121212] font-bold py-3.5 rounded-lg uppercase tracking-wider text-xs transition-all flex items-center justify-center shadow-md cursor-pointer"
          >
            {isGenerating ? (
              <span className="flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Modell wird generiert</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>3D-Modell generieren</span>
              </span>
            )}
          </button>

          {generationError && (
            <div className="p-3 rounded-lg bg-yellow-950/40 border border-yellow-500/50 text-yellow-200 text-xs">
              ℹ️ {generationError}
            </div>
          )}

          {/* SLEEK STATS CARD: PART COUNT & MODEL DIMENSIONS */}
          {ldrCode && (
            <div className="bg-[#1C1C1D] p-4 rounded-lg border border-[#00A896]/15 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#F5F5F7]/80 flex items-center font-medium">
                  <Layers className="w-3.5 h-3.5 text-[#00A896] mr-1.5" />
                  Aktuelle Teile:
                </span>
                <span className="text-lg font-mono font-semibold text-[#F5F5F7]">
                  {partCount} <span className="text-xs text-[#00A896]">Bricks</span>
                </span>
              </div>

              {/* REAL-TIME MODEL DIMENSIONS (H x W x D) */}
              <div className="pt-2 border-t border-white/5 text-[11px] space-y-1">
                <div className="flex justify-between items-center text-[#F5F5F7]/80">
                  <span className="flex items-center font-medium">
                    <Ruler className="w-3.5 h-3.5 text-[#00A896] mr-1.5" />
                    Modell-Maße (B × T × H):
                  </span>
                  <span className="font-mono text-xs font-semibold text-[#00A896]">
                    ca. {dimensions.widthCm} × {dimensions.depthCm} × {dimensions.heightCm} cm
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-[#F5F5F7]/40 font-mono">
                  <span>Grundriss: {dimensions.widthStuds}×{dimensions.depthStuds} Studs</span>
                  <span>Höhe: {dimensions.heightBricks} Bricks</span>
                </div>
              </div>
            </div>
          )}

          {/* PROMINENT DOWNLOAD BUTTON & COPY BUTTON */}
          {ldrCode && (
            <div className="pt-2 space-y-2">
              <button
                onClick={handleDownloadLDrawFile}
                className="w-full bg-[#00A896] hover:bg-[#008F80] text-[#121212] font-bold py-3 px-4 rounded-lg uppercase tracking-wider text-xs transition-all flex items-center justify-center shadow-md cursor-pointer"
                title="Echte .ldr Datei für BrickLink Studio herunterladen"
              >
                <Download className="w-4 h-4 mr-2" />
                <span>3D-Modell herunterladen (.ldr)</span>
              </button>

              <button
                onClick={() => {
                  try {
                    const name = modelName ? modelName.trim() : 'Schweizer Architektur Unikat';
                    const formatted = formatLDrawFile(name, promptText || '', ldrCode || '', partCount || 0, chfPrice || 0);
                    navigator.clipboard.writeText(formatted);
                    setAuthSuccessMsg('LDraw-Code erfolgreich kopiert!');
                    setTimeout(() => setAuthSuccessMsg(null), 4000);
                  } catch (err) {
                    console.error('Clipboard copy error:', err);
                  }
                }}
                className="w-full bg-[#1C1C1D] hover:bg-[#252528] border border-[#00A896]/40 text-[#00A896] font-bold py-2.5 px-4 rounded-lg uppercase tracking-wider text-xs transition-all flex items-center justify-center cursor-pointer"
                title="Kopiere den rohen LDraw-Code zum manuellen Einfügen"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                <span>LDraw-Code kopieren</span>
              </button>
            </div>
          )}

          {/* BENUTZERKONTO / USER AUTH PANEL */}
          <div className="border-t border-[#00A896]/20 pt-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#00A896] flex items-center">
              <User className="w-3.5 h-3.5 mr-1.5" />
              Benutzerkonto
            </h3>

            {currentUser ? (
              // Logged in View
              <div className="bg-[#1C1C1D] p-3.5 rounded-lg border border-[#00A896]/15 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-[#F5F5F7]/40 block text-[9px] uppercase tracking-wider">Angemeldet als</span>
                    <span className="font-bold text-[#F5F5F7] text-sm">{currentUser}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded bg-red-950/40 text-red-400 hover:bg-red-900/50 border border-red-500/30 text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                    title="Abmelden"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Ausloggen</span>
                  </button>
                </div>

                {/* Save Current Model option */}
                {ldrCode && (
                  <button
                    onClick={handleSaveModel}
                    disabled={isSavingModel}
                    className="w-full bg-[#00A896] hover:bg-[#008F80] text-[#121212] disabled:opacity-50 font-bold py-2 px-3 rounded text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isSavingModel ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Modell speichern</span>
                  </button>
                )}

                {/* Feedback notifications */}
                {authSuccessMsg && (
                  <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-[11px] font-medium animate-fadeIn">
                    ✓ {authSuccessMsg}
                  </div>
                )}
                {authErrorMsg && (
                  <div className="p-2 rounded bg-red-950/40 border border-red-500/40 text-red-300 text-[11px] font-medium animate-fadeIn">
                    ⚠ {authErrorMsg}
                  </div>
                )}

                {/* Saved models list */}
                {savedModelsList.length > 0 && (
                  <div className="border-t border-white/5 pt-3.5 space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-[#F5F5F7]/50 flex items-center font-bold">
                      <FolderHeart className="w-3.5 h-3.5 mr-1 text-[#00A896]" />
                      Gespeicherte Modelle ({savedModelsList.length})
                    </span>
                    <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                      {savedModelsList.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between p-2 rounded bg-[#121212] border border-[#00A896]/10 text-xs hover:border-[#00A896]/30 transition-all"
                        >
                          <div className="truncate pr-2">
                            <span className="font-bold text-[#F5F5F7] block truncate">{m.modelName}</span>
                            <span className="text-[10px] text-[#00A896] font-mono">{m.partCount} Teile</span>
                          </div>
                          <button
                            onClick={() => handleLoadSavedModel(m)}
                            className="bg-[#00A896]/10 hover:bg-[#00A896] text-[#00A896] hover:text-[#121212] border border-[#00A896]/30 px-2 py-1 rounded text-[10px] font-semibold transition-colors cursor-pointer"
                          >
                            Laden
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Login / Register form
              <div className="bg-[#1C1C1D] p-3.5 rounded-lg border border-[#00A896]/15 space-y-3">
                <div className="flex border-b border-white/5">
                  <button
                    onClick={() => { setAuthMode('login'); setAuthErrorMsg(null); setAuthSuccessMsg(null); }}
                    className={`flex-1 pb-2 text-xs uppercase font-bold tracking-widest border-b-2 text-center transition-all cursor-pointer ${
                      authMode === 'login'
                        ? 'border-[#00A896] text-[#00A896]'
                        : 'border-transparent text-[#F5F5F7]/40 hover:text-[#F5F5F7]'
                    }`}
                  >
                    Anmelden
                  </button>
                  <button
                    onClick={() => { setAuthMode('register'); setAuthErrorMsg(null); setAuthSuccessMsg(null); }}
                    className={`flex-1 pb-2 text-xs uppercase font-bold tracking-widest border-b-2 text-center transition-all cursor-pointer ${
                      authMode === 'register'
                        ? 'border-[#00A896] text-[#00A896]'
                        : 'border-transparent text-[#F5F5F7]/40 hover:text-[#F5F5F7]'
                    }`}
                  >
                    Registrieren
                  </button>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Benutzername..."
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    className="w-full bg-[#121212] border border-[#00A896]/20 rounded p-2 text-xs text-[#F5F5F7] focus:outline-none focus:border-[#00A896] placeholder-[#F5F5F7]/20"
                  />
                  <input
                    type="password"
                    required
                    placeholder="Passwort..."
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-[#121212] border border-[#00A896]/20 rounded p-2 text-xs text-[#F5F5F7] focus:outline-none focus:border-[#00A896] placeholder-[#F5F5F7]/20"
                  />
                  <button
                    type="submit"
                    className="w-full bg-[#00A896]/10 border border-[#00A896] text-[#00A896] hover:bg-[#00A896] hover:text-[#121212] font-bold py-2 rounded text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {authMode === 'login' ? <Unlock className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    <span>{authMode === 'login' ? 'Anmelden' : 'Registrieren'}</span>
                  </button>
                </form>

                {/* Feedback notifications */}
                {authSuccessMsg && (
                  <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-[11px] font-medium animate-fadeIn">
                    ✓ {authSuccessMsg}
                  </div>
                )}
                {authErrorMsg && (
                  <div className="p-2 rounded bg-red-950/40 border border-red-500/40 text-red-300 text-[11px] font-medium animate-fadeIn">
                    ⚠ {authErrorMsg}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT 3D VIEWPORT (THREE.JS INTERACTIVE MODEL) */}
        <div className="flex-1 bg-[#0D0D0E] relative min-h-[450px] lg:min-h-0 flex flex-col">
          {ldrCode ? (
            <LDrawViewer3D
              ldrCode={ldrCode}
              modelName={modelName}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#0D0D0E] relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#00A896 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
                }}
              />
              <div className="max-w-md space-y-4 z-10 animate-fadeIn">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#00A896]/10 border border-[#00A896]/30 flex items-center justify-center text-[#00A896]">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-[#F5F5F7] tracking-wide uppercase">
                  BrickyAI 3D Viewport bereit
                </h3>
                <p className="text-sm text-[#F5F5F7]/60 leading-relaxed">
                  Geben Sie links Ihre Konstruktionswünsche in das Prompt-Feld ein und starten Sie die Generierung, um ein dreidimensionales Schweizer Architekturmodell in Echtzeit zu berechnen.
                </p>
                <div className="inline-flex items-center space-x-2 bg-[#00A896]/5 border border-[#00A896]/20 px-3 py-1.5 rounded-full text-[10px] text-[#00A896] uppercase font-mono tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00A896] animate-ping" />
                  <span>Warte auf Prompt...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER: BrickyAI in foreground, Notch & Stud detailed disclaimer */}
      <footer className="bg-[#151515] border-t border-[#00A896]/15 px-6 md:px-8 py-4 space-y-2.5 text-[10px] text-[#F5F5F7]/50 z-30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 <strong className="text-[#00A896]">BrickyAI</strong> &bull; A Notch &amp; Stud Switzerland Project</span>
          <div className="flex space-x-4 font-mono text-[9px] text-[#F5F5F7]/40">
            <span>Rebrickable Validated</span>
            <span>&bull;</span>
            <span>LDraw v1.0.4</span>
          </div>
        </div>
        <p className="text-[9px] leading-relaxed text-[#F5F5F7]/40 border-t border-[#00A896]/10 pt-2 text-center sm:text-left">
          <strong>Haftungsausschluss:</strong> Aufgrund des algorithmischen Berechnungsverfahrens der KI können Klemmbausteine in Einzelfällen kollidieren (ineinandergreifen) oder freischwebend platziert sein. Notch &amp; Stud übernimmt im Namen von BrickyAI keinerlei Haftung für die physische Realisierbarkeit, Statik oder strukturelle Integrität des generierten Modells.
        </p>
      </footer>

      {/* ORDER INQUIRY MODAL ("UNIKAT-SET ANFRAGEN") */}
      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        modelName={modelName}
        prompt={promptText}
        partCount={partCount}
        chfPrice={chfPrice}
        ldrCode={ldrCode}
        onInquirySubmitted={(newInquiry) => {
          // Keep modal open on success screen so customer can see confirmation
        }}
      />
    </div>
  );
}
