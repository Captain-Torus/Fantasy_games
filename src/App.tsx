import React, { useMemo, useState } from 'react';
import {
  CardTier,
  GameMode,
  LeagueTeamStanding,
  LineupSlot,
  OwnedCard,
  PackDefinition,
  PlayerCardTemplate,
  TeamIdentity,
  UniverseMode,
} from './types/game';
import {
  DEFAULT_CUSTOM_TEAM,
  getCardsForUniverse,
  NBA_PLAYER_CARDS,
  PACK_DEFINITIONS,
  REAL_NBA_TEAMS,
  TIER_LABELS,
  TIER_ORDER,
} from './data/nbaData';
import { PlayerCard } from './components/PlayerCard';
import { CardInspectModal } from './components/CardInspectModal';
import { TeamCreatorModal } from './components/TeamCreatorModal';
import { TacticalShowdownView } from './components/TacticalShowdownView';
import { DraftFranchiseView } from './components/DraftFranchiseView';
import { LeaderboardShowcaseView } from './components/LeaderboardShowcaseView';
import confetti from 'canvas-confetti';
import {
  ArrowUpCircle,
  Coins,
  Flame,
  Gift,
  Layers,
  PackageOpen,
  Settings,
  Shield,
  Sparkles,
  Swords,
  Trophy,
  Users,
} from 'lucide-react';

const LINEUP_SLOTS: { slot: LineupSlot; label: string; posHint: string }[] = [
  { slot: 'PG', label: 'Point Guard (PG)', posHint: 'PG' },
  { slot: 'SG', label: 'Shooting Guard (SG)', posHint: 'SG' },
  { slot: 'SF', label: 'Small Forward (SF)', posHint: 'SF' },
  { slot: 'PF', label: 'Power Forward (PF)', posHint: 'PF' },
  { slot: 'C', label: 'Center (C)', posHint: 'C' },
  { slot: 'SIXTH', label: '6th Man (Any Pos)', posHint: 'ANY' },
];

