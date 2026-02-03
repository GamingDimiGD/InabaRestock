const fs = require('fs');

let brain = fs.existsSync('./ai/brain.json') ? JSON.parse(fs.readFileSync('./ai/brain.json', 'utf-8')) : {};

const learn = (sentence) => {
    const words = sentence.toLowerCase().split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
        if (!brain[words[i]]) brain[words[i]] = [];
        if (brain[words[i]].includes(words[i + 1])) continue;
        brain[words[i]].push(words[i + 1]);
    }
    fs.writeFileSync('./ai/brain.json', JSON.stringify(brain, null, 2));
}

const reply = (input, learns = true) => {
    const words = input.toLowerCase().split(/\s+/);
    let word = words[0];
    let response = [word];
    while (brain[word] && response.length < 20) {
        const nextWords = brain[word];
        word = nextWords[Math.floor(Math.random() * nextWords.length)];
        response.push(word);
    }
    if (learns) learn(input);
    return response.join(' ');
}

const scrapeChat = async (channel, limit = 100) => {
    const messages = [...await channel.messages.fetch({ limit }).then(e => e.map(m => m.content))];
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