const fs = require('fs');

fs.writeFileSync("./ai/c.json", JSON.stringify({ t: Date.now() }))
const db = require('./database.js'),
    filler = [
        "a", "an", "the",
        "this", "that", "these", "those",

        "i", "me", "my", "mine",
        "you", "your", "yours",
        "he", "him", "his",
        "she", "her", "hers",
        "it", "its",
        "we", "us", "our", "ours",
        "they", "them", "their", "theirs",

        "am", "is", "are", "was", "were",
        "be", "been", "being",
        "do", "does", "did",
        "have", "has", "had",
        "will", "would",
        "shall", "should",
        "can", "could",
        "may", "might",
        "must",

        "in", "on", "at", "to", "from", "by", "with",
        "about", "against", "between", "into",
        "through", "during", "before", "after",
        "above", "below", "over", "under",

        "and", "or", "but", "nor",
        "so", "yet",
        "if", "because", "although", "though",
        "while", "whereas",

        "what", "who", "whom", "whose",
        "which", "when", "where", "why", "how",

        "of", "as", "for",
        "up", "down", "out", "off",
        "just", "very", "really"],
    questionWords = [
        "what", "why", "how", "when", "where", "who", "which", "whom", "whose",
    ],
    auxVerbs = ["do", "does", "did",
        "is", "are", "was", "were",
        "can", "could",
        "will", "would",
        "should", "shall",
        "have", "has", "had"],
    nonQuestionAux = ["not"],
    bannedWords = ["<@1410941750641561730>", "@here", "@everyone", "?debug"],
    countKeys = db.prepare(`
    SELECT COUNT(*) AS count
    FROM ngrams
`);
let keycount = countKeys.get().count

const isQuestion = (text) => {
    const words = text.toLowerCase().split(/\s+/)
    if (questionWords.includes(words[0])) return { type: 0 }
    if (auxVerbs.includes(words[0]) && !nonQuestionAux.includes(words[1])) return { type: 1 }
    return false
}
const insertKey = db.prepare(`
    INSERT INTO ngrams (n, context, next_word, count)
    VALUES (?, ?, ?, 1)
    ON CONFLICT(n, context, next_word)
    DO UPDATE SET count = count + excluded.count
`);
const insertStarter = db.prepare(`
    INSERT INTO starters (context, count)
    VALUES (?, 1)
    ON CONFLICT(context)
    DO UPDATE SET count = count + 1
`);
const createKey = (n, key, next) => {
    insertKey.run(n, key, next);
}

const getEntries = db.prepare(`
    SELECT next_word, count FROM ngrams
    WHERE n = ? AND context = ?
`);
const pickKey = (n, key) => {
    const obj = getEntries.all(n, key)
    if (!obj.length) return { word: null, entries: null };
    const entries = obj.map(({ next_word, count }) => [next_word, count])
    const total = entries.reduce((a, [, b]) => a + b, 0)
    let r = Math.random() * total
    for (const [word, count] of entries) {
        if ((r -= count) < 0) return { word, entries }
    }
}
const learn = async (sentence) => {
    if (!sentence || sentence.split(/\s+/).length < 3) return;
    const words = sentence.toLowerCase().split(/\s+/).filter(f => {
        let allowed = true;
        bannedWords.forEach(b => {
            if (f.includes(b)) {
                allowed = false;
                console.log("[AI] Filtered out banned word: ", b)
            }
        })
        return allowed;
    });
    if (words.length === 0) return;
    if (words.length > 2) {
        insertStarter.run(words.slice(0, 3).join(" "));
    }
    for (let i = 0; i < words.length - 3; i++) {
        const w1 = words[i], w2 = words[i + 1], w3 = words[i + 2], next = words[i + 3]
        if (next) {
            createKey(3, [w1, w2, w3].join(" "), next)
        }
        if (w3) {
            createKey(2, [w2, w3].join(" "), next)
        }
        if (w2) {
            createKey(1, w3, next)
        }
    }
    keycount = countKeys.get().count
    console.log('[AI] Learned sentence: ', sentence)
}

