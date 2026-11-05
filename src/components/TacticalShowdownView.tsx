import React, { useState } from 'react';
import {
  LineupSlot,
  OwnedCard,
  PlayerCardTemplate,
  TeamIdentity,
} from '../types/game';
import { NBA_PLAYER_CARDS } from '../data/nbaData';
import { PlayerCard } from './PlayerCard';
import confetti from 'canvas-confetti';
import {
  Flame,
  Play,
  RotateCcw,
  Shield,
  Sparkles,
  Swords,
  Trophy,
  Zap,
  Coins,
} from 'lucide-react';

interface TacticalShowdownViewProps {
  lineupCards: Record<LineupSlot, PlayerCardTemplate>;
  ownedMap: Record<string, OwnedCard>;
  franchiseTeam: TeamIdentity;
  useFranchiseJersey: boolean;
  onInspectCard: (card: PlayerCardTemplate) => void;
  onCompleteGame: (result: {
    won: boolean;
    userScore: number;
    cpuScore: number;
    cpuTeamName: string;
    coinsEarned: number;
    playerStats: Record<
      string,
      { pts: number; reb: number; ast: number; clutchWon: number; clutchTotal: number }
    >;
  }) => void;
}

interface CpuChallenge {
  id: string;
  name: string;
  subtitle: string;
  abbr: string;
  primaryColor: string;
  winCoins: number;
  lossCoins: number;
  rosterIds: string[];
}

const CPU_CHALLENGES: CpuChallenge[] = [
  {
    id: 'rookie-cpu',
    name: 'Rising Stars Showcase',
    subtitle: 'Entry Tier • Core Starters & Young Breakouts (82–88 OVR)',
    abbr: 'RSE',
    primaryColor: '#0284C7',
    winCoins: 400,
    lossCoins: 150,
    rosterIds: [
      'trae-base-84',
      'white-base-83',
      'jalen-johnson-base-83',
      'jjj-base-84',
      'naz-base-81',
      'haliburton-base-84',
    ],
  },
  {
    id: 'contender-cpu',
    name: 'Conference Finals Contenders',
    subtitle: 'Pro Tier • All-Stars & Franchise Elites (89–94 OVR)',
    abbr: 'CFC',
    primaryColor: '#059669',
    winCoins: 700,
    lossCoins: 225,
    rosterIds: [
      'brunson-allstar-89',
      'ant-allstar-90',
      'tatum-allstar-91',
      'giannis-elite-94',
      'bam-allstar-88',
      'sga-elite-93',
    ],
  },
  {
    id: 'dynasty-bulls-cpu',
    name: "'96 Dynasty Legends Boss",
    subtitle: 'Legends Tier • Shiny Holographic Icons (91–97 OVR)',
    abbr: 'DYN',
    primaryColor: '#CE1141',
    winCoins: 1200,
    lossCoins: 350,
    rosterIds: [
      'magic-legends-97',
      'mj-legends-97',
      'pippen-allstar-91',
      'rodman-allstar-88',
      'duncan-legends-97',
      'bird-legends-97',
    ],
  },
  {
    id: 'primetime-boss-cpu',
    name: 'Primetime Rainbow Pantheon',
    subtitle: 'Ultimate Boss • 98–99 Rainbow Primetime Icons',
    abbr: 'PRM',
    primaryColor: '#A855F7',
    winCoins: 2000,
    lossCoins: 500,
    rosterIds: [
      'curry-primetime-99',
      'mj-primetime-99',
      'lebron-primetime-99',
      'kobe-primetime-98',
      'shaq-primetime-99',
      'jokic-primetime-98',
    ],
  },
];

interface PlayScenario {
  playNumber: number;
  quarter: number;
  clock: string;
  title: string;
  description: string;
  primaryStat: 'off' | 'play' | 'def' | 'clu';
  secondaryStat: 'off' | 'play' | 'def' | 'clu';
  isClutch: boolean;
}

