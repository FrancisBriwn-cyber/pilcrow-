require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcrypt');
const pool = require('./db');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ── Schema ─────────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        name          VARCHAR(100)        NOT NULL,
        email         VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT,
        google_id     VARCHAR(255) UNIQUE,
        avatar_url    TEXT,
        bio           TEXT,
        created_at    TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title      VARCHAR(255) NOT NULL,
        content    TEXT        NOT NULL,
        media_url  TEXT,
        category   VARCHAR(60) DEFAULT 'General',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS category VARCHAR(60) DEFAULT 'General';`);

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
      CREATE TABLE IF NOT EXISTS follows (
        id           SERIAL PRIMARY KEY,
        follower_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        following_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at   TIMESTAMP DEFAULT NOW(),
        UNIQUE(follower_id, following_id)
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS posts_fts_idx
        ON posts USING GIN (to_tsvector('english', title || ' ' || content));
    `);

    // ── Clear existing seed data ───────────────────────────────────────────────
    await client.query(`
      DELETE FROM users WHERE email IN (
        'maya@example.com','james@example.com','sofia@example.com',
        'kai@example.com','amara@example.com',
        'alice@example.com','bob@example.com','clara@example.com',
        'david@example.com','emma@example.com'
      )
    `);

    // ── Writers ───────────────────────────────────────────────────────────────
    const password = await bcrypt.hash('password123', 10);

    const usersResult = await client.query(`
      INSERT INTO users (name, email, password_hash, avatar_url, bio) VALUES
        ('Maya Osei',     'maya@example.com',  $1, 'https://i.pravatar.cc/150?img=5',  'Poet and essayist. I write about memory, belonging, and the small moments that hold the most weight. Based in Accra.'),
        ('James Rivera',  'james@example.com', $1, 'https://i.pravatar.cc/150?img=3',  'Travel writer and storyteller. Six continents, one notebook. I believe the best stories happen when you slow down.'),
        ('Sofia Laurent', 'sofia@example.com', $1, 'https://i.pravatar.cc/150?img=9',  'Personal essayist. I write about grief, joy, and the strange beauty of ordinary life. Formerly a journalist.'),
        ('Kai Mwangi',    'kai@example.com',   $1, 'https://i.pravatar.cc/150?img=7',  'Fiction writer and writing teacher. Obsessed with character, voice, and the sentences that stop you cold.'),
        ('Amara Chen',    'amara@example.com', $1, 'https://i.pravatar.cc/150?img=1',  'Ideas writer. I read widely and think out loud about culture, creativity, and how we spend our attention.')
      RETURNING id, name
    `, [password]);

    const [maya, james, sofia, kai, amara] = usersResult.rows;
    console.log('Writers seeded:', usersResult.rows.map(u => u.name).join(', '));

    // ── Posts ─────────────────────────────────────────────────────────────────
    const posts = [
      // Maya — Poetry & Personal Essays
      {
        uid: maya.id, category: 'Poetry',
        title: 'On Writing in Your Mother Tongue',
        content: `There is a word in Twi — <em>sunsum</em> — that means soul, spirit, the animating force inside a person. I have spent years trying to write around it in English, and I am not sure I have ever landed on the right translation.\n\nThis is what it feels like to write in a language that was not your first. You are always reaching for something just beyond your fingers. The word exists — you know it exists — but the language you are writing in has no house for it.\n\nI started writing poems in Twi three years ago, not because I abandoned English, but because I needed the other voice. The one that does not explain itself. The one that assumes you already know what sunsum means because you have felt it.\n\nTranslation is interpretation. Every poem I write in English is already a translation of something I first felt in a language that has no alphabet.`,
        media: 'https://picsum.photos/seed/twi/800/400'
      },
      {
        uid: maya.id, category: 'Personal Essay',
        title: 'What My Grandmother Taught Me Without Words',
        content: `She never told me she loved me. Not once in thirty years. She told me by keeping the best piece of fish for my plate. By knowing, without being told, when I had had a hard day. By sitting with me in silence in a way that felt like company.\n\nI grew up thinking love required declaration. That feelings unspoken were feelings unfelt. My grandmother taught me, slowly and without trying, that this is a very Western idea.\n\nThere are languages of love that have no words. The cup of tea that appears when you are sad. The door left unlocked. The light left on.\n\nShe died last year. I did not tell her I loved her at the end. I sat with her. I held her hand. I hope she understood.`,
        media: null
      },
      {
        uid: maya.id, category: 'Creativity & Craft',
        title: 'Why I Write at 5am',
        content: `The world has not started yet. The obligations have not remembered themselves. My phone is still in the other room.\n\nI started writing at five in the morning two years ago because I had run out of excuses. In the evening I was tired. In the afternoon I was distracted. In the morning before anyone needed anything from me, I had no reason not to write.\n\nWhat I did not expect was how different the writing would feel. There is a quality of thought available at five in the morning that disappears once the day begins. Something quieter. Less defended. The internal critic has not woken up yet.\n\nI am not a morning person. I do not recommend it to everyone. But I recommend finding the hour when you are most yourself — and protecting it like it is the only thing that belongs entirely to you. Because it might be.`,
        media: 'https://picsum.photos/seed/dawn/800/400'
      },

      // James — Travel & Culture
      {
        uid: james.id, category: 'Travel & Places',
        title: 'Six Weeks in One City',
        content: `Everyone told me to see more. Six weeks in Morocco and you only went to one city? Yes. I went to one city and I know it now.\n\nI know which café opens at six and which opens at nine. I know that the light in the medina changes around four in the afternoon and everything turns gold. I know the stall where the bread is still warm at eight in the morning, and the one to avoid. I know a man named Hassan who repairs shoes outside the tannery and has been doing it for forty years.\n\nI would not know any of this if I had moved on after three days.\n\nSpeed tourism is expensive commuting. You see the surfaces of places without feeling their texture. Staying longer is how you stop being a visitor.\n\nIt is also usually cheaper. The weekly rate for my riad was a third of the nightly rate for a hotel two streets over.`,
        media: 'https://picsum.photos/seed/marrakech/800/400'
      },
      {
        uid: james.id, category: 'Travel & Places',
        title: 'What a Train Window Teaches You',
        content: `I have done most of my best thinking on trains. There is something about the rhythm of it — the particular velocity, the passing of the ordinary world outside the window — that loosens thoughts you did not know you were holding.\n\nThe landscape does not ask anything of you. It simply arrives and departs. Fields. A village. Someone hanging washing on a line in a garden you will never visit. A child waving at the train from a road bridge.\n\nI take trains whenever I can, even when the flight is faster. I am not trying to be virtuous about carbon. I am trying to protect the transition — the experience of actually travelling between two places rather than simply disappearing from one and appearing in another.\n\nArriving somewhere is better when you watched the world change on the way.`,
        media: null
      },
      {
        uid: james.id, category: 'Ideas & Philosophy',
        title: 'On Getting Lost on Purpose',
        content: `I put the map away for one full afternoon in every city I visit. This sounds romantic. It is also mildly terrifying.\n\nWithout the map, I notice things. I notice that I am walking in the wrong direction and then I notice what is in the direction I am now walking. I find a market I would not have found. I sit somewhere I would not have chosen. I overhear a conversation in a language I do not speak and find myself making up what it might mean.\n\nLostness is not inefficiency. It is a different kind of information-gathering. Your feet choose based on interest rather than destination, and interest turns out to be a better guide than the map.\n\nThe map shows you the city that already exists. Getting lost shows you the city that surprises you.`,
        media: 'https://picsum.photos/seed/alley/800/400'
      },

      // Sofia — Personal Essays & Life
      {
        uid: sofia.id, category: 'Personal Essay',
        title: 'The Year I Stopped Being Busy',
        content: `For most of my twenties, I wore busyness like a badge. I was always late to things because I had come from other things. My calendar was full months in advance. I thought this meant I was doing well.\n\nThen I got sick — nothing dramatic, just the kind of sick that means you cannot leave the house for three weeks — and I discovered that most of what I had been rushing between did not matter very much. The meetings rescheduled. The commitments were quietly dropped. Nobody noticed.\n\nI came back to my life having lost nothing essential and gained a question I have not been able to put down: what was all of that for?\n\nI am slower now. My calendar has gaps. I am in fewer rooms. I am more present in the rooms I am in. I do not think I am doing worse. I think I finally know the difference between movement and progress.`,
        media: null
      },
      {
        uid: sofia.id, category: 'Journal',
        title: 'Notes on Grief Nobody Told Me',
        content: `Nobody told me grief was funny sometimes. That you would be in a supermarket two weeks after the funeral and see the brand of biscuits they always bought and laugh — actually laugh — before you cried.\n\nNobody told me it was not linear. That you could feel fine for a month and then be undone by a particular quality of afternoon light.\n\nNobody told me how much of grief is administrative. The forms. The phone calls. The possessions. The strange work of taking someone out of the world's systems while your own system still hasn't caught up to their absence.\n\nNobody told me that the second year is often harder than the first. The shock has worn off. The calls have stopped. The world expects you to have returned to normal. You have not returned to normal. There is no normal to return to. You are building a new one, room by room.`,
        media: 'https://picsum.photos/seed/window/800/400'
      },
      {
        uid: sofia.id, category: 'Books & Reading',
        title: 'The Books That Found Me at the Right Time',
        content: `I do not believe in the right book. I believe in the right book at the right moment, which is an entirely different thing.\n\nI read Middlemarch for the first time at twenty-two and found it beautiful and distant, like a country I had visited but not understood. I read it again at thirty-four, after a marriage and a divorce and a few years of being lost, and it broke me open. Same book. Different reader.\n\nBooks do not change. We do. This is why rereading matters. You are not checking whether the book holds up. You are checking who you have become.\n\nThe books that have found me at exactly the right time feel less like choices and more like appointments. Someone left this here for you. You are ready now.`,
        media: null
      },

      // Kai — Creativity & Craft, Fiction
      {
        uid: kai.id, category: 'Creativity & Craft',
        title: 'The Sentence That Changes Everything',
        content: `Every piece of writing has a sentence that is doing more work than the others. A sentence where, if you cut it, the whole thing shifts. A sentence that earns the ones around it.\n\nFinding that sentence is most of the work. The rest is scaffolding.\n\nI tell my students to read their drafts and ask: which sentence would hurt most to lose? That is the sentence to protect. That is the sentence that knows what the piece is really about.\n\nSometimes the piece is supposed to be about one thing and the key sentence reveals that it is actually about something else entirely. This is not a problem. This is the draft telling you the truth. Listen to it.`,
        media: 'https://picsum.photos/seed/notebook/800/400'
      },
      {
        uid: kai.id, category: 'Creativity & Craft',
        title: 'On Writing Characters You Do Not Understand',
        content: `The most dangerous thing a fiction writer can do is write only characters they agree with. Characters become interesting at the point of difference from the writer — not the points of similarity.\n\nI grew up hearing that you should write what you know. I think this is wrong, or at least incomplete. You should write toward what you do not know. Use what you know to build the scaffolding, then let the character exceed you.\n\nThe characters I am proudest of are the ones who surprised me. Who did things I would not have predicted in chapter one. That surprise is a signal that something is alive on the page.\n\nA character who only does what you expect is a puppet. A character who does something that makes you stop and wonder how they got there — that is a person.`,
        media: null
      },
      {
        uid: kai.id, category: 'Creativity & Craft',
        title: 'Why Bad First Drafts Are a Gift',
        content: `I have never written a good first draft. I am not sure anyone has. The first draft is not writing — it is thinking on paper. The writing comes in revision.\n\nThe writers who struggle most with first drafts are the ones who want them to already be second drafts. They edit as they go. They stop. They restart. They abandon pieces that are not yet ready to be judged.\n\nThe first draft's only job is to exist. It does not have to be good. It has to be done.\n\nGive yourself the permission to write badly. Badly written pages can be revised. Blank pages cannot.`,
        media: 'https://picsum.photos/seed/draft/800/400'
      },

      // Amara — Ideas & Philosophy, Culture
      {
        uid: amara.id, category: 'Ideas & Philosophy',
        title: 'We Are What We Pay Attention To',
        content: `Your attention is the only resource you cannot earn back. Money lost can be recovered. Hours, once spent, are gone permanently. What you pay attention to becomes, over time, the texture of your inner life.\n\nThis is why the attention economy is not just an economic problem. It is a philosophical one. The feeds, the notifications, the recommendation algorithms — they are not stealing your time. They are shaping who you are becoming, minute by minute.\n\nI am not making an argument for disconnection. I am making an argument for deliberateness. The question is not whether to give your attention — you will give it to something — but whether you are choosing where it goes.\n\nWhat you attend to consistently is what you will think about, care about, and become shaped by. Choose accordingly.`,
        media: 'https://picsum.photos/seed/attention/800/400'
      },
      {
        uid: amara.id, category: 'Books & Reading',
        title: 'Reading as Resistance',
        content: `There is a kind of reading that feels like resistance — not to any particular thing, but to the general acceleration of everything. To read a long book slowly is to insist that some things are worth taking time over.\n\nI read for about an hour every morning before I look at my phone. Not because I am disciplined, but because I have arranged things so that the book is more reachable than the phone. Friction matters. Make the thing you want to do the path of least resistance.\n\nLong-form reading builds a kind of attention that short-form content erodes. The ability to stay with a difficult sentence. To follow an argument across fifty pages. To not immediately reach for stimulation when you feel the first hint of boredom.\n\nThis attention is worth preserving. It is the same attention that makes you better at everything else.`,
        media: null
      },
      {
        uid: amara.id, category: 'Observations',
        title: 'Small Rituals and Why They Matter',
        content: `I make coffee the same way every morning. The kettle, the bloom, the pour. It takes four minutes. I have done this for three years. It is one of the few things in my day that happens exactly the way I choose.\n\nRituals are not habits. Habits are things you do automatically. Rituals are things you do with attention. The difference is that rituals interrupt the automatic. They create a small space of intention inside a day that would otherwise just happen to you.\n\nI am not a spiritual person in any organised sense. But I think there is something true in the idea that doing the same thing the same way, with care, at the same time, changes the texture of a day. It is a way of saying: this matters. This moment is worth marking.\n\nYour rituals do not have to be beautiful or solemn. They just have to be yours.`,
        media: 'https://picsum.photos/seed/ritual/800/400'
      },
      {
        uid: amara.id, category: 'Ideas & Philosophy',
        title: 'The Case for Changing Your Mind',
        content: `Changing your mind is supposed to be embarrassing. In public discourse, it is treated as weakness or inconsistency. Politicians who change positions are attacked for it. Commentators who revise their views are called hypocrites.\n\nThis is backwards. Changing your mind in response to new evidence or better arguments is exactly what thinking is for. The failure mode is not changing your mind — it is holding a position you have already revised just because you once said it publicly.\n\nI keep a running document of things I used to believe that I no longer believe. Reading it back is uncomfortable and useful in roughly equal measure. It is a record of where I was wrong and what changed me.\n\nThe goal is not consistency. The goal is accuracy. And accuracy sometimes requires revision.`,
        media: null
      },
    ];

    for (const p of posts) {
      await client.query(
        'INSERT INTO posts (user_id, title, content, media_url, category) VALUES ($1, $2, $3, $4, $5)',
        [p.uid, p.title, p.content, p.media, p.category]
      );
    }

    await client.query('COMMIT');
    console.log(`\nSeeded ${posts.length} posts across 5 writers.`);
    console.log('\nLogin credentials (password: "password123"):');
    console.log('  maya@example.com   — poet & essayist');
    console.log('  james@example.com  — travel & culture');
    console.log('  sofia@example.com  — personal essays & life');
    console.log('  kai@example.com    — fiction & craft');
    console.log('  amara@example.com  — ideas & philosophy');
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
