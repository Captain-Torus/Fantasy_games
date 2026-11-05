# Primetime Dynasty — Multi-Sport Ultimate Franchise & Card Game

A clean, strategic sports card-collecting, pack-opening, tactical showdown, and franchise draft/trade game built with React, TypeScript, Vite, and Tailwind CSS.

## Quick Start

```bash
npm install
npm run dev
```

---

## Core Features

1. **Hybrid Card Visual Engine (`PlayerCard.tsx`)**
   - **Iconic Jersey & Number Centerpiece:** Custom-rendered SVG basketball jersey dynamically colored to match the player's team or your custom franchise, featuring pattern styles (*Classic*, *Pinstripe*, *Chevron*, *Retro Band*), player last name, and signature number (`#23`, `#30`, `#0`).
   - **Background Action Aura:** Stadium spotlight beams, giant watermark jersey number, and high-contrast athletic action silhouette.
   - **5 Rarity & Shader Tiers:**
     - **Base Series (70–84 OVR)** — Clean matte finish
     - **All-Star (85–91 OVR)** — Metallic silver frame
     - **Franchise Elite (92–94 OVR)** — Gold foil border
     - **Legends (95–97 OVR)** — Animated **Shiny Holographic** foil sweep
     - **Primetime (98–99 OVR)** — Animated **Prismatic Rainbow** shader

2. **Franchise, Sport & Universe Studio (`TeamCreatorModal.tsx`)**
   - Choose between **Real NBA Franchises** (e.g., *Atlanta Hawks*, *Chicago Bulls*, *Lakers*, *Celtics*) or create a **Custom Franchise** (e.g., *Arizona Angels*).
   - Toggle between **Realistic** (real active & historical NBA stars, max 1 edition of the same athlete in your starting lineup), **Fantastical** (fictional legends like *Blaze Vance #0* and *Atlas Sterling #77*), or **Crossover**.

3. **Mode A: Pack Collector & Tactical Card Showdowns (`TacticalShowdownView.tsx`)**
   - Rip packs with interactive card-flip reveals, quick-sell duplicates for Coins, or combine 3 copies for a permanent `+1 OVR` Evolution boost.
   - Play 4-quarter (8-play) **Tactical Card Showdowns** against tiered CPU bosses with a **Stamina & 1-Play Rest Cooldown** system.

4. **Mode B: Standalone Draft, Trade & Sell Franchise GM Mode (`DraftFranchiseView.tsx`)**
   - Complete a 6-round snake draft against 7 CPU franchises, negotiate player + cash trades in the CPU Trade Center, sell/waive players for cap cash, sign free agents, and simulate league series.

5. **Detailed Dual Leaderboards & Full-Screen Card Showcase (`LeaderboardShowcaseView.tsx` & `CardInspectModal.tsx`)**
   - Track League Leaders (`OVR`, `PPG`, `RPG`, `APG`, `Clutch Win %`) and Franchise Team Standings.
   - Click any player or card anywhere in the game to launch the full-screen Card Inspector and compare all editions of that athlete side-by-side.
