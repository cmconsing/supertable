// Top 5 leagues, ordered by current UEFA coefficient rank.
// API IDs are from API-Football (api-sports.io) /v3/leagues.
export const LEAGUES = [
  {
    id: 'EPL',
    footballDataCode: 'PL',
    name: 'Premier League',
    country: 'England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    uefaRank: 1,
    teamCount: 20,
    totalMatchdays: 38,
  },
  {
    id: 'LAL',
    footballDataCode: 'PD',
    name: 'La Liga',
    country: 'Spain',
    flag: '🇪🇸',
    uefaRank: 2,
    teamCount: 20,
    totalMatchdays: 38,
  },
  {
    id: 'BUN',
    footballDataCode: 'BL1',
    name: 'Bundesliga',
    country: 'Germany',
    flag: '🇩🇪',
    uefaRank: 3,
    teamCount: 18,
    totalMatchdays: 34,
  },
  {
    id: 'SEA',
    footballDataCode: 'SA',
    name: 'Serie A',
    country: 'Italy',
    flag: '🇮🇹',
    uefaRank: 4,
    teamCount: 20,
    totalMatchdays: 38,
  },
  {
    id: 'LI1',
    footballDataCode: 'FL1',
    name: 'Ligue 1',
    country: 'France',
    flag: '🇫🇷',
    uefaRank: 5,
    teamCount: 18,
    totalMatchdays: 34,
  },
];

// SEASON / SEASON_LABEL — football-data.org defaults to the current season,
// so SEASON itself is no longer passed in API requests. Both are kept as
// static display strings; bump them each August.
export const SEASON = 2025;
export const SEASON_LABEL = '2025-26';

export const getLeague = (id) => LEAGUES.find((l) => l.id === id);
