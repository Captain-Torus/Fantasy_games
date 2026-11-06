import React, { useEffect, useMemo, useState } from 'react';
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
import { AccountModal, SavedProfileSummary } from './components/AccountModal';
import confetti from 'canvas-confetti';
import {
  ArrowUpCircle,
  Award,
  CheckCircle2,
  Coins,
  Flame,
  Gift,
  Layers,
  PackageOpen,
  RotateCcw,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
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

interface FullSavedProfile {
  id: string;
  gmName: string;
  updatedAt: string;
  coins: number;
  jackpotCharges: number;
  universe: UniverseMode;
  franchiseTeam: TeamIdentity;
  useFranchiseJersey: boolean;
  ownedMap: Record<string, OwnedCard>;
  lineupIds: Record<LineupSlot, string>;
  userRecord: {
    wins: number;
    losses: number;
    pointsFor: number;
    pointsAgainst: number;
    championships: number;
  };
  cpuRecords: Record<
    string,
    {
      wins: number;
      losses: number;
      pointsFor: number;
      pointsAgainst: number;
      championships: number;
    }
  >;
  claimedMilestones: string[];
}

const STORAGE_PROFILES_KEY = 'primetime_dynasty_profiles_v2';
const STORAGE_ACTIVE_ID_KEY = 'primetime_dynasty_active_id_v2';

function createDefaultCpuRecords() {
  const presetRecords: Record<string, { wins: number; losses: number; pf: number; pa: number; rings: number }> = {
    'sas-spurs': { wins: 6, losses: 1, pf: 788, pa: 710, rings: 1 },
    'chi-bulls': { wins: 6, losses: 2, pf: 892, pa: 825, rings: 1 },
    'gsw-warriors': { wins: 5, losses: 3, pf: 880, pa: 848, rings: 1 },
    'bos-celtics': { wins: 5, losses: 4, pf: 985, pa: 960, rings: 1 },
    'lal-lakers': { wins: 5, losses: 5, pf: 1090, pa: 1084, rings: 1 },
    'phx-suns': { wins: 4, losses: 5, pf: 962, pa: 978, rings: 0 },
    'mia-heat': { wins: 3, losses: 5, pf: 836, pa: 868, rings: 0 },
    'atl-hawks': { wins: 2, losses: 6, pf: 820, pa: 885, rings: 0 },
  };
  const init: Record<
    string,
    {
      wins: number;
      losses: number;
      pointsFor: number;
      pointsAgainst: number;
      championships: number;
    }
  > = {};
  REAL_NBA_TEAMS.forEach((t, idx) => {
    const preset = presetRecords[t.id];
    init[t.id] = preset
      ? {
          wins: preset.wins,
          losses: preset.losses,
          pointsFor: preset.pf,
          pointsAgainst: preset.pa,
          championships: preset.rings,
        }
      : {
          wins: Math.max(1, 5 - (idx % 4)),
          losses: 1 + (idx % 4),
          pointsFor: 540 - idx * 14,
          pointsAgainst: 515 - idx * 10,
          championships: idx < 2 ? 1 : 0,
        };
  });
  return init;
}

function createStarterProfile(id: string, gmName: string): FullSavedProfile {
  return {
    id,
    gmName,
    updatedAt: new Date().toISOString(),
    coins: 15000,
    jackpotCharges: 0,
    universe: 'REALISTIC',
    franchiseTeam: DEFAULT_CUSTOM_TEAM,
    useFranchiseJersey: false,
    ownedMap: {
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
      'mj-base-84': {
        cardId: 'mj-base-84',
        quantity: 1,
        evoBonus: 0,
        gamesPlayed: 4,
        totalPoints: 118,
        totalRebounds: 22,
        totalAssists: 20,
        clutchPlaysWon: 3,
        clutchPlaysTotal: 4,
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
      'curry-primetime-99': {
        cardId: 'curry-primetime-99',
        quantity: 3,
        evoBonus: 0,
        gamesPlayed: 2,
        totalPoints: 68,
        totalRebounds: 10,
        totalAssists: 18,
        clutchPlaysWon: 2,
        clutchPlaysTotal: 2,
      },
    },
    lineupIds: {
      PG: 'trae-base-84',
      SG: 'mj-base-84',
      SF: 'jalen-johnson-base-83',
      PF: 'jjj-base-84',
      C: 'naz-base-81',
      SIXTH: 'white-base-83',
    },
    userRecord: {
      wins: 4,
      losses: 1,
      pointsFor: 512,
      pointsAgainst: 468,
      championships: 1,
    },
    cpuRecords: createDefaultCpuRecords(),
    claimedMilestones: [],
  };
}

function loadInitialProfiles(): {
  profiles: Record<string, FullSavedProfile>;
  activeId: string;
} {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILES_KEY);
    const activeRaw = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
    const migrated = localStorage.getItem('primetime_dynasty_realistic_default_v1');
    const curryGranted = localStorage.getItem('primetime_dynasty_curry_grant_v1');
    const standingsSeeded = localStorage.getItem('primetime_dynasty_varied_standings_v1');
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, FullSavedProfile>;
      const ids = Object.keys(parsed);
      if (ids.length > 0) {
        if (!migrated) {
          ids.forEach((k) => {
            if (parsed[k].universe === 'CROSSOVER') {
              parsed[k].universe = 'REALISTIC';
            }
          });
          localStorage.setItem('primetime_dynasty_realistic_default_v1', 'true');
        }
        if (!standingsSeeded) {
          const variedCpu = createDefaultCpuRecords();
          ids.forEach((k) => {
            parsed[k].cpuRecords = variedCpu;
          });
          localStorage.setItem('primetime_dynasty_varied_standings_v1', 'true');
        }
        if (!curryGranted) {
          ids.forEach((k) => {
            const om = parsed[k].ownedMap || {};
            ['curry-primetime-99', 'curry-legends-96', 'curry-elite-93'].forEach(
              (cid) => {
                if (om[cid] && om[cid].quantity > 0) {
                  om[cid] = { ...om[cid], quantity: om[cid].quantity + 2 };
                }
              }
            );
            if (!om['curry-primetime-99'] || om['curry-primetime-99'].quantity < 3) {
              om['curry-primetime-99'] = {
                cardId: 'curry-primetime-99',
                quantity: 3,
                evoBonus: om['curry-primetime-99']?.evoBonus ?? 0,
                gamesPlayed: om['curry-primetime-99']?.gamesPlayed ?? 2,
                totalPoints: om['curry-primetime-99']?.totalPoints ?? 68,
                totalRebounds: om['curry-primetime-99']?.totalRebounds ?? 10,
                totalAssists: om['curry-primetime-99']?.totalAssists ?? 18,
                clutchPlaysWon: om['curry-primetime-99']?.clutchPlaysWon ?? 2,
                clutchPlaysTotal: om['curry-primetime-99']?.clutchPlaysTotal ?? 2,
              };
            }
            parsed[k].ownedMap = om;
          });
          localStorage.setItem('primetime_dynasty_curry_grant_v1', 'true');
        }
        localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(parsed));
        const chosenId = activeRaw && parsed[activeRaw] ? activeRaw : ids[0];
        return { profiles: parsed, activeId: chosenId };
      }
    }
    localStorage.setItem('primetime_dynasty_realistic_default_v1', 'true');
    localStorage.setItem('primetime_dynasty_curry_grant_v1', 'true');
  } catch (e) {
    console.warn('Could not load saved profiles from localStorage:', e);
  }
  const starter = createStarterProfile('gm-profile-1', 'GM Player 1');
  return {
    profiles: { [starter.id]: starter },
    activeId: starter.id,
  };
}

