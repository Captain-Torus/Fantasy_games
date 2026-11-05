import React, { useMemo, useState } from 'react';
import {
  CardTier,
  LeagueTeamStanding,
  OwnedCard,
  PlayerCardTemplate,
  TeamIdentity,
  UniverseMode,
} from '../types/game';
import {
  getCardsForUniverse,
  TIER_LABELS,
  TIER_ORDER,
} from '../data/nbaData';
import { PlayerCard } from './PlayerCard';
import {
  Award,
  Crown,
  Eye,
  Flame,
  Search,
  Sparkles,
  TrendingUp,
  Trophy,
} from 'lucide-react';

interface LeaderboardShowcaseViewProps {
  standings: LeagueTeamStanding[];
  ownedMap: Record<string, OwnedCard>;
  franchiseTeam: TeamIdentity;
  universe: UniverseMode;
  useFranchiseJersey: boolean;
  onInspectCard: (card: PlayerCardTemplate) => void;
}

export const LeaderboardShowcaseView: React.FC<LeaderboardShowcaseViewProps> = ({
  standings,
  ownedMap,
  franchiseTeam,
  universe,
  useFranchiseJersey,
  onInspectCard,
}) => {
  const [subTab, setSubTab] = useState<'PLAYERS' | 'TEAMS' | 'GALLERY'>('PLAYERS');
  const [sortBy, setSortBy] = useState<'OVR' | 'PTS' | 'PPG' | 'RPG' | 'APG' | 'CLUTCH'>('PTS');
  const [tierFilter, setTierFilter] = useState<'ALL' | CardTier>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const universeCards = useMemo(
    () => getCardsForUniverse(universe),
    [universe]
  );

  // Build enriched player leaderboard rows (combining user stats + simulated league baseline for unowned/league cards)
  const playerRows = useMemo(() => {
    return universeCards
      .filter((c) => tierFilter === 'ALL' || c.tier === tierFilter)
      .filter((c) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
          c.teamName.toLowerCase().includes(q) ||
          c.editionTitle.toLowerCase().includes(q)
        );
      })
      .map((card) => {
        const owned = ownedMap[card.id];
        const evoBonus = owned?.evoBonus ?? 0;
        const maxCap = card.ovr >= 99 && evoBonus > 0 ? 100 : 99;
        const effectiveOvr = Math.min(maxCap, card.ovr + evoBonus);
        const games = owned?.gamesPlayed ?? 0;

        // If the user has played games with this card, use actual box score averages; otherwise show projected league averages based on sub-stats
        const ppg =
          games > 0
            ? Number((owned.totalPoints / games).toFixed(1))
            : Number(((card.stats.off - 52) * 0.68).toFixed(1));
        const rpg =
          games > 0
            ? Number((owned.totalRebounds / games).toFixed(1))
            : Number(
                (
                  (card.position === 'C' || card.position === 'PF' ? 4.5 : 1.5) +
                  (card.stats.def - 65) * 0.24
                ).toFixed(1)
              );
        const apg =
          games > 0
            ? Number((owned.totalAssists / games).toFixed(1))
            : Number(
                (
                  (card.position === 'PG' ? 3.5 : 1.2) +
                  (card.stats.play - 65) * 0.22
                ).toFixed(1)
              );
        const clutchPct =
          owned && owned.clutchPlaysTotal > 0
            ? Math.round((owned.clutchPlaysWon / owned.clutchPlaysTotal) * 100)
            : Math.min(96, Math.max(42, card.stats.clu - 6));

        return {
          card,
          isOwned: (owned?.quantity ?? 0) > 0,
          quantity: owned?.quantity ?? 0,
          evoBonus,
          effectiveOvr,
          games,
          totalPoints: owned?.totalPoints ?? 0,
          ppg,
          rpg,
          apg,
          clutchPct,
        };
      })
      .sort((a, b) => {
        if (sortBy === 'PTS')
          return b.totalPoints - a.totalPoints || b.ppg - a.ppg || b.effectiveOvr - a.effectiveOvr;
        if (sortBy === 'PPG') return b.ppg - a.ppg || b.effectiveOvr - a.effectiveOvr;
        if (sortBy === 'RPG') return b.rpg - a.rpg || b.effectiveOvr - a.effectiveOvr;
        if (sortBy === 'APG') return b.apg - a.apg || b.effectiveOvr - a.effectiveOvr;
        if (sortBy === 'CLUTCH')
          return b.clutchPct - a.clutchPct || b.effectiveOvr - a.effectiveOvr;
        return (
          b.effectiveOvr - a.effectiveOvr ||
          TIER_ORDER[b.card.tier] - TIER_ORDER[a.card.tier] ||
          b.ppg - a.ppg
        );
      });
  }, [universeCards, ownedMap, tierFilter, searchQuery, sortBy]);

  const sortedStandings = useMemo(() => {
    return [...standings].sort(
      (a, b) =>
        b.wins - a.wins ||
        b.pointsFor - b.pointsAgainst - (a.pointsFor - a.pointsAgainst) ||
        b.teamOvr - a.teamOvr
    );
  }, [standings]);

  return (
    <div className="space-y-6">
      {/* Header & View Switcher */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-extrabold uppercase mb-1">
            <Trophy className="w-3.5 h-3.5" /> Official League Leaderboards & Card Vault
          </div>
          <h2 className="font-sport font-extrabold text-2xl sm:text-3xl text-white">
            LEAGUE LEADERS, FRANCHISE STANDINGS & PLAYER SHOWCASE
          </h2>
          <p className="text-xs text-slate-400">
            Click any player row or card to launch their full-screen holographic / rainbow card inspector.
          </p>
        </div>

        <div className="flex rounded-2xl bg-slate-950 p-1.5 border border-slate-800">
          {[
            { id: 'PLAYERS', label: 'Player League Leaders' },
            { id: 'TEAMS', label: 'Franchise Team Standings' },
            { id: 'GALLERY', label: 'Visual Card Showcase Gallery' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSubTab(t.id as typeof subTab)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition ${
                subTab === t.id
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Bar for Players & Gallery */}
      {subTab !== 'TEAMS' && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search player (e.g. Jordan, Curry, Blaze Vance)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white placeholder:text-slate-500"
            />
          </div>

          {/* Tier Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'ALL', label: 'All Tiers' },
                { id: 'PRIMETIME', label: '98–99 Primetime (Rainbow)' },
                { id: 'LEGENDS', label: '95–97 Legends (Shiny)' },
                { id: 'ELITE', label: '92–94 Elite' },
                { id: 'ALL_STAR', label: '85–91 All-Star' },
                { id: 'BASE', label: 'Base' },
              ] as const
            ).map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTierFilter(tf.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  tierFilter === tf.id
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Sort Metric */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400">Rank By:</span>
            {(['PTS', 'PPG', 'RPG', 'APG', 'CLUTCH', 'OVR'] as const).map((metric) => (
              <button
                key={metric}
                onClick={() => setSortBy(metric)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition ${
                  sortBy === metric
                    ? 'bg-sky-500 text-slate-950'
                    : 'bg-slate-950 text-slate-300 border border-slate-800'
                }`}
              >
                {metric}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ==================== TAB 1: DETAILED PLAYER LEAGUE LEADERS TABLE ==================== */}
      {subTab === 'PLAYERS' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-xs font-extrabold uppercase text-slate-400">
                  <th className="py-3.5 px-4">Rank</th>
                  <th className="py-3.5 px-4">Player & Number</th>
                  <th className="py-3.5 px-4">Card Edition & Finish</th>
                  <th className="py-3.5 px-4 text-center">OVR</th>
                  <th className="py-3.5 px-4 text-center">GP</th>
                  <th className="py-3.5 px-4 text-right">TOT PTS</th>
                  <th className="py-3.5 px-4 text-right">PPG</th>
                  <th className="py-3.5 px-4 text-right">RPG</th>
                  <th className="py-3.5 px-4 text-right">APG</th>
                  <th className="py-3.5 px-4 text-right">Clutch %</th>
                  <th className="py-3.5 px-4 text-right">Showcase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {playerRows.map((row, index) => (
                  <tr
                    key={row.card.id}
                    onClick={() => onInspectCard(row.card)}
                    className="hover:bg-slate-800/65 cursor-pointer transition group"
                  >
                    <td className="py-3 px-4 font-sport font-extrabold text-base text-slate-400">
                      #{index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-sport font-extrabold text-xs text-white border border-white/20 shrink-0"
                          style={{ backgroundColor: row.card.primaryColor }}
                        >
                          #{row.card.jerseyNumber}
                        </span>
                        <div>
                          <div className="font-sport font-extrabold text-base text-white group-hover:text-amber-300 transition">
                            {row.card.firstName} {row.card.lastName}{' '}
                            <span className="text-xs font-bold text-slate-400">
                              ({row.card.position} • {row.card.teamAbbr})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {row.card.eraOrArchetype}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-extrabold border ${
                          TIER_LABELS[row.card.tier].badgeBg
                        }`}
                      >
                        {row.card.tier === 'PRIMETIME' && (
                          <Sparkles className="w-3 h-3" />
                        )}
                        {row.card.tier === 'LEGENDS' && <Flame className="w-3 h-3" />}
                        {row.card.editionTitle}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-sport font-extrabold text-lg text-white">
                        {row.effectiveOvr}
                      </span>
                      {row.evoBonus > 0 && (
                        <span className="ml-1 text-[10px] font-extrabold text-emerald-400">
                          +{row.evoBonus}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-sport font-bold text-slate-300">
                      {row.games}
                    </td>
                    <td className="py-3 px-4 text-right font-sport font-extrabold text-base text-amber-300">
                      {row.totalPoints}
                    </td>
                    <td className="py-3 px-4 text-right font-sport font-extrabold text-base text-rose-400">
                      {row.ppg.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-right font-sport font-extrabold text-base text-emerald-400">
                      {row.rpg.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-right font-sport font-extrabold text-base text-sky-400">
                      {row.apg.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-right font-sport font-extrabold text-base text-amber-400">
                      {row.clutchPct}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 group-hover:bg-amber-400 group-hover:text-slate-950 text-xs font-bold text-slate-200 transition">
                        <Eye className="w-3.5 h-3.5" /> Inspect
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: FRANCHISE TEAM STANDINGS LEADERBOARD ==================== */}
      {subTab === 'TEAMS' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-xs font-extrabold uppercase text-slate-400">
                  <th className="py-3.5 px-4">Seed</th>
                  <th className="py-3.5 px-4">Franchise</th>
                  <th className="py-3.5 px-4 text-center">Team OVR</th>
                  <th className="py-3.5 px-4 text-center">W - L</th>
                  <th className="py-3.5 px-4 text-center">Win %</th>
                  <th className="py-3.5 px-4 text-right">Point Diff</th>
                  <th className="py-3.5 px-4 text-right">Collection Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {sortedStandings.map((team, idx) => {
                  const totalGames = team.wins + team.losses;
                  const winPct =
                    totalGames > 0
                      ? ((team.wins / totalGames) * 100).toFixed(1)
                      : '0.0';
                  const diff = team.pointsFor - team.pointsAgainst;
                  return (
                    <tr
                      key={team.id}
                      className={
                        team.isUser
                          ? 'bg-amber-500/15 font-bold text-white'
                          : 'hover:bg-slate-800/50 text-slate-200'
                      }
                    >
                      <td className="py-3.5 px-4 font-sport font-extrabold text-base text-amber-400">
                        #{idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-sport font-extrabold text-xs text-white border border-white/20"
                            style={{ backgroundColor: team.primaryColor }}
                          >
                            {team.abbreviation}
                          </span>
                          <div>
                            <div className="font-sport font-extrabold text-base text-white">
                              {team.city} {team.name}{' '}
                              {team.isUser && (
                                <span className="ml-1.5 px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-extrabold uppercase">
                                  YOUR FRANCHISE
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-sport font-extrabold text-lg text-amber-400">
                        {team.teamOvr}
                      </td>
                      <td className="py-3.5 px-4 text-center font-sport font-extrabold text-base">
                        {team.wins} - {team.losses}
                      </td>
                      <td className="py-3.5 px-4 text-center font-sport font-bold text-sky-400">
                        {winPct}%
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-sport font-bold ${
                          diff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {diff >= 0 ? `+${diff}` : diff}
                      </td>
                      <td className="py-3.5 px-4 text-right font-sport font-extrabold text-base text-amber-300">
                        {team.collectionScore.toLocaleString()} PTS
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: VISUAL CARD SHOWCASE GALLERY ==================== */}
      {subTab === 'GALLERY' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
          {playerRows.map((row) => (
            <PlayerCard
              key={row.card.id}
              card={row.card}
              evoBonus={row.evoBonus}
              quantity={row.quantity}
              useFranchiseJersey={useFranchiseJersey}
              franchiseTeam={franchiseTeam}
              size="md"
              actionBadge={row.isOwned ? 'IN BINDER' : undefined}
              onClick={() => onInspectCard(row.card)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
