import { useStandings } from '../hooks/useStandings.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { LEAGUES } from '../config/leagues.js';
import LeagueColumn from '../components/LeagueColumn.jsx';
import SkeletonColumn from '../components/SkeletonColumn.jsx';
import StatusBar from '../components/StatusBar.jsx';
import DevPanel from '../components/DevPanel.jsx';

export default function SuperTablePage() {
  useDocumentTitle('SuperTable · Top 5 European Standings');
  const { standings, loading, refreshing, error, forceRefresh } = useStandings();
  const empty = Object.keys(standings).length === 0;

  return (
    <main className="page page--supertable">
      {empty && loading ? (
        <div className="supertable-grid">
          {LEAGUES.map((l) => <SkeletonColumn key={l.id} league={l} />)}
        </div>
      ) : empty ? (
        <div className="page-empty">No standings available.</div>
      ) : (
        <div className="supertable-grid">
          {LEAGUES.map((league, i) => (
            <LeagueColumn
              key={league.id}
              data={standings[league.id]}
              flipLeft={i >= LEAGUES.length - 2}
            />
          ))}
        </div>
      )}
      <StatusBar loading={loading} error={error} empty={empty} />
      <DevPanel
        standings={standings}
        refreshing={refreshing}
        onRefresh={forceRefresh}
        error={error}
      />
    </main>
  );
}
