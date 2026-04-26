import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

// 404 catch-all. Reuses the About-page layout shell so we don't need a
// separate set of CSS rules for one rare page.
export default function NotFoundPage() {
  useDocumentTitle('SuperTable · Not Found');
  return (
    <main className="page page--about">
      <article className="about">
        <h1 className="about__title">Page not found</h1>
        <p>That URL doesn't lead anywhere on SuperTable.</p>
        <p>
          <Link to="/" className="about__back">← Back to the table</Link>
        </p>
      </article>
    </main>
  );
}
