const Database = require('better-sqlite3');

const db = new Database('./ai/brain.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS ngrams (
        n INTEGER NOT NULL,
        context TEXT NOT NULL,
        next_word TEXT NOT NULL,
        count INTEGER NOT NULL DEFAULT 1,
        PRIMARY KEY (n, context, next_word)
    )
`);
db.exec(`
    CREATE TABLE IF NOT EXISTS starters (
    context TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 1
);
`);

module.exports = db;