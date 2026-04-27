import { describe, expect, it } from 'vitest';
import { ZONES } from '../config/qualificationRules.js';
import { BADGE_TYPE, resolveQualificationZones } from './resolveZones.js';

const noTitleHolders = {
  ucl: { teamName: null, leagueId: null, qualified: false },
  uel: { teamName: null, leagueId: null, qualified: false },
};

function teams(count = 20) {
  return Array.from({ length: count }, (_, i) => ({
    rank: i + 1,
    name: `Team ${i + 1}`,
    played: 30,
    points: 60 - i,
  }));
}

function byRank(resolved, rank) {
  return resolved.find((team) => team.rank === rank);
}

describe('resolveQualificationZones', () => {
  it('applies base league qualification and relegation zones', () => {
    const resolved = resolveQualificationZones('EPL', teams(), {
      titleHolders: noTitleHolders,
      cupWinner: null,
    });

    expect(byRank(resolved, 1).zone).toBe(ZONES.UCL_LEAGUE);
    expect(byRank(resolved, 5).zone).toBe(ZONES.UCL_QUALIFYING);
    expect(byRank(resolved, 6).zone).toBe(ZONES.UEL_LEAGUE);
    expect(byRank(resolved, 7).zone).toBe(ZONES.UECL_QUALIFYING);
    expect(byRank(resolved, 18).zone).toBe(ZONES.RELEGATION_PLAYOFF);
    expect(byRank(resolved, 19).zone).toBe(ZONES.RELEGATED);
  });

  it('cascades a domestic cup place when the winner already qualified in Europe', () => {
    const resolved = resolveQualificationZones('EPL', teams(), {
      titleHolders: noTitleHolders,
      cupWinner: {
        cupName: 'FA Cup',
        teamName: 'Team 2',
        qualified: true,
        earnedCompetition: ZONES.UEL_LEAGUE,
      },
    });

    expect(byRank(resolved, 2).badges[0].type).toBe(BADGE_TYPE.CUP);
    expect(byRank(resolved, 2).badges[0].case).toBe('A');
    expect(byRank(resolved, 7).zone).toBe(ZONES.UEL_LEAGUE);
    expect(byRank(resolved, 8).zone).toBe(ZONES.UECL_QUALIFYING);
    expect(byRank(resolved, 8).cascadeNote).toContain('FA Cup winner Team 2');
  });

  it('upgrades a domestic cup winner outside Europe without moving other teams', () => {
    const resolved = resolveQualificationZones('EPL', teams(), {
      titleHolders: noTitleHolders,
      cupWinner: {
        cupName: 'FA Cup',
        teamName: 'Team 10',
        qualified: true,
        earnedCompetition: ZONES.UEL_LEAGUE,
      },
    });

    expect(byRank(resolved, 10).zone).toBe(ZONES.UEL_LEAGUE);
    expect(byRank(resolved, 10).badges[0].case).toBe('C');
    expect(byRank(resolved, 7).zone).toBe(ZONES.UECL_QUALIFYING);
    expect(byRank(resolved, 8).zone).toBe(ZONES.NONE);
  });

  it('upgrades title holders without cascading a domestic place', () => {
    const resolved = resolveQualificationZones('EPL', teams(), {
      titleHolders: {
        ...noTitleHolders,
        ucl: { teamName: 'Team 10', leagueId: 'EPL', qualified: true },
      },
      cupWinner: null,
    });

    expect(byRank(resolved, 10).zone).toBe(ZONES.UCL_LEAGUE);
    expect(byRank(resolved, 10).badges[0].type).toBe(BADGE_TYPE.UCL_TITLE);
    expect(byRank(resolved, 7).zone).toBe(ZONES.UECL_QUALIFYING);
    expect(byRank(resolved, 8).zone).toBe(ZONES.NONE);
  });

  it('returns unqualified teams for leagues without rules', () => {
    const resolved = resolveQualificationZones('MLS', teams(2));

    expect(resolved).toEqual([
      expect.objectContaining({ zone: ZONES.NONE, badges: [], isCupWinner: false }),
      expect.objectContaining({ zone: ZONES.NONE, badges: [], isCupWinner: false }),
    ]);
  });
});
