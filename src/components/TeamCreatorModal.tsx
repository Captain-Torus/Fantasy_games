import React, { useState } from 'react';
import {
  JerseyStyle,
  SportId,
  TeamIdentity,
  UniverseMode,
} from '../types/game';
import {
  DEFAULT_CUSTOM_TEAM,
  NBA_PLAYER_CARDS,
  REAL_NBA_TEAMS,
} from '../data/nbaData';
import { PlayerCard } from './PlayerCard';
import { Check, Palette, Shield, Sparkles, Trophy, X } from 'lucide-react';

interface TeamCreatorModalProps {
  isOpen: boolean;
  currentTeam: TeamIdentity;
  currentUniverse: UniverseMode;
  useFranchiseJersey: boolean;
  onSave: (
    team: TeamIdentity,
    universe: UniverseMode,
    useFranchiseJersey: boolean
  ) => void;
  onClose: () => void;
}

const SPORTS_LIST: {
  id: SportId;
  label: string;
  subtitle: string;
  active: boolean;
}[] = [
  {
    id: 'NBA',
    label: 'NBA Basketball',
    subtitle: '5 Starters (PG, SG, SF, PF, C) + 6th Man • Active Now',
    active: true,
  },
  {
    id: 'NFL',
    label: 'NFL Football',
    subtitle: '9 Core Slots (QB, RB, 2 WR, TE, OL, DL, LB, DB) • Expansion Module',
    active: false,
  },
  {
    id: 'NHL',
    label: 'NHL Hockey',
    subtitle: '6 Core Slots (LW, C, RW, LD, RD, G) • Expansion Module',
    active: false,
  },
  {
    id: 'CFB',
    label: 'College Football',
    subtitle: '9 Core Slots + Recruiting Prestige • Expansion Module',
    active: false,
  },
];

