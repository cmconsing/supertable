import { LEAGUES } from '../config/leagues.js';
import { EPS_FLAGS } from '../config/qualificationRules.js';
import { ordinal } from '../utils/formatters.js';

// Total UCL league phase spots = 36 (UEFA format).
const UCL_TOTAL_SPOTS = 36;

// A team is "qualified" (mathematically clinched) if its lead over the
// first team currently outside UCL positions is greater than the maximum
// points still available to that chaser.
function isClinched(team, leagueTeams, totalMatchdays, uclSpots) {
  const chaser = leagueTeams.find((t) => t.rank === uclSpots + 1);
  if (!chaser) return false;
  const chaserMaxRemaining = (totalMatchdays - chaser.played) * 3;
  const lead = team.points - chaser.points;
  return lead > chaserMaxRemaining;
}

// Number of UCL league phase spots a league earns this season.
function uclSpotsForLeague(leagueId) {
  // Ligue 1 has 3 + 1 qualifying = 3 league-phase spots; the UCL_QUALIFYING
  // entry isn't a guaranteed slot. Other top 4 leagues get 4 league-phase
  // spots, plus +1 if EPS.
  if (leagueId === 'LI1') return 3;
  return 4 + (EPS_FLAGS[leagueId] ? 1 : 0);
}

export default function UclRace({ standings }) {
  const qualified = [];
  const bubble = [];
  const chasing = [];

  for (const league of LEAGUES) {
    const block = standings[league.id];
    if (!block) continue;
    const spots = uclSpotsForLeague(league.id);
    const uclTeams = block.teams.filter((t) => t.rank <= spots);

    for (const team of uclTeams) {
      const clinched = isClinched(team, block.teams, league.totalMatchdays, spots);
      const teamBelow = block.teams.find((t) => t.rank === spots + 1);
      const gap = teamBelow ? team.points - teamBelow.points : null;
      const remaining = league.totalMatchdays - team.played;
      const entry = { team, league, gap, remaining };
      if (clinched) qualified.push(entry);
      else bubble.push(entry);
    }

    // Chasers — top 3 just below the cutoff, within ~10 points.
    const cutoffPoints = uclTeams[uclTeams.length - 1]?.points ?? 0;
    const chasers = block.teams
      .filter((t) => t.rank > spots && cutoffPoints - t.points <= 10)
      .slice(0, 3);
    for (const t of chasers) {
      chasing.push({
        team: t,
        league,
        deficit: cutoffPoints - t.points,
        remaining: league.totalMatchdays - t.played,
      });
    }
  }

  const filledSpots = qualified.length + bubble.length;

  return (
    <div className="ucl-race">
      <div className="ucl-race__summary">
        <span className="ucl-race__count">
          {filledSpots} <span className="ucl-race__count-of">of {UCL_TOTAL_SPOTS}</span> league-phase spots accounted for
        </span>
        <span className="ucl-race__note">
          (top-5 leagues only — remaining {UCL_TOTAL_SPOTS - filledSpots} spots fill from other leagues, qualifiers, and title holders)
        </span>
      </div>

      <Section title="Qualified" tone="qualified" subtitle="Mathematically clinched a UCL spot">
        {qualified.length === 0 ? (
          <Empty>No teams have clinched yet.</Empty>
        ) : (
          qualified.map(({ team, league }) => (
            <UclEntry key={league.id + team.name} team={team} league={league} />
          ))
        )}
      </Section>

      <Section title="On the Bubble" tone="bubble" subtitle="In a UCL spot, not yet clinched">
        {bubble.map(({ team, league, gap, remaining }) => (
          <UclEntry key={league.id + team.name} team={team} league={league}
                    aux={`Gap +${gap} · ${remaining} GR`} />
        ))}
      </Section>

      <Section title="Chasing" tone="chasing" subtitle="Within striking distance of a UCL spot">
        {chasing.length === 0 ? (
          <Empty>No serious chasers within range.</Empty>
        ) : (
          chasing.map(({ team, league, deficit, remaining }) => (
            <UclEntry key={league.id + team.name} team={team} league={league}
                      aux={`-${deficit} pts · ${remaining} GR`} />
          ))
        )}
      </Section>

      <div className="ucl-race__context">
        <h3>European Performance Spots</h3>
        <ul className="eps-list">
          {LEAGUES.map((l) => (
            <li key={l.id} className={EPS_FLAGS[l.id] ? 'has-eps' : ''}>
              <span>{l.flag} {l.name}</span>
              <span className="eps-tag">{EPS_FLAGS[l.id] ? '+1 UCL slot' : '—'}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Section({ title, subtitle, tone, children }) {
  return (
    <section className={'ucl-section ucl-section--' + tone}>
      <header className="ucl-section__header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </header>
      <div className="ucl-section__list">{children}</div>
    </section>
  );
}

function UclEntry({ team, league, aux }) {
  return (
    <div className="ucl-entry">
      <span className="ucl-entry__flag" aria-hidden="true">{league.flag}</span>
      <span className="ucl-entry__pos">{ordinal(team.rank)}</span>
      <span className="ucl-entry__league">{league.name}</span>
      <span className="ucl-entry__team">{team.name}</span>
      <span className="ucl-entry__pts">{team.points} pts</span>
      {aux && <span className="ucl-entry__aux">{aux}</span>}
    </div>
  );
}

function Empty({ children }) {
  return <div className="ucl-empty">{children}</div>;
}
