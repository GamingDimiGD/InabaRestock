const { Events, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { gainSentience, reply, learn } = require('../ai/gainSentience.js');
const { ProfanityFilter, checkProfanity } = require("glin-profanity")
const filter = new ProfanityFilter({
    allowObfuscatedMatch: true,
    severityLevels: true,
    detectLeetspeak: true,
    logProfanity: true,
})

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        const { autoResponseServers } = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
        if (
            // message.mentions.has(message.client.user) || !message.guild
            message.channel.id == '1472185735791775796'
        ) {
            // gainSentience(message.channel);
            if (checkProfanity(message.content).containsProfanity) {
                return message.reply("woah woah woah don't swear dude")
            }
            let res = reply(message.content.replaceAll("<@1410941750641561730>", "").trim().replaceAll("?debug", ""))
            message.reply(res.response.replaceAll(/<@[0-9]+>|<@&[0-9]+>/g, "[mention blocked]")).catch(err => console.log(err));
            if (message.content.includes("?debug")) {
                console.log(res.metadata)
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
        if (JSON.parse(fs.readFileSync('./config.json', 'utf-8')).deadChatChannelID == message.channel.id && !message.mentions.has(message.client.user) && !checkProfanity(message.content).containsProfanity) learn(message.content.replaceAll(/<@(&|)[0-9]+>/g, "").replaceAll(/http(s|)m:\/\/\S*/g, ""))
        try {
            if (message.guild && Object.keys(autoResponseServers).includes(message.guild.id) && autoResponseServers[message.guild.id].enabled) {
                const { responses } = autoResponseServers[message.guild.id];
                for (const response of responses) {
                    if (response.type === 'exact' && response.triggers.some(trigger => trigger === message.content.toLowerCase())) {
                        await message.channel.send(response.response);
                        break;
                    } else if (response.type === 'includes' && response.triggers.some(trigger => message.content.toLowerCase().includes(trigger))) {
                        await message.channel.send(response.response);
                        break;
                    } else if (response.type === 'startsWith' && response.triggers.some(trigger => message.content.toLowerCase().startsWith(trigger))) {
                        await message.channel.send(response.response);
                        break;
                    }
                }
            }
        } catch (error) {
            console.error(`[Discord] Error processing autoResponse: ${error}`);
        }
    },
};