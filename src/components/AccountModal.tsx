import React, { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  UserCheck,
  Users,
  X,
} from 'lucide-react';

export interface SavedProfileSummary {
  id: string;
  gmName: string;
  franchiseName: string;
  franchiseAbbr: string;
  primaryColor: string;
  coins: number;
  teamOvr: number;
  wins: number;
  losses: number;
  updatedAt: string;
}

interface AccountModalProps {
  isOpen: boolean;
  activeProfileId: string;
  currentGmName: string;
  profiles: SavedProfileSummary[];
  onClose: () => void;
  onUpdateGmName: (newName: string) => void;
  onSwitchProfile: (profileId: string) => void;
  onCreateNewProfile: (gmName: string) => void;
  onDeleteProfile: (profileId: string) => void;
  onExportSaveCode: () => string;
  onImportSaveCode: (code: string) => boolean;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  activeProfileId,
  currentGmName,
  profiles,
  onClose,
  onUpdateGmName,
  onSwitchProfile,
  onCreateNewProfile,
  onDeleteProfile,
  onExportSaveCode,
  onImportSaveCode,
}) => {
  const [gmNameInput, setGmNameInput] = useState(currentGmName);
  const [newProfileName, setNewProfileName] = useState('');
  const [importCodeInput, setImportCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  React.useEffect(() => {
    setGmNameInput(currentGmName);
  }, [currentGmName, isOpen]);

  if (!isOpen) return null;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = gmNameInput.trim();
    if (!trimmed) return;
    onUpdateGmName(trimmed);
    setStatusMessage({
      type: 'success',
      text: `GM username updated to "${trimmed}" and auto-saved!`,
    });
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newProfileName.trim();
    if (!trimmed) return;
    onCreateNewProfile(trimmed);
    setNewProfileName('');
    setStatusMessage({
      type: 'success',
      text: `Created and switched to new GM account "${trimmed}"!`,
    });
  };

  const handleCopyExport = () => {
    const code = onExportSaveCode();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setStatusMessage({
      type: 'success',
      text: 'Save Backup Code copied to clipboard! Paste it on any device to load this exact account.',
    });
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importCodeInput.trim()) return;
    const ok = onImportSaveCode(importCodeInput.trim());
    if (ok) {
      setImportCodeInput('');
      setStatusMessage({
        type: 'success',
        text: 'Save Code imported! Your franchise, coins, binder, and records have been restored.',
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: 'Invalid Save Code. Make sure you copied the full backup code string.',
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-sport font-extrabold text-xl text-white">
                  GM ACCOUNT & AUTO-SAVE CLOUD VAULT
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
                  LIVE AUTO-SAVE ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Your coins, cards, lineup, evolutions, and leaderboard records save automatically after every click.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/50 border-rose-500/40 text-rose-200'
              }`}
            >
              <span>{statusMessage.text}</span>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left 7 Cols: Saved GM Accounts on This Device */}
            <div className="md:col-span-7 space-y-4">
              {/* Edit Current GM Username */}
              <form
                onSubmit={handleSaveName}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5"
              >
                <label className="block text-xs font-extrabold uppercase tracking-wider text-amber-400">
                  Active Logged-In GM Username
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={22}
                    value={gmNameInput}
                    onChange={(e) => setGmNameInput(e.target.value)}
                    placeholder="Enter your GM Username..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-sport font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5 transition"
                  >
                    <Save className="w-4 h-4" />
                    Save Name
                  </button>
                </div>
              </form>

              {/* Saved Accounts List */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-sky-400" />
                    Saved GM Accounts on This Browser ({profiles.length})
                  </span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {profiles.map((prof) => {
                    const isCurrent = prof.id === activeProfileId;
                    return (
                      <div
                        key={prof.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                          isCurrent
                            ? 'bg-slate-800/90 border-emerald-400/60 ring-1 ring-emerald-400/30'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-sport font-extrabold text-xs text-white border border-white/20 shrink-0"
                            style={{ backgroundColor: prof.primaryColor }}
                          >
                            {prof.franchiseAbbr}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-sport font-extrabold text-base text-white truncate">
                                {prof.gmName}
                              </span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-400 text-slate-950 text-[9px] font-extrabold uppercase">
                                  ACTIVE
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {prof.franchiseName} •{' '}
                              <strong className="text-amber-400">{prof.teamOvr} OVR</strong> •{' '}
                              {prof.coins.toLocaleString()} Coins • {prof.wins}-{prof.losses}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => {
                                onSwitchProfile(prof.id);
                                setStatusMessage({
                                  type: 'success',
                                  text: `Logged into GM account "${prof.gmName}"!`,
                                });
                              }}
                              className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold uppercase transition"
                            >
                              Switch
                            </button>
                          )}
                          {profiles.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Delete saved GM account "${prof.gmName}"?`
                                  )
                                ) {
                                  onDeleteProfile(prof.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Create New GM Account */}
                <form
                  onSubmit={handleCreateProfile}
                  className="pt-2 border-t border-slate-800 flex gap-2"
                >
                  <input
                    type="text"
                    maxLength={22}
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="New GM Account Name (Start Fresh)..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sport font-extrabold text-xs uppercase tracking-wider flex items-center gap-1 shrink-0 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Account
                  </button>
                </form>
              </div>
            </div>

            {/* Right 5 Cols: Cross-Device Save Code Export & Import */}
            <div className="md:col-span-5 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                  <Download className="w-4 h-4" />
                  1. Backup / Move Account to Another Device
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Want to play on another computer or phone? Copy your encrypted Save Code and paste it there to transfer your entire team and coins!
                </p>
                <button
                  type="button"
                  onClick={handleCopyExport}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-400 hover:brightness-110 text-slate-950 font-sport font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow transition"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied Save Code to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy My Save Backup Code
                    </>
                  )}
                </button>
              </div>

              <form
                onSubmit={handleImport}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
              >
                <div className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Upload className="w-4 h-4" />
                  2. Load Account from Save Code
                </div>
                <textarea
                  rows={3}
                  value={importCodeInput}
                  onChange={(e) => setImportCodeInput(e.target.value)}
                  placeholder="Paste your Save Backup Code here..."
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-sport font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition"
                >
                  <UserCheck className="w-4 h-4" />
                  Restore Account from Code
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
