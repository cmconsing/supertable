// About page — plain-prose explanation of what SuperTable is and how
// European qualification actually works. Single centered column, no
// tables. Reuses the global header/theme/font system.

import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function AboutPage() {
  useDocumentTitle('SuperTable · About');
  return (
    <main className="page page--about">
      <article className="about">
        <h1 className="about__title">About SuperTable</h1>

        <section className="about__intro">
          <p>
            SuperTable is the fastest way to follow the European football
            season. Five leagues, one view — standings kept fresh through
            match days and color-coded by what actually matters: who's
            heading to the Champions League, who's fighting for Europa
            League, and who's staring down relegation.
          </p>
          <p>
            European football runs on a hierarchy. League position isn't just
            about pride — it determines which clubs compete on the biggest
            stages next season. SuperTable makes that picture clear at a
            glance, across every major league, all in one place.
          </p>
        </section>

        <hr className="about__rule" />

        <h2 className="about__section-heading">How European Qualification Works</h2>

        <section className="about__topic">
          <h3>The Champions League</h3>
          <p>
            Europe's premier club competition. The top leagues — England,
            Spain, Germany, Italy, and France — each send their best four or
            five teams directly to the league phase. Finishing first in your
            league means you're in. Finishing fifth might mean a qualifying
            playoff. Every point in March and April can be the difference
            between Tuesday and Wednesday nights in Europe's biggest stadiums
            and a quiet pre-season.
          </p>
        </section>

        <section className="about__topic">
          <h3>The Europa League</h3>
          <p>
            The second tier of European competition. Teams finishing just
            outside the Champions League spots — typically 5th and 6th — earn
            a place here. Winning the Europa League also earns a Champions
            League spot the following season, which is why a team sitting 8th
            with a cup run can still end up in Europe's elite competition.
          </p>
        </section>

        <section className="about__topic">
          <h3>The Conference League</h3>
          <p>
            The newest of the three UEFA club competitions, introduced in
            2021. It gives clubs from smaller leagues and mid-table finishers
            in major leagues a route into European football. Finishing 7th in
            the Premier League or winning a domestic cup can be enough to
            qualify.
          </p>
        </section>

        <section className="about__topic">
          <h3>The Champions Path</h3>
          <p>
            Beyond the top five leagues, every UEFA member nation sends at
            least one club to the Champions League — their domestic champion.
            From the Scottish Premiership to the Latvian Virslīga, 48
            additional leagues feed into what UEFA calls the Champions Path:
            a series of qualifying rounds played in July and August before
            the league phase begins.
          </p>
          <p>
            The further down the UEFA ranking a league sits, the earlier its
            champion must enter. A champion from a lower-ranked nation might
            play three or four two-legged ties just to reach the league
            phase. A champion from a mid-ranked nation like the Netherlands
            or Portugal enters at a later stage with a shorter path.
          </p>
          <p>
            SuperTable focuses on the top five leagues, where most fan
            attention concentrates, but every league title in Europe is a
            Champions League ticket of some kind.
          </p>
        </section>

        <section className="about__topic">
          <h3>Domestic Cup Winners</h3>
          <p>
            Every top European league runs a parallel knockout cup
            competition alongside the regular season. Winning your domestic
            cup earns a separate European spot, independent of your league
            position. Here is exactly which stage each cup winner enters:
          </p>
          <ul className="about__cup-list">
            <li>
              <span className="about__cup-name">FA Cup (England)</span>
              <span className="about__cup-sep" aria-hidden="true">·</span>
              <span className="about__cup-detail">Winner enters the Europa League league phase</span>
            </li>
            <li>
              <span className="about__cup-name">Copa del Rey (Spain)</span>
              <span className="about__cup-sep" aria-hidden="true">·</span>
              <span className="about__cup-detail">Winner enters the Europa League league phase</span>
            </li>
            <li>
              <span className="about__cup-name">DFB-Pokal (Germany)</span>
              <span className="about__cup-sep" aria-hidden="true">·</span>
              <span className="about__cup-detail">Winner enters the Europa League league phase</span>
            </li>
            <li>
              <span className="about__cup-name">Coppa Italia (Italy)</span>
              <span className="about__cup-sep" aria-hidden="true">·</span>
              <span className="about__cup-detail">Winner enters the Europa League league phase</span>
            </li>
            <li>
              <span className="about__cup-name">Coupe de France (France)</span>
              <span className="about__cup-sep" aria-hidden="true">·</span>
              <span className="about__cup-detail">Winner enters the Conference League</span>
            </li>
          </ul>
          <p>
            The catch: if the cup winner has already qualified for Europe
            through their league position, their cup spot doesn't disappear —
            it passes to the next team in line. A club finishing 8th in the
            Premier League who wins the FA Cup earns a Europa League place
            regardless of league position. But if Manchester City win the FA
            Cup and finish in the top four, their Europa League spot passes
            down to 7th place. SuperTable tracks these adjustments
            automatically and shows exactly which team benefits and why.
          </p>
        </section>

        <section className="about__topic">
          <h3>Relegation</h3>
          <p>
            The bottom three teams in most leagues are relegated to the
            division below. The team just above them — typically 17th or 16th
            depending on the league — often faces a two-legged playoff
            (home-and-away on aggregate score) against a team from the second
            division for the right to stay up. It's the most brutal
            mathematics in sport: a season's work undone by a single position.
          </p>
        </section>

        <hr className="about__rule" />

        <h2 className="about__section-heading">How to Read SuperTable</h2>

        <section className="about__topic about__how">
          <p>
            Each league column shows the current standings top-to-bottom. A
            handful of visual signals make the qualification picture
            readable at a glance:
          </p>
          <ul className="about__how-list">
            <li>
              <span className="about__zone-swatch about__zone-swatch--ucl" aria-hidden="true" />
              <span className="about__zone-swatch about__zone-swatch--uel" aria-hidden="true" />
              <span className="about__zone-swatch about__zone-swatch--uecl" aria-hidden="true" />
              <span className="about__zone-swatch about__zone-swatch--rel" aria-hidden="true" />
              <strong>Row colors</strong> map to qualification zones —
              Champions League blue, Europa League purple, Conference League
              green, relegation amber and red. The Legend dropdown in the
              header expands to the full key.
            </li>
            <li>
              <span className="about__zone-pill" style={{ borderColor: '#d4a857', color: '#d4a857' }}>UCL</span>
              <span className="about__zone-pill" style={{ borderColor: '#9d5cf6', color: '#9d5cf6' }}>UEL</span>
              <span className="about__zone-pill" style={{ borderColor: '#d97706', color: '#d97706' }}>CUP</span>
              <strong>Trophy pills</strong> next to a team name mean the
              team has already secured European qualification by winning a
              tournament, on top of any league position.
            </li>
            <li>
              <span className="about__zone-arrow about__zone-arrow--up">▲</span>
              <span className="about__zone-arrow about__zone-arrow--down">▼</span>
              <strong>Position chips</strong> appear briefly next to a rank
              when a team has moved up or down since the last refresh. They
              fade after a few seconds.
            </li>
            <li>
              <span className="about__gih-demo">64<sup>+1</sup></span>
              <strong>Amber superscripts</strong> on a points total mean the
              team has played fewer games than the team directly above and
              could close the gap with a win.
            </li>
          </ul>
        </section>

        <hr className="about__rule" />

        <h2 className="about__section-heading">Behind the Data</h2>

        <section className="about__topic">
          <p>
            Live standings come from{' '}
            <a href="https://www.football-data.org/" target="_blank" rel="noopener noreferrer">
              football-data.org
            </a>
            , refreshed every five minutes during typical match windows
            (Tuesday and Wednesday evenings, plus weekend afternoons) and
            every two hours during quieter periods.
          </p>
          <p>
            Trophy holders — UCL and Europa League winners, plus the five
            domestic cup winners — are maintained by hand here as each
            final is played. If you spot a final that's just finished and
            isn't reflected yet, it's coming; usually within a few hours.
          </p>
        </section>

        <hr className="about__rule" />

        <p className="about__footnote">
          Qualification rules reflect the 2025–26 UEFA season. Cup winner
          spots are updated as domestic finals are played. Rules are
          reviewed each August.
        </p>

        <p className="about__back-link">
          <Link to="/">← Back to SuperTable</Link>
        </p>
      </article>
    </main>
  );
}