const findBestKey = (keywords) => {
    keywords = keywords.filter(w => !filler.includes(w));
    let rows;
    if (keywords.length)
        rows = db.prepare(`
            SELECT DISTINCT context
            FROM ngrams
            WHERE n = 3
                AND (${keywords.map(() => 'instr(context, ?) > 0').join(' OR ')})

            UNION

            SELECT context FROM starters
        `).all(...keywords);
    else rows = db.prepare('SELECT context FROM starters').all();
    const starterSet = new Set(
        db.prepare('SELECT context FROM starters').pluck().all()
    );

    const scores = rows.map(({ context }) => {
        const score =
            keywords.reduce((total, word) =>
                total + (context.includes(word) ? 1 : 0), 0
            ) + (starterSet.has(context) ? 2 : 0);

        return { score, key: context };
    });
    let bestScore = 0;
    try {
        bestScore = Math.max(0, ...scores.map(s => s.score));
    } catch (error) {
        console.warn(`[AI] Math.max failed, resorting to the evil and laggy method.`);
        for (let score of scores) {
            if (score.score > bestScore) {
                bestScore = score.score
            }
        }
    }

    if (bestScore === 0) {
        return { best: null, bestOnes: [], bestScore };
    }

    const bestOnes = scores.filter(s => s.score === bestScore);
    const best = bestOnes[
        Math.floor(Math.random() * bestOnes.length)
    ]?.key;

    return {
        best: best?.split(' '),
        bestOnes,
        bestScore
    };
}

let lastReplyTime = 0

const reply = (input, learns = true) => {
    if (lastReplyTime &&
        Date.now() - lastReplyTime < (parseInt(JSON.parse(fs.readFileSync('./config.json', 'utf-8')).aiCoolDown) || 5e3)
    ) return { response: `hold on i'm cooling down, please try again <t:${Math.floor((lastReplyTime + (parseInt(JSON.parse(fs.readFileSync('./config.json', 'utf-8')).aiCoolDown) || 5e3)) / 1e3)}:R>`, metadata: { startInfo: { best: null, bestOnes: [], bestScore: 0 }, keyInfo: {} } }
    const words = input.toLowerCase().split(/\s+/).filter(f => {
        let allowed = true;
        bannedWords.forEach(b => {
            if (f.includes(b)) {
                allowed = false;
                console.log("[AI] Filtered out banned word: ", b)
            }
        })
        return allowed;
    });
    input = input.replaceAll('nigga', 'fella') // i dont want it to learn n words
    input = words.join(" ")
    let { best, bestOnes, bestScore } = findBestKey(words)
    let w1, w2, w3
    if (best) {
        w1 = best[0]
        w2 = best[1]
        w3 = best[2]
    } else {
        w1 = words[0]
        w2 = words[1]
        w3 = words[2]
    }
    let response = [w1, w2, w3], seenKeys = new Set(), metadata = Object.create(null)
    metadata.keyInfo = Object.create(null)
    metadata.startInfo = {
        best, bestOnes, bestScore
    }
    while (response.length < 50) {
        let key = [w1, w2, w3].join(" ")
        let { word: b3, entries: e3 } = pickKey(3, key),
            { word: b2, entries: e2 } = pickKey(2, w2 + " " + w3),
            { word: b1, entries: e1 } = pickKey(1, w3),
            word = (
                b3 || b2 || (isQuestion(input) ? b1 : null)
            )
        metadata.keyInfo[key] = {
            next: word,
            b3, b2, b1, e3, e2, e1,
            seen: seenKeys.has(key),
        }
        metadata.isQ = isQuestion(input)
        if (!word) break;
        if (seenKeys.has(key) && Math.random() < 0.8) break;
        seenKeys.add(key)
        if (response.filter(w => word === w).length > 4) break;
        response.push(word);

        w1 = w2
        w2 = w3
        w3 = word
    }
    if (learns && !isQuestion(input)) learn(input);
    lastReplyTime = Date.now()
    if (response.join(' ') === words.join(' ').toLowerCase())
        return reply('', false)
    return {
        response: response.join(' ').replaceAll('@everyone', 'everyone').replaceAll('@here', 'here'),
        metadata
    }
}

const scrapeChat = async (channel, limit = 100) => {
    const messages = [...await channel.messages.fetch({ limit }).then(e => e.filter(m => !m.author.bot).map(m => m.content))];
    messages.forEach(learn);
}

const gainSentience = async (channel, messageWordLength = Math.floor(Math.random() * 12) + 3, messageChannel = channel) => {
    try {
        if (!channel || messageWordLength <= 0) return;
        let sentientVocabulary = [...await channel.messages.fetch({ limit: 100 })
            .then(e => e.reverse()
                .map(f => f.content.split(' ')).flat().filter(m => !m.includes("@"))
            ), ...(messageChannel.guild ? await messageChannel.guild.members.fetch()
                .then(members => members.map(member => member.user.username)) : 'you'),
        ];
        let getMessages = (amount) => {
            let messageContent = '';
            for (let i = 0; i < amount; i++) {
                messageContent += sentientVocabulary[Math.floor(Math.random() * sentientVocabulary.length)] + ' '
            }
            return messageContent;
        }
        return await messageChannel.send(getMessages(messageWordLength)).catch(err => console.log(err));
    } catch (error) {
        console.error(`[gainSentience] ${error}`);
        return error
    }
}

module.exports = { gainSentience, reply, learn, scrapeChat, keycount };