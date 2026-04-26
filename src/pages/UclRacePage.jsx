import UclRace from '../components/UclRace.jsx';
import StatusBar from '../components/StatusBar.jsx';
import { useStandings } from '../hooks/useStandings.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function UclRacePage() {
  useDocumentTitle('SuperTable · UCL Race');
  const { standings, loading, error } = useStandings();
  const empty = Object.keys(standings).length === 0;
  return (
    <main className="page page--ucl">
      {empty && !loading ? (
        <div className="page-empty">No standings available.</div>
      ) : (
        <UclRace />
      )}
      <StatusBar loading={loading} error={error} empty={empty} />
    </main>
  );
}
