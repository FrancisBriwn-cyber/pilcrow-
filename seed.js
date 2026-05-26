require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const bcrypt = require('bcrypt');
const pool = require('./backend/db');

/*
  Run this file from the project root:
    node seed.js

  It will:
  1. Create the users and posts tables (if they don't exist)
  2. Seed 3 fictional users and 12 blog posts
*/

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ── Schema ────────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id           SERIAL PRIMARY KEY,
        name         VARCHAR(100)        NOT NULL,
        email        VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT,
        google_id    VARCHAR(255) UNIQUE,
        avatar_url   TEXT,
        created_at   TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title      VARCHAR(255) NOT NULL,
        content    TEXT        NOT NULL,
        media_url  TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Full-text search index — speeds up to_tsvector queries on large tables
    await client.query(`
      CREATE INDEX IF NOT EXISTS posts_fts_idx
        ON posts USING GIN (to_tsvector('english', title || ' ' || content));
    `);

    // ── Users ─────────────────────────────────────────────────────────────────
    const password = await bcrypt.hash('password123', 10);

    const usersResult = await client.query(`
      INSERT INTO users (name, email, password_hash, avatar_url) VALUES
        ('Alice Johnson',  'alice@example.com',  $1, 'https://i.pravatar.cc/150?img=1'),
        ('Bob Martinez',   'bob@example.com',    $1, 'https://i.pravatar.cc/150?img=3'),
        ('Clara Osei',     'clara@example.com',  $1, 'https://i.pravatar.cc/150?img=5')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, name
    `, [password]);

    const [alice, bob, clara] = usersResult.rows;
    console.log('Users seeded:', usersResult.rows.map(u => u.name).join(', '));

    // ── Posts ─────────────────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO posts (user_id, title, content, media_url) VALUES
        ($1, 'Getting Started with React Hooks',
         'React Hooks changed everything. Before hooks, managing stateful logic in functional components was impossible — you had to reach for class components or HOCs. Today, useState and useEffect cover most use cases and keep components readable. The key insight is that hooks let you "hook into" React state and lifecycle from function components. Start with useState for local UI state, useEffect for side effects, and useContext for shared global state. Only reach for useReducer when your state transitions get complex enough to benefit from the reducer pattern.',
         'https://picsum.photos/seed/react/800/400'),

        ($1, 'CSS Grid vs Flexbox: When to Use Which',
         'Flexbox and Grid are complementary — not competing. Use Flexbox when you are laying out items in a single dimension: a nav bar, a row of buttons, a column of form fields. Use Grid when you have a two-dimensional layout to manage: a dashboard, a photo gallery, a page template. A common pattern is to use Grid at the macro level (overall page structure) and Flexbox at the micro level (items within a grid cell). Understanding this distinction will clean up a lot of unnecessary CSS.',
         NULL),

        ($1, 'Why TypeScript Is Worth the Extra Typing',
         'TypeScript adds a compilation step and a learning curve. Is it worth it? After shipping several large projects in both JavaScript and TypeScript, my answer is: absolutely, for anything you expect to maintain. The IDE autocomplete alone pays back the cost within a week. The real value shows up six months in, when a refactor that would have required reading every call site becomes a matter of fixing the type errors the compiler surfaces for you. Start strict from day one — retrofitting strictness onto a large JS codebase is painful.',
         'https://picsum.photos/seed/typescript/800/400'),

        ($2, 'My Sourdough Journey: From Dense Bricks to Airy Loaves',
         'I killed my first three starters. The fourth one survived and is now two years old — I named him Gerald. The single biggest lesson: temperature controls everything. Yeast activity roughly doubles for every 10°C increase. A 24-hour cold retard in the fridge gives you complex flavour and a tighter crumb. Bulk fermentation at 26°C takes about 4 hours. Buy an instant-read thermometer before you buy any fancy flour. Your dough will tell you what it needs once you learn to read it.',
         'https://picsum.photos/seed/bread/800/400'),

        ($2, 'Running Your First Marathon: A Realistic Training Plan',
         'Most beginner marathon plans underestimate recovery. You do not get stronger on your long run — you get stronger in the 48 hours after it, while you sleep and eat. Build your weekly mileage by no more than 10% per week. Run your easy days genuinely easy (you should be able to hold a full conversation). Reserve effort for your one weekly tempo or threshold run. Taper for three weeks, not one. Race day is not the day to try a new nutrition strategy — simulate race conditions in your two longest training runs.',
         NULL),

        ($2, 'A Weekend in Lisbon: What the Travel Blogs Miss',
         'Everyone tells you to ride Tram 28. Nobody tells you to get on at Martim Moniz instead of Alfama to actually get a seat. The best pastel de nata is not at the famous place in Belém — it is at the local padaria on your street at 8am, still warm. Avoid the touristy restaurants along the waterfront; walk two streets back and follow the sound of a TV. The miradouros are worth every step. Bring comfortable shoes and no agenda.',
         'https://picsum.photos/seed/lisbon/800/400'),

        ($3, 'PostgreSQL Full-Text Search Is Underrated',
         'Before reaching for Elasticsearch, try PostgreSQL full-text search. For most applications — even with millions of rows — it is fast enough and dramatically simpler to operate. The key functions are to_tsvector (converts a text column into a searchable token list) and to_tsquery / plainto_tsquery (converts a query string into a query tree). Add a GIN index on the tsvector column and your searches will be sub-millisecond. You get ranking with ts_rank, phrase search, and multilingual support out of the box.',
         NULL),

        ($3, 'Rate Limiting Your API Without Annoying Your Users',
         'Rate limiting exists to protect your service, not to punish legitimate users. Design your limits around realistic usage patterns, not worst-case abuse scenarios. Always return a Retry-After header so clients know when to try again. Distinguish between per-IP limits (for unauthenticated endpoints) and per-user limits (for authenticated actions). Use a sliding window rather than a fixed window to avoid the thundering-herd problem at window boundaries. Log rate-limit events — they are a signal about both abuse and legitimate users hitting friction.',
         'https://picsum.photos/seed/api/800/400'),

        ($3, 'The Art of the Commit Message',
         'A good commit message is a letter to your future self and your teammates. The subject line should complete the sentence "If applied, this commit will...". Use the imperative mood: "Add pagination to post feed", not "Added" or "Adding". The body (separated by a blank line) explains the why, not the what — the diff already shows what changed. Reference issue numbers. Keep the subject under 72 characters. This discipline pays back every time you run git log --oneline to understand why a line of code exists.',
         NULL),

        ($1, 'Building Accessible React Components',
         'Accessibility is not a feature you bolt on at the end — it is a quality of the code itself. Start with semantic HTML: a button should be a <button>, not a div with an onClick. Use ARIA labels when the visual context is not sufficient for a screen reader. Ensure focus is managed correctly after modals open and close. Test with a keyboard alone — if you cannot use your app without a mouse, neither can millions of users. Run axe or Lighthouse in CI to catch regressions before they ship.',
         'https://picsum.photos/seed/a11y/800/400'),

        ($2, 'Home Coffee Brewing: Dialing In Your Grind',
         'The grind size is the primary variable in coffee extraction. Too coarse and you underextract — the coffee tastes sour and weak. Too fine and you overextract — bitter and harsh. Espresso needs a fine grind; pour-over a medium-coarse. Change one variable at a time when dialling in. Grind fresh — pre-ground coffee goes stale within 15 minutes of grinding. A burr grinder produces a consistent particle size; blade grinders produce dust and chunks simultaneously. The grinder matters more than the brewer.',
         'https://picsum.photos/seed/coffee/800/400'),

        ($3, 'Why I Switched from REST to tRPC',
         'REST is not wrong — it is just verbose. Every endpoint requires you to define the route, the handler, the request type, the response type, and a client-side fetch function. tRPC collapses all of that into a single type-safe procedure call. Your frontend gets autocomplete on every backend function. Refactoring a procedure name gives you a compile error on every call site. The catch: both client and server must be TypeScript, and it works best in a monorepo. For greenfield fullstack TypeScript projects, the developer experience is hard to beat.',
         NULL)
      ON CONFLICT DO NOTHING
    `, [alice.id, bob.id, clara.id]);

    // The above INSERT uses positional params for the three user IDs but we
    // need to split them — re-insert in batches to use the correct IDs
    await client.query('DELETE FROM posts');

    const postData = [
      { uid: alice.id, title: 'Getting Started with React Hooks', content: 'React Hooks changed everything. Before hooks, managing stateful logic in functional components was impossible — you had to reach for class components or HOCs. Today, useState and useEffect cover most use cases and keep components readable. The key insight is that hooks let you "hook into" React state and lifecycle from function components. Start with useState for local UI state, useEffect for side effects, and useContext for shared global state. Only reach for useReducer when your state transitions get complex enough to benefit from the reducer pattern.', media: 'https://picsum.photos/seed/react/800/400' },
      { uid: alice.id, title: 'CSS Grid vs Flexbox: When to Use Which', content: 'Flexbox and Grid are complementary — not competing. Use Flexbox when you are laying out items in a single dimension: a nav bar, a row of buttons, a column of form fields. Use Grid when you have a two-dimensional layout to manage: a dashboard, a photo gallery, a page template. A common pattern is to use Grid at the macro level (overall page structure) and Flexbox at the micro level (items within a grid cell). Understanding this distinction will clean up a lot of unnecessary CSS.', media: null },
      { uid: alice.id, title: 'Why TypeScript Is Worth the Extra Typing', content: 'TypeScript adds a compilation step and a learning curve. Is it worth it? After shipping several large projects in both JavaScript and TypeScript, my answer is: absolutely, for anything you expect to maintain. The IDE autocomplete alone pays back the cost within a week. The real value shows up six months in, when a refactor that would have required reading every call site becomes a matter of fixing the type errors the compiler surfaces for you. Start strict from day one — retrofitting strictness onto a large JS codebase is painful.', media: 'https://picsum.photos/seed/typescript/800/400' },
      { uid: bob.id, title: 'My Sourdough Journey: From Dense Bricks to Airy Loaves', content: 'I killed my first three starters. The fourth one survived and is now two years old — I named him Gerald. The single biggest lesson: temperature controls everything. Yeast activity roughly doubles for every 10°C increase. A 24-hour cold retard in the fridge gives you complex flavour and a tighter crumb. Bulk fermentation at 26°C takes about 4 hours. Buy an instant-read thermometer before you buy any fancy flour. Your dough will tell you what it needs once you learn to read it.', media: 'https://picsum.photos/seed/bread/800/400' },
      { uid: bob.id, title: 'Running Your First Marathon: A Realistic Training Plan', content: 'Most beginner marathon plans underestimate recovery. You do not get stronger on your long run — you get stronger in the 48 hours after it, while you sleep and eat. Build your weekly mileage by no more than 10% per week. Run your easy days genuinely easy (you should be able to hold a full conversation). Reserve effort for your one weekly tempo or threshold run. Taper for three weeks, not one. Race day is not the day to try a new nutrition strategy — simulate race conditions in your two longest training runs.', media: null },
      { uid: bob.id, title: 'A Weekend in Lisbon: What the Travel Blogs Miss', content: 'Everyone tells you to ride Tram 28. Nobody tells you to get on at Martim Moniz instead of Alfama to actually get a seat. The best pastel de nata is not at the famous place in Belém — it is at the local padaria on your street at 8am, still warm. Avoid the touristy restaurants along the waterfront; walk two streets back and follow the sound of a TV. The miradouros are worth every step. Bring comfortable shoes and no agenda.', media: 'https://picsum.photos/seed/lisbon/800/400' },
      { uid: clara.id, title: 'PostgreSQL Full-Text Search Is Underrated', content: 'Before reaching for Elasticsearch, try PostgreSQL full-text search. For most applications — even with millions of rows — it is fast enough and dramatically simpler to operate. The key functions are to_tsvector (converts a text column into a searchable token list) and to_tsquery / plainto_tsquery (converts a query string into a query tree). Add a GIN index on the tsvector column and your searches will be sub-millisecond. You get ranking with ts_rank, phrase search, and multilingual support out of the box.', media: null },
      { uid: clara.id, title: 'Rate Limiting Your API Without Annoying Your Users', content: 'Rate limiting exists to protect your service, not to punish legitimate users. Design your limits around realistic usage patterns, not worst-case abuse scenarios. Always return a Retry-After header so clients know when to try again. Distinguish between per-IP limits (for unauthenticated endpoints) and per-user limits (for authenticated actions). Use a sliding window rather than a fixed window to avoid the thundering-herd problem at window boundaries. Log rate-limit events — they are a signal about both abuse and legitimate users hitting friction.', media: 'https://picsum.photos/seed/api/800/400' },
      { uid: clara.id, title: 'The Art of the Commit Message', content: 'A good commit message is a letter to your future self and your teammates. The subject line should complete the sentence "If applied, this commit will...". Use the imperative mood: "Add pagination to post feed", not "Added" or "Adding". The body (separated by a blank line) explains the why, not the what — the diff already shows what changed. Reference issue numbers. Keep the subject under 72 characters. This discipline pays back every time you run git log --oneline to understand why a line of code exists.', media: null },
      { uid: alice.id, title: 'Building Accessible React Components', content: 'Accessibility is not a feature you bolt on at the end — it is a quality of the code itself. Start with semantic HTML: a button should be a button, not a div with an onClick. Use ARIA labels when the visual context is not sufficient for a screen reader. Ensure focus is managed correctly after modals open and close. Test with a keyboard alone — if you cannot use your app without a mouse, neither can millions of users. Run axe or Lighthouse in CI to catch regressions before they ship.', media: 'https://picsum.photos/seed/a11y/800/400' },
      { uid: bob.id, title: 'Home Coffee Brewing: Dialing In Your Grind', content: 'The grind size is the primary variable in coffee extraction. Too coarse and you underextract — the coffee tastes sour and weak. Too fine and you overextract — bitter and harsh. Espresso needs a fine grind; pour-over a medium-coarse. Change one variable at a time when dialling in. Grind fresh — pre-ground coffee goes stale within 15 minutes of grinding. A burr grinder produces a consistent particle size; blade grinders produce dust and chunks simultaneously. The grinder matters more than the brewer.', media: 'https://picsum.photos/seed/coffee/800/400' },
      { uid: clara.id, title: 'Why I Switched from REST to tRPC', content: 'REST is not wrong — it is just verbose. Every endpoint requires you to define the route, the handler, the request type, the response type, and a client-side fetch function. tRPC collapses all of that into a single type-safe procedure call. Your frontend gets autocomplete on every backend function. Refactoring a procedure name gives you a compile error on every call site. The catch: both client and server must be TypeScript, and it works best in a monorepo. For greenfield fullstack TypeScript projects, the developer experience is hard to beat.', media: null },
    ];

    for (const p of postData) {
      await client.query(
        'INSERT INTO posts (user_id, title, content, media_url) VALUES ($1, $2, $3, $4)',
        [p.uid, p.title, p.content, p.media]
      );
    }

    await client.query('COMMIT');
    console.log(`Seeded ${postData.length} posts successfully.`);
    console.log('\nSeed credentials (all share the same password):');
    console.log('  alice@example.com  / password123');
    console.log('  bob@example.com    / password123');
    console.log('  clara@example.com  / password123');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
