const {
    Events,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');
const fs = require('fs');
const { reply, learn } = require('../ai/gainSentience.js');
const { ProfanityFilter, checkProfanity } = require("glin-profanity")
const filter = new ProfanityFilter({
    allowObfuscatedMatch: true,
    severityLevels: true,
    detectLeetspeak: true,
    logProfanity: true,
})

const sanitizeYTURL = (url) => url.replace('https://music.youtube.com/watch?v=', 'https://youtu.be/')
    .replace('https://www.youtube.com/watch?v=', 'https://youtu.be/')
    .replace(/(&|\?)(si|t|is)=[\s\S]*/g, '');

const validURLStarters = [
    'https://www.youtube.com/watch?v=',
    'https://youtu.be/', // use this as default
    'https://music.youtube.com/watch?v='
],
    pageLength = 15,
    roleQuotaBonusList = [
        '1470019710761566272', // lv 5
        '1470019967415091293', // lv 10
        '1470020127750881394', // lv 15
    ]


const cHandler = fs.existsSync('./ai/c.json') ? JSON.parse(fs.readFileSync('./ai/c.json', 'utf-8')) : {},
    playlist = JSON.parse(fs.readFileSync('./events/playlist.json', 'utf-8'));
exports.cHandler = cHandler;
const today = (month, day, timestamp = Date.now(), timezone = 8 /* UTC+8 */) => {
    const date = new Date(timestamp).setHours(new Date().getUTCHours() + timezone + 24, new Date().getUTCMinutes(), new Date().getUTCSeconds(), new Date().getUTCMilliseconds());
    return (
        new Date(date).getMonth() == month - 1 &&
        new Date(date).getDate() == day
    )
}

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        const { trainChannel, deadChatChannelID, eventChannel, eventDeadline } = JSON.parse(fs.readFileSync('./config.json', 'utf-8')),
            autoResponseServers = JSON.parse(fs.readFileSync('./data/autoResponseServers.json', 'utf-8')),
            secretResponses = JSON.parse(fs.readFileSync('./data/secretAutoResponses.json', 'utf-8'))

        if (message.channel.id == eventChannel) {

            await fs.writeFileSync("./ai/c.json", JSON.stringify({ t: Date.now() }))
            console.log("[messageCreate.js event] Performing anti corruption check... " + cHandler?.t)
            if (!cHandler?.t) return message.reply('we running out of storage');

            const prefix = '!'
            if (!message.content.startsWith(prefix)) return;
            let command = message.content.split(/\s+/)[0].toLowerCase().slice(1);
            let args = message.content.split(/\s+/).splice(1);
            if (command === 'submit') {
                if (Date.now() > eventDeadline) return message.reply('the event is over lmao');
                if (!args.length) return message.reply('use `' + prefix + 'submit <YouTube url>` to submit a song.');
                let url = args[0];
                if (!validURLStarters.some(s => url.startsWith(s))) return message.reply('invalid url, has to be youtube or youtube music url.');
                const bonus = roleQuotaBonusList.indexOf(
                    roleQuotaBonusList.find(id => message.member.roles.cache.has(id))
                ) + 1
                const userQuota = 3 + bonus
                url = sanitizeYTURL(url);
                if (Object.values(playlist).filter(id => message.author.id == id).length >= userQuota) return message.reply('you have reached your quota of ' + userQuota + ' songs');
                if (playlist[url]) {
                    const userWhoAdded = message.guild.members.cache.get(playlist[url]).user.username;
                    message.reply(`\`${url}\` has already been added by ${userWhoAdded}!`).catch(err => console.log(err));
                    return;
                }
                playlist[url] = message.author.id;
                fs.writeFileSync('./events/playlist.json', JSON.stringify(playlist, null, 4));
                message.reply(`Added \`${url}\` to the event playlist! (${Object.values(playlist).filter(id => message.author.id == id).length}/${userQuota} songs submitted)`).catch(err => console.log(err));
            }
            if (command === 'unsubmit' || command === 'remove') {
                if (Date.now() > eventDeadline) return message.reply('the event is over lmao');
                if (!args.length) return message.reply('use `' + prefix + 'unsubmit <YouTube url>` to remove a song.');
                let url = args[0];
                if (!validURLStarters.some(s => url.startsWith(s))) return message.reply('invalid url, has to be youtube or youtube music url.');
                url = sanitizeYTURL(url);
                if (!playlist[url]) return message.reply(`\`${url}\` is not in the playlist!`).catch(err => console.log(err));
                if (playlist[url] != message.author.id) return message.reply(`\`${url}\` was not added by you!`).catch(err => console.log(err));
                delete playlist[url];
                fs.writeFileSync('./events/playlist.json', JSON.stringify(playlist, null, 4));
                message.reply(`removed \`${url}\` from the event playlist!`).catch(err => console.log(err));
            }
            if (command === 'playlist' || command === 'pl' || command === 'list') {
                if (Object.keys(playlist).length == 0) return message.reply('playlist is empty.');
                const msg = await message.reply('fetching users...').catch(err => console.log(err));
                let embed = new EmbedBuilder()
                    .setTitle('Event Playlist')
                    .setDescription((
                        await Promise.all(
                            Object.keys(playlist)
                                .slice(0, pageLength)
                                .map(async (url, i) => {
                                    const member =
                                        message.guild.members.cache.get(playlist[url]) ??
                                        await message.guild.members.fetch(playlist[url]).catch(() => null);

                                    return `${i}. \`${url}\` (submitted by ${member?.user?.username ?? 'unknown user'})`;
                                })
                        )
                    ).join('\n'))
                    .setColor('#b2b2b2')
                    .setFooter({ text: `Page 1/${Math.ceil(Object.keys(playlist).length / pageLength)}, ${Object.keys(playlist).length} songs` })
                    .setTimestamp();
                const row = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('playlistPageSelector')
                            .setPlaceholder('Select a page')
                            .addOptions(Array.from({ length: Math.ceil(Object.keys(playlist).length / pageLength) }, (_, i) => ({ label: `Page ${i + 1}`, value: `${i + 1}`, })))
                    )
                msg.edit({ content: '', embeds: [embed], components: [row] }).catch(err => console.log(err));
            }
        }


        if (
            (
                message.mentions.has(message.client.user) &&
                today(8, 29, message.createdTimestamp)
            )
            || message.channel.id == trainChannel
        ) {
            if (checkProfanity(message.content).containsProfanity) {
                return message.reply("woah woah woah don't swear dude")
            }
            let res = reply(message.content.replaceAll("<@1410941750641561730>", "").trim().replaceAll("?debug", ""))
            message.reply(res.response.replaceAll(/<@[0-9]+>|<@&[0-9]+>/g, "[mention blocked]")).catch(err => console.log(err));
            if (message.content.includes("?debug")) {
                let { startInfo } = res.metadata
                let embed = new EmbedBuilder()
                    .setTitle("Markrov AI Debug Info")
                    .setColor("#b2b2b2")
                    .addFields({
                        name: "Start score:" + startInfo.bestScore,
                        value: startInfo.bestScore ? "Other good starters (max displayed: 10): " + startInfo.bestOnes.splice(0, 10).map(e => e.key).join(", ") : "Randomly picked/Directly extracted (rare)"
                    }, ...Object.keys(res.metadata.keyInfo)
                        .map(k => {
                            let keyValue = res.metadata.keyInfo[k]
                            const { b3, b2, b1, next, e3, e2, e1 } = keyValue
                            let p3 = b3 === next,
                                p2 = b2 === next,
                                p1 = b1 === next
                            const joinEntries = (e) => {
                                if (!e || e.length === 0) return "none"
                                if (e.length > 10) return e.map(f => f[0] + "×" + f[1]).splice(0, 10).join(", ") + "*and " + e.length - 10 + " more...*"
                                return e.map(f => f[0] + "×" + f[1]).join(", ")
                            }
                            let value = keyValue.next ? `${p3 ? "__" : ""}3-gram output: ${b3}${p3 ? "__" : ""}\n${p2 ? "__" : ""}2-gram output: ${b2}${p2 ? "__" : ""}\n${p1 ? "__" : ""}1-gram output: ${b1}${p1 ? "__" : ""}\nOther possible outcomes:\n3: ${joinEntries(e3)}\n2: ${joinEntries(e2)}\n1: ${joinEntries(e1)}\n|` : "End of output"

                            return { name: k, value }
                        }))
                    .setDescription("isQuestion:" + res.metadata.isQ)
                message.channel.send({ embeds: [embed] }).catch(err => console.log(err));

            }
        }
        if (deadChatChannelID == message.channel.id && !message.mentions.has(message.client.user)
            && !checkProfanity(message.content).containsProfanity
        ) {
            if (today(12, 4, message.createdTimestamp)) {
                message.react("🍎")
            }
            if (today(9, 16, message.createdTimestamp, -3) && message.author.id == "1502008003870593108") {
                message.react("🍎")
                message.react("1453721037324812289")
            }
            const msg = message.content.replaceAll(/<@(&|)[0-9]+>/g, "").replaceAll(/http(s|)m:\/\/\S*/g, "");
            if (msg.split(/\s+/).length > 3) learn(msg);
        }
        try {
            if (message.guild && Object.keys(autoResponseServers).includes(message.guild.id) && autoResponseServers[message.guild.id].enabled) {
                const { responses } = autoResponseServers[message.guild.id];
                for (const response of responses) {
                    if (response.type === 'exact' && response.triggers.some(trigger => trigger.toLowerCase() === message.content.toLowerCase())) {
                        await message.channel.send(response.response);
                        break;
                    } else if (response.type === 'includes' && response.triggers.some(trigger => message.content.toLowerCase().includes(trigger.toLowerCase()))) {
                        await message.channel.send(response.response);
                        break;
                    } else if (response.type === 'startsWith' && response.triggers.some(trigger => message.content.toLowerCase().startsWith(trigger.toLowerCase()))) {
                        await message.channel.send(response.response);
                        break;
                    } else if (response.type === 'endsWith' && response.triggers.some(trigger => message.content.toLowerCase().endsWith(trigger.toLowerCase()))) {
                        await message.channel.send(response.response);
                        break;
                    }
                }
            }
            if (message.guild && message.guild.id === '1410959974842236930') {

                const prefix = '!'
                if (message.content.startsWith(prefix)) {
                    let command = message.content.split(/\s+/)[0].toLowerCase().slice(1);
                    // let args = message.content.split(/\s+/).splice(1);
                    if (command === 'list-secrets' || command === 'ls' || command === 'secrets') {
                        let secretResponses = JSON.parse(fs.readFileSync('./data/secretAutoResponses.json', 'utf-8'));
                        const embed = new EmbedBuilder()
                            .setTitle("Secret Autoresponses")
                            .setColor("#b2b2b2")
                            .setDescription(secretResponses.filter(r => r.discovered).map(r => '`' + r.triggers.join("`, `") + '`').join("\n"))
                            .setFooter({ text: `Listing ${secretResponses.filter(r => r.discovered).length} of ${secretResponses.length} secret autoresponses` })
                        await message.reply({ embeds: [embed] });
                    }
                }

                for (const response of secretResponses) {
                    const discover = () => setTimeout(async () => {
                        let s = JSON.parse(fs.readFileSync('./data/secretAutoResponses.json', 'utf-8'))
                        s.find(r => r.triggers.includes(response.triggers[0])).discovered = true;
                        fs.writeFileSync('./data/secretAutoResponses.json', JSON.stringify(s, null, 4));
                        await message.reply("you discovered a new secret autoresponse! the trigger(s) was/were: `" + response.triggers.join("`, `") + "` (" + s.filter(r => r.discovered).length + '/' + secretResponses.length + " discovered)");
                    }, 500)
                    if (response.type === 'exact' && response.triggers.some(trigger => trigger.toLowerCase() === message.content.toLowerCase())) {
                        await message.channel.send(response.response);
                        if (!response.discovered) discover()
                        break;
                    } else if (response.type === 'includes' && response.triggers.some(trigger => message.content.toLowerCase().includes(trigger.toLowerCase()))) {
                        await message.channel.send(response.response);
                        if (!response.discovered) discover()
                        break;
                    } else if (response.type === 'startsWith' && response.triggers.some(trigger => message.content.toLowerCase().startsWith(trigger.toLowerCase()))) {
                        await message.channel.send(response.response);
                        if (!response.discovered) discover()
                        break;
                    } else if (response.type === 'endsWith' && response.triggers.some(trigger => message.content.toLowerCase().endsWith(trigger.toLowerCase()))) {
                        await message.channel.send(response.response);
                        if (!response.discovered) discover()
                        break;
                    }
                }
            }
        } catch (error) {
            console.error(`[Discord] Error processing autoResponse: ${error}`);
        }
    },
    pageLength, today, cHandler
};