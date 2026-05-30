require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('./db');

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS likes (
      id          SERIAL PRIMARY KEY,
      post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at  TIMESTAMP DEFAULT NOW(),
      UNIQUE(post_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id          SERIAL PRIMARY KEY,
      post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content     TEXT NOT NULL,
      created_at  TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ratings (
      id          SERIAL PRIMARY KEY,
      post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      score       INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
      created_at  TIMESTAMP DEFAULT NOW(),
      UNIQUE(post_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS follows (
      id           SERIAL PRIMARY KEY,
      follower_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at   TIMESTAMP DEFAULT NOW(),
      UNIQUE(follower_id, following_id)
    );
  `);

  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;`);
  await pool.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS category VARCHAR(60) DEFAULT 'General';`);

  console.log('Migration complete: likes, comments, ratings, follows tables ready. bio + category columns added.');
  process.exit(0);
}

migrate().catch(err => { console.error('Migration failed:', err); process.exit(1); });
