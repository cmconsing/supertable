// Curated display-name overrides — what an English-speaking football fan
// would naturally call each club. Keyed by football-data.org's full `name`
// field so the lookup is exact.
//
// Resolution order in normalize() (footballData.js):
//   1. TEAM_NAME_OVERRIDES[fullName]   — if listed here, always wins
//   2. shortName                       — football-data's own abbreviation
//   3. name                            — last-resort full name
//
// New teams promoted into the top 5 leagues each summer should get added
// here, otherwise they'll fall through to the API's shortName (usually fine,
// occasionally weird like "Barça" or "Atleti").

export const TEAM_NAME_OVERRIDES = {
  // ===== Premier League =====
  'Arsenal FC':                      'Arsenal',
  'Aston Villa FC':                  'Aston Villa',
  'AFC Bournemouth':                 'Bournemouth',
  'Brentford FC':                    'Brentford',
  'Brighton & Hove Albion FC':       'Brighton',
  'Burnley FC':                      'Burnley',
  'Chelsea FC':                      'Chelsea',
  'Crystal Palace FC':               'Crystal Palace',
  'Everton FC':                      'Everton',
  'Fulham FC':                       'Fulham',
  'Ipswich Town FC':                 'Ipswich',
  'Leeds United FC':                 'Leeds',
  'Leicester City FC':               'Leicester',
  'Liverpool FC':                    'Liverpool',
  'Manchester City FC':              'Manchester City',
  'Manchester United FC':            'Manchester United',
  'Newcastle United FC':             'Newcastle',
  'Nottingham Forest FC':            'Nottingham Forest',
  'Southampton FC':                  'Southampton',
  'Sunderland AFC':                  'Sunderland',
  'Tottenham Hotspur FC':            'Tottenham',
  'West Ham United FC':              'West Ham',
  'Wolverhampton Wanderers FC':      'Wolves',

  // ===== La Liga =====
  'FC Barcelona':                    'Barcelona',
  'Real Madrid CF':                  'Real Madrid',
  'Club Atlético de Madrid':         'Atlético Madrid',
  'Athletic Club':                   'Athletic Club',
  'Real Sociedad de Fútbol':         'Real Sociedad',
  'Villarreal CF':                   'Villarreal',
  'Real Betis Balompié':             'Real Betis',
  'Sevilla FC':                      'Sevilla',
  'Valencia CF':                     'Valencia',
  'Getafe CF':                       'Getafe',
  'CA Osasuna':                      'Osasuna',
  'RC Celta de Vigo':                'Celta Vigo',
  'Rayo Vallecano de Madrid':        'Rayo Vallecano',
  'Girona FC':                       'Girona',
  'RCD Mallorca':                    'Mallorca',
  'RCD Espanyol de Barcelona':       'Espanyol',
  'Deportivo Alavés':                'Alavés',
  'CD Leganés':                      'Leganés',
  'UD Las Palmas':                   'Las Palmas',
  'Real Valladolid CF':              'Valladolid',
  'Levante UD':                      'Levante',
  'Elche CF':                        'Elche',
  'Real Oviedo':                     'Oviedo',

  // ===== Bundesliga =====
  'FC Bayern München':               'Bayern Munich',
  'Borussia Dortmund':               'Dortmund',
  'Bayer 04 Leverkusen':             'Leverkusen',
  'RB Leipzig':                      'RB Leipzig',
  'Eintracht Frankfurt':             'Frankfurt',
  'VfB Stuttgart':                   'Stuttgart',
  'Borussia Mönchengladbach':        'Mönchengladbach',
  'SC Freiburg':                     'Freiburg',
  'TSG 1899 Hoffenheim':             'Hoffenheim',
  '1. FC Heidenheim 1846':           'Heidenheim',
  '1. FSV Mainz 05':                 'Mainz',
  '1. FC Köln':                      'Köln',
  'VfL Wolfsburg':                   'Wolfsburg',
  'SV Werder Bremen':                'Werder Bremen',
  'FC Augsburg':                     'Augsburg',
  '1. FC Union Berlin':              'Union Berlin',
  'FC St. Pauli 1910':               'St. Pauli',
  'Hamburger SV':                    'Hamburg',
  'Holstein Kiel':                   'Holstein Kiel',
  'VfL Bochum 1848':                 'Bochum',

  // ===== Serie A =====
  'FC Internazionale Milano':        'Inter Milan',
  'AC Milan':                        'AC Milan',
  'Juventus FC':                     'Juventus',
  'SSC Napoli':                      'Napoli',
  'Atalanta BC':                     'Atalanta',
  'AS Roma':                         'Roma',
  'SS Lazio':                        'Lazio',
  'ACF Fiorentina':                  'Fiorentina',
  'Bologna FC 1909':                 'Bologna',
  'Torino FC':                       'Torino',
  'Genoa CFC':                       'Genoa',
  'Udinese Calcio':                  'Udinese',
  'Hellas Verona FC':                'Hellas Verona',
  'Cagliari Calcio':                 'Cagliari',
  'US Lecce':                        'Lecce',
  'Parma Calcio 1913':               'Parma',
  'Empoli FC':                       'Empoli',
  'Como 1907':                       'Como',
  'Venezia FC':                      'Venezia',
  'AC Monza':                        'Monza',
  'US Cremonese':                    'Cremonese',
  'US Sassuolo Calcio':              'Sassuolo',
  'AC Pisa 1909':                    'Pisa',

  // ===== Ligue 1 =====
  'Paris Saint-Germain FC':          'PSG',
  'Olympique de Marseille':          'Marseille',
  'AS Monaco FC':                    'Monaco',
  'Lille OSC':                       'Lille',
  'Olympique Lyonnais':              'Lyon',
  'OGC Nice':                        'Nice',
  'RC Strasbourg Alsace':            'Strasbourg',
  'Stade Rennais FC 1901':           'Rennes',
  'Stade Brestois 29':               'Brest',
  'Racing Club de Lens':             'Lens',
  'Toulouse FC':                     'Toulouse',
  'Stade de Reims':                  'Reims',
  'FC Nantes':                       'Nantes',
  'Le Havre AC':                     'Le Havre',
  'Angers SCO':                      'Angers',
  'Montpellier HSC':                 'Montpellier',
  'AS Saint-Étienne':                'Saint-Étienne',
  'AJ Auxerre':                      'Auxerre',
  'FC Lorient':                      'Lorient',
  'FC Metz':                         'Metz',
  'Paris FC':                        'Paris FC',
};

export function commonName(team) {
  if (!team) return 'Unknown';
  return (
    TEAM_NAME_OVERRIDES[team.name] ??
    team.shortName ??
    team.name ??
    'Unknown'
  );
}
