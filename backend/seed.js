require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcrypt');
const pool = require('./db');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ── Schema ────────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        name          VARCHAR(100)        NOT NULL,
        email         VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT,
        google_id     VARCHAR(255) UNIQUE,
        avatar_url    TEXT,
        created_at    TIMESTAMPTZ DEFAULT NOW()
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

    await client.query(`
      CREATE TABLE IF NOT EXISTS likes (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(post_id, user_id)
      );
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(post_id, user_id)
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS posts_fts_idx
        ON posts USING GIN (to_tsvector('english', title || ' ' || content));
    `);

    // ── Clear existing seed data (idempotent) ─────────────────────────────────
    await client.query(`
      DELETE FROM users WHERE email IN (
        'alice@example.com','bob@example.com','clara@example.com',
        'david@example.com','emma@example.com'
      )
    `);

    // ── Users ─────────────────────────────────────────────────────────────────
    const password = await bcrypt.hash('password123', 10);

    const usersResult = await client.query(`
      INSERT INTO users (name, email, password_hash, avatar_url) VALUES
        ('Alice Johnson', 'alice@example.com', $1, 'https://i.pravatar.cc/150?img=1'),
        ('Bob Martinez',  'bob@example.com',   $1, 'https://i.pravatar.cc/150?img=3'),
        ('Clara Osei',    'clara@example.com', $1, 'https://i.pravatar.cc/150?img=5'),
        ('David Kim',     'david@example.com', $1, 'https://i.pravatar.cc/150?img=7'),
        ('Emma Clarke',   'emma@example.com',  $1, 'https://i.pravatar.cc/150?img=9')
      RETURNING id, name
    `, [password]);

    const [alice, bob, clara, david, emma] = usersResult.rows;
    console.log('Users seeded:', usersResult.rows.map(u => u.name).join(', '));

    // ── Posts ─────────────────────────────────────────────────────────────────
    const posts = [
      // Alice — Tech & Frontend
      { uid: alice.id, title: 'Getting Started with React Hooks', content: 'React Hooks changed everything. Before hooks, managing stateful logic in functional components was impossible — you had to reach for class components or HOCs. Today, useState and useEffect cover most use cases and keep components readable.\n\nThe key insight is that hooks let you "hook into" React state and lifecycle from function components. Start with useState for local UI state, useEffect for side effects, and useContext for shared global state. Only reach for useReducer when your state transitions get complex enough to benefit from the reducer pattern.\n\nAvoid overusing useCallback and useMemo — they add complexity and are only worthwhile when you can measure the performance difference.', media: 'https://picsum.photos/seed/react/800/400' },
      { uid: alice.id, title: 'CSS Grid vs Flexbox: When to Use Which', content: 'Flexbox and Grid are complementary — not competing. Use Flexbox when you are laying out items in a single dimension: a nav bar, a row of buttons, a column of form fields. Use Grid when you have a two-dimensional layout to manage: a dashboard, a photo gallery, a page template.\n\nA common pattern is to use Grid at the macro level (overall page structure) and Flexbox at the micro level (items within a grid cell). Understanding this distinction will clean up a lot of unnecessary CSS.\n\nThe biggest mistake beginners make is reaching for Flexbox for everything. Grid makes page-level layouts dramatically simpler once you learn it.', media: null },
      { uid: alice.id, title: 'Why TypeScript Is Worth the Extra Typing', content: 'TypeScript adds a compilation step and a learning curve. Is it worth it? After shipping several large projects in both JavaScript and TypeScript, my answer is: absolutely, for anything you expect to maintain.\n\nThe IDE autocomplete alone pays back the cost within a week. The real value shows up six months in, when a refactor that would have required reading every call site becomes a matter of fixing the type errors the compiler surfaces for you.\n\nStart strict from day one — retrofitting strictness onto a large JS codebase is painful. Use unknown instead of any. Let the types drive your design.', media: 'https://picsum.photos/seed/typescript/800/400' },
      { uid: alice.id, title: 'Building Accessible React Components', content: 'Accessibility is not a feature you bolt on at the end — it is a quality of the code itself. Start with semantic HTML: a button should be a button, not a div with an onClick.\n\nUse ARIA labels when the visual context is not sufficient for a screen reader. Ensure focus is managed correctly after modals open and close. Test with a keyboard alone — if you cannot use your app without a mouse, neither can millions of users.\n\nRun axe or Lighthouse in CI to catch regressions before they ship. Color contrast is the most common failure — use a contrast checker before finalising your palette.', media: 'https://picsum.photos/seed/a11y/800/400' },
      { uid: alice.id, title: 'What I Learned Shipping My First SaaS', content: 'I spent three months building the perfect product before showing it to anyone. That was a mistake. The feedback I got in the first week of real users proved that half my assumptions were wrong and the other half were partially wrong.\n\nShip something embarrassingly small. Talk to five users before writing a single line of code. Charge money from day one — free users will not tell you the truth about whether your product is valuable.\n\nThe hardest part is not the code. It is resisting the urge to build features instead of talking to people.', media: 'https://picsum.photos/seed/saas/800/400' },

      // Bob — Lifestyle & Hobbies
      { uid: bob.id, title: 'My Sourdough Journey: From Dense Bricks to Airy Loaves', content: 'I killed my first three starters. The fourth one survived and is now two years old — I named him Gerald. The single biggest lesson: temperature controls everything.\n\nYeast activity roughly doubles for every 10°C increase. A 24-hour cold retard in the fridge gives you complex flavour and a tighter crumb. Bulk fermentation at 26°C takes about 4 hours.\n\nBuy an instant-read thermometer before you buy any fancy flour. Your dough will tell you what it needs once you learn to read it. Scoring is more art than science — start simple.', media: 'https://picsum.photos/seed/bread/800/400' },
      { uid: bob.id, title: 'Running Your First Marathon: A Realistic Training Plan', content: 'Most beginner marathon plans underestimate recovery. You do not get stronger on your long run — you get stronger in the 48 hours after it, while you sleep and eat.\n\nBuild your weekly mileage by no more than 10% per week. Run your easy days genuinely easy (you should be able to hold a full conversation). Reserve effort for your one weekly tempo or threshold run.\n\nTaper for three weeks, not one. Race day is not the day to try a new nutrition strategy — simulate race conditions in your two longest training runs.', media: null },
      { uid: bob.id, title: 'A Weekend in Lisbon: What the Travel Blogs Miss', content: 'Everyone tells you to ride Tram 28. Nobody tells you to get on at Martim Moniz instead of Alfama to actually get a seat. The best pastel de nata is not at the famous place in Belém — it is at the local padaria on your street at 8am, still warm.\n\nAvoid the touristy restaurants along the waterfront; walk two streets back and follow the sound of a TV. The miradouros are worth every step. Bring comfortable shoes and no agenda.\n\nLisbon rewards people who get lost. Put the map away for one afternoon.', media: 'https://picsum.photos/seed/lisbon/800/400' },
      { uid: bob.id, title: 'Home Coffee Brewing: Dialing In Your Grind', content: 'The grind size is the primary variable in coffee extraction. Too coarse and you underextract — the coffee tastes sour and weak. Too fine and you overextract — bitter and harsh.\n\nEspresso needs a fine grind; pour-over a medium-coarse. Change one variable at a time when dialling in. Grind fresh — pre-ground coffee goes stale within 15 minutes of grinding.\n\nA burr grinder produces a consistent particle size; blade grinders produce dust and chunks simultaneously. The grinder matters more than the brewer. Buy the best grinder your budget allows.', media: 'https://picsum.photos/seed/coffee/800/400' },
      { uid: bob.id, title: 'Urban Gardening with No Outdoor Space', content: 'I grow tomatoes, basil, lettuce, and chillies on a fifth-floor balcony in a city. The trick is choosing varieties bred for containers — Roma tomatoes rather than beefsteak, bush basil rather than the sprawling kind.\n\nWatering is the hardest habit to build. In summer, container plants need water every single day. Self-watering pots changed my success rate dramatically.\n\nGrow what you eat. There is no point in a herb garden if you never cook with fresh herbs. Start with basil — it is fast, rewarding, and you will use it constantly.', media: 'https://picsum.photos/seed/garden/800/400' },

      // Clara — Engineering & Tech
      { uid: clara.id, title: 'PostgreSQL Full-Text Search Is Underrated', content: 'Before reaching for Elasticsearch, try PostgreSQL full-text search. For most applications — even with millions of rows — it is fast enough and dramatically simpler to operate.\n\nThe key functions are to_tsvector (converts a text column into a searchable token list) and to_tsquery / plainto_tsquery (converts a query string into a query tree). Add a GIN index on the tsvector column and your searches will be sub-millisecond.\n\nYou get ranking with ts_rank, phrase search, and multilingual support out of the box. Only migrate to Elasticsearch when you need distributed search across dozens of nodes.', media: null },
      { uid: clara.id, title: 'Rate Limiting Your API Without Annoying Your Users', content: 'Rate limiting exists to protect your service, not to punish legitimate users. Design your limits around realistic usage patterns, not worst-case abuse scenarios.\n\nAlways return a Retry-After header so clients know when to try again. Distinguish between per-IP limits (for unauthenticated endpoints) and per-user limits (for authenticated actions).\n\nUse a sliding window rather than a fixed window to avoid the thundering-herd problem at window boundaries. Log rate-limit events — they are a signal about both abuse and legitimate users hitting friction.', media: 'https://picsum.photos/seed/api/800/400' },
      { uid: clara.id, title: 'The Art of the Commit Message', content: 'A good commit message is a letter to your future self and your teammates. The subject line should complete the sentence "If applied, this commit will...". Use the imperative mood: "Add pagination to post feed", not "Added" or "Adding".\n\nThe body (separated by a blank line) explains the why, not the what — the diff already shows what changed. Reference issue numbers. Keep the subject under 72 characters.\n\nThis discipline pays back every time you run git log --oneline to understand why a line of code exists. Great commit history is free documentation.', media: null },
      { uid: clara.id, title: 'Why I Switched from REST to tRPC', content: 'REST is not wrong — it is just verbose. Every endpoint requires you to define the route, the handler, the request type, the response type, and a client-side fetch function. tRPC collapses all of that into a single type-safe procedure call.\n\nYour frontend gets autocomplete on every backend function. Refactoring a procedure name gives you a compile error on every call site.\n\nThe catch: both client and server must be TypeScript, and it works best in a monorepo. For greenfield fullstack TypeScript projects, the developer experience is hard to beat.', media: null },

      // David — Design & Product
      { uid: david.id, title: 'Design Systems That Actually Scale', content: 'Most design systems fail not because they are badly designed, but because nobody maintains them. A token-based system with a clear ownership model will outlast a beautiful component library with no champion.\n\nStart with decisions that are hard to change: spacing scale, type scale, color primitives. Build components on top of those. Document the "why" behind every decision — the constraints that motivated it — so future contributors can update rather than override.\n\nA design system is a product. Treat it like one.', media: 'https://picsum.photos/seed/design/800/400' },
      { uid: david.id, title: 'The Problem with Dark Mode', content: 'Dark mode is harder than it looks. Pure black (#000000) on a dark background creates harsh contrast for OLED screens. Pure white text on dark backgrounds causes halation — letters appear to bleed. Neither is comfortable for long reading sessions.\n\nThe best dark modes use off-black backgrounds (around #111–#1a1a1a) and slightly warm, slightly dimmed text (around 85–90% opacity white). Shadows become borders. Elevation is expressed through surface lightness, not shadow depth.\n\nTest in a real dark environment, not just by inverting your light-mode colors.', media: 'https://picsum.photos/seed/darkmode/800/400' },
      { uid: david.id, title: 'Typography Rules I Follow on Every Project', content: 'Line length is the most neglected typographic variable. The sweet spot for body text is 60–75 characters per line. Wider than that and the eye struggles to find the next line. Narrower and the constant line-breaks interrupt reading flow.\n\nUse a type scale — a mathematical progression (1.25× or 1.333×) — rather than picking arbitrary sizes. Limit yourself to two typefaces maximum. Pair a high-contrast serif for headings with a readable sans-serif for body.\n\nWhitespace is not empty space. It is active breathing room that gives text hierarchy and weight.', media: 'https://picsum.photos/seed/typography/800/400' },
      { uid: david.id, title: 'Why I Stopped Using Figma for Everything', content: 'Figma is excellent for UI design. It is a poor tool for information architecture, user journey mapping, and exploratory thinking. I reach for paper and a marker for those stages now.\n\nThe screen forces premature polish. Sketching on paper is faster, more honest about uncertainty, and easier to throw away. The act of drawing low-fidelity wireframes forces you to make structural decisions before aesthetic ones.\n\nOnce the structure is right, move to Figma. Not before.', media: 'https://picsum.photos/seed/figma/800/400' },

      // Emma — Writing & Culture
      { uid: emma.id, title: 'How to Read More: A Practical System', content: 'I read 40 books last year. Not because I am disciplined, but because I removed all the friction from picking up a book. The Kindle lives on my nightstand. There is no phone charger in the bedroom. Reading starts before the phone does in the morning.\n\nDo not finish books you are not enjoying. Life is too short for bad books, and guilt about an unfinished book will make you avoid reading altogether.\n\nRead what you enjoy, not what you think you should enjoy. Literary fiction is wonderful. So is science fiction. So is well-written nonfiction. Genre snobbery kills reading habits.', media: 'https://picsum.photos/seed/books/800/400' },
      { uid: emma.id, title: 'The Case for Writing by Hand', content: 'Typing is faster than writing by hand. That is exactly the problem. Speed bypasses reflection. When I write slowly, I choose words more carefully. Sentences come out cleaner the first time.\n\nI draft long-form pieces in a notebook before moving to the screen. The transcription step is free editing — I cut everything that does not survive the second pass.\n\nYou do not need a special notebook or a fountain pen. A cheap composition book and a ballpoint work fine. The medium matters less than the slowness.', media: 'https://picsum.photos/seed/writing/800/400' },
      { uid: emma.id, title: 'Notes on Living in a Small Flat', content: 'I have 38 square metres and I have lived here for four years. The first lesson: vertical space is free. Floating shelves from floor to ceiling replaced furniture I did not need.\n\nOwn things deliberately. Every item in a small home is a decision. Multifunctional furniture earns its square footage — a bed with storage, a dining table that folds against the wall.\n\nThe hardest adjustment is resisting the urge to fill space. An empty corner is not a problem to solve.', media: 'https://picsum.photos/seed/apartment/800/400' },
      { uid: emma.id, title: 'Why I Journal Every Morning', content: 'Morning pages — three pages of longhand writing, first thing — have been my most consistent habit for two years. Not because of any insight they produce, but because of what they drain out: the low-grade anxiety, the mental chatter, the half-formed worries that would otherwise follow me into the day.\n\nI do not read them back. The point is not the output. The point is the process of externalising what is in your head before you ask your head to do anything useful.\n\nThree pages sounds like a lot. It takes twenty minutes once you stop stopping.', media: 'https://picsum.photos/seed/journal/800/400' },
      { uid: emma.id, title: 'On Slow Travel', content: 'I spent six weeks in one city instead of six cities in two weeks. I found a favourite café by the third day. I knew which bakery opened earliest. I had a usual order at a restaurant where they started preparing it when they saw me walk past the window.\n\nSpeed tourism is the opposite of travel — it is just expensive commuting. You see the surfaces of places without feeling their texture.\n\nStaying longer is often cheaper too. Weekly rentals cost less than hotels. You cook more. You walk instead of taking taxis because you know where you are going.', media: 'https://picsum.photos/seed/travel/800/400' },
    ];

    for (const p of posts) {
      await client.query(
        'INSERT INTO posts (user_id, title, content, media_url) VALUES ($1, $2, $3, $4)',
        [p.uid, p.title, p.content, p.media]
      );
    }

    await client.query('COMMIT');
    console.log(`\nSeeded ${posts.length} posts across 5 writers.`);
    console.log('\nLogin credentials (password: "password123"):');
    console.log('  alice@example.com  — frontend & product');
    console.log('  bob@example.com    — lifestyle & hobbies');
    console.log('  clara@example.com  — backend engineering');
    console.log('  david@example.com  — design & typography');
    console.log('  emma@example.com   — writing & culture');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
