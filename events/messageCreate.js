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
const today = (month, day, timestamp = Date.now(), timezone = "Asia/Taipei") => {
    let [checkMonth, checkDay] = new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date(timestamp)).split('/')
    return (
        month == checkMonth && day == checkDay
    )
}

const colors = {
    "AliceBlue": "#F0F8FF",
    "AntiqueWhite": "#FAEBD7",
    "Aqua": "#00FFFF",
    "Aquamarine": "#7FFFD4",
    "Azure": "#F0FFFF",
    "Beige": "#F5F5DC",
    "Bisque": "#FFE4C4",
    "Black": "#000000",
    "BlanchedAlmond": "#FFEBCD",
    "Blue": "#0000FF",
    "BlueViolet": "#8A2BE2",
    "Brown": "#A52A2A",
    "BurlyWood": "#DEB887",
    "CadetBlue": "#5F9EA0",
    "Chartreuse": "#7FFF00",
    "Chocolate": "#D2691E",
    "Coral": "#FF7F50",
    "CornflowerBlue": "#6495ED",
    "Cornsilk": "#FFF8DC",
    "Crimson": "#DC143C",
    "Cyan": "#00FFFF",
    "DarkBlue": "#00008B",
    "DarkCyan": "#008B8B",
    "DarkGoldenRod": "#B8860B",
    "DarkGray": "#A9A9A9",
    "DarkGrey": "#A9A9A9",
    "DarkGreen": "#006400",
    "DarkKhaki": "#BDB76B",
    "DarkMagenta": "#8B008B",
    "DarkOliveGreen": "#556B2F",
    "DarkOrange": "#FF8C00",
    "DarkOrchid": "#9932CC",
    "DarkRed": "#8B0000",
    "DarkSalmon": "#E9967A",
    "DarkSeaGreen": "#8FBC8F",
    "DarkSlateBlue": "#483D8B",
    "DarkSlateGray": "#2F4F4F",
    "DarkSlateGrey": "#2F4F4F",
    "DarkTurquoise": "#00CED1",
    "DarkViolet": "#9400D3",
    "DeepPink": "#FF1493",
    "DeepSkyBlue": "#00BFFF",
    "DimGray": "#696969",
    "DimGrey": "#696969",
    "DodgerBlue": "#1E90FF",
    "FireBrick": "#B22222",
    "FloralWhite": "#FFFAF0",
    "ForestGreen": "#228B22",
    "Fuchsia": "#FF00FF",
    "Gainsboro": "#DCDCDC",
    "GhostWhite": "#F8F8FF",
    "Gold": "#FFD700",
    "GoldenRod": "#DAA520",
    "Gray": "#808080",
    "Grey": "#808080",
    "Green": "#008000",
    "GreenYellow": "#ADFF2F",
    "HoneyDew": "#F0FFF0",
    "HotPink": "#FF69B4",
    "IndianRed": "#CD5C5C",
    "Indigo": "#4B0082",
    "Ivory": "#FFFFF0",
    "Khaki": "#F0E68C",
    "Lavender": "#E6E6FA",
    "LavenderBlush": "#FFF0F5",
    "LawnGreen": "#7CFC00",
    "LemonChiffon": "#FFFACD",
    "LightBlue": "#ADD8E6",
    "LightCoral": "#F08080",
    "LightCyan": "#E0FFFF",
    "LightGoldenRodYellow": "#FAFAD2",
    "LightGray": "#D3D3D3",
    "LightGrey": "#D3D3D3",
    "LightGreen": "#90EE90",
    "LightPink": "#FFB6C1",
    "LightSalmon": "#FFA07A",
    "LightSeaGreen": "#20B2AA",
    "LightSkyBlue": "#87CEFA",
    "LightSlateGray": "#778899",
    "LightSlateGrey": "#778899",
    "LightSteelBlue": "#B0C4DE",
    "LightYellow": "#FFFFE0",
    "Lime": "#00FF00",
    "LimeGreen": "#32CD32",
    "Linen": "#FAF0E6",
    "Magenta": "#FF00FF",
    "Maroon": "#800000",
    "MediumAquaMarine": "#66CDAA",
    "MediumBlue": "#0000CD",
    "MediumOrchid": "#BA55D3",
    "MediumPurple": "#9370DB",
    "MediumSeaGreen": "#3CB371",
    "MediumSlateBlue": "#7B68EE",
    "MediumSpringGreen": "#00FA9A",
    "MediumTurquoise": "#48D1CC",
    "MediumVioletRed": "#C71585",
    "MidnightBlue": "#191970",
    "MintCream": "#F5FFFA",
    "MistyRose": "#FFE4E1",
    "Moccasin": "#FFE4B5",
    "NavajoWhite": "#FFDEAD",
    "Navy": "#000080",
    "OldLace": "#FDF5E6",
    "Olive": "#808000",
    "OliveDrab": "#6B8E23",
    "Orange": "#FFA500",
    "OrangeRed": "#FF4500",
    "Orchid": "#DA70D6",
    "PaleGoldenRod": "#EEE8AA",
    "PaleGreen": "#98FB98",
    "PaleTurquoise": "#AFEEEE",
    "PaleVioletRed": "#DB7093",
    "PapayaWhip": "#FFEFD5",
    "PeachPuff": "#FFDAB9",
    "Peru": "#CD853F",
    "Pink": "#FFC0CB",
    "Plum": "#DDA0DD",
    "PowderBlue": "#B0E0E6",
    "Purple": "#800080",
    "RebeccaPurple": "#663399",
    "Red": "#FF0000",
    "RosyBrown": "#BC8F8F",
    "RoyalBlue": "#4169E1",
    "SaddleBrown": "#8B4513",
    "Salmon": "#FA8072",
    "SandyBrown": "#F4A460",
    "SeaGreen": "#2E8B57",
    "SeaShell": "#FFF5EE",
    "Sienna": "#A0522D",
    "Silver": "#C0C0C0",
    "SkyBlue": "#87CEEB",
    "SlateBlue": "#6A5ACD",
    "SlateGray": "#708090",
    "SlateGrey": "#708090",
    "Snow": "#FFFAFA",
    "SpringGreen": "#00FF7F",
    "SteelBlue": "#4682B4",
    "Tan": "#D2B48C",
    "Teal": "#008080",
    "Thistle": "#D8BFD8",
    "Tomato": "#FF6347",
    "Turquoise": "#40E0D0",
    "Violet": "#EE82EE",
    "Wheat": "#F5DEB3",
    "White": "#FFFFFF",
    "WhiteSmoke": "#F5F5F5",
    "Yellow": "#FFFF00",
    "YellowGreen": "#9ACD32",
    "Inabakumori": "#b2b2b2"
}

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        const { trainChannel, deadChatChannelID, eventChannel, eventDeadline } = JSON.parse(fs.readFileSync('./config.json', 'utf-8')),
            autoResponseServers = JSON.parse(fs.readFileSync('./data/autoResponseServers.json', 'utf-8')),
            secretResponses = JSON.parse(fs.readFileSync('./data/secretAutoResponses.json', 'utf-8'))
        const colorRegex = /(?<=((Restock|Daughter),( (use|embrace) (your|thy) divine powers and)* turn me) )[\s\S]+$/gi
        if (message.guild && message.guild.id === '1410959974842236930' && message.author.id === '766856785444864010' && message.content.match(colorRegex)) {
            const [colorRegexMatch] = message.content.match(colorRegex);
            if (!colorRegexMatch.match(/#[\da-f]{6}/i)) {
                Object.keys(colors).forEach(color => {
                    if (colorRegexMatch.toLowerCase().replaceAll(/\s+/g, '') === color.toLowerCase()) colorRegexMatch = colors[color];
                })
            };
            if (colorRegexMatch.match(/#[\da-f]{6}/i)) await message.guild.roles.edit('1568588524666622093', {
                color: colorRegexMatch
            }).then(() => message.react('1477591432964345856')).catch(err => console.log(err));
        }
        if (message.channel.id == eventChannel) {
            fs.writeFileSync("./ai/c.json", JSON.stringify({ t: Date.now() }))
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
            if (today(12, 4, message.createdTimestamp, "Asia/Tokyo")) {
                message.react("🍎")
            }
            if (today(9, 16, message.createdTimestamp, "America/Sao_Paulo") && message.author.id == "1502008003870593108") {
                message.react("🍎")
                message.react("1453721037324812289")
            }
            const msg = message.content.replaceAll(/<@(&|)[0-9]+>/g, "").replaceAll(/http(s|)m:\/\/\S*/g, "");
            if (msg.split(/\s+/).length > 3) learn(msg);
        }
        try {
            if (message.guild && Object.keys(autoResponseServers).includes(message.guild.id) && autoResponseServers[message.guild.id].enabled) {
                const { responses } = autoResponseServers[message.guild.id],
                    { disabledAutoResponses: disabledAutoResponseServers } = JSON.parse(fs.readFileSync('./data/users.json', 'utf-8'))[message.author.id] || {},
                    disabledAutoResponses = disabledAutoResponseServers?.[message.guild.id] || [];
                for (const response of responses) {
                    if (response.triggers.some(trigger => disabledAutoResponses.includes(trigger))) continue;
                    if (response.type === 'exact' && response.triggers.some(trigger => trigger.toLowerCase() === message.content.toLowerCase())) {
                        await message.channel.send({
                            content: response.response,
                            stickers: response.stickerID ? [response.stickerID] : null,
                        }).catch(err => console.error(err));
                        break;
                    } else if (response.type === 'includes' && response.triggers.some(trigger => message.content.toLowerCase().includes(trigger.toLowerCase()))) {
                        await message.channel.send({
                            content: response.response,
                            stickers: response.stickerID ? [response.stickerID] : null,
                        }).catch(err => console.error(err));
                        break;
                    } else if (response.type === 'startsWith' && response.triggers.some(trigger => message.content.toLowerCase().startsWith(trigger.toLowerCase()))) {
                        await message.channel.send({
                            content: response.response,
                            stickers: response.stickerID ? [response.stickerID] : null,
                        }).catch(err => console.error(err));
                        break;
                    } else if (response.type === 'endsWith' && response.triggers.some(trigger => message.content.toLowerCase().endsWith(trigger.toLowerCase()))) {
                        await message.channel.send({
                            content: response.response,
                            stickers: response.stickerID ? [response.stickerID] : null,
                        }).catch(err => console.error(err));
                        break;
                    } else if (response.type === 'regex' && response.triggers.some(trigger => new RegExp(...trigger.slice(1).split('/')).test(message.content))) {
                        await message.channel.send(response.response.replaceAll(/§[0-9]+/g, (match) => {
                            const index = parseInt(match.slice(1));
                            return message.content.match(new RegExp(...response.triggers[0].slice(1).split('/')))[index]; // assume only 1 trigger
                        }).slice(0, 2000));
                        break;
                    }
                }
            }
            if (message.guild && message.guild.id === '1410959974842236930') {

                const prefix = '!'
                if (message.content.startsWith(prefix)) {
                    let command = message.content.split(/\s+/)[0].toLowerCase().slice(1);
                    let args = message.content.split(/\s+/).splice(1);
                    if (command === 'list-secrets' || command === 'ls' || command === 'secrets') {
                        let allSecretResponses = JSON.parse(fs.readFileSync('./data/secretAutoResponses.json', 'utf-8'));
                        let secretResponses = allSecretResponses.filter(r => r.discovered);
                        let page = args[0] ? parseInt(args[0]) : 1;
                        if (isNaN(page) || page < 1 || page > Math.ceil(secretResponses.length / pageLength)) return message.reply(`invalid page number, must be between 1 and ${Math.ceil(secretResponses.length / pageLength)}`);
                        const secretResponsesPage = secretResponses.slice((page - 1) * pageLength, page * pageLength);
                        const embed = new EmbedBuilder()
                            .setTitle("Secret Autoresponses")
                            .setColor("#b2b2b2")
                            .setDescription(secretResponsesPage.map((r, i) => `**${i + 1 + (page - 1) * pageLength}.**` + '`' + r.triggers.join("`, `") + '`').join("\n"))
                            .setFooter({ text: `Listing ${secretResponses.length} of ${allSecretResponses.length} secret autoresponses. Page ${page}/${Math.ceil(secretResponses.length / pageLength)}` })
                        await message.reply({ content: "listing secret autoresponses, use `!ls <page>` for different pages (e.g. `!ls 2`)", embeds: [embed] });
                    }
                }

                for (const response of secretResponses) {
                    const discover = () => setTimeout(async () => {
                        let s = JSON.parse(fs.readFileSync('./data/secretAutoResponses.json', 'utf-8'))
                        s.find(r => r.triggers.includes(response.triggers[0])).discovered = true;
                        fs.writeFileSync('./data/secretAutoResponses.json', JSON.stringify(s, null, 4));
                        await message.reply("you discovered a new secret autoresponse! the trigger(s) was/were: `" + response.triggers.join("`, `") + "` (" + s.filter(r => r.discovered).length + '/' + s.length + " discovered)");
                    }, 500)
                    let responseMessage = response.response.replaceAll('{keycount}', require('../ai/gainSentience.js').keycount)
                    if (response.type === 'exact' && response.triggers.some(trigger => trigger.toLowerCase() === message.content.toLowerCase())) {
                        await message.channel.send(responseMessage);
                        if (!response.discovered) discover()
                        break;
                    } else if (response.type === 'includes' && response.triggers.some(trigger => message.content.toLowerCase().includes(trigger.toLowerCase()))) {
                        await message.channel.send(responseMessage);
                        if (!response.discovered) discover()
                        break;
                    } else if (response.type === 'startsWith' && response.triggers.some(trigger => message.content.toLowerCase().startsWith(trigger.toLowerCase()))) {
                        await message.channel.send(responseMessage);
                        if (!response.discovered) discover()
                        break;
                    } else if (response.type === 'endsWith' && response.triggers.some(trigger => message.content.toLowerCase().endsWith(trigger.toLowerCase()))) {
                        await message.channel.send(responseMessage);
                        if (!response.discovered) discover()
                        break;
                    } else if (response.type === 'regex' && response.triggers.some(trigger => new RegExp(...trigger.slice(1).split('/')).test(message.content))) {
                        await message.channel.send(responseMessage.replaceAll(/§[0-9]+/g, (match) => {
                            const index = parseInt(match.slice(1));
                            return message.content.match(new RegExp(...response.triggers[0].slice(1).split('/')))[index]; // assume only 1 trigger
                        }).slice(0, 2000));
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