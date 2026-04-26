import { ZONES } from './qualificationRules.js';

// Cup winners earn a European spot. If the winner already qualified via league,
// the spot cascades to the next eligible team (handled in resolveQualificationZones).
//
// Fields:
//   cupName: display name of the competition.
//   teamName: winner — null until known.
//   qualified: true once the cup is decided AND the winner's spot is confirmed.
//     Cascade and badge are only applied when both teamName != null AND qualified == true.
//   earnedCompetition: which European zone the cup grants.
export const CUP_WINNERS = {
  EPL: {
    cupName: 'FA Cup',
    teamName: null,
    qualified: false,
    earnedCompetition: ZONES.UEL_LEAGUE,
  },
  LAL: {
    cupName: 'Copa del Rey',
    teamName: 'Real Sociedad de Fútbol',
    qualified: true,
    earnedCompetition: ZONES.UEL_LEAGUE,
  },
  BUN: {
    cupName: 'DFB-Pokal',
    teamName: null,
    qualified: false,
    earnedCompetition: ZONES.UEL_LEAGUE,
  },
  SEA: {
    cupName: 'Coppa Italia',
    teamName: null,
    qualified: false,
    earnedCompetition: ZONES.UEL_LEAGUE,
  },
  LI1: {
    cupName: 'Coupe de France',
    teamName: null,
    qualified: false,
    earnedCompetition: ZONES.UECL_QUALIFYING,
  },
};

// Defending UCL / UEL champions get an automatic UCL League Phase berth in
// the FOLLOWING season. Since the SuperTable shows the current 2025-26
// standings (which determine 2026-27 qualification), these should be the
// 2025-26 trophy winners — TBD until the finals in late May / early June.
//
// To populate after a final:
//   teamName: 'Full Club Name FC' (use the football-data.org form for live
//     parity; normalizeTeamName in resolveZones.js handles minor variants)
//   leagueId: which top-5 league they play in (EPL/LAL/BUN/SEA/LI1)
//   qualified: true
export const TITLE_HOLDERS = {
  ucl: {
    teamName: null,
    leagueId: null,
    qualified: false,
  },
  uel: {
    teamName: null,
    leagueId: null,
    qualified: false,
  },
};