const PLAY_SCENARIOS: PlayScenario[] = [
  {
    playNumber: 1,
    quarter: 1,
    clock: 'Q1 • 10:15',
    title: 'Opening Transition Push',
    description: 'High-tempo fast break off the opening tip. Speed, ball-handling, and finishing set the tone.',
    primaryStat: 'play',
    secondaryStat: 'off',
    isClutch: false,
  },
  {
    playNumber: 2,
    quarter: 1,
    clock: 'Q1 • 03:40',
    title: 'Half-Court Isolation Scorer',
    description: 'Shot clock winding down—clear out one side for a pure bucket-getter.',
    primaryStat: 'off',
    secondaryStat: 'clu',
    isClutch: false,
  },
  {
    playNumber: 3,
    quarter: 2,
    clock: 'Q2 • 08:20',
    title: 'Perimeter Lockdown Stand',
    description: 'The CPU is hunting a rhythm three. Deploy a stopper to force a turnover and run.',
    primaryStat: 'def',
    secondaryStat: 'play',
    isClutch: false,
  },
  {
    playNumber: 4,
    quarter: 2,
    clock: 'Q2 • 00:45',
    title: 'Two-for-One Halftime Dagger',
    description: 'Orchestrate a crisp pick-and-roll before the halftime buzzer.',
    primaryStat: 'play',
    secondaryStat: 'off',
    isClutch: false,
  },
  {
    playNumber: 5,
    quarter: 3,
    clock: 'Q3 • 07:10',
    title: 'Paint & Rim Protection Battle',
    description: 'Physical battle in the lane—control the glass and protect the rim.',
    primaryStat: 'def',
    secondaryStat: 'off',
    isClutch: false,
  },
  {
    playNumber: 6,
    quarter: 3,
    clock: 'Q3 • 01:55',
    title: 'Third-Quarter Scoring Surge',
    description: 'Break the defense open with deep range or explosive rim pressure.',
    primaryStat: 'off',
    secondaryStat: 'play',
    isClutch: false,
  },
  {
    playNumber: 7,
    quarter: 4,
    clock: 'Q4 • 02:30',
    title: 'Crunch-Time Defensive Stop',
    description: 'CLUTCH MOMENT: Lock down the CPU star in the final two minutes of regulation.',
    primaryStat: 'def',
    secondaryStat: 'clu',
    isClutch: true,
  },
  {
    playNumber: 8,
    quarter: 4,
    clock: 'Q4 • 00:08',
    title: 'Final Buzzer-Beater Showdown',
    description: 'CLUTCH MOMENT: Ball in your hands with the game on the line.',
    primaryStat: 'clu',
    secondaryStat: 'off',
    isClutch: true,
  },
];

const STAT_NAMES: Record<'off' | 'play' | 'def' | 'clu', string> = {
  off: 'OFFENSE',
  play: 'PLAYMAKING',
  def: 'DEFENSE',
  clu: 'CLUTCH IQ',
};