export function App() {
  const initialStore = useMemo(() => loadInitialProfiles(), []);
  const initialActive = initialStore.profiles[initialStore.activeId];

  // Saved GM Accounts & Instant Auto-Login State
  const [profilesMap, setProfilesMap] = useState<Record<string, FullSavedProfile>>(
    initialStore.profiles
  );
  const [activeProfileId, setActiveProfileId] = useState<string>(
    initialStore.activeId
  );
  const [gmName, setGmName] = useState<string>(initialActive.gmName);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [claimedMilestones, setClaimedMilestones] = useState<string[]>(
    initialActive.claimedMilestones || []
  );

  // Core Mode, Universe & Franchise Identity State
  const [gameMode, setGameMode] = useState<GameMode>('PACK_MODE');
  const [packTab, setPackTab] = useState<
    'PACKS' | 'LINEUP' | 'SHOWDOWN' | 'LEADERBOARD' | 'MILESTONES'
  >('PACKS');
  const [universe, setUniverse] = useState<UniverseMode>(initialActive.universe);
  const [franchiseTeam, setFranchiseTeam] = useState<TeamIdentity>(
    initialActive.franchiseTeam
  );
  const [useFranchiseJersey, setUseFranchiseJersey] = useState<boolean>(
    initialActive.useFranchiseJersey
  );
  const [isStudioOpen, setIsStudioOpen] = useState<boolean>(false);

  // Pack Mode Economy & Owned Collection Binder
  const [coins, setCoins] = useState<number>(initialActive.coins);
  const [jackpotCharges, setJackpotCharges] = useState<number>(
    initialActive.jackpotCharges
  );
  const JACKPOT_TARGET = 35;

  const [ownedMap, setOwnedMap] = useState<Record<string, OwnedCard>>(
    initialActive.ownedMap
  );

  // Active 6-Man Lineup
  const [lineupIds, setLineupIds] = useState<Record<LineupSlot, string>>(
    initialActive.lineupIds
  );

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

  // League Team Standings State (Both User & CPU Franchises are stateful and update after every game!)
  const [userRecord, setUserRecord] = useState(initialActive.userRecord);

  const [cpuRecords, setCpuRecords] = useState<
    Record<
      string,
      {
        wins: number;
        losses: number;
        pointsFor: number;
        pointsAgainst: number;
        championships: number;
      }
    >
  >(initialActive.cpuRecords);

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
      const maxCap = c.ovr >= 99 && evo > 0 ? 100 : 99;
      return acc + Math.min(maxCap, c.ovr + evo);
    }, 0);
    return Math.round(sum / slots.length);
  }, [lineupCards, ownedMap]);

  // Automatic Instant Save Effect whenever any game state changes!
  useEffect(() => {
    const updatedProfile: FullSavedProfile = {
      id: activeProfileId,
      gmName,
      updatedAt: new Date().toISOString(),
      coins,
      jackpotCharges,
      universe,
      franchiseTeam,
      useFranchiseJersey,
      ownedMap,
      lineupIds,
      userRecord,
      cpuRecords,
      claimedMilestones,
    };

    setProfilesMap((prev) => {
      const next = { ...prev, [activeProfileId]: updatedProfile };
      try {
        localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(next));
        localStorage.setItem(STORAGE_ACTIVE_ID_KEY, activeProfileId);
      } catch (e) {
        console.warn('Auto-save error:', e);
      }
      return next;
    });
  }, [
    activeProfileId,
    gmName,
    coins,
    jackpotCharges,
    universe,
    franchiseTeam,
    useFranchiseJersey,
    ownedMap,
    lineupIds,
    userRecord,
    cpuRecords,
    claimedMilestones,
  ]);

  const applyLoadedProfile = (prof: FullSavedProfile) => {
    setActiveProfileId(prof.id);
    setGmName(prof.gmName);
    setCoins(prof.coins);
    setJackpotCharges(prof.jackpotCharges ?? 0);
    setUniverse(prof.universe ?? 'REALISTIC');
    setFranchiseTeam(prof.franchiseTeam ?? DEFAULT_CUSTOM_TEAM);
    setUseFranchiseJersey(Boolean(prof.useFranchiseJersey));
    setOwnedMap(prof.ownedMap);
    setLineupIds(prof.lineupIds);
    setUserRecord(prof.userRecord);
    setCpuRecords(prof.cpuRecords || createDefaultCpuRecords());
    setClaimedMilestones(prof.claimedMilestones || []);
  };

  const handleSwitchProfile = (profileId: string) => {
    const target = profilesMap[profileId];
    if (!target) return;
    applyLoadedProfile(target);
  };

  const handleCreateNewProfile = (newGmName: string) => {
    const newId = `gm-${Date.now()}`;
    const fresh = createStarterProfile(newId, newGmName);
    setProfilesMap((prev) => ({ ...prev, [newId]: fresh }));
    applyLoadedProfile(fresh);
  };

  const handleDeleteProfile = (profileId: string) => {
    const remainingIds = Object.keys(profilesMap).filter((id) => id !== profileId);
    if (remainingIds.length === 0) return;
    setProfilesMap((prev) => {
      const next = { ...prev };
      delete next[profileId];
      try {
        localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
    if (profileId === activeProfileId) {
      applyLoadedProfile(profilesMap[remainingIds[0]]);
    }
  };

  const handleExportSaveCode = (): string => {
    const currentProfile: FullSavedProfile = {
      id: activeProfileId,
      gmName,
      updatedAt: new Date().toISOString(),
      coins,
      jackpotCharges,
      universe,
      franchiseTeam,
      useFranchiseJersey,
      ownedMap,
      lineupIds,
      userRecord,
      cpuRecords,
      claimedMilestones,
    };
    return btoa(encodeURIComponent(JSON.stringify(currentProfile)));
  };

  const handleImportSaveCode = (code: string): boolean => {
    try {
      const jsonStr = decodeURIComponent(atob(code.trim()));
      const parsed = JSON.parse(jsonStr) as FullSavedProfile;
      if (!parsed || !parsed.ownedMap || !parsed.lineupIds) return false;
      const importedId = parsed.id || `gm-imported-${Date.now()}`;
      const normalized: FullSavedProfile = {
        ...parsed,
        id: importedId,
        gmName: parsed.gmName || 'Imported GM',
        updatedAt: new Date().toISOString(),
      };
      setProfilesMap((prev) => ({ ...prev, [importedId]: normalized }));
      applyLoadedProfile(normalized);
      return true;
    } catch (e) {
      return false;
    }
  };

  const savedProfileSummaries: SavedProfileSummary[] = useMemo(() => {
    return Object.values(profilesMap).map((p) => {
      const slots: LineupSlot[] = ['PG', 'SG', 'SF', 'PF', 'C', 'SIXTH'];
      const sum = slots.reduce((acc, s) => {
        const c = cardById(p.lineupIds[s]);
        const evo = p.ownedMap[c.id]?.evoBonus ?? 0;
        const cap = c.ovr >= 99 && evo > 0 ? 100 : 99;
        return acc + Math.min(cap, c.ovr + evo);
      }, 0);
      return {
        id: p.id,
        gmName: p.gmName,
        franchiseName: `${p.franchiseTeam.city} ${p.franchiseTeam.name}`,
        franchiseAbbr: p.franchiseTeam.abbreviation,
        primaryColor: p.franchiseTeam.primaryColor,
        coins: p.coins,
        teamOvr: Math.round(sum / slots.length),
        wins: p.userRecord.wins,
        losses: p.userRecord.losses,
        updatedAt: p.updatedAt,
      };
    });
  }, [profilesMap]);

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
    ).map((t, idx) => {
      const rec = cpuRecords[t.id] || {
        wins: 3,
        losses: 2,
        pointsFor: 500,
        pointsAgainst: 490,
        championships: 0,
      };
      return {
        id: t.id,
        city: t.city,
        name: t.name,
        abbreviation: t.abbreviation,
        primaryColor: t.primaryColor,
        secondaryColor: t.secondaryColor,
        isUser: false,
        wins: rec.wins,
        losses: rec.losses,
        pointsFor: rec.pointsFor,
        pointsAgainst: rec.pointsAgainst,
        teamOvr: 94 - idx,
        collectionScore: 9800 - idx * 720,
        championships: rec.championships,
      };
    });

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
  }, [franchiseTeam, userRecord, cpuRecords, teamOvr, collectionScore]);

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

    // Add Rainbow Jackpot Pity Meter charges so every pack brings you closer to a 98-99 Rainbow Icon!
    const chargeGain =
      pack.id === 'primetime-rainbow-pack'
        ? 5
        : pack.id === 'legends-shiny-pack'
        ? 3
        : pack.id === 'allstar-pack'
        ? 2
        : 1;

    const pulled: PlayerCardTemplate[] = [];
    for (let i = 0; i < pack.cardCount; i++) {
      const forceTier = i === pack.cardCount - 1 ? pack.guaranteedMinTier : undefined;
      pulled.push(rollCardFromPool(pack, forceTier));
    }

    // If user naturally hit a 0.1% - 3.5% Rainbow Primetime card, reset meter; otherwise increment
    const hitNaturalPrimetime = pulled.some((c) => c.tier === 'PRIMETIME');
    setJackpotCharges((prev) =>
      hitNaturalPrimetime ? 0 : Math.min(JACKPOT_TARGET, prev + chargeGain)
    );

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

  const handleClaimJackpotPrimetime = () => {
    if (jackpotCharges < JACKPOT_TARGET) return;
    const pool = getCardsForUniverse(universe).filter((c) => c.tier === 'PRIMETIME');
    const finalPool =
      pool.length > 0
        ? pool
        : NBA_PLAYER_CARDS.filter((c) => c.tier === 'PRIMETIME');
    const jackpotCard = finalPool[Math.floor(Math.random() * finalPool.length)];

    setJackpotCharges(0);
    setOwnedMap((prev) => {
      const existing = prev[jackpotCard.id];
      return {
        ...prev,
        [jackpotCard.id]: existing
          ? { ...existing, quantity: existing.quantity + 1 }
          : {
              cardId: jackpotCard.id,
              quantity: 1,
              evoBonus: 0,
              gamesPlayed: 0,
              totalPoints: 0,
              totalRebounds: 0,
              totalAssists: 0,
              clutchPlaysWon: 0,
              clutchPlaysTotal: 0,
            },
      };
    });

    confetti({ particleCount: 130, spread: 85, origin: { y: 0.55 } });
    setInspectedCard(jackpotCard);
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

  // Milestones & Trophies System
  const milestonesList = useMemo(() => {
    const hasLegend = ownedCardsList.some(({ card }) => card.tier === 'LEGENDS');
    const hasPrimetime = ownedCardsList.some(
      ({ card }) => card.tier === 'PRIMETIME'
    );
    const hasEvolvedCard = ownedCardsList.some(
      ({ owned }) => owned.evoBonus >= 1
    );
    const has100OvrCard = ownedCardsList.some(
      ({ card, owned }) => card.ovr >= 99 && owned.evoBonus >= 1
    );

    return [
      {
        id: 'ms-first-win',
        title: 'First Showdown Victory',
        description: 'Win a Tactical Showdown game against any CPU franchise (Reach 5+ Total Wins).',
        rewardCoins: 1000,
        rewardCharges: 2,
        unlocked: userRecord.wins >= 5,
        progressText: `${Math.min(5, userRecord.wins)} / 5 Total Wins`,
      },
      {
        id: 'ms-10-wins',
        title: 'Dynasty Contender (10 Wins)',
        description: 'Reach 10 Total Franchise Wins in Tactical Showdowns.',
        rewardCoins: 2500,
        rewardCharges: 4,
        unlocked: userRecord.wins >= 10,
        progressText: `${Math.min(10, userRecord.wins)} / 10 Total Wins`,
      },
      {
        id: 'ms-team-90',
        title: '90+ OVR Contender Rotation',
        description: 'Build an active 6-man rotation with a Team Rating of 90 OVR or higher.',
        rewardCoins: 2000,
        rewardCharges: 3,
        unlocked: teamOvr >= 90,
        progressText: `Current Team OVR: ${teamOvr} / 90`,
      },
      {
        id: 'ms-team-95',
        title: '95+ OVR Superteam Dynasty',
        description: 'Build an active 6-man rotation with a Team Rating of 95 OVR or higher.',
        rewardCoins: 4500,
        rewardCharges: 5,
        unlocked: teamOvr >= 95,
        progressText: `Current Team OVR: ${teamOvr} / 95`,
      },
      {
        id: 'ms-pull-legend',
        title: 'Shiny Holographic Collector',
        description: 'Collect at least one 95–97 OVR Shiny Holographic Legends card in your binder.',
        rewardCoins: 1500,
        rewardCharges: 3,
        unlocked: hasLegend,
        progressText: hasLegend ? 'Owned in Binder!' : '0 / 1 Shiny Legend Owned',
      },
      {
        id: 'ms-pull-primetime',
        title: 'Prismatic Rainbow Jackpot',
        description: 'Collect at least one 98–99 OVR Prismatic Rainbow Primetime card in your binder.',
        rewardCoins: 3500,
        rewardCharges: 5,
        unlocked: hasPrimetime,
        progressText: hasPrimetime
          ? 'Owned in Binder!'
          : '0 / 1 Rainbow Primetime Owned',
      },
      {
        id: 'ms-first-evo',
        title: 'Card Evolution Alchemist',
        description: 'Combine 3 copies of any player card to permanently boost its OVR by +1.',
        rewardCoins: 1500,
        rewardCharges: 3,
        unlocked: hasEvolvedCard,
        progressText: hasEvolvedCard ? 'Evolved!' : 'Combine 3x Copies in Binder',
      },
      {
        id: 'ms-forge-100',
        title: '100 OVR Dark Matter Forger',
        description: 'Combine 3 copies of a 99 OVR Primetime card to break the cap and forge a 100 OVR Dark Matter card!',
        rewardCoins: 10000,
        rewardCharges: 10,
        unlocked: has100OvrCard,
        progressText: has100OvrCard
          ? '100 Dark Matter Forged!'
          : 'Combine 3x 99 OVR Cards',
      },
    ];
  }, [ownedCardsList, userRecord.wins, teamOvr]);

  // Live Card Market (4 Rotating Singles + 3 Trending 2.5x Sell Surge Players)
  const buildCardMarket = (univ: UniverseMode) => {
    const pool = getCardsForUniverse(univ);
    const pickRandom = (arr: PlayerCardTemplate[]) =>
      arr[Math.floor(Math.random() * arr.length)] || pool[0];

    const allStars = pool.filter((c) => c.tier === 'ALL_STAR');
    const elites = pool.filter((c) => c.tier === 'ELITE');
    const legends = pool.filter((c) => c.tier === 'LEGENDS');
    const primetimes = pool.filter((c) => c.tier === 'PRIMETIME');

    // Slot 1: Daily Deal (25% OFF All-Star or Elite)
    const dealPool = [...allStars, ...elites];
    const slot1Card = pickRandom(dealPool);
    const slot1BasePrice = slot1Card.tier === 'ELITE' ? 2400 : 1200;
    const slot1Price = Math.round(slot1BasePrice * 0.75);

    // Slot 2: All-Star Starter
    const slot2Card = pickRandom(
      allStars.filter((c) => c.id !== slot1Card.id)
    );
    const slot2Price = 1150 + (slot2Card.ovr - 88) * 120;

    // Slot 3: Franchise Elite (92-94 OVR)
    const slot3Card = pickRandom(
      elites.filter((c) => c.id !== slot1Card.id)
    );
    const slot3Price = 2400 + (slot3Card.ovr - 92) * 250;

    // Slot 4: Vault Headliner (88% Shiny Legend 95-97, 12% Rare Rainbow Primetime 98-99!)
    const hitPrimetimeSpotlight = Math.random() < 0.12 && primetimes.length > 0;
    const slot4Card = hitPrimetimeSpotlight
      ? pickRandom(primetimes)
      : pickRandom(legends);
    const slot4Price = hitPrimetimeSpotlight
      ? 14500
      : 4800 + (slot4Card.ovr - 95) * 450;

    // 3 Trending High-Demand Cards (2.5x Quick-Sell Surge)
    const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
    const trending = shuffledPool.slice(0, 3).map((c) => c.id);

    return {
      listings: [
        {
          slotIndex: 0,
          tag: '🔥 DAILY DEAL (25% OFF)',
          card: slot1Card,
          priceCoins: slot1Price,
          originalPrice: slot1BasePrice,
        },
        {
          slotIndex: 1,
          tag: 'ALL-STAR ROTATION',
          card: slot2Card,
          priceCoins: slot2Price,
        },
        {
          slotIndex: 2,
          tag: 'FRANCHISE ELITE',
          card: slot3Card,
          priceCoins: slot3Price,
        },
        {
          slotIndex: 3,
          tag: hitPrimetimeSpotlight
            ? '🌈 RARE PRIMETIME SPOTLIGHT!'
            : '✨ SHINY LEGEND HEADLINER',
          card: slot4Card,
          priceCoins: slot4Price,
        },
      ],
      trendingIds: trending,
    };
  };

  const [cardMarket, setCardMarket] = useState(() => buildCardMarket(universe));
  const [boughtMarketSlots, setBoughtMarketSlots] = useState<number[]>([]);

  // Refresh Card Market automatically when universe changes
  useEffect(() => {
    setCardMarket(buildCardMarket(universe));
    setBoughtMarketSlots([]);
  }, [universe]);

  const handleRerollMarket = () => {
    const REROLL_COST = 200;
    if (coins < REROLL_COST) {
      alert(`Need ${REROLL_COST} Coins to refresh the Card Market!`);
      return;
    }
    setCoins((c) => c - REROLL_COST);
    setCardMarket(buildCardMarket(universe));
    setBoughtMarketSlots([]);
  };

  const handleBuyMarketCard = (
    slotIndex: number,
    card: PlayerCardTemplate,
    priceCoins: number
  ) => {
    if (boughtMarketSlots.includes(slotIndex)) return;
    if (coins < priceCoins) {
      alert(
        `Need ${priceCoins.toLocaleString()} Coins to buy ${card.editionTitle} ${card.firstName} ${card.lastName}!`
      );
      return;
    }
    setCoins((c) => c - priceCoins);
    setBoughtMarketSlots((prev) => [...prev, slotIndex]);
    setOwnedMap((prev) => {
      const existing = prev[card.id];
      return {
        ...prev,
        [card.id]: existing
          ? { ...existing, quantity: existing.quantity + 1 }
          : {
              cardId: card.id,
              quantity: 1,
              evoBonus: 0,
              gamesPlayed: 0,
              totalPoints: 0,
              totalRebounds: 0,
              totalAssists: 0,
              clutchPlaysWon: 0,
              clutchPlaysTotal: 0,
            },
      };
    });
    if (card.tier === 'PRIMETIME' || card.tier === 'LEGENDS') {
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleSellTrendingDuplicate = (cardId: string) => {
    const owned = ownedMap[cardId];
    if (!owned || owned.quantity <= 1) return;
    const card = cardById(cardId);
    const surgePayout = Math.round(card.quickSellCoins * 2.5);
    setCoins((c) => c + surgePayout);
    setOwnedMap((prev) => ({
      ...prev,
      [cardId]: {
        ...prev[cardId],
        quantity: prev[cardId].quantity - 1,
      },
    }));
    confetti({ particleCount: 40, spread: 55, origin: { y: 0.7 } });
  };

  const unclaimedReadyCount = useMemo(() => {
    return milestonesList.filter(
      (m) => m.unlocked && !claimedMilestones.includes(m.id)
    ).length;
  }, [milestonesList, claimedMilestones]);

  const handleClaimMilestone = (milestoneId: string) => {
    const m = milestonesList.find((x) => x.id === milestoneId);
    if (!m || !m.unlocked || claimedMilestones.includes(milestoneId)) return;
    setClaimedMilestones((prev) => [...prev, milestoneId]);
    setCoins((c) => c + m.rewardCoins);
    setJackpotCharges((prev) =>
      Math.min(JACKPOT_TARGET, prev + m.rewardCharges)
    );
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

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

          {/* Right GM Account Auto-Login Pill, Coin Balance & Quick Refill */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Option 1 Instant Auto-Login & Cloud Vault Button */}
            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-xs font-extrabold text-white flex items-center gap-2 transition shadow"
              title="GM Account, Auto-Save Status, Switch Profiles & Save Backup Codes"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>GM: {gmName}</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] uppercase">
                Auto-Saved
              </span>
            </button>

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
                  onClick={() => setCoins(15000)}
                  className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold flex items-center gap-1 transition"
                  title="Reset Coin Balance to 15,000"
                >
                  <Gift className="w-3.5 h-3.5" />
                  Set 15,000 Coins
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
                    label: 'Leaderboards & Showcase',
                    icon: Trophy,
                  },
                  {
                    id: 'MILESTONES',
                    label:
                      unclaimedReadyCount > 0
                        ? `Milestones (${unclaimedReadyCount} Ready!)`
                        : 'Milestones & Trophies',
                    icon: Award,
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
                          : item.id === 'MILESTONES' && unclaimedReadyCount > 0
                          ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 hover:bg-emerald-500/30'
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
                GM: <strong className="text-emerald-400">{gmName}</strong> • Squad:{' '}
                <strong className="text-amber-400">{teamOvr} OVR</strong> • Record:{' '}
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
                      <Sparkles className="w-3.5 h-3.5" /> 5 Rarity Tiers • Shiny Legends (95–97) & Rainbow Primetime (98–99 • Forge 3x 99s into 100 OVR!)
                    </div>
                    <h1 className="font-sport font-extrabold text-3xl sm:text-4xl text-white leading-tight">
                      RIP PACKS. COLLECT ICONIC EDITIONS. BUILD THE{' '}
                      <span className="text-amber-400">
                        {franchiseTeam.city.toUpperCase()} {franchiseTeam.name.toUpperCase()}
                      </span>
                      .
                    </h1>
                    <p className="text-sm text-slate-300">
                      Pull multiple editions of legends and superstars—like a <strong>97 OVR Shiny Holographic Legends Michael Jordan</strong> alongside a <strong>99 OVR Prismatic Rainbow Primetime Michael Jordan</strong>. Combine 3 copies of any 99 OVR card to forge a <strong>100 OVR</strong> card!
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
                      onClick={() => setPackTab('MILESTONES')}
                      className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-sport font-extrabold text-base uppercase tracking-wider flex items-center gap-2 border border-slate-700 transition"
                    >
                      <Award className="w-5 h-5 text-amber-400" />
                      Milestones
                    </button>
                  </div>
                </div>

                {/* Primetime Rainbow Jackpot Pity Meter */}
                <div className="p-5 rounded-3xl bg-slate-900 border border-fuchsia-500/40 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-fuchsia-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        PRIMETIME RAINBOW JACKPOT METER (ULTRA-RARE 0.1% – 2.9% PACK ODDS)
                      </span>
                      <span className="font-sport font-extrabold text-sm text-white">
                        {jackpotCharges} / {JACKPOT_TARGET} CHARGES
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full card-tier-primetime transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((jackpotCharges / JACKPOT_TARGET) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      98–99 Rainbow Primetime cards are ultra-rare jackpot pulls (2.9% in the Primetime Chase Vault)! Every pack you rip charges this meter (+1 to +5)—fill it to <strong>{JACKPOT_TARGET}/{JACKPOT_TARGET}</strong> for a guaranteed 98–99 Rainbow Icon!
                    </p>
                  </div>

                  <button
                    disabled={jackpotCharges < JACKPOT_TARGET}
                    onClick={handleClaimJackpotPrimetime}
                    className={`px-5 py-3 rounded-2xl font-sport font-extrabold text-sm uppercase tracking-wider shrink-0 transition ${
                      jackpotCharges >= JACKPOT_TARGET
                        ? 'card-tier-primetime text-slate-950 shadow-xl hover:scale-105 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    {jackpotCharges >= JACKPOT_TARGET
                      ? '✨ CLAIM 98–99 RAINBOW JACKPOT! ✨'
                      : `${JACKPOT_TARGET - jackpotCharges} Charges to Rainbow Guarantee`}
                  </button>
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

                {/* Live Card Market (Replaces Edition Showcase!) */}
                <div className="p-6 rounded-3xl bg-slate-900/95 border border-slate-800 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10px] font-extrabold uppercase mb-1">
                        <ShoppingBag className="w-3 h-3" /> Live Singles Market • Refreshes After Every Showdown Game
                      </div>
                      <h3 className="font-sport font-extrabold text-2xl text-white">
                        LIVE CARD MARKET: BUY SINGLES & CHASE 3× EVOLUTIONS
                      </h3>
                      <p className="text-xs text-slate-400">
                        Buy specific single cards directly with Coins—perfect for hunting a 3rd copy to evolve (+1 OVR) or forging 3× 99s into a <strong>100 OVR Dark Matter</strong> card!
                      </p>
                    </div>

                    <button
                      onClick={handleRerollMarket}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Refresh Market (200 Coins)
                    </button>
                  </div>

                  {/* 4 Rotating Single Card Listings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 justify-items-center">
                    {cardMarket.listings.map((item) => {
                      const c = item.card;
                      const owned = ownedMap[c.id];
                      const ownedQty = owned?.quantity ?? 0;
                      const isBought = boughtMarketSlots.includes(item.slotIndex);
                      const canAfford = coins >= item.priceCoins;
                      const needsOneForEvo = ownedQty === 2;

                      return (
                        <div
                          key={item.slotIndex}
                          className="flex flex-col items-center gap-2.5 w-60"
                        >
                          <div className="w-full flex items-center justify-between px-1">
                            <span className="px-2 py-0.5 rounded bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-extrabold uppercase truncate">
                              {item.tag}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold ${
                                needsOneForEvo
                                  ? 'text-emerald-400 animate-pulse'
                                  : ownedQty > 0
                                  ? 'text-sky-300'
                                  : 'text-slate-500'
                              }`}
                            >
                              {needsOneForEvo
                                ? 'Owned ×2 (1 Away from Evo!)'
                                : ownedQty > 0
                                ? `Owned ×${ownedQty}`
                                : 'Unowned'}
                            </span>
                          </div>

                          <PlayerCard
                            card={c}
                            evoBonus={owned?.evoBonus ?? 0}
                            quantity={ownedQty}
                            useFranchiseJersey={useFranchiseJersey}
                            franchiseTeam={franchiseTeam}
                            size="md"
                            onClick={() => setInspectedCard(c)}
                          />

                          <button
                            disabled={isBought}
                            onClick={() =>
                              handleBuyMarketCard(
                                item.slotIndex,
                                c,
                                item.priceCoins
                              )
                            }
                            className={`w-full py-2.5 rounded-xl font-sport font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 transition ${
                              isBought
                                ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 cursor-not-allowed'
                                : canAfford
                                ? 'bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 text-slate-950 shadow-lg shadow-emerald-500/20'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                            {isBought ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                Purchased (In Binder)
                              </>
                            ) : (
                              <>
                                <Coins className="w-4 h-4" />
                                Buy • {item.priceCoins.toLocaleString()} Coins
                                {item.originalPrice && (
                                  <span className="line-through text-[11px] opacity-70 ml-1">
                                    {item.originalPrice}
                                  </span>
                                )}
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Trending 2.5x High-Demand Duplicate Sell Surge Bar */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-extrabold uppercase text-amber-400 flex items-center gap-1.5">
                        <Flame className="w-4 h-4 text-rose-400" />
                        Hot Market Demand: 2.5× Duplicate Sell Price right now!
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Hold onto duplicates in your binder until they trend here to cash out for 2.5× Coins!
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {cardMarket.trendingIds.map((id) => {
                        const c = cardById(id);
                        const owned = ownedMap[id];
                        const hasDup = (owned?.quantity ?? 0) > 1;
                        const surgePrice = Math.round(c.quickSellCoins * 2.5);
                        return (
                          <div
                            key={id}
                            className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 ${
                              hasDup
                                ? 'bg-amber-500/20 border-amber-400 text-white'
                                : 'bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                          >
                            <button
                              onClick={() => setInspectedCard(c)}
                              className="font-bold hover:text-amber-300 text-left"
                            >
                              <span className="text-amber-400">{c.ovr}</span>{' '}
                              {c.lastName}{' '}
                              <span className="text-[10px] text-slate-400">
                                (+{surgePrice} Coins)
                              </span>
                            </button>
                            {hasDup && (
                              <button
                                onClick={() => handleSellTrendingDuplicate(id)}
                                className="px-2 py-0.5 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-extrabold uppercase"
                              >
                                Sell 1 Dup (×{owned.quantity})
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
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

                {/* Collection Binder + Duplicate Quick-Sell & Combine (+1 OVR Evo, including 3x 99 -> 100 Dark Matter!) */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-sport font-extrabold text-2xl text-white">
                        COLLECTION BINDER ({ownedCardsList.length} Unique Editions Owned)
                      </h3>
                      <p className="text-xs text-slate-400">
                        Sell extra duplicates for Coins, combine 3 copies for +1 OVR, or combine 3 copies of a <strong>99 OVR</strong> card to forge a <strong>100 OVR Dark Matter</strong> card!
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
                    {ownedCardsList.map(({ card, owned }) => {
                      const inLineupSlot = (
                        Object.keys(lineupIds) as LineupSlot[]
                      ).find((s) => lineupIds[s] === card.id);

                      const canCombine =
                        owned.quantity >= 3 &&
                        (card.ovr + owned.evoBonus < 99 ||
                          (card.ovr + owned.evoBonus === 99 && card.ovr === 99));

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

                              {canCombine && (
                                <button
                                  onClick={() => handleCombineEvo(card.id)}
                                  className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 transition ${
                                    card.ovr + owned.evoBonus === 99
                                      ? 'bg-gradient-to-r from-purple-700 via-fuchsia-500 to-amber-400 text-white shadow-md shadow-fuchsia-500/30'
                                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                                  }`}
                                >
                                  <ArrowUpCircle className="w-3.5 h-3.5" />
                                  {card.ovr + owned.evoBonus === 99
                                    ? '🌌 Forge 100 Dark Matter!'
                                    : 'Evo +1 OVR (3x)'}
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
                standings={leagueStandings}
                useFranchiseJersey={useFranchiseJersey}
                userTeamOvr={teamOvr}
                userWins={userRecord.wins}
                onInspectCard={(card) => setInspectedCard(card)}
                onJumpToLeaderboard={() => setPackTab('LEADERBOARD')}
                onCompleteGame={(result) => {
                  // Refresh the Live Card Market after every completed Showdown game!
                  setCardMarket(buildCardMarket(universe));
                  setBoughtMarketSlots([]);

                  // 1. Credit Coins on Win OR Deduct Coins on Loss!
                  setCoins((c) => Math.max(0, c + result.coinsEarned));

                  // 2. Update User Team Standing
                  setUserRecord((prev) => ({
                    wins: prev.wins + (result.won ? 1 : 0),
                    losses: prev.losses + (result.won ? 0 : 1),
                    pointsFor: prev.pointsFor + result.userScore,
                    pointsAgainst: prev.pointsAgainst + result.cpuScore,
                    championships:
                      prev.championships + (result.bonusChampionship ? 1 : 0),
                  }));

                  // 3. Update CPU Opponent Standing (plus any simulated Bracket CPU matchups)
                  setCpuRecords((prev) => {
                    const next = { ...prev };
                    const opp = next[result.cpuTeamId] || {
                      wins: 3,
                      losses: 2,
                      pointsFor: 500,
                      pointsAgainst: 490,
                      championships: 0,
                    };
                    next[result.cpuTeamId] = {
                      ...opp,
                      wins: opp.wins + (result.won ? 0 : 1),
                      losses: opp.losses + (result.won ? 1 : 0),
                      pointsFor: opp.pointsFor + result.cpuScore,
                      pointsAgainst: opp.pointsAgainst + result.userScore,
                    };

                    if (result.otherCpuResults) {
                      result.otherCpuResults.forEach((sim) => {
                        if (next[sim.winnerId]) {
                          next[sim.winnerId] = {
                            ...next[sim.winnerId],
                            wins: next[sim.winnerId].wins + 1,
                            pointsFor: next[sim.winnerId].pointsFor + sim.winnerPts,
                            pointsAgainst:
                              next[sim.winnerId].pointsAgainst + sim.loserPts,
                          };
                        }
                        if (next[sim.loserId]) {
                          next[sim.loserId] = {
                            ...next[sim.loserId],
                            losses: next[sim.loserId].losses + 1,
                            pointsFor: next[sim.loserId].pointsFor + sim.loserPts,
                            pointsAgainst:
                              next[sim.loserId].pointsAgainst + sim.winnerPts,
                          };
                        }
                      });
                    }
                    return next;
                  });

                  // 4. Accumulate Per-Player Box Score Stats & Award Bonus Trophy Card if Won!
                  setOwnedMap((prev) => {
                    const next = { ...prev };
                    Object.entries(result.playerStats).forEach(([cardId, st]) => {
                      if (!st.played && st.pts === 0) return;
                      const existing = next[cardId] || {
                        cardId,
                        quantity: 1,
                        evoBonus: 0,
                        gamesPlayed: 0,
                        totalPoints: 0,
                        totalRebounds: 0,
                        totalAssists: 0,
                        clutchPlaysWon: 0,
                        clutchPlaysTotal: 0,
                      };
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
                    });

                    if (result.bonusCardAwarded) {
                      const bId = result.bonusCardAwarded.id;
                      const ex = next[bId];
                      next[bId] = ex
                        ? { ...ex, quantity: ex.quantity + 1 }
                        : {
                            cardId: bId,
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

            {/* ==================== PACK MODE TAB 5: MILESTONES & TROPHIES ==================== */}
            {packTab === 'MILESTONES' && (
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-extrabold uppercase mb-1">
                      <Award className="w-3.5 h-3.5" /> Franchise Milestones & Trophy Rewards
                    </div>
                    <h2 className="font-sport font-extrabold text-2xl sm:text-3xl text-white">
                      COMPLETE GOALS TO CLAIM COINS & RAINBOW JACKPOT CHARGES
                    </h2>
                    <p className="text-xs text-slate-400">
                      Every milestone you claim is permanently saved to your logged-in GM profile ({gmName}).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {milestonesList.map((m) => {
                    const isClaimed = claimedMilestones.includes(m.id);
                    return (
                      <div
                        key={m.id}
                        className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition ${
                          isClaimed
                            ? 'bg-slate-900/50 border-emerald-500/30'
                            : m.unlocked
                            ? 'bg-slate-900 border-amber-400 ring-1 ring-amber-400/30'
                            : 'bg-slate-900/90 border-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <h3 className="font-sport font-extrabold text-xl text-white">
                              {m.title}
                            </h3>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                isClaimed
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : m.unlocked
                                  ? 'bg-amber-400 text-slate-950'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {isClaimed
                                ? 'CLAIMED'
                                : m.unlocked
                                ? 'READY TO CLAIM!'
                                : m.progressText}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">{m.description}</p>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                          <div className="flex items-center gap-2 text-xs font-extrabold">
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              +{m.rewardCoins.toLocaleString()} Coins
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">
                              +{m.rewardCharges} Rainbow Charges
                            </span>
                          </div>

                          {isClaimed ? (
                            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-400 uppercase">
                              <CheckCircle2 className="w-4 h-4" /> Reward Claimed
                            </span>
                          ) : (
                            <button
                              disabled={!m.unlocked}
                              onClick={() => handleClaimMilestone(m.id)}
                              className={`px-4 py-2 rounded-xl font-sport font-extrabold text-sm uppercase tracking-wider transition ${
                                m.unlocked
                                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 shadow-lg cursor-pointer'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              {m.unlocked ? 'Claim Reward' : 'Locked'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
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

      {/* ==================== OPTION 1 GM ACCOUNT, AUTO-SAVE & BACKUP CODE MODAL ==================== */}
      <AccountModal
        isOpen={isAccountModalOpen}
        activeProfileId={activeProfileId}
        currentGmName={gmName}
        profiles={savedProfileSummaries}
        onClose={() => setIsAccountModalOpen(false)}
        onUpdateGmName={(newName) => setGmName(newName)}
        onSwitchProfile={handleSwitchProfile}
        onCreateNewProfile={handleCreateNewProfile}
        onDeleteProfile={handleDeleteProfile}
        onExportSaveCode={handleExportSaveCode}
        onImportSaveCode={handleImportSaveCode}
      />
    </div>
  );
}
export default App;
