import React, { useMemo, useState } from 'react';
import {
  CpuDraftTeam,
  PlayerCardTemplate,
  TeamIdentity,
  UniverseMode,
} from '../types/game';
import {
  getCardsForUniverse,
  NBA_PLAYER_CARDS,
  REAL_NBA_TEAMS,
  TIER_LABELS,
} from '../data/nbaData';
import { PlayerCard } from './PlayerCard';
import confetti from 'canvas-confetti';
import {
  ArrowLeftRight,
  CheckCircle2,
  DollarSign,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';

interface DraftFranchiseViewProps {
  franchiseTeam: TeamIdentity;
  universe: UniverseMode;
  useFranchiseJersey: boolean;
  onInspectCard: (card: PlayerCardTemplate) => void;
}

const AGENDAS: {
  agenda: CpuDraftTeam['agenda'];
  label: string;
}[] = [
  { agenda: 'WIN_NOW', label: 'Win-Now Contender (Loves 92+ OVR Vets)' },
  { agenda: 'STAR_HUNTING', label: 'Star Hunter (Wants 95+ Shiny/Rainbow Icons)' },
  { agenda: 'REBUILDING', label: 'Value Rebuilder (Accepts Cash + Depth)' },
  { agenda: 'DEFENSE_FIRST', label: 'Defense First (Prizes 90+ DEF Stoppers)' },
];

export const DraftFranchiseView: React.FC<DraftFranchiseViewProps> = ({
  franchiseTeam,
  universe,
  useFranchiseJersey,
  onInspectCard,
}) => {
  const universePool = useMemo(
    () => [...getCardsForUniverse(universe)].sort((a, b) => b.ovr - a.ovr),
    [universe]
  );

  const [phase, setPhase] = useState<'DRAFTING' | 'GM_HUB'>('DRAFTING');
  const [gmSubTab, setGmSubTab] = useState<'ROSTER' | 'TRADE' | 'MARKET' | 'SEASON'>(
    'ROSTER'
  );

  // Draft State
  const [draftPoolIds, setDraftPoolIds] = useState<string[]>(() =>
    universePool.map((c) => c.id)
  );
  const [userRosterIds, setUserRosterIds] = useState<string[]>([]);
  const [userCashM, setUserCashM] = useState<number>(65);
  const [userWins, setUserWins] = useState<number>(0);
  const [userLosses, setUserLosses] = useState<number>(0);
  const [championships, setChampionships] = useState<number>(0);
  const [draftRound, setDraftRound] = useState<number>(1);
  const [posFilter, setPosFilter] = useState<string>('ALL');

  const [cpuTeams, setCpuTeams] = useState<CpuDraftTeam[]>(() =>
    REAL_NBA_TEAMS.filter((t) => t.id !== franchiseTeam.id)
      .slice(0, 7)
      .map((t, idx) => ({
        id: t.id,
        city: t.city,
        name: t.name,
        abbreviation: t.abbreviation,
        primaryColor: t.primaryColor,
        secondaryColor: t.secondaryColor,
        accentColor: t.accentColor,
        agenda: AGENDAS[idx % AGENDAS.length].agenda,
        agendaLabel: AGENDAS[idx % AGENDAS.length].label,
        cashM: 60,
        rosterCardIds: [],
        wins: 0,
        losses: 0,
      }))
  );

  // Trade State
  const [selectedCpuId, setSelectedCpuId] = useState<string>(
    cpuTeams[0]?.id || 'atl-hawks'
  );
  const [offeredUserCardId, setOfferedUserCardId] = useState<string>('');
  const [offeredCashM, setOfferedCashM] = useState<number>(0);
  const [requestedCpuCardId, setRequestedCpuCardId] = useState<string>('');
  const [tradeFeedback, setTradeFeedback] = useState<string | null>(null);
  const [seasonLog, setSeasonLog] = useState<string[]>([]);

  const cardById = (id: string) =>
    NBA_PLAYER_CARDS.find((c) => c.id === id) || NBA_PLAYER_CARDS[0];

  const resetNewDraft = () => {
    const freshPool = getCardsForUniverse(universe)
      .sort((a, b) => b.ovr - a.ovr)
      .map((c) => c.id);
    setDraftPoolIds(freshPool);
    setUserRosterIds([]);
    setUserCashM(65);
    setUserWins(0);
    setUserLosses(0);
    setDraftRound(1);
    setTradeFeedback(null);
    setSeasonLog([]);
    setCpuTeams(
      REAL_NBA_TEAMS.filter((t) => t.id !== franchiseTeam.id)
        .slice(0, 7)
        .map((t, idx) => ({
          id: t.id,
          city: t.city,
          name: t.name,
          abbreviation: t.abbreviation,
          primaryColor: t.primaryColor,
          secondaryColor: t.secondaryColor,
          accentColor: t.accentColor,
          agenda: AGENDAS[idx % AGENDAS.length].agenda,
          agendaLabel: AGENDAS[idx % AGENDAS.length].label,
          cashM: 60,
          rosterCardIds: [],
          wins: 0,
          losses: 0,
        }))
    );
    setPhase('DRAFTING');
  };

  // Enforce Realistic 1-version-per-athlete rule during draft
  const canUserAcquireCard = (candidate: PlayerCardTemplate, excludingCardId?: string) => {
    if (universe !== 'REALISTIC') return true;
    const activeIds = userRosterIds.filter((id) => id !== excludingCardId);
    return !activeIds.some((id) => cardById(id).playerId === candidate.playerId);
  };

  const handleDraftPick = (pickedCardId: string) => {
    const pickedCard = cardById(pickedCardId);
    if (!canUserAcquireCard(pickedCard)) {
      alert(
        `Realistic Mode Rule: You already drafted an edition of ${pickedCard.firstName} ${pickedCard.lastName}! Pick another athlete or switch to Fantastical/Crossover mode.`
      );
      return;
    }

    let remaining = draftPoolIds.filter((id) => id !== pickedCardId);
    const updatedUserRoster = [...userRosterIds, pickedCardId];

    // Each of the 7 CPU teams makes a smart pick from the remaining board
    const updatedCpus = cpuTeams.map((cpu) => {
      if (remaining.length === 0) return cpu;
      // Pick one of top 3 available cards
      const pickIdx = Math.min(
        remaining.length - 1,
        Math.floor(Math.random() * Math.min(3, remaining.length))
      );
      const cpuPick = remaining[pickIdx];
      remaining = remaining.filter((id) => id !== cpuPick);
      return {
        ...cpu,
        rosterCardIds: [...cpu.rosterCardIds, cpuPick],
      };
    });

    setUserRosterIds(updatedUserRoster);
    setCpuTeams(updatedCpus);
    setDraftPoolIds(remaining);

    if (draftRound >= 6 || remaining.length === 0) {
      setPhase('GM_HUB');
      setGmSubTab('ROSTER');
      setOfferedUserCardId(updatedUserRoster[0] || '');
      const firstCpu = updatedCpus[0];
      if (firstCpu && firstCpu.rosterCardIds.length > 0) {
        setSelectedCpuId(firstCpu.id);
        setRequestedCpuCardId(firstCpu.rosterCardIds[0]);
      }
      confetti({ particleCount: 60, spread: 65, origin: { y: 0.6 } });
    } else {
      setDraftRound(draftRound + 1);
    }
  };

  const userTeamOvr = useMemo(() => {
    if (userRosterIds.length === 0) return 0;
    const top6 = userRosterIds
      .map((id) => cardById(id).ovr)
      .sort((a, b) => b - a)
      .slice(0, 6);
    return Math.round(top6.reduce((a, b) => a + b, 0) / top6.length);
  }, [userRosterIds]);

  const getCpuOvr = (cpu: CpuDraftTeam) => {
    if (cpu.rosterCardIds.length === 0) return 80;
    const top6 = cpu.rosterCardIds
      .map((id) => cardById(id).ovr)
      .sort((a, b) => b - a)
      .slice(0, 6);
    return Math.round(top6.reduce((a, b) => a + b, 0) / top6.length);
  };

  // Trade Evaluation Engine
  const selectedCpu =
    cpuTeams.find((c) => c.id === selectedCpuId) || cpuTeams[0];
  const offeredCard = offeredUserCardId ? cardById(offeredUserCardId) : null;
  const requestedCard = requestedCpuCardId ? cardById(requestedCpuCardId) : null;

  const tradeEval = useMemo(() => {
    if (!offeredCard || !requestedCard || !selectedCpu) {
      return {
        userValue: 0,
        cpuRequiredValue: 0,
        accepted: false,
        reason: 'Select 1 card from your roster and 1 card from the CPU team to evaluate.',
      };
    }

    let userOfferScore = offeredCard.salaryM + offeredCashM;
    let cpuAskScore = requestedCard.salaryM;

    if (selectedCpu.agenda === 'STAR_HUNTING' && offeredCard.ovr >= 95) {
      userOfferScore += 8;
    }
    if (selectedCpu.agenda === 'DEFENSE_FIRST' && offeredCard.stats.def >= 92) {
      userOfferScore += 6;
    }
    if (selectedCpu.agenda === 'REBUILDING' && offeredCashM >= 10) {
      userOfferScore += 5;
    }

    const accepted = userOfferScore >= cpuAskScore;
    const diff = userOfferScore - cpuAskScore;

    return {
      userValue: userOfferScore,
      cpuRequiredValue: cpuAskScore,
      accepted,
      reason: accepted
        ? `${selectedCpu.city} ${selectedCpu.name} GM approves this deal! (Offer value $${userOfferScore}M vs $${cpuAskScore}M target)`
        : `${selectedCpu.city} GM wants ~$${Math.abs(
            diff
          )}M more in player value or cash to part with ${requestedCard.firstName} ${
            requestedCard.lastName
          }.`,
    };
  }, [offeredCard, requestedCard, offeredCashM, selectedCpu]);

  const executeTrade = () => {
    if (!offeredCard || !requestedCard || !selectedCpu || !tradeEval.accepted) return;
    if (!canUserAcquireCard(requestedCard, offeredCard.id)) {
      setTradeFeedback(
        `Blocked by Realistic Mode Rule: You already own another version of ${requestedCard.firstName} ${requestedCard.lastName}.`
      );
      return;
    }

    const nextUserRoster = userRosterIds
      .filter((id) => id !== offeredCard.id)
      .concat(requestedCard.id);

    const nextCpus = cpuTeams.map((cpu) => {
      if (cpu.id !== selectedCpu.id) return cpu;
      return {
        ...cpu,
        cashM: cpu.cashM + offeredCashM,
        rosterCardIds: cpu.rosterCardIds
          .filter((id) => id !== requestedCard.id)
          .concat(offeredCard.id),
      };
    });

    setUserRosterIds(nextUserRoster);
    setUserCashM((c) => c - offeredCashM);
    setCpuTeams(nextCpus);
    setOfferedCashM(0);
    setOfferedUserCardId(nextUserRoster[0] || '');
    const updatedTargetCpu = nextCpus.find((c) => c.id === selectedCpu.id)!;
    setRequestedCpuCardId(updatedTargetCpu.rosterCardIds[0] || '');
    setTradeFeedback(
      `TRADE OFFICIAL: Acquired ${requestedCard.firstName} ${requestedCard.lastName} (${requestedCard.ovr} OVR) from ${selectedCpu.city} ${selectedCpu.name}!`
    );
  };

  const handleSellPlayer = (cardId: string) => {
    if (userRosterIds.length <= 5) {
      alert('You must keep at least 5 players on your active franchise roster!');
      return;
    }
    const card = cardById(cardId);
    setUserRosterIds((prev) => prev.filter((id) => id !== cardId));
    setUserCashM((c) => c + card.salaryM);
    setDraftPoolIds((prev) => [cardId, ...prev]);
  };

  const handleSignFreeAgent = (cardId: string) => {
    const card = cardById(cardId);
    if (userCashM < card.salaryM) {
      alert(`Insufficient Franchise Cash! Need $${card.salaryM}M (You have $${userCashM}M).`);
      return;
    }
    if (!canUserAcquireCard(card)) {
      alert(
        `Realistic Mode Rule: You already have a version of ${card.firstName} ${card.lastName} on your roster!`
      );
      return;
    }
    setUserCashM((c) => c - card.salaryM);
    setUserRosterIds((prev) => [...prev, cardId]);
    setDraftPoolIds((prev) => prev.filter((id) => id !== cardId));
  };

  const playSeasonSeries = () => {
    const logs: string[] = [];
    let wAdd = 0;
    let lAdd = 0;

    const updatedCpus = cpuTeams.map((cpu) => {
      const cOvr = getCpuOvr(cpu);
      const userRoll = userTeamOvr + (Math.random() * 10 - 5);
      const cpuRoll = cOvr + (Math.random() * 10 - 5);
      const userWon = userRoll >= cpuRoll;
      const uPts = Math.round(userRoll + 18 + Math.random() * 8);
      const cPts = userWon
        ? Math.min(uPts - 2, Math.round(cpuRoll + 16))
        : Math.max(uPts + 2, Math.round(cpuRoll + 20));

      if (userWon) {
        wAdd += 1;
        logs.push(
          `WIN vs. ${cpu.city} ${cpu.name} (${uPts}–${cPts}) • Your ${userTeamOvr} OVR squad outlasted ${cpu.abbreviation} (${cOvr} OVR)`
        );
      } else {
        lAdd += 1;
        logs.push(
          `LOSS vs. ${cpu.city} ${cpu.name} (${uPts}–${cPts}) • ${cpu.abbreviation} (${cOvr} OVR) stole a road win`
        );
      }

      return {
        ...cpu,
        wins: cpu.wins + (userWon ? 0 : 1) + Math.floor(Math.random() * 4 + 2),
        losses: cpu.losses + (userWon ? 1 : 0) + Math.floor(Math.random() * 4 + 1),
      };
    });

    const wonBanner = wAdd >= 5;
    if (wonBanner) {
      setChampionships((b) => b + 1);
      setUserCashM((c) => c + 30);
      logs.unshift(
        `CHAMPIONSHIP BANNER CLINCHED! (${wAdd}-${lAdd} Run) • Awarded +$30M Franchise Bonus Cash!`
      );
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
    } else {
      setUserCashM((c) => c + 15);
      logs.unshift(
        `Season Series Completed (${wAdd}-${lAdd}) • Earned +$15M Franchise TV Revenue!`
      );
    }

    setUserWins((w) => w + wAdd);
    setUserLosses((l) => l + lAdd);
    setCpuTeams(updatedCpus);
    setSeasonLog(logs);
  };

  const availableBoardCards = draftPoolIds
    .map((id) => cardById(id))
    .filter((c) => posFilter === 'ALL' || c.position === posFilter);

  return (
    <div className="space-y-6">
      {/* Top Franchise GM Header Bar */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-extrabold uppercase mb-1">
            Standalone Mode • Draft, Trade & Sell Franchise GM
          </div>
          <h2 className="font-sport font-extrabold text-2xl sm:text-3xl text-white">
            {franchiseTeam.city} {franchiseTeam.name} FRONT OFFICE
          </h2>
          <p className="text-xs text-slate-400">
            Universe: <strong className="text-white">{universe}</strong> • Separate Roster & Cap Budget from Pack Mode
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] font-bold text-slate-400">TEAM OVR</div>
            <div className="font-sport font-extrabold text-lg text-amber-400">
              {userTeamOvr || '--'}
            </div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] font-bold text-slate-400">GM CASH</div>
            <div className="font-sport font-extrabold text-lg text-emerald-400">
              ${userCashM}M
            </div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
            <div className="text-[10px] font-bold text-slate-400">RECORD</div>
            <div className="font-sport font-extrabold text-lg text-white">
              {userWins}-{userLosses} ({championships} Rings)
            </div>
          </div>

          <button
            onClick={resetNewDraft}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold uppercase flex items-center gap-1.5 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Snake Draft
          </button>
        </div>
      </div>

      {/* ==================== PHASE 1: 6-ROUND LIVE SNAKE DRAFT ==================== */}
      {phase === 'DRAFTING' ? (
        <div className="space-y-5">
          {/* Draft Status Banner */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/40 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-extrabold uppercase text-amber-400">
                ON THE CLOCK • ROUND {draftRound} OF 6
              </div>
              <h3 className="font-sport font-extrabold text-xl text-white">
                Select 1 Player Card from the Draft Board to Build Your 6-Man Rotation
              </h3>
              <p className="text-xs text-slate-400">
                After your pick, all 7 CPU franchises immediately make their round selections.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(['ALL', 'PG', 'SG', 'SF', 'PF', 'C'] as const).map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPosFilter(pos)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                    posFilter === pos
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-950 text-slate-300 border border-slate-800'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Your Picks So Far */}
          {userRosterIds.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="text-xs font-extrabold uppercase text-slate-400 mb-2">
                Your Drafted Squad ({userRosterIds.length}/6)
              </div>
              <div className="flex flex-wrap gap-2">
                {userRosterIds.map((id, idx) => {
                  const c = cardById(id);
                  return (
                    <span
                      key={id}
                      onClick={() => onInspectCard(c)}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white cursor-pointer hover:border-amber-400 flex items-center gap-1.5"
                    >
                      <span className="text-slate-400">R{idx + 1}:</span>
                      <span className="text-amber-400">{c.ovr}</span>
                      <span>
                        {c.firstName} {c.lastName} ({c.position})
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Draft Board Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 justify-items-center">
            {availableBoardCards.map((card) => (
              <div key={card.id} className="flex flex-col items-center gap-2">
                <PlayerCard
                  card={card}
                  useFranchiseJersey={useFranchiseJersey}
                  franchiseTeam={franchiseTeam}
                  size="md"
                  onClick={() => onInspectCard(card)}
                />
                <button
                  onClick={() => handleDraftPick(card.id)}
                  className="w-60 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-sport font-extrabold text-sm uppercase tracking-wider shadow-md transition"
                >
                  Draft {card.lastName} ({card.ovr} OVR)
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ==================== PHASE 2: FRANCHISE GM HUB (ROSTER / TRADE / SELL / SEASON) ==================== */
        <div className="space-y-6">
          {/* Sub-Navigation Pills */}
          <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 w-fit">
            {[
              { id: 'ROSTER', label: `My Drafted Roster (${userRosterIds.length})` },
              { id: 'TRADE', label: 'CPU Trade Negotiation Center' },
              { id: 'MARKET', label: `Sell & Free Agent Market ($${userCashM}M)` },
              { id: 'SEASON', label: 'Play Franchise Season & Standings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setGmSubTab(tab.id as typeof gmSubTab)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition ${
                  gmSubTab === tab.id
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* SUB-TAB 1: ROSTER & QUICK-SELL */}
          {gmSubTab === 'ROSTER' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-sport font-extrabold text-xl text-white">
                  ACTIVE DRAFTED FRANCHISE ROSTER (Click Card to Inspect or Sell for Cap Cash)
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 justify-items-center">
                {userRosterIds.map((id) => {
                  const c = cardById(id);
                  return (
                    <div key={id} className="flex flex-col items-center gap-2">
                      <PlayerCard
                        card={c}
                        useFranchiseJersey={useFranchiseJersey}
                        franchiseTeam={franchiseTeam}
                        size="md"
                        onClick={() => onInspectCard(c)}
                      />
                      <button
                        onClick={() => handleSellPlayer(id)}
                        className="w-60 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-extrabold uppercase transition"
                      >
                        Sell / Waive for +${c.salaryM}M Cash
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUB-TAB 2: CPU TRADE NEGOTIATION CENTER */}
          {gmSubTab === 'TRADE' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 4 Cols: Select CPU Trade Partner */}
              <div className="lg:col-span-4 space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  1. Choose CPU Franchise Partner
                </h3>
                {cpuTeams.map((cpu) => (
                  <button
                    key={cpu.id}
                    onClick={() => {
                      setSelectedCpuId(cpu.id);
                      setRequestedCpuCardId(cpu.rosterCardIds[0] || '');
                      setTradeFeedback(null);
                    }}
                    className={`w-full p-3.5 rounded-2xl border text-left transition ${
                      selectedCpu.id === cpu.id
                        ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/25'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-sport font-extrabold text-base text-white">
                        {cpu.city} {cpu.name} ({getCpuOvr(cpu)} OVR)
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-extrabold text-white"
                        style={{ backgroundColor: cpu.primaryColor }}
                      >
                        {cpu.abbreviation}
                      </span>
                    </div>
                    <div className="text-[11px] text-amber-300 font-semibold">
                      {cpu.agendaLabel}
                    </div>
                  </button>
                ))}
              </div>

              {/* Right 8 Cols: Trade Table & Fairness Meter */}
              <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Your Offer */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="text-xs font-extrabold uppercase text-emerald-400">
                      Your Trade Offer ({franchiseTeam.city} {franchiseTeam.name})
                    </div>
                    <select
                      value={offeredUserCardId}
                      onChange={(e) => setOfferedUserCardId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white"
                    >
                      {userRosterIds.map((id) => {
                        const c = cardById(id);
                        return (
                          <option key={id} value={id}>
                            {c.firstName} {c.lastName} ({c.ovr} OVR • {c.position} • ${c.salaryM}M)
                          </option>
                        );
                      })}
                    </select>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                        <span>Include Franchise Cash Sweetener:</span>
                        <span className="text-emerald-400">${offeredCashM}M</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={userCashM}
                        step={5}
                        value={offeredCashM}
                        onChange={(e) => setOfferedCashM(Number(e.target.value))}
                        className="w-full accent-emerald-400"
                      />
                    </div>

                    {offeredCard && (
                      <div className="flex justify-center pt-2">
                        <PlayerCard
                          card={offeredCard}
                          useFranchiseJersey={useFranchiseJersey}
                          franchiseTeam={franchiseTeam}
                          size="sm"
                          onClick={() => onInspectCard(offeredCard)}
                        />
                      </div>
                    )}
                  </div>

                  {/* CPU Target Card */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="text-xs font-extrabold uppercase text-amber-400">
                      Target Card from {selectedCpu.city} {selectedCpu.name}
                    </div>
                    <select
                      value={requestedCpuCardId}
                      onChange={(e) => setRequestedCpuCardId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white"
                    >
                      {selectedCpu.rosterCardIds.map((id) => {
                        const c = cardById(id);
                        return (
                          <option key={id} value={id}>
                            {c.firstName} {c.lastName} ({c.ovr} OVR • {c.position} • ${c.salaryM}M)
                          </option>
                        );
                      })}
                    </select>

                    <div className="text-[11px] text-slate-400">
                      CPU GM Agenda: <strong className="text-slate-200">{selectedCpu.agendaLabel}</strong>
                    </div>

                    {requestedCard && (
                      <div className="flex justify-center pt-2">
                        <PlayerCard
                          card={requestedCard}
                          size="sm"
                          onClick={() => onInspectCard(requestedCard)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* GM Evaluation & Execute Trade Button */}
                <div
                  className={`p-4 rounded-2xl border ${
                    tradeEval.accepted
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <div className="text-xs font-bold mb-1">{tradeEval.reason}</div>
                  {tradeFeedback && (
                    <div className="text-xs font-extrabold text-emerald-400 mt-1">
                      {tradeFeedback}
                    </div>
                  )}
                </div>

                <button
                  disabled={!tradeEval.accepted}
                  onClick={executeTrade}
                  className={`w-full py-3.5 rounded-xl font-sport font-extrabold text-base uppercase tracking-wider flex items-center justify-center gap-2 transition ${
                    tradeEval.accepted
                      ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-lg'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <ArrowLeftRight className="w-5 h-5" />
                  {tradeEval.accepted
                    ? 'Execute Official Trade'
                    : 'Sweeten Offer or Add Cash to Unlock Trade'}
                </button>
              </div>
            </div>
          )}

          {/* SUB-TAB 3: FREE AGENT MARKET & SELLING */}
          {gmSubTab === 'MARKET' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-sport font-extrabold text-xl text-white">
                    UNDRAFTED FREE AGENT & WAIVER WIRE MARKET
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sign available players using your Franchise Cash (${userCashM}M) or sell players from your Roster tab.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 justify-items-center">
                {draftPoolIds.slice(0, 12).map((id) => {
                  const c = cardById(id);
                  const canAfford = userCashM >= c.salaryM;
                  return (
                    <div key={id} className="flex flex-col items-center gap-2">
                      <PlayerCard
                        card={c}
                        size="md"
                        onClick={() => onInspectCard(c)}
                      />
                      <button
                        onClick={() => handleSignFreeAgent(id)}
                        className={`w-60 py-2.5 rounded-xl font-sport font-extrabold text-sm uppercase transition ${
                          canAfford
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        Sign Free Agent (${c.salaryM}M)
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUB-TAB 4: FRANCHISE SEASON & PLAYOFF SERIES */}
          {gmSubTab === 'SEASON' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-sport font-extrabold text-xl text-white">
                    FRANCHISE DRAFT LEAGUE STANDINGS
                  </h3>
                  <button
                    onClick={playSeasonSeries}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-sport font-extrabold text-sm uppercase flex items-center gap-1.5 shadow"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Play 7-Game League Series
                  </button>
                </div>

                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase">
                      <th className="py-2 px-2">Team</th>
                      <th className="py-2 px-2 text-center">OVR</th>
                      <th className="py-2 px-2 text-right">W-L</th>
                      <th className="py-2 px-2 text-right">Top Star</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {[
                      {
                        id: franchiseTeam.id,
                        name: `${franchiseTeam.city} ${franchiseTeam.name} (YOU)`,
                        ovr: userTeamOvr,
                        wins: userWins,
                        losses: userLosses,
                        topCard: userRosterIds[0] ? cardById(userRosterIds[0]) : null,
                        isUser: true,
                      },
                      ...cpuTeams.map((cpu) => ({
                        id: cpu.id,
                        name: `${cpu.city} ${cpu.name}`,
                        ovr: getCpuOvr(cpu),
                        wins: cpu.wins,
                        losses: cpu.losses,
                        topCard: cpu.rosterCardIds[0]
                          ? cardById(cpu.rosterCardIds[0])
                          : null,
                        isUser: false,
                      })),
                    ]
                      .sort((a, b) => b.wins - a.wins || b.ovr - a.ovr)
                      .map((row) => (
                        <tr
                          key={row.id}
                          className={
                            row.isUser
                              ? 'bg-amber-500/10 font-bold text-white'
                              : 'text-slate-300'
                          }
                        >
                          <td className="py-2.5 px-2">{row.name}</td>
                          <td className="py-2.5 px-2 text-center text-amber-400 font-bold">
                            {row.ovr}
                          </td>
                          <td className="py-2.5 px-2 text-right font-sport font-bold">
                            {row.wins}-{row.losses}
                          </td>
                          <td className="py-2.5 px-2 text-right text-xs">
                            {row.topCard ? (
                              <button
                                onClick={() => onInspectCard(row.topCard!)}
                                className="text-sky-400 hover:underline"
                              >
                                {row.topCard.lastName} ({row.topCard.ovr})
                              </button>
                            ) : (
                              '--'
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <h3 className="font-sport font-extrabold text-xl text-white">
                  SEASON SERIES TICKER
                </h3>
                {seasonLog.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">
                    Click "Play 7-Game League Series" to test your drafted & traded squad against every CPU franchise!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {seasonLog.map((entry, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs ${
                          idx === 0
                            ? 'bg-amber-500/15 border-amber-400/40 text-amber-200 font-bold'
                            : entry.startsWith('WIN')
                            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        {entry}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
