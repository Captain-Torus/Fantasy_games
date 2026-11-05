import React from 'react';
import {
  ActionPose,
  CardTier,
  PlayerCardTemplate,
  TeamIdentity,
} from '../types/game';
import { TIER_LABELS } from '../data/nbaData';
import { Sparkles, Flame, Shield, Zap } from 'lucide-react';

interface PlayerCardProps {
  card: PlayerCardTemplate;
  evoBonus?: number;
  quantity?: number;
  stamina?: number; // 0 to 100 in Tactical Showdowns
  onCooldown?: boolean;
  cooldownTurns?: number;
  useFranchiseJersey?: boolean;
  franchiseTeam?: TeamIdentity;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onClick?: () => void;
  actionBadge?: string;
}

const ActionSilhouetteSvg: React.FC<{ pose: ActionPose; color: string }> = ({
  pose,
  color,
}) => {
  // Subtle athletic pose silhouette in the background aura (Hint of #4)
  switch (pose) {
    case 'DUNK':
      return (
        <svg viewBox="0 0 120 140" className="w-full h-full opacity-20">
          <circle cx="78" cy="18" r="8" fill={color} />
          <circle cx="62" cy="36" r="9" fill="currentColor" />
          <path
            d="M76 24 L64 46 L45 64 L32 85 L42 90 L55 72 L68 88 L58 118 L68 122 L82 86 L74 52 L86 30 Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'FADEAWAY':
      return (
        <svg viewBox="0 0 120 140" className="w-full h-full opacity-20">
          <circle cx="72" cy="16" r="7.5" fill={color} />
          <circle cx="56" cy="34" r="9" fill="currentColor" />
          <path
            d="M68 24 L54 44 L44 74 L32 110 L43 114 L56 84 L68 112 L78 108 L65 74 L74 44 Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'RIM_GUARD':
      return (
        <svg viewBox="0 0 120 140" className="w-full h-full opacity-20">
          <circle cx="60" cy="34" r="9" fill="currentColor" />
          <path
            d="M36 14 L52 44 L48 80 L40 120 L52 122 L60 88 L68 122 L80 120 L72 80 L68 44 L84 14 L74 10 L60 38 L46 10 Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'LOCKDOWN':
      return (
        <svg viewBox="0 0 120 140" className="w-full h-full opacity-20">
          <circle cx="60" cy="42" r="9" fill="currentColor" />
          <path
            d="M18 58 L48 52 L44 82 L26 116 L38 120 L56 90 L64 90 L82 120 L94 116 L76 82 L72 52 L102 58 L104 48 L60 44 L16 48 Z"
            fill="currentColor"
          />
        </svg>
      );
    case 'SNIPER':
    case 'HANDLES':
    default:
      return (
        <svg viewBox="0 0 120 140" className="w-full h-full opacity-20">
          <circle cx="84" cy="68" r="8" fill={color} />
          <circle cx="58" cy="36" r="9" fill="currentColor" />
          <path
            d="M42 52 L58 46 L78 62 L72 70 L58 58 L52 84 L38 118 L49 122 L62 90 L74 118 L85 114 L68 80 Z"
            fill="currentColor"
          />
        </svg>
      );
  }
};

export const PlayerCard: React.FC<PlayerCardProps> = ({
  card,
  evoBonus = 0,
  quantity,
  stamina,
  onCooldown = false,
  cooldownTurns = 0,
  useFranchiseJersey = false,
  franchiseTeam,
  size = 'md',
  selected = false,
  onClick,
  actionBadge,
}) => {
  const effectiveOvr = Math.min(99, card.ovr + evoBonus);
  const effectiveOff = Math.min(99, card.stats.off + evoBonus);
  const effectivePlay = Math.min(99, card.stats.play + evoBonus);
  const effectiveDef = Math.min(99, card.stats.def + evoBonus);
  const effectiveClu = Math.min(99, card.stats.clu + evoBonus);

  const primary =
    useFranchiseJersey && franchiseTeam ? franchiseTeam.primaryColor : card.primaryColor;
  const secondary =
    useFranchiseJersey && franchiseTeam ? franchiseTeam.secondaryColor : card.secondaryColor;
  const accent =
    useFranchiseJersey && franchiseTeam ? franchiseTeam.accentColor : card.accentColor;
  const jerseyStyle =
    useFranchiseJersey && franchiseTeam ? franchiseTeam.jerseyStyle : card.jerseyStyle;
  const displayTeamAbbr =
    useFranchiseJersey && franchiseTeam ? franchiseTeam.abbreviation : card.teamAbbr;

  const getOuterFrameClass = (tier: CardTier) => {
    switch (tier) {
      case 'PRIMETIME':
        return 'card-tier-primetime p-[3px]';
      case 'LEGENDS':
        return 'card-tier-legends p-[3px]';
      case 'ELITE':
        return 'bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 p-[2.5px] shadow-lg shadow-amber-500/25';
      case 'ALL_STAR':
        return 'bg-gradient-to-br from-slate-200 via-sky-300 to-slate-500 p-[2px] shadow-md shadow-sky-500/20';
      case 'BASE':
      default:
        return 'bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 p-[1.5px] shadow';
    }
  };

  const sizeClasses = {
    sm: 'w-48',
    md: 'w-60',
    lg: 'w-72',
  }[size];

  const artHeightClasses = {
    sm: 'h-36',
    md: 'h-44',
    lg: 'h-56',
  }[size];

  const jerseySvgSize = {
    sm: 'w-24 h-28',
    md: 'w-28 h-32',
    lg: 'w-36 h-40',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl transition-all duration-200 select-none ${sizeClasses} ${getOuterFrameClass(
        card.tier
      )} ${onClick ? 'cursor-pointer hover:-translate-y-1.5' : ''} ${
        selected ? 'ring-4 ring-emerald-400 scale-[1.02]' : ''
      } ${onCooldown ? 'opacity-65 grayscale-[35%]' : ''}`}
    >
      {/* Inner Slab Container */}
      <div className="relative h-full w-full rounded-[13px] bg-slate-950 overflow-hidden flex flex-col justify-between">
        {/* Foil Overlays for Tier 4 (Legends Shiny) & Tier 5 (Primetime Rainbow) */}
        {card.tier === 'LEGENDS' && (
          <div className="
            pointer-events-none absolute inset-0 z-20 legends-foil-overlay shimmer-sweep
          " />
        )}
        {card.tier === 'PRIMETIME' && (
          <div className="
            pointer-events-none absolute inset-0 z-20 primetime-rainbow-overlay shimmer-sweep
          " />
        )}

        {/* ==================== 1. TOP GRADED SLAB HEADER (Hint of Option 5) ==================== */}
        <div className="relative z-10 flex items-center justify-between px-2.5 py-1.5 bg-slate-900/95 border-b border-slate-800">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider rounded bg-slate-800 text-slate-200 border border-slate-700">
              {card.position}
            </span>
            <span className="text-[10px] font-bold tracking-wider uppercase truncate text-slate-300">
              {card.editionTitle}
            </span>
          </div>

          {/* OVR Rating Slab Badge */}
          <div className="flex items-center gap-1 shrink-0">
            {evoBonus > 0 && (
              <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/90 border border-emerald-500/40 px-1 rounded">
                +{evoBonus}
              </span>
            )}
            <div
              className={`px-2 py-0.5 rounded-md font-sport font-extrabold text-base leading-none border flex items-center gap-1 ${TIER_LABELS[card.tier].badgeBg}`}
            >
              {card.tier === 'PRIMETIME' && <Sparkles className="w-3 h-3" />}
              {card.tier === 'LEGENDS' && <Flame className="w-3 h-3" />}
              <span>{effectiveOvr}</span>
            </div>
          </div>
        </div>

        {/* ==================== 2. CENTERPIECE WINDOW: JERSEY (#1) + AURA (#4) ==================== */}
        <div
          className={`relative ${artHeightClasses} w-full overflow-hidden flex items-center justify-center`}
          style={{
            background: `radial-gradient(circle at 50% 42%, ${primary}55 0%, ${secondary}33 48%, #020617 95%)`,
          }}
        >
          {/* Arena Spotlight Beams */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                'conic-gradient(from 180deg at 50% -10%, transparent 140deg, rgba(255,255,255,0.22) 175deg, transparent 210deg)',
            }}
          />

          {/* Giant Background Jersey Number Watermark (Hint of Option 4) */}
          <div
            className="absolute -right-1 -bottom-3 font-display font-bold leading-none select-none pointer-events-none opacity-15"
            style={{
              fontSize: size === 'lg' ? '7.5rem' : size === 'md' ? '6rem' : '4.8rem',
              color: secondary,
            }}
          >
            #{card.jerseyNumber}
          </div>

          {/* Subtle High-Contrast Action Silhouette in Background (Hint of Option 4) */}
          <div className="absolute inset-0 flex items-center justify-center text-white pointer-events-none scale-110">
            <ActionSilhouetteSvg pose={card.pose} color={secondary} />
          </div>

          {/* Team & Universe Floating Corner Tags */}
          <div className="absolute top-2 left-2.5 z-10 flex flex-col gap-1">
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-widest uppercase border shadow-sm"
              style={{
                backgroundColor: `${primary}DD`,
                borderColor: secondary,
                color: '#FFFFFF',
              }}
            >
              {displayTeamAbbr}
            </span>
            {card.isFictional && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-fuchsia-950/90 text-fuchsia-300 border border-fuchsia-500/40">
                FANTASY
              </span>
            )}
          </div>

          {/* Quantity or Action Pill in Top-Right */}
          {(quantity && quantity > 1) || actionBadge ? (
            <div className="absolute top-2 right-2.5 z-10 flex flex-col items-end gap-1">
              {quantity && quantity > 1 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 shadow">
                  ×{quantity} OWNED
                </span>
              )}
              {actionBadge && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-500 text-slate-950 shadow">
                  {actionBadge}
                </span>
              )}
            </div>
          ) : null}

          {/* ==================== ICONIC BASKETBALL JERSEY SVG (Mostly Option 1) ==================== */}
          <div className={`relative z-10 ${jerseySvgSize} drop-shadow-[0_10px_16px_rgba(0,0,0,0.75)] transition-transform duration-300 group-hover:scale-105`}>
            <svg viewBox="0 0 120 140" className="w-full h-full">
              <defs>
                <pattern
                  id={`pinstripe-${card.id}-${useFranchiseJersey ? 'f' : 'o'}`}
                  width="8"
                  height="8"
                  patternUnits="userSpaceOnUse"
                >
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="8"
                    stroke={secondary}
                    strokeWidth="1.4"
                    strokeOpacity="0.45"
                  />
                </pattern>
                <linearGradient
                  id={`jersey-grad-${card.id}-${useFranchiseJersey ? 'f' : 'o'}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={primary} />
                  <stop offset="100%" stopColor={primary} stopOpacity="0.86" />
                </linearGradient>
              </defs>

              {/* Main Basketball Tank Silhouette */}
              <path
                d="M 32 10 L 45 10 C 48 22, 72 22, 75 10 L 88 10 L 94 34 C 82 40, 82 54, 96 60 L 96 126 C 96 130, 92 132, 88 132 L 32 132 C 28 132, 24 130, 24 126 L 24 60 C 38 54, 38 40, 26 34 Z"
                fill={`url(#jersey-grad-${card.id}-${useFranchiseJersey ? 'f' : 'o'})`}
                stroke={secondary}
                strokeWidth="2.5"
              />

              {/* Optional Jersey Pattern Overlay */}
              {jerseyStyle === 'PINSTRIPE' && (
                <path
                  d="M 32 10 L 45 10 C 48 22, 72 22, 75 10 L 88 10 L 94 34 C 82 40, 82 54, 96 60 L 96 126 L 24 126 L 24 60 C 38 54, 38 40, 26 34 Z"
                  fill={`url(#pinstripe-${card.id}-${useFranchiseJersey ? 'f' : 'o'})`}
                />
              )}

              {jerseyStyle === 'CHEVRON' && (
                <path
                  d="M 25 66 L 60 82 L 95 66 L 95 76 L 60 92 L 25 76 Z"
                  fill={secondary}
                  fillOpacity="0.32"
                />
              )}

              {jerseyStyle === 'RETRO_BAND' && (
                <rect
                  x="25"
                  y="68"
                  width="70"
                  height="14"
                  fill={secondary}
                  fillOpacity="0.32"
                />
              )}

              {/* Side Panels */}
              <path d="M 24 60 L 30 60 L 30 131 L 24 131 Z" fill={secondary} fillOpacity="0.75" />
              <path d="M 90 60 L 96 60 L 96 131 L 90 131 Z" fill={secondary} fillOpacity="0.75" />

              {/* V-Neck & Armhole Ribbed Trim */}
              <path
                d="M 43 10 C 47 25, 73 25, 77 10"
                fill="none"
                stroke={secondary}
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M 45 10 C 48 22, 72 22, 75 10"
                fill="none"
                stroke={accent}
                strokeWidth="1.5"
              />

              {/* Player Last Name on Jersey Chest */}
              <text
                x="60"
                y="45"
                textAnchor="middle"
                fill="#FFFFFF"
                stroke="#020617"
                strokeWidth="0.8"
                fontSize={card.lastName.length > 10 ? '9.5' : '11.5'}
                fontWeight="800"
                fontFamily="'Chakra Petch', sans-serif"
                letterSpacing="1"
              >
                {card.lastName.toUpperCase().slice(0, 12)}
              </text>

              {/* Signature Jersey Number */}
              <text
                x="60"
                y="96"
                textAnchor="middle"
                fill="#FFFFFF"
                stroke={secondary}
                strokeWidth="2.2"
                fontSize="44"
                fontWeight="700"
                fontFamily="'Teko', sans-serif"
              >
                {card.jerseyNumber}
              </text>

              {/* Authentic Jock Tag at Bottom Left Hem */}
              <rect
                x="33"
                y="114"
                width="16"
                height="9"
                rx="1.5"
                fill="#020617"
                stroke={secondary}
                strokeWidth="0.9"
              />
              <text
                x="41"
                y="120.5"
                textAnchor="middle"
                fill={secondary}
                fontSize="5.5"
                fontWeight="700"
              >
                #{card.jerseyNumber}
              </text>
            </svg>
          </div>

          {/* Cooldown / Stamina Overlay in Tactical Showdown */}
          {onCooldown && (
            <div className="absolute inset-0 z-30 bg-slate-950/75 backdrop-blur-[1px] flex flex-col items-center justify-center p-2 text-center">
              <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-extrabold text-xs tracking-wider uppercase shadow-lg">
                COOLDOWN: {cooldownTurns > 0 ? `${cooldownTurns} PLAY${cooldownTurns > 1 ? 'S' : ''}` : 'RESTING'}
              </span>
              <span className="text-[10px] font-bold text-amber-200 mt-1">
                Higher Tier = Longer Rest
              </span>
            </div>
          )}
        </div>

        {/* ==================== 3. BOTTOM PLAYER NAME & 4-STAT SLAB (Hint of Option 5) ==================== */}
        <div className="relative z-10 px-3 py-2 bg-slate-950 border-t border-slate-800/90">
          {/* Name & Archetype */}
          <div className="flex items-baseline justify-between gap-1 mb-1.5">
            <h3 className="font-sport font-bold text-sm text-white truncate">
              {card.firstName} <span className="font-extrabold">{card.lastName}</span>
            </h3>
            <span className="text-[10px] font-semibold text-amber-400 shrink-0">
              #{card.jerseyNumber}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 truncate mb-2">{card.eraOrArchetype}</p>

          {/* Optional Stamina Bar during Tactical Showdowns */}
          {typeof stamina === 'number' && (
            <div className="mb-2">
              <div className="flex justify-between text-[10px] font-bold mb-0.5">
                <span className="text-slate-400 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-amber-400" /> STAMINA
                </span>
                <span
                  className={
                    stamina >= 70
                      ? 'text-emerald-400'
                      : stamina >= 40
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }
                >
                  {stamina}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    stamina >= 70
                      ? 'bg-emerald-400'
                      : stamina >= 40
                      ? 'bg-amber-400'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${stamina}%` }}
                />
              </div>
            </div>
          )}

          {/* 4 Sub-Stats Slab Grid */}
          <div className="grid grid-cols-4 gap-1 pt-1.5 border-t border-slate-800/80 text-center">
            <div className="bg-slate-900/90 rounded py-1 px-0.5 border border-slate-800">
              <div className="text-[9px] font-bold text-slate-400">OFF</div>
              <div className="font-sport font-bold text-xs text-rose-400">{effectiveOff}</div>
            </div>
            <div className="bg-slate-900/90 rounded py-1 px-0.5 border border-slate-800">
              <div className="text-[9px] font-bold text-slate-400">PLAY</div>
              <div className="font-sport font-bold text-xs text-sky-400">{effectivePlay}</div>
            </div>
            <div className="bg-slate-900/90 rounded py-1 px-0.5 border border-slate-800">
              <div className="text-[9px] font-bold text-slate-400">DEF</div>
              <div className="font-sport font-bold text-xs text-emerald-400">{effectiveDef}</div>
            </div>
            <div className="bg-slate-900/90 rounded py-1 px-0.5 border border-slate-800">
              <div className="text-[9px] font-bold text-slate-400">CLU</div>
              <div className="font-sport font-bold text-xs text-amber-400">{effectiveClu}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
