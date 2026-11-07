import React, { useState } from 'react';
import {
  OwnedCard,
  PlayerCardTemplate,
  TeamIdentity,
} from '../types/game';
import { NBA_PLAYER_CARDS, TIER_LABELS } from '../data/nbaData';
import { PlayerCard } from './PlayerCard';
import {
  X,
  Sparkles,
  Coins,
  ArrowUpCircle,
  Trophy,
  Shirt,
  Layers,
} from 'lucide-react';

interface CardInspectModalProps {
  card: PlayerCardTemplate | null;
  owned?: OwnedCard;
  ownedMap: Record<string, OwnedCard>;
  franchiseTeam: TeamIdentity;
  useFranchiseJerseyDefault: boolean;
  isPackMode: boolean;
  onClose: () => void;
  onSelectCardEdition: (card: PlayerCardTemplate) => void;
  onQuickSellDuplicate?: (cardId: string) => void;
  onCombineEvo?: (cardId: string) => void;
}

export const CardInspectModal: React.FC<CardInspectModalProps> = ({
  card,
  owned,
  ownedMap,
  franchiseTeam,
  useFranchiseJerseyDefault,
  isPackMode,
  onClose,
  onSelectCardEdition,
  onQuickSellDuplicate,
  onCombineEvo,
}) => {
  const [previewFranchiseJersey, setPreviewFranchiseJersey] = useState(
    useFranchiseJerseyDefault
  );

  if (!card) return null;

  // Find all editions of this same athlete (e.g., Base 84, Legends 97, Primetime 99 Jordan)
  const allEditions = NBA_PLAYER_CARDS.filter(
    (c) => c.playerId === card.playerId
  ).sort((a, b) => b.ovr - a.ovr);

  const evoBonus = owned?.evoBonus ?? 0;
  const quantity = owned?.quantity ?? 0;
  const games = owned?.gamesPlayed ?? 0;
  const ppg = games > 0 ? (owned!.totalPoints / games).toFixed(1) : '0.0';
  const rpg = games > 0 ? (owned!.totalRebounds / games).toFixed(1) : '0.0';
  const apg = games > 0 ? (owned!.totalAssists / games).toFixed(1) : '0.0';
  const clutchPct =
    owned && owned.clutchPlaysTotal > 0
      ? Math.round((owned.clutchPlaysWon / owned.clutchPlaysTotal) * 100)
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-extrabold uppercase border ${
                TIER_LABELS[card.tier].badgeBg
              }`}
            >
              {TIER_LABELS[card.tier].name} • {TIER_LABELS[card.tier].finish}
            </span>
            <h2 className="font-sport font-extrabold text-xl text-white">
              {card.firstName} {card.lastName}{' '}
              <span className="text-amber-400">#{card.jerseyNumber}</span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 items-center">
          {/* Left Column: Large Interactive Card Showcase */}
          <div className="md:col-span-5 flex flex-col items-center gap-4">
            <PlayerCard
              card={card}
              evoBonus={evoBonus}
              quantity={quantity}
              useFranchiseJersey={previewFranchiseJersey}
              franchiseTeam={franchiseTeam}
              size="lg"
            />

            <button
              onClick={() => setPreviewFranchiseJersey((v) => !v)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition"
            >
              <Shirt className="w-4 h-4 text-sky-400" />
              {previewFranchiseJersey
                ? `Showing ${franchiseTeam.city} ${franchiseTeam.name} Jersey`
                : `Showing Iconic ${card.teamCity} ${card.teamName} Jersey`}
            </button>
          </div>

          {/* Right Column: Lore, Career Stats, Duplicate Actions, and All Editions */}
          <div className="md:col-span-7 flex flex-col gap-5">
            {/* Edition Bio */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  {card.editionTitle} • {card.eraOrArchetype}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Market Value: ${card.salaryM}M / {card.quickSellCoins} Coins
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{card.lore}</p>
            </div>

            {/* Franchise Career Stats Box */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                <Trophy className="w-4 h-4 text-amber-400" />
                Franchise Leaderboard & Box Score Stats ({games} Games Played)
              </div>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-400">PPG</div>
                  <div className="font-sport font-extrabold text-xl text-white">{ppg}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-400">RPG</div>
                  <div className="font-sport font-extrabold text-xl text-emerald-400">{rpg}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-400">APG</div>
                  <div className="font-sport font-extrabold text-xl text-sky-400">{apg}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-400">CLUTCH WIN</div>
                  <div className="font-sport font-extrabold text-xl text-amber-400">
                    {clutchPct}%
                  </div>
                </div>
              </div>
            </div>

            {/* Pack Mode Duplicate & Evolution Actions */}
            {isPackMode && quantity > 0 && (
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-extrabold uppercase text-slate-200">
                    Binder Copies Owned: <span className="text-amber-400">×{quantity}</span>
                    {evoBonus > 0 && (
                      <span className="ml-2 text-emerald-400">(Evolved +{evoBonus} OVR)</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    Quick-sell extra copies for Coins or combine 3 copies for +1 OVR Evo!
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {onQuickSellDuplicate && quantity > 1 && (
                    <button
                      onClick={() => onQuickSellDuplicate(card.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-extrabold transition"
                    >
                      <Coins className="w-4 h-4" />
                      Sell 1 Duplicate (+{card.quickSellCoins} Coins)
                    </button>
                  )}
                  {onCombineEvo && quantity >= 3 && (
                      <button
                        onClick={() => onCombineEvo(card.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition shadow-lg ${
                          card.ovr + evoBonus >= 99
                            ? 'bg-gradient-to-r from-purple-700 via-fuchsia-500 to-amber-400 text-white shadow-fuchsia-500/30 hover:brightness-110'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                        }`}
                      >
                        <ArrowUpCircle className="w-4 h-4" />
                        {card.ovr + evoBonus >= 99
                          ? `🌌 Combine 3x → Forge ${card.ovr + evoBonus + 1} DARK MATTER!`
                          : 'Combine 3 Copies (+1 OVR Evo)'}
                      </button>
                    )}
                </div>
              </div>
            )}

            {/* All Editions of This Player Comparison */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                <Layers className="w-4 h-4 text-sky-400" />
                All Editions of {card.firstName} {card.lastName} ({allEditions.length})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {allEditions.map((ed) => {
                  const isCurrent = ed.id === card.id;
                  const isOwned = (ownedMap[ed.id]?.quantity ?? 0) > 0;
                  return (
                    <button
                      key={ed.id}
                      onClick={() => onSelectCardEdition(ed)}
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/30'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold border ${
                            TIER_LABELS[ed.tier].badgeBg
                          }`}
                        >
                          {ed.ovr} OVR
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            isOwned ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        >
                          {isOwned ? `Owned ×${ownedMap[ed.id].quantity}` : 'Unowned'}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white truncate">
                        {ed.editionTitle}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {TIER_LABELS[ed.tier].finish}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