export function App() {
  // Core Mode, Universe & Franchise Identity State
  const [gameMode, setGameMode] = useState<GameMode>('PACK_MODE');
  const [packTab, setPackTab] = useState<
    'PACKS' | 'LINEUP' | 'SHOWDOWN' | 'LEADERBOARD'
  >('PACKS');
  const [universe, setUniverse] = useState<UniverseMode>('CROSSOVER');
  const [franchiseTeam, setFranchiseTeam] =
    useState<TeamIdentity>(DEFAULT_CUSTOM_TEAM);
  const [useFranchiseJersey, setUseFranchiseJersey] = useState<boolean>(false);
  const [isStudioOpen, setIsStudioOpen] = useState<boolean>(false);

  // Pack Mode Economy & Owned Collection Binder
  // Start with a fun starter rotation + 100,000 Coins so the user can immediately rip Legends/Primetime packs!
  const [coins, setCoins] = useState<number>(100000);
  const [ownedMap, setOwnedMap] = useState<Record<string, OwnedCard>>({
    'trae-base-84': {
      cardId: 'trae-base-84',
      quantity: 1,
      evoBonus: 0,
      gamesPlayed: 4,
      totalPoints: 96,
      totalRebounds: 14,
      totalAssists: 42,
      clutchPlaysWon: 3,
      clutchPlaysTotal: 4,
    },
    'mj-legends-97': {
      cardId: 'mj-legends-97',
      quantity: 1,
      evoBonus: 0,
      gamesPlayed: 5,
      totalPoints: 168,
      totalRebounds: 31,
      totalAssists: 28,
      clutchPlaysWon: 5,
      clutchPlaysTotal: 5,
    },
    'jalen-johnson-base-83': {
      cardId: 'jalen-johnson-base-83',
      quantity: 1,
      evoBonus: 0,
      gamesPlayed: 4,
      totalPoints: 68,
      totalRebounds: 32,
      totalAssists: 19,
      clutchPlaysWon: 2,
      clutchPlaysTotal: 3,
    },
    'jjj-base-84': {
      cardId: 'jjj-base-84',
      quantity: 1,
      evoBonus: 0,
      gamesPlayed: 4,
      totalPoints: 72,
      totalRebounds: 35,
      totalAssists: 9,
      clutchPlaysWon: 2,
      clutchPlaysTotal: 3,
    },
    'naz-base-81': {
      cardId: 'naz-base-81',
      quantity: 2,
      evoBonus: 0,
      gamesPlayed: 4,
      totalPoints: 64,
      totalRebounds: 29,
      totalAssists: 8,
      clutchPlaysWon: 1,
      clutchPlaysTotal: 2,
    },
    'white-base-83': {
      cardId: 'white-base-83',
      quantity: 3,
      evoBonus: 0,
      gamesPlayed: 4,
      totalPoints: 58,
      totalRebounds: 18,
      totalAssists: 22,
      clutchPlaysWon: 2,
      clutchPlaysTotal: 3,
    },
    'fict-blaze-primetime-99': {
      cardId: 'fict-blaze-primetime-99',
      quantity: 1,
      evoBonus: 0,
      gamesPlayed: 3,
      totalPoints: 112,
      totalRebounds: 15,
      totalAssists: 34,
      clutchPlaysWon: 3,
      clutchPlaysTotal: 3,
    },
  });

  // Active 6-Man Lineup
  const [lineupIds, setLineupIds] = useState<Record<LineupSlot, string>>({
    PG: 'trae-base-84',
    SG: 'mj-legends-97',
    SF: 'jalen-johnson-base-83',
    PF: 'jjj-base-84',
    C: 'naz-base-81',
    SIXTH: 'white-base-83',
  });

  const [selectingSlot, setSelectingSlot] = useState<LineupSlot | null>(null);

  // Pack Opening Reveal Modal State
  const [activePackReveal, setActivePackReveal] = useState<{
    pack: PackDefinition;
    pulledCards: PlayerCardTemplate[];
    revealedIndices: boolean[];
  } | null>(null);

  // Full-Screen Card Showcase Inspect Modal
  const [inspectedCard, setInspectedCard] = useState<PlayerCardTemplate | null>(
    null
  );

  // League Team Standings State
  const [userRecord, setUserRecord] = useState({
    wins: 4,
    losses: 1,
    pointsFor: 512,
    pointsAgainst: 468,
    championships: 1,
  });

  const cardById = (id: string): PlayerCardTemplate =>
    NBA_PLAYER_CARDS.find((c) => c.id === id) || NBA_PLAYER_CARDS[0];

  const lineupCards = useMemo(() => {
    return {
      PG: cardById(lineupIds.PG),
      SG: cardById(lineupIds.SG),
      SF: cardById(lineupIds.SF),
      PF: cardById(lineupIds.PF),
      C: cardById(lineupIds.C),
      SIXTH: cardById(lineupIds.SIXTH),
    };
  }, [lineupIds]);

  const teamOvr = useMemo(() => {
    const slots: LineupSlot[] = ['PG', 'SG', 'SF', 'PF', 'C', 'SIXTH'];
    const sum = slots.reduce((acc, s) => {
      const c = lineupCards[s];
      const evo = ownedMap[c.id]?.evoBonus ?? 0;
      return acc + Math.min(99, c.ovr + evo);
    }, 0);
    return Math.round(sum / slots.length);
  }, [lineupCards, ownedMap]);

  const collectionScore = useMemo(() => {
    return Object.values(ownedMap).reduce((sum, item) => {
      if (item.quantity <= 0) return sum;
      const c = cardById(item.cardId);
      return sum + c.ovr * 15 * item.quantity + item.evoBonus * 120;
    }, 0);
  }, [ownedMap]);

  const leagueStandings: LeagueTeamStanding[] = useMemo(() => {
    const cpuBase: LeagueTeamStanding[] = REAL_NBA_TEAMS.filter(
      (t) => t.id !== franchiseTeam.id
    ).map((t, idx) => ({
      id: t.id,
      city: t.city,
      name: t.name,
      abbreviation: t.abbreviation,
      primaryColor: t.primaryColor,
      secondaryColor: t.secondaryColor,
      isUser: false,
      wins: Math.max(1, 6 - (idx % 5)),
      losses: 1 + (idx % 5),
      pointsFor: 620 - idx * 18,
      pointsAgainst: 590 - idx * 10,
      teamOvr: 93 - idx,
      collectionScore: 9800 - idx * 720,
      championships: idx < 2 ? 1 : 0,
    }));

    const userStanding: LeagueTeamStanding = {
      id: franchiseTeam.id,
      city: franchiseTeam.city,
      name: franchiseTeam.name,
      abbreviation: franchiseTeam.abbreviation,
      primaryColor: franchiseTeam.primaryColor,
      secondaryColor: franchiseTeam.secondaryColor,
      isUser: true,
      wins: userRecord.wins,
      losses: userRecord.losses,
      pointsFor: userRecord.pointsFor,
      pointsAgainst: userRecord.pointsAgainst,
      teamOvr,
      collectionScore,
      championships: userRecord.championships,
    };

    return [userStanding, ...cpuBase];
  }, [franchiseTeam, userRecord, teamOvr, collectionScore]);

  // Pack Roll Generator
  const rollCardFromPool = (
    pack: PackDefinition,
    forceMinTier?: CardTier
  ): PlayerCardTemplate => {
    const pool = getCardsForUniverse(universe);
    const minOrder = forceMinTier ? TIER_ORDER[forceMinTier] : 1;

    // Roll tier based on weights
    const eligibleTiers = (
      ['BASE', 'ALL_STAR', 'ELITE', 'LEGENDS', 'PRIMETIME'] as CardTier[]
    ).filter((t) => TIER_ORDER[t] >= minOrder);

    const totalWeight = eligibleTiers.reduce(
      (acc, t) => acc + (pack.tierWeights[t] || 1),
      0
    );
    let r = Math.random() * totalWeight;
    let chosenTier: CardTier = eligibleTiers[0];
    for (const t of eligibleTiers) {
      r -= pack.tierWeights[t] || 1;
      if (r <= 0) {
        chosenTier = t;
        break;
      }
    }

    const tierCards = pool.filter((c) => c.tier === chosenTier);
    const candidatePool =
      tierCards.length > 0
        ? tierCards
        : pool.filter((c) => TIER_ORDER[c.tier] >= minOrder);
    const finalPool = candidatePool.length > 0 ? candidatePool : pool;

    return finalPool[Math.floor(Math.random() * finalPool.length)];
  };

  const handleOpenPack = (pack: PackDefinition) => {
    if (coins < pack.priceCoins) {
      alert(
        `Need ${pack.priceCoins} Coins to open ${pack.name}! Click "+1,500 Bonus Coins" in the top bar or play a Tactical Showdown.`
      );
      return;
    }

    setCoins((c) => c - pack.priceCoins);

    const pulled: PlayerCardTemplate[] = [];
    for (let i = 0; i < pack.cardCount; i++) {
      const forceTier = i === pack.cardCount - 1 ? pack.guaranteedMinTier : undefined;
      pulled.push(rollCardFromPool(pack, forceTier));
    }

    // Add pulled cards to Owned Binder
    setOwnedMap((prev) => {
      const next = { ...prev };
      pulled.forEach((c) => {
        const existing = next[c.id];
        if (existing) {
          next[c.id] = {
            ...existing,
            quantity: existing.quantity + 1,
          };
        } else {
          next[c.id] = {
            cardId: c.id,
            quantity: 1,
            evoBonus: 0,
            gamesPlayed: 0,
            totalPoints: 0,
            totalRebounds: 0,
            totalAssists: 0,
            clutchPlaysWon: 0,
            clutchPlaysTotal: 0,
          };
        }
      });
      return next;
    });

    setActivePackReveal({
      pack,
      pulledCards: pulled,
      revealedIndices: pulled.map(() => false),
    });
  };

  const revealPackCard = (idx: number) => {
    if (!activePackReveal) return;
    const card = activePackReveal.pulledCards[idx];
    if (card.tier === 'PRIMETIME' || card.tier === 'LEGENDS') {
      confetti({
        particleCount: card.tier === 'PRIMETIME' ? 95 : 55,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
    setActivePackReveal((prev) => {
      if (!prev) return null;
      const nextRev = [...prev.revealedIndices];
      nextRev[idx] = true;
      return { ...prev, revealedIndices: nextRev };
    });
  };

  const revealAllPackCards = () => {
    if (!activePackReveal) return;
    const hasHighTier = activePackReveal.pulledCards.some(
      (c) => c.tier === 'PRIMETIME' || c.tier === 'LEGENDS'
    );
    if (hasHighTier) {
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
    }
    setActivePackReveal((prev) =>
      prev
        ? { ...prev, revealedIndices: prev.pulledCards.map(() => true) }
        : null
    );
  };

  // Quick-Sell Duplicate & Combine 3 Duplicates (+1 OVR Evo)
  const handleQuickSellDuplicate = (cardId: string) => {
    const owned = ownedMap[cardId];
    if (!owned || owned.quantity <= 1) return;
    const card = cardById(cardId);
    setCoins((c) => c + card.quickSellCoins);
    setOwnedMap((prev) => ({
      ...prev,
      [cardId]: {
        ...prev[cardId],
        quantity: prev[cardId].quantity - 1,
      },
    }));
  };

  const handleCombineEvo = (cardId: string) => {
    const owned = ownedMap[cardId];
    if (!owned || owned.quantity < 3) return;
    setOwnedMap((prev) => ({
      ...prev,
      [cardId]: {
        ...prev[cardId],
        quantity: prev[cardId].quantity - 2, // Uses 2 duplicates to upgrade your main copy
        evoBonus: prev[cardId].evoBonus + 1,
      },
    }));
    confetti({ particleCount: 55, spread: 60, origin: { y: 0.65 } });
  };

  // Assign Card to Active Lineup Slot (Enforcing Realistic vs Fantastical 1-version-per-player rule!)
  const handleEquipCardToSlot = (slot: LineupSlot, candidateCardId: string) => {
    const candidate = cardById(candidateCardId);

    // Check if this exact card ID is already in another slot
    const existingSlotWithSameCard = (
      Object.keys(lineupIds) as LineupSlot[]
    ).find((s) => s !== slot && lineupIds[s] === candidateCardId);

    if (existingSlotWithSameCard) {
      // Swap slots cleanly
      setLineupIds((prev) => ({
        ...prev,
        [slot]: candidateCardId,
        [existingSlotWithSameCard]: prev[slot],
      }));
      setSelectingSlot(null);
      return;
    }

    // In Realistic mode, check if another edition of the same player (e.g. 97 Jordan vs 99 Jordan) is in another slot
    if (universe === 'REALISTIC') {
      const conflictingSlot = (Object.keys(lineupIds) as LineupSlot[]).find(
        (s) =>
          s !== slot &&
          cardById(lineupIds[s]).playerId === candidate.playerId
      );
      if (conflictingSlot) {
        alert(
          `Realistic Universe Rule: You already have ${
            cardById(lineupIds[conflictingSlot]).editionTitle
          } ${candidate.firstName} ${
            candidate.lastName
          } in your ${conflictingSlot} slot! In Realistic mode, only 1 version of the same athlete can start at once (or switch to Fantastical/Crossover in the Studio to start multiple versions!).`
        );
        return;
      }
    }

    setLineupIds((prev) => ({
      ...prev,
      [slot]: candidateCardId,
    }));
    setSelectingSlot(null);
  };

  const ownedCardsList = useMemo(() => {
    return Object.values(ownedMap)
      .filter((item) => item.quantity > 0)
      .map((item) => ({
        owned: item,
        card: cardById(item.cardId),
      }))
      .sort(
        (a, b) =>
          b.card.ovr +
          b.owned.evoBonus -
          (a.card.ovr + a.owned.evoBonus) ||
          TIER_ORDER[b.card.tier] - TIER_ORDER[a.card.tier]
      );
  }, [ownedMap]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* ==================== TOP GLOBAL HEADER ==================== */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-lg border-b border-slate-800/90">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Brand & Franchise Identity Pill */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => setIsStudioOpen(true)}
              className="w-11 h-11 rounded-2xl flex items-center justify-center font-sport font-extrabold text-base text-white shadow-lg border border-white/25 cursor-pointer hover:scale-105 transition"
              style={{
                background: `linear-gradient(135deg, ${franchiseTeam.primaryColor}, ${franchiseTeam.secondaryColor})`,
              }}
              title="Click to customize Franchise, Sport & Universe"
            >
              {franchiseTeam.abbreviation}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sport font-extrabold text-xl tracking-wide text-white">
                  PRIMETIME DYNASTY
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-extrabold text-[10px] uppercase">
                  NBA MODULE
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-bold text-[10px] uppercase border border-slate-700">
                  {universe}
                </span>
              </div>
              <button
                onClick={() => setIsStudioOpen(true)}
                className="text-xs text-slate-300 hover:text-amber-400 flex items-center gap-1.5 font-semibold transition"
              >
                <span>
                  Franchise: <strong>{franchiseTeam.city} {franchiseTeam.name}</strong> (
                  {franchiseTeam.isCustom ? 'Custom Team' : 'Real NBA Team'})
                </span>
                <Settings className="w-3.5 h-3.5 text-amber-400" />
                <span className="underline text-amber-400">Change Team / Universe</span>
              </button>
            </div>
          </div>

          {/* Center Mode Switcher (Separate Pack Mode vs. Draft/Trade/Sell Mode) */}
          <div className="flex items-center rounded-2xl bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => setGameMode('PACK_MODE')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition ${
                gameMode === 'PACK_MODE'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <PackageOpen className="w-4 h-4" />
              Pack & Showdown Mode
            </button>
            <button
              onClick={() => setGameMode('DRAFT_MODE')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition ${
                gameMode === 'DRAFT_MODE'
                  ? 'bg-gradient-to-r from-indigo-400 to-sky-400 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              Draft, Trade & Sell Mode
            </button>
          </div>

          {/* Right Coin Balance & Quick Refill */}
          <div className="flex items-center gap-2.5">
            {gameMode === 'PACK_MODE' && (
              <>
                <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-amber-500/40 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span className="font-sport font-extrabold text-lg text-amber-300 leading-none">
                    {coins.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    COINS
                  </span>
                </div>
                <button
                  onClick={() => setCoins((c) => c + 100000)}
                  className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold flex items-center gap-1 transition"
                  title="Claim Free Bonus Coins"
                >
                  <Gift className="w-3.5 h-3.5" />
                  +100,000 Bonus Coins
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sub-Navigation Bar for Pack & Showdown Mode */}
        {gameMode === 'PACK_MODE' && (
          <div className="bg-slate-900/80 border-t border-slate-800/80">
            <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {[
                  {
                    id: 'PACKS',
                    label: 'Pack Store & Vaults',
                    icon: PackageOpen,
                  },
                  {
                    id: 'LINEUP',
                    label: `My Lineup (${teamOvr} OVR) & Binder (${ownedCardsList.length})`,
                    icon: Layers,
                  },
                  {
                    id: 'SHOWDOWN',
                    label: 'Play CPU Tactical Showdown',
                    icon: Swords,
                  },
                  {
                    id: 'LEADERBOARD',
                    label: 'Detailed Leaderboards & Player Showcase',
                    icon: Trophy,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = packTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setPackTab(item.id as typeof packTab)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition ${
                        active
                          ? 'bg-amber-400 text-slate-950 shadow'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="text-xs text-slate-400 hidden md:block">
                Active Squad: <strong className="text-amber-400">{teamOvr} OVR</strong> • Record:{' '}
                <strong className="text-white">
                  {userRecord.wins}-{userRecord.losses}
                </strong>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ==================== MAIN CONTENT AREA ==================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {gameMode === 'DRAFT_MODE' ? (
          <DraftFranchiseView
            franchiseTeam={franchiseTeam}
            universe={universe}
            useFranchiseJersey={useFranchiseJersey}
            onInspectCard={(card) => setInspectedCard(card)}
          />
        ) : (
          <>
            {/* ==================== PACK MODE TAB 1: PACK STORE & FEATURED EDITIONS ==================== */}
            {packTab === 'PACKS' && (
              <div className="space-y-8">
                {/* Hero Banner */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/50 border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-extrabold uppercase">
                      <Sparkles className="w-3.5 h-3.5" /> 5 Rarity Tiers • Shiny Legends (95–97) & Rainbow Primetime (98–99)
                    </div>
                    <h1 className="font-sport font-extrabold text-3xl sm:text-4xl text-white leading-tight">
                      RIP PACKS. COLLECT ICONIC EDITIONS. BUILD THE{' '}
                      <span className="text-amber-400">
                        {franchiseTeam.city.toUpperCase()} {franchiseTeam.name.toUpperCase()}
                      </span>
                      .
                    </h1>
                    <p className="text-sm text-slate-300">
                      Pull multiple editions of legends and superstars—like a <strong>97 OVR Shiny Holographic Legends Michael Jordan</strong> alongside a <strong>99 OVR Prismatic Rainbow Primetime Michael Jordan</strong>. Click any card below to inspect all its editions!
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => setPackTab('SHOWDOWN')}
                      className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sport font-extrabold text-base uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
                    >
                      <Swords className="w-5 h-5" />
                      Play CPU Showdown
                    </button>
                    <button
                      onClick={() => setPackTab('LEADERBOARD')}
                      className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-sport font-extrabold text-base uppercase tracking-wider flex items-center gap-2 border border-slate-700 transition"
                    >
                      <Trophy className="w-5 h-5 text-amber-400" />
                      Leaderboards
                    </button>
                  </div>
                </div>

                {/* Pack Store Grid */}
                <div>
                  <h2 className="font-sport font-extrabold text-2xl text-white mb-4 flex items-center gap-2">
                    <PackageOpen className="w-6 h-6 text-amber-400" />
                    SELECT A CARD PACK TO OPEN ({universe} POOL)
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {PACK_DEFINITIONS.map((pack) => {
                      const canAfford = coins >= pack.priceCoins;
                      return (
                        <div
                          key={pack.id}
                          className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-400/60 overflow-hidden flex flex-col justify-between shadow-xl transition group"
                        >
                          {/* Top Foil Pack Visual */}
                          <div
                            className={`p-6 bg-gradient-to-br ${pack.accentGradient} relative overflow-hidden flex flex-col items-center text-center min-h-[195px] justify-between`}
                          >
                            <div className="shimmer-sweep absolute inset-0 pointer-events-none" />
                            <span className="relative z-10 px-2.5 py-0.5 rounded-full bg-slate-950/80 text-white font-extrabold text-[10px] tracking-widest uppercase border border-white/20">
                              {pack.badgeText}
                            </span>

                            <div className="relative z-10 my-3">
                              <div className="font-sport font-extrabold text-2xl text-white drop-shadow">
                                {pack.name}
                              </div>
                              <p className="text-xs text-slate-100/90 mt-1">
                                {pack.subtitle}
                              </p>
                            </div>

                            {/* Odds Bar */}
                            <div className="relative z-10 flex flex-wrap justify-center gap-1 text-[10px] font-bold">
                              <span className="px-1.5 py-0.5 rounded bg-slate-950/75 text-amber-300">
                                Legends: {pack.tierWeights.LEGENDS}%
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-slate-950/75 text-pink-300">
                                Primetime: {pack.tierWeights.PRIMETIME}%
                              </span>
                            </div>
                          </div>

                          {/* Buy Button */}
                          <div className="p-4 bg-slate-950 border-t border-slate-800">
                            <button
                              onClick={() => handleOpenPack(pack)}
                              className={`w-full py-3 rounded-xl font-sport font-extrabold text-base uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                                canAfford
                                  ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:brightness-110 text-slate-950 shadow-lg shadow-amber-500/20'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                              }`}
                            >
                              <Coins className="w-4 h-4" />
                              Rip Pack • {pack.priceCoins.toLocaleString()} Coins
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Featured Multi-Edition Spotlight (Showing 84 Base, 97 Shiny Legends & 99 Rainbow Primetime side by side!) */}
                <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-sport font-extrabold text-xl text-white">
                        EDITION SHOWCASE: SAME PLAYER, DIFFERENT TIERS & SHADERS
                      </h3>
                      <p className="text-xs text-slate-400">
                        Compare Base (Matte), Shiny Legends (95–97 Holographic), and Primetime (98–99 Prismatic Rainbow). Click any card to inspect!
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 justify-items-center">
                    {[
                      'mj-base-84',
                      'mj-legends-97',
                      'mj-primetime-99',
                      'fict-blaze-primetime-99',
                    ].map((id) => {
                      const c = cardById(id);
                      const owned = ownedMap[id];
                      return (
                        <PlayerCard
                          key={id}
                          card={c}
                          evoBonus={owned?.evoBonus ?? 0}
                          quantity={owned?.quantity ?? 0}
                          useFranchiseJersey={useFranchiseJersey}
                          franchiseTeam={franchiseTeam}
                          size="md"
                          onClick={() => setInspectedCard(c)}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ==================== PACK MODE TAB 2: LINEUP MANAGER & BINDER (DUPLICATE SELL / EVO) ==================== */}
            {packTab === 'LINEUP' && (
              <div className="space-y-8">
                {/* Active 6-Man Rotation */}
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-extrabold uppercase text-amber-400">
                        ACTIVE 6-MAN ROTATION • {teamOvr} TEAM OVR
                      </div>
                      <h2 className="font-sport font-extrabold text-2xl text-white">
                        {franchiseTeam.city} {franchiseTeam.name} STARTING LINEUP + 6TH MAN
                      </h2>
                      <p className="text-xs text-slate-400">
                        Click "Swap Player" under any slot to equip a card from your binder.{' '}
                        {universe === 'REALISTIC'
                          ? 'Realistic Mode Active: Max 1 version of the same athlete in your lineup.'
                          : 'Fantastical/Crossover Active: You can start multiple versions of the same athlete!'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 justify-items-center">
                    {LINEUP_SLOTS.map(({ slot, label }) => {
                      const c = lineupCards[slot];
                      const owned = ownedMap[c.id];
                      const isSwapping = selectingSlot === slot;
                      return (
                        <div key={slot} className="flex flex-col items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-extrabold text-amber-400 uppercase">
                            {label}
                          </span>
                          <PlayerCard
                            card={c}
                            evoBonus={owned?.evoBonus ?? 0}
                            quantity={owned?.quantity ?? 0}
                            useFranchiseJersey={useFranchiseJersey}
                            franchiseTeam={franchiseTeam}
                            size="sm"
                            selected={isSwapping}
                            onClick={() => setInspectedCard(c)}
                          />
                          <button
                            onClick={() =>
                              setSelectingSlot(isSwapping ? null : slot)
                            }
                            className={`w-48 py-1.5 rounded-xl text-xs font-extrabold uppercase transition ${
                              isSwapping
                                ? 'bg-emerald-400 text-slate-950'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            }`}
                          >
                            {isSwapping ? 'Select from Binder Below ↓' : `Swap ${slot}`}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Collection Binder + Duplicate Quick-Sell & Combine (+1 OVR Evo) */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-sport font-extrabold text-2xl text-white">
                        COLLECTION BINDER ({ownedCardsList.length} Unique Editions Owned)
                      </h3>
                      <p className="text-xs text-slate-400">
                        Sell extra duplicates for Coins, or combine 3 copies to permanently boost a card by +1 OVR!
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
                    {ownedCardsList.map(({ card, owned }) => {
                      const inLineupSlot = (
                        Object.keys(lineupIds) as LineupSlot[]
                      ).find((s) => lineupIds[s] === card.id);

                      return (
                        <div
                          key={card.id}
                          className="flex flex-col items-center gap-2"
                        >
                          <PlayerCard
                            card={card}
                            evoBonus={owned.evoBonus}
                            quantity={owned.quantity}
                            useFranchiseJersey={useFranchiseJersey}
                            franchiseTeam={franchiseTeam}
                            size="md"
                            actionBadge={
                              inLineupSlot ? `IN ${inLineupSlot}` : undefined
                            }
                            onClick={() => {
                              if (selectingSlot) {
                                handleEquipCardToSlot(selectingSlot, card.id);
                              } else {
                                setInspectedCard(card);
                              }
                            }}
                          />

                          {/* Quick Action Buttons Under Binder Card */}
                          <div className="w-60 flex flex-col gap-1.5">
                            {selectingSlot && (
                              <button
                                onClick={() =>
                                  handleEquipCardToSlot(selectingSlot, card.id)
                                }
                                className="w-full py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-extrabold uppercase shadow"
                              >
                                Equip into {selectingSlot} Slot
                              </button>
                            )}

                            <div className="flex gap-1.5">
                              {owned.quantity > 1 && (
                                <button
                                  onClick={() => handleQuickSellDuplicate(card.id)}
                                  className="flex-1 py-1.5 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-extrabold flex items-center justify-center gap-1 transition"
                                >
                                  <Coins className="w-3.5 h-3.5" />
                                  Sell Dup (+{card.quickSellCoins})
                                </button>
                              )}

                              {owned.quantity >= 3 &&
                                card.ovr + owned.evoBonus < 99 && (
                                  <button
                                    onClick={() => handleCombineEvo(card.id)}
                                    className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-extrabold flex items-center justify-center gap-1 transition"
                                  >
                                    <ArrowUpCircle className="w-3.5 h-3.5" />
                                    Evo +1 OVR (3x)
                                  </button>
                                )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ==================== PACK MODE TAB 3: TACTICAL CARD SHOWDOWNS VS. CPU ==================== */}
            {packTab === 'SHOWDOWN' && (
              <TacticalShowdownView
                lineupCards={lineupCards}
                ownedMap={ownedMap}
                franchiseTeam={franchiseTeam}
                useFranchiseJersey={useFranchiseJersey}
                onInspectCard={(card) => setInspectedCard(card)}
                onCompleteGame={(result) => {
                  setCoins((c) => c + result.coinsEarned);
                  setUserRecord((prev) => ({
                    wins: prev.wins + (result.won ? 1 : 0),
                    losses: prev.losses + (result.won ? 0 : 1),
                    pointsFor: prev.pointsFor + result.userScore,
                    pointsAgainst: prev.pointsAgainst + result.cpuScore,
                    championships:
                      prev.championships +
                      (result.won && result.coinsEarned >= 1200 ? 1 : 0),
                  }));

                  // Accumulate per-player stats for the Detailed Leaderboard!
                  setOwnedMap((prev) => {
                    const next = { ...prev };
                    Object.entries(result.playerStats).forEach(([cardId, st]) => {
                      const existing = next[cardId];
                      if (existing) {
                        next[cardId] = {
                          ...existing,
                          gamesPlayed: existing.gamesPlayed + 1,
                          totalPoints: existing.totalPoints + st.pts,
                          totalRebounds: existing.totalRebounds + st.reb,
                          totalAssists: existing.totalAssists + st.ast,
                          clutchPlaysWon: existing.clutchPlaysWon + st.clutchWon,
                          clutchPlaysTotal:
                            existing.clutchPlaysTotal + st.clutchTotal,
                        };
                      }
                    });
                    return next;
                  });
                }}
              />
            )}

            {/* ==================== PACK MODE TAB 4: DETAILED LEADERBOARDS & SHOWCASE ==================== */}
            {packTab === 'LEADERBOARD' && (
              <LeaderboardShowcaseView
                standings={leagueStandings}
                ownedMap={ownedMap}
                franchiseTeam={franchiseTeam}
                universe={universe}
                useFranchiseJersey={useFranchiseJersey}
                onInspectCard={(card) => setInspectedCard(card)}
              />
            )}
          </>
        )}
      </main>

      {/* ==================== PACK RIP REVEAL OVERLAY MODAL ==================== */}
      {activePackReveal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full text-center space-y-6 my-8">
            <div>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-extrabold uppercase">
                {activePackReveal.pack.name}
              </span>
              <h2 className="font-sport font-extrabold text-3xl sm:text-4xl text-white mt-2">
                CLICK EACH CARD TO REVEAL YOUR PULLS!
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 justify-items-center py-4">
              {activePackReveal.pulledCards.map((card, idx) => {
                const isRevealed = activePackReveal.revealedIndices[idx];
                if (!isRevealed) {
                  const glowClass =
                    card.tier === 'PRIMETIME'
                      ? 'card-tier-primetime'
                      : card.tier === 'LEGENDS'
                      ? 'card-tier-legends'
                      : card.tier === 'ELITE'
                      ? 'border-2 border-amber-400 shadow-lg shadow-amber-500/30'
                      : card.tier === 'ALL_STAR'
                      ? 'border-2 border-sky-400 shadow-md shadow-sky-500/25'
                      : 'border border-slate-700';

                  return (
                    <button
                      key={idx}
                      onClick={() => revealPackCard(idx)}
                      className={`w-60 h-[310px] rounded-2xl ${glowClass} p-1 cursor-pointer hover:scale-105 transition-all duration-300`}
                    >
                      <div className="w-full h-full rounded-[13px] bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                        <div className="shimmer-sweep absolute inset-0" />
                        <Sparkles className="w-10 h-10 text-amber-400 mb-3 animate-pulse" />
                        <div className="font-sport font-extrabold text-lg text-white">
                          TAP TO REVEAL
                        </div>
                        <div className="text-xs font-bold text-amber-300 mt-1">
                          {TIER_LABELS[card.tier].finish} Glow Detected
                        </div>
                      </div>
                    </button>
                  );
                }

                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-2 animate-fadeIn"
                  >
                    <PlayerCard
                      card={card}
                      evoBonus={ownedMap[card.id]?.evoBonus ?? 0}
                      quantity={ownedMap[card.id]?.quantity ?? 1}
                      useFranchiseJersey={useFranchiseJersey}
                      franchiseTeam={franchiseTeam}
                      size="md"
                      onClick={() => setInspectedCard(card)}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-4">
              {!activePackReveal.revealedIndices.every(Boolean) ? (
                <button
                  onClick={revealAllPackCards}
                  className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-sport font-extrabold text-base uppercase tracking-wider shadow-lg transition"
                >
                  Reveal All Cards
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setActivePackReveal(null)}
                    className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-sport font-extrabold text-base uppercase tracking-wider border border-slate-700 transition"
                  >
                    Done (Send to Binder)
                  </button>
                  {coins >= activePackReveal.pack.priceCoins && (
                    <button
                      onClick={() => handleOpenPack(activePackReveal.pack)}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-sport font-extrabold text-base uppercase tracking-wider shadow-lg transition"
                    >
                      Rip Another ({activePackReveal.pack.priceCoins} Coins)
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== FULL-SCREEN CARD SHOWCASE INSPECT MODAL ==================== */}
      <CardInspectModal
        card={inspectedCard}
        owned={inspectedCard ? ownedMap[inspectedCard.id] : undefined}
        ownedMap={ownedMap}
        franchiseTeam={franchiseTeam}
        useFranchiseJerseyDefault={useFranchiseJersey}
        isPackMode={gameMode === 'PACK_MODE'}
        onClose={() => setInspectedCard(null)}
        onSelectCardEdition={(ed) => setInspectedCard(ed)}
        onQuickSellDuplicate={handleQuickSellDuplicate}
        onCombineEvo={handleCombineEvo}
      />

      {/* ==================== FRANCHISE, SPORT & UNIVERSE STUDIO MODAL ==================== */}
      <TeamCreatorModal
        isOpen={isStudioOpen}
        currentTeam={franchiseTeam}
        currentUniverse={universe}
        useFranchiseJersey={useFranchiseJersey}
        onSave={(team, newUniverse, wearJersey) => {
          setFranchiseTeam(team);
          setUniverse(newUniverse);
          setUseFranchiseJersey(wearJersey);
        }}
        onClose={() => setIsStudioOpen(false)}
      />
    </div>
  );
}
export default App;
