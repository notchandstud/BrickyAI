/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Send, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { OrderInquiry } from '../types';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelName: string;
  prompt: string;
  partCount: number;
  chfPrice: number;
  ldrCode: string;
  onInquirySubmitted?: (inquiry: OrderInquiry) => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  isOpen,
  onClose,
  modelName,
  prompt,
  partCount,
  chfPrice,
  ldrCode,
  onInquirySubmitted
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !email.trim() || !address.trim()) {
      setErrorMessage('Bitte Name, E-Mail und Adresse ausfüllen.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          address,
          postalCode,
          city,
          phone,
          correctionNotes,
          prompt,
          modelName,
          partCount,
          chfPrice,
          ldrCode
        })
      });

      const data = await res.json();
      if (data.success && data.inquiry) {
        setSuccess(true);
        if (onInquirySubmitted) {
          onInquirySubmitted(data.inquiry);
        }
      } else {
        setErrorMessage(data.message || 'Fehler beim Senden der Anfrage.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Verbindungsfehler. Bitte erneut versuchen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setName('');
    setEmail('');
    setAddress('');
    setPostalCode('');
    setCity('');
    setPhone('');
    setCorrectionNotes('');
    setSuccess(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#151515] border-2 border-[#00A896] rounded-xl shadow-2xl overflow-hidden text-[#F5F5F7]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#00A896]/30 bg-[#1A1A1A]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#00A896] font-bold">
              BrickyAI • Schweizer Architektur
            </span>
            <h3 className="text-xl font-bold text-[#F5F5F7]">
              Unikat-Set anfragen &amp; Korrekturwünsche
            </h3>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 rounded-lg text-[#F5F5F7]/40 hover:text-[#00A896] hover:bg-[#00A896]/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {success ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#00A896]/20 border border-[#00A896] flex items-center justify-center mx-auto text-[#00A896]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-bold text-[#F5F5F7]">
                Anfrage erfolgreich gesendet!
              </h4>
              <p className="text-sm text-[#F5F5F7]/70 max-w-md mx-auto leading-relaxed">
                Vielen Dank, <strong className="text-[#00A896]">{name}</strong>! Unser Schweizer Team bei <strong className="text-[#F5F5F7]">BrickyAI</strong> (Powered by Notch &amp; Stud) hat Ihren Entwurf erhalten und meldet sich in Kürze mit Ihrem Angebot.
              </p>
              <div className="bg-[#1A1A1A] p-4 rounded-lg border border-[#00A896]/30 max-w-sm mx-auto text-left text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#F5F5F7]/50">Modell:</span>
                  <span className="text-[#00A896] font-semibold">{modelName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#F5F5F7]/50">Teileanzahl:</span>
                  <span>{partCount} Bricks</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#F5F5F7]/50">Richtpreis:</span>
                  <span className="text-[#00A896] font-bold">CHF {chfPrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="pt-4">
                <button
                  onClick={resetAndClose}
                  className="bg-[#00A896] hover:bg-[#008F80] text-[#121212] font-bold px-8 py-3 rounded-lg uppercase tracking-widest text-xs transition-colors"
                >
                  Zurück zum Studio
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Summary card of what is being requested */}
              <div className="bg-[#18181B] p-4 rounded-lg border border-[#00A896]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#00A896] font-bold">
                    Ausgewählter Entwurf
                  </span>
                  <div className="text-sm font-semibold text-[#F5F5F7]">
                    {modelName}
                  </div>
                  <div className="text-xs text-[#F5F5F7]/60 line-clamp-1 italic">
                    &bdquo;{prompt}&ldquo;
                  </div>
                </div>
                <div className="text-right flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-[#00A896]/20">
                  <span className="text-xs text-[#F5F5F7]/70 font-mono">
                    {partCount} Bricks
                  </span>
                  <span className="text-lg font-bold text-[#00A896]">
                    CHF {chfPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/50 text-red-200 text-xs flex items-center">
                  <span className="mr-2">⚠️</span> {errorMessage}
                </div>
              )}

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#00A896] mb-1 font-bold">
                    Voller Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="z.B. Hans Bernoulli"
                    className="w-full bg-[#1A1A1A] border border-[#00A896]/30 rounded-lg p-3 text-sm focus:outline-none focus:border-[#00A896] text-[#F5F5F7] placeholder-[#F5F5F7]/30"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#00A896] mb-1 font-bold">
                    E-Mail-Adresse *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="z.B. hans@swissaero.ch"
                    className="w-full bg-[#1A1A1A] border border-[#00A896]/30 rounded-lg p-3 text-sm focus:outline-none focus:border-[#00A896] text-[#F5F5F7] placeholder-[#F5F5F7]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#00A896] mb-1 font-bold">
                  Strasse &amp; Hausnummer *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="z.B. Bahnhofstrasse 24"
                  className="w-full bg-[#1A1A1A] border border-[#00A896]/30 rounded-lg p-3 text-sm focus:outline-none focus:border-[#00A896] text-[#F5F5F7] placeholder-[#F5F5F7]/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#00A896] mb-1 font-bold">
                    PLZ
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="8001"
                    className="w-full bg-[#1A1A1A] border border-[#00A896]/30 rounded-lg p-3 text-sm focus:outline-none focus:border-[#00A896] text-[#F5F5F7] placeholder-[#F5F5F7]/30"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase tracking-widest text-[#00A896] mb-1 font-bold">
                    Ort / Gemeinde
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Zürich"
                    className="w-full bg-[#1A1A1A] border border-[#00A896]/30 rounded-lg p-3 text-sm focus:outline-none focus:border-[#00A896] text-[#F5F5F7] placeholder-[#F5F5F7]/30"
                  />
                </div>
              </div>

              {/* Korrekturwünsche Field (Requirement #6) */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#00A896] mb-1 font-bold flex items-center justify-between">
                  <span>Korrekturwünsche &amp; Individualisierung</span>
                  <span className="text-[#F5F5F7]/40 normal-case text-xs">Optional</span>
                </label>
                <textarea
                  rows={3}
                  value={correctionNotes}
                  onChange={(e) => setCorrectionNotes(e.target.value)}
                  placeholder="Z. B.: Bitte die Dachziegel im dunklen Wallis-Schiefer Farbton und den Eingang mit einem historisch geformten Holztor gestalten..."
                  className="w-full bg-[#1A1A1A] border border-[#00A896]/30 rounded-lg p-3 text-sm focus:outline-none focus:border-[#00A896] text-[#F5F5F7] placeholder-[#F5F5F7]/30 resize-none"
                />
              </div>

              {/* Submit & Guarantee */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#00A896]/20">
                <div className="flex items-center text-xs text-[#F5F5F7]/60">
                  <ShieldCheck className="w-4 h-4 text-[#00A896] mr-1.5 flex-shrink-0" />
                  <span>Schweizer Handarbeit • Rebrickable geprüft</span>
                </div>

                <div className="flex space-x-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="flex-1 sm:flex-initial px-5 py-3 rounded-lg border border-[#00A896]/40 text-xs uppercase tracking-widest text-[#F5F5F7]/70 hover:text-[#00A896] transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-initial bg-[#00A896] hover:bg-[#008F80] disabled:opacity-50 text-[#121212] font-bold px-6 py-3 rounded-lg uppercase tracking-widest text-xs transition-colors flex items-center justify-center shadow-lg"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">Sende Anfrage...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 mr-2" />
                        Unikat-Set anfragen
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
