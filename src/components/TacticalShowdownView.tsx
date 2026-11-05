import React, { useState } from 'react';
import {
  CardTier,
  LeagueTeamStanding,
  LineupSlot,
  OwnedCard,
  PlayerCardTemplate,
  TeamIdentity,
} from '../types/game';
import { NBA_PLAYER_CARDS } from '../data/nbaData';
import { PlayerCard } from './PlayerCard';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  Coins,
  Crown,
  Gift,
  Play,
  RotateCcw,
  Shield,
  Swords,
  Trophy,
  Zap,
} from 'lucide-react';

export interface CpuTeamOpponent {
  id: string;
  city: string;
  name: string;
  abbr: string;
  primaryColor: string;
  secondaryColor: string;
  winCoins: number;
  lossCoins: number;
  rosterIds: string[];
}

export const CPU_LEAGUE_TEAMS: CpuTeamOpponent[] = [
  {
    id: 'atl-hawks',
    city: 'Atlanta',
    name: 'Hawks',
    abbr: 'ATL',
    primaryColor: '#E03A3E',
    secondaryColor: '#C1D32F',
    winCoins: 800,
    lossCoins: 250,
    rosterIds: [
      'trae-legends-95',
      'nique-legends-96',
      'jalen-johnson-base-83',
      'trae-base-84',
      'jjj-base-84',
      'naz-base-81',
    ],
  },
  {
    id: 'chi-bulls',
    city: 'Chicago',
    name: 'Bulls',
    abbr: 'CHI',
    primaryColor: '#CE1141',
    secondaryColor: '#111827',
    winCoins: 1500,
    lossCoins: 400,
    rosterIds: [
      'mj-primetime-99',
      'mj-legends-97',
      'pippen-allstar-91',
      'rodman-allstar-88',
      'mj-base-84',
      'white-base-83',
    ],
  },
  {
    id: 'lal-lakers',
    city: 'Los Angeles',
    name: 'Lakers',
    abbr: 'LAL',
    primaryColor: '#FDB927',
    secondaryColor: '#552583',
    winCoins: 1600,
    lossCoins: 450,
    rosterIds: [
      'kobe-primetime-98',
      'shaq-primetime-99',
      'magic-legends-97',
      'lebron-primetime-99',
      'kobe-legends-97',
      'shaq-allstar-90',
    ],
  },
  {
    id: 'bos-celtics',
    city: 'Boston',
    name: 'Celtics',
    abbr: 'BOS',
    primaryColor: '#007A33',
    secondaryColor: '#BA9653',
    winCoins: 1200,
    lossCoins: 350,
    rosterIds: [
      'bird-legends-97',
      'tatum-allstar-91',
      'white-base-83',
      'sga-elite-93',
      'jjj-base-84',
      'haliburton-base-84',
    ],
  },
  {
    id: 'gsw-warriors',
    city: 'Golden State',
    name: 'Warriors',
    abbr: 'GSW',
    primaryColor: '#1D428A',
    secondaryColor: '#FFC72C',
    winCoins: 1400,
    lossCoins: 400,
    rosterIds: [
      'curry-primetime-99',
      'curry-legends-96',
      'kd-elite-94',
      'curry-elite-93',
      'bam-allstar-88',
      'naz-base-81',
    ],
  },
  {
    id: 'mia-heat',
    city: 'Miami',
    name: 'Heat',
    abbr: 'MIA',
    primaryColor: '#98002E',
    secondaryColor: '#F9A01B',
    winCoins: 1100,
    lossCoins: 300,
    rosterIds: [
      'lebron-legends-97',
      'bam-allstar-88',
      'giannis-elite-94',
      'brunson-allstar-89',
      'ant-allstar-90',
      'white-base-83',
    ],
  },
  {
    id: 'sas-spurs',
    city: 'San Antonio',
    name: 'Spurs',
    abbr: 'SAS',
    primaryColor: '#111827',
    secondaryColor: '#00B2A9',
    winCoins: 1250,
    lossCoins: 350,
    rosterIds: [
      'duncan-legends-97',
      'wemby-elite-93',
      'jokic-primetime-98',
      'luka-elite-94',
      'jjj-base-84',
      'haliburton-base-84',
    ],
  },
  {
    id: 'phx-suns',
    city: 'Phoenix',
    name: 'Suns',
    abbr: 'PHX',
    primaryColor: '#E56020',
    secondaryColor: '#1D1160',
    winCoins: 1300,
    lossCoins: 350,
    rosterIds: [
      'kd-elite-94',
      'fict-blaze-primetime-99',
      'fict-dante-primetime-98',
      'fict-atlas-primetime-99',
      'fict-zephyr-legends-96',
      'fict-orion-elite-94',
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

// Higher-tier cards have longer cooldowns & higher stamina drain!
export function getCardCooldownAndDrain(tier: CardTier, effectiveOvr: number): {
  cooldownPlays: number;
  staminaDrain: number;
  label: string;
} {
  if (tier === 'PRIMETIME' || effectiveOvr >= 98) {
    return { cooldownPlays: 3, staminaDrain: 50, label: '3-Play Rest' };
  }
  if (tier === 'LEGENDS' || effectiveOvr >= 95) {
    return { cooldownPlays: 2, staminaDrain: 40, label: '2-Play Rest' };
  }
  if (tier === 'ELITE' || tier === 'ALL_STAR' || effectiveOvr >= 85) {
    return { cooldownPlays: 1, staminaDrain: 30, label: '1-Play Rest' };
  }
  return { cooldownPlays: 0, staminaDrain: 18, label: '0 Rest (No Cooldown!)' };
}

interface BracketMatch {
  id: string;
  round: 'QF' | 'SF' | 'FINALS';
  teamA: { id: string; city: string; name: string; abbr: string; color: string; isUser: boolean; ovr: number };
  teamB: { id: string; city: string; name: string; abbr: string; color: string; isUser: boolean; ovr: number };
  scoreA?: number;
  scoreB?: number;
  winnerId?: string;
}

interface TacticalShowdownViewProps {
  lineupCards: Record<LineupSlot, PlayerCardTemplate>;
  ownedMap: Record<string, OwnedCard>;
  franchiseTeam: TeamIdentity;
  standings: LeagueTeamStanding[];
  useFranchiseJersey: boolean;
  onInspectCard: (card: PlayerCardTemplate) => void;
  onJumpToLeaderboard: () => void;
  onCompleteGame: (result: {
    won: boolean;
    userScore: number;
    cpuScore: number;
    cpuTeamId: string;
    cpuTeamName: string;
    coinsEarned: number;
    bonusChampionship?: boolean;
    bonusCardAwarded?: PlayerCardTemplate;
    otherCpuResults?: {
      winnerId: string;
      loserId: string;
      winnerPts: number;
      loserPts: number;
    }[];
    playerStats: Record<
      string,
      {
        played: boolean;
        pts: number;
        reb: number;
        ast: number;
        clutchWon: number;
        clutchTotal: number;
      }
    >;
  }) => void;
}

export const TacticalShowdownView: React.FC<TacticalShowdownViewProps> = ({
  lineupCards,
  ownedMap,
  franchiseTeam,
  standings,
  useFranchiseJersey,
  onInspectCard,
  onJumpToLeaderboard,
  onCompleteGame,
}) => {
  const [modeTab, setModeTab] = useState<'SET_SERIES' | 'BRACKET'>('SET_SERIES');

  // Set Series Configuration (1-Game, Best-of-3, Best-of-5)
  const [seriesLength, setSeriesLength] = useState<1 | 3 | 5>(3);
  const [activeSeries, setActiveSeries] = useState<{
    opponent: CpuTeamOpponent;
    targetWins: number;
    userSeriesWins: number;
    cpuSeriesWins: number;
    gameNumber: number;
    seriesFinished: boolean;
  } | null>(null);

  // 8-Team Playoff Bracket State
  const [bracketRound, setBracketRound] = useState<'QF' | 'SF' | 'FINALS' | 'CHAMPION'>('QF');
  const [qfMatches, setQfMatches] = useState<BracketMatch[]>([]);
  const [sfMatches, setSfMatches] = useState<BracketMatch[]>([]);
  const [finalsMatch, setFinalsMatch] = useState<BracketMatch | null>(null);
  const [bracketChampion, setBracketChampion] = useState<string | null>(null);

  // Active Game State
  const [selectedOpponent, setSelectedOpponent] = useState<CpuTeamOpponent>(
    CPU_LEAGUE_TEAMS[0]
  );
  const [inProgress, setInProgress] = useState(false);
  const [isBracketGame, setIsBracketGame] = useState(false);
  const [playIndex, setPlayIndex] = useState(0);
  const [userScore, setUserScore] = useState(0);
  const [cpuScore, setCpuScore] = useState(0);
  const [cpuPlayOrder, setCpuPlayOrder] = useState<string[]>([]);

  // Stamina (0-100) and Multi-Turn Cooldowns (0, 1, 2, or 3 plays remaining)
  const [staminaBySlot, setStaminaBySlot] = useState<Record<LineupSlot, number>>({
    PG: 100,
    SG: 100,
    SF: 100,
    PF: 100,
    C: 100,
    SIXTH: 100,
  });
  const [cooldownsBySlot, setCooldownsBySlot] = useState<Record<LineupSlot, number>>({
    PG: 0,
    SG: 0,
    SF: 0,
    PF: 0,
    C: 0,
    SIXTH: 0,
  });

  const [selectedSlot, setSelectedSlot] = useState<LineupSlot>('PG');
  const [tactic, setTactic] = useState<'BALANCED' | 'AGGRESSIVE' | 'CLUTCH_FOCUS'>(
    'BALANCED'
  );

  // Per-game player box score stats
  const [boxScore, setBoxScore] = useState<
    Record<
      string,
      {
        played: boolean;
        pts: number;
        reb: number;
        ast: number;
        clutchWon: number;
        clutchTotal: number;
      }
    >
  >({});

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
    cooldownApplied: number;
  } | null>(null);

  const [lastRewardSummary, setLastRewardSummary] = useState<{
    coinsEarned: number;
    wonGame: boolean;
    bonusNote?: string;
    bonusCard?: PlayerCardTemplate;
  } | null>(null);

  const [gameFinished, setGameFinished] = useState(false);

  const slotsOrder: LineupSlot[] = ['PG', 'SG', 'SF', 'PF', 'C', 'SIXTH'];

  const getTeamOvrFromRoster = (rosterIds: string[]) => {
    const cards = rosterIds
      .map((id) => NBA_PLAYER_CARDS.find((c) => c.id === id))
      .filter(Boolean) as PlayerCardTemplate[];
    if (cards.length === 0) return 85;
    return Math.round(cards.reduce((a, b) => a + b.ovr, 0) / cards.length);
  };

  // Initialize or Reset 8-Team Playoff Bracket
  const initBracket = () => {
    const userEntry = {
      id: franchiseTeam.id,
      city: franchiseTeam.city,
      name: franchiseTeam.name,
      abbr: franchiseTeam.abbreviation,
      color: franchiseTeam.primaryColor,
      isUser: true,
      ovr: 92,
    };

    const cpuPool = CPU_LEAGUE_TEAMS.filter((t) => t.id !== franchiseTeam.id).slice(0, 7);
    const participants = [
      userEntry,
      ...cpuPool.map((c) => ({
        id: c.id,
        city: c.city,
        name: c.name,
        abbr: c.abbr,
        color: c.primaryColor,
        isUser: false,
        ovr: getTeamOvrFromRoster(c.rosterIds),
      })),
    ];

    const qf: BracketMatch[] = [
      { id: 'qf-1', round: 'QF', teamA: participants[0], teamB: participants[7] },
      { id: 'qf-2', round: 'QF', teamA: participants[3], teamB: participants[4] },
      { id: 'qf-3', round: 'QF', teamA: participants[1], teamB: participants[6] },
      { id: 'qf-4', round: 'QF', teamA: participants[2], teamB: participants[5] },
    ];

    setQfMatches(qf);
    setSfMatches([]);
    setFinalsMatch(null);
    setBracketChampion(null);
    setBracketRound('QF');
  };

  // Ensure bracket is initialized the first time user opens Bracket tab
  React.useEffect(() => {
    if (qfMatches.length === 0) {
      initBracket();
    }
  }, []);

  const launchMatchupGame = (opponent: CpuTeamOpponent, fromBracket: boolean) => {
    setSelectedOpponent(opponent);
    setIsBracketGame(fromBracket);
    setInProgress(true);
    setGameFinished(false);
    setRevealedPlayResult(null);
    setLastRewardSummary(null);
    setPlayIndex(0);
    setUserScore(0);
    setCpuScore(0);

    const pool = [...opponent.rosterIds, ...opponent.rosterIds];
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
    setCooldownsBySlot({
      PG: 0,
      SG: 0,
      SF: 0,
      PF: 0,
      C: 0,
      SIXTH: 0,
    });
    setSelectedSlot('PG');
    setPlayLogs([]);

    const initialBox: Record<
      string,
      {
        played: boolean;
        pts: number;
        reb: number;
        ast: number;
        clutchWon: number;
        clutchTotal: number;
      }
    > = {};
    slotsOrder.forEach((slot) => {
      const c = lineupCards[slot];
      initialBox[c.id] = {
        played: false,
        pts: 0,
        reb: 0,
        ast: 0,
        clutchWon: 0,
        clutchTotal: 0,
      };
    });
    setBoxScore(initialBox);
  };

  const startSetSeries = (opponent: CpuTeamOpponent, length: 1 | 3 | 5) => {
    const targetWins = length === 1 ? 1 : length === 3 ? 2 : 3;
    setActiveSeries({
      opponent,
      targetWins,
      userSeriesWins: 0,
      cpuSeriesWins: 0,
      gameNumber: 1,
      seriesFinished: false,
    });
    launchMatchupGame(opponent, false);
  };

  const currentScenario = PLAY_SCENARIOS[playIndex];
  const cpuCardId =
    cpuPlayOrder[playIndex] ||
    selectedOpponent.rosterIds[playIndex % selectedOpponent.rosterIds.length];
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

  const finishAndRewardGame = (
    finalUserScore: number,
    finalCpuScore: number,
    updatedBox: typeof boxScore
  ) => {
    const userWonGame = finalUserScore > finalCpuScore;
    let earnedCoins = userWonGame
      ? selectedOpponent.winCoins
      : selectedOpponent.lossCoins;
    let bonusNote: string | undefined;
    let bonusCard: PlayerCardTemplate | undefined;
    let bonusChampionship = false;
    const otherCpuResults: {
      winnerId: string;
      loserId: string;
      winnerPts: number;
      loserPts: number;
    }[] = [];

    // 1. Handle Set Series progression & Series Bonus Reward
    if (!isBracketGame && activeSeries) {
      const nextUWins = activeSeries.userSeriesWins + (userWonGame ? 1 : 0);
      const nextCWins = activeSeries.cpuSeriesWins + (userWonGame ? 0 : 1);
      const seriesDone =
        nextUWins >= activeSeries.targetWins || nextCWins >= activeSeries.targetWins;

      if (seriesDone && nextUWins > nextCWins) {
        const seriesBonus = activeSeries.targetWins * 900;
        earnedCoins += seriesBonus;
        bonusChampionship = activeSeries.targetWins >= 2;
        // Award a bonus Legends or Primetime card for winning a multi-game series!
        const highTierPool = NBA_PLAYER_CARDS.filter(
          (c) => c.tier === 'LEGENDS' || c.tier === 'PRIMETIME'
        );
        bonusCard = highTierPool[Math.floor(Math.random() * highTierPool.length)];
        bonusNote = `SERIES CLINCHED (${nextUWins}–${nextCWins})! +${seriesBonus} Series Bonus Coins + Free ${bonusCard.editionTitle} ${bonusCard.lastName} (${bonusCard.ovr} OVR)!`;
      } else if (seriesDone) {
        bonusNote = `Series Finished (${nextUWins}–${nextCWins}).`;
      }

      setActiveSeries({
        ...activeSeries,
        userSeriesWins: nextUWins,
        cpuSeriesWins: nextCWins,
        gameNumber: activeSeries.gameNumber + 1,
        seriesFinished: seriesDone,
      });
    }

    // 2. Handle 8-Team Bracket progression & simulate other bracket games
    if (isBracketGame) {
      if (bracketRound === 'QF') {
        const resolvedQf = qfMatches.map((m) => {
          if (m.teamA.isUser || m.teamB.isUser) {
            const uIsA = m.teamA.isUser;
            return {
              ...m,
              scoreA: uIsA ? finalUserScore : finalCpuScore,
              scoreB: uIsA ? finalCpuScore : finalUserScore,
              winnerId: userWonGame
                ? uIsA
                  ? m.teamA.id
                  : m.teamB.id
                : uIsA
                ? m.teamB.id
                : m.teamA.id,
            };
          }
          const aWins = m.teamA.ovr + Math.random() * 8 >= m.teamB.ovr + Math.random() * 8;
          const sA = aWins ? 108 + Math.floor(Math.random() * 12) : 96 + Math.floor(Math.random() * 10);
          const sB = aWins ? 95 + Math.floor(Math.random() * 10) : 109 + Math.floor(Math.random() * 12);
          otherCpuResults.push({
            winnerId: aWins ? m.teamA.id : m.teamB.id,
            loserId: aWins ? m.teamB.id : m.teamA.id,
            winnerPts: Math.max(sA, sB),
            loserPts: Math.min(sA, sB),
          });
          return {
            ...m,
            scoreA: sA,
            scoreB: sB,
            winnerId: aWins ? m.teamA.id : m.teamB.id,
          };
        });
        setQfMatches(resolvedQf);

        const getWinnerTeam = (m: BracketMatch) =>
          m.winnerId === m.teamA.id ? m.teamA : m.teamB;

        const nextSf: BracketMatch[] = [
          {
            id: 'sf-1',
            round: 'SF',
            teamA: getWinnerTeam(resolvedQf[0]),
            teamB: getWinnerTeam(resolvedQf[1]),
          },
          {
            id: 'sf-2',
            round: 'SF',
            teamA: getWinnerTeam(resolvedQf[2]),
            teamB: getWinnerTeam(resolvedQf[3]),
          },
        ];
        setSfMatches(nextSf);
        if (userWonGame) {
          earnedCoins += 1000;
          bonusNote = 'QUARTERFINALS WON! Advanced to Semifinals (+1,000 Bracket Bonus Coins)!';
          setBracketRound('SF');
        } else {
          bonusNote = 'Eliminated in Quarterfinals. Click "Reset New Bracket" to run it back!';
        }
      } else if (bracketRound === 'SF') {
        const resolvedSf = sfMatches.map((m) => {
          if (m.teamA.isUser || m.teamB.isUser) {
            const uIsA = m.teamA.isUser;
            return {
              ...m,
              scoreA: uIsA ? finalUserScore : finalCpuScore,
              scoreB: uIsA ? finalCpuScore : finalUserScore,
              winnerId: userWonGame
                ? uIsA
                  ? m.teamA.id
                  : m.teamB.id
                : uIsA
                ? m.teamB.id
                : m.teamA.id,
            };
          }
          const aWins = m.teamA.ovr + Math.random() * 8 >= m.teamB.ovr + Math.random() * 8;
          const sA = aWins ? 112 : 99;
          const sB = aWins ? 98 : 114;
          otherCpuResults.push({
            winnerId: aWins ? m.teamA.id : m.teamB.id,
            loserId: aWins ? m.teamB.id : m.teamA.id,
            winnerPts: Math.max(sA, sB),
            loserPts: Math.min(sA, sB),
          });
          return {
            ...m,
            scoreA: sA,
            scoreB: sB,
            winnerId: aWins ? m.teamA.id : m.teamB.id,
          };
        });
        setSfMatches(resolvedSf);

        const getWinnerTeam = (m: BracketMatch) =>
          m.winnerId === m.teamA.id ? m.teamA : m.teamB;

        setFinalsMatch({
          id: 'finals-1',
          round: 'FINALS',
          teamA: getWinnerTeam(resolvedSf[0]),
          teamB: getWinnerTeam(resolvedSf[1]),
        });
        if (userWonGame) {
          earnedCoins += 2000;
          bonusNote = 'SEMIFINALS WON! Advanced to the Finals (+2,000 Bracket Bonus Coins)!';
          setBracketRound('FINALS');
        } else {
          bonusNote = 'Eliminated in Semifinals. Click "Reset New Bracket" to try again!';
        }
      } else if (bracketRound === 'FINALS' && finalsMatch) {
        const uIsA = finalsMatch.teamA.isUser;
        const updatedFinals: BracketMatch = {
          ...finalsMatch,
          scoreA: uIsA ? finalUserScore : finalCpuScore,
          scoreB: uIsA ? finalCpuScore : finalUserScore,
          winnerId: userWonGame
            ? uIsA
              ? finalsMatch.teamA.id
              : finalsMatch.teamB.id
            : uIsA
            ? finalsMatch.teamB.id
            : finalsMatch.teamA.id,
        };
        setFinalsMatch(updatedFinals);
        if (userWonGame) {
          earnedCoins += 5000;
          bonusChampionship = true;
          const primetimePool = NBA_PLAYER_CARDS.filter((c) => c.tier === 'PRIMETIME');
          bonusCard = primetimePool[Math.floor(Math.random() * primetimePool.length)];
          bonusNote = `BRACKET FINALS CHAMPION! +5,000 Jackpot Coins + Championship Ring + Free 99 Primetime ${bonusCard.firstName} ${bonusCard.lastName}!`;
          setBracketChampion(`${franchiseTeam.city} ${franchiseTeam.name}`);
          setBracketRound('CHAMPION');
        } else {
          bonusNote = 'Lost in the Finals! Reset the bracket to chase the trophy again.';
        }
      }
    }

    if (userWonGame) {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
      });
    }

    setLastRewardSummary({
      coinsEarned: earnedCoins,
      wonGame: userWonGame,
      bonusNote,
      bonusCard,
    });

    onCompleteGame({
      won: userWonGame,
      userScore: finalUserScore,
      cpuScore: finalCpuScore,
      cpuTeamId: selectedOpponent.id,
      cpuTeamName: `${selectedOpponent.city} ${selectedOpponent.name}`,
      coinsEarned: earnedCoins,
      bonusChampionship,
      bonusCardAwarded: bonusCard,
      otherCpuResults,
      playerStats: updatedBox,
    });
  };

  const executePlay = () => {
    if (revealedPlayResult) {
      advanceAfterReveal();
      return;
    }

    const userCard = lineupCards[selectedSlot];
    const evo = ownedMap[userCard.id]?.evoBonus ?? 0;
    const effectiveOvr = Math.min(99, userCard.ovr + evo);
    const currentStamina = staminaBySlot[selectedSlot];

    const { cooldownPlays, staminaDrain } = getCardCooldownAndDrain(
      userCard.tier,
      effectiveOvr
    );

    const staminaFactor =
      currentStamina >= 65 ? 1.0 : 0.85 + (currentStamina / 100) * 0.15;

    const uPrimary = Math.min(99, userCard.stats[currentScenario.primaryStat] + evo);
    const uSecondary = Math.min(99, userCard.stats[currentScenario.secondaryStat] + evo);

    const cPrimary = cpuCard.stats[currentScenario.primaryStat];
    const cSecondary = cpuCard.stats[currentScenario.secondaryStat];

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

    if (isLastPlay && finalUserScore === finalCpuScore) {
      if (wonPlay) finalUserScore += 2;
      else finalCpuScore += 2;
    }

    // Update Box Score (scaled so active players log realistic NBA star totals for the Leaderboard!)
    const updatedBox = { ...boxScore };
    const prevStats = updatedBox[userCard.id] || {
      played: false,
      pts: 0,
      reb: 0,
      ast: 0,
      clutchWon: 0,
      clutchTotal: 0,
    };
    updatedBox[userCard.id] = {
      played: true,
      pts: prevStats.pts + (wonPlay ? userPointsAdded : 8),
      reb: prevStats.reb + (currentScenario.primaryStat === 'def' ? 5 : 3),
      ast: prevStats.ast + (currentScenario.primaryStat === 'play' ? 5 : 2),
      clutchWon: prevStats.clutchWon + (currentScenario.isClutch && wonPlay ? 1 : 0),
      clutchTotal: prevStats.clutchTotal + (currentScenario.isClutch ? 1 : 0),
    };
    setBoxScore(updatedBox);

    // Update Stamina & Multi-Turn Cooldowns!
    // Existing cooldowns tick down by 1 play; the deployed card receives `cooldownPlays` (0, 1, 2, or 3 plays)
    const nextStamina = { ...staminaBySlot };
    const nextCooldowns = { ...cooldownsBySlot };

    slotsOrder.forEach((slot) => {
      if (slot === selectedSlot) {
        nextStamina[slot] = Math.max(15, nextStamina[slot] - staminaDrain);
        nextCooldowns[slot] = cooldownPlays;
      } else {
        nextStamina[slot] = Math.min(100, nextStamina[slot] + 15);
        nextCooldowns[slot] = Math.max(0, nextCooldowns[slot] - 1);
      }
    });

    // Safety check: if all 6 cards happen to be on cooldown, reduce all by 1 so at least 1 card is ready
    if (slotsOrder.every((s) => nextCooldowns[s] > 0)) {
      slotsOrder.forEach((s) => {
        nextCooldowns[s] = Math.max(0, nextCooldowns[s] - 1);
      });
    }

    setStaminaBySlot(nextStamina);
    setCooldownsBySlot(nextCooldowns);

    const nextAvailable =
      slotsOrder.find((s) => nextCooldowns[s] === 0) || 'PG';
    setSelectedSlot(nextAvailable);

    const narrative = wonPlay
      ? `${userCard.firstName} ${userCard.lastName} (#${userCard.jerseyNumber}) overpowers ${cpuCard.lastName} (${userPower} vs ${cpuPower}) for a +${userPointsAdded}–${cpuPointsAdded} swing! (${
          cooldownPlays > 0 ? `${cooldownPlays}-Play Cooldown` : '0 Cooldown'
        })`
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
      cooldownApplied: cooldownPlays,
    });

    if (isLastPlay) {
      finishAndRewardGame(finalUserScore, finalCpuScore, updatedBox);
    }
  };

  // Find user's current bracket opponent if in Bracket mode
  const getCurrentBracketOpponent = (): CpuTeamOpponent => {
    let oppId = 'atl-hawks';
    if (bracketRound === 'QF') {
      const m = qfMatches.find((x) => x.teamA.isUser || x.teamB.isUser);
      if (m) oppId = m.teamA.isUser ? m.teamB.id : m.teamA.id;
    } else if (bracketRound === 'SF') {
      const m = sfMatches.find((x) => x.teamA.isUser || x.teamB.isUser);
      if (m) oppId = m.teamA.isUser ? m.teamB.id : m.teamA.id;
    } else if (bracketRound === 'FINALS' && finalsMatch) {
      oppId = finalsMatch.teamA.isUser ? finalsMatch.teamB.id : finalsMatch.teamA.id;
    }
    return CPU_LEAGUE_TEAMS.find((t) => t.id === oppId) || CPU_LEAGUE_TEAMS[0];
  };

  if (!inProgress) {
    const bracketOpponent = getCurrentBracketOpponent();

    return (
      <div className="space-y-6">
        {/* Top Mode Selector Banner: Set Games vs CPU Teams OR 8-Team Playoff Bracket */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-extrabold uppercase mb-2">
              <Swords className="w-3.5 h-3.5" /> Tactical Showdowns • Tier-Scaled Cooldowns
            </div>
            <h2 className="font-sport font-extrabold text-2xl sm:text-3xl text-white">
              PLAY SET SERIES VS. CPU TEAMS OR ENTER THE 8-TEAM BRACKET
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              <strong>Cooldown Rules:</strong> 98–99 Primetime cards rest <strong>3 Plays</strong>, 95–97 Shiny Legends rest <strong>2 Plays</strong>, 85–94 All-Star/Elite rest <strong>1 Play</strong>, and Base cards have <strong>0 Cooldown</strong>!
            </p>
          </div>

          <div className="flex rounded-2xl bg-slate-950 p-1.5 border border-slate-800 shrink-0">
            <button
              onClick={() => setModeTab('SET_SERIES')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition ${
                modeTab === 'SET_SERIES'
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Swords className="w-4 h-4" />
              Set Series vs. CPU Teams
            </button>
            <button
              onClick={() => setModeTab('BRACKET')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition ${
                modeTab === 'BRACKET'
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Trophy className="w-4 h-4" />
              8-Team Playoff Bracket
            </button>
          </div>
        </div>

        {/* ==================== MODE 1: SET SERIES AGAINST LEAGUE CPU TEAMS ==================== */}
        {modeTab === 'SET_SERIES' && (
          <div className="space-y-5">
            {/* Active Multi-Game Series Banner if a Best-of-3 or Best-of-5 is underway */}
            {activeSeries && !activeSeries.seriesFinished && (
              <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-400/50 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-400 text-slate-950 text-xs font-extrabold uppercase">
                    ACTIVE SET SERIES • FIRST TO {activeSeries.targetWins} WINS
                  </span>
                  <h3 className="font-sport font-extrabold text-2xl text-white mt-1">
                    {franchiseTeam.city} {franchiseTeam.name} ({activeSeries.userSeriesWins}) vs.{' '}
                    {activeSeries.opponent.city} {activeSeries.opponent.name} (
                    {activeSeries.cpuSeriesWins})
                  </h3>
                  <p className="text-xs text-slate-300">
                    Ready for Game #{activeSeries.gameNumber} of the series! Win the set for a massive Coin Bonus + Free Legend/Primetime Card!
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => launchMatchupGame(activeSeries.opponent, false)}
                    className="px-5 py-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-sport font-extrabold text-base uppercase flex items-center gap-2 shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Play Game #{activeSeries.gameNumber} Now
                  </button>
                  <button
                    onClick={() => setActiveSeries(null)}
                    className="px-3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  >
                    Cancel Set
                  </button>
                </div>
              </div>
            )}

            {/* Series Length Selector */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-extrabold uppercase text-slate-300">
                Choose Set Length Before Picking a CPU Franchise Opponent:
              </div>
              <div className="flex items-center gap-2">
                {(
                  [
                    { len: 1, label: 'Single Game (1 Game)' },
                    { len: 3, label: 'Best-of-3 Set (First to 2 Wins • +1,800 Bonus + Card)' },
                    { len: 5, label: 'Best-of-5 Set (First to 3 Wins • +2,700 Bonus + Card)' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.len}
                    onClick={() => setSeriesLength(opt.len)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition ${
                      seriesLength === opt.len
                        ? 'bg-amber-400 text-slate-950 shadow'
                        : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CPU League Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {CPU_LEAGUE_TEAMS.filter((t) => t.id !== franchiseTeam.id).map((team) => {
                const standing = standings.find((s) => s.id === team.id);
                const teamOvr = getTeamOvrFromRoster(team.rosterIds);
                const topStars = team.rosterIds
                  .slice(0, 3)
                  .map((id) => NBA_PLAYER_CARDS.find((c) => c.id === id)!)
                  .filter(Boolean);

                return (
                  <div
                    key={team.id}
                    className="p-5 rounded-2xl bg-slate-900/95 border border-slate-800 hover:border-amber-400/50 transition flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className="px-2.5 py-1 rounded-lg text-xs font-extrabold text-white border border-white/20"
                          style={{ backgroundColor: team.primaryColor }}
                        >
                          {team.abbr} • {teamOvr} OVR
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          Record: <strong className="text-white">{standing ? `${standing.wins}-${standing.losses}` : '3-2'}</strong>
                        </span>
                      </div>

                      <h3 className="font-sport font-extrabold text-xl text-white">
                        {team.city} {team.name}
                      </h3>
                      <div className="text-xs font-bold text-amber-400 mt-0.5">
                        +{team.winCoins.toLocaleString()} Coins / Win
                      </div>

                      <div className="mt-3 space-y-1">
                        <div className="text-[10px] font-bold uppercase text-slate-400">
                          Starting Stars:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {topStars.map((st) => (
                            <button
                              key={st.id}
                              onClick={() => onInspectCard(st)}
                              className="px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-200"
                            >
                              <span className="text-amber-400 font-bold">{st.ovr}</span>{' '}
                              {st.lastName}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => startSetSeries(team, seriesLength)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-sport font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 shadow transition"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      {seriesLength === 1
                        ? `Play ${team.name}`
                        : `Start Best-of-${seriesLength} vs ${team.abbr}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================== MODE 2: 8-TEAM PLAYOFF BRACKET TOURNAMENT ==================== */}
        {modeTab === 'BRACKET' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-extrabold uppercase text-amber-400">
                  8-TEAM SINGLE-ELIMINATION PLAYOFF BRACKET
                </div>
                <h3 className="font-sport font-extrabold text-2xl text-white">
                  {bracketRound === 'CHAMPION'
                    ? `CHAMPION CROWNED: ${bracketChampion}!`
                    : `CURRENT ROUND: ${
                        bracketRound === 'QF'
                          ? 'QUARTERFINALS (8 TEAMS)'
                          : bracketRound === 'SF'
                          ? 'SEMIFINALS (FINAL 4)'
                          : 'CHAMPIONSHIP FINALS'
                      }`}
                </h3>
                <p className="text-xs text-slate-400">
                  Win 3 straight rounds to claim the +5,000 Coin Championship Jackpot + Free 99 Primetime Card! All bracket results update the League Leaderboard.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {bracketRound !== 'CHAMPION' && (
                  <button
                    onClick={() => launchMatchupGame(bracketOpponent, true)}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 text-slate-950 font-sport font-extrabold text-base uppercase tracking-wider flex items-center gap-2 shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Play {bracketRound} Match vs. {bracketOpponent.city} {bracketOpponent.name}
                  </button>
                )}
                <button
                  onClick={initBracket}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold uppercase flex items-center gap-1.5 border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset New Bracket
                </button>
              </div>
            </div>

            {/* Visual 3-Column Bracket Tree (Quarterfinals -> Semifinals -> Finals) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Column 1: Quarterfinals */}
              <div className="space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 px-1">
                  1. Quarterfinals (+1,000 Bonus Coins)
                </div>
                {qfMatches.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2"
                  >
                    {[
                      { team: m.teamA, score: m.scoreA },
                      { team: m.teamB, score: m.scoreB },
                    ].map(({ team, score }, idx) => {
                      const isWinner = m.winnerId === team.id;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold ${
                            team.isUser
                              ? 'bg-amber-500/15 border-amber-400/50 text-white'
                              : isWinner
                              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                              : 'bg-slate-950 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="px-1.5 py-0.5 rounded text-[10px] font-extrabold text-white"
                              style={{ backgroundColor: team.color }}
                            >
                              {team.abbr}
                            </span>
                            <span>
                              {team.city} {team.name} {team.isUser ? '(YOU)' : ''}
                            </span>
                          </div>
                          <span className="font-sport font-extrabold text-sm">
                            {typeof score === 'number' ? score : '--'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Column 2: Semifinals */}
              <div className="space-y-3 flex flex-col justify-center">
                <div className="text-xs font-extrabold uppercase tracking-wider text-sky-400 px-1">
                  2. Semifinals (+2,000 Bonus Coins)
                </div>
                {sfMatches.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-slate-900/50 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                    Complete Quarterfinals to populate the Semifinal matchups
                  </div>
                ) : (
                  sfMatches.map((m) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2"
                    >
                      {[
                        { team: m.teamA, score: m.scoreA },
                        { team: m.teamB, score: m.scoreB },
                      ].map(({ team, score }, idx) => {
                        const isWinner = m.winnerId === team.id;
                        return (
                          <div
                            key={idx}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-bold ${
                              team.isUser
                                ? 'bg-amber-500/15 border-amber-400/50 text-white'
                                : isWinner
                                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                                : 'bg-slate-950 border-slate-800 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="px-1.5 py-0.5 rounded text-[10px] font-extrabold text-white"
                                style={{ backgroundColor: team.color }}
                              >
                                {team.abbr}
                              </span>
                              <span>
                                {team.city} {team.name} {team.isUser ? '(YOU)' : ''}
                              </span>
                            </div>
                            <span className="font-sport font-extrabold text-sm">
                              {typeof score === 'number' ? score : '--'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Column 3: Championship Finals */}
              <div className="space-y-3 flex flex-col justify-center">
                <div className="text-xs font-extrabold uppercase tracking-wider text-amber-400 px-1 flex items-center gap-1.5">
                  <Crown className="w-4 h-4" />
                  3. Championship Finals (+5,000 Coins + 99 Card)
                </div>
                {!finalsMatch ? (
                  <div className="p-8 rounded-2xl bg-slate-900/50 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                    Complete Semifinals to advance to the Championship Finals
                  </div>
                ) : (
                  <div className="p-5 rounded-3xl bg-gradient-to-b from-slate-900 to-amber-950/30 border-2 border-amber-400/50 space-y-2.5 shadow-xl">
                    {[
                      { team: finalsMatch.teamA, score: finalsMatch.scoreA },
                      { team: finalsMatch.teamB, score: finalsMatch.scoreB },
                    ].map(({ team, score }, idx) => {
                      const isWinner = finalsMatch.winnerId === team.id;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center justify-between px-3.5 py-3 rounded-xl border text-xs font-bold ${
                            team.isUser
                              ? 'bg-amber-500/20 border-amber-400 text-white'
                              : isWinner
                              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                              : 'bg-slate-950 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-extrabold text-white"
                              style={{ backgroundColor: team.color }}
                            >
                              {team.abbr}
                            </span>
                            <span className="text-sm">
                              {team.city} {team.name} {team.isUser ? '(YOU)' : ''}
                            </span>
                          </div>
                          <span className="font-sport font-extrabold text-base">
                            {typeof score === 'number' ? score : '--'}
                          </span>
                        </div>
                      );
                    })}

                    {bracketChampion && (
                      <div className="p-3 rounded-xl bg-amber-400 text-slate-950 text-center font-sport font-extrabold text-base uppercase tracking-wider">
                        🏆 CHAMPION: {bracketChampion} 🏆
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
              <div className="text-xs font-bold uppercase text-slate-400">
                {isBracketGame ? `BRACKET (${bracketRound})` : 'CPU FRANCHISE'}
              </div>
              <div className="font-sport font-extrabold text-lg sm:text-xl text-white">
                {selectedOpponent.city} {selectedOpponent.name}
              </div>
            </div>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center font-sport font-extrabold text-lg text-white shadow-inner border border-white/20"
              style={{ backgroundColor: selectedOpponent.primaryColor }}
            >
              {selectedOpponent.abbr}
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

            {/* 6-Man Rotation Picker with Tier-Scaled Cooldown Badges */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Select Card from Your 6-Man Rotation
                </h4>
                <span className="text-[11px] text-amber-300 font-semibold">
                  98–99 OVR = 3-Play Cooldown • 95–97 OVR = 2-Play Cooldown • Base = 0 Cooldown
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 justify-items-center">
                {slotsOrder.map((slot) => {
                  const card = lineupCards[slot];
                  const evo = ownedMap[card.id]?.evoBonus ?? 0;
                  const effectiveOvr = Math.min(99, card.ovr + evo);
                  const cdRemaining = cooldownsBySlot[slot];
                  const isCooling = cdRemaining > 0;
                  const isChosen = selectedSlot === slot;
                  const rule = getCardCooldownAndDrain(card.tier, effectiveOvr);

                  return (
                    <div key={slot} className="flex flex-col items-center gap-1">
                      <div className="flex items-center justify-between w-48 px-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          {slot === 'SIXTH' ? '6TH MAN' : slot}
                        </span>
                        <span className="text-[10px] font-bold text-sky-400 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" /> {rule.label}
                        </span>
                      </div>
                      <PlayerCard
                        card={card}
                        evoBonus={evo}
                        stamina={staminaBySlot[slot]}
                        onCooldown={isCooling}
                        cooldownTurns={cdRemaining}
                        selected={isChosen}
                        useFranchiseJersey={useFranchiseJersey}
                        franchiseTeam={franchiseTeam}
                        size="sm"
                        actionBadge={isChosen ? 'DEPLOYING' : undefined}
                        onClick={() => {
                          if (revealedPlayResult) {
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
                        background: `linear-gradient(135deg, ${selectedOpponent.primaryColor}, #1e293b, ${selectedOpponent.primaryColor})`,
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
                            style={{ backgroundColor: selectedOpponent.primaryColor }}
                          >
                            {selectedOpponent.abbr}
                          </div>
                          <div className="font-sport font-extrabold text-base text-white tracking-wider uppercase">
                            CPU CARD HIDDEN
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                            Hit <strong>Run Play</strong> below to lock in your card and reveal the {selectedOpponent.name} matchup!
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
                    ? 'Claim Rewards & View Final Box Score →'
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
                  Select a card and click "Run Play #1" to tip off against the {selectedOpponent.city} {selectedOpponent.name}!
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
        /* Post-Game Box Score, Claimed Rewards & Leaderboard Sync Confirmation */
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-700 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                    userScore > cpuScore
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {userScore > cpuScore ? 'VICTORY!' : 'HARD-FOUGHT LOSS'}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 text-xs font-extrabold uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5" /> REWARDS CREDITED & LEADERBOARD UPDATED
                </span>
              </div>

              <h3 className="font-sport font-extrabold text-3xl text-white">
                {franchiseTeam.city} {franchiseTeam.name} {userScore} — {cpuScore}{' '}
                {selectedOpponent.city} {selectedOpponent.name}
              </h3>
              {lastRewardSummary?.bonusNote && (
                <p className="text-sm font-bold text-amber-300 mt-1">
                  {lastRewardSummary.bonusNote}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="px-4 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-sport font-extrabold text-xl flex items-center gap-2">
                <Coins className="w-5 h-5" />+
                {(lastRewardSummary?.coinsEarned ?? selectedOpponent.winCoins).toLocaleString()}{' '}
                COINS ADDED!
              </div>

              <button
                onClick={onJumpToLeaderboard}
                className="px-4 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-sport font-extrabold text-base uppercase flex items-center gap-2 transition"
              >
                <Trophy className="w-4 h-4" />
                View Updated Leaderboard
              </button>

              <button
                onClick={() => setInProgress(false)}
                className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-sport font-extrabold text-base uppercase flex items-center gap-2 transition"
              >
                <RotateCcw className="w-4 h-4" />
                {isBracketGame
                  ? 'Return to Playoff Bracket'
                  : activeSeries && !activeSeries.seriesFinished
                  ? `Next Series Game (#${activeSeries.gameNumber})`
                  : 'Back to Matchup Hub'}
              </button>
            </div>
          </div>

          {/* Bonus Card Reward Showcase if won a Series or Bracket! */}
          {lastRewardSummary?.bonusCard && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-fuchsia-500/15 to-sky-500/15 border border-amber-400/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase text-amber-300">
                  <Gift className="w-4 h-4" /> BONUS TROPHY CARD ADDED TO YOUR BINDER!
                </div>
                <h4 className="font-sport font-extrabold text-2xl text-white">
                  Unlocked {lastRewardSummary.bonusCard.editionTitle}{' '}
                  {lastRewardSummary.bonusCard.firstName}{' '}
                  {lastRewardSummary.bonusCard.lastName} (
                  {lastRewardSummary.bonusCard.ovr} OVR)
                </h4>
                <p className="text-xs text-slate-300">
                  This card has been automatically added to your Collection Binder!
                </p>
              </div>
              <PlayerCard
                card={lastRewardSummary.bonusCard}
                size="sm"
                onClick={() => onInspectCard(lastRewardSummary.bonusCard!)}
              />
            </div>
          )}

          {/* Official Player Box Score Table */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
              Official Game Box Score (Synced to League Leaders Leaderboard)
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
                      played: false,
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