export const TacticalShowdownView: React.FC<TacticalShowdownViewProps> = ({
  lineupCards,
  ownedMap,
  franchiseTeam,
  useFranchiseJersey,
  onInspectCard,
  onCompleteGame,
}) => {
  const [selectedChallenge, setSelectedChallenge] = useState<CpuChallenge>(
    CPU_CHALLENGES[0]
  );
  const [inProgress, setInProgress] = useState(false);
  const [playIndex, setPlayIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [cpuScore, setCpuScore] = useState(0);

  // Track Stamina (0-100) and Last-Used Play Cooldown per slot
  const [staminaBySlot, setStaminaBySlot] = useState<Record<LineupSlot, number>>({
    PG: 100,
    SG: 100,
    SF: 100,
    PF: 100,
    C: 100,
    SIXTH: 100,
  });
  const [cooldownSlot, setCooldownSlot] = useState<LineupSlot | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<LineupSlot>('PG');
  const [tactic, setTactic] = useState<'BALANCED' | 'AGGRESSIVE' | 'CLUTCH_FOCUS'>(
    'BALANCED'
  );

  // Per-game player box score stats
  const [boxScore, setBoxScore] = useState<
    Record<
      string,
      { pts: number; reb: number; ast: number; clutchWon: number; clutchTotal: number }
    >
  >({});

  // Play-by-play ticker log
  const [playLogs, setPlayLogs] = useState<
    {
      playNumber: number;
      clock: string;
      userCardName: string;
      cpuCardName: string;
      userRoll: number;
      cpuRoll: number;
      userPointsAdded: number;
      cpuPointsAdded: number;
      wonPlay: boolean;
      narrative: string;
    }[]
  >([]);

  const [gameFinished, setGameFinished] = useState(false);
  const [cpuPlayOrder, setCpuPlayOrder] = useState<string[]>([]);
  const [revealedPlayResult, setRevealedPlayResult] = useState<{
    userCard: PlayerCardTemplate;
    userSlot: LineupSlot;
    userStaminaAtPlay: number;
    cpuCard: PlayerCardTemplate;
    wonPlay: boolean;
    userPower: number;
    cpuPower: number;
    userPointsAdded: number;
    cpuPointsAdded: number;
    narrative: string;
    isLastPlay: boolean;
  } | null>(null);

  const slotsOrder: LineupSlot[] = ['PG', 'SG', 'SF', 'PF', 'C', 'SIXTH'];

  const startNewShowdown = (challenge: CpuChallenge) => {
    setSelectedChallenge(challenge);
    setInProgress(true);
    setGameFinished(false);
    setRevealedPlayResult(null);
    setPlayIndex(0);
    setUserScore(0);
    setCpuScore(0);
    // Shuffle 8 CPU cards for the 8 plays so the CPU deployment is a genuine surprise
    const pool = [...challenge.rosterIds, ...challenge.rosterIds];
    const shuffled = pool
      .slice(0, PLAY_SCENARIOS.length)
      .sort(() => Math.random() - 0.5);
    setCpuPlayOrder(shuffled);
    setStaminaBySlot({
      PG: 100,
      SG: 100,
      SF: 100,
      PF: 100,
      C: 100,
      SIXTH: 100,
    });
    setCooldownSlot(null);
    setSelectedSlot('PG');
    setPlayLogs([]);
    const initialBox: Record<
      string,
      { pts: number; reb: number; ast: number; clutchWon: number; clutchTotal: number }
    > = {};
    slotsOrder.forEach((slot) => {
      const c = lineupCards[slot];
      initialBox[c.id] = { pts: 0, reb: 0, ast: 0, clutchWon: 0, clutchTotal: 0 };
    });
    setBoxScore(initialBox);
  };

  const currentScenario = PLAY_SCENARIOS[playIndex];
  const cpuCardId =
    cpuPlayOrder[playIndex] ||
    selectedChallenge.rosterIds[playIndex % selectedChallenge.rosterIds.length];
  const cpuCard =
    NBA_PLAYER_CARDS.find((c) => c.id === cpuCardId) || NBA_PLAYER_CARDS[0];

  const advanceAfterReveal = () => {
    if (!revealedPlayResult) return;
    if (revealedPlayResult.isLastPlay) {
      setRevealedPlayResult(null);
      setGameFinished(true);
    } else {
      setRevealedPlayResult(null);
      setPlayIndex((p) => p + 1);
    }
  };

  const executePlay = () => {
    if (revealedPlayResult) {
      advanceAfterReveal();
      return;
    }
    const userCard = lineupCards[selectedSlot];
    const evo = ownedMap[userCard.id]?.evoBonus ?? 0;
    const currentStamina = staminaBySlot[selectedSlot];

    // Stamina modifier: 100% stamina = 1.0x, <60% stamina scales down slightly
    const staminaFactor = currentStamina >= 65 ? 1.0 : 0.86 + (currentStamina / 100) * 0.14;

    const uPrimary = Math.min(99, userCard.stats[currentScenario.primaryStat] + evo);
    const uSecondary = Math.min(99, userCard.stats[currentScenario.secondaryStat] + evo);

    const cPrimary = cpuCard.stats[currentScenario.primaryStat];
    const cSecondary = cpuCard.stats[currentScenario.secondaryStat];

    // Tactical modifier
    let tacticBonus = 0;
    if (tactic === 'BALANCED') {
      tacticBonus = 2.5;
    } else if (tactic === 'AGGRESSIVE') {
      tacticBonus = Math.random() > 0.42 ? 5.5 : -2.0;
    } else if (tactic === 'CLUTCH_FOCUS') {
      tacticBonus = currentScenario.isClutch ? 5.0 : 1.5;
    }

    const userPower = Math.round(
      (uPrimary * 0.62 + uSecondary * 0.38) * staminaFactor +
        tacticBonus +
        (Math.random() * 6 - 3)
    );
    const cpuPower = Math.round(
      cPrimary * 0.62 + cSecondary * 0.38 + (Math.random() * 6 - 3)
    );

    const wonPlay = userPower >= cpuPower;
    const margin = Math.abs(userPower - cpuPower);

    const userPointsAdded = wonPlay
      ? margin >= 8
        ? 16
        : margin >= 4
        ? 14
        : 12
      : margin >= 7
      ? 9
      : 10;
    const cpuPointsAdded = wonPlay
      ? margin >= 7
        ? 9
        : 10
      : margin >= 8
      ? 16
      : margin >= 4
      ? 14
      : 12;

    let finalUserScore = userScore + userPointsAdded;
    let finalCpuScore = cpuScore + cpuPointsAdded;

    const isLastPlay = playIndex + 1 >= PLAY_SCENARIOS.length;

    // Prevent exact tie on Play 8 (Overtime sudden-death edge to Play 8 winner)
    if (isLastPlay && finalUserScore === finalCpuScore) {
      if (wonPlay) finalUserScore += 2;
      else finalCpuScore += 2;
    }

    // Update Box Score for user cards
    const updatedBox = { ...boxScore };
    const prevStats = updatedBox[userCard.id] || {
      pts: 0,
      reb: 0,
      ast: 0,
      clutchWon: 0,
      clutchTotal: 0,
    };
    updatedBox[userCard.id] = {
      pts: prevStats.pts + (wonPlay ? Math.min(12, userPointsAdded - 2) : 6),
      reb: prevStats.reb + (currentScenario.primaryStat === 'def' ? 4 : 2),
      ast: prevStats.ast + (currentScenario.primaryStat === 'play' ? 4 : 1),
      clutchWon: prevStats.clutchWon + (currentScenario.isClutch && wonPlay ? 1 : 0),
      clutchTotal: prevStats.clutchTotal + (currentScenario.isClutch ? 1 : 0),
    };
    setBoxScore(updatedBox);

    // Update Stamina & Cooldown
    const nextStamina = { ...staminaBySlot };
    slotsOrder.forEach((slot) => {
      if (slot === selectedSlot) {
        nextStamina[slot] = Math.max(20, nextStamina[slot] - 35);
      } else {
        nextStamina[slot] = Math.min(100, nextStamina[slot] + 15);
      }
    });
    setStaminaBySlot(nextStamina);
    setCooldownSlot(selectedSlot);

    // Auto-select a non-cooldown slot for next turn
    const nextAvailable =
      slotsOrder.find((s) => s !== selectedSlot) || 'PG';
    setSelectedSlot(nextAvailable);

    const narrative = wonPlay
      ? `${userCard.firstName} ${userCard.lastName} (#${userCard.jerseyNumber}) overpowers ${cpuCard.lastName} (${userPower} vs ${cpuPower}) for a +${userPointsAdded}–${cpuPointsAdded} quarter swing!`
      : `${cpuCard.firstName} ${cpuCard.lastName} (#${cpuCard.jerseyNumber}) edges out ${userCard.lastName} (${cpuPower} vs ${userPower}) for a ${cpuPointsAdded}–${userPointsAdded} CPU run.`;

    setPlayLogs((prev) => [
      {
        playNumber: currentScenario.playNumber,
        clock: currentScenario.clock,
        userCardName: `${userCard.firstName} ${userCard.lastName}`,
        cpuCardName: `${cpuCard.firstName} ${cpuCard.lastName}`,
        userRoll: userPower,
        cpuRoll: cpuPower,
        userPointsAdded,
        cpuPointsAdded,
        wonPlay,
        narrative,
      },
      ...prev,
    ]);

    setUserScore(finalUserScore);
    setCpuScore(finalCpuScore);

    // Reveal the CPU card and play outcome!
    setRevealedPlayResult({
      userCard,
      userSlot: selectedSlot,
      userStaminaAtPlay: currentStamina,
      cpuCard,
      wonPlay,
      userPower,
      cpuPower,
      userPointsAdded,
      cpuPointsAdded,
      narrative,
      isLastPlay,
    });

    if (isLastPlay) {
      const userWonGame = finalUserScore > finalCpuScore;
      const earned = userWonGame
        ? selectedChallenge.winCoins
        : selectedChallenge.lossCoins;
      if (userWonGame) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
      onCompleteGame({
        won: userWonGame,
        userScore: finalUserScore,
        cpuScore: finalCpuScore,
        cpuTeamName: selectedChallenge.name,
        coinsEarned: earned,
        playerStats: updatedBox,
      });
    }
  };

  if (!inProgress) {
    return (
      <div className="space-y-6">
        {/* Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-extrabold uppercase mb-2">
              <Swords className="w-3.5 h-3.5" /> Clean Tactical Card Showdowns
            </div>
            <h2 className="font-sport font-extrabold text-2xl sm:text-3xl text-white">
              CHOOSE YOUR CPU SHOWDOWN CHALLENGE
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Deploy cards from your 6-man rotation across 4 quarters (8 key plays). Playing a card drains <strong>35% Stamina</strong> and puts it on a <strong>1-play rest cooldown</strong>—so use your bench wisely and save your 99 OVR Primetime star for the 4th quarter!
            </p>
          </div>
        </div>

        {/* CPU Opponent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CPU_CHALLENGES.map((chal) => {
            const bossCards = chal.rosterIds
              .slice(0, 3)
              .map((id) => NBA_PLAYER_CARDS.find((c) => c.id === id)!)
              .filter(Boolean);
            return (
              <div
                key={chal.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-600 transition flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className="px-2.5 py-1 rounded text-xs font-extrabold text-white"
                      style={{ backgroundColor: chal.primaryColor }}
                    >
                      {chal.abbr}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-extrabold text-amber-400 bg-amber-950/70 border border-amber-500/30 px-2.5 py-1 rounded-full">
                      <Coins className="w-3.5 h-3.5" /> Win: +{chal.winCoins} Coins (Loss: +{chal.lossCoins})
                    </span>
                  </div>
                  <h3 className="font-sport font-extrabold text-xl text-white">
                    {chal.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{chal.subtitle}</p>

                  {/* Featured CPU Star Pills */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {bossCards.map((bc) => (
                      <button
                        key={bc.id}
                        onClick={() => onInspectCard(bc)}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
                      >
                        <span className="font-bold text-amber-400">{bc.ovr}</span>
                        <span>
                          {bc.firstName} {bc.lastName}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => startNewShowdown(chal)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-sport font-extrabold text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15 transition"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Tip Off vs. {chal.name}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Broadcast Scoreboard Header */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="grid grid-cols-3 items-center gap-4">
          {/* User Team */}
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-sport font-extrabold text-lg text-white shadow-inner border border-white/20"
              style={{ backgroundColor: franchiseTeam.primaryColor }}
            >
              {franchiseTeam.abbreviation}
            </div>
            <div>
              <div className="text-xs font-bold uppercase text-slate-400">YOUR FRANCHISE</div>
              <div className="font-sport font-extrabold text-lg sm:text-xl text-white">
                {franchiseTeam.city} {franchiseTeam.name}
              </div>
            </div>
          </div>

          {/* Center Score & Quarter Clock */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-extrabold text-amber-400 mb-1">
              {gameFinished
                ? 'FINAL BUZZER'
                : `${currentScenario.clock} • PLAY ${playIndex + 1} OF ${
                    PLAY_SCENARIOS.length
                  }`}
            </div>
            <div className="font-display font-bold text-4xl sm:text-5xl tracking-wider text-white">
              {userScore} <span className="text-slate-600">—</span> {cpuScore}
            </div>
          </div>

          {/* CPU Team */}
          <div className="flex items-center justify-end gap-3 text-right">
            <div>
              <div className="text-xs font-bold uppercase text-slate-400">CPU OPPONENT</div>
              <div className="font-sport font-extrabold text-lg sm:text-xl text-white">
                {selectedChallenge.name}
              </div>
            </div>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-sport font-extrabold text-lg text-white shadow-inner border border-white/20"
              style={{ backgroundColor: selectedChallenge.primaryColor }}
            >
              {selectedChallenge.abbr}
            </div>
          </div>
        </div>
      </div>

      {/* Active Play Resolution OR Final Post-Game Summary */}
      {!gameFinished ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 7 Cols: Scenario + Your 6-Man Rotation Selector */}
          <div className="lg:col-span-7 space-y-4">
            {/* Play Scenario Broadcast Box */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-amber-400 text-slate-950 font-extrabold text-xs uppercase">
                    {currentScenario.clock}
                  </span>
                  {currentScenario.isClutch && (
                    <span className="px-2.5 py-0.5 rounded bg-rose-500 text-white font-extrabold text-xs uppercase animate-pulse">
                      4TH QUARTER CLUTCH BONUS
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span className="text-slate-400">Key Stats Tested:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                    62% {STAT_NAMES[currentScenario.primaryStat]}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                    38% {STAT_NAMES[currentScenario.secondaryStat]}
                  </span>
                </div>
              </div>

              <h3 className="font-sport font-extrabold text-xl text-white">
                {currentScenario.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1">{currentScenario.description}</p>

              {/* Tactical Coaching Call */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase text-slate-400">
                  Play Call Modifier:
                </span>
                <div className="flex gap-2">
                  {(
                    [
                      { id: 'BALANCED', label: 'Balanced Set (+Steady)' },
                      { id: 'AGGRESSIVE', label: 'High-Tempo Gamble (High Ceiling)' },
                      { id: 'CLUTCH_FOCUS', label: 'Iso / Lockdown Focus (+Clutch)' },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTactic(t.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                        tactic === t.id
                          ? 'bg-amber-400 text-slate-950 border-amber-300'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 6-Man Rotation Picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Select Card from Your 6-Man Rotation (Click Card to Deploy)
                </h4>
                <span className="text-[11px] text-slate-400">
                  Resting cards recover <strong className="text-emerald-400">+15% Stamina</strong> per play
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 justify-items-center">
                {slotsOrder.map((slot) => {
                  const card = lineupCards[slot];
                  const isCooling = cooldownSlot === slot;
                  const isChosen = selectedSlot === slot;
                  const evo = ownedMap[card.id]?.evoBonus ?? 0;

                  return (
                    <div key={slot} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        {slot === 'SIXTH' ? '6TH MAN' : `STARTER ${slot}`}
                      </span>
                      <PlayerCard
                        card={card}
                        evoBonus={evo}
                        stamina={staminaBySlot[slot]}
                        onCooldown={isCooling}
                        selected={isChosen}
                        useFranchiseJersey={useFranchiseJersey}
                        franchiseTeam={franchiseTeam}
                        size="sm"
                        actionBadge={isChosen ? 'DEPLOYING' : undefined}
                        onClick={() => {
                          if (revealedPlayResult) {
                            // If a play result was showing, clicking a rotation card advances to the next play & selects that card!
                            if (!revealedPlayResult.isLastPlay && !isCooling) {
                              setRevealedPlayResult(null);
                              setPlayIndex((p) => p + 1);
                              setSelectedSlot(slot);
                            }
                            return;
                          }
                          if (!isCooling) {
                            setSelectedSlot(slot);
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Head-to-Head Matchup Preview & Play-by-Play Ticker */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center">
              <div className="text-xs font-extrabold uppercase tracking-wider text-amber-400 mb-3">
                {revealedPlayResult
                  ? `PLAY #${currentScenario.playNumber} REVEALED RESULT`
                  : `HEAD-TO-HEAD PLAY #${currentScenario.playNumber} MATCHUP`}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase mb-1">
                    YOUR DEPLOYED CARD
                  </span>
                  <PlayerCard
                    card={
                      revealedPlayResult
                        ? revealedPlayResult.userCard
                        : lineupCards[selectedSlot]
                    }
                    evoBonus={
                      ownedMap[
                        (revealedPlayResult
                          ? revealedPlayResult.userCard
                          : lineupCards[selectedSlot]
                        ).id
                      ]?.evoBonus ?? 0
                    }
                    stamina={
                      revealedPlayResult
                        ? revealedPlayResult.userStaminaAtPlay
                        : staminaBySlot[selectedSlot]
                    }
                    useFranchiseJersey={useFranchiseJersey}
                    franchiseTeam={franchiseTeam}
                    size="sm"
                    onClick={() =>
                      onInspectCard(
                        revealedPlayResult
                          ? revealedPlayResult.userCard
                          : lineupCards[selectedSlot]
                      )
                    }
                  />
                </div>

                <div className="font-sport font-extrabold text-2xl text-amber-400 px-2">
                  VS
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-rose-400 uppercase mb-1">
                    {revealedPlayResult ? 'CPU REVEALED CARD' : 'CPU MYSTERY CARD'}
                  </span>
                  {revealedPlayResult ? (
                    <PlayerCard
                      card={revealedPlayResult.cpuCard}
                      size="sm"
                      onClick={() => onInspectCard(revealedPlayResult.cpuCard)}
                    />
                  ) : (
                    /* Mystery Face-Down CPU Card Until "Run Play" Is Clicked */
                    <div
                      className="w-48 h-[276px] rounded-2xl p-[2px] shadow-xl select-none flex flex-col"
                      style={{
                        background: `linear-gradient(135deg, ${selectedChallenge.primaryColor}, #1e293b, ${selectedChallenge.primaryColor})`,
                      }}
                    >
                      <div className="w-full h-full rounded-[14px] bg-slate-950 flex flex-col items-center justify-between p-4 relative overflow-hidden">
                        <div className="shimmer-sweep absolute inset-0 opacity-40 pointer-events-none" />
                        <div className="w-full flex items-center justify-between text-[10px] font-extrabold text-slate-400 border-b border-slate-800 pb-1.5">
                          <span>POS: ???</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-rose-400">
                            ??? OVR
                          </span>
                        </div>

                        <div className="my-auto flex flex-col items-center text-center z-10">
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center font-sport font-extrabold text-xl text-white shadow-lg border border-white/20 mb-3"
                            style={{ backgroundColor: selectedChallenge.primaryColor }}
                          >
                            {selectedChallenge.abbr}
                          </div>
                          <div className="font-sport font-extrabold text-base text-white tracking-wider uppercase">
                            CPU CARD HIDDEN
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                            Hit <strong>Run Play</strong> below to lock in your card and reveal the CPU matchup!
                          </p>
                        </div>

                        <div className="w-full pt-2 border-t border-slate-800 text-center text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                          MYSTERY DEPLOYMENT
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Outcome Banner Once CPU Card Is Revealed */}
              {revealedPlayResult && (
                <div
                  className={`w-full mt-4 p-3 rounded-xl border text-center ${
                    revealedPlayResult.wonPlay
                      ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/50 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div className="font-sport font-extrabold text-base uppercase">
                    {revealedPlayResult.wonPlay ? 'PLAY WON!' : 'CPU WON PLAY'} • +
                    {revealedPlayResult.userPointsAdded} to +
                    {revealedPlayResult.cpuPointsAdded} PTS (Score:{' '}
                    {revealedPlayResult.userPower} vs {revealedPlayResult.cpuPower})
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {revealedPlayResult.narrative}
                  </p>
                </div>
              )}

              <button
                onClick={executePlay}
                className={`w-full mt-5 py-3.5 rounded-xl font-sport font-extrabold text-lg uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition ${
                  revealedPlayResult
                    ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 shadow-amber-500/20'
                    : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 hover:brightness-110 text-slate-950 shadow-emerald-500/20'
                }`}
              >
                <Zap className="w-5 h-5 fill-current" />
                {revealedPlayResult
                  ? revealedPlayResult.isLastPlay
                    ? 'View Final Buzzer & Box Score →'
                    : `Continue to Play #${currentScenario.playNumber + 1} of ${
                        PLAY_SCENARIOS.length
                      } →`
                  : `Run Play #${currentScenario.playNumber}: Deploy ${lineupCards[selectedSlot].lastName} vs. Mystery CPU`}
              </button>
            </div>

            {/* Live Play-by-Play Ticker */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Live Broadcast Play-by-Play Log
              </div>
              {playLogs.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  Select a card and click "Run Play #1" to tip off the game!
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {playLogs.map((log) => (
                    <div
                      key={log.playNumber}
                      className={`p-2.5 rounded-xl border text-xs ${
                        log.wonPlay
                          ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-100'
                          : 'bg-rose-950/30 border-rose-500/30 text-rose-100'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold mb-0.5">
                        <span>
                          {log.clock} • {log.wonPlay ? 'PLAY WON' : 'CPU WON PLAY'}
                        </span>
                        <span>
                          +{log.userPointsAdded} – +{log.cpuPointsAdded} PTS
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">{log.narrative}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Post-Game Box Score & Rewards Summary */
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase mb-2 ${
                  userScore > cpuScore
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {userScore > cpuScore ? 'VICTORY!' : 'HARD-FOUGHT LOSS'}
              </span>
              <h3 className="font-sport font-extrabold text-3xl text-white">
                {franchiseTeam.city} {franchiseTeam.name} {userScore} — {cpuScore}{' '}
                {selectedChallenge.name}
              </h3>
              <p className="text-sm text-slate-300">
                All player box scores and team records have been saved to the League Leaderboards!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-sport font-extrabold text-lg flex items-center gap-2">
                <Coins className="w-5 h-5" />+
                {userScore > cpuScore
                  ? selectedChallenge.winCoins
                  : selectedChallenge.lossCoins}{' '}
                COINS EARNED
              </div>
              <button
                onClick={() => setInProgress(false)}
                className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-sport font-extrabold text-base uppercase flex items-center gap-2 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Play Another Matchup
              </button>
            </div>
          </div>

          {/* Official Player Box Score Table */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
              Official Game Box Score (Click Any Player to View Full Card Showcase)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase">
                    <th className="py-2 px-3">Slot</th>
                    <th className="py-2 px-3">Player Card</th>
                    <th className="py-2 px-3">Edition</th>
                    <th className="py-2 px-3 text-right">PTS</th>
                    <th className="py-2 px-3 text-right">REB</th>
                    <th className="py-2 px-3 text-right">AST</th>
                    <th className="py-2 px-3 text-right">CLUTCH WON</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {slotsOrder.map((slot) => {
                    const c = lineupCards[slot];
                    const st = boxScore[c.id] || {
                      pts: 0,
                      reb: 0,
                      ast: 0,
                      clutchWon: 0,
                      clutchTotal: 0,
                    };
                    return (
                      <tr
                        key={slot}
                        onClick={() => onInspectCard(c)}
                        className="hover:bg-slate-800/60 cursor-pointer transition"
                      >
                        <td className="py-2.5 px-3 font-bold text-slate-400">
                          {slot === 'SIXTH' ? '6TH' : slot}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-white">
                          {c.firstName} {c.lastName}{' '}
                          <span className="text-amber-400">#{c.jerseyNumber}</span>
                        </td>
                        <td className="py-2.5 px-3 text-xs text-slate-300">
                          {c.editionTitle} ({c.ovr} OVR)
                        </td>
                        <td className="py-2.5 px-3 text-right font-sport font-bold text-white">
                          {st.pts}
                        </td>
                        <td className="py-2.5 px-3 text-right font-sport font-bold text-emerald-400">
                          {st.reb}
                        </td>
                        <td className="py-2.5 px-3 text-right font-sport font-bold text-sky-400">
                          {st.ast}
                        </td>
                        <td className="py-2.5 px-3 text-right font-sport font-bold text-amber-400">
                          {st.clutchWon}/{st.clutchTotal}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
