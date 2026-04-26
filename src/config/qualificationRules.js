// Zone keys used everywhere downstream (resolveZones, theme colors, hover card).
export const ZONES = {
  UCL_LEAGUE: 'UCL_LEAGUE',
  UCL_QUALIFYING: 'UCL_QUALIFYING',
  UEL_LEAGUE: 'UEL_LEAGUE',
  UEL_QUALIFYING: 'UEL_QUALIFYING',
  UECL_QUALIFYING: 'UECL_QUALIFYING',
  RELEGATION_PLAYOFF: 'RELEGATION_PLAYOFF',
  RELEGATED: 'RELEGATED',
  NONE: 'NONE',
};

export const ZONE_LABELS = {
  [ZONES.UCL_LEAGUE]: 'Champions League — League Phase',
  [ZONES.UCL_QUALIFYING]: 'Champions League — Qualifying',
  [ZONES.UEL_LEAGUE]: 'Europa League — League Phase',
  [ZONES.UEL_QUALIFYING]: 'Europa League — Qualifying',
  [ZONES.UECL_QUALIFYING]: 'Conference League — Qualifying',
  [ZONES.RELEGATION_PLAYOFF]: 'Relegation Playoff',
  [ZONES.RELEGATED]: 'Relegated',
  [ZONES.NONE]: '',
};

export const ZONE_SHORT_LABELS = {
  [ZONES.UCL_LEAGUE]: 'UCL',
  [ZONES.UCL_QUALIFYING]: 'UCL Q',
  [ZONES.UEL_LEAGUE]: 'UEL',
  [ZONES.UEL_QUALIFYING]: 'UEL Q',
  [ZONES.UECL_QUALIFYING]: 'UECL',
  [ZONES.RELEGATION_PLAYOFF]: 'Playoff',
  [ZONES.RELEGATED]: 'Rel',
};

// Per-league position → zone mapping. Position is 1-indexed.
// EPS (European Performance Spot) extras are encoded as conditional zones
// applied dynamically in resolveZones based on the eps flag.
export const QUALIFICATION_RULES = {
  EPL: {
    base: {
      1: ZONES.UCL_LEAGUE,
      2: ZONES.UCL_LEAGUE,
      3: ZONES.UCL_LEAGUE,
      4: ZONES.UCL_LEAGUE,
      // Position 5 is EPS-conditional — see eps.epsBonus below.
      5: ZONES.UEL_LEAGUE,
      6: ZONES.UEL_LEAGUE,
      7: ZONES.UECL_QUALIFYING,
      18: ZONES.RELEGATION_PLAYOFF,
      19: ZONES.RELEGATED,
      20: ZONES.RELEGATED,
    },
    eps: {
      // If England earns an EPS slot, position 5 becomes UCL_QUALIFYING and
      // position 6 stays UEL_LEAGUE (effectively shifts UEL down a slot).
      epsBonus: { 5: ZONES.UCL_QUALIFYING },
    },
  },
  LAL: {
    base: {
      1: ZONES.UCL_LEAGUE,
      2: ZONES.UCL_LEAGUE,
      3: ZONES.UCL_LEAGUE,
      4: ZONES.UCL_LEAGUE,
      5: ZONES.UEL_LEAGUE,
      6: ZONES.UEL_QUALIFYING,
      7: ZONES.UECL_QUALIFYING,
      18: ZONES.RELEGATED,
      19: ZONES.RELEGATED,
      20: ZONES.RELEGATED,
    },
  },
  BUN: {
    base: {
      1: ZONES.UCL_LEAGUE,
      2: ZONES.UCL_LEAGUE,
      3: ZONES.UCL_LEAGUE,
      4: ZONES.UCL_LEAGUE,
      5: ZONES.UEL_LEAGUE,
      6: ZONES.UEL_QUALIFYING,
      7: ZONES.UECL_QUALIFYING,
      16: ZONES.RELEGATION_PLAYOFF,
      17: ZONES.RELEGATED,
      18: ZONES.RELEGATED,
    },
  },
  SEA: {
    base: {
      1: ZONES.UCL_LEAGUE,
      2: ZONES.UCL_LEAGUE,
      3: ZONES.UCL_LEAGUE,
      4: ZONES.UCL_LEAGUE,
      5: ZONES.UEL_LEAGUE,
      6: ZONES.UEL_QUALIFYING,
      7: ZONES.UECL_QUALIFYING,
      18: ZONES.RELEGATION_PLAYOFF,
      19: ZONES.RELEGATED,
      20: ZONES.RELEGATED,
    },
  },
  LI1: {
    base: {
      1: ZONES.UCL_LEAGUE,
      2: ZONES.UCL_LEAGUE,
      3: ZONES.UCL_LEAGUE,
      4: ZONES.UCL_QUALIFYING,
      5: ZONES.UEL_LEAGUE,
      6: ZONES.UECL_QUALIFYING,
      16: ZONES.RELEGATION_PLAYOFF,
      17: ZONES.RELEGATED,
      18: ZONES.RELEGATED,
    },
  },
};

// Per-season EPS flags (which leagues hold a European Performance Spot bonus).
// Adjust each summer based on UEFA coefficient ranking from the prior season.
export const EPS_FLAGS = {
  EPL: true,
  LAL: false,
  BUN: false,
  SEA: false,
  LI1: false,
};
