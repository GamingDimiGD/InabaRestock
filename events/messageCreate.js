const { Events, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        const { autoResponseServers } = require(path.join(__dirname, '..', 'config.json'));
        try {
            if (Object.keys(autoResponseServers).includes(message.guild.id) && autoResponseServers[message.guild.id].enabled) {
                const { responses } = autoResponseServers[message.guild.id];
                for (const response of responses) {
                    if ( response.type === 'exact' && response.triggers.some(trigger => trigger === message.content.toLowerCase()) ) {
                        await message.channel.send(response.response);
                        break;
                    } else if ( response.type === 'includes' && response.triggers.some(trigger => message.content.toLowerCase().includes(trigger)) ) {
                        await message.channel.send(response.response);
                        break;
                    } else if ( response.type === 'startsWith' && response.triggers.some(trigger => message.content.toLowerCase().startsWith(trigger)) ) {
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