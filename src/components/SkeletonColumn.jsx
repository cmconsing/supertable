// Cold-load placeholder column. Same outer shape as LeagueColumn so the
// layout doesn't jump when real data arrives — just shimmer rectangles
// instead of team rows.
export default function SkeletonColumn({ league }) {
  const rowCount = Math.min(league.teamCount ?? 18, 18);
  return (
    <section
      className="league-col league-col--skeleton"
      aria-busy="true"
      aria-label={`Loading ${league.name}`}
    >
      <header className="league-col__header">
        <div className="league-col__title-row">
          <span className="league-col__flag" aria-hidden="true">{league.flag}</span>
          <h2 className="league-col__name">{league.name}</h2>
        </div>
        <div className="league-col__meta">
          <span className="skeleton skeleton--text" style={{ width: 70 }} />
          <span className="skeleton skeleton--text" style={{ width: 50 }} />
        </div>
      </header>

      <div className="league-col__rows">
        {Array.from({ length: rowCount }).map((_, i) => (
          <div className="team-row team-row--skeleton" key={i}>
            <span className="skeleton skeleton--text" style={{ width: 14 }} />
            <span className="skeleton skeleton--text" style={{ width: '80%' }} />
            <span className="skeleton skeleton--text" style={{ width: 22 }} />
            <span className="skeleton skeleton--text" style={{ width: 26 }} />
            <span className="skeleton skeleton--text" style={{ width: 18 }} />
          </div>
        ))}
      </div>
    </section>
  );
}
