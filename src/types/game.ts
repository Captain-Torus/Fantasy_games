export type SportId = 'NBA' | 'NFL' | 'NHL' | 'CFB';

export type GameMode = 'PACK_MODE' | 'DRAFT_MODE';

export type UniverseMode = 'REALISTIC' | 'FANTASTICAL' | 'CROSSOVER';

export type CardTier = 'BASE' | 'ALL_STAR' | 'ELITE' | 'LEGENDS' | 'PRIMETIME';

export type NBAPosition = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export type LineupSlot = 'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'SIXTH';

export type ActionPose = 'FADEAWAY' | 'DUNK' | 'HANDLES' | 'LOCKDOWN' | 'RIM_GUARD' | 'SNIPER';

export type JerseyStyle = 'CLASSIC' | 'PINSTRIPE' | 'CHEVRON' | 'RETRO_BAND';

export type EmblemType =
  | 'HAWK'
  | 'ANGEL'
  | 'BULL'
  | 'CROWN'
  | 'STAR'
  | 'FLAME'
  | 'SHIELD'
  | 'BOLT'
  | 'CLOVER'
  | 'SUN';

export interface TeamIdentity {
  id: string;
  isCustom: boolean;
  city: string;
  name: string;
  abbreviation: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  jerseyStyle: JerseyStyle;
  emblem: EmblemType;
}

export interface CardSubStats {
  off: number;  // Scoring / Offense
  play: number; // Playmaking / Speed
  def: number;  // Defense / Rebounding
  clu: number;  // Clutch / Basketball IQ
}

export interface PlayerCardTemplate {
  id: string;
  playerId: string; // Canonical athlete ID (e.g. 'michael-jordan')
  firstName: string;
  lastName: string;
  jerseyNumber: string;
  position: NBAPosition;
  tier: CardTier;
  editionTitle: string;
  eraOrArchetype: string;
  isFictional: boolean;
  ovr: number;
  stats: CardSubStats;
  pose: ActionPose;
  teamCity: string;
  teamName: string;
  teamAbbr: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  jerseyStyle: JerseyStyle;
  salaryM: number;
  quickSellCoins: number;
  lore: string;
}

export interface OwnedCard {
  cardId: string;
  quantity: number;
  evoBonus: number; // From combining 3 duplicates (+1 OVR per evo)
  gamesPlayed: number;
  totalPoints: number;
  totalRebounds: number;
  totalAssists: number;
  clutchPlaysWon: number;
  clutchPlaysTotal: number;
}

export interface PackDefinition {
  id: string;
  name: string;
  subtitle: string;
  priceCoins: number;
  cardCount: number;
  badgeText: string;
  accentGradient: string;
  tierWeights: Record<CardTier, number>;
  guaranteedMinTier?: CardTier;
}

export interface LeagueTeamStanding {
  id: string;
  city: string;
  name: string;
  abbreviation: string;
  primaryColor: string;
  secondaryColor: string;
  isUser: boolean;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  teamOvr: number;
  collectionScore: number;
  championships: number;
}

export interface CpuDraftTeam {
  id: string;
  city: string;
  name: string;
  abbreviation: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  agenda: 'WIN_NOW' | 'STAR_HUNTING' | 'REBUILDING' | 'DEFENSE_FIRST';
  agendaLabel: string;
  cashM: number;
  rosterCardIds: string[];
  wins: number;
  losses: number;
}
