import { QUALIFICATION_RULES, ZONES, EPS_FLAGS } from '../config/qualificationRules.js';
import { CUP_WINNERS, TITLE_HOLDERS } from '../config/cupWinners.js';

const EUROPEAN_ZONES = new Set([
  ZONES.UCL_LEAGUE,
  ZONES.UCL_QUALIFYING,
  ZONES.UEL_LEAGUE,
  ZONES.UEL_QUALIFYING,
  ZONES.UECL_QUALIFYING,
]);

const RELEGATION_ZONES = new Set([
  ZONES.RELEGATED,
  ZONES.RELEGATION_PLAYOFF,
]);

// Football-data.org returns full club names like "Manchester City FC" or
// "Real Madrid CF" while cupWinners.js / TITLE_HOLDERS use short forms
// ("Manchester City"). Normalize both sides for matching only — display
// names in the table stay as-is.
function normalizeTeamName(name) {
  if (!name) return '';
  return String(name)
    .toLowerCase()
    // Spanish / Portuguese / French descriptors
    .replace(/\b(club de )?(f[uú]tbol|football)\b/g, '')
    .replace(/\bde\b(?=\s|$)/g, '') // standalone "de"
    // English / German / Italian club-type prefixes
    .replace(/^(fc|sc|sk|sv|ac|as|us|vfb|vfl|tsg)\s+/, '')
    // Trailing / internal club-type abbreviations
    .replace(/\s+(fc|cf|afc|sc|sk|cp|cd)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Tier ordering — lower = more prestigious. Used by the cup cascade to
// decide where an extra slot is inserted and how the chain shifts.
// Sentinel values: 99 = no European zone, 100 = relegation.
const ZONE_TIER = {
  [ZONES.UCL_LEAGUE]: 1,
  [ZONES.UCL_QUALIFYING]: 2,
  [ZONES.UEL_LEAGUE]: 3,
  [ZONES.UEL_QUALIFYING]: 4,
  [ZONES.UECL_QUALIFYING]: 5,
  [ZONES.NONE]: 99,
  [ZONES.RELEGATION_PLAYOFF]: 100,
  [ZONES.RELEGATED]: 100,
};
const tierOf = (z) => ZONE_TIER[z] ?? 99;

// Badge type constants — exported so the row component can branch if needed.
export const BADGE_TYPE = {
  UCL_TITLE: 'UCL_TITLE',
  UEL_TITLE: 'UEL_TITLE',
  CUP: 'CUP',
};

// Per-badge-type styling. Cup tooltip is dynamic (cup name), so it's filled in
// at use site.
const BADGE_PRESET = {
  [BADGE_TYPE.UCL_TITLE]: { color: '#d4a857', tooltip: 'Champions League Winner' },
  [BADGE_TYPE.UEL_TITLE]: { color: '#9d5cf6', tooltip: 'Europa League Winner' },
  [BADGE_TYPE.CUP]:       { color: '#d97706' /* tooltip filled in at use */ },
};

// Returns the same teams array with `zone`, `badges`, `cascadeNote`,
// `isCupWinner`, `isChampion`, `isRelegated` populated.
//
// Resolution order:
//   1. Base position → zone map (with EPS bonus override).
//   2. UCL title holder: badge + cascade if applicable. Target zone = UCL League Phase.
//   3. UEL title holder: badge + cascade if applicable. Target zone = UCL League Phase.
//      (UEL holders earn a UCL spot by UEFA rules.)
//   4. Domestic cup winner: badge + cascade if applicable. Target = config's earnedCompetition.
//
// Cascade rule for any competition winner:
//   - If winner is already in a European qualification zone, leave their zone
//     alone and shift the earned spot down to the first team currently in
//     ZONES.NONE (skipping relegation zones, which can't happen since NONE
//     and relegation are mutually exclusive).
//   - If winner is NOT in a European zone (and not in a relegation zone),
//     upgrade their zone to the earned target.
//   - Cup winner is null OR qualified=false: no badge, no cascade — normal zones.
export function resolveQualificationZones(leagueId, teams, options = {}) {
  if (!teams) return teams;
  const rules = QUALIFICATION_RULES[leagueId];
  // Leagues without an explicit qualification config (anything outside the top
  // 5 today) still need the standard fields so TeamRow / HoverCard can render
  // them — just no zone colors and no cascade.
  if (!rules) {
    return teams.map((t) => ({
      ...t,
      zone: ZONES.NONE,
      badges: [],
      cascadeNote: null,
      isChampion: !!t.isChampion,
      isRelegated: !!t.isRelegated,
      isCupWinner: false,
    }));
  }

  // 1. Base + EPS
  const zoneMap = { ...rules.base };
  if (EPS_FLAGS[leagueId] && rules.eps?.epsBonus) {
    Object.assign(zoneMap, rules.eps.epsBonus);
  }

  let resolved = teams.map((t) => ({
    ...t,
    zone: zoneMap[t.rank] || ZONES.NONE,
    badges: [],
    cascadeNote: null,
  }));

  const titles = options.titleHolders ?? TITLE_HOLDERS;

  // 2. UCL title holder — invitational UCL berth, does NOT consume a domestic
  // slot, so no league-mate cascade. Just attach the badge (and upgrade the
  // holder to UCL_LEAGUE if they didn't already qualify via league).
  if (titles.ucl?.teamName && titles.ucl.qualified && titles.ucl.leagueId === leagueId) {
    applyCompetitionWinner(resolved, {
      winnerName: titles.ucl.teamName,
      targetZone: ZONES.UCL_LEAGUE,
      badge: {
        type: BADGE_TYPE.UCL_TITLE,
        ...BADGE_PRESET[BADGE_TYPE.UCL_TITLE],
        competitionName: 'Champions League',
      },
      cascade: false,
    });
  }

  // 3. UEL title holder — same: invitational UCL berth, no cascade.
  if (titles.uel?.teamName && titles.uel.qualified && titles.uel.leagueId === leagueId) {
    applyCompetitionWinner(resolved, {
      winnerName: titles.uel.teamName,
      targetZone: ZONES.UCL_LEAGUE,
      badge: {
        type: BADGE_TYPE.UEL_TITLE,
        ...BADGE_PRESET[BADGE_TYPE.UEL_TITLE],
        competitionName: 'Europa League',
      },
      cascade: false,
    });
  }

  // 4. Domestic cup — counts toward the league's allocation, so cascade applies
  // when the winner already qualified via league position.
  const cup = options.cupWinner ?? CUP_WINNERS[leagueId];
  if (cup?.teamName && cup.qualified) {
    applyCompetitionWinner(resolved, {
      winnerName: cup.teamName,
      targetZone: cup.earnedCompetition,
      badge: {
        type: BADGE_TYPE.CUP,
        color: BADGE_PRESET[BADGE_TYPE.CUP].color,
        tooltip: `${cup.cupName} Winner`,
        competitionName: cup.cupName,
      },
      cascade: true,
      cascadeReason: `${cup.cupName} winner ${cup.teamName} already qualified via league position`,
    });
  }

  // Surface convenience flags that other components rely on.
  resolved = resolved.map((t) => ({
    ...t,
    isChampion: !!t.isChampion,
    isRelegated: !!t.isRelegated || t.zone === ZONES.RELEGATED,
    isCupWinner: t.badges.some((b) => b.type === BADGE_TYPE.CUP),
  }));

  return resolved;
}

// Mutates `resolved`. Always attaches the badge.
//
// `cascade: false` (UCL/UEL title) — invitational berth, doesn't consume a
// domestic slot. Just upgrade the holder's zone if they're not already in
// Europe; never touch league-mates.
//
// `cascade: true` (domestic cup) — uses applyCupCascade below: a proper
// shift-chain that mirrors the real-life FA Cup / Copa del Rey behavior.
// Each affected position takes the zone of the position above it, until the
// chain naturally terminates.
function applyCompetitionWinner(resolved, { winnerName, targetZone, badge, cascade, cascadeReason }) {
  const target = normalizeTeamName(winnerName);
  const winner = resolved.find((t) => normalizeTeamName(t.name) === target);
  if (!winner) return;
  winner.badges.push(badge);

  // Always set targetZone on the badge so the hover card can describe what
  // the trophy earns. cascadeTo / winnerOriginalZone are filled below when
  // case A (cascade) actually fires.
  badge.targetZone = targetZone;

  if (!cascade) {
    if (!EUROPEAN_ZONES.has(winner.zone) && !RELEGATION_ZONES.has(winner.zone)) {
      winner.zone = targetZone;
    }
    return;
  }

  const result = applyCupCascade(resolved, winner, targetZone, cascadeReason);
  if (result) {
    badge.case = result.case;
    badge.cascadeTo = result.cascadeTo ?? null;
    badge.winnerOriginalZone = result.winnerOriginalZone ?? null;
  }
}

// Cup cascade — three cases based on where the winner sits relative to the
// cup's earned tier:
//
//   A. Winner is at-or-above the cup tier (e.g. cup grants UEL, winner is in
//      UCL): the cup adds a slot at the end of the cup-tier block. The first
//      position currently below the cup tier inherits that cup-tier zone, and
//      every subsequent position shifts one zone downward through the chain
//      until the chain terminates (a position's old zone equals the zone
//      being passed to it, or we hit relegation / end of table).
//
//   B. Winner is below the cup tier but in a European zone (e.g. cup grants
//      UEL, winner is in UECL): the winner upgrades to the cup tier; their
//      old zone cascades down from the position immediately below them.
//
//   C. Winner is in NONE / relegation: just upgrade the winner directly. No
//      chain — no position above them held the cup tier to be displaced.
function applyCupCascade(resolved, winner, cupTarget, reason) {
  const sorted = [...resolved].sort((a, b) => a.rank - b.rank);
  const winnerTier = tierOf(winner.zone);
  const cupTier = tierOf(cupTarget);

  if (winnerTier >= 100) return null; // Relegated winner — skip.

  if (winnerTier <= cupTier) {
    // Case A — find the first position below the cup tier (and above
    // relegation), which is where the cup's added slot lands.
    let insertIdx = -1;
    for (let i = 0; i < sorted.length; i++) {
      const t = tierOf(sorted[i].zone);
      if (t >= 100) return null;
      if (t > cupTier) { insertIdx = i; break; }
    }
    if (insertIdx === -1) return null;
    const cascadeTo = sorted[insertIdx].name;
    const winnerOriginalZone = winner.zone;
    cascadeChain(sorted, insertIdx, cupTarget, reason);
    return { case: 'A', cascadeTo, winnerOriginalZone };
  }

  // Cases B/C — winner upgrades.
  const oldZone = winner.zone;
  winner.zone = cupTarget;
  if (EUROPEAN_ZONES.has(oldZone)) {
    // Case B — old European zone cascades to teams below the winner.
    const winnerIdx = sorted.findIndex((t) => t === winner);
    const cascadeTo = sorted[winnerIdx + 1]?.name ?? null;
    cascadeChain(sorted, winnerIdx + 1, oldZone, reason);
    return { case: 'B', cascadeTo, winnerOriginalZone: oldZone };
  }
  return { case: 'C', cascadeTo: null, winnerOriginalZone: oldZone };
}

// Walks down `sorted` starting at `startIdx`, assigning the zone being
// passed in (`incoming`) to each position and bubbling that position's old
// zone down to the next. Terminates when the next position would have
// received the same zone it already had (no-op) or when we hit relegation.
function cascadeChain(sorted, startIdx, incoming, reason) {
  let pending = incoming;
  for (let i = startIdx; i < sorted.length; i++) {
    const t = sorted[i];
    if (tierOf(t.zone) >= 100) break; // never push into relegation rows
    if (t.zone === pending) break; // chain has nothing to do — terminate
    const displaced = t.zone;
    t.zone = pending;
    t.cascadeNote = reason;
    pending = displaced;
  }
}

// Backward-compat alias for the original name used by useStandings.
export const resolveZones = resolveQualificationZones;

// Computes "games in hand" relative to the team directly above. Unchanged.
export function annotateGamesInHand(teams) {
  return teams.map((t, i) => {
    if (i === 0) return { ...t, gamesInHand: 0 };
    const above = teams[i - 1];
    const gih = Math.max(0, above.played - t.played);
    return { ...t, gamesInHand: gih };
  });
}
