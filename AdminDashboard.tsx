/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  Download,
  Key,
  ShieldCheck,
  Search,
  Eye,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  FileText,
  Mail,
  MapPin,
  Clock,
  Settings,
  HelpCircle
} from 'lucide-react';
import { OrderInquiry, RebrickableStatus } from '../types';
import { formatLDrawFile } from '../utils/ldrParser';
import { LDrawViewer3D } from './LDrawViewer3D';

interface AdminDashboardProps {
  onBackToStudio: () => void;
  onPreviewModel?: (inquiry: OrderInquiry) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToStudio
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [inquiries, setInquiries] = useState<OrderInquiry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInquiryFor3D, setSelectedInquiryFor3D] = useState<OrderInquiry | null>(null);

  // Rebrickable API settings state
  const [rebrickableStatus, setRebrickableStatus] = useState<RebrickableStatus | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [apiKeySuccessMsg, setApiKeySuccessMsg] = useState<string | null>(null);

  // Fetch inquiries and Rebrickable API status when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchInquiries();
    fetchRebrickableStatus();
  }, [isAuthenticated]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inquiries');
      const data = await res.json();
      if (data.success && Array.isArray(data.inquiries)) {
        setInquiries(data.inquiries);
      }
    } catch (e) {
      console.error('Fehler beim Laden der Anfragen:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRebrickableStatus = async () => {
    try {
      const res = await fetch('/api/rebrickable/status');
      const data = await res.json();
      setRebrickableStatus({
        hasKey: data.hasKey || false,
        keyPreview: data.keyPreview || null,
        mode: data.mode || 'verified_catalog'
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (usernameInput.trim() === 'Admin26' && passwordInput.trim() === 'Hgwe-3719-UTcW-7201') {
      setIsAuthenticated(true);
    } else {
      setAuthError('Falscher Benutzername oder falsches Passwort.');
    }
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiKeySuccessMsg(null);
    try {
      const res = await fetch('/api/rebrickable/set-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKeyInput })
      });
      const data = await res.json();
      if (data.success) {
        setApiKeySuccessMsg(data.message || 'Key erfolgreich gespeichert!');
        setApiKeyInput('');
        fetchRebrickableStatus();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setInquiries(prev =>
          prev.map(i => (i.id === inquiryId ? { ...i, status: newStatus as any } : i))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Requirement #6: "Jede Anfrage im Admin-Board enthält einen Button 'Modell herunterladen (.ldr)',
  // der den gespeicherten LDraw-Textcode als echte .ldr-Datei exportiert, damit ich sie direkt in BrickLink Studio öffnen und bearbeiten kann."
  const handleDownloadLdr = (inq: OrderInquiry) => {
    const formattedContent = formatLDrawFile(
      inq.modelName,
      inq.prompt,
      inq.ldrCode,
      inq.partCount,
      inq.chfPrice
    );

    const blob = new Blob([formattedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `${inq.modelName.toLowerCase().replace(/\s+/g, '-')}-${inq.id}.ldr`;
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered inquiries
  const filteredInquiries = inquiries.filter(inq => {
    const matchesSearch =
      inq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inq.correctionNotes && inq.correctionNotes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 1. LOGIN SCREEN if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212] text-[#F5F5F7] p-6 selection:bg-[#00A896] selection:text-[#121212]">
        <div className="w-full max-w-md bg-[#151515] border-2 border-[#00A896] rounded-xl shadow-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-[#00A896]/30 bg-[#181818] flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tighter text-[#00A896] uppercase">
                Notch &amp; Stud
              </h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#F5F5F7]/60 italic">
                Geschützter Admin-Bereich
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#00A896]/10 border border-[#00A896]/40 flex items-center justify-center text-[#00A896]">
              <Lock className="w-5 h-5" />
            </div>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-5">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#00A896] mb-2 font-bold">
                Benutzername
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Admin-Username..."
                autoFocus
                required
                className="w-full bg-[#1A1A1A] border border-[#00A896]/30 rounded-lg p-3 text-sm focus:outline-none focus:border-[#00A896] text-[#F5F5F7]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#00A896] mb-2 font-bold">
                Passwort
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Admin-Passwort..."
                required
                className="w-full bg-[#1A1A1A] border border-[#00A896]/30 rounded-lg p-3 text-sm focus:outline-none focus:border-[#00A896] text-[#F5F5F7]"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
                {authError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={onBackToStudio}
                className="flex-1 py-3.5 rounded-lg border border-[#00A896]/40 text-xs uppercase tracking-widest text-[#F5F5F7]/70 hover:text-[#00A896] transition-colors"
              >
                Zurück zur App
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#00A896] hover:bg-[#008F80] text-[#121212] font-bold py-3.5 rounded-lg uppercase tracking-widest text-xs transition-colors flex items-center justify-center"
              >
                <Unlock className="w-4 h-4 mr-2" />
                Anmelden
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED ADMIN DASHBOARD
  return (
    <div className="flex flex-col min-h-screen bg-[#121212] text-[#F5F5F7] font-sans">
      {/* Admin Header */}
      <header className="flex flex-wrap items-center justify-between px-8 py-5 border-b border-[#00A896]/30 bg-[#181818] gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBackToStudio}
            className="flex items-center text-xs uppercase tracking-widest text-[#F5F5F7]/70 hover:text-[#00A896] transition-colors bg-[#121212] px-3.5 py-2 rounded-lg border border-[#00A896]/30"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zur Landingpage
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tighter text-[#00A896] leading-none uppercase">
              Notch &amp; Stud • Admin Dashboard
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#F5F5F7]/60 mt-1">
              Schweizer Geschichte, Stein für Stein. — Unikat-Anfragen &amp; API-Sicherheit
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-[#00A896]/10 px-4 py-1.5 rounded-full border border-[#00A896]/40 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-[#00A896]" />
            <span className="text-[#00A896] text-xs font-semibold tracking-wider uppercase">
              SSL • Rebrickable Safe-Proxy
            </span>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-xs uppercase tracking-widest text-[#F5F5F7]/50 hover:text-red-400 border border-[#00A896]/20 px-3 py-1.5 rounded"
          >
            Abmelden
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* SECTION 1: SECURE REBRICKABLE API-KEY CONFIGURATION (Req #5) */}
        <section className="bg-[#151515] border border-[#00A896]/30 rounded-xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#00A896]/20 pb-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-[#00A896]/15 border border-[#00A896] flex items-center justify-center text-[#00A896]">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#F5F5F7]">
                  Backend-Einstellungen: Rebrickable API-Key (Sichere Umgebungs-Variable)
                </h2>
                <p className="text-xs text-[#F5F5F7]/60">
                  Der Schlüssel wird sicher auf dem Express-Server gespeichert und ist niemals im Frontend einsehbar.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="text-[#F5F5F7]/60">Status:</span>
              {rebrickableStatus?.hasKey ? (
                <span className="bg-green-950/60 border border-green-500/50 text-green-300 px-3 py-1 rounded-full font-semibold flex items-center">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                  Live-API verbunden ({rebrickableStatus.keyPreview})
                </span>
              ) : (
                <span className="bg-[#00A896]/15 border border-[#00A896]/40 text-[#00A896] px-3 py-1 rounded-full font-semibold">
                  Notch &amp; Stud Schweizer Katalog aktiv
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSaveApiKey} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="block text-[10px] uppercase tracking-widest text-[#00A896] mb-1 font-bold">
                Neuen Rebrickable API-Key sicher hinterlegen (oder überschreiben)
              </label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="z.B. a1b2c3d4e5f6g7h8i9j0..."
                className="w-full bg-[#1A1A1A] border border-[#00A896]/30 rounded-lg p-3 text-sm focus:outline-none focus:border-[#00A896] text-[#F5F5F7] font-mono"
              />
            </div>
            <button
              type="submit"
              className="bg-[#00A896] hover:bg-[#008F80] text-[#121212] font-bold px-6 py-3 rounded-lg uppercase tracking-widest text-xs transition-colors flex items-center justify-center whitespace-nowrap"
            >
              Key im Server abspeichern
            </button>
          </form>

          {apiKeySuccessMsg && (
            <div className="mt-3 p-3 rounded bg-green-950/40 border border-green-500/50 text-green-200 text-xs flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" />
              {apiKeySuccessMsg}
            </div>
          )}
        </section>

        {/* SECTION 2: LIST OF ALL UNIQUE CUSTOM SET INQUIRIES (Req #6) */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#F5F5F7]">
                Eingegangene Anfragen für Unikat-Sets
              </h2>
              <p className="text-xs text-[#F5F5F7]/60">
                Laden Sie die LDraw (.ldr) Datei mit einem Klick herunter, um den Entwurf direkt in BrickLink Studio zu öffnen und zu finalisieren.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#F5F5F7]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Kunde oder Modell suchen..."
                  className="bg-[#18181A] border border-[#00A896]/30 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#00A896] text-[#F5F5F7]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#18181A] border border-[#00A896]/30 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#00A896] text-[#F5F5F7]"
              >
                <option value="all">Alle Status zeigen</option>
                <option value="neu">🟢 Neu eingegangen</option>
                <option value="in_bearbeitung">🟡 In Bearbeitung</option>
                <option value="konstruktion">🔵 Im CAD Studio</option>
                <option value="abgeschlossen">✅ Abgeschlossen</option>
              </select>

              <button
                onClick={fetchInquiries}
                title="Liste aktualisieren"
                className="p-2 rounded-lg border border-[#00A896]/30 bg-[#18181A] text-[#00A896] hover:bg-[#00A896]/10 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Inquiries Table / Cards */}
          {loading ? (
            <div className="py-16 text-center text-[#00A896]/60 animate-pulse text-sm font-mono">
              Lade Unikat-Anfragen aus dem Notch &amp; Stud Speicher...
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="bg-[#151515] border border-[#00A896]/20 rounded-xl p-12 text-center text-[#F5F5F7]/60">
              Keine Anfragen gefunden, die den gewählten Filtern entsprechen.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="bg-[#151515] border border-[#00A896]/30 rounded-xl p-6 shadow-lg hover:border-[#00A896]/60 transition-all space-y-4"
                >
                  {/* Inquiry Top Row */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#00A896]/20 pb-4">
                    <div className="flex items-center space-x-3">
                      <span className="bg-[#00A896]/10 border border-[#00A896]/40 px-3 py-1 rounded text-[#00A896] text-xs font-mono font-bold">
                        {inq.id}
                      </span>
                      <h3 className="text-lg font-bold text-[#F5F5F7]">
                        {inq.modelName}
                      </h3>
                      <span className="text-xs text-[#F5F5F7]/60 font-mono">
                        ({inq.partCount} Bricks • CHF {inq.chfPrice.toFixed(2)})
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <select
                        value={inq.status}
                        onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                        className="bg-[#1A1A1A] border border-[#00A896]/40 rounded px-3 py-1.5 text-xs text-[#00A896] font-semibold focus:outline-none"
                      >
                        <option value="neu">🟢 Status: Neu</option>
                        <option value="in_bearbeitung">🟡 Status: In Bearbeitung</option>
                        <option value="konstruktion">🔵 Status: Im CAD Studio</option>
                        <option value="abgeschlossen">✅ Status: Abgeschlossen</option>
                      </select>

                      {/* REQUIREMENT #6: "Modell herunterladen (.ldr)" BUTTON */}
                      <button
                        onClick={() => handleDownloadLdr(inq)}
                        className="bg-[#00A896] hover:bg-[#008F80] text-[#121212] font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center shadow-md cursor-pointer"
                        title="Speichert LDraw Textcode für direktes Öffnen in BrickLink Studio"
                      >
                        <Download className="w-4 h-4 mr-1.5" />
                        Modell herunterladen (.ldr)
                      </button>

                      <button
                        onClick={() => setSelectedInquiryFor3D(inq)}
                        className="border border-[#00A896] text-[#00A896] hover:bg-[#00A896]/10 px-3 py-2 rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center cursor-pointer"
                        title="Im 3D Viewport inspizieren"
                      >
                        <Eye className="w-4 h-4 mr-1.5" />
                        3D-Vorschau
                      </button>
                    </div>
                  </div>

                  {/* Customer Info & Prompt Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1.5 bg-[#18181A] p-3.5 rounded-lg border border-[#00A896]/20">
                      <span className="text-[10px] uppercase tracking-widest text-[#00A896] font-bold block">
                        Kunde &amp; Kontakt
                      </span>
                      <div className="font-semibold text-[#F5F5F7] text-sm">
                        {inq.name}
                      </div>
                      <div className="flex items-center text-[#F5F5F7]/80">
                        <Mail className="w-3.5 h-3.5 mr-1.5 text-[#00A896]" />
                        <a href={`mailto:${inq.email}`} className="hover:underline">
                          {inq.email}
                        </a>
                      </div>
                      <div className="flex items-center text-[#F5F5F7]/70">
                        <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#00A896]" />
                        <span>
                          {inq.address}{inq.postalCode ? `, ${inq.postalCode}` : ''}{inq.city ? ` ${inq.city}` : ''}
                        </span>
                      </div>
                      {inq.phone && (
                        <div className="text-[#F5F5F7]/60 font-mono">
                          Tel: {inq.phone}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 bg-[#18181A] p-3.5 rounded-lg border border-[#00A896]/20">
                      <span className="text-[10px] uppercase tracking-widest text-[#00A896] font-bold block">
                        Ursprünglicher KI-Prompt
                      </span>
                      <p className="text-[#F5F5F7]/90 leading-relaxed italic">
                        &bdquo;{inq.prompt}&ldquo;
                      </p>
                      <div className="text-[10px] text-[#F5F5F7]/50 pt-1 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Eingegangen am: {new Date(inq.createdAt).toLocaleDateString('de-CH', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })} Uhr
                      </div>
                    </div>

                    <div className="space-y-1.5 bg-[#18181A] p-3.5 rounded-lg border border-[#00A896]/20">
                      <span className="text-[10px] uppercase tracking-widest text-[#00A896] font-bold block">
                        Korrekturwünsche &amp; Besonderheiten
                      </span>
                      {inq.correctionNotes ? (
                        <p className="text-[#00A896] leading-relaxed font-medium">
                          {inq.correctionNotes}
                        </p>
                      ) : (
                        <p className="text-[#F5F5F7]/40 italic">
                          Keine zusätzlichen Korrekturwünsche angegeben.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Code Preview snippet inside Admin Card */}
                  <div className="bg-[#101012] p-3 rounded-lg border border-[#00A896]/10 flex items-center justify-between font-mono text-[10px]">
                    <div className="truncate text-[#F5F5F7]/60">
                      <span className="text-[#00A896] mr-2">LDraw (.ldr) Auszug:</span>
                      {inq.ldrCode.split('\n').filter(l => l.startsWith('1 ')).slice(0, 3).join(' • ')}...
                    </div>
                    <span className="text-[#00A896] whitespace-nowrap ml-4">
                      Bereit für BrickLink Studio (.ldr)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* MODAL: 3D PREVIEW FOR ADMIN */}
      {selectedInquiryFor3D && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-5xl h-[80vh] bg-[#151515] border-2 border-[#00A896] rounded-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-[#181818] border-b border-[#00A896]/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#00A896] font-bold">
                  Notch &amp; Stud • CAD 3D-Inspektion
                </span>
                <h3 className="text-lg font-bold text-[#F5F5F7]">
                  {selectedInquiryFor3D.modelName} (Kunde: {selectedInquiryFor3D.name})
                </h3>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleDownloadLdr(selectedInquiryFor3D)}
                  className="bg-[#00A896] hover:bg-[#008F80] text-[#121212] font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  .ldr Exportieren
                </button>
                <button
                  onClick={() => setSelectedInquiryFor3D(null)}
                  className="px-3 py-2 rounded-lg border border-[#00A896]/40 text-xs uppercase tracking-widest text-[#F5F5F7]/70 hover:text-[#00A896]"
                >
                  Schliessen
                </button>
              </div>
            </div>
            <div className="flex-1 relative">
              <LDrawViewer3D
                ldrCode={selectedInquiryFor3D.ldrCode}
                modelName={selectedInquiryFor3D.modelName}
              />
            </div>
          </div>
        </div>
      )}

      {/* Admin Footer */}
      <footer className="h-12 bg-[#00A896] px-8 flex items-center justify-between text-[#121212] text-[9px] font-bold uppercase tracking-widest">
        <span>&copy; 2026 Notch &amp; Stud - Handgefertigt in der Schweiz</span>
        <div className="flex space-x-6">
          <span>BrickLink Studio Kompatibel: OK</span>
          <span>Rebrickable Secure Proxy: AKTIV</span>
          <span>LDR v1.0.4</span>
        </div>
      </footer>
    </div>
  );
};
