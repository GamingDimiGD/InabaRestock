const fs = require('fs');

let brain = fs.existsSync('./ai/brain.json') ? JSON.parse(fs.readFileSync('./ai/brain.json', 'utf-8')) : {},
    smallBrain = fs.existsSync('./ai/smallBrain.json') ? JSON.parse(fs.readFileSync('./ai/smallBrain.json', 'utf-8')) : {},
    tinyBrain = fs.existsSync('./ai/tinyBrain.json') ? JSON.parse(fs.readFileSync('./ai/tinyBrain.json', 'utf-8')) : {},
    starterBrain = fs.existsSync('./ai/starterBrain.json') ? JSON.parse(fs.readFileSync('./ai/starterBrain.json', 'utf-8')) : {},
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
    bannedWords = ["<@1410941750641561730>", "@here", "@everyone", "?debug"];

const isQuestion = (text) => {
    const words = text.toLowerCase().split(/\s+/)
    if (questionWords.includes(words[0])) return { type: 0 }
    if (auxVerbs.includes(words[0]) && !nonQuestionAux.includes(words[1])) return { type: 1 }
    return false
}

const createKey = (brain, key, next) => {
    if (!key || !brain) return;
    if (!brain[key] || typeof brain[key] !== 'object' || Array.isArray(brain[key])) brain[key] = Object.create(null);
    brain[key][next] = (brain[key][next] || 0) + 1
}

const pickKey = (obj) => {
    if (!obj) return { word: null, entries: null };
    const entries = Object.entries(obj)
    const total = entries.reduce((a, [, b]) => a + b, 0)
    let r = Math.random() * total
    console.log(entries, total, r)
    for (const [word, count] of entries) {
        if ((r -= count) <= 0) return { word, entries }
    }
}

const learn = (sentence) => {
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
        const starter = words.slice(0, 3).join(" ")
        starterBrain[starter] = (starterBrain[starter] || 0) + 1
    }
    for (let i = 0; i < words.length - 3; i++) {
        const w1 = words[i], w2 = words[i + 1], w3 = words[i + 2], next = words[i + 3]
        if (next) {
            createKey(brain, [w1, w2, w3].join(" "), next)
        }
        if (w3) {
            createKey(smallBrain, [w2, w3].join(" "), next)
        }
        if (w2) {
            createKey(tinyBrain, w3, next)
        }
    }
    fs.writeFileSync('./ai/brain.json', JSON.stringify(brain))
    fs.writeFileSync('./ai/smallBrain.json', JSON.stringify(smallBrain))
    fs.writeFileSync('./ai/tinyBrain.json', JSON.stringify(tinyBrain))
    fs.writeFileSync('./ai/starterBrain.json', JSON.stringify(starterBrain));
    console.log('[AI] Learned sentence: ', sentence)
}

const findBestKey = (keywords) => {
    keywords = keywords.filter(w => !filler.includes(w));
    let best = null, bestScore = 0

    let scores = Object.keys(brain).map(key => {
        const score = keywords.reduce((a, b) => {
            return (key.includes(b) ? 1 : 0) + a
        }, 0) + (starterBrain[key] ? 2 : 0)
        return { score, key }
    })
    bestScore = Math.max(...scores.map(s => s.score))
    console.log(bestScore)
    if (bestScore === 0) return { best: null, bestOnes: [], bestScore };
    const bestOnes = scores.filter(s => s.score === bestScore)
    best = bestOnes[Math.floor(Math.random() * bestOnes.length)]?.key
    console.log(best)
    return { best: best?.split(" "), bestOnes, bestScore }
}

const reply = (input, learns = true) => {
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
        let { word: b3, entries: e3 } = pickKey(brain[key]),
            { word: b2, entries: e2 } = pickKey(smallBrain[w2 + " " + w3]),
            { word: b1, entries: e1 } = pickKey(tinyBrain[w3])
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
        if (seenKeys.has(key) && Math.random < 0.8) break;
        console.log(seenKeys)
        seenKeys.add(key)
        if (response.filter(w => word === w).length > 4) break;
        response.push(word);

        w1 = w2
        w2 = w3
        w3 = word
    }
    if (learns && !isQuestion(input)) learn(input);
    if (response.join(' ') === words.join(' ').toLowerCase())
        return reply(Object.keys(brain)[Math.floor(Math.random() * Object.keys(brain).length)])
    return {
        response: response.join(' '),
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
        messageChannel.send(getMessages(messageWordLength)).catch(err => console.log(err));
    } catch (error) {
        console.error(`[gainSentience] ${error}`);
    }
}

module.exports = { gainSentience, reply, learn, scrapeChat };