export const TeamCreatorModal: React.FC<TeamCreatorModalProps> = ({
  isOpen,
  currentTeam,
  currentUniverse,
  useFranchiseJersey,
  onSave,
  onClose,
}) => {
  const [tab, setTab] = useState<'CUSTOM' | 'REAL'>(
    currentTeam.isCustom ? 'CUSTOM' : 'REAL'
  );
  const [selectedRealTeam, setSelectedRealTeam] = useState<TeamIdentity>(
    currentTeam.isCustom ? REAL_NBA_TEAMS[0] : currentTeam
  );
  const [customTeam, setCustomTeam] = useState<TeamIdentity>(
    currentTeam.isCustom ? currentTeam : DEFAULT_CUSTOM_TEAM
  );
  const [universe, setUniverse] = useState<UniverseMode>(currentUniverse);
  const [wearFranchiseJersey, setWearFranchiseJersey] =
    useState<boolean>(useFranchiseJersey);

  if (!isOpen) return null;

  const activeTeamPreview = tab === 'CUSTOM' ? customTeam : selectedRealTeam;
  const sampleCard =
    universe === 'FANTASTICAL'
      ? NBA_PLAYER_CARDS.find((c) => c.id === 'fict-blaze-primetime-99')!
      : NBA_PLAYER_CARDS.find((c) => c.id === 'mj-primetime-99')!;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-amber-400" />
            <div>
              <h2 className="font-sport font-extrabold text-xl text-white">
                FRANCHISE IDENTITY, SPORT & UNIVERSE STUDIO
              </h2>
              <p className="text-xs text-slate-400">
                Purely visual & identity choice — every franchise starts with equal starter packs & coins.
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          {/* Left 8 Cols: Configuration Controls */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* 1. Sport League Module Selector */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                1. League Module (NBA Active First)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {SPORTS_LIST.map((s) => (
                  <div
                    key={s.id}
                    className={`p-3 rounded-xl border text-left transition ${
                      s.active
                        ? 'bg-amber-500/15 border-amber-400 text-white'
                        : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-sport font-extrabold text-sm">{s.label}</span>
                      {s.active ? (
                        <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded bg-amber-400 text-slate-950">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-800 text-slate-400">
                          SOON
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] leading-snug">{s.subtitle}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Universe Selection */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                2. Player Pool Universe & Lineup Rules
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setUniverse('REALISTIC')}
                  className={`p-3.5 rounded-xl border text-left transition ${
                    universe === 'REALISTIC'
                      ? 'bg-sky-500/15 border-sky-400 text-white ring-2 ring-sky-400/20'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-sport font-extrabold text-sm text-sky-300 mb-1">
                    REALISTIC NBA
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Real current & historical NBA stars. Max <strong>1 edition</strong> of the same player in your starting lineup.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setUniverse('FANTASTICAL')}
                  className={`p-3.5 rounded-xl border text-left transition ${
                    universe === 'FANTASTICAL'
                      ? 'bg-fuchsia-500/15 border-fuchsia-400 text-white ring-2 ring-fuchsia-400/20'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-sport font-extrabold text-sm text-fuchsia-300 mb-1">
                    FANTASTICAL (FICTIONAL)
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Custom fictional legends (Blaze Vance, Atlas Sterling). Can start multiple editions of a player at once!
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setUniverse('CROSSOVER')}
                  className={`p-3.5 rounded-xl border text-left transition ${
                    universe === 'CROSSOVER'
                      ? 'bg-amber-500/15 border-amber-400 text-white ring-2 ring-amber-400/20'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="font-sport font-extrabold text-sm text-amber-300 mb-1">
                    CROSSOVER UNIVERSE
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Combines Real NBA legends + Fantastical icons in the same packs & draft board with no lineup limits!
                  </p>
                </button>
              </div>
            </div>

            {/* 3. Real Franchise vs Custom Franchise */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  3. Franchise Identity (Real NBA Team vs. Custom Made-Up Team)
                </label>
                <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setTab('REAL')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                      tab === 'REAL'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Real Team (e.g. Hawks)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('CUSTOM')}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                      tab === 'CUSTOM'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Custom Team (e.g. Arizona Angels)
                  </button>
                </div>
              </div>

              {tab === 'REAL' ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {REAL_NBA_TEAMS.map((team) => {
                    const isSelected = selectedRealTeam.id === team.id;
                    return (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => setSelectedRealTeam(team)}
                        className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                          isSelected
                            ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/30'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-extrabold text-white"
                            style={{ backgroundColor: team.primaryColor }}
                          >
                            {team.abbreviation}
                          </span>
                          <div className="flex gap-1">
                            <span
                              className="w-3 h-3 rounded-full border border-white/20"
                              style={{ backgroundColor: team.primaryColor }}
                            />
                            <span
                              className="w-3 h-3 rounded-full border border-white/20"
                              style={{ backgroundColor: team.secondaryColor }}
                            />
                          </div>
                        </div>
                        <div className="text-xs text-slate-400">{team.city}</div>
                        <div className="font-sport font-extrabold text-sm text-white">
                          {team.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      City / Region
                    </label>
                    <input
                      type="text"
                      value={customTeam.city}
                      onChange={(e) =>
                        setCustomTeam({ ...customTeam, city: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-semibold"
                      placeholder="Arizona"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Team Nickname
                    </label>
                    <input
                      type="text"
                      value={customTeam.name}
                      onChange={(e) =>
                        setCustomTeam({ ...customTeam, name: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-semibold"
                      placeholder="Angels"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      3-Letter Scoreboard Tag
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      value={customTeam.abbreviation}
                      onChange={(e) =>
                        setCustomTeam({
                          ...customTeam,
                          abbreviation: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-bold uppercase"
                      placeholder="AZA"
                    />
                  </div>

                  {/* Colors & Jersey Cut */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Primary Jersey Color
                    </label>
                    <input
                      type="color"
                      value={customTeam.primaryColor}
                      onChange={(e) =>
                        setCustomTeam({
                          ...customTeam,
                          primaryColor: e.target.value,
                        })
                      }
                      className="w-full h-9 rounded-lg bg-slate-900 border border-slate-700 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Secondary Trim Color
                    </label>
                    <input
                      type="color"
                      value={customTeam.secondaryColor}
                      onChange={(e) =>
                        setCustomTeam({
                          ...customTeam,
                          secondaryColor: e.target.value,
                        })
                      }
                      className="w-full h-9 rounded-lg bg-slate-900 border border-slate-700 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Jersey Pattern Style
                    </label>
                    <select
                      value={customTeam.jerseyStyle}
                      onChange={(e) =>
                        setCustomTeam({
                          ...customTeam,
                          jerseyStyle: e.target.value as JerseyStyle,
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white font-semibold"
                    >
                      <option value="CHEVRON">Modern Chevron</option>
                      <option value="PINSTRIPE">90s Pinstripes</option>
                      <option value="CLASSIC">Classic Clean</option>
                      <option value="RETRO_BAND">Retro Chest Band</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Jersey Display Preference */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <div className="text-xs font-bold text-white">
                  Apply My Franchise Jersey Colors to Active Cards
                </div>
                <div className="text-[11px] text-slate-400">
                  When enabled, cards wear your {activeTeamPreview.city}{' '}
                  {activeTeamPreview.name} jersey colors instead of their historic team colors.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWearFranchiseJersey((v) => !v)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition ${
                  wearFranchiseJersey
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {wearFranchiseJersey ? 'Wearing Franchise Jersey' : 'Original Card Jerseys'}
              </button>
            </div>
          </div>

          {/* Right 4 Cols: Live Card & Franchise Preview */}
          <div className="lg:col-span-4 flex flex-col items-center justify-between p-5 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="text-center mb-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-1">
                LIVE FRANCHISE & CARD PREVIEW
              </div>
              <h3 className="font-sport font-extrabold text-2xl text-white">
                {activeTeamPreview.city} {activeTeamPreview.name}{' '}
                <span className="text-slate-400">({activeTeamPreview.abbreviation})</span>
              </h3>
            </div>

            <PlayerCard
              card={sampleCard}
              useFranchiseJersey={wearFranchiseJersey}
              franchiseTeam={activeTeamPreview}
              size="md"
            />

            <button
              type="button"
              onClick={() => {
                onSave(activeTeamPreview, universe, wearFranchiseJersey);
                onClose();
              }}
              className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 text-slate-950 font-sport font-extrabold text-base tracking-wider uppercase shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition"
            >
              <Check className="w-5 h-5" />
              Save Franchise & Universe Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